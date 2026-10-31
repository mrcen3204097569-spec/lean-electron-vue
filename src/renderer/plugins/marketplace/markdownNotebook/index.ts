import { defineAsyncComponent } from 'vue'
import type { PluginDefinition } from '../../../../shared/plugin/types'

export const markdownNotebookPlugin: PluginDefinition = {
  id: 'markdown-notebook',
  name: 'Markdown 实时笔记本',
  version: '1.0.0',
  description: '双栏即时渲染排版、语法快捷注入、字数统计与 Markdown 文件导出',
  author: 'DocCraft',
  views: [
    {
      id: 'markdown-notebook-view',
      title: 'Markdown 笔记',
      icon: 'Document',
      path: '/plugin/markdown-notebook',
      component: defineAsyncComponent(() => import('./MarkdownNotebookView.vue'))
    }
  ]
}
