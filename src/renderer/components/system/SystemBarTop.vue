<template>
  <div class="c-system-bar-top">
    <div class="brand">
      <img src="/vite.svg" alt="logo" class="brand__icon" />
      <span class="brand__name">LeanApp</span>
    </div>

    <div class="title" @dblclick="windowIsMax ? restoreWindow() : maximizeWindow()">
      {{ title }}
    </div>

    <!-- 命令面板快捷呼出胶囊 -->
    <div class="search-capsule" @click="openCommandPalette">
      <el-icon class="search-capsule__icon"><Search /></el-icon>
      <span class="search-capsule__text">搜索或执行指令...</span>
      <kbd class="search-capsule__kbd">Ctrl K</kbd>
    </div>

    <div class="actions">
      <!-- 插件注入的快捷操作 -->
      <div
        v-for="item in pluginManager.activeHeaderActions.value"
        :key="item.id"
        class="actions__plugin-item"
      >
        <el-tooltip :content="item.title" placement="bottom">
          <el-button text plain size="small" @click="item.action">
            <component :is="item.icon" v-if="item.icon" />
            <span v-else>{{ item.title }}</span>
          </el-button>
        </el-tooltip>
      </div>

      <div class="options">
        <div class="options__item minimize">
          <el-button text plain :icon="Minus" @click="minimizeWindow"></el-button>
        </div>

        <div v-if="!windowIsMax" class="options__item maximize">
          <el-button text plain :icon="FullScreen" @click="maximizeWindow"></el-button>
        </div>

        <div v-if="windowIsMax" class="options__item maximize">
          <el-button text plain :icon="CopyDocument" @click="restoreWindow"></el-button>
        </div>

        <div class="options__item close">
          <el-button text plain :icon="Close" @click="closeWindow"></el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="SystemBarTop">
import { Close, CopyDocument, FullScreen, Minus, Search } from '@element-plus/icons-vue'
import { pluginManager } from '@/plugin/pluginManager'

withDefaults(defineProps<{ title?: string }>(), {
  title: '应用程序'
})

const windowIsMax = ref(false)
const stops: Array<() => void> = []

const openCommandPalette = () => {
  window.dispatchEvent(new CustomEvent('open-command-palette'))
}

/**
 * 最大化窗口
 */
const maximizeWindow = () => {
  window.electronWindowApi?.maximizeWindow()
}

/**
 * 最小化窗口
 */
const minimizeWindow = () => {
  window.electronWindowApi?.minimizeWindow()
}

/**
 * 恢复窗口
 */
const restoreWindow = () => {
  window.electronWindowApi?.restoreWindow()
}

/**
 * 关闭窗口
 */
const closeWindow = () => {
  window.electronWindowApi?.closeWindow()
}

onMounted(() => {
  const api = window.electronWindowApi
  if (!api) return
  stops.push(
    api.onMaximizeWindow(() => {
      windowIsMax.value = true
    })
  )
  stops.push(
    api.onUnMaximizeWindow(() => {
      windowIsMax.value = false
    })
  )
})

onUnmounted(() => {
  for (const stop of stops) stop()
  stops.length = 0
})
</script>

<style scoped lang="scss">
.c-system-bar-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--el-bg-color, #fff);
  color: var(--el-text-color-primary, #303133);
  height: 36px;
  width: 100%;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  user-select: none;
  z-index: 1000;
}

.brand {
  -webkit-app-region: drag;
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 6px;

  &__icon {
    width: 18px;
    height: 18px;
  }

  &__name {
    font-size: 13px;
    font-weight: 600;
    color: $themeBase;
  }
}

.title {
  -webkit-app-region: drag;
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: var(--el-text-color-regular, #606266);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 8px;
}

.search-capsule {
  -webkit-app-region: no-drag;
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--el-fill-color-light, #f5f7fa);
  border: 1px solid var(--el-border-color-lighter, #e4e7ed);
  border-radius: 12px;
  padding: 2px 10px;
  margin-right: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--el-fill-color, #ebeef5);
    border-color: var(--el-color-primary-light-5);
  }

  &__icon {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__text {
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }

  &__kbd {
    font-size: 10px;
    padding: 0 4px;
    border-radius: 3px;
    background: var(--el-bg-color, #fff);
    border: 1px solid var(--el-border-color);
    color: var(--el-text-color-placeholder);
    font-family: inherit;
    font-weight: 600;
  }
}

.actions {
  -webkit-app-region: no-drag;
  display: flex;
  align-items: center;

  &__plugin-item {
    margin-right: 4px;
  }
}

.options {
  display: flex;
  align-items: center;

  .options__item {
    margin-right: 4px;
  }
}
</style>
