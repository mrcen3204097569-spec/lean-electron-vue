<template>
  <div class="api-client-view">
    <div class="view-header">
      <div class="header-left">
        <h2>REST API 接口调试器</h2>
        <span class="sub-desc">
          轻量极速的 HTTP / REST 请求演练场，支持请求头参数配置、JSON 格式化与响应体实时解析
        </span>
      </div>
    </div>

    <!-- 请求地址输入栏 -->
    <div class="request-bar">
      <el-select v-model="method" style="width: 120px" class="method-select">
        <el-option label="GET" value="GET" />
        <el-option label="POST" value="POST" />
        <el-option label="PUT" value="PUT" />
        <el-option label="DELETE" value="DELETE" />
        <el-option label="PATCH" value="PATCH" />
      </el-select>

      <el-input
        v-model="url"
        placeholder="https://api.example.com/v1/resource"
        clearable
        class="url-input"
        @keydown.enter="sendRequest"
      />

      <el-button type="primary" :loading="loading" class="send-btn" @click="sendRequest">
        发送请求 (Send)
      </el-button>
    </div>

    <!-- 请求配置与历史区 -->
    <div class="client-workspace">
      <!-- 左侧主编辑面板 -->
      <div class="main-panel">
        <el-tabs v-model="activeReqTab" class="req-tabs">
          <!-- 1. Query Params -->
          <el-tab-pane label="Query 参数" name="params">
            <div class="kv-table">
              <div v-for="(p, idx) in queryParams" :key="idx" class="kv-row">
                <el-input v-model="p.key" placeholder="Key (参数名)" size="small" />
                <el-input v-model="p.value" placeholder="Value (参数值)" size="small" />
                <el-button
                  type="danger"
                  text
                  size="small"
                  :icon="Delete"
                  @click="removeParam(idx)"
                />
              </div>
              <el-button type="primary" plain size="small" @click="addParam">+ 添加参数</el-button>
            </div>
          </el-tab-pane>

          <!-- 2. Headers -->
          <el-tab-pane label="请求头 (Headers)" name="headers">
            <div class="kv-table">
              <div v-for="(h, idx) in headersList" :key="idx" class="kv-row">
                <el-input v-model="h.key" placeholder="Header Name" size="small" />
                <el-input v-model="h.value" placeholder="Header Value" size="small" />
                <el-button
                  type="danger"
                  text
                  size="small"
                  :icon="Delete"
                  @click="removeHeader(idx)"
                />
              </div>
              <el-button type="primary" plain size="small" @click="addHeader">
                + 添加请求头
              </el-button>
            </div>
          </el-tab-pane>

          <!-- 3. Body -->
          <el-tab-pane label="请求体 (Body)" name="body">
            <div class="body-editor-tools">
              <el-button size="small" @click="formatJsonBody">格式化 JSON</el-button>
              <el-button size="small" @click="bodyContent = '{}'">重置</el-button>
            </div>
            <el-input
              v-model="bodyContent"
              type="textarea"
              :rows="6"
              placeholder='{ "key": "value" }'
              class="body-textarea"
            />
          </el-tab-pane>
        </el-tabs>

        <!-- 响应结果展示区 -->
        <div class="response-panel">
          <div class="resp-header">
            <div class="resp-meta">
              <span class="resp-label">Response:</span>
              <template v-if="responseStatus !== null">
                <el-tag
                  :type="responseStatus >= 200 && responseStatus < 300 ? 'success' : 'danger'"
                  effect="dark"
                  size="small"
                >
                  {{ responseStatus }} {{ responseStatusText }}
                </el-tag>
                <el-tag size="small" type="info" effect="plain">⏱️ {{ responseTime }} ms</el-tag>
                <el-tag size="small" type="info" effect="plain">📦 {{ responseSize }}</el-tag>
              </template>
              <span v-else class="empty-tip">未发送请求</span>
            </div>

            <div v-if="responseBody" class="resp-actions">
              <el-button size="small" text type="primary" @click="copyResponseBody">
                复制响应
              </el-button>
            </div>
          </div>

          <div class="resp-body-container">
            <pre v-if="responseBody" class="json-code-box">{{ responseBody }}</pre>
            <div v-else class="resp-placeholder">
              输入 API 地址并点击“发送请求”，在此查看实时响应数据
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧请求历史记录列表 -->
      <div class="history-sidebar">
        <div class="history-title">
          <span>最近请求历史</span>
          <el-button
            v-if="historyList.length > 0"
            size="small"
            text
            type="danger"
            @click="clearHistory"
          >
            清空
          </el-button>
        </div>

        <div v-if="historyList.length > 0" class="history-items">
          <div
            v-for="(hist, idx) in historyList"
            :key="idx"
            class="history-card"
            @click="loadHistory(hist)"
          >
            <div class="hist-top">
              <el-tag :type="getMethodTagType(hist.method)" size="small" effect="dark">
                {{ hist.method }}
              </el-tag>
              <span class="hist-time">{{ hist.time }}</span>
            </div>
            <div class="hist-url">{{ hist.url }}</div>
          </div>
        </div>
        <div v-else class="history-empty">暂无历史记录</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="ApiClientView">
