<template>
  <div class="snippet-vault-view">
    <div class="view-header">
      <div class="header-left">
        <h2>代码片段金库 (Snippet Vault)</h2>
        <span class="sub-desc">跨语言常用代码片段、脚手架与常用配置集中管理</span>
      </div>
      <el-button type="primary" size="small" @click="openCreateDialog">+ 新建片段</el-button>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索代码片段标题或关键词..."
        style="width: 260px"
        clearable
      />
      <el-radio-group v-model="selectedLang" size="small">
        <el-radio-button value="all">全部 (All)</el-radio-button>
        <el-radio-button value="typescript">TypeScript</el-radio-button>
        <el-radio-button value="vue">Vue</el-radio-button>
        <el-radio-button value="css">CSS / SCSS</el-radio-button>
        <el-radio-button value="shell">Shell</el-radio-button>
        <el-radio-button value="sql">SQL</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 片段卡片网格 -->
    <div v-if="filteredSnippets.length" class="snippets-grid">
      <div v-for="snippet in filteredSnippets" :key="snippet.id" class="snippet-card">
        <div class="card-header">
          <div class="title-wrap">
            <span class="title">{{ snippet.title }}</span>
            <el-tag size="small" :type="getTagType(snippet.language)">
              {{ snippet.language }}
            </el-tag>
          </div>
          <div class="card-actions">
            <el-button link type="primary" size="small" @click="copyCode(snippet.code)">
              复制代码
            </el-button>
            <el-button link type="danger" size="small" @click="deleteSnippet(snippet.id)">
              删除
            </el-button>
          </div>
        </div>
        <div v-if="snippet.description" class="card-desc">{{ snippet.description }}</div>
        <pre class="code-preview"><code>{{ snippet.code }}</code></pre>
      </div>
    </div>
    <div v-else class="empty-state">
      <el-empty description="暂无匹配的代码片段" />
    </div>

    <!-- 新建对话框 -->
    <el-dialog v-model="showDialog" title="新建代码片段" width="540px">
      <el-form label-position="top">
        <el-form-item label="片段标题">
          <el-input v-model="form.title" placeholder="如：防抖函数封装 / Vue3 组合式语法" />
        </el-form-item>
        <el-form-item label="编程语言">
          <el-select v-model="form.language" style="width: 100%">
            <el-option label="TypeScript" value="typescript" />
            <el-option label="Vue" value="vue" />
            <el-option label="CSS / SCSS" value="css" />
            <el-option label="Shell" value="shell" />
            <el-option label="SQL" value="sql" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述备注 (可选)">
          <el-input v-model="form.description" placeholder="说明用途或使用注意事项" />
        </el-form-item>
        <el-form-item label="代码内容">
          <el-input v-model="form.code" type="textarea" :rows="6" placeholder="粘贴或编写代码..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="saveSnippet">保存片段</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup name="SnippetVaultView">
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

interface Snippet {
  id: string
  title: string
  language: string
  description?: string
  code: string
  createdAt: number
}

const STORAGE_KEY = 'LEAN_SNIPPET_VAULT_ITEMS'
const searchQuery = ref('')
const selectedLang = ref('all')
const showDialog = ref(false)

const form = reactive({
  title: '',
  language: 'typescript',
  description: '',
  code: ''
})

const defaultSnippets: Snippet[] = [
  {
    id: 's-1',
    title: '防抖函数 (Debounce)',
    language: 'typescript',
    description: '标准带泛型的防抖包装器，防止短时间内频繁触发',
    code: 'export function debounce<T extends (...args: any[]) => void>(fn: T, delay = 300) {\n  let timer: any = null\n  return (...args: Parameters<T>) => {\n    if (timer) clearTimeout(timer)\n    timer = setTimeout(() => fn(...args), delay)\n  }\n}',
    createdAt: Date.now() - 3600000
  },
  {
    id: 's-2',
    title: 'Vue 3 useWindowSize 组合式函数',
    language: 'vue',
    description: '监听视窗宽高动态响应',
    code: 'export function useWindowSize() {\n  const width = ref(window.innerWidth)\n  const height = ref(window.innerHeight)\n  const update = () => {\n    width.value = window.innerWidth\n    height.value = window.innerHeight\n  }\n  onMounted(() => window.addEventListener("resize", update))\n  onUnmounted(() => window.removeEventListener("resize", update))\n  return { width, height }\n}',
    createdAt: Date.now() - 7200000
  },
  {
    id: 's-3',
    title: '现代毛玻璃拟物效果 (Glassmorphism)',
    language: 'css',
    description: '现代化半透明模糊质感卡片样式',
    code: '.glass-card {\n  background: rgba(255, 255, 255, 0.65);\n  backdrop-filter: blur(12px);\n  -webkit-backdrop-filter: blur(12px);\n  border: 1px solid rgba(255, 255, 255, 0.3);\n  border-radius: 12px;\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);\n}',
    createdAt: Date.now() - 10800000
  }
]

const snippets = ref<Snippet[]>([])

onMounted(() => {
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        snippets.value = JSON.parse(raw)
        return
      } catch {
        // use default
      }
    }
  }
  snippets.value = defaultSnippets
})

function persist() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets.value))
  }
}

const filteredSnippets = computed(() => {
  return snippets.value.filter((s) => {
    const matchLang = selectedLang.value === 'all' || s.language === selectedLang.value
    const matchQuery =
      !searchQuery.value.trim() ||
      s.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      s.code.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchLang && matchQuery
  })
})

function getTagType(lang: string) {
  switch (lang) {
    case 'typescript':
      return 'primary'
    case 'vue':
      return 'success'
    case 'css':
      return 'warning'
    case 'shell':
      return 'info'
    default:
      return 'primary'
  }
}

function openCreateDialog() {
  form.title = ''
  form.language = 'typescript'
  form.description = ''
  form.code = ''
  showDialog.value = true
}

function saveSnippet() {
  if (!form.title.trim() || !form.code.trim()) {
    ElMessage.warning('请填写标题和代码内容')
    return
  }
  snippets.value.unshift({
    id: `s-${Date.now()}`,
    title: form.title.trim(),
    language: form.language,
    description: form.description.trim(),
    code: form.code,
    createdAt: Date.now()
  })
  persist()
  showDialog.value = false
  ElMessage.success('代码片段已收藏')
}

function deleteSnippet(id: string) {
  snippets.value = snippets.value.filter((s) => s.id !== id)
  persist()
  ElMessage.info('已移除代码片段')
}

async function copyCode(code: string) {
  if (window.electronSystemApi) {
    await window.electronSystemApi.clipboardWriteText(code)
  } else {
    await navigator.clipboard.writeText(code)
  }
  ElMessage.success('代码已复制到剪贴板')
}
</script>

<style scoped lang="scss">
.snippet-vault-view {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
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
}
.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.snippets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 14px;
}
.snippet-card {
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 8px;
  background: var(--el-fill-color-blank, #fff);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .title-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      .title {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary, #303133);
      }
    }
  }
  .card-desc {
    font-size: 12px;
    color: var(--el-text-color-secondary, #909399);
  }
  .code-preview {
    margin: 0;
    max-height: 120px;
    overflow-y: auto;
    padding: 8px 10px;
    background: #1e1e1e;
    color: #d4d4d4;
    border-radius: 6px;
    font-family: Consolas, Monaco, monospace;
    font-size: 12px;
  }
}
.empty-state {
  padding: 30px 0;
}
</style>
