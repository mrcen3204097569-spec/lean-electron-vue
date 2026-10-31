<template>
  <div class="html-entity-tool">
    <div class="action-bar">
      <el-button type="primary" size="small" @click="encodeEntities">转为实体 (Encode)</el-button>
      <el-button size="small" @click="decodeEntities">还原实体 (Decode)</el-button>
      <el-button size="small" @click="copyOutput">复制输出</el-button>
      <el-button size="small" @click="clearAll">清空</el-button>
    </div>

    <el-row :gutter="12">
      <el-col :span="12">
        <div class="area-label">输入内容:</div>
        <el-input
          v-model="inputContent"
          type="textarea"
          :rows="10"
          placeholder='例如: &lt;div class="container"&gt;1 &amp; 2 &gt; 0&lt;/div&gt;'
        />
      </el-col>
      <el-col :span="12">
        <div class="area-label">转换结果:</div>
        <el-input
          v-model="outputContent"
          type="textarea"
          :rows="10"
          readonly
          placeholder="转换结果将在此展示..."
        />
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup name="HtmlEntityTool">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const inputContent = ref(
  '<div id="main">\n  <p>Hello & Welcome to "lean-electron-vue"!</p>\n</div>'
)
const outputContent = ref('')

function encodeEntities() {
  const div = document.createElement('div')
  div.innerText = inputContent.value
  outputContent.value = div.innerHTML
}

function decodeEntities() {
  const div = document.createElement('div')
  div.innerHTML = inputContent.value
  outputContent.value = div.innerText
}

async function copyOutput() {
  if (!outputContent.value) return
  if (window.electronSystemApi) {
    await window.electronSystemApi.clipboardWriteText(outputContent.value)
  } else {
    await navigator.clipboard.writeText(outputContent.value)
  }
  ElMessage.success('已复制')
}

function clearAll() {
  inputContent.value = ''
  outputContent.value = ''
}

encodeEntities()
</script>

<style scoped lang="scss">
.html-entity-tool {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.action-bar {
  display: flex;
  gap: 8px;
}
.area-label {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--el-text-color-secondary, #909399);
}
</style>
