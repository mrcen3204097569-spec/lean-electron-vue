<template>
  <teleport to="body">
    <transition name="palette-fade">
      <div v-if="isOpen" class="command-palette-backdrop" @click="close">
        <div class="command-palette-container" @click.stop>
          <!-- 搜索输入区 -->
          <div class="palette-header">
            <el-icon class="search-icon"><Search /></el-icon>
            <input
              ref="inputRef"
              v-model="searchQuery"
              class="palette-input"
              placeholder="键入指令、页面或快捷操作... (↑↓ 选择，Enter 执行，Esc 退出)"
              @keydown.down.prevent="moveNext"
              @keydown.up.prevent="movePrev"
              @keydown.enter.prevent="executeCurrent"
              @keydown.esc.prevent="close"
            />
            <span v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
              <el-icon><CircleClose /></el-icon>
            </span>
            <span class="esc-badge">ESC</span>
          </div>

          <!-- 命令结果列表 -->
          <div ref="listRef" class="palette-body">
            <template v-if="filteredGroups.length > 0">
              <div v-for="group in filteredGroups" :key="group.category" class="command-group">
                <div class="group-title">{{ group.category }}</div>
                <div
                  v-for="item in group.items"
                  :key="item.id"
                  :ref="(el) => setItemRef(el, item.flatIndex)"
                  class="command-item"
                  :class="{ 'is-active': selectedIndex === item.flatIndex }"
                  @mouseenter="selectedIndex = item.flatIndex"
                  @click="executeItem(item)"
                >
                  <div class="item-left">
                    <span class="item-icon">
                      <component :is="item.icon" v-if="isComponent(item.icon)" />
                      <el-icon v-else><Operation /></el-icon>
                    </span>
                    <div class="item-info">
                      <span class="item-title">{{ item.title }}</span>
                      <span v-if="item.subtitle" class="item-subtitle">{{ item.subtitle }}</span>
                    </div>
                  </div>
                  <div class="item-right">
                    <kbd v-if="item.shortcut" class="shortcut-tag">{{ item.shortcut }}</kbd>
                    <el-icon class="enter-icon"><ArrowRight /></el-icon>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="empty-state">
              <el-icon class="empty-icon"><Search /></el-icon>
              <p>未找到匹配 "{{ searchQuery }}" 的指令或页面</p>
            </div>
          </div>

          <!-- 底部提示栏 -->
          <div class="palette-footer">
            <div class="footer-tip">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd>
                导航
              </span>
              <span>
                <kbd>↵</kbd>
                执行
              </span>
              <span>
                <kbd>ESC</kbd>
                关闭
              </span>
            </div>
            <div class="footer-meta">
              <span>已注册 {{ totalItemsCount }} 个快捷操作与指令</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts" setup name="CommandPalette">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  CircleClose,
  Operation,
  ArrowRight,
  Monitor,
  Grid,
  Setting,
  Tools,
  Moon,
  Sunny,
  Refresh,
  Close,
  Promotion
} from '@element-plus/icons-vue'
import { pluginManager } from '@/plugin/pluginManager'
import { currentTheme, setTheme } from '@/common/theme'

interface PaletteItem {
  id: string
  title: string
  subtitle?: string
  category: string
  shortcut?: string
  icon?: any
  action: () => unknown
  keywords?: string[]
  flatIndex: number
}

const router = useRouter()
const isOpen = ref(false)
const searchQuery = ref('')
const selectedIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLDivElement | null>(null)
const itemRefs = ref<Map<number, HTMLElement>>(new Map())

const setItemRef = (el: any, index: number) => {
  if (el) {
    itemRefs.value.set(index, el as HTMLElement)
  }
}

const isComponent = (val: any) => typeof val === 'object' || typeof val === 'function'

