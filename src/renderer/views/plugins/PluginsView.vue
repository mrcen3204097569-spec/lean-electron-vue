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
        <el-radio-group v-model="activeTab" style="margin-right: 16px">
          <el-radio-button value="installed">📦 已安装 ({{ allPlugins.length }})</el-radio-button>
          <el-radio-button value="marketplace">🌐 插件探索市场</el-radio-button>
        </el-radio-group>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索插件名称、描述或标签..."
          clearable
          style="width: 240px"
        />
      </div>
    </div>

    <!-- 1. 已安装插件视图 -->
    <template v-if="activeTab === 'installed'">
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
                v-if="plugin.hasSettings"
                type="default"
                size="small"
                text
                :icon="Setting"
                @click="openPluginSettings(plugin.metadata.id)"
              >
                配置
              </el-button>

              <el-button
                v-if="plugin.enabled && getPluginFirstRoute(plugin.metadata.id)"
                type="primary"
                size="small"
                text
                @click="openPluginView(plugin.metadata.id)"
              >
                打开功能
              </el-button>

              <el-button
                v-if="isMarketplaceItem(plugin.metadata.id)"
                type="danger"
                size="small"
                text
                @click="handleUninstall(plugin.metadata.id)"
              >
                卸载
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <el-empty v-else description="未搜索到符合条件的已安装插件" />
    </template>

    <!-- 2. 插件探索市场视图 (Marketplace) -->
    <template v-else>
      <div class="marketplace-categories">
        <el-radio-group v-model="marketCategory" size="small">
          <el-radio-button value="all">全部插件</el-radio-button>
          <el-radio-button value="productivity">⚡ 效率提升</el-radio-button>
          <el-radio-button value="devtools">🛠️ 开发利器</el-radio-button>
          <el-radio-button value="utilities">🧰 实用工具</el-radio-button>
        </el-radio-group>
      </div>

      <div v-if="filteredMarketplace.length > 0" class="plugins-grid">
        <el-card
          v-for="item in filteredMarketplace"
          :key="item.id"
          shadow="hover"
          class="plugin-card marketplace-card"
        >
          <div class="card-top">
            <div class="plugin-avatar marketplace-avatar">
              <el-icon :size="24"><Shop /></el-icon>
            </div>
            <div class="plugin-meta">
              <div class="plugin-name-row">
                <span class="plugin-name">{{ item.name }}</span>
                <el-tag size="small" type="success">v{{ item.version }}</el-tag>
              </div>
              <div class="plugin-author">by {{ item.author }}</div>
            </div>
            <div class="market-stats">
              <span class="stars">⭐ {{ item.stars }}</span>
              <span class="downloads">📥 {{ item.downloads }}</span>
            </div>
          </div>

          <p class="plugin-description">{{ item.description }}</p>

          <div class="plugin-tags">
            <el-tag
              v-for="tag in item.tags"
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
              <el-tag v-if="isInstalled(item.id)" size="small" type="success" effect="light">
                已安装
              </el-tag>
              <el-tag v-else size="small" type="info" effect="plain">未安装</el-tag>
            </span>

            <div class="action-buttons">
              <template v-if="isInstalled(item.id)">
                <el-button
                  v-if="getPluginFirstRoute(item.id)"
                  type="primary"
                  size="small"
                  text
                  @click="openPluginView(item.id)"
                >
                  进入
                </el-button>
                <el-button type="danger" size="small" text @click="handleUninstall(item.id)">
                  卸载
                </el-button>
              </template>
              <el-button v-else type="primary" size="small" @click="handleInstall(item.id)">
                一键安装
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <el-empty v-else description="未搜索到符合条件的市场插件" />
    </template>

    <!-- 插件专属配置弹窗 (Obsidian 风格) -->
    <el-dialog
      v-model="settingsDialogVisible"
      :title="currentSettingsPluginTitle"
      width="560px"
      destroy-on-close
    >
      <component
        :is="currentSettingsComponent"
        v-if="currentSettingsComponent"
        :plugin-id="currentSettingsPluginId"
      />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup name="PluginsView">
