import { defineAsyncComponent } from 'vue'
import type { PluginDefinition } from '../../../../shared/plugin/types'

export const stopwatchPlugin: PluginDefinition = {
  id: 'stopwatch-timer',
  name: '高精度秒表与计次',
  version: '1.0.0',
  description: '毫秒级秒表计时、支持分段计次 (Lap) 对比与耗时分析',
  author: 'TimeCraft',
  views: [
    {
      id: 'stopwatch-view',
      title: '高精度秒表',
      icon: 'Timer',
      path: '/plugin/stopwatch',
      component: defineAsyncComponent(() => import('./StopwatchView.vue'))
    }
  ]
}
