<template>
  <div class="dev-toolbox-view">
    <div class="view-header">
      <div class="header-left">
        <h2>开发者全能工具箱 (Developer Toolbox Suite)</h2>
        <span class="sub-title">15+ 款离线原生高效开发实用工具矩阵</span>
      </div>
      <el-tag type="success" size="small">极速离线运算</el-tag>
    </div>

    <el-tabs v-model="activeTab" type="border-card" class="toolbox-tabs">
      <!-- 常用编解码与转换 -->
      <el-tab-pane label="JSON 格式化" name="json">
        <div class="tool-pane">
          <div class="action-bar">
            <el-button type="primary" size="small" @click="formatJson">格式化</el-button>
            <el-button size="small" @click="minifyJson">压缩</el-button>
            <el-button size="small" @click="copyJson">复制结果</el-button>
            <el-button size="small" @click="jsonInput = ''">清空</el-button>
          </div>
          <el-input
            v-model="jsonInput"
            type="textarea"
            :rows="12"
            placeholder="粘贴要格式化的 JSON 字符串..."
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="Diff 文本比对" name="diff">
        <div class="tool-pane">
          <DiffTool />
        </div>
      </el-tab-pane>

      <el-tab-pane label="Regex 正则演练" name="regex">
        <div class="tool-pane">
          <RegexTool />
        </div>
      </el-tab-pane>

      <el-tab-pane label="哈希散列计算" name="hash">
        <div class="tool-pane">
          <HashTool />
        </div>
      </el-tab-pane>

      <el-tab-pane label="安全密码生成" name="password">
        <div class="tool-pane">
          <PasswordTool />
        </div>
      </el-tab-pane>

      <el-tab-pane label="UUID / ID 生成" name="uuid">
        <div class="tool-pane">
          <UuidTool />
        </div>
      </el-tab-pane>

      <el-tab-pane label="JWT 令牌剖析" name="jwt">
        <div class="tool-pane">
          <JwtTool />
        </div>
      </el-tab-pane>

      <el-tab-pane label="URL / Query 解析" name="url">
        <div class="tool-pane">
          <UrlTool />
        </div>
      </el-tab-pane>

      <el-tab-pane label="时间戳转换" name="timestamp">
        <div class="tool-pane">
          <div class="timestamp-section">
            <div class="current-time">
              当前时间戳:
              <strong>{{ currentTimestamp }}</strong>
              ({{ currentDateStr }})
            </div>
            <el-divider />
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form label-position="top">
                  <el-form-item label="毫秒时间戳转换为日期">
                    <el-input v-model="tsInput" placeholder="输入毫秒时间戳..." />
                  </el-form-item>
                  <el-button type="primary" size="small" @click="convertTsToDate">转换</el-button>
                  <div v-if="convertedDate" class="result-text">转换结果: {{ convertedDate }}</div>
                </el-form>
              </el-col>
              <el-col :span="12">
                <el-form label-position="top">
                  <el-form-item label="日期时间转换为时间戳">
                    <el-date-picker
                      v-model="dateInput"
                      type="datetime"
                      placeholder="选择日期时间"
                      style="width: 100%"
                    />
                  </el-form-item>
                  <el-button type="primary" size="small" @click="convertDateToTs">转换</el-button>
                  <div v-if="convertedTs" class="result-text">转换结果: {{ convertedTs }}</div>
                </el-form>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="Base64 编解码" name="base64">
        <div class="tool-pane">
          <div class="action-bar">
            <el-button type="primary" size="small" @click="encodeBase64">Base64 编码</el-button>
            <el-button size="small" @click="decodeBase64">Base64 解码</el-button>
            <el-button size="small" @click="copyBase64">复制结果</el-button>
          </div>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-input
                v-model="base64Input"
                type="textarea"
                :rows="10"
                placeholder="输入原始内容或 Base64 字符串..."
              />
            </el-col>
            <el-col :span="12">
              <el-input
                v-model="base64Output"
                type="textarea"
                :rows="10"
                readonly
                placeholder="编解码结果..."
              />
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <el-tab-pane label="色彩格式转换" name="color">
        <div class="tool-pane">
          <ColorTool />
        </div>
      </el-tab-pane>

      <el-tab-pane label="命名风格转换" name="case">
        <div class="tool-pane">
          <CaseTextTool />
        </div>
      </el-tab-pane>

      <el-tab-pane label="CSS 渐变与阴影" name="css">
        <div class="tool-pane">
          <CssVisualizerTool />
        </div>
      </el-tab-pane>

      <el-tab-pane label="HTML 实体编码" name="html">
        <div class="tool-pane">
          <HtmlEntityTool />
        </div>
      </el-tab-pane>

      <el-tab-pane label="临时草稿纸" name="scratchpad">
        <div class="tool-pane">
          <ScratchpadTool />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup name="DevToolboxView">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import DiffTool from './tools/DiffTool.vue'
