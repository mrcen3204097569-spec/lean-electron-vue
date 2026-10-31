import { markRaw } from 'vue'
import { definePlugin } from '@/plugin/pluginManager'
import SnippetVaultView from './SnippetVaultView.vue'

export const snippetVaultPlugin = definePlugin({
  metadata: {
    id: 'snippet-vault',
    name: '代码片段金库',
    version: '1.0.0',
    description: '跨语言代码片段、脚手架与常用配置集中管理与一键复制代码',
    author: 'DevVault',
    icon: 'DocumentCopy',
    tags: ['代码', '片段', '开发', 'TypeScript']
  },
  extensions: {
    views: [
      {
        id: 'snippet-vault-view',
        path: '/plugins/snippet-vault',
        title: '代码金库',
        component: markRaw(SnippetVaultView),
        inNavigation: true,
        order: 55
      }
    ],
    commands: [
      {
        id: 'snippet.open',
        title: '打开代码片段金库',
        category: '代码金库',
        action: () => {
          import('@/router').then(({ router }) => router.push('/plugins/snippet-vault'))
        }
      }
    ]
  }
})
