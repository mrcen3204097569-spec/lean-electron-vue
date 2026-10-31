import { defineAsyncComponent } from 'vue'
import type { PluginDefinition } from '../../../../shared/plugin/types'

export const expenseTrackerPlugin: PluginDefinition = {
  id: 'expense-tracker',
  name: '极简日常记账',
  version: '1.0.0',
  description: '收支流水记录、分类统计、净结余自动计算与本地 JSON 导出',
  author: 'MoneyCraft',
  views: [
    {
      id: 'expense-tracker-view',
      title: '日常记账',
      icon: 'Wallet',
      path: '/plugin/expense-tracker',
      component: defineAsyncComponent(() => import('./ExpenseTrackerView.vue'))
    }
  ]
}
