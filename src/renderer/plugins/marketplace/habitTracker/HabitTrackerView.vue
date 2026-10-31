<template>
  <div class="habit-tracker-view">
    <div class="view-header">
      <div class="header-left">
        <h2>习惯打卡追踪 (Habit Tracker)</h2>
        <span class="sub-desc">自律养成、连续天数记录与坚持热力可视化</span>
      </div>
      <el-button type="primary" size="small" @click="showAddDialog = true">+ 新增习惯</el-button>
    </div>

    <div class="habits-list">
      <div v-for="habit in habits" :key="habit.id" class="habit-card">
        <div class="card-left">
          <span class="habit-icon">{{ habit.icon || '🎯' }}</span>
          <div class="habit-meta">
            <span class="habit-name">{{ habit.name }}</span>
            <span class="habit-streak">
              🔥 连续坚持 {{ habit.streak }} 天 (累计 {{ habit.history.length }} 次)
            </span>
          </div>
        </div>

        <div class="card-center">
          <div class="heat-cubes">
            <span
              v-for="d in last7Days"
              :key="d"
              class="cube"
              :class="{ 'is-checked': habit.history.includes(d) }"
              :title="`${d}: ${habit.history.includes(d) ? '已打卡' : '未打卡'}`"
            ></span>
          </div>
        </div>

        <div class="card-right">
          <el-button
            :type="habit.history.includes(todayStr) ? 'success' : 'primary'"
            size="small"
            :plain="habit.history.includes(todayStr)"
            @click="toggleCheck(habit)"
          >
            {{ habit.history.includes(todayStr) ? '✓ 今日已完成' : '今日打卡' }}
          </el-button>
          <el-button link type="danger" size="small" @click="deleteHabit(habit.id)">删除</el-button>
        </div>
      </div>
    </div>

    <!-- 新建习惯弹窗 -->
    <el-dialog v-model="showAddDialog" title="新建自律习惯" width="420px">
      <el-form label-position="top">
        <el-form-item label="习惯名称">
          <el-input v-model="newHabitName" placeholder="如：早起晨跑 5km / 每日阅读 30分钟" />
        </el-form-item>
        <el-form-item label="习惯 Emoji 图标">
          <el-radio-group v-model="newHabitIcon">
            <el-radio-button value="🏃">🏃 运动</el-radio-button>
            <el-radio-button value="📚">📚 阅读</el-radio-button>
            <el-radio-button value="💧">💧 喝水</el-radio-button>
            <el-radio-button value="💻">💻 编程</el-radio-button>
            <el-radio-button value="🧘">🧘 冥想</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addHabit">创建习惯</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup name="HabitTrackerView">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

interface Habit {
  id: string
  name: string
  icon: string
  streak: number
  history: string[] // ISO dates: '2026-10-31'
}

const STORAGE_KEY = 'LEAN_HABIT_TRACKER_ITEMS'
const showAddDialog = ref(false)
const newHabitName = ref('')
const newHabitIcon = ref('🏃')

const todayStr = new Date().toISOString().split('T')[0]

const last7Days = computed(() => {
  const arr: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    arr.push(d.toISOString().split('T')[0])
  }
  return arr
})

const defaultHabits: Habit[] = [
  { id: 'h1', name: '晨起喝一大杯温水', icon: '💧', streak: 12, history: [todayStr] },
  { id: 'h2', name: '专注写代码 2 小时', icon: '💻', streak: 5, history: [todayStr] },
  { id: 'h3', name: '夜间阅读与复盘', icon: '📚', streak: 3, history: [] }
]

const habits = ref<Habit[]>([])

onMounted(() => {
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        habits.value = JSON.parse(raw)
        return
      } catch {
        // use default
      }
    }
  }
  habits.value = defaultHabits
})

function persist() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits.value))
  }
}

function toggleCheck(h: Habit) {
  const idx = h.history.indexOf(todayStr)
  if (idx > -1) {
    h.history.splice(idx, 1)
    h.streak = Math.max(0, h.streak - 1)
    ElMessage.info('已取消今日打卡')
  } else {
    h.history.push(todayStr)
    h.streak += 1
    ElMessage.success(`打卡成功！已连续坚持 ${h.streak} 天`)
  }
  persist()
}

function addHabit() {
  if (!newHabitName.value.trim()) {
    ElMessage.warning('请输入习惯名称')
    return
  }
  habits.value.push({
    id: `h-${Date.now()}`,
    name: newHabitName.value.trim(),
    icon: newHabitIcon.value,
    streak: 0,
    history: []
  })
  persist()
  newHabitName.value = ''
  showAddDialog.value = false
  ElMessage.success('习惯已建立')
}

function deleteHabit(id: string) {
  habits.value = habits.value.filter((h) => h.id !== id)
  persist()
  ElMessage.info('已删除习惯')
}
</script>

<style scoped lang="scss">
.habit-tracker-view {
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
.habits-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.habit-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--el-fill-color-blank, #fff);
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 8px;
  .card-left {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 260px;
    .habit-icon {
      font-size: 24px;
    }
    .habit-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
      .habit-name {
        font-size: 14px;
        font-weight: 600;
      }
      .habit-streak {
        font-size: 12px;
        color: #e6a23c;
        font-weight: 500;
      }
    }
  }
  .card-center {
    display: flex;
    align-items: center;
    .heat-cubes {
      display: flex;
      gap: 5px;
      .cube {
        width: 14px;
        height: 14px;
        border-radius: 3px;
        background: var(--el-fill-color-light, #ebedf0);
        &.is-checked {
          background: #67c23a;
        }
      }
    }
  }
  .card-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}
</style>
