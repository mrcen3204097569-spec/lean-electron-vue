<template>
  <div class="regex-tool">
    <div class="regex-input-bar">
      <span class="regex-slash">/</span>
      <el-input
        v-model="pattern"
        placeholder="输入正则表达式（如 \b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b）"
        @input="executeRegex"
      />
      <span class="regex-slash">/</span>
      <el-input
        v-model="flags"
        placeholder="修饰符 (gimsu)"
        style="width: 100px"
        @input="executeRegex"
      />
      <el-dropdown trigger="click" @command="applyPreset">
        <el-button size="small">常用预设模板 ▼</el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="email">邮箱地址</el-dropdown-item>
            <el-dropdown-item command="phone">中国大陆手机号</el-dropdown-item>
            <el-dropdown-item command="url">HTTP / HTTPS 网址</el-dropdown-item>
            <el-dropdown-item command="ipv4">IPv4 地址</el-dropdown-item>
            <el-dropdown-item command="idcard">18位身份证号</el-dropdown-item>
            <el-dropdown-item command="chinese">纯中文字符</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div class="test-area">
      <div class="area-label">测试文本 (Test String):</div>
      <el-input
        v-model="testString"
        type="textarea"
        :rows="5"
        placeholder="在此粘贴测试文本..."
        @input="executeRegex"
      />
    </div>

    <div class="matches-panel">
      <div class="panel-header">
        <span>匹配结果 ({{ matches.length }} 处命中)</span>
        <el-tag v-if="errorMsg" type="danger" size="small">{{ errorMsg }}</el-tag>
      </div>
      <div v-if="matches.length" class="match-list">
        <div v-for="(m, i) in matches" :key="i" class="match-item">
          <span class="idx">#{{ i + 1 }}</span>
          <span class="val">{{ m.text }}</span>
          <span class="pos">[位置: {{ m.index }} ~ {{ m.index + m.text.length }}]</span>
        </div>
      </div>
      <div v-else-if="!errorMsg" class="empty-hint">暂无匹配内容</div>
    </div>
  </div>
</template>

<script lang="ts" setup name="RegexTool">
import { ref } from 'vue'

const pattern = ref('[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+')
const flags = ref('g')
const testString = ref('客服邮箱 support@example.com，技术支持 dev-team@lean.io 欢迎咨询。')
const errorMsg = ref('')

interface MatchInfo {
  text: string
  index: number
}

const matches = ref<MatchInfo[]>([])

const presets: Record<string, { pattern: string; flags: string; sample: string }> = {
  email: {
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'g',
    sample: '我的邮箱是 test.user@github.com 与 contact@lean.dev'
  },
  phone: {
    pattern: '1[3-9]\\d{9}',
    flags: 'g',
    sample: '联系电话: 13800138000, 紧急备用: 18912345678'
  },
  url: {
    pattern: 'https?:\\/\\/[\\w\\-\\.]+(?::\\d+)?(?:\\/[^\\s]*)?',
    flags: 'g',
    sample: '访问 https://github.com 和 http://localhost:5173 体验'
  },
  ipv4: {
    pattern:
      '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    sample: '内部 IP: 192.168.1.1, 网关: 10.0.0.254'
  },
  idcard: {
    pattern: '[1-9]\\d{5}(?:18|19|20)\\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]',
    flags: 'g',
    sample: '证件号示例: 110101199003072345'
  },
  chinese: {
    pattern: '[\\u4e00-\\u9fa5]+',
    flags: 'g',
    sample: '中英文混合: Hello 你好 World 世界！'
  }
}

function applyPreset(command: string) {
  const p = presets[command]
  if (p) {
    pattern.value = p.pattern
    flags.value = p.flags
    testString.value = p.sample
    executeRegex()
  }
}

function executeRegex() {
  errorMsg.value = ''
  matches.value = []
  if (!pattern.value || !testString.value) return

  try {
    const reg = new RegExp(pattern.value, flags.value)
    if (!flags.value.includes('g')) {
      const match = reg.exec(testString.value)
      if (match) {
        matches.value.push({ text: match[0], index: match.index })
      }
      return
    }

    let match: RegExpExecArray | null
    let count = 0
    while ((match = reg.exec(testString.value)) !== null && count < 200) {
      matches.value.push({ text: match[0], index: match.index })
      if (match[0].length === 0) reg.lastIndex++
      count++
    }
  } catch (err: any) {
    errorMsg.value = err?.message || '正则表达式语法无效'
  }
}

executeRegex()
</script>

<style scoped lang="scss">
.regex-tool {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.regex-input-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  .regex-slash {
    font-size: 18px;
    font-weight: bold;
    color: var(--el-text-color-placeholder, #a8abb2);
  }
}
.area-label {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--el-text-color-secondary, #909399);
}
.matches-panel {
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 6px;
  padding: 10px 14px;
  background: var(--el-fill-color-blank, #fff);
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
  }
}
.match-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
}
.match-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px;
  background: var(--el-fill-color-light, #f5f7fa);
  border-radius: 4px;
  font-family: Consolas, Monaco, monospace;
  font-size: 13px;
  .idx {
    color: #409eff;
    font-weight: bold;
  }
  .val {
    flex: 1;
    word-break: break-all;
    font-weight: 500;
  }
  .pos {
    color: #909399;
    font-size: 12px;
  }
}
.empty-hint {
  font-size: 13px;
  color: #909399;
  text-align: center;
  padding: 16px 0;
}
</style>
