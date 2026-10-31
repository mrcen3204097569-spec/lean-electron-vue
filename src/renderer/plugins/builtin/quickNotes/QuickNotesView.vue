<template>
  <div class="quick-notes-view">
    <div class="view-header">
      <div class="header-left">
        <h2>快捷便签</h2>
        <span class="note-count">共 {{ notes.length }} 条记录</span>
      </div>
      <el-button type="primary" size="small" @click="openCreateDialog">新建便签</el-button>
    </div>

    <!-- 便签网格列表 -->
    <div v-if="notes.length > 0" class="notes-grid">
      <el-card v-for="note in notes" :key="note.id" shadow="hover" class="note-card">
        <template #header>
          <div class="note-card-header">
            <span class="note-title">{{ note.title || '无标题便签' }}</span>
            <div class="note-actions">
              <el-button text type="danger" size="small" @click="deleteNote(note.id)">
                删除
              </el-button>
            </div>
          </div>
        </template>
        <div class="note-content">{{ note.content }}</div>
        <div class="note-time">{{ note.createdAt }}</div>
      </el-card>
    </div>

    <el-empty v-else description="暂无便签，点击右上角新建一条吧" />

    <!-- 创建便签弹窗 -->
    <el-dialog v-model="dialogVisible" title="新建便签" width="450px">
      <el-form label-position="top">
        <el-form-item label="便签标题">
          <el-input v-model="formData.title" placeholder="请输入标题..." />
        </el-form-item>
        <el-form-item label="便签内容">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="4"
            placeholder="输入便签正文..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveNote">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup name="QuickNotesView">
interface NoteItem {
  id: string
  title: string
  content: string
  createdAt: string
}

const STORAGE_KEY = 'lean_plugin_quick_notes_data'

const notes = ref<NoteItem[]>([])
const dialogVisible = ref(false)
const formData = reactive({
  title: '',
  content: ''
})

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    notes.value = raw ? JSON.parse(raw) : []
  } catch {
    notes.value = []
  }
}

function persistNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.value))
}

function openCreateDialog() {
  formData.title = ''
  formData.content = ''
  dialogVisible.value = true
}

function saveNote() {
  if (!formData.title && !formData.content) return
  notes.value.unshift({
    id: String(Date.now()),
    title: formData.title || '快捷便签',
    content: formData.content,
    createdAt: new Date().toLocaleString()
  })
  persistNotes()
  dialogVisible.value = false
}

function deleteNote(id: string) {
  notes.value = notes.value.filter((n) => n.id !== id)
  persistNotes()
}

onMounted(() => {
  loadNotes()
})
</script>

<style scoped lang="scss">
.quick-notes-view {
  padding: 20px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .note-count {
    font-size: 12px;
    color: var(--el-text-color-secondary, #909399);
    margin-left: 8px;
  }
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.note-card {
  display: flex;
  flex-direction: column;
  height: 180px;

  .note-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .note-title {
      font-weight: 600;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .note-content {
    flex: 1;
    font-size: 13px;
    color: var(--el-text-color-regular, #606266);
    white-space: pre-wrap;
    overflow-y: auto;
    word-break: break-all;
    max-height: 80px;
  }

  .note-time {
    font-size: 11px;
    color: var(--el-text-color-placeholder, #a8abb2);
    margin-top: 8px;
    text-align: right;
  }
}
</style>
