<template>
  <div class="password-tool">
    <div class="main-display">
      <div class="current-pwd">{{ currentPassword || '点击下方按钮生成密码' }}</div>
      <div class="display-actions">
        <el-button type="primary" @click="generateSingle">生成</el-button>
        <el-button @click="copyPwd(currentPassword)">复制</el-button>
      </div>
    </div>

    <!-- 强度条 -->
    <div v-if="currentPassword" class="strength-bar-wrapper">
      <div class="strength-label">密码强度: {{ strengthText }}</div>
      <el-progress :percentage="strengthScore" :color="strengthColor" :show-text="false" />
    </div>

    <el-divider />

    <div class="config-grid">
      <div class="config-item">
        <span class="label">密码长度: {{ length }}</span>
        <el-slider v-model="length" :min="6" :max="64" @change="generateSingle" />
      </div>

      <div class="config-item checks">
        <el-checkbox v-model="useUpper" @change="generateSingle">大写字母 (A-Z)</el-checkbox>
        <el-checkbox v-model="useLower" @change="generateSingle">小写字母 (a-z)</el-checkbox>
        <el-checkbox v-model="useNumbers" @change="generateSingle">数字 (0-9)</el-checkbox>
        <el-checkbox v-model="useSymbols" @change="generateSingle">特殊符号 (!@#$%^&*)</el-checkbox>
        <el-checkbox v-model="excludeAmbiguous" @change="generateSingle">
          排除易混淆字符 (l, 1, I, o, 0, O)
        </el-checkbox>
      </div>
    </div>

    <div class="batch-section">
      <div class="batch-header">
        <span>批量生成列表 (Batch Generation)</span>
        <el-button size="small" @click="generateBatch">批量生成 5 条</el-button>
        <el-button v-if="batchList.length" size="small" @click="copyAllBatch">
          一键复制全部
        </el-button>
      </div>
      <div v-if="batchList.length" class="batch-list">
        <div v-for="(pwd, idx) in batchList" :key="idx" class="batch-item">
          <span class="pwd-val">{{ pwd }}</span>
          <el-button link type="primary" size="small" @click="copyPwd(pwd)">复制</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="PasswordTool">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const length = ref(16)
const useUpper = ref(true)
const useLower = ref(true)
const useNumbers = ref(true)
const useSymbols = ref(true)
const excludeAmbiguous = ref(false)

const currentPassword = ref('')
const batchList = ref<string[]>([])

function buildCharset(): string {
  let chars = ''
  if (useUpper.value)
    chars += excludeAmbiguous.value ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (useLower.value)
    chars += excludeAmbiguous.value ? 'abcdefghijkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz'
  if (useNumbers.value) chars += excludeAmbiguous.value ? '23456789' : '0123456789'
  if (useSymbols.value) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'
  return chars || 'abcdefghijklmnopqrstuvwxyz'
}

function generateRandomString(len: number, charset: string): string {
  const array = new Uint32Array(len)
  crypto.getRandomValues(array)
  let res = ''
  for (let i = 0; i < len; i++) {
    res += charset[array[i] % charset.length]
  }
  return res
}

function generateSingle() {
  const charset = buildCharset()
  currentPassword.value = generateRandomString(length.value, charset)
}

function generateBatch() {
  const charset = buildCharset()
  batchList.value = Array.from({ length: 5 }, () => generateRandomString(length.value, charset))
}

const strengthScore = computed(() => {
  const p = currentPassword.value
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score += 20
  if (p.length >= 12) score += 20
  if (p.length >= 16) score += 10
  if (/[A-Z]/.test(p)) score += 15
  if (/[a-z]/.test(p)) score += 10
  if (/[0-9]/.test(p)) score += 10
  if (/[^A-Za-z0-9]/.test(p)) score += 15
  return Math.min(100, score)
})

const strengthText = computed(() => {
  const s = strengthScore.value
  if (s >= 80) return '极高 (Very Strong)'
  if (s >= 60) return '高 (Strong)'
  if (s >= 40) return '中等 (Medium)'
  return '弱 (Weak)'
})

const strengthColor = computed(() => {
  const s = strengthScore.value
  if (s >= 80) return '#67c23a'
  if (s >= 60) return '#409eff'
  if (s >= 40) return '#e6a23c'
  return '#f56c6c'
})

async function copyPwd(val: string) {
  if (!val) return
  if (window.electronSystemApi) {
    await window.electronSystemApi.clipboardWriteText(val)
  } else {
    await navigator.clipboard.writeText(val)
  }
  ElMessage.success('密码已复制')
}

async function copyAllBatch() {
  if (!batchList.value.length) return
  const text = batchList.value.join('\n')
  if (window.electronSystemApi) {
    await window.electronSystemApi.clipboardWriteText(text)
  } else {
    await navigator.clipboard.writeText(text)
  }
  ElMessage.success('已复制全部 5 条密码')
}

generateSingle()
</script>

<style scoped lang="scss">
.password-tool {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.main-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--el-fill-color-light, #f5f7fa);
  border-radius: 8px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  .current-pwd {
    font-family: Consolas, Monaco, monospace;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 1px;
    word-break: break-all;
    user-select: all;
  }
  .display-actions {
    display: flex;
    gap: 8px;
    margin-left: 12px;
  }
}
.strength-bar-wrapper {
  margin-top: 4px;
  .strength-label {
    font-size: 12px;
    color: var(--el-text-color-secondary, #909399);
    margin-bottom: 4px;
  }
}
.config-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  .label {
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 4px;
    display: block;
  }
  .checks {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
}
.batch-section {
  margin-top: 10px;
  .batch-header {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
  }
}
.batch-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.batch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: var(--el-fill-color-blank, #fff);
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 4px;
  font-family: Consolas, Monaco, monospace;
  font-size: 13px;
}
</style>