const open = () => {
  isOpen.value = true
  searchQuery.value = ''
  selectedIndex.value = 0
  itemRefs.value.clear()
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const close = () => {
  isOpen.value = false
}

// 核心系统指令与页面
const systemCommands = computed<Omit<PaletteItem, 'flatIndex'>[]>(() => [
  {
    id: 'nav.home',
    title: '前往：系统仪表盘',
    subtitle: '查看整体性能、内存、CPU及各模块运行指标',
    category: '🚀 页面导航',
    shortcut: 'Alt+H',
    icon: Monitor,
    action: () => router.push('/home')
  },
  {
    id: 'nav.plugins',
    title: '前往：插件管理中心',
    subtitle: '浏览、启用、禁用及扩展本地与在线插件生态',
    category: '🚀 页面导航',
    shortcut: 'Alt+P',
    icon: Grid,
    action: () => router.push('/plugins')
  },
  {
    id: 'nav.test',
    title: '前往：原生能力实验室',
    subtitle: '对话框、剪贴板、系统原生通知与主进程 IPC 联调',
    category: '🚀 页面导航',
    shortcut: 'Alt+T',
    icon: Setting,
    action: () => router.push('/test')
  },
  {
    id: 'nav.settings',
    title: '前往：应用全局设置',
    subtitle: '配置主题模式、自启动、网络代理及更新通道',
    category: '🚀 页面导航',
    shortcut: 'Alt+S',
    icon: Tools,
    action: () => router.push('/settings')
  },
  {
    id: 'action.toggle-theme',
    title: `切换为${currentTheme.value === 'dark' ? '浅色' : '暗黑'}主题`,
    subtitle: `当前运行模式: ${currentTheme.value}`,
    category: '🛠️ 系统快捷操作',
    icon: currentTheme.value === 'dark' ? Sunny : Moon,
    action: () => setTheme(currentTheme.value === 'dark' ? 'light' : 'dark')
  },
  {
    id: 'action.minimize-tray',
    title: '最小化到系统托盘',
    subtitle: '应用后台常驻，可通过托盘图标一键恢复',
    category: '🛠️ 系统快捷操作',
    icon: Close,
    action: () => window.electronWindowApi?.closeWindow()
  },
  {
    id: 'action.check-update',
    title: '检查应用更新',
    subtitle: '向服务端请求最新版本差异分发信息',
    category: '🛠️ 系统快捷操作',
    icon: Promotion,
    action: () => window.electronAppUpdateApi?.updateCheck()
  },
  {
    id: 'action.reload',
    title: '重载前端渲染视窗',
    subtitle: '刷新页面上下文与插件挂载状态',
    category: '🛠️ 系统快捷操作',
    icon: Refresh,
    action: () => window.location.reload()
  }
])

// 插件页面导航
const pluginViewCommands = computed<Omit<PaletteItem, 'flatIndex'>[]>(() => {
  return pluginManager.activeViews.value.map((v) => ({
    id: `plugin-nav.${v.id}`,
    title: `前往插件：${v.title}`,
    subtitle: `路径: ${v.path}`,
    category: '🧩 插件页面',
    icon: v.icon || Grid,
    action: () => router.push(v.path)
  }))
})

// 插件注册的自定义指令
const pluginActionCommands = computed<Omit<PaletteItem, 'flatIndex'>[]>(() => {
  return pluginManager.activeCommands.value.map((c) => ({
    id: c.id,
    title: c.title,
    subtitle: c.category ? `插件: ${c.category}` : '已激活插件指令',
    category: c.category || '⚡ 插件扩展指令',
    shortcut: c.shortcut,
    icon: c.icon || Operation,
    action: c.action
  }))
})

// 聚合所有指令并按分类组织与模糊匹配
const filteredGroups = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const rawList = [
    ...systemCommands.value,
    ...pluginViewCommands.value,
    ...pluginActionCommands.value
  ]

  const matched = rawList.filter((item) => {
    if (!query) return true
    return (
      item.title.toLowerCase().includes(query) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(query)) ||
      item.category.toLowerCase().includes(query) ||
      (item.shortcut && item.shortcut.toLowerCase().includes(query))
    )
  })

  // 按分类分组
  const map = new Map<string, PaletteItem[]>()
  let globalIndex = 0

  for (const item of matched) {
    const enriched: PaletteItem = {
      ...item,
      flatIndex: globalIndex++
    }
    if (!map.has(enriched.category)) {
      map.set(enriched.category, [])
    }
    map.get(enriched.category)!.push(enriched)
  }

  return Array.from(map.entries()).map(([category, items]) => ({
    category,
    items
  }))
})

const totalItemsCount = computed(() => {
  return (
    systemCommands.value.length +
    pluginViewCommands.value.length +
    pluginActionCommands.value.length
  )
})

const flatMatchedItems = computed(() => {
  const list: PaletteItem[] = []
  for (const group of filteredGroups.value) {
    list.push(...group.items)
  }
  return list
})

watch(
  () => filteredGroups.value,
  () => {
    selectedIndex.value = 0
  }
)

const moveNext = () => {
  const max = flatMatchedItems.value.length
  if (max === 0) return
  selectedIndex.value = (selectedIndex.value + 1) % max
  scrollToSelected()
}

const movePrev = () => {
  const max = flatMatchedItems.value.length
  if (max === 0) return
  selectedIndex.value = (selectedIndex.value - 1 + max) % max
  scrollToSelected()
}

