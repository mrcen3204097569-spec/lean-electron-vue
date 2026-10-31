<template>
  <div class="stopwatch-view">
    <div class="view-header">
      <div class="header-left">
        <h2>高精度秒表与计次 (Precision Stopwatch)</h2>
        <span class="sub-desc">毫秒级秒表计时、计次拉普 (Lap) 记录与分段耗时分析</span>
      </div>
    </div>

    <!-- 巨大数字时钟盘 -->
    <div class="timer-display-box">
      <span class="digits">{{ formattedTime }}</span>
    </div>

    <!-- 控制按钮 -->
    <div class="controls-row">
      <el-button :type="isRunning ? 'danger' : 'primary'" size="large" @click="toggleRun">
        {{ isRunning ? '暂停计时' : '开始计时' }}
      </el-button>
      <el-button size="large" :disabled="!isRunning" @click="recordLap">计次 (Lap)</el-button>
      <el-button size="large" :disabled="isRunning && elapsedMs === 0" @click="resetTimer">
        重置
      </el-button>
    </div>

    <!-- 计次历史表格 -->
    <div v-if="laps.length" class="laps-section">
      <div class="section-title">计次记录明细 ({{ laps.length }} 圈)</div>
      <el-table :data="laps" stripe size="small" style="width: 100%">
        <el-table-column prop="index" label="圈数" width="100">
          <template #default="{ row }">
            <span class="lap-tag">Lap {{ row.index }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="splitTime" label="分段用时 (Split)" min-width="150" />
        <el-table-column prop="totalTime" label="累计用时 (Total)" min-width="150" />
      </el-table>
    </div>
  </div>
</template>

<script lang="ts" setup name="StopwatchView">
import { ref, computed, onUnmounted } from 'vue'

const isRunning = ref(false)
const elapsedMs = ref(0)
let startTime = 0
let animFrameId: number | null = null

interface LapRecord {
  index: number
  splitTime: string
  totalTime: string
}

const laps = ref<LapRecord[]>([])
let lastLapTotalMs = 0

function formatMs(ms: number): string {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const c = Math.floor((ms % 1000) / 10)
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  const cc = String(c).padStart(2, '0')
  return `${mm}:${ss}.${cc}`
}

const formattedTime = computed(() => formatMs(elapsedMs.value))

function tick() {
  if (isRunning.value) {
    elapsedMs.value = performance.now() - startTime
    animFrameId = requestAnimationFrame(tick)
  }
}

function toggleRun() {
  if (isRunning.value) {
    isRunning.value = false
    if (animFrameId) cancelAnimationFrame(animFrameId)
  } else {
    isRunning.value = true
    startTime = performance.now() - elapsedMs.value
    animFrameId = requestAnimationFrame(tick)
  }
}

function recordLap() {
  const currentTotal = elapsedMs.value
  const split = currentTotal - lastLapTotalMs
  lastLapTotalMs = currentTotal

  laps.value.unshift({
    index: laps.value.length + 1,
    splitTime: `+${formatMs(split)}`,
    totalTime: formatMs(currentTotal)
  })
}

function resetTimer() {
  isRunning.value = false
  if (animFrameId) cancelAnimationFrame(animFrameId)
  elapsedMs.value = 0
  lastLapTotalMs = 0
  laps.value = []
}

onUnmounted(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId)
})
</script>

<style scoped lang="scss">
.stopwatch-view {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.view-header {
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
.timer-display-box {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
  background: var(--el-fill-color-light, #f5f7fa);
  border-radius: 12px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  .digits {
    font-family: Consolas, Monaco, monospace;
    font-size: 54px;
    font-weight: 700;
    letter-spacing: 2px;
    color: #409eff;
  }
}
.controls-row {
  display: flex;
  justify-content: center;
  gap: 16px;
}
.laps-section {
  .section-title {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .lap-tag {
    font-weight: 600;
    color: #409eff;
  }
}
</style>
