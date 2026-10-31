<template>
  <div class="scratchpad-tool">
    <div class="action-bar">
      <el-button type="primary" size="small" @click="saveNow">保存</el-button>
      <el-button size="small" @click="downloadTxt">导出为 .txt</el-button>
      <el-button size="small" @click="copyAll">复制全部</el-button>
      <el-button size="small" type="danger" plain @click="clearContent">清空</el-button>
      <span class="save-status">{{ lastSavedStr }}</span>
    </div>

    <el-input
      v-model="content"
      type="textarea"
      :rows="12"
      placeholder="这是一个本地持久化临时草稿纸，随手粘贴、临时记事或调试代码，内容自动保存在本地..."
      @input="autoSave"
    />
  </div>
</template>

<script lang="ts" setup name="ScratchpadTool">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const STORAGE_KEY = 'LEAN_DEV_SCRATCHPAD'
const content = ref('')
const lastSavedStr = ref('')

onMounted(() => {
  if (typeof localStorage !== 'undefined') {
    content.value = localStorage.getItem(STORAGE_KEY) || '// 临时代码与灵感便签草稿纸\n'
    lastSavedStr.value = '已加载本地存档'
  }
})

let saveTimer: ReturnType<typeof setTimeout> | null = null

function autoSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveNow()
  }, 500)
}

function saveNow() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, content.value)
    lastSavedStr.value = `保存于 ${new Date().toLocaleTimeString()}`
  }
}

async function copyAll() {
  if (!content.value) return
  if (window.electronSystemApi) {
    await window.electronSystemApi.clipboardWriteText(content.value)
  } else {
    await navigator.clipboard.writeText(content.value)
  }
  ElMessage.success('已复制')
}

function downloadTxt() {
  const blob = new Blob([content.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `scratchpad-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('草稿文件已下载')
}

function clearContent() {
  content.value = ''
  saveNow()
}
</script>

<style scoped lang="scss">
.scratchpad-tool {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.action-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  .save-status {
    margin-left: auto;
    font-size: 12px;
    color: var(--el-text-color-secondary, #909399);
  }
}
</style>
