import { markRaw } from 'vue'
import { definePlugin } from '@/plugin/pluginManager'
import ColorPaletteView from './ColorPaletteView.vue'

export const colorPalettePlugin = definePlugin({
  metadata: {
    id: 'color-palette',
    name: '设计调色盘与对比度',
    version: '1.0.0',
    description: '内置 Apple、Tailwind、Nord 精品现代色卡，并提供 WCAG 文本可访问性对比度检测工具',
    author: 'DesignOps',
    icon: 'Brush',
    tags: ['设计', '配色', '调色盘', 'WCAG', '色彩']
  },
  extensions: {
    views: [
      {
        id: 'color-palette-view',
        path: '/plugins/color-palette',
        title: '设计调色盘',
        component: markRaw(ColorPaletteView),
        inNavigation: true,
        order: 60
      }
    ],
    commands: [
      {
        id: 'palette.open',
        title: '打开设计调色盘与色彩对比度',
        category: '设计工具',
        shortcut: 'Alt+G',
        action: async () => {
          const { router } = await import('@/router')
          void router.push('/plugins/color-palette')
        }
      }
    ]
  }
})