import { shallowRef, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Box, Setting, Shop } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { pluginManager } from '@/plugin/pluginManager'
import { marketplaceCatalog } from '@/plugins/marketplace/catalog'
import {
  installMarketplacePlugin,
  uninstallMarketplacePlugin,
  isPluginInstalled
} from '@/plugins/marketplace/installer'

const router = useRouter()
const activeTab = ref<'installed' | 'marketplace'>('installed')
const marketCategory = ref<string>('all')
const searchKeyword = ref('')
const settingsDialogVisible = ref(false)
const currentSettingsPluginId = ref('')
const currentSettingsPluginTitle = ref('')
const currentSettingsComponent = shallowRef<any>(null)

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

const filteredMarketplace = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  return marketplaceCatalog.filter((item) => {
    const matchesCat = marketCategory.value === 'all' || item.category === marketCategory.value
    if (!matchesCat) return false
    if (!kw) return true
    return (
      item.name.toLowerCase().includes(kw) ||
      item.description.toLowerCase().includes(kw) ||
      item.tags.some((t) => t.toLowerCase().includes(kw))
    )
  })
})

const isInstalled = (id: string) => isPluginInstalled(id)

const isMarketplaceItem = (id: string) => {
  return marketplaceCatalog.some((item) => item.id === id)
}

const handleInstall = async (id: string) => {
  const success = await installMarketplacePlugin(id)
  if (success) {
    ElMessage.success('插件安装成功！已自动加载并激活扩展点')
  }
}

const handleUninstall = async (id: string) => {
  const success = await uninstallMarketplacePlugin(id)
  if (success) {
    ElMessage.info('插件已成功卸载并清理')
  }
}

async function togglePlugin(id: string) {
  await pluginManager.toggle(id)
}

function openPluginSettings(pluginId: string) {
  const plugin = pluginManager.getPlugin(pluginId)
  if (plugin?.settingsComponent) {
    currentSettingsPluginId.value = pluginId
    currentSettingsPluginTitle.value = `${plugin.metadata.name} - 参数配置`
    currentSettingsComponent.value = plugin.settingsComponent
    settingsDialogVisible.value = true
  }
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
  margin-bottom: 20px;

  h2 {
    margin: 0 0 6px 0;
    font-size: 20px;
    color: var(--el-text-color-primary, #303133);
  }

  .sub-desc {
    font-size: 13px;
    color: var(--el-text-color-secondary, #909399);
  }

  .header-right {
    display: flex;
    align-items: center;
  }
}

.marketplace-categories {
  margin-bottom: 20px;
}

.plugins-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.plugin-card {
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid var(--el-border-color-light, #e4e7ed);
  background-color: var(--el-bg-color, #ffffff);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }

  &.is-disabled {
    opacity: 0.65;
    background-color: var(--el-fill-color-light, #fafafa);
  }

  .card-top {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    .plugin-avatar {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: var(--el-color-primary-light-9, #ecf5ff);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--el-color-primary, #409eff);
      flex-shrink: 0;

      &.marketplace-avatar {
        background: var(--el-color-success-light-9, #f0f9eb);
        color: var(--el-color-success, #67c23a);
      }
    }

    .plugin-meta {
      flex: 1;
      min-width: 0;

      .plugin-name-row {
        display: flex;
        align-items: center;
        gap: 8px;

        .plugin-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--el-text-color-primary, #303133);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .plugin-author {
        font-size: 12px;
        color: var(--el-text-color-secondary, #909399);
        margin-top: 2px;
      }
    }

    .market-stats {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
      font-size: 11px;
      color: var(--el-text-color-secondary);
    }
  }

  .plugin-description {
    font-size: 13px;
    color: var(--el-text-color-regular, #606266);
    line-height: 1.5;
    height: 40px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0 0 14px 0;
  }

  .plugin-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
    min-height: 24px;

    .tag-item {
      border-radius: 4px;
    }
  }

  .card-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--el-border-color-lighter, #f2f3f5);
    padding-top: 12px;
    margin-top: 4px;

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--el-text-color-secondary, #909399);

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--el-color-info-light-3, #c8c9cc);

        &.is-active {
          background-color: var(--el-color-success, #67c23a);
          box-shadow: 0 0 0 2px var(--el-color-success-light-8, #e1f3d8);
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 4px;
    }
  }
}
</style>
