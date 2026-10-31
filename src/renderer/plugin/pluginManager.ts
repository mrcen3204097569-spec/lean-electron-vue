import { reactive, computed, markRaw } from 'vue'
import type { Router } from 'vue-router'
import type {
  PluginCommandExtension,
  PluginContext,
  PluginDefinition,
  PluginHeaderActionExtension,
  PluginRuntimeRecord,
  PluginStatusBarExtension,
  PluginStorage,
  PluginViewExtension
} from '../../shared/plugin/types'

const STORAGE_KEY_ENABLED = 'lean_plugins_enabled_v1'

class PluginManager {
  private records = reactive<Map<string, PluginRuntimeRecord>>(new Map())
  private router: Router | null = null
  private eventHandlers = new Map<string, Set<(payload?: unknown) => void>>()

  setRouter(router: Router) {
    this.router = router
  }

  private createStorage(pluginId: string): PluginStorage {
    const prefix = `lean_plugin_${pluginId}_`
    return {
      get<T = unknown>(key: string, defaultValue?: T): T {
        try {
          const item = localStorage.getItem(prefix + key)
          if (item === null) return defaultValue as T
          return JSON.parse(item) as T
        } catch {
          return defaultValue as T
        }
      },
      set<T = unknown>(key: string, value: T): void {
        try {
          localStorage.setItem(prefix + key, JSON.stringify(value))
        } catch (e) {
          console.error(`[PluginStorage] 保存失败 ${pluginId}:${key}`, e)
        }
      },
      remove(key: string): void {
        localStorage.removeItem(prefix + key)
      },
      clear(): void {
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i)
          if (k && k.startsWith(prefix)) keysToRemove.push(k)
        }
        for (const k of keysToRemove) localStorage.removeItem(k)
      }
    }
  }

  private getPersistedEnabledState(): Record<string, boolean> {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ENABLED)
      return data ? JSON.parse(data) : {}
    } catch {
      return {}
    }
  }

  private savePersistedEnabledState() {
    try {
      const states: Record<string, boolean> = {}
      for (const [id, record] of this.records.entries()) {
        states[id] = record.enabled
      }
      localStorage.setItem(STORAGE_KEY_ENABLED, JSON.stringify(states))
    } catch (e) {
      console.error('[PluginManager] 保存插件状态失败', e)
    }
  }

  private createContext(record: PluginRuntimeRecord): PluginContext {
    const pluginId = record.definition.metadata.id
    const storage = this.createStorage(pluginId)

    return {
      metadata: Object.freeze({ ...record.definition.metadata }),
      storage,
      registerView: (view: PluginViewExtension) => {
        if (!record.enabled) return
        record.activeExtensions.views.push(view)
        if (this.router) {
          const remove = this.router.addRoute({
            path: view.path,
            name: `plugin-${view.id}`,
            component: view.component,
            meta: {
              title: view.title,
              pluginId,
              icon: view.icon
            }
          })
          record.removeRouteCallbacks.set(view.id, remove)
        }
      },
      registerStatusBarItem: (item: PluginStatusBarExtension) => {
        if (!record.enabled) return
        record.activeExtensions.statusBarItems.push(markRaw(item))
      },
      registerHeaderAction: (action: PluginHeaderActionExtension) => {
        if (!record.enabled) return
        record.activeExtensions.headerActions.push(action)
      },
      registerCommand: (cmd: PluginCommandExtension) => {
        if (!record.enabled) return
        record.activeExtensions.commands.push(cmd)
      },
      emit: (event: string, payload?: unknown) => {
        const handlers = this.eventHandlers.get(event)
        if (handlers) {
          for (const handler of handlers) {
            try {
              handler(payload)
            } catch (err) {
              console.error(`[PluginEvent] 处理异常 ${event}:`, err)
            }
          }
        }
      },
      on: (event: string, handler: (payload?: unknown) => void) => {
        if (!this.eventHandlers.has(event)) {
          this.eventHandlers.set(event, new Set())
        }
        this.eventHandlers.get(event)!.add(handler)
        return () => {
          this.eventHandlers.get(event)?.delete(handler)
        }
      }
    }
  }

  register(definition: PluginDefinition) {
    const { id } = definition.metadata
    if (this.records.has(id)) {
      console.warn(`[PluginManager] 插件 ${id} 已存在，跳过重复注册`)
      return
    }

    const persisted = this.getPersistedEnabledState()
    // 默认启用（若存储中未设定，则默认为 true）
    const shouldEnable = persisted[id] !== undefined ? persisted[id] : true

    const record: PluginRuntimeRecord = {
      definition,
      enabled: false,
      activeExtensions: {
        views: [],
        statusBarItems: [],
        headerActions: [],
        commands: []
      },
      removeRouteCallbacks: new Map()
    }

    this.records.set(id, record)

    if (shouldEnable) {
      void this.enable(id)
    }
  }

  async enable(pluginId: string): Promise<boolean> {
    const record = this.records.get(pluginId)
    if (!record || record.enabled) return false

    record.enabled = true
    const ctx = this.createContext(record)

    // 1. 注册声明式扩展
    if (record.definition.extensions) {
      if (record.definition.extensions.views) {
        for (const view of record.definition.extensions.views) {
          ctx.registerView(view)
        }
      }
      if (record.definition.extensions.statusBarItems) {
        for (const item of record.definition.extensions.statusBarItems) {
          ctx.registerStatusBarItem(item)
        }
      }
      if (record.definition.extensions.headerActions) {
        for (const action of record.definition.extensions.headerActions) {
          ctx.registerHeaderAction(action)
        }
      }
      if (record.definition.extensions.commands) {
        for (const cmd of record.definition.extensions.commands) {
          ctx.registerCommand(cmd)
        }
      }
    }

    // 2. 调用 setup 生命周期
    if (record.definition.setup) {
      try {
        await record.definition.setup(ctx)
      } catch (err) {
        console.error(`[PluginManager] 插件 ${pluginId} setup 执行失败:`, err)
      }
    }

    this.savePersistedEnabledState()
    return true
  }

  async disable(pluginId: string): Promise<boolean> {
    const record = this.records.get(pluginId)
    if (!record || !record.enabled) return false

    const ctx = this.createContext(record)

    // 1. 调用 teardown 生命周期
    if (record.definition.teardown) {
      try {
        await record.definition.teardown(ctx)
      } catch (err) {
        console.error(`[PluginManager] 插件 ${pluginId} teardown 执行失败:`, err)
      }
    }

    // 2. 移除动态注入的路由
    for (const removeRoute of record.removeRouteCallbacks.values()) {
      try {
        removeRoute()
      } catch (e) {
        console.warn(`[PluginManager] 移除路由失败:`, e)
      }
    }
    record.removeRouteCallbacks.clear()

    // 3. 清理已激活的组件
    record.activeExtensions.views = []
    record.activeExtensions.statusBarItems = []
    record.activeExtensions.headerActions = []
    record.activeExtensions.commands = []
    record.enabled = false

    this.savePersistedEnabledState()
    return true
  }

  async toggle(pluginId: string): Promise<boolean> {
    const record = this.records.get(pluginId)
    if (!record) return false
    return record.enabled ? this.disable(pluginId) : this.enable(pluginId)
  }

  getPlugin(pluginId: string): PluginDefinition | undefined {
    return this.records.get(pluginId)?.definition
  }

  getPluginStorage(pluginId: string): PluginStorage {
    return this.createStorage(pluginId)
  }

  // 响应式数据导出
  readonly allPlugins = computed(() => {
    return Array.from(this.records.values()).map((r) => ({
      metadata: r.definition.metadata,
      enabled: r.enabled,
      hasSettings: Boolean(r.definition.settingsComponent)
    }))
  })

  readonly activeViews = computed(() => {
    const views: PluginViewExtension[] = []
    for (const record of this.records.values()) {
      if (record.enabled) {
        views.push(...record.activeExtensions.views)
      }
    }
    return views.sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
  })

  readonly activeNavViews = computed(() => {
    return this.activeViews.value.filter((v) => v.inNavigation !== false)
  })

  readonly activeStatusBarLeft = computed(() => {
    const items: PluginStatusBarExtension[] = []
    for (const record of this.records.values()) {
      if (record.enabled) {
        items.push(...record.activeExtensions.statusBarItems.filter((i) => i.alignment === 'left'))
      }
    }
    return items.sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
  })

  readonly activeStatusBarRight = computed(() => {
    const items: PluginStatusBarExtension[] = []
    for (const record of this.records.values()) {
      if (record.enabled) {
        items.push(...record.activeExtensions.statusBarItems.filter((i) => i.alignment === 'right'))
      }
    }
    return items.sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
  })

  readonly activeHeaderActions = computed(() => {
    const actions: PluginHeaderActionExtension[] = []
    for (const record of this.records.values()) {
      if (record.enabled) {
        actions.push(...record.activeExtensions.headerActions)
      }
    }
    return actions.sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
  })

  readonly activeCommands = computed(() => {
    const commands: PluginCommandExtension[] = []
    for (const record of this.records.values()) {
      if (record.enabled) {
        commands.push(...record.activeExtensions.commands)
      }
    }
    return commands
  })
}

export const pluginManager = new PluginManager()

export function definePlugin(definition: PluginDefinition): PluginDefinition {
  return definition
}
