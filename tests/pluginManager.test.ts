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
})
