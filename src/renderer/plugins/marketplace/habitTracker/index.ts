import { markRaw } from 'vue'
import { definePlugin } from '@/plugin/pluginManager'
import HabitTrackerView from './HabitTrackerView.vue'

export const habitTrackerPlugin = definePlugin({
  metadata: {
    id: 'habit-tracker',
    name: '习惯打卡追踪',
    version: '1.0.0',
    description: '自律习惯打卡、连续坚持天数记录与最近打卡热力方块可视化',
    author: 'HabitCraft',
    icon: 'Calendar',
    tags: ['打卡', '习惯', '坚持', '自律']
  },
  extensions: {
    views: [
      {
        id: 'habit-tracker-view',
        path: '/plugins/habit-tracker',
        title: '习惯打卡',
        component: markRaw(HabitTrackerView),
        inNavigation: true,
        order: 65
      }
    ],
    commands: [
      {
        id: 'habit.open',
        title: '打开习惯打卡追踪',
        category: '习惯打卡',
        action: () => {
          import('@/router').then(({ router }) => router.push('/plugins/habit-tracker'))
        }
      }
    ]
  }
})
