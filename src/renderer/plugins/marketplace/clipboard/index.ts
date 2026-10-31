import { markRaw } from 'vue'
import { definePlugin } from '@/plugin/pluginManager'
import ClipboardHistoryView from './ClipboardHistoryView.vue'
import ClipboardWidget from './ClipboardWidget.vue'

export const clipboardPlugin = definePlugin({
  metadata: {
    id: 'clipboard-history',
    name: '剪贴板历史卫士',
    version: '1.0.0',
    description: '自动追踪与持久化剪贴板文本记录，支持模糊搜索、一键回写系统剪贴板与单条清理',
    author: 'RayMaster',
    icon: 'DocumentCopy',
    tags: ['剪贴板', '历史', '系统', '生产力']
  },
  extensions: {
    views: [
      {
        id: 'clipboard-history-view',
        path: '/plugins/clipboard-history',
        title: '剪贴板历史',
        component: markRaw(ClipboardHistoryView),
        inNavigation: true,
        order: 50
      }
    ],
    statusBarItems: [
      {
        id: 'clipboard-status',
        alignment: 'right',
        order: 25,
        component: markRaw(ClipboardWidget)
      }
    ],
    commands: [
      {
        id: 'clipboard.open',
        title: '打开剪贴板历史卫士',
        category: '剪贴板',
        shortcut: 'Alt+V',
        action: async () => {
          const { router } = await import('@/router')
          void router.push('/plugins/clipboard-history')
        }
      }
    ]
  }
})
