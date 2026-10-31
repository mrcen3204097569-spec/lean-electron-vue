<template>
  <div class="pomodoro-widget" title="番茄钟工作状态" @click="goToPomodoro">
    <span class="widget-icon">🍅</span>
    <span class="widget-text">番茄时钟</span>
  </div>
</template>

<script lang="ts" setup name="PomodoroWidget">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToPomodoro = () => {
  void router.push('/plugins/pomodoro-timer')
}
</script>

<style scoped lang="scss">
.pomodoro-widget {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 0 4px;
  font-size: 11px;
  color: var(--el-text-color-regular);
  transition: all 0.2s ease;

  &:hover {
    color: var(--el-color-primary);
  }

  .widget-icon {
    font-size: 12px;
  }
}
</style>
