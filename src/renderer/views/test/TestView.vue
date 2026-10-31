<template>
  <div class="test-view">
    <!-- 如果是作为子窗口打开 -->
    <div v-if="isDialog" class="dialog-mode-card">
      <el-result
        icon="success"
        title="独立会话子窗口就绪"
        sub-title="本窗口由父窗口通过 createDialog 打开，已自动向父窗口发送 dialogReady 信号"
      >
        <template #extra>
          <el-button type="primary" @click="closeCurrentWindow">关闭当前子窗口</el-button>
        </template>
      </el-result>
    </div>

    <!-- 正常主窗口测试工作台 -->
    <div v-else>
      <div class="view-header">
        <h2>原生能力与系统通信实验室</h2>
        <span class="sub-desc">测试 Electron 原生系统对话框、通知、剪贴板与多窗口通信能力</span>
      </div>

      <el-row :gutter="16" class="test-cards-row">
        <!-- 1. 文件选择与保存对话框 -->
        <el-col :span="12">
          <el-card shadow="hover" class="test-card">
            <template #header>
              <div class="card-title">
                <el-icon><FolderOpened /></el-icon>
                <span>原生文件对话框 (File Dialogs)</span>
              </div>
            </template>
            <div class="btn-group">
              <el-button type="primary" size="small" @click="handleOpenFile">
                打开单个文件
              </el-button>
              <el-button size="small" @click="handleOpenDir">选择文件夹</el-button>
              <el-button size="small" @click="handleSaveFile">保存文件对话框</el-button>
            </div>
            <div v-if="selectedPaths.length > 0" class="result-box">
              <span class="result-label">选中的路径：</span>
              <ul class="path-list">
                <li v-for="p in selectedPaths" :key="p">{{ p }}</li>
              </ul>
            </div>
          </el-card>
        </el-col>

        <!-- 2. 剪贴板交互 -->
        <el-col :span="12">
          <el-card shadow="hover" class="test-card">
            <template #header>
              <div class="card-title">
                <el-icon><DocumentCopy /></el-icon>
                <span>系统剪贴板 (Clipboard)</span>
              </div>
            </template>
            <div class="clipboard-input-row">
              <el-input v-model="clipboardInput" placeholder="输入要写入剪贴板的文字..." />
              <el-button type="primary" size="small" @click="handleWriteClipboard">
                写入剪贴板
              </el-button>
            </div>
            <div class="btn-group" style="margin-top: 12px">
              <el-button size="small" @click="handleReadClipboard">读取当前系统剪贴板</el-button>
            </div>
            <div v-if="clipboardReadResult" class="result-box">
              <span class="result-label">读取内容：</span>
              <code>{{ clipboardReadResult }}</code>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="16" class="test-cards-row">
        <!-- 3. 原生通知 -->
        <el-col :span="12">
          <el-card shadow="hover" class="test-card">
            <template #header>
              <div class="card-title">
                <el-icon><Bell /></el-icon>
                <span>桌面系统通知 (Notification)</span>
              </div>
            </template>
            <el-form label-position="top" size="small">
              <el-form-item label="通知标题">
                <el-input v-model="notifyTitle" placeholder="输入通知标题..." />
              </el-form-item>
              <el-form-item label="通知内容">
                <el-input v-model="notifyBody" placeholder="输入通知正文..." />
              </el-form-item>
              <el-button type="primary" size="small" @click="handleSendNotification">
                发送系统原生通知
              </el-button>
            </el-form>
          </el-card>
        </el-col>

        <!-- 4. 会话子窗口通信 -->
        <el-col :span="12">
          <el-card shadow="hover" class="test-card">
            <template #header>
              <div class="card-title">
                <el-icon><CopyDocument /></el-icon>
                <span>多窗口与安全子窗口 (createDialog)</span>
              </div>
            </template>
            <p class="card-desc">
              主进程安全沙箱接管 window.open，白名单校验 features，自动抹除未授权预加载特权。
            </p>
            <div class="btn-group">
              <el-button
                type="primary"
                size="small"
                :loading="dialogOpening"
                @click="handleOpenChildDialog"
              >
                打开子窗口测试通信
              </el-button>
            </div>
            <div v-if="dialogStatus" class="result-box">
              <span class="result-label">子窗口就绪状态：</span>
              <el-tag type="success">{{ dialogStatus }}</el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts" setup name="TestView">
import { Bell, CopyDocument, DocumentCopy, FolderOpened } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { createDialog, dialogReady } from '@/common/dialog'

