<template>
  <div class="css-visualizer-tool">
    <el-tabs v-model="subTab" class="inner-tabs">
      <el-tab-pane label="渐变生成器 (Gradient)" name="gradient">
        <div class="gradient-section">
          <div class="preview-box" :style="{ background: gradientCss }"></div>

          <div class="controls-grid">
            <div class="ctrl-row">
              <span class="label">渐变类型:</span>
              <el-radio-group v-model="gradientType" size="small">
                <el-radio-button value="linear">线性 (Linear)</el-radio-button>
                <el-radio-button value="radial">径向 (Radial)</el-radio-button>
              </el-radio-group>
            </div>

            <div v-if="gradientType === 'linear'" class="ctrl-row">
              <span class="label">渐变角度: {{ gradientAngle }}deg</span>
              <el-slider v-model="gradientAngle" :min="0" :max="360" />
            </div>

            <div class="ctrl-row">
              <span class="label">起始颜色:</span>
              <el-color-picker v-model="gradColor1" show-alpha />
              <span class="label" style="margin-left: 16px">终止颜色:</span>
              <el-color-picker v-model="gradColor2" show-alpha />
            </div>

            <div class="code-output">
              <el-input :model-value="`background: ${gradientCss};`" readonly size="small">
                <template #append>
                  <el-button @click="copyCss(`background: ${gradientCss};`)">复制代码</el-button>
                </template>
              </el-input>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="阴影生成器 (Box Shadow)" name="shadow">
        <div class="shadow-section">
          <div class="shadow-preview-container">
            <div class="shadow-box" :style="{ boxShadow: shadowCss }">预览卡片</div>
          </div>

          <div class="controls-grid">
            <el-row :gutter="16">
              <el-col :span="12">
                <span class="label">水平偏移 X: {{ shadowX }}px</span>
                <el-slider v-model="shadowX" :min="-50" :max="50" />
              </el-col>
              <el-col :span="12">
                <span class="label">垂直偏移 Y: {{ shadowY }}px</span>
                <el-slider v-model="shadowY" :min="-50" :max="50" />
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <span class="label">模糊半径 Blur: {{ shadowBlur }}px</span>
                <el-slider v-model="shadowBlur" :min="0" :max="100" />
              </el-col>
              <el-col :span="12">
                <span class="label">扩散半径 Spread: {{ shadowSpread }}px</span>
                <el-slider v-model="shadowSpread" :min="-20" :max="50" />
              </el-col>
            </el-row>
            <div class="ctrl-row">
              <span class="label">阴影颜色:</span>
              <el-color-picker v-model="shadowColor" show-alpha />
              <el-checkbox v-model="shadowInset" style="margin-left: 16px">
                内阴影 (Inset)
              </el-checkbox>
            </div>

            <div class="code-output">
              <el-input :model-value="`box-shadow: ${shadowCss};`" readonly size="small">
                <template #append>
                  <el-button @click="copyCss(`box-shadow: ${shadowCss};`)">复制代码</el-button>
                </template>
              </el-input>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup name="CssVisualizerTool">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const subTab = ref('gradient')

// Gradient
const gradientType = ref<'linear' | 'radial'>('linear')
const gradientAngle = ref(135)
const gradColor1 = ref('#667eea')
const gradColor2 = ref('#764ba2')

const gradientCss = computed(() => {
  if (gradientType.value === 'radial') {
    return `radial-gradient(circle, ${gradColor1.value} 0%, ${gradColor2.value} 100%)`
  }
  return `linear-gradient(${gradientAngle.value}deg, ${gradColor1.value} 0%, ${gradColor2.value} 100%)`
})

// Box Shadow
const shadowX = ref(0)
const shadowY = ref(10)
const shadowBlur = ref(25)
const shadowSpread = ref(-5)
const shadowColor = ref('rgba(0, 0, 0, 0.25)')
const shadowInset = ref(false)

const shadowCss = computed(() => {
  const inset = shadowInset.value ? 'inset ' : ''
  return `${inset}${shadowX.value}px ${shadowY.value}px ${shadowBlur.value}px ${shadowSpread.value}px ${shadowColor.value}`
})

async function copyCss(val: string) {
  if (window.electronSystemApi) {
    await window.electronSystemApi.clipboardWriteText(val)
  } else {
    await navigator.clipboard.writeText(val)
  }
  ElMessage.success('已复制 CSS 样式代码')
}
</script>

<style scoped lang="scss">
.css-visualizer-tool {
  display: flex;
  flex-direction: column;
}
.preview-box {
  width: 100%;
  height: 120px;
  border-radius: 8px;
  margin-bottom: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.shadow-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 140px;
  background: var(--el-fill-color-light, #f5f7fa);
  border-radius: 8px;
  margin-bottom: 14px;
}
.shadow-box {
  width: 140px;
  height: 80px;
  background: #ffffff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #303133;
}
.controls-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ctrl-row {
  display: flex;
  align-items: center;
  .label {
    font-size: 13px;
    font-weight: 500;
    margin-right: 12px;
    color: var(--el-text-color-regular, #606266);
  }
}
.label {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-regular, #606266);
}
.code-output {
  margin-top: 6px;
}
</style>
