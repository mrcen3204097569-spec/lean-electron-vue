import { defineStore } from 'pinia'
import type { RouteLocationNormalized, Router } from 'vue-router'
import type { Component } from 'vue'

export interface TabItem {
  id: string
  path: string
  title: string
  icon?: string | Component
  closable: boolean
}

const HOME_TAB: TabItem = {
  id: '/home',
  path: '/home',
  title: '仪表盘',
  icon: 'Monitor',
  closable: false
}

export const useTabStore = defineStore('tab', {
  state: () => ({
    tabs: [HOME_TAB] as TabItem[],
    activeTabId: '/home'
  }),
  actions: {
    addTab(route: RouteLocationNormalized) {
      if (!route.path || route.path === '/') {
        this.activeTabId = '/home'
        return
      }

      // 忽略特殊弹窗路由
      if (route.query.dialog === '1' || route.meta?.isDialog) {
        return
      }

      const path = route.path
      const existing = this.tabs.find((t) => t.path === path)

      if (existing) {
        this.activeTabId = existing.id
        return
      }

      const title = (route.meta?.title as string) || (route.name as string) || '新标签页'
      const icon = (route.meta?.icon as string | Component) || undefined

      const newTab: TabItem = {
        id: path,
        path,
        title,
        icon,
        closable: path !== '/home'
      }

      this.tabs.push(newTab)
      this.activeTabId = newTab.id
    },

    setActiveTab(id: string, router: Router) {
      const tab = this.tabs.find((t) => t.id === id)
      if (tab) {
        this.activeTabId = tab.id
        void router.push(tab.path)
      }
    },

    closeTab(id: string, router: Router) {
      const index = this.tabs.findIndex((t) => t.id === id)
      if (index === -1) return

      const tab = this.tabs[index]
      if (!tab.closable) return

      const wasActive = this.activeTabId === tab.id
      this.tabs.splice(index, 1)

      if (wasActive) {
        const nextIndex = Math.max(0, index - 1)
        const nextTab = this.tabs[nextIndex] || HOME_TAB
        this.activeTabId = nextTab.id
        void router.push(nextTab.path)
      }
    },

    closeOthers(id: string, router: Router) {
      this.tabs = this.tabs.filter((t) => !t.closable || t.id === id)
      const target = this.tabs.find((t) => t.id === id) || HOME_TAB
      this.activeTabId = target.id
      void router.push(target.path)
    },

    closeAll(router: Router) {
      this.tabs = this.tabs.filter((t) => !t.closable)
      this.activeTabId = HOME_TAB.id
      void router.push(HOME_TAB.path)
    }
  }
})
