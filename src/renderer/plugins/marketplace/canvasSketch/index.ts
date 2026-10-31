import { markRaw } from 'vue'
import { definePlugin } from '@/plugin/pluginManager'
import CanvasSketchView from './CanvasSketchView.vue'

export const canvasSketchPlugin = definePlugin({
  metadata: {
    id: 'canvas-sketch',
    name: '草图白板涂鸦',
    version: '1.0.0',
    description: '轻量 HTML5 Canvas 手绘草图、流程涂鸦与一键导出 PNG 图像',
    author: 'SketchLab',
    icon: 'EditPen',
    tags: ['画板', '草图', '涂鸦', 'Canvas']
  },
  extensions: {
    views: [
      {
        id: 'canvas-sketch-view',
        path: '/plugins/canvas-sketch',
        title: '草图白板',
        component: markRaw(CanvasSketchView),
        inNavigation: true,
        order: 70
      }
    ],
    commands: [
      {
        id: 'sketch.open',
        title: '打开草图白板涂鸦',
        category: '草图白板',
        action: () => {
          import('@/router').then(({ router }) => router.push('/plugins/canvas-sketch'))
        }
      }
    ]
  }
})
