import { describe, expect, it, beforeEach } from 'vitest'
import { pluginManager } from '../src/renderer/plugin/pluginManager'
import { marketplaceCatalog } from '../src/renderer/plugins/marketplace/catalog'
import {
  installMarketplacePlugin,
  uninstallMarketplacePlugin,
  isPluginInstalled,
  loadInstalledMarketplaceIds
} from '../src/renderer/plugins/marketplace/installer'

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
    }
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock
})

describe('Plugin Marketplace & Community Plugins', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('provides rich catalog of community plugins', () => {
    expect(marketplaceCatalog.length).toBeGreaterThanOrEqual(3)
    const pomodoro = marketplaceCatalog.find((p) => p.id === 'pomodoro-timer')
    expect(pomodoro).toBeDefined()
    expect(pomodoro?.category).toBe('productivity')
    expect(pomodoro?.stars).toBeGreaterThan(0)
  })

  it('can install and uninstall a community plugin dynamically', async () => {
    const pluginId = 'pomodoro-timer'
    expect(isPluginInstalled(pluginId)).toBe(false)

    // 安装插件
    const installOk = await installMarketplacePlugin(pluginId)
    expect(installOk).toBe(true)
    expect(isPluginInstalled(pluginId)).toBe(true)
    expect(loadInstalledMarketplaceIds()).toContain(pluginId)

    // 检查扩展点是否生效 (视图与指令)
    const hasView = pluginManager.activeViews.value.some((v) => v.id === 'pomodoro-timer-view')
    expect(hasView).toBe(true)

    // 卸载插件
    const uninstallOk = await uninstallMarketplacePlugin(pluginId)
    expect(uninstallOk).toBe(true)
    expect(isPluginInstalled(pluginId)).toBe(false)
    expect(loadInstalledMarketplaceIds()).not.toContain(pluginId)

    // 扩展点清理验证
    const viewAfter = pluginManager.activeViews.value.some((v) => v.id === 'pomodoro-timer-view')
    expect(viewAfter).toBe(false)
  })
})
