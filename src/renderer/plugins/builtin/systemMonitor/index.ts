import { markRaw } from 'vue'
import { definePlugin } from '@/plugin/pluginManager'
import SystemMonitorView from './SystemMonitorView.vue'
import SystemStatusWidget from './SystemStatusWidget.vue'

export const systemMonitorPlugin = definePlugin({
  metadata: {
    id: 'system-monitor',
    name: '系统运行监控',
    version: '1.0.0',
    description: '实时监控系统硬件配置、运行环境与内存使用率，并提供底部常驻状态挂件',
    author: 'Lean Team',
    icon: 'Cpu',
    tags: ['系统', '监控', '硬件']
  },
  extensions: {
    views: [
      {
        id: 'system-monitor-view',
        path: '/plugins/system-monitor',
        title: '系统监控',
        component: markRaw(SystemMonitorView),
        inNavigation: true,
        order: 10
      }
    ],
    statusBarItems: [
      {
        id: 'system-monitor-status',
        alignment: 'left',
        order: 10,
        component: markRaw(SystemStatusWidget)
      }
    ]
  }
})
