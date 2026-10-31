import { markRaw } from 'vue'
import { definePlugin } from '@/plugin/pluginManager'
import { router } from '@/router'
import SystemMonitorView from './SystemMonitorView.vue'
import SystemStatusWidget from './SystemStatusWidget.vue'
import SystemMonitorSettings from './SystemMonitorSettings.vue'

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
  settingsComponent: markRaw(SystemMonitorSettings),
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
    ],
    commands: [
      {
        id: 'system-monitor.open',
        title: '打开系统硬件监控看板',
        category: '系统监控',
        shortcut: 'Alt+M',
        action: () => {
          router.push('/plugins/system-monitor')
        }
      }
    ]
  }
})
