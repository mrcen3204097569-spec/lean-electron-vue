<template>
  <div class="uuid-tool">
    <div class="options-bar">
      <el-button type="primary" size="small" @click="generate">生成 UUID / ID</el-button>
      <el-checkbox v-model="uppercase" @change="generate">大写</el-checkbox>
      <el-checkbox v-model="noHyphens" @change="generate">去除连字符 (-)</el-checkbox>
      <el-checkbox v-model="withQuotes" @change="generate">包含引号 ("")</el-checkbox>
      <span class="count-label">生成数量:</span>
      <el-input-number v-model="count" :min="1" :max="20" size="small" @change="generate" />
      <el-button size="small" @click="copyAll">复制全部</el-button>
    </div>

    <div class="list-container">
      <div v-for="(id, idx) in idList" :key="idx" class="id-row">
        <span class="idx">#{{ idx + 1 }}</span>
        <span class="id-text">{{ id }}</span>
        <el-button link type="primary" size="small" @click="copyOne(id)">复制</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="UuidTool">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const uppercase = ref(false)
const noHyphens = ref(false)
const withQuotes = ref(false)
const count = ref(5)
const idList = ref<string[]>([])

function generateUuid(): string {
  let u = crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
  if (noHyphens.value) u = u.replace(/-/g, '')
  if (uppercase.value) u = u.toUpperCase()
  if (withQuotes.value) u = `"${u}"`
  return u
}

function generate() {
  idList.value = Array.from({ length: count.value }, () => generateUuid())
}

async function copyOne(val: string) {
  if (window.electronSystemApi) {
    await window.electronSystemApi.clipboardWriteText(val)
  } else {
    await navigator.clipboard.writeText(val)
  }
  ElMessage.success('已复制')
}

async function copyAll() {
  const text = idList.value.join('\n')
  if (window.electronSystemApi) {
    await window.electronSystemApi.clipboardWriteText(text)
  } else {
    await navigator.clipboard.writeText(text)
  }
  ElMessage.success('已复制全部 ID')
}

generate()
</script>

<style scoped lang="scss">
.uuid-tool {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.options-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  .count-label {
    font-size: 13px;
    color: var(--el-text-color-regular, #606266);
  }
}
.list-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 280px;
  overflow-y: auto;
}
.id-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: var(--el-fill-color-light, #f5f7fa);
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 4px;
  font-family: Consolas, Monaco, monospace;
  font-size: 13px;
  .idx {
    color: #909399;
    font-size: 12px;
    margin-right: 8px;
  }
  .id-text {
    flex: 1;
    word-break: break-all;
  }
}
</style>