import { ref, onMounted } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { pluginManager } from '@/plugin/pluginManager'

interface KeyVal {
  key: string
  value: string
}

interface RequestHistoryItem {
  method: string
  url: string
  time: string
  body?: string
}

const storage = pluginManager.getPluginStorage('api-client')

const method = ref('GET')
const url = ref('https://httpbin.org/get')
const loading = ref(false)
const activeReqTab = ref('params')

const queryParams = ref<KeyVal[]>([{ key: '', value: '' }])
const headersList = ref<KeyVal[]>([{ key: 'Content-Type', value: 'application/json' }])
const bodyContent = ref('')

const responseStatus = ref<number | null>(null)
const responseStatusText = ref('')
const responseTime = ref(0)
const responseSize = ref('')
const responseBody = ref('')
const historyList = ref<RequestHistoryItem[]>([])

const addParam = () => queryParams.value.push({ key: '', value: '' })
const removeParam = (idx: number) => queryParams.value.splice(idx, 1)

const addHeader = () => headersList.value.push({ key: '', value: '' })
const removeHeader = (idx: number) => headersList.value.splice(idx, 1)

const formatJsonBody = () => {
  try {
    const parsed = JSON.parse(bodyContent.value)
    bodyContent.value = JSON.stringify(parsed, null, 2)
  } catch {
    ElMessage.warning('当前请求体不是合法的 JSON 格式')
  }
}

const getMethodTagType = (m: string) => {
  switch (m) {
    case 'GET':
      return 'primary'
    case 'POST':
      return 'success'
    case 'PUT':
      return 'warning'
    case 'DELETE':
      return 'danger'
    default:
      return 'info'
  }
}

const sendRequest = async () => {
  if (!url.value.trim()) {
    ElMessage.warning('请输入目标 API 地址')
    return
  }

  loading.value = true
  const startTime = performance.now()

  try {
    // 组装 query params
    const parsedUrl = new URL(url.value.trim())
    for (const p of queryParams.value) {
      if (p.key.trim()) {
        parsedUrl.searchParams.set(p.key.trim(), p.value.trim())
      }
    }

    // 组装 headers
    const reqHeaders: Record<string, string> = {}
    for (const h of headersList.value) {
      if (h.key.trim()) {
        reqHeaders[h.key.trim()] = h.value.trim()
      }
    }

    const options: {
      method: string
      headers: Record<string, string>
      body?: string
    } = {
      method: method.value,
      headers: reqHeaders
    }

    if (['POST', 'PUT', 'PATCH'].includes(method.value) && bodyContent.value.trim()) {
      options.body = bodyContent.value.trim()
    }

    const res = await fetch(parsedUrl.toString(), options)
    const endTime = performance.now()

    responseStatus.value = res.status
    responseStatusText.value = res.statusText || 'OK'
    responseTime.value = Math.round(endTime - startTime)

    const text = await res.text()
    responseSize.value = `${(text.length / 1024).toFixed(2)} KB`

    try {
      const json = JSON.parse(text)
      responseBody.value = JSON.stringify(json, null, 2)
    } catch {
      responseBody.value = text
    }

    // 记录历史
    const date = new Date()
    const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    historyList.value.unshift({
      method: method.value,
      url: parsedUrl.toString(),
      time: timeStr,
      body: bodyContent.value
    })
    if (historyList.value.length > 20) {
      historyList.value = historyList.value.slice(0, 20)
    }
    storage.set('history', historyList.value)
  } catch (err: any) {
    responseStatus.value = 0
    responseStatusText.value = 'Network Error'
    responseBody.value = `请求异常失败: ${err?.message || '网络连接被拒绝或跨域受阻'}`
    responseTime.value = 0
    responseSize.value = '0 KB'
  } finally {
    loading.value = false
  }
}

