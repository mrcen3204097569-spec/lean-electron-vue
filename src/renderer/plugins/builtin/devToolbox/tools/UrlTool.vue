<template>
  <div class="url-tool">
    <div class="action-bar">
      <el-button type="primary" size="small" @click="encodeUrl">URL Encode</el-button>
      <el-button size="small" @click="decodeUrl">URL Decode</el-button>
      <el-button size="small" @click="copyInput">复制完整 URL</el-button>
      <el-button size="small" @click="clearUrl">清空</el-button>
    </div>

    <div class="input-section">
      <div class="area-label">完整 URL 字符串:</div>
      <el-input
        v-model="fullUrl"
        type="textarea"
        :rows="3"
        placeholder="https://api.example.com/v1/search?keyword=vue&page=1&sort=desc"
        @input="parseUrl"
      />
    </div>

    <div v-if="parsedData" class="url-breakdown">
      <div class="meta-row">
        <span>
          <strong>协议 (Protocol):</strong>
          {{ parsedData.protocol }}
        </span>
        <span>
          <strong>主机 (Host):</strong>
          {{ parsedData.host }}
        </span>
        <span>
          <strong>路径 (Path):</strong>
          {{ parsedData.pathname }}
        </span>
      </div>

      <div class="params-section">
        <div class="params-header">
          <span>Query 查询参数 ({{ queryParams.length }})</span>
          <el-button link type="primary" size="small" @click="addParam">+ 添加参数</el-button>
        </div>

        <el-table :data="queryParams" size="small" border style="width: 100%">
          <el-table-column label="Key (参数名)" min-width="150">
            <template #default="{ row }">
              <el-input v-model="row.key" size="small" @input="rebuildUrl" />
            </template>
          </el-table-column>
          <el-table-column label="Value (参数值)" min-width="200">
            <template #default="{ row }">
              <el-input v-model="row.value" size="small" @input="rebuildUrl" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ $index }">
              <el-button link type="danger" size="small" @click="removeParam($index)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="UrlTool">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const fullUrl = ref(
  'https://github.com/mrcen3204097569-spec/lean-electron-vue?tab=readme-ov-file&lang=zh-CN'
)

interface QueryParam {
  key: string
  value: string
}

const parsedData = ref<{ protocol: string; host: string; pathname: string } | null>(null)
const queryParams = ref<QueryParam[]>([])

function parseUrl() {
  const u = fullUrl.value.trim()
  if (!u) {
    parsedData.value = null
    queryParams.value = []
    return
  }

  try {
    const urlObj = new URL(u.startsWith('http') ? u : `https://${u}`)
    parsedData.value = {
      protocol: urlObj.protocol,
      host: urlObj.host,
      pathname: urlObj.pathname
    }
    const params: QueryParam[] = []
    urlObj.searchParams.forEach((value, key) => {
      params.push({ key, value })
    })
    queryParams.value = params
  } catch (e) {
    parsedData.value = null
    queryParams.value = []
  }
}

function rebuildUrl() {
  if (!parsedData.value) return
  const base = `${parsedData.value.protocol}//${parsedData.value.host}${parsedData.value.pathname}`
  const sp = new URLSearchParams()
  queryParams.value.forEach((p) => {
    if (p.key) sp.append(p.key, p.value)
  })
  const qs = sp.toString()
  fullUrl.value = qs ? `${base}?${qs}` : base
}

function addParam() {
  queryParams.value.push({ key: '', value: '' })
  rebuildUrl()
}

function removeParam(index: number) {
  queryParams.value.splice(index, 1)
  rebuildUrl()
}

function encodeUrl() {
  try {
    fullUrl.value = encodeURIComponent(fullUrl.value)
  } catch (e) {
    ElMessage.error('编码失败')
  }
}

function decodeUrl() {
  try {
    fullUrl.value = decodeURIComponent(fullUrl.value)
    parseUrl()
  } catch (e) {
    ElMessage.error('解码失败')
  }
}

async function copyInput() {
  if (window.electronSystemApi) {
    await window.electronSystemApi.clipboardWriteText(fullUrl.value)
  } else {
    await navigator.clipboard.writeText(fullUrl.value)
  }
  ElMessage.success('已复制')
}

function clearUrl() {
  fullUrl.value = ''
  parsedData.value = null
  queryParams.value = []
}

parseUrl()
</script>

<style scoped lang="scss">
.url-tool {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.action-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}
.area-label {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--el-text-color-secondary, #909399);
}
.url-breakdown {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 8px 12px;
  background: var(--el-fill-color-light, #f5f7fa);
  border-radius: 4px;
  font-size: 13px;
}
.params-section {
  .params-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 6px;
  }
}
</style>
