<template>
  <div class="plugins-view">
    <div class="view-header">
      <div class="header-left">
        <h2>插件扩展中心</h2>
        <span class="sub-desc">
          已安装 {{ allPlugins.length }} 个插件，已启用 {{ activeCount }} 个
        </span>
      </div>
      <div class="header-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索插件名称、描述或标签..."
          clearable
          style="width: 260px"
        />
      </div>
    </div>

    <!-- 插件卡片网格 -->
    <div v-if="filteredPlugins.length > 0" class="plugins-grid">
      <el-card
        v-for="plugin in filteredPlugins"
        :key="plugin.metadata.id"
        shadow="hover"
        class="plugin-card"
        :class="{ 'is-disabled': !plugin.enabled }"
      >
        <div class="card-top">
          <div class="plugin-avatar">
            <el-icon :size="24" class="avatar-icon"><Box /></el-icon>
          </div>
          <div class="plugin-meta">
            <div class="plugin-name-row">
              <span class="plugin-name">{{ plugin.metadata.name }}</span>
              <el-tag size="small" type="info">v{{ plugin.metadata.version }}</el-tag>
            </div>
            <div class="plugin-author">作者: {{ plugin.metadata.author || '社区开发者' }}</div>
          </div>
          <div class="plugin-switch">
            <el-switch
              :model-value="plugin.enabled"
              inline-prompt
              active-text="开"
              inactive-text="关"
              @change="() => togglePlugin(plugin.metadata.id)"
            />
          </div>
        </div>

        <p class="plugin-description">{{ plugin.metadata.description }}</p>

        <div class="plugin-tags">
          <el-tag
            v-for="tag in plugin.metadata.tags || []"
            :key="tag"
            size="small"
            effect="plain"
            class="tag-item"
          >
            {{ tag }}
          </el-tag>
        </div>

        <div class="card-bottom">
          <span class="status-indicator">
            <span class="dot" :class="{ 'is-active': plugin.enabled }"></span>
            {{ plugin.enabled ? '运行中' : '已停用' }}
          </span>

          <div class="action-buttons">
            <el-button
              v-if="plugin.enabled && getPluginFirstRoute(plugin.metadata.id)"
              type="primary"
              size="small"
              text
              @click="openPluginView(plugin.metadata.id)"
            >
              打开功能
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <el-empty v-else description="未搜索到符合条件的插件" />
  </div>
</template>

<script lang="ts" setup name="PluginsView">
import { Box } from '@element-plus/icons-vue'
import { pluginManager } from '@/plugin/pluginManager'

const router = useRouter()
const searchKeyword = ref('')

const allPlugins = computed(() => pluginManager.allPlugins.value)
const activeCount = computed(() => allPlugins.value.filter((p) => p.enabled).length)

const filteredPlugins = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return allPlugins.value
  return allPlugins.value.filter((p) => {
    return (
      p.metadata.name.toLowerCase().includes(kw) ||
      p.metadata.description.toLowerCase().includes(kw) ||
      (p.metadata.tags || []).some((t) => t.toLowerCase().includes(kw))
    )
  })
})

async function togglePlugin(id: string) {
  await pluginManager.toggle(id)
}

function getPluginFirstRoute(pluginId: string): string | null {
  const views = pluginManager.activeViews.value.filter(
    (v) => (v as unknown as { meta?: { pluginId?: string } }).meta?.pluginId === pluginId || true
  )
  const target = views.find((v) => v.path.includes(pluginId))
  return target ? target.path : null
}

function openPluginView(pluginId: string) {
  const path = getPluginFirstRoute(pluginId)
  if (path) {
    void router.push(path)
  }
}
</script>

<style scoped lang="scss">
.plugins-view {
  padding: 24px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    margin: 0 0 6px 0;
    font-size: 20px;
    font-weight: 600;
  }

  .sub-desc {
    font-size: 13px;
    color: var(--el-text-color-secondary, #909399);
  }
}

.plugins-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.plugin-card {
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;

  &.is-disabled {
    opacity: 0.72;
    background-color: var(--el-fill-color-lighter, #fafafa);
  }

  .card-top {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .plugin-avatar {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    background-color: rgba(125, 133, 212, 0.12);
    display: flex;
    justify-content: center;
    align-items: center;
    color: $themeBase;
    flex-shrink: 0;
  }

  .plugin-meta {
    flex: 1;
    overflow: hidden;
  }

  .plugin-name-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 2px;
  }

  .plugin-name {
    font-size: 15px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .plugin-author {
    font-size: 11px;
    color: var(--el-text-color-placeholder, #a8abb2);
  }

  .plugin-description {
    font-size: 13px;
    color: var(--el-text-color-regular, #606266);
    margin: 12px 0;
    min-height: 38px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.45;
  }

  .plugin-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
    min-height: 24px;

    .tag-item {
      font-size: 11px;
    }
  }

  .card-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px solid var(--el-border-color-lighter, #ebeef5);

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--el-text-color-secondary, #909399);

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #909399;

        &.is-active {
          background-color: #67c23a;
        }
      }
    }
  }
}
</style>
