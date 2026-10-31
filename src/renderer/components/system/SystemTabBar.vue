<template>
  <div class="system-tab-bar">
    <div ref="scrollContainerRef" class="tabs-scroll-area" @wheel="handleWheel">
      <div
        v-for="tab in tabStore.tabs"
        :key="tab.id"
        class="tab-item"
        :class="{ 'is-active': tabStore.activeTabId === tab.id }"
        @click="tabStore.setActiveTab(tab.id, router)"
        @contextmenu.prevent="(e) => openContextMenu(e, tab)"
      >
        <span class="tab-icon">
          <component :is="tab.icon" v-if="isComponent(tab.icon)" />
          <el-icon v-else-if="typeof tab.icon === 'string' && iconMap[tab.icon]">
            <component :is="iconMap[tab.icon]" />
          </el-icon>
          <el-icon v-else><Document /></el-icon>
        </span>

        <span class="tab-title">{{ tab.title }}</span>

        <span
          v-if="tab.closable"
          class="tab-close-btn"
          title="关闭标签页"
          @click.stop="tabStore.closeTab(tab.id, router)"
        >
          <el-icon><Close /></el-icon>
        </span>
      </div>
    </div>

    <div class="tabs-actions">
      <el-dropdown trigger="click" @command="handleCommand">
        <span class="action-btn">
          <el-icon><MoreFilled /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="reload">
              <el-icon><Refresh /></el-icon>
              刷新页面
            </el-dropdown-item>
            <el-dropdown-item command="close-others">
              <el-icon><Close /></el-icon>
              关闭其他标签页
            </el-dropdown-item>
            <el-dropdown-item command="close-all">
              <el-icon><Delete /></el-icon>
              关闭全部标签页
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script lang="ts" setup name="SystemTabBar">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Document,
  Close,
  MoreFilled,
  Refresh,
  Delete,
  Monitor,
  Grid,
  Setting,
  Tools,
  Cpu,
  Notebook
} from '@element-plus/icons-vue'
import { useTabStore, type TabItem } from '@/store/tab.store'

const iconMap: Record<string, any> = {
  Monitor,
  Grid,
  Setting,
  Tools,
  Cpu,
  Notebook
}

const route = useRoute()
const router = useRouter()
const tabStore = useTabStore()
const scrollContainerRef = ref<HTMLDivElement | null>(null)

const isComponent = (val: any) => typeof val === 'object' || typeof val === 'function'

// 监听路由动态追加并激活 Tab
watch(
  () => route.fullPath,
  () => {
    tabStore.addTab(route)
  },
  { immediate: true }
)

const handleWheel = (e: WheelEvent) => {
  if (scrollContainerRef.value && e.deltaY !== 0) {
    scrollContainerRef.value.scrollLeft += e.deltaY
  }
}

const handleCommand = (command: string) => {
  if (command === 'reload') {
    window.location.reload()
  } else if (command === 'close-others') {
    tabStore.closeOthers(tabStore.activeTabId, router)
  } else if (command === 'close-all') {
    tabStore.closeAll(router)
  }
}

const openContextMenu = (_e: MouseEvent, tab: TabItem) => {
  tabStore.setActiveTab(tab.id, router)
}

onMounted(() => {
  tabStore.addTab(route)
})
</script>

<style scoped lang="scss">
.system-tab-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 34px;
  background-color: var(--el-bg-color, #ffffff);
  border-bottom: 1px solid var(--el-border-color-lighter, #e4e7ed);
  user-select: none;
  overflow: hidden;
  padding: 0 4px;
  flex-shrink: 0;
}

.tabs-scroll-area {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none; // Firefox
  &::-webkit-scrollbar {
    display: none; // Chrome/Safari
  }
}

.tab-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 10px;
  border-radius: 6px;
  font-size: 12px;
  color: var(--el-text-color-regular, #606266);
  background: var(--el-fill-color-light, #f5f7fa);
  border: 1px solid var(--el-border-color-lighter, #e4e7ed);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;

  .tab-icon {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: var(--el-text-color-secondary, #909399);
  }

  .tab-title {
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tab-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    font-size: 10px;
    color: var(--el-text-color-secondary, #909399);
    transition: all 0.15s ease;

    &:hover {
      background: var(--el-fill-color-dark, #dcdfe6);
      color: var(--el-color-danger, #f56c6c);
    }
  }

  &:hover {
    background: var(--el-fill-color, #ebeef5);
    color: var(--el-text-color-primary, #303133);
  }

  &.is-active {
    background: var(--el-bg-color, #ffffff);
    color: var(--el-color-primary, #409eff);
    border-color: var(--el-color-primary-light-7, #c6e2ff);
    font-weight: 500;
    box-shadow: 0 1px 4px rgba(64, 158, 255, 0.12);

    .tab-icon {
      color: var(--el-color-primary, #409eff);
    }

    .tab-close-btn {
      color: var(--el-text-color-secondary, #909399);
    }
  }
}

.tabs-actions {
  display: flex;
  align-items: center;
  padding: 0 4px;

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;
    color: var(--el-text-color-secondary);
    transition: all 0.15s ease;

    &:hover {
      background: var(--el-fill-color-light);
      color: var(--el-text-color-primary);
    }
  }
}
</style>
