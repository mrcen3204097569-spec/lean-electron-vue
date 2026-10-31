import { describe, expect, it, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTabStore } from '../src/renderer/store/tab.store'
import type { RouteLocationNormalized, Router } from 'vue-router'

describe('useTabStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default Home tab', () => {
    const store = useTabStore()
    expect(store.tabs.length).toBe(1)
    expect(store.tabs[0].path).toBe('/home')
    expect(store.tabs[0].closable).toBe(false)
    expect(store.activeTabId).toBe('/home')
  })

  it('adds new tab when navigating to a new route', () => {
    const store = useTabStore()
    const mockRoute = {
      path: '/plugins',
      name: 'plugins',
      meta: { title: '插件中心' },
      query: {}
    } as unknown as RouteLocationNormalized

    store.addTab(mockRoute)
    expect(store.tabs.length).toBe(2)
    expect(store.tabs[1].path).toBe('/plugins')
    expect(store.tabs[1].title).toBe('插件中心')
    expect(store.activeTabId).toBe('/plugins')

    // 重复进入相同路由不重复添加
    store.addTab(mockRoute)
    expect(store.tabs.length).toBe(2)
  })

  it('closes tab and switches to adjacent tab', () => {
    const store = useTabStore()
    const pushSpy = vi.fn()
    const mockRouter = { push: pushSpy } as unknown as Router

    store.addTab({
      path: '/plugins',
      meta: { title: '插件中心' },
      query: {}
    } as unknown as RouteLocationNormalized)

    store.addTab({
      path: '/settings',
      meta: { title: '设置' },
      query: {}
    } as unknown as RouteLocationNormalized)

    expect(store.tabs.length).toBe(3)
    expect(store.activeTabId).toBe('/settings')

    // 关闭当前激活的 /settings 标签
    store.closeTab('/settings', mockRouter)
    expect(store.tabs.length).toBe(2)
    expect(store.activeTabId).toBe('/plugins')
    expect(pushSpy).toHaveBeenCalledWith('/plugins')

    // 关闭主页标签应被阻止（closable: false）
    store.closeTab('/home', mockRouter)
    expect(store.tabs.length).toBe(2)
  })

  it('closes other tabs', () => {
    const store = useTabStore()
    const pushSpy = vi.fn()
    const mockRouter = { push: pushSpy } as unknown as Router

    store.addTab({
      path: '/plugins',
      meta: { title: '插件中心' },
      query: {}
    } as unknown as RouteLocationNormalized)

    store.addTab({
      path: '/settings',
      meta: { title: '设置' },
      query: {}
    } as unknown as RouteLocationNormalized)

    store.closeOthers('/plugins', mockRouter)
    expect(store.tabs.length).toBe(2) // /home + /plugins
    expect(store.tabs.map((t) => t.path)).toEqual(['/home', '/plugins'])
  })

  it('closes all tabs and returns to home', () => {
    const store = useTabStore()
    const pushSpy = vi.fn()
    const mockRouter = { push: pushSpy } as unknown as Router

    store.addTab({
      path: '/plugins',
      meta: { title: '插件中心' },
      query: {}
    } as unknown as RouteLocationNormalized)

    store.closeAll(mockRouter)
    expect(store.tabs.length).toBe(1)
    expect(store.activeTabId).toBe('/home')
    expect(pushSpy).toHaveBeenCalledWith('/home')
  })
})
