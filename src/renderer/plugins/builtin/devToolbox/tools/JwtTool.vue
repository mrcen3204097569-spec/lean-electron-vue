<template>
  <div class="jwt-tool">
    <div class="input-section">
      <div class="area-label">粘贴 JWT 字符串 (Header.Payload.Signature):</div>
      <el-input
        v-model="token"
        type="textarea"
        :rows="3"
        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        @input="parseJwt"
      />
    </div>

    <div v-if="errorMsg" class="error-msg">
      <el-alert :title="errorMsg" type="error" :closable="false" show-icon />
    </div>

    <div v-if="payloadData" class="status-summary">
      <el-tag :type="isExpired ? 'danger' : 'success'" size="default">
        {{ isExpired ? '已过期 (Expired)' : '在有效期内 (Active)' }}
      </el-tag>
      <span v-if="expStr" class="meta-item">过期时间: {{ expStr }}</span>
      <span v-if="iatStr" class="meta-item">签发时间: {{ iatStr }}</span>
      <span v-if="headerData?.alg" class="meta-item">加密算法: {{ headerData.alg }}</span>
    </div>

    <el-row :gutter="12" class="json-panels">
      <el-col :span="10">
        <div class="panel-box">
          <div class="box-title">标头 (Header)</div>
          <el-input :model-value="formatJson(headerData)" type="textarea" :rows="7" readonly />
        </div>
      </el-col>
      <el-col :span="14">
        <div class="panel-box">
          <div class="box-title">载荷 (Payload)</div>
          <el-input :model-value="formatJson(payloadData)" type="textarea" :rows="7" readonly />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup name="JwtTool">
import { ref } from 'vue'

const token = ref(
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXYtdXNlci0wMDEiLCJuYW1lIjoiQW50aWdyYXZpdHkiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTgwMDAwMDAwMCwicm9sZXMiOlsic3VwZXJhZG1pbiIsImRldmVsb3BlciJdfQ.abc123dummySignature'
)

const headerData = ref<any>(null)
const payloadData = ref<any>(null)
const errorMsg = ref('')
const isExpired = ref(false)
const expStr = ref('')
const iatStr = ref('')

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  return decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
}

function parseJwt() {
  errorMsg.value = ''
  headerData.value = null
  payloadData.value = null
  isExpired.value = false
  expStr.value = ''
  iatStr.value = ''

  const t = token.value.trim()
  if (!t) return

  const parts = t.split('.')
  if (parts.length < 2) {
    errorMsg.value = '无效的 JWT 格式（至少需要 Header 和 Payload 两段）'
    return
  }

  try {
    headerData.value = JSON.parse(base64UrlDecode(parts[0]))
    payloadData.value = JSON.parse(base64UrlDecode(parts[1]))

    if (payloadData.value.exp) {
      const expDate = new Date(payloadData.value.exp * 1000)
      expStr.value = expDate.toLocaleString()
      isExpired.value = Date.now() > expDate.getTime()
    }
    if (payloadData.value.iat) {
      iatStr.value = new Date(payloadData.value.iat * 1000).toLocaleString()
    }
  } catch (err: any) {
    errorMsg.value = `解析失败: ${err?.message || 'Base64 或 JSON 格式不合规'}`
  }
}

function formatJson(val: any): string {
  if (!val) return ''
  return JSON.stringify(val, null, 2)
}

parseJwt()
</script>

<style scoped lang="scss">
.jwt-tool {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.area-label {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--el-text-color-secondary, #909399);
}
.status-summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 8px 12px;
  background: var(--el-fill-color-light, #f5f7fa);
  border-radius: 6px;
  font-size: 12px;
  .meta-item {
    color: var(--el-text-color-regular, #606266);
    font-weight: 500;
  }
}
.panel-box {
  .box-title {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 6px;
    color: #409eff;
  }
}
</style>