const route = useRoute()
const isDialog = computed(() => route.query.dialog === '1')

// 文件对话框状态
const selectedPaths = ref<string[]>([])

async function handleOpenFile() {
  if (!window.electronSystemApi) return
  const res = await window.electronSystemApi.openFileDialog({
    title: '选择测试文件',
    properties: ['openFile']
  })
  if (!res.canceled) {
    selectedPaths.value = res.filePaths
    ElMessage.success('已选中文件')
  }
}

async function handleOpenDir() {
  if (!window.electronSystemApi) return
  const res = await window.electronSystemApi.openFileDialog({
    title: '选择文件夹',
    properties: ['openDirectory']
  })
  if (!res.canceled) {
    selectedPaths.value = res.filePaths
    ElMessage.success('已选中文件夹')
  }
}

async function handleSaveFile() {
  if (!window.electronSystemApi) return
  const res = await window.electronSystemApi.saveFileDialog({
    title: '保存测试文件',
    defaultPath: 'test-demo.txt'
  })
  if (!res.canceled && res.filePath) {
    selectedPaths.value = [res.filePath]
    ElMessage.success(`保存目标: ${res.filePath}`)
  }
}

// 剪贴板状态
const clipboardInput = ref('lean-electron-vue 剪贴板测试文本')
const clipboardReadResult = ref('')

async function handleWriteClipboard() {
  if (window.electronSystemApi) {
    await window.electronSystemApi.clipboardWriteText(clipboardInput.value)
    ElMessage.success('文本已写入剪贴板')
  }
}

async function handleReadClipboard() {
  if (window.electronSystemApi) {
    clipboardReadResult.value = await window.electronSystemApi.clipboardReadText()
    ElMessage.info('已读取剪贴板最新内容')
  }
}

// 通知状态
const notifyTitle = ref('来自 lean-electron-vue 的桌面通知')
const notifyBody = ref('恭喜！原生系统通知已成功触发并正常展示。')

async function handleSendNotification() {
  if (window.electronSystemApi) {
    await window.electronSystemApi.showNotification({
      title: notifyTitle.value,
      body: notifyBody.value
    })
    ElMessage.success('已发送桌面通知')
  }
}

// 子窗口状态
const dialogOpening = ref(false)
const dialogStatus = ref('')

async function handleOpenChildDialog() {
  dialogOpening.value = true
  dialogStatus.value = '正在唤起子窗口并等待 dialogReady 信号...'
  try {
    await createDialog('/test?dialog=1', {
      width: 600,
      height: 450,
      title: '独立会话测试窗口',
      webPreferences: { preloadMain: true } as any
    })
    dialogStatus.value = '子窗口已就绪并握手成功！'
    ElMessage.success('子窗口就绪！')
  } catch (err) {
    dialogStatus.value = `打开失败或被关闭: ${err}`
  } finally {
    dialogOpening.value = false
  }
}

function closeCurrentWindow() {
  if (window.electronWindowApi) {
    window.electronWindowApi.closeWindow()
  } else {
    window.close()
  }
}

onMounted(() => {
  if (isDialog.value) {
    dialogReady()
  }
})
</script>

<style scoped lang="scss">
.test-view {
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.view-header {
  margin-bottom: 24px;

  h2 {
    margin: 0 0 6px 0;
    font-size: 20px;
    font-weight: 600;
  }

  .sub-desc {
    font-size: 13px;
    color: var(--el-text-color-secondary, #909399);
  }
}

.test-cards-row {
  margin-bottom: 16px;
}

.test-card {
  height: 100%;
  border-radius: 8px;

  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 14px;
  }

  .card-desc {
    font-size: 13px;
    color: var(--el-text-color-secondary, #909399);
    line-height: 1.5;
    margin: 0 0 12px 0;
  }
}

.btn-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.clipboard-input-row {
  display: flex;
  gap: 8px;
}

.result-box {
  margin-top: 12px;
  padding: 8px 12px;
  background-color: var(--el-fill-color-light, #f5f7fa);
  border-radius: 6px;
  font-size: 12px;

  .result-label {
    font-weight: 600;
    color: var(--el-text-color-primary, #303133);
  }

  .path-list {
    margin: 4px 0 0 0;
    padding-left: 18px;
    word-break: break-all;
  }
}

.dialog-mode-card {
  padding: 40px;
  background-color: var(--el-bg-color, #fff);
  border-radius: 12px;
  margin: 40px auto;
  max-width: 500px;
}
</style>
