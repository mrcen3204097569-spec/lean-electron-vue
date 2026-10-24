<template>
  <div class="root">
    <!-- 基础顶部菜单栏 -->
    <SystemBarTop :title="title" />

    <!-- 更新组件，可选也可以自己写更新逻辑 -->
    <SystemAppUpdate />

    <!-- 主进程窗口显示通知组件 -->
    <SystemWindowShow />

    <!-- 路由组件 -->
    <router-view v-slot="{ Component }" class="router-view">
      <transition
        enter-active-class="animate__animated animate__fadeIn"
        leave-active-class="animate__animated animate__fadeOut"
      >
        <component :is="Component" class="component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import SystemBarTop from '@/components/system/SystemBarTop.vue'
import SystemAppUpdate from '@/components/system/SystemAppUpdate.vue'
import SystemWindowShow from '@/components/system/SystemWindowShow.vue'

const route = useRoute()

const title = computed(() => {
  return route.name as string
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
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
}

.animate__animated {
  animation-duration: 0.25s !important;
}

.router-view {
  position: relative;
  height: calc(100vh - 2rem);
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
