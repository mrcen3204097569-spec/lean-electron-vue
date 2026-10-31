<template>
  <div class="color-tool">
    <div class="picker-row">
      <el-color-picker v-model="hexColor" show-alpha @change="handlePickerChange" />
      <span class="preview-swatch" :style="{ backgroundColor: hexColor }"></span>
      <span class="preview-text">{{ hexColor }}</span>
    </div>

    <div class="format-list">
      <div v-for="item in formats" :key="item.label" class="format-item">
        <span class="label">{{ item.label }}</span>
        <el-input :model-value="item.value" size="small" readonly>
          <template #append>
            <el-button @click="copyVal(item.value)">复制</el-button>
          </template>
        </el-input>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="ColorTool">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const hexColor = ref('#409eff')

function hexToRgb(hex: string): { r: number; g: number; b: number; a: number } {
  let c = hex.replace('#', '')
  if (c.length === 3)
    c = c
      .split('')
      .map((x) => x + x)
      .join('')
  if (c.length === 6) c += 'ff'
  const num = parseInt(c, 16)
  return {
    r: (num >> 24) & 255,
    g: (num >> 16) & 255,
    b: (num >> 8) & 255,
    a: Math.round(((num & 255) / 255) * 100) / 100
  }
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

const formats = computed(() => {
  const { r, g, b, a } = hexToRgb(hexColor.value)
  const { h, s, l } = rgbToHsl(r, g, b)

  return [
    { label: 'HEX', value: hexColor.value.toUpperCase() },
    { label: 'RGB', value: `rgb(${r}, ${g}, ${b})` },
    { label: 'RGBA', value: `rgba(${r}, ${g}, ${b}, ${a})` },
    { label: 'HSL', value: `hsl(${h}, ${s}%, ${l}%)` },
    { label: 'HSLA', value: `hsla(${h}, ${s}%, ${l}%, ${a})` }
  ]
})

function handlePickerChange(val: string | null) {
  if (val) hexColor.value = val
}

async function copyVal(val: string) {
  if (window.electronSystemApi) {
    await window.electronSystemApi.clipboardWriteText(val)
  } else {
    await navigator.clipboard.writeText(val)
  }
  ElMessage.success('已复制色彩代码')
}
</script>

<style scoped lang="scss">
.color-tool {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.picker-row {
  display: flex;
  align-items: center;
  gap: 12px;
  .preview-swatch {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: 1px solid var(--el-border-color, #dcdfe6);
  }
  .preview-text {
    font-family: Consolas, Monaco, monospace;
    font-size: 15px;
    font-weight: 600;
  }
}
.format-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.format-item {
  display: flex;
  align-items: center;
  gap: 12px;
  .label {
    width: 60px;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-secondary, #909399);
  }
}
</style>
