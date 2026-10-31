import { markRaw } from 'vue'
import { definePlugin } from '@/plugin/pluginManager'
import QuickNotesView from './QuickNotesView.vue'

export const quickNotesPlugin = definePlugin({
  metadata: {
    id: 'quick-notes',
    name: '桌面快捷便签',
    version: '1.0.0',
    description: '提供便签记录功能，支持本地持久化存储与随手记事',
    author: 'Lean Team',
    icon: 'Notebook',
    tags: ['便签', '效率', '工具']
  },
  extensions: {
    views: [
      {
        id: 'quick-notes-view',
        path: '/plugins/quick-notes',
        title: '快捷便签',
        component: markRaw(QuickNotesView),
        inNavigation: true,
        order: 20
      }
    ]
  }
})
