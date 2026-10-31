<template>
  <el-dialog
    v-model="visible"
    title="⌨️ 键盘快捷键速查备忘 (Cheat Sheet)"
    width="680px"
    class="shortcuts-dialog"
    destroy-on-close
  >
    <div class="shortcuts-container">
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索快捷键或功能名称... (例如: 窗口、Alt、搜索)"
          clearable
          :prefix-icon="Search"
        />
      </div>

      <div class="shortcuts-groups">
        <div v-for="group in filteredGroups" :key="group.category" class="shortcut-group">
          <div class="group-title">{{ group.category }}</div>
          <div class="group-list">
            <div
              v-for="item in group.items"
              :key="item.name"
              class="shortcut-item"
              @click="triggerAction(item)"
            >
              <div class="item-name">
                <span>{{ item.name }}</span>
                <span v-if="item.description" class="item-desc">
                  {{ item.description }}
                </span>
              </div>
              <div class="item-keys">
                <kbd v-for="key in item.keys" :key="key">{{ key }}</kbd>
              </div>
            </div>
          </div>
        </div>

        <el-empty v-if="filteredGroups.length === 0" description="未找到匹配的快捷键" />
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup name="KeyboardShortcutsModal">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { currentTheme, setTheme } from '@/common/theme'

interface ShortcutEntry {
  name: string
  description?: string
  keys: string[]
  action?: () => void
}

interface ShortcutCategory {
  category: string
  items: ShortcutEntry[]
}

const router = useRouter()
const visible = ref(false)
const searchQuery = ref('')

const shortcutsData: ShortcutCategory[] = [
  {
    category: '🚀 核心导航与指令',
    items: [
      {
        name: '呼出全局命令面板',
        description: '模糊搜索指令、系统页面与快速动作',
        keys: ['Ctrl', 'K'],
        action: () => window.dispatchEvent(new CustomEvent('open-command-palette'))
      },
      {
        name: '打开快捷键速查面板',
        description: '查看全软件快捷键备忘清单',
        keys: ['Ctrl', '/']
      },
      {
        name: '前往：系统仪表盘',
        keys: ['Alt', 'H'],
        action: () => router.push('/home')
      },
      {
        name: '前往：插件扩展中心',
        keys: ['Alt', 'P'],
        action: () => router.push('/plugins')
      },
      {
        name: '前往：原生能力实验室',
        keys: ['Alt', 'T'],
        action: () => router.push('/test')
      },
      {
        name: '前往：应用全局设置',
        keys: ['Alt', 'S'],
        action: () => router.push('/settings')
      }
    ]
  },
  {
    category: '🪟 视窗与桌面级操作',
    items: [
      {
        name: '一键呼出 / 隐藏应用 (系统级)',
        description: '无论处于哪个软件前台，随时唤醒本应用',
        keys: ['Ctrl', 'Shift', 'Space'],
        action: () => window.electronWindowApi?.showMainWindow()
      },
      {
        name: '切换暗黑 / 浅色模式',
        description: '即时切换深浅视觉主题',
        keys: ['Ctrl', 'Alt', 'T'],
        action: () => {
          setTheme(currentTheme.value === 'dark' ? 'light' : 'dark')
        }
      },
      {
        name: '关闭 / 退出应用或隐藏至托盘',
        keys: ['Alt', 'F4']
      }
    ]
  },
  {
    category: '⚡ 常用插件一键直达',
    items: [
      {
        name: '打开桌面快捷便签',
        keys: ['Alt', 'N'],
        action: () => router.push('/plugins/quick-notes')
      },
      {
        name: '打开开发者实用工具箱',
        keys: ['Alt', 'D'],
        action: () => router.push('/plugins/dev-toolbox')
      },
      {
        name: '打开系统硬件运行监控',
        keys: ['Alt', 'M'],
        action: () => router.push('/plugins/system-monitor')
      },
      {
        name: '打开番茄专注时钟',
        keys: ['Alt', 'C'],
        action: () => router.push('/plugins/pomodoro-timer')
      },
      {
        name: '打开剪贴板历史卫士',
        keys: ['Alt', 'V'],
        action: () => router.push('/plugins/clipboard-history')
      },
      {
        name: '打开设计调色盘',
        keys: ['Alt', 'G'],
        action: () => router.push('/plugins/color-palette')
      }
    ]
  }
]

const filteredGroups = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return shortcutsData

  return shortcutsData
    .map((group) => {
      const items = group.items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          item.keys.some((k) => k.toLowerCase().includes(q))
      )
      return {
        ...group,
        items
      }
    })
    .filter((group) => group.items.length > 0)
})

const open = () => {
  visible.value = true
  searchQuery.value = ''
}

const triggerAction = (item: ShortcutEntry) => {
  if (item.action) {
    visible.value = false
    item.action()
  }
}

const handleGlobalKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === '/') {
    e.preventDefault()
    visible.value = !visible.value
  }
}

const handleOpenEvent = () => {
  open()
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeyDown)
  window.addEventListener('open-shortcuts-modal', handleOpenEvent)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown)
  window.removeEventListener('open-shortcuts-modal', handleOpenEvent)
})

defineExpose({
  open
})
</script>

<style scoped lang="scss">
.shortcuts-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 480px;
  overflow-y: auto;
  padding-right: 4px;
}

.shortcuts-groups {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.shortcut-group {
  .group-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--el-text-color-secondary, #909399);
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.group-list {
  display: flex;
  flex-direction: column;
  background: var(--el-fill-color-light, #fafafa);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter, #f2f3f5);
  overflow: hidden;
}

.shortcut-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--el-border-color-lighter, #f2f3f5);
  cursor: pointer;
  transition: all 0.15s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--el-color-primary-light-9, rgba(64, 158, 255, 0.08));

    .item-name span:first-child {
      color: var(--el-color-primary);
    }
  }

  .item-name {
    display: flex;
    flex-direction: column;
    gap: 2px;

    span:first-child {
      font-size: 13px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .item-desc {
      font-size: 11px;
      color: var(--el-text-color-secondary);
    }
  }

  .item-keys {
    display: flex;
    align-items: center;
    gap: 4px;

    kbd {
      padding: 2px 7px;
      font-size: 11px;
      font-family: inherit;
      font-weight: 600;
      color: var(--el-text-color-regular);
      background-color: var(--el-bg-color, #ffffff);
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.08);
    }
  }
}
</style>