const copyResponseBody = async () => {
  if (!responseBody.value) return
  await window.electronSystemApi?.clipboardWriteText(responseBody.value)
  ElMessage.success('响应体已复制到剪贴板')
}

const loadHistory = (hist: RequestHistoryItem) => {
  method.value = hist.method
  url.value = hist.url
  if (hist.body) {
    bodyContent.value = hist.body
  }
}

const clearHistory = () => {
  historyList.value = []
  storage.set('history', [])
}

onMounted(() => {
  historyList.value = storage.get<RequestHistoryItem[]>('history', [])
})
</script>

<style scoped lang="scss">
.api-client-view {
  padding: 24px;
}

.view-header {
  margin-bottom: 20px;

  h2 {
    margin: 0 0 6px 0;
    font-size: 20px;
  }

  .sub-desc {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

.request-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;

  .url-input {
    flex: 1;
  }

  .send-btn {
    min-width: 140px;
  }
}

.client-workspace {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.main-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.req-tabs {
  background: var(--el-bg-color, #ffffff);
  border: 1px solid var(--el-border-color-lighter, #e4e7ed);
  border-radius: 10px;
  padding: 14px;
}

.kv-table {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .kv-row {
    display: flex;
    gap: 10px;
    align-items: center;
  }
}

.body-editor-tools {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.body-textarea {
  font-family: monospace;
  font-size: 13px;
}

.response-panel {
  background: var(--el-bg-color, #ffffff);
  border: 1px solid var(--el-border-color-lighter, #e4e7ed);
  border-radius: 10px;
  overflow: hidden;

  .resp-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-light, #fafafa);

    .resp-meta {
      display: flex;
      align-items: center;
      gap: 10px;

      .resp-label {
        font-size: 13px;
        font-weight: 600;
      }

      .empty-tip {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .resp-body-container {
    max-height: 360px;
    min-height: 180px;
    overflow-y: auto;
    padding: 14px;

    .json-code-box {
      margin: 0;
      font-family: monospace;
      font-size: 13px;
      line-height: 1.5;
      color: var(--el-text-color-primary);
      white-space: pre-wrap;
      word-break: break-all;
    }

    .resp-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 160px;
      color: var(--el-text-color-placeholder);
      font-size: 13px;
    }
  }
}

.history-sidebar {
  width: 260px;
  background: var(--el-bg-color, #ffffff);
  border: 1px solid var(--el-border-color-lighter, #e4e7ed);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;

  .history-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 12px;
    color: var(--el-text-color-primary);
  }

  .history-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 480px;
    overflow-y: auto;
  }

  .history-card {
    padding: 8px 10px;
    border-radius: 6px;
    background: var(--el-fill-color-light, #fafafa);
    border: 1px solid var(--el-border-color-lighter);
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      border-color: var(--el-color-primary-light-5);
      background: var(--el-color-primary-light-9);
    }

    .hist-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;

      .hist-time {
        font-size: 11px;
        color: var(--el-text-color-secondary);
      }
    }

    .hist-url {
      font-size: 12px;
      color: var(--el-text-color-regular);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: monospace;
    }
  }

  .history-empty {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
    text-align: center;
    padding: 30px 0;
  }
}
</style>
