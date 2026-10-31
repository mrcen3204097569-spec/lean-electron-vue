<template>
  <div class="system-monitor-view">
    <div class="view-header">
      <h2>系统运行监控</h2>
      <el-button type="primary" size="small" :loading="loading" @click="fetchInfo">
        刷新监控
      </el-button>
    </div>

    <el-row :gutter="16" class="cards-row">
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>内存使用率</span>
              <el-tag :type="memPercentage > 85 ? 'danger' : 'success'">
                {{ memPercentage }}%
              </el-tag>
            </div>
          </template>
          <div class="progress-wrap">
            <el-progress type="dashboard" :percentage="memPercentage" :color="progressColors" />
          </div>
          <div class="stat-footer">
            已用: {{ formatBytes(usedMemory) }} / 总计: {{ formatBytes(totalMemory) }}
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <span>硬件与系统环境</span>
          </template>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="操作系统">
              {{ systemInfo?.platform }} ({{ systemInfo?.osRelease }})
            </el-descriptions-item>
            <el-descriptions-item label="架构">
              {{ systemInfo?.arch }}
            </el-descriptions-item>
            <el-descriptions-item label="CPU 规格" :span="2">
              {{ systemInfo?.cpuModel }}
            </el-descriptions-item>
            <el-descriptions-item label="Electron">
              v{{ systemInfo?.electronVersion }}
            </el-descriptions-item>
            <el-descriptions-item label="Node.js">
              v{{ systemInfo?.nodeVersion }}
            </el-descriptions-item>
            <el-descriptions-item label="Chromium">
              v{{ systemInfo?.chromeVersion }}
            </el-descriptions-item>
            <el-descriptions-item label="V8 引擎">
              v{{ systemInfo?.v8Version }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup name="SystemMonitorView">
import type { SystemInfo } from '../../../../shared/electronApi'

const systemInfo = ref<SystemInfo | null>(null)
const loading = ref(false)

const totalMemory = computed(() => systemInfo.value?.totalMemory ?? 0)
const freeMemory = computed(() => systemInfo.value?.freeMemory ?? 0)
const usedMemory = computed(() => totalMemory.value - freeMemory.value)
const memPercentage = computed(() => {
  if (!totalMemory.value) return 0
  return Math.round((usedMemory.value / totalMemory.value) * 100)
})

const progressColors = [
  { color: '#67c23a', percentage: 50 },
  { color: '#e6a23c', percentage: 80 },
  { color: '#f56c6c', percentage: 100 }
]

function formatBytes(bytes: number) {
  if (!bytes) return '0 GB'
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

async function fetchInfo() {
  if (!window.electronSystemApi) return
  loading.value = true
  try {
    systemInfo.value = await window.electronSystemApi.getSystemInfo()
  } catch (err) {
    console.error('获取系统信息失败:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void fetchInfo()
})
</script>

<style scoped lang="scss">
.system-monitor-view {
  padding: 20px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
}

.cards-row {
  margin-bottom: 16px;
}

.stat-card {
  height: 100%;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .progress-wrap {
    display: flex;
    justify-content: center;
    padding: 10px 0;
  }

  .stat-footer {
    text-align: center;
    font-size: 12px;
    color: var(--el-text-color-secondary, #909399);
    margin-top: 10px;
  }
}
</style>
