import { defineAsyncComponent } from 'vue'
import type { PluginDefinition } from '../../../../shared/plugin/types'

export const canvasSketchPlugin: PluginDefinition = {
  id: 'canvas-sketch',
  name: '草图白板涂鸦',
  version: '1.0.0',
  description: '轻量 HTML5 Canvas 手绘草图、流程涂鸦与一键导出 PNG 图像',
  author: 'SketchLab',
  views: [
    {
      id: 'canvas-sketch-view',
      title: '草图白板',
      icon: 'EditPen',
      path: '/plugin/canvas-sketch',
      component: defineAsyncComponent(() => import('./CanvasSketchView.vue'))
    }
  ]
}
