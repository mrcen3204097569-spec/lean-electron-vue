<template>
  <div class="clipboard-widget" title="查看剪贴板历史" @click="goToClipboard">
    <span class="widget-icon">📋</span>
    <span class="widget-text">剪贴板</span>
  </div>
</template>

<script lang="ts" setup name="ClipboardWidget">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToClipboard = () => {
  void router.push('/plugins/clipboard-history')
}
</script>

<style scoped lang="scss">
.clipboard-widget {
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
