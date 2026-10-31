<template>
  <div class="expense-tracker-view">
    <div class="view-header">
      <div class="header-left">
        <h2>极简日常记账 (Expense Tracker)</h2>
        <span class="sub-desc">掌控收支流水、分类汇总统计与结余计算</span>
      </div>
      <div class="header-actions">
        <el-button size="small" @click="exportData">导出 JSON</el-button>
        <el-button type="primary" size="small" @click="showAddDialog = true">+ 记一笔</el-button>
      </div>
    </div>

    <!-- 资产汇总面板 -->
    <div class="summary-cards">
      <div class="summary-card balance">
        <span class="label">净结余 (Balance)</span>
        <span class="amount">¥ {{ balance.toFixed(2) }}</span>
      </div>
      <div class="summary-card income">
        <span class="label">总收入 (Income)</span>
        <span class="amount">+¥ {{ totalIncome.toFixed(2) }}</span>
      </div>
      <div class="summary-card expense">
        <span class="label">总支出 (Expense)</span>
        <span class="amount">-¥ {{ totalExpense.toFixed(2) }}</span>
      </div>
    </div>

    <!-- 流水列表 -->
    <div class="transactions-section">
      <div class="section-title">收支明细清单 ({{ transactions.length }})</div>
      <el-table :data="transactions" stripe size="small" style="width: 100%">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column label="收支类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.type === 'income' ? 'success' : 'danger'">
              {{ row.type === 'income' ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="title" label="事项说明" min-width="180" />
        <el-table-column label="金额" width="120" align="right">
          <template #default="{ row }">
            <span :class="row.type === 'income' ? 'text-income' : 'text-expense'">
              {{ row.type === 'income' ? '+' : '-' }}¥{{ Number(row.amount).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ $index }">
            <el-button link type="danger" size="small" @click="deleteItem($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 记一笔对话框 -->
    <el-dialog v-model="showAddDialog" title="记录一笔收支" width="450px">
      <el-form label-position="top">
        <el-form-item label="收支类型">
          <el-radio-group v-model="form.type">
            <el-radio-button value="expense">支出</el-radio-button>
            <el-radio-button value="income">收入</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="金额 (元)">
          <el-input-number
            v-model="form.amount"
            :min="0.01"
            :precision="2"
            :step="10"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category" style="width: 100%">
            <el-option
              v-for="c in form.type === 'expense' ? expenseCats : incomeCats"
              :key="c"
              :label="c"
              :value="c"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="事项描述">
          <el-input v-model="form.title" placeholder="如：工作日午餐 / 奖金发放" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addTransaction">确定记账</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup name="ExpenseTrackerView">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

interface Transaction {
  id: string
  date: string
  type: 'income' | 'expense'
  category: string
  title: string
  amount: number
}

const STORAGE_KEY = 'LEAN_EXPENSE_TRANSACTIONS'
const showAddDialog = ref(false)

const expenseCats = ['餐饮美食', '交通出行', '数码设备', '服饰装扮', '住房物业', '文娱休闲']
const incomeCats = ['月度薪资', '理财收益', '兼职外包', '红包赠予']

const form = reactive({
  type: 'expense' as 'income' | 'expense',
  amount: 25,
  category: '餐饮美食',
  title: ''
})

const defaultList: Transaction[] = [
  {
    id: '1',
    date: '2026-10-30',
    type: 'income',
    category: '月度薪资',
    title: '10月工资结算',
    amount: 15000
  },
  {
    id: '2',
    date: '2026-10-31',
    type: 'expense',
    category: '餐饮美食',
    title: '星巴克咖啡与下午茶',
    amount: 48
  },
  {
    id: '3',
    date: '2026-10-31',
    type: 'expense',
    category: '交通出行',
    title: '地铁通勤充值',
    amount: 100
  }
]

const transactions = ref<Transaction[]>([])

onMounted(() => {
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        transactions.value = JSON.parse(raw)
        return
      } catch {
        // use default
      }
    }
  }
  transactions.value = defaultList
})

function persist() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions.value))
  }
}

const totalIncome = computed(() =>
  transactions.value
    .filter((t) => t.type === 'income')
    .reduce((acc, cur) => acc + Number(cur.amount), 0)
)

const totalExpense = computed(() =>
  transactions.value
    .filter((t) => t.type === 'expense')
    .reduce((acc, cur) => acc + Number(cur.amount), 0)
)

const balance = computed(() => totalIncome.value - totalExpense.value)

function addTransaction() {
  if (!form.title.trim() || form.amount <= 0) {
    ElMessage.warning('请填写事项说明与有效金额')
    return
  }
  transactions.value.unshift({
    id: `tx-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    type: form.type,
    category: form.category,
    title: form.title.trim(),
    amount: Number(form.amount)
  })
  persist()
  showAddDialog.value = false
  form.title = ''
  ElMessage.success('记账成功')
}

function deleteItem(index: number) {
  transactions.value.splice(index, 1)
  persist()
  ElMessage.info('已移除记录')
}

function exportData() {
  const blob = new Blob([JSON.stringify(transactions.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `expense-report-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('收支数据已导出')
}
</script>

<style scoped lang="scss">
.expense-tracker-view {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .header-left {
    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    .sub-desc {
      font-size: 12px;
      color: var(--el-text-color-secondary, #909399);
    }
  }
}
.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.summary-card {
  padding: 14px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  background: var(--el-fill-color-blank, #fff);
  .label {
    font-size: 12px;
    color: var(--el-text-color-secondary, #909399);
  }
  .amount {
    font-size: 20px;
    font-weight: 700;
  }
  &.balance .amount {
    color: #409eff;
  }
  &.income .amount {
    color: #67c23a;
  }
  &.expense .amount {
    color: #f56c6c;
  }
}
.text-income {
  color: #67c23a;
  font-weight: 600;
}
.text-expense {
  color: #f56c6c;
  font-weight: 600;
}
.transactions-section {
  .section-title {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
  }
}
</style>
