import { defineAsyncComponent } from 'vue'
import type { PluginDefinition } from '../../../../shared/plugin/types'

export const snippetVaultPlugin: PluginDefinition = {
  id: 'snippet-vault',
  name: '代码片段金库',
  version: '1.0.0',
  description: '常用代码片段、脚手架与配置文件跨语言集中管理、一键复制代码',
  author: 'DevVault',
  views: [
    {
      id: 'snippet-vault-view',
      title: '代码金库',
      icon: 'DocumentCopy',
      path: '/plugin/snippet-vault',
      component: defineAsyncComponent(() => import('./SnippetVaultView.vue'))
    }
  ]
}
