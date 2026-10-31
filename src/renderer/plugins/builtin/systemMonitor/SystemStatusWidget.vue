<template>
  <div class="system-status-widget" :title="tooltip">
    <el-icon :size="12" class="icon"><Cpu /></el-icon>
    <span>内存: {{ memPercent }}%</span>
  </div>
</template>

<script lang="ts" setup name="SystemStatusWidget">
import { Cpu } from '@element-plus/icons-vue'

const memPercent = ref(0)
const tooltip = ref('获取系统信息中...')
let timer: ReturnType<typeof setInterval> | null = null

const updateMem = async () => {
  if (!window.electronSystemApi) return
  try {
    const info = await window.electronSystemApi.getSystemInfo()
    const used = info.totalMemory - info.freeMemory
    const percent = Math.round((used / info.totalMemory) * 100)
    memPercent.value = percent
    tooltip.value = `${info.cpuModel} | 平台: ${info.platform} ${info.arch} | 内存使用: ${percent}%`
  } catch (e) {
    console.error('获取系统信息失败', e)
  }
}

onMounted(() => {
  void updateMem()
  timer = setInterval(updateMem, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped lang="scss">
.system-status-widget {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 0 4px;
  border-radius: 3px;

  &:hover {
    background-color: var(--el-fill-color-light, #f5f7fa);
    color: $themeBase;
  }

  .icon {
    color: $themeBase;
  }
}
</style>
