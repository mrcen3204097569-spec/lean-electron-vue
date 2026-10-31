import { markRaw } from 'vue'
import { definePlugin } from '@/plugin/pluginManager'
import StopwatchView from './StopwatchView.vue'

export const stopwatchPlugin = definePlugin({
  metadata: {
    id: 'stopwatch-timer',
    name: '高精度秒表与计次',
    version: '1.0.0',
    description: '毫秒级秒表计时、支持分段计次 (Lap) 对比与耗时分析',
    author: 'TimeCraft',
    icon: 'Timer',
    tags: ['秒表', '计时', 'Lap', '效率']
  },
  extensions: {
    views: [
      {
        id: 'stopwatch-view',
        path: '/plugins/stopwatch',
        title: '高精度秒表',
        component: markRaw(StopwatchView),
        inNavigation: true,
        order: 75
      }
    ],
    commands: [
      {
        id: 'stopwatch.open',
        title: '打开高精度秒表',
        category: '高精度秒表',
        action: () => {
          import('@/router').then(({ router }) => router.push('/plugins/stopwatch'))
        }
      }
    ]
  }
})
