<template>
  <aside class="c-system-sidebar" :class="{ 'is-collapsed': isCollapsed }">
    <div class="sidebar-header">
      <el-button text class="collapse-btn" @click="isCollapsed = !isCollapsed">
        <el-icon :size="16">
          <Fold v-if="!isCollapsed" />
          <Expand v-else />
        </el-icon>
      </el-button>
    </div>

    <nav class="nav-list">
      <!-- 基础内置路由 -->
      <router-link
        v-for="item in staticNavItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ 'is-active': route.path === item.path }"
      >
        <el-icon :size="18" class="nav-icon">
          <component :is="item.icon" />
        </el-icon>
        <span v-if="!isCollapsed" class="nav-title">{{ item.title }}</span>
      </router-link>

      <!-- 分隔线（当有插件视图时显示） -->
      <div v-if="pluginNavViews.length > 0" class="nav-divider">
        <span v-if="!isCollapsed" class="divider-text">插件扩展</span>
      </div>

      <!-- 插件动态注入的导航视图 -->
      <router-link
        v-for="view in pluginNavViews"
        :key="view.id"
        :to="view.path"
        class="nav-item plugin-item"
        :class="{ 'is-active': route.path === view.path }"
      >
        <el-icon :size="18" class="nav-icon">
          <Box />
        </el-icon>
        <span v-if="!isCollapsed" class="nav-title">{{ view.title }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script lang="ts" setup name="SystemSidebar">
import { Box, Expand, Fold, Grid, HomeFilled, Operation, Setting } from '@element-plus/icons-vue'
import { pluginManager } from '@/plugin/pluginManager'

const route = useRoute()
const isCollapsed = ref(false)

const staticNavItems = [
  { path: '/', title: '工作台首页', icon: HomeFilled },
  { path: '/test', title: '原生能力演示', icon: Operation },
  { path: '/plugins', title: '插件管理中心', icon: Grid },
  { path: '/settings', title: '系统设置', icon: Setting }
]

const pluginNavViews = computed(() => {
  return pluginManager.activeNavViews.value
})
</script>

<style scoped lang="scss">
.c-system-sidebar {
  width: 200px;
  height: 100%;
  background-color: var(--el-bg-color, #ffffff);
  border-right: 1px solid var(--el-border-color-lighter, #ebeef5);
  display: flex;
  flex-direction: column;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  overflow: hidden;

  &.is-collapsed {
    width: 60px;
  }
}

.sidebar-header {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 10px;
  border-bottom: 1px solid var(--el-border-color-extra-light, #f2f6fc);

  .collapse-btn {
    padding: 6px;
    color: var(--el-text-color-secondary, #909399);

    &:hover {
      color: $themeBase;
    }
  }
}

.nav-list {
  flex: 1;
  padding: 8px 6px;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 12px;
  border-radius: 6px;
  color: var(--el-text-color-regular, #606266);
  text-decoration: none;
  margin-bottom: 4px;
  transition: all 0.2s ease;
  white-space: nowrap;

  .nav-icon {
    flex-shrink: 0;
    margin-right: 12px;
  }

  .nav-title {
    font-size: 13px;
    font-weight: 500;
  }

  &:hover {
    background-color: var(--el-fill-color-light, #f5f7fa);
    color: $themeBase;
  }

  &.is-active {
    background-color: rgba(125, 133, 212, 0.12);
    color: $themeBase;
    font-weight: 600;
  }
}

.nav-divider {
  padding: 8px 12px 4px 12px;
  font-size: 11px;
  color: var(--el-text-color-placeholder, #a8abb2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
