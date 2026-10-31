import { defineAsyncComponent } from 'vue'
import type { PluginDefinition } from '../../../../shared/plugin/types'

export const habitTrackerPlugin: PluginDefinition = {
  id: 'habit-tracker',
  name: '习惯打卡追踪',
  version: '1.0.0',
  description: '自律习惯打卡、连续坚持天数记录与最近打卡热力方块可视化',
  author: 'HabitCraft',
  views: [
    {
      id: 'habit-tracker-view',
      title: '习惯打卡',
      icon: 'Calendar',
      path: '/plugin/habit-tracker',
      component: defineAsyncComponent(() => import('./HabitTrackerView.vue'))
    }
  ]
}
