<template>
  <footer class="c-system-bar-bottom">
    <div class="section-left">
      <!-- 网络状态指示灯 -->
      <div class="status-item network-status" :title="isOnline ? '网络正常' : '网络已断开'">
        <span class="status-dot" :class="{ 'is-online': isOnline }"></span>
        <span class="status-text">{{ isOnline ? '在线' : '离线' }}</span>
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

      <!-- 运行环境与版本号 -->
      <div class="status-item env-badge">
        <span class="status-text">{{ isDev ? 'DEV' : 'PROD' }}</span>
      </div>
      <div class="status-item version-badge">
        <span class="status-text">v2.0.0</span>
      </div>
    </div>
  </footer>
</template>

<script lang="ts" setup name="SystemBarBottom">
import { Grid } from '@element-plus/icons-vue'
import { pluginManager } from '@/plugin/pluginManager'

const isOnline = ref(window.navigator.onLine)
const isDev = import.meta.env.DEV

const activePluginCount = computed(() => {
  return pluginManager.allPlugins.value.filter((p) => p.enabled).length
})

const updateOnlineStatus = () => {
  isOnline.value = window.navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
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
