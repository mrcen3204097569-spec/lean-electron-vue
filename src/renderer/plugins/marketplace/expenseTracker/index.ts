import { markRaw } from 'vue'
import { definePlugin } from '@/plugin/pluginManager'
import ExpenseTrackerView from './ExpenseTrackerView.vue'

export const expenseTrackerPlugin = definePlugin({
  metadata: {
    id: 'expense-tracker',
    name: '极简日常记账',
    version: '1.0.0',
    description: '收支流水记录、分类统计、净结余自动计算与本地 JSON 导出',
    author: 'MoneyCraft',
    icon: 'Wallet',
    tags: ['记账', '财务', '消费', '效率']
  },
  extensions: {
    views: [
      {
        id: 'expense-tracker-view',
        path: '/plugins/expense-tracker',
        title: '日常记账',
        component: markRaw(ExpenseTrackerView),
        inNavigation: true,
        order: 60
      }
    ],
    commands: [
      {
        id: 'expense.open',
        title: '打开极简日常记账',
        category: '日常记账',
        action: () => {
          import('@/router').then(({ router }) => router.push('/plugins/expense-tracker'))
        }
      }
    ]
  }
})
