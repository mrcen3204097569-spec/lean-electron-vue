import { markRaw } from 'vue'
import { definePlugin } from '@/plugin/pluginManager'
import PomodoroTimerView from './PomodoroTimerView.vue'
import PomodoroWidget from './PomodoroWidget.vue'

export const pomodoroPlugin = definePlugin({
  metadata: {
    id: 'pomodoro-timer',
    name: '番茄专注时钟',
    version: '1.0.0',
    description: '科学的番茄工作法时钟，支持专注/休息倒计时、原生完成弹窗与累计时长统计',
    author: 'FlowCraft Team',
    icon: 'AlarmClock',
    tags: ['番茄钟', '效率', '健康', '自律']
  },
  extensions: {
    views: [
      {
        id: 'pomodoro-timer-view',
        path: '/plugins/pomodoro-timer',
        title: '番茄时钟',
        component: markRaw(PomodoroTimerView),
        inNavigation: true,
        order: 40
      }
    ],
    statusBarItems: [
      {
        id: 'pomodoro-status',
        alignment: 'right',
        order: 30,
        component: markRaw(PomodoroWidget)
      }
    ],
    commands: [
      {
        id: 'pomodoro.open',
        title: '打开番茄专注时钟',
        category: '番茄时钟',
        shortcut: 'Alt+C',
        action: async () => {
          const { router } = await import('@/router')
          void router.push('/plugins/pomodoro-timer')
        }
      }
    ]
  }
})
