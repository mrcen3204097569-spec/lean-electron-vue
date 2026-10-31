import { markRaw } from 'vue'
import { definePlugin } from '@/plugin/pluginManager'
import MarkdownNotebookView from './MarkdownNotebookView.vue'

export const markdownNotebookPlugin = definePlugin({
  metadata: {
    id: 'markdown-notebook',
    name: 'Markdown 实时笔记本',
    version: '1.0.0',
    description: '双栏即时渲染排版、常用语法快捷插入、字数统计与标准 Markdown 文件导出',
    author: 'DocCraft',
    icon: 'Document',
    tags: ['笔记', 'Markdown', '文档', '写作']
  },
  extensions: {
    views: [
      {
        id: 'markdown-notebook-view',
        path: '/plugins/markdown-notebook',
        title: 'Markdown 笔记',
        component: markRaw(MarkdownNotebookView),
        inNavigation: true,
        order: 50
      }
    ],
    commands: [
      {
        id: 'markdown.open',
        title: '打开 Markdown 实时笔记本',
        category: 'Markdown 笔记',
        action: () => {
          import('@/router').then(({ router }) => router.push('/plugins/markdown-notebook'))
        }
      }
    ]
  }
})
