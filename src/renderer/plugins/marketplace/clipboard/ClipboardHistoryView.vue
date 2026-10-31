<template>
  <div class="clipboard-history-view">
    <div class="view-header">
      <div class="header-left">
        <h2>剪贴板历史卫士</h2>
        <span class="sub-desc">自动收集并记录最近剪贴板文本，点击即可一键重新复制回系统剪贴板</span>
      </div>
      <div class="header-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索历史记录..."
          clearable
          style="width: 220px; margin-right: 12px"
        />
        <el-button type="primary" plain @click="fetchCurrentClipboard">
          立即捕获当前剪贴板
        </el-button>
        <el-popconfirm
          title="确定清空全部历史记录吗？"
          confirm-button-text="确定"
          cancel-button-text="取消"
          @confirm="clearAll"
        >
          <template #reference>
            <el-button type="danger" plain>清空全部</el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>

    <!-- 剪贴板记录列表 -->
    <div v-if="filteredList.length > 0" class="history-list">
      <div
        v-for="item in filteredList"
        :key="item.id"
        class="history-card"
        @click="copyItem(item.content)"
      >
        <div class="card-meta">
          <span class="timestamp">{{ formatTime(item.timestamp) }}</span>
          <span class="char-count">{{ item.content.length }} 字符</span>
        </div>
        <div class="card-body">
          <pre class="clip-text">{{ item.content }}</pre>
        </div>
        <div class="card-actions" @click.stop>
          <el-button type="primary" size="small" text @click="copyItem(item.content)">
            复制
          </el-button>
          <el-button type="danger" size="small" text @click="deleteItem(item.id)">删除</el-button>
        </div>
      </div>
    </div>

    <el-empty
      v-else
      description="暂无剪贴板历史记录，可在系统任意位置复制文本或点击上方按钮进行捕获"
    />
  </div>
</template>

<script lang="ts" setup name="ClipboardHistoryView">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { pluginManager } from '@/plugin/pluginManager'

interface ClipItem {
  id: string
  content: string
  timestamp: number
}

const storage = pluginManager.getPluginStorage('clipboard-history')
const clips = ref<ClipItem[]>([])
const searchKeyword = ref('')
let pollTimer: ReturnType<typeof setInterval> | null = null

const filteredList = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return clips.value
  return clips.value.filter((item) => item.content.toLowerCase().includes(kw))
})

const formatTime = (ts: number) => {
  const date = new Date(ts)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
}

const fetchCurrentClipboard = async () => {
  try {
    const text = await window.electronSystemApi?.clipboardReadText()
    if (!text || text.trim() === '') return

    const trimmed = text.trim()
    const latest = clips.value[0]
    if (latest && latest.content === trimmed) {
      return
    }

    const newItem: ClipItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      content: trimmed,
      timestamp: Date.now()
    }

    clips.value.unshift(newItem)
    if (clips.value.length > 50) {
      clips.value = clips.value.slice(0, 50)
    }

    storage.set('clips', clips.value)
  } catch (err) {
    console.error('读取剪贴板异常:', err)
  }
}

const copyItem = async (content: string) => {
  try {
    await window.electronSystemApi?.clipboardWriteText(content)
    ElMessage.success('已复制到系统剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const deleteItem = (id: string) => {
  clips.value = clips.value.filter((i) => i.id !== id)
  storage.set('clips', clips.value)
  ElMessage.info('已移除记录')
}

const clearAll = () => {
  clips.value = []
  storage.set('clips', [])
  ElMessage.success('已清空剪贴板历史')
}

onMounted(() => {
  clips.value = storage.get<ClipItem[]>('clips', [])
  void fetchCurrentClipboard()
  pollTimer = setInterval(fetchCurrentClipboard, 2500)
})

onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
})
</script>

<style scoped lang="scss">
.clipboard-history-view {
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
  }

  .sub-desc {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .header-right {
    display: flex;
    align-items: center;
  }
}

.history-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.history-card {
  background: var(--el-bg-color, #ffffff);
  border: 1px solid var(--el-border-color-lighter, #e4e7ed);
  border-radius: 10px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  height: 160px;

  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  .card-meta {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--el-text-color-secondary);
    margin-bottom: 8px;
  }

  .card-body {
    flex: 1;
    overflow: hidden;

    .clip-text {
      margin: 0;
      font-size: 13px;
      line-height: 1.5;
      font-family: inherit;
      color: var(--el-text-color-primary);
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }

  .card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    border-top: 1px solid var(--el-border-color-lighter);
    padding-top: 8px;
  }
}
</style>
