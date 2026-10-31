<template>
  <div class="root">
    <!-- 顶部自定义标题栏 -->
    <SystemBarTop :title="title" />

    <!-- 中间主体：侧边栏 + 主内容区 -->
    <div class="main-body">
      <SystemSidebar v-if="!isDialogMode" />

      <div class="content-wrapper">
        <!-- 顶部标签页工作台 (TabBar) -->
        <SystemTabBar v-if="!isDialogMode" />

        <main class="content-container">
          <router-view v-slot="{ Component }" class="router-view">
            <transition
              enter-active-class="animate__animated animate__fadeIn"
              leave-active-class="animate__animated animate__fadeOut"
              mode="out-in"
            >
              <component :is="Component" class="component" />
            </transition>
          </router-view>
        </main>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <SystemBarBottom v-if="!isDialogMode" />

    <!-- 自动更新组件 -->
    <SystemAppUpdate />

    <!-- 主窗口就绪显示通知组件 -->
    <SystemWindowShow />

    <!-- 全局命令面板 (Ctrl+K) -->
    <CommandPalette />
  </div>
</template>

<script setup lang="ts">
import SystemBarTop from '@/components/system/SystemBarTop.vue'
import SystemSidebar from '@/components/system/SystemSidebar.vue'
import SystemTabBar from '@/components/system/SystemTabBar.vue'
import SystemBarBottom from '@/components/system/SystemBarBottom.vue'
import SystemAppUpdate from '@/components/system/SystemAppUpdate.vue'
import SystemWindowShow from '@/components/system/SystemWindowShow.vue'
import CommandPalette from '@/components/system/CommandPalette.vue'

const route = useRoute()

const isDialogMode = computed(() => {
  return route.query.dialog === '1' || route.meta?.isDialog === true
})

const title = computed(() => {
  return (route.meta?.title as string) || (route.name as string) || '应用程序'
})

const stopLog = ref<(() => void) | null>(null)

onMounted(() => {
  stopLog.value = window.electronLogApi?.log((text) => console.log(text)) ?? null
})

onUnmounted(() => {
  stopLog.value?.()
  stopLog.value = null
})
</script>

<style scoped lang="scss">
.root {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--el-bg-color-page, #f5f7fa);
}

.main-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.content-container {
  flex: 1;
  height: 100%;
  overflow-y: auto;
  position: relative;
  background-color: var(--el-bg-color-page, #f5f7fa);
}

.router-view {
  min-height: 100%;
}

.animate__animated {
  animation-duration: 0.2s !important;
}
</style>
