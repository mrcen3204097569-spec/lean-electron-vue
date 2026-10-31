<template>
  <div class="markdown-notebook-view">
    <div class="view-header">
      <div class="header-left">
        <h2>Markdown 实时笔记 (Markdown Notebook)</h2>
        <span class="sub-desc">双栏即时渲染排版、语法快捷注入与文件导出</span>
      </div>
      <div class="header-actions">
        <el-button size="small" @click="downloadMd">导出 .md</el-button>
        <el-button size="small" type="primary" @click="copyRenderedHtml">复制 HTML</el-button>
        <span class="stat-pill">字数: {{ wordCount }} / 行数: {{ lineCount }}</span>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="editor-toolbar">
      <el-button-group size="small">
        <el-button @click="insertSyntax('# ', '')">H1</el-button>
        <el-button @click="insertSyntax('## ', '')">H2</el-button>
        <el-button @click="insertSyntax('### ', '')">H3</el-button>
        <el-button @click="insertSyntax('**', '**')"><b>B</b></el-button>
        <el-button @click="insertSyntax('*', '*')"><i>I</i></el-button>
        <el-button @click="insertSyntax('> ', '')">Quote</el-button>
        <el-button @click="insertSyntax('```typescript\n', '\n```')">Code</el-button>
        <el-button @click="insertSyntax('- ', '')">List</el-button>
        <el-button @click="insertSyntax('[链接文字](', ')')">Link</el-button>
        <el-button @click="insertSyntax('| 标题1 | 标题2 |\n| --- | --- |\n| 内容1 | 内容2 |', '')">
          Table
        </el-button>
      </el-button-group>
    </div>

    <div class="editor-main">
      <div class="pane editor-pane">
        <div class="pane-title">源码编辑 (Markdown Source)</div>
        <el-input
          ref="textareaRef"
          v-model="mdContent"
          type="textarea"
          :rows="18"
          placeholder="在此输入 Markdown 笔记内容..."
        />
      </div>

      <div class="pane preview-pane">
        <div class="pane-title">实时预览 (Rendered HTML)</div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="rendered-content" v-html="renderedHtml"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="MarkdownNotebookView">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const STORAGE_KEY = 'LEAN_MD_NOTEBOOK_CONTENT'
const mdContent = ref(`# 🚀 欢迎使用 Markdown 实时笔记本

这是一个基于 **Vue 3 + Electron** 的开箱即用桌面笔记本。

### ✨ 特性亮点
- **即时双栏同步渲染**
- **支持快捷语法插入**
- **本地持久化无缝保存**
- **一键导出为标准 Markdown 文件**

> "Simplicity is the soul of efficiency." — Austin Freeman

\`\`\`typescript
const greeting = "Hello, Desktop Power User!";
console.log(greeting);
\`\`\`
`)

onMounted(() => {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) mdContent.value = saved
  }
})

// 简单高效的原生 Markdown 解析器
function parseSimpleMarkdown(src: string): string {
  let html = src
    // 换行转义
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // 标题
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // 引用
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    // 粗体和斜体
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // 代码块
    .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    // 单行代码
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
    // 无序列表
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    // 换行
    .replace(/\n\n/gim, '<br/><br/>')

  return html
}

const renderedHtml = computed(() => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, mdContent.value)
  }
  return parseSimpleMarkdown(mdContent.value)
})

const wordCount = computed(() => mdContent.value.length)
const lineCount = computed(() => (mdContent.value ? mdContent.value.split('\n').length : 0))

function insertSyntax(before: string, after: string) {
  mdContent.value += `${before}${after}`
}

function downloadMd() {
  const blob = new Blob([mdContent.value], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `note-${Date.now()}.md`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('Markdown 文件已导出')
}

async function copyRenderedHtml() {
  if (window.electronSystemApi) {
    await window.electronSystemApi.clipboardWriteText(renderedHtml.value)
  } else {
    await navigator.clipboard.writeText(renderedHtml.value)
  }
  ElMessage.success('已复制渲染生成的 HTML 文本')
}
</script>

<style scoped lang="scss">
.markdown-notebook-view {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .header-left {
    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    .sub-desc {
      font-size: 12px;
      color: var(--el-text-color-secondary, #909399);
    }
  }
  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    .stat-pill {
      font-size: 12px;
      font-weight: 600;
      color: #409eff;
      margin-left: 8px;
    }
  }
}
.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.editor-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.pane {
  display: flex;
  flex-direction: column;
  .pane-title {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 6px;
    color: var(--el-text-color-secondary, #909399);
  }
}
.rendered-content {
  height: 400px;
  overflow-y: auto;
  padding: 12px 16px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 4px;
  background: var(--el-fill-color-blank, #fff);
  line-height: 1.6;
  font-size: 14px;
  :deep(h1) {
    font-size: 20px;
    margin-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 4px;
  }
  :deep(h2) {
    font-size: 17px;
    margin-top: 14px;
    margin-bottom: 6px;
  }
  :deep(h3) {
    font-size: 15px;
    margin-top: 10px;
    margin-bottom: 4px;
  }
  :deep(blockquote) {
    border-left: 4px solid #409eff;
    margin: 8px 0;
    padding: 6px 12px;
    background: var(--el-fill-color-light, #f5f7fa);
    color: #606266;
  }
  :deep(pre) {
    background: #282c34;
    color: #abb2bf;
    padding: 10px;
    border-radius: 6px;
    overflow-x: auto;
    font-family: Consolas, Monaco, monospace;
    font-size: 13px;
  }
  :deep(code) {
    background: var(--el-fill-color-light, #f5f7fa);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: Consolas, Monaco, monospace;
    font-size: 13px;
    color: #e6a23c;
  }
}
</style>
