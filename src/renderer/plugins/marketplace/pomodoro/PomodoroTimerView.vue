<template>
  <div class="pomodoro-view">
    <div class="pomodoro-card">
      <div class="mode-tabs">
        <el-button-group>
          <el-button
            :type="currentMode === 'work' ? 'primary' : 'default'"
            @click="switchMode('work')"
          >
            🍅 专注工作 (25m)
          </el-button>
          <el-button
            :type="currentMode === 'shortBreak' ? 'success' : 'default'"
            @click="switchMode('shortBreak')"
          >
            ☕ 短休息 (5m)
          </el-button>
          <el-button
            :type="currentMode === 'longBreak' ? 'warning' : 'default'"
            @click="switchMode('longBreak')"
          >
            🌴 长休息 (15m)
          </el-button>
        </el-button-group>
      </div>

      <div class="timer-display">
        <div class="time-text">{{ formattedTime }}</div>
        <div class="mode-label">{{ modeLabel }}</div>
      </div>

      <el-progress
        :percentage="progressPercentage"
        :stroke-width="8"
        :show-text="false"
        :status="currentMode === 'work' ? '' : 'success'"
        class="timer-progress"
      />

      <div class="timer-controls">
        <el-button
          v-if="!isRunning"
          type="primary"
          size="large"
          round
          class="ctrl-btn"
          @click="startTimer"
        >
          开始专注
        </el-button>
        <el-button v-else type="warning" size="large" round class="ctrl-btn" @click="pauseTimer">
          暂停
        </el-button>
        <el-button size="large" round class="ctrl-btn" @click="resetTimer">重置</el-button>
      </div>

      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-value">{{ completedCount }}</span>
          <span class="stat-desc">今日完成番茄数</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ totalMinutesFocused }}m</span>
          <span class="stat-desc">累计专注时长</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="PomodoroTimerView">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { pluginManager } from '@/plugin/pluginManager'

type Mode = 'work' | 'shortBreak' | 'longBreak'

const MODE_DURATIONS: Record<Mode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60
}

const storage = pluginManager.getPluginStorage('pomodoro-timer')

const currentMode = ref<Mode>('work')
const timeLeft = ref(MODE_DURATIONS.work)
const isRunning = ref(false)
const completedCount = ref(0)
const totalMinutesFocused = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null

const modeLabel = computed(() => {
  if (currentMode.value === 'work') return '保持专注，进入心流状态'
  if (currentMode.value === 'shortBreak') return '活动肩颈，喝一口水吧'
  return '深度放松，补充精力'
})

const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60)
    .toString()
    .padStart(2, '0')
  const s = (timeLeft.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const progressPercentage = computed(() => {
  const total = MODE_DURATIONS[currentMode.value]
  const passed = total - timeLeft.value
  return Math.min(100, Math.max(0, Math.round((passed / total) * 100)))
})

const switchMode = (mode: Mode) => {
  pauseTimer()
  currentMode.value = mode
  timeLeft.value = MODE_DURATIONS[mode]
}

const startTimer = () => {
  if (isRunning.value) return
  isRunning.value = true

  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
      if (currentMode.value === 'work' && timeLeft.value % 60 === 0) {
        totalMinutesFocused.value++
        storage.set('totalMinutesFocused', totalMinutesFocused.value)
      }
    } else {
      finishCycle()
    }
  }, 1000)
}

const pauseTimer = () => {
  isRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const resetTimer = () => {
  pauseTimer()
  timeLeft.value = MODE_DURATIONS[currentMode.value]
}

const finishCycle = () => {
  pauseTimer()
  if (currentMode.value === 'work') {
    completedCount.value++
    storage.set('completedCount', completedCount.value)
    ElMessage.success('🎉 恭喜！完成了一个专注番茄钟！')
    window.electronSystemApi?.showNotification({
      title: '🍅 番茄钟专注完成',
      body: '休息一下吧！喝水、深呼吸放松片刻。'
    })
    switchMode('shortBreak')
  } else {
    ElMessage.info('休息时间结束，准备开始下一个番茄钟吧！')
    switchMode('work')
  }
}

onMounted(() => {
  completedCount.value = storage.get<number>('completedCount', 0)
  totalMinutesFocused.value = storage.get<number>('totalMinutesFocused', 0)
})

onUnmounted(() => {
  pauseTimer()
})
</script>

<style scoped lang="scss">
.pomodoro-view {
  padding: 30px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
}

.pomodoro-card {
  width: 520px;
  max-width: 100%;
  background: var(--el-bg-color, #ffffff);
  border: 1px solid var(--el-border-color-lighter, #e4e7ed);
  border-radius: 16px;
  padding: 36px 30px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.mode-tabs {
  margin-bottom: 30px;
}

.timer-display {
  margin: 10px 0 20px 0;

  .time-text {
    font-size: 76px;
    font-weight: 700;
    font-family: monospace;
    letter-spacing: 2px;
    color: var(--el-text-color-primary, #303133);
    line-height: 1;
  }

  .mode-label {
    margin-top: 14px;
    font-size: 14px;
    color: var(--el-text-color-secondary, #909399);
  }
}

.timer-progress {
  width: 80%;
  margin: 10px 0 30px 0;
}

.timer-controls {
  display: flex;
  gap: 16px;
  margin-bottom: 36px;

  .ctrl-btn {
    min-width: 110px;
    font-weight: 600;
  }
}

.stats-row {
  display: flex;
  justify-content: space-around;
  width: 100%;
  border-top: 1px solid var(--el-border-color-lighter, #f0f2f5);
  padding-top: 24px;

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--el-color-primary, #409eff);
    }

    .stat-desc {
      font-size: 12px;
      color: var(--el-text-color-secondary, #909399);
      margin-top: 4px;
    }
  }
}
</style>
