import { markRaw } from 'vue'
import { definePlugin } from '@/plugin/pluginManager'
import DevToolboxView from './DevToolboxView.vue'

export const devToolboxPlugin = definePlugin({
  metadata: {
    id: 'dev-toolbox',
    name: '开发者工具箱',
    version: '1.0.0',
    description: '集成 JSON 格式化、时间戳双向转换与 Base64 编解码等实用开发工具',
    author: 'Lean Team',
    icon: 'Tools',
    tags: ['开发', '工具箱', 'JSON', '时间戳']
  },
  extensions: {
    views: [
      {
        id: 'dev-toolbox-view',
        path: '/plugins/dev-toolbox',
        title: '开发工具箱',
        component: markRaw(DevToolboxView),
        inNavigation: true,
        order: 30
      }
    ]
  }
})