import RegexTool from './tools/RegexTool.vue'
import HashTool from './tools/HashTool.vue'
import PasswordTool from './tools/PasswordTool.vue'
import UuidTool from './tools/UuidTool.vue'
import JwtTool from './tools/JwtTool.vue'
import UrlTool from './tools/UrlTool.vue'
import ColorTool from './tools/ColorTool.vue'
import CaseTextTool from './tools/CaseTextTool.vue'
import CssVisualizerTool from './tools/CssVisualizerTool.vue'
import HtmlEntityTool from './tools/HtmlEntityTool.vue'
import ScratchpadTool from './tools/ScratchpadTool.vue'

const activeTab = ref('json')

// JSON
const jsonInput = ref(
  '{"name":"lean-electron-vue","version":"2.0.0","features":["plugin-system","dev-toolbox","multi-window"]}'
)

function formatJson() {
  try {
    const parsed = JSON.parse(jsonInput.value)
    jsonInput.value = JSON.stringify(parsed, null, 2)
  } catch (e) {
    ElMessage.error('JSON 语法错误，无法解析')
  }
}

function minifyJson() {
  try {
    const parsed = JSON.parse(jsonInput.value)
    jsonInput.value = JSON.stringify(parsed)
  } catch (e) {
    ElMessage.error('JSON 语法错误，无法解析')
  }
}

async function copyJson() {
  if (window.electronSystemApi) {
    await window.electronSystemApi.clipboardWriteText(jsonInput.value)
  } else {
    await navigator.clipboard.writeText(jsonInput.value)
  }
  ElMessage.success('已复制到剪贴板')
}

// Timestamp
const currentTimestamp = ref(Date.now())
const currentDateStr = ref(new Date().toLocaleString())
const tsInput = ref(String(Date.now()))
const convertedDate = ref('')
const dateInput = ref<Date | null>(new Date())
const convertedTs = ref('')

let clockTimer: ReturnType<typeof setInterval> | null = null

function convertTsToDate() {
  const ts = Number(tsInput.value)
  if (isNaN(ts)) {
    ElMessage.error('请输入有效的数字时间戳')
    return
  }
  convertedDate.value = new Date(ts).toLocaleString()
}

function convertDateToTs() {
  if (!dateInput.value) return
  convertedTs.value = String(new Date(dateInput.value).getTime())
}

// Base64
const base64Input = ref('Hello, lean-electron-vue!')
const base64Output = ref('')

function encodeBase64() {
  try {
    base64Output.value = btoa(unescape(encodeURIComponent(base64Input.value)))
  } catch (e) {
    ElMessage.error('Base64 编码失败')
  }
}

function decodeBase64() {
  try {
    base64Output.value = decodeURIComponent(escape(atob(base64Input.value)))
  } catch (e) {
    ElMessage.error('Base64 解码失败，请检查输入')
  }
}

async function copyBase64() {
  if (!base64Output.value) return
  if (window.electronSystemApi) {
    await window.electronSystemApi.clipboardWriteText(base64Output.value)
  } else {
    await navigator.clipboard.writeText(base64Output.value)
  }
  ElMessage.success('已复制到剪贴板')
}

onMounted(() => {
  clockTimer = setInterval(() => {
    currentTimestamp.value = Date.now()
    currentDateStr.value = new Date().toLocaleString()
  }, 1000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})
</script>

<style scoped lang="scss">
.dev-toolbox-view {
  padding: 16px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    .sub-title {
      font-size: 12px;
      color: var(--el-text-color-secondary, #909399);
    }
  }
}

.tool-pane {
  padding: 6px 0;
}

.action-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.result-text {
  margin-top: 12px;
  font-weight: 600;
  color: $themeBase;
}

.current-time {
  font-size: 13px;
  color: var(--el-text-color-regular, #606266);
}
</style>
