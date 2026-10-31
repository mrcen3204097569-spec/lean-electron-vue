import { markRaw } from 'vue'
import { definePlugin } from '@/plugin/pluginManager'
import ApiClientView from './ApiClientView.vue'

export const apiClientPlugin = definePlugin({
  metadata: {
    id: 'api-client',
    name: 'REST API 接口调试器',
    version: '1.0.0',
    description:
      '轻量极速的 HTTP / REST 接口演练场，支持请求头参数配置、JSON 格式化与响应体实时解析',
    author: 'API Craft',
    icon: 'Connection',
    tags: ['API', 'HTTP', '调试', '接口', '开发']
  },
  extensions: {
    views: [
      {
        id: 'api-client-view',
        path: '/plugins/api-client',
        title: 'API 调试器',
        component: markRaw(ApiClientView),
        inNavigation: true,
        order: 70
      }
    ],
    commands: [
      {
        id: 'api-client.open',
        title: '打开 REST API 接口调试器',
        category: '开发工具',
        shortcut: 'Alt+R',
        action: async () => {
          const { router } = await import('@/router')
          void router.push('/plugins/api-client')
        }
      }
    ]
  }
})