const scrollToSelected = () => {
  nextTick(() => {
    const el = itemRefs.value.get(selectedIndex.value)
    if (el) {
      el.scrollIntoView({ block: 'nearest' })
    }
  })
}

const executeCurrent = () => {
  const target = flatMatchedItems.value[selectedIndex.value]
  if (target) {
    executeItem(target)
  }
}

const executeItem = async (item: PaletteItem) => {
  close()
  try {
    await item.action()
  } catch (err) {
    console.error(`[CommandPalette] 执行命令 ${item.id} 失败:`, err)
  }
}

// 键盘监听全局快捷键 Ctrl+K / Cmd+K
const handleGlobalKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }
}

const handleOpenPaletteEvent = () => {
  open()
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeyDown)
  window.addEventListener('open-command-palette', handleOpenPaletteEvent)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown)
  window.removeEventListener('open-command-palette', handleOpenPaletteEvent)
})

defineExpose({
  open,
  close
})
</script>

<style lang="scss" scoped>
.command-palette-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 10vh;
}

.command-palette-container {
  width: 620px;
  max-width: 90vw;
  background: var(--el-bg-color-overlay, #ffffff);
  border: 1px solid var(--el-border-color-light, #ebeef5);
  border-radius: 14px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: palette-slide-down 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.palette-header {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid var(--el-border-color-lighter, #f2f3f5);
  background: var(--el-bg-color, #ffffff);

  .search-icon {
    font-size: 20px;
    color: var(--el-text-color-secondary, #909399);
    margin-right: 12px;
  }

  .palette-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 15px;
    background: transparent;
    color: var(--el-text-color-primary, #303133);

    &::placeholder {
      color: var(--el-text-color-placeholder, #a8abb2);
      font-size: 14px;
    }
  }

  .clear-btn {
    cursor: pointer;
    color: var(--el-text-color-placeholder);
    display: flex;
    align-items: center;
    margin-right: 8px;

    &:hover {
      color: var(--el-text-color-primary);
    }
  }

  .esc-badge {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--el-fill-color-light, #f5f7fa);
    color: var(--el-text-color-secondary, #909399);
    font-family: inherit;
    font-weight: 600;
  }
}

.palette-body {
  max-height: 380px;
  overflow-y: auto;
  padding: 10px 12px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color);
    border-radius: 3px;
  }
}

.command-group {
  margin-bottom: 12px;

  .group-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--el-text-color-secondary, #909399);
    padding: 6px 10px 4px 10px;
  }
}

.command-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;

  .item-left {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 12px;

    .item-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: var(--el-fill-color-light, #f5f7fa);
      color: var(--el-text-color-primary);
      font-size: 15px;
      flex-shrink: 0;
    }

    .item-info {
      display: flex;
      flex-direction: column;
      min-width: 0;

      .item-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary, #303133);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .item-subtitle {
        font-size: 12px;
        color: var(--el-text-color-secondary, #909399);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .item-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    .shortcut-tag {
      font-size: 11px;
      font-family: monospace;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--el-fill-color, #f0f2f5);
      color: var(--el-text-color-regular);
      border: 1px solid var(--el-border-color-lighter);
    }

    .enter-icon {
      font-size: 13px;
      color: var(--el-text-color-placeholder);
      opacity: 0;
      transition: opacity 0.15s ease;
    }
  }

  &:hover,
  &.is-active {
    background: var(--el-color-primary-light-9, rgba(64, 158, 255, 0.1));

    .item-left .item-icon {
      background: var(--el-color-primary);
      color: #ffffff;
    }

    .item-left .item-title {
      color: var(--el-color-primary);
    }

    .item-right .enter-icon {
      opacity: 1;
      color: var(--el-color-primary);
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--el-text-color-secondary);

  .empty-icon {
    font-size: 36px;
    margin-bottom: 12px;
    color: var(--el-text-color-placeholder);
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

.palette-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  background: var(--el-fill-color-light, #fafafa);
  border-top: 1px solid var(--el-border-color-lighter, #f2f3f5);
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);

  .footer-tip {
    display: flex;
    gap: 12px;

    kbd {
      padding: 1px 5px;
      border-radius: 3px;
      background: var(--el-bg-color, #ffffff);
      border: 1px solid var(--el-border-color);
      font-family: inherit;
      font-weight: 600;
      margin-right: 4px;
    }
  }
}

.palette-fade-enter-active,
.palette-fade-leave-active {
  transition: opacity 0.15s ease;
}

.palette-fade-enter-from,
.palette-fade-leave-to {
  opacity: 0;
}

@keyframes palette-slide-down {
  from {
    transform: translateY(-20px) scale(0.98);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
</style>
