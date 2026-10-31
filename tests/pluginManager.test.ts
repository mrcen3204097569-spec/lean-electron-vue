import { describe, expect, it, vi, beforeEach } from 'vitest'
import { pluginManager, definePlugin } from '../src/renderer/plugin/pluginManager'
import type { PluginContext } from '../src/shared/plugin/types'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value)
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (i: number) => Object.keys(store)[i] ?? null
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock
})

describe('PluginManager Engine', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('correctly registers and enables a plugin', async () => {
    const setupSpy = vi.fn()
    const teardownSpy = vi.fn()

    const dummyPlugin = definePlugin({
      metadata: {
        id: 'test-dummy',
        name: '测试插件',
        version: '1.0.0',
        description: '单元测试虚拟插件'
      },
      setup(ctx: PluginContext) {
        setupSpy(ctx.metadata.id)
        ctx.storage.set('hello', 'world')
      },
      teardown(ctx: PluginContext) {
        teardownSpy(ctx.metadata.id)
      }
    })

    pluginManager.register(dummyPlugin)

    // 默认注册后会自动激活
    expect(setupSpy).toHaveBeenCalledWith('test-dummy')

    // 检查插件状态
    const getPluginRecord = () =>
      pluginManager.allPlugins.value.find((p) => p.metadata.id === 'test-dummy')

    expect(getPluginRecord()).toBeDefined()
    expect(getPluginRecord()?.enabled).toBe(true)

    // 停用插件
    await pluginManager.disable('test-dummy')
    expect(teardownSpy).toHaveBeenCalledWith('test-dummy')
    expect(getPluginRecord()?.enabled).toBe(false)

    // 重新启用插件
    await pluginManager.enable('test-dummy')
    expect(getPluginRecord()?.enabled).toBe(true)
  })

  it('supports plugin scoped storage and event emitter', () => {
    let capturedPayload: unknown = null

    const storagePlugin = definePlugin({
      metadata: {
        id: 'test-storage',
        name: '存储与事件测试',
        version: '1.0.0',
        description: '测试'
      },
      setup(ctx: PluginContext) {
        ctx.storage.set('counter', 42)
        ctx.on('test-event', (data) => {
          capturedPayload = data
        })
        ctx.emit('test-event', { msg: 'ok' })
      }
    })

    pluginManager.register(storagePlugin)
    expect(capturedPayload).toEqual({ msg: 'ok' })
  })

  it('registers and exposes command extensions correctly', async () => {
    const cmdAction = vi.fn()
    const commandPlugin = definePlugin({
      metadata: {
        id: 'test-commands',
        name: '指令扩展测试',
        version: '1.0.0',
        description: '测试'
      },
      extensions: {
        commands: [
          {
            id: 'test.run',
            title: '测试命令',
            category: '测试分类',
            shortcut: 'Ctrl+Shift+T',
            action: cmdAction
          }
        ]
      }
    })

    pluginManager.register(commandPlugin)
    const foundCmd = pluginManager.activeCommands.value.find((c) => c.id === 'test.run')
    expect(foundCmd).toBeDefined()
    expect(foundCmd?.title).toBe('测试命令')

    // 执行命令
    foundCmd?.action()
    expect(cmdAction).toHaveBeenCalled()

    // 停用插件后指令应被移除
    await pluginManager.disable('test-commands')
    const disabledCmd = pluginManager.activeCommands.value.find((c) => c.id === 'test.run')
    expect(disabledCmd).toBeUndefined()
  })

  it('supports custom plugin settingsComponent extension', () => {
    const fakeSettingsComp = { template: '<div>config</div>' }
    const settingsPlugin = definePlugin({
      metadata: {
        id: 'test-settings',
        name: '自定义设置测试',
        version: '1.0.0',
        description: '测试'
      },
      settingsComponent: fakeSettingsComp as any
    })

    pluginManager.register(settingsPlugin)
    const rec = pluginManager.allPlugins.value.find((p) => p.metadata.id === 'test-settings')
    expect(rec).toBeDefined()
    expect(rec?.hasSettings).toBe(true)

    const pluginDef = pluginManager.getPlugin('test-settings')
    expect(pluginDef?.settingsComponent).toStrictEqual(fakeSettingsComp)
  })
})
