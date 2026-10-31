<template>
  <div class="diff-tool">
    <div class="action-bar">
      <el-button type="primary" size="small" @click="computeDiff">对比差异</el-button>
      <el-button size="small" @click="swapText">互换内容</el-button>
      <el-button size="small" @click="clearAll">清空</el-button>
      <span v-if="stats.compared" class="diff-stat">
        +{{ stats.added }} 行 / -{{ stats.removed }} 行 / {{ stats.unchanged }} 保持一致
      </span>
    </div>

    <el-row :gutter="12">
      <el-col :span="12">
        <div class="pane-title">原始文本 (Original)</div>
        <el-input
          v-model="originalText"
          type="textarea"
          :rows="8"
          placeholder="输入或粘贴原始内容..."
          @input="computeDiff"
        />
      </el-col>
      <el-col :span="12">
        <div class="pane-title">修改后文本 (Modified)</div>
        <el-input
          v-model="modifiedText"
          type="textarea"
          :rows="8"
          placeholder="输入或粘贴修改后内容..."
          @input="computeDiff"
        />
      </el-col>
    </el-row>

    <div v-if="diffLines.length" class="diff-result">
      <div class="result-header">逐行比对结果 (Diff View)</div>
      <div class="diff-container">
        <div v-for="(line, idx) in diffLines" :key="idx" class="diff-line" :class="line.type">
          <span class="line-badge">{{ line.prefix }}</span>
          <span class="line-content">{{ line.text || ' ' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="DiffTool">
import { ref, reactive } from 'vue'

const originalText = ref(
  '// 旧版本代码\nfunction hello() {\n  console.log("hello");\n  return true;\n}'
)
const modifiedText = ref(
  '// 新版本代码\nfunction hello(name) {\n  console.log(`hello ${name}`);\n  return true;\n}'
)

interface DiffLine {
  type: 'added' | 'removed' | 'same'
  prefix: string
  text: string
}

const diffLines = ref<DiffLine[]>([])
const stats = reactive({
  compared: false,
  added: 0,
  removed: 0,
  unchanged: 0
})

function computeDiff() {
  const orig = originalText.value.split('\n')
  const mod = modifiedText.value.split('\n')
  const result: DiffLine[] = []

  let addCount = 0
  let remCount = 0
  let sameCount = 0

  const maxLen = Math.max(orig.length, mod.length)
  for (let i = 0; i < maxLen; i++) {
    const o = orig[i]
    const m = mod[i]

    if (o === undefined) {
      result.push({ type: 'added', prefix: '+', text: m })
      addCount++
    } else if (m === undefined) {
      result.push({ type: 'removed', prefix: '-', text: o })
      remCount++
    } else if (o === m) {
      result.push({ type: 'same', prefix: ' ', text: o })
      sameCount++
    } else {
      result.push({ type: 'removed', prefix: '-', text: o })
      result.push({ type: 'added', prefix: '+', text: m })
      remCount++
      addCount++
    }
  }

  diffLines.value = result
  stats.added = addCount
  stats.removed = remCount
  stats.unchanged = sameCount
  stats.compared = true
}

function swapText() {
  const tmp = originalText.value
  originalText.value = modifiedText.value
  modifiedText.value = tmp
  computeDiff()
}

function clearAll() {
  originalText.value = ''
  modifiedText.value = ''
  diffLines.value = []
  stats.compared = false
}

computeDiff()
</script>

<style scoped lang="scss">
.diff-tool {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.action-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pane-title {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--el-text-color-secondary, #909399);
}
.diff-stat {
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
  color: #409eff;
}
.diff-result {
  margin-top: 10px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 6px;
  overflow: hidden;
}
.result-header {
  padding: 8px 12px;
  background-color: var(--el-fill-color-light, #f5f7fa);
  font-size: 13px;
  font-weight: 600;
  border-bottom: 1px solid var(--el-border-color, #dcdfe6);
}
.diff-container {
  max-height: 260px;
  overflow-y: auto;
  font-family: Consolas, Monaco, monospace;
  font-size: 13px;
}
.diff-line {
  display: flex;
  padding: 3px 8px;
  white-space: pre-wrap;
  word-break: break-all;
  &.added {
    background-color: rgba(103, 194, 58, 0.15);
    color: #67c23a;
  }
  &.removed {
    background-color: rgba(245, 108, 108, 0.15);
    color: #f56c6c;
  }
  &.same {
    color: var(--el-text-color-regular, #606266);
  }
  .line-badge {
    width: 20px;
    font-weight: bold;
    user-select: none;
  }
  .line-content {
    flex: 1;
  }
}
</style>
