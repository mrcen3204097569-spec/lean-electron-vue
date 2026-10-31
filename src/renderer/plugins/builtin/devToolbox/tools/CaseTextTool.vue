<template>
  <div class="case-text-tool">
    <div class="stats-row">
      <el-tag type="info">字符数: {{ stats.chars }}</el-tag>
      <el-tag type="info">单词数: {{ stats.words }}</el-tag>
      <el-tag type="info">行数: {{ stats.lines }}</el-tag>
      <el-tag type="info">字节数 (UTF-8): {{ stats.bytes }}</el-tag>
    </div>

    <div class="input-section">
      <div class="area-label">输入文本:</div>
      <el-input
        v-model="sourceText"
        type="textarea"
        :rows="4"
        placeholder="输入要统计或转换格式的字符串..."
      />
    </div>

    <div class="conversion-grid">
      <div v-for="item in caseFormats" :key="item.name" class="case-card">
        <div class="card-head">
          <span class="name">{{ item.name }}</span>
          <el-button link type="primary" size="small" @click="copyCase(item.fn(sourceText))">
            复制
          </el-button>
        </div>
        <div class="card-result">{{ item.fn(sourceText) || '-' }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="CaseTextTool">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const sourceText = ref('lean electron template project')

const stats = computed(() => {
  const t = sourceText.value
  const chars = t.length
  const words = t.trim() ? t.trim().split(/\s+/).length : 0
  const lines = t ? t.split('\n').length : 0
  const bytes = new TextEncoder().encode(t).length
  return { chars, words, lines, bytes }
})

function splitWords(str: string): string[] {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

const caseFormats = [
  {
    name: 'camelCase (驼峰命名)',
    fn: (s: string) => {
      const words = splitWords(s)
      return words
        .map((w, i) =>
          i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        )
        .join('')
    }
  },
  {
    name: 'PascalCase (大驼峰)',
    fn: (s: string) => {
      const words = splitWords(s)
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
    }
  },
  {
    name: 'kebab-case (连字符/短横线)',
    fn: (s: string) =>
      splitWords(s)
        .map((w) => w.toLowerCase())
        .join('-')
  },
  {
    name: 'snake_case (下划线)',
    fn: (s: string) =>
      splitWords(s)
        .map((w) => w.toLowerCase())
        .join('_')
  },
  {
    name: 'CONSTANT_CASE (全大写常量)',
    fn: (s: string) =>
      splitWords(s)
        .map((w) => w.toUpperCase())
        .join('_')
  },
  {
    name: 'UPPERCASE (大写)',
    fn: (s: string) => s.toUpperCase()
  },
  {
    name: 'lowercase (小写)',
    fn: (s: string) => s.toLowerCase()
  }
]

async function copyCase(val: string) {
  if (!val) return
  if (window.electronSystemApi) {
    await window.electronSystemApi.clipboardWriteText(val)
  } else {
    await navigator.clipboard.writeText(val)
  }
  ElMessage.success('已复制')
}
</script>

<style scoped lang="scss">
.case-text-tool {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.area-label {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--el-text-color-secondary, #909399);
}
.conversion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
}
.case-card {
  padding: 8px 12px;
  background: var(--el-fill-color-light, #f5f7fa);
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 6px;
  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    .name {
      font-size: 12px;
      font-weight: 600;
      color: #409eff;
    }
  }
  .card-result {
    font-family: Consolas, Monaco, monospace;
    font-size: 13px;
    word-break: break-all;
    user-select: all;
  }
}
</style>
