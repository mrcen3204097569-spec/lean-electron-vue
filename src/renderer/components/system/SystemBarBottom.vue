<template>
  <footer class="c-system-bar-bottom">
    <div class="section-left">
      <!-- 网络状态指示灯与延迟测速 -->
      <div
        class="status-item network-status"
        :title="`网络状态: ${isOnline ? '在线' : '离线'}, 往返延迟: ${latency}ms`"
      >
        <span class="status-dot" :class="{ 'is-online': isOnline }"></span>
        <span class="status-text">{{ isOnline ? `${latency}ms` : '离线' }}</span>
      </div>

      <!-- 实时内存占用指示 -->
      <div v-if="memoryText" class="status-item memory-badge" :title="`主进程内存: ${memoryText}`">
        <span class="status-text">⚡ {{ memoryText }}</span>
      </div>

      <!-- 激活插件数量指示 -->
      <div class="status-item plugin-badge" title="已激活插件数量">
        <el-icon :size="12" class="status-icon"><Grid /></el-icon>
        <span class="status-text">插件: {{ activePluginCount }}</span>
      </div>

      <!-- 插件动态注入的左侧组件 -->
      <div
        v-for="item in pluginManager.activeStatusBarLeft.value"
        :key="item.id"
        class="status-item plugin-custom-item"
      >
        <component :is="item.component" />
      </div>
    </div>

    <div class="section-right">
      <!-- 插件动态注入的右侧组件 -->
      <div
        v-for="item in pluginManager.activeStatusBarRight.value"
        :key="item.id"
        class="status-item plugin-custom-item"
      >
        <component :is="item.component" />
      </div>

      <!-- 快捷键速查入口 -->
      <div
        class="status-item shortcuts-entry"
        title="键盘快捷键速查 (Ctrl+/)"
        @click="openShortcutsModal"
      >
        <span class="status-text">⌨️ 快捷键</span>
      </div>

      <!-- 运行环境与版本号 -->
      <div class="status-item env-badge">
        <span class="status-text">{{ isDev ? 'DEV' : 'PROD' }}</span>
      </div>
      <div class="status-item version-badge">
        <span class="status-text">v2.0.0</span>
      </div>

      <!-- 高精度本地时钟 -->
      <div class="status-item clock-badge" :title="fullDateStr">
        <span class="status-text">🕒 {{ clockStr }}</span>
      </div>
    </div>
  </footer>
</template>

<script lang="ts" setup name="SystemBarBottom">
import { Grid } from '@element-plus/icons-vue'
import { pluginManager } from '@/plugin/pluginManager'

const isOnline = ref(window.navigator.onLine)
const isDev = import.meta.env.DEV
const latency = ref(15)
const memoryText = ref('')
const clockStr = ref('')
const fullDateStr = ref('')

let pingTimer: ReturnType<typeof setInterval> | null = null
let clockTimer: ReturnType<typeof setInterval> | null = null

const activePluginCount = computed(() => {
  return pluginManager.allPlugins.value.filter((p) => p.enabled).length
})

const updateOnlineStatus = () => {
  isOnline.value = window.navigator.onLine
}

const updateClock = () => {
  const now = new Date()
  clockStr.value = now.toTimeString().split(' ')[0]
  fullDateStr.value = now.toLocaleString()
}

const checkLatencyAndMemory = async () => {
  if (isOnline.value) {
    const t0 = performance.now()
    try {
      await fetch('/vite.svg?t=' + Date.now(), { method: 'HEAD', cache: 'no-store' })
      latency.value = Math.max(1, Math.round(performance.now() - t0))
    } catch {
      latency.value = 20
    }
  }

  // 内存检查
  const sysApi = window.electronSystemApi
  if (sysApi?.getProcessMemory) {
    try {
      const mem = await sysApi.getProcessMemory()
      const mb = Math.round(mem.main.rss / 1024 / 1024)
      memoryText.value = `${mb}MB`
    } catch {
      // 容错
    }
  }
}

const openShortcutsModal = () => {
  window.dispatchEvent(new CustomEvent('open-shortcuts-modal'))
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
  checkLatencyAndMemory()
  pingTimer = setInterval(checkLatencyAndMemory, 5000)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
  if (clockTimer) clearInterval(clockTimer)
  if (pingTimer) clearInterval(pingTimer)
})
</script>

<style scoped lang="scss">
.c-system-bar-bottom {
  height: 24px;
  background-color: var(--el-bg-color, #ffffff);
  border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  font-size: 11px;
  color: var(--el-text-color-secondary, #909399);
  user-select: none;
  z-index: 1000;
}

.section-left,
.section-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;

  &.shortcuts-entry {
    cursor: pointer;
    padding: 0 4px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      background: var(--el-fill-color-light);
      color: var(--el-color-primary);
    }
  }
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: #f56c6c;

  &.is-online {
    background-color: #67c23a;
  }
}

.status-icon {
  margin-right: 2px;
}

.status-text {
  font-variant-numeric: tabular-nums;
}

.env-badge {
  background-color: rgba(125, 133, 212, 0.15);
  color: $themeBase;
  padding: 1px 4px;
  border-radius: 3px;
  font-weight: 600;
}
</style>
