<template>
  <div class="color-palette-view">
    <div class="view-header">
      <div class="header-left">
        <h2>设计调色盘与色彩对比度</h2>
        <span class="sub-desc">
          精选现代设计系统色板，点击色块快速复制 Hex/RGB，内置 WCAG 可访问性对比度测试
        </span>
      </div>
      <div class="header-right">
        <el-radio-group v-model="selectedPaletteKey" size="default">
          <el-radio-button v-for="p in palettes" :key="p.key" :value="p.key" :label="p.name" />
        </el-radio-group>
      </div>
    </div>

    <!-- 色彩卡片列表 -->
    <div class="color-grid">
      <div
        v-for="color in activePalette.colors"
        :key="color.hex"
        class="color-card"
        @click="copyColor(color.hex)"
      >
        <div class="color-preview" :style="{ backgroundColor: color.hex }">
          <span class="click-tip">点击复制</span>
        </div>
        <div class="color-info">
          <div class="color-name">{{ color.name }}</div>
          <div class="color-hex">{{ color.hex }}</div>
        </div>
      </div>
    </div>

    <!-- WCAG 色彩对比度检测工作台 -->
    <div class="contrast-tool">
      <h3>🎨 WCAG 文本可访问性对比度检测</h3>
      <div class="contrast-row">
        <div class="color-picker-item">
          <span class="picker-label">文字前景色：</span>
          <el-color-picker v-model="fgColor" />
          <span class="picker-val">{{ fgColor }}</span>
        </div>
        <div class="color-picker-item">
          <span class="picker-label">背景色：</span>
          <el-color-picker v-model="bgColor" />
          <span class="picker-val">{{ bgColor }}</span>
        </div>

        <div class="contrast-result">
          <span class="contrast-ratio">对比度: {{ contrastRatio.toFixed(2) }}:1</span>
          <el-tag :type="contrastRatio >= 4.5 ? 'success' : 'danger'" effect="dark">
            {{ contrastRatio >= 4.5 ? '符合 AA 级标准 (正常文本)' : '未达到 AA 级标准' }}
          </el-tag>
        </div>
      </div>

      <div class="preview-box" :style="{ color: fgColor, backgroundColor: bgColor }">
        <div class="preview-title">实时排版视觉预览</div>
        <div class="preview-text">
          精良的设计不仅仅是外观与感觉，设计是它的运作方式。优质的色彩对比度能让所有用户都享受清晰舒适的阅读体验。
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="ColorPaletteView">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

interface ColorItem {
  name: string
  hex: string
}

interface PaletteGroup {
  key: string
  name: string
  colors: ColorItem[]
}

const palettes: PaletteGroup[] = [
  {
    key: 'apple',
    name: 'Apple 风格',
    colors: [
      { name: 'System Blue', hex: '#007AFF' },
      { name: 'System Purple', hex: '#AF52DE' },
      { name: 'System Pink', hex: '#FF2D55' },
      { name: 'System Orange', hex: '#FF9500' },
      { name: 'System Green', hex: '#34C759' },
      { name: 'System Teal', hex: '#5AC8FA' },
      { name: 'System Indigo', hex: '#5856D6' },
      { name: 'System Gray', hex: '#8E8E93' }
    ]
  },
  {
    key: 'tailwind',
    name: 'Tailwind 经典',
    colors: [
      { name: 'Slate 500', hex: '#64748B' },
      { name: 'Sky 500', hex: '#0EA5E9' },
      { name: 'Indigo 500', hex: '#6366F1' },
      { name: 'Violet 500', hex: '#8B5CF6' },
      { name: 'Rose 500', hex: '#F43F5E' },
      { name: 'Amber 500', hex: '#F59E0B' },
      { name: 'Emerald 500', hex: '#10B981' },
      { name: 'Cyan 500', hex: '#06B6D4' }
    ]
  },
  {
    key: 'nord',
    name: 'Nord 极地',
    colors: [
      { name: 'Polar Night 1', hex: '#2E3440' },
      { name: 'Polar Night 2', hex: '#3B4252' },
      { name: 'Frost Blue 1', hex: '#88C0D0' },
      { name: 'Frost Blue 2', hex: '#81A1C1' },
      { name: 'Frost Deep', hex: '#5E81AC' },
      { name: 'Aurora Red', hex: '#BF616A' },
      { name: 'Aurora Yellow', hex: '#EBCB8B' },
      { name: 'Aurora Green', hex: '#A3BE8C' }
    ]
  }
]

const selectedPaletteKey = ref('apple')
const activePalette = computed(() => {
  return palettes.find((p) => p.key === selectedPaletteKey.value) || palettes[0]
})

const fgColor = ref('#1F2937')
const bgColor = ref('#F9FAFB')

const getLuminance = (hex: string) => {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

const contrastRatio = computed(() => {
  try {
    const l1 = getLuminance(fgColor.value)
    const l2 = getLuminance(bgColor.value)
    const bright = Math.max(l1, l2)
    const dark = Math.min(l1, l2)
    return (bright + 0.05) / (dark + 0.05)
  } catch {
    return 1
  }
})

const copyColor = async (hex: string) => {
  try {
    await window.electronSystemApi?.clipboardWriteText(hex)
    ElMessage.success(`已复制 ${hex} 到剪贴板`)
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped lang="scss">
.color-palette-view {
  padding: 24px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    margin: 0 0 6px 0;
    font-size: 20px;
  }

  .sub-desc {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 36px;
}

.color-card {
  background: var(--el-bg-color, #ffffff);
  border: 1px solid var(--el-border-color-lighter, #e4e7ed);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);

    .click-tip {
      opacity: 1;
    }
  }

  .color-preview {
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    .click-tip {
      opacity: 0;
      transition: opacity 0.2s ease;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
    }
  }

  .color-info {
    padding: 10px 12px;

    .color-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .color-hex {
      font-size: 12px;
      font-family: monospace;
      color: var(--el-text-color-secondary);
      margin-top: 2px;
    }
  }
}

.contrast-tool {
  background: var(--el-bg-color, #ffffff);
  border: 1px solid var(--el-border-color-lighter, #e4e7ed);
  border-radius: 14px;
  padding: 20px;

  h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
  }

  .contrast-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 24px;
    margin-bottom: 16px;

    .color-picker-item {
      display: flex;
      align-items: center;
      gap: 8px;

      .picker-label {
        font-size: 13px;
        color: var(--el-text-color-regular);
      }

      .picker-val {
        font-family: monospace;
        font-size: 13px;
      }
    }

    .contrast-result {
      display: flex;
      align-items: center;
      gap: 12px;

      .contrast-ratio {
        font-size: 16px;
        font-weight: 700;
      }
    }
  }

  .preview-box {
    border-radius: 10px;
    padding: 20px;
    border: 1px solid var(--el-border-color-lighter);
    transition: all 0.2s ease;

    .preview-title {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .preview-text {
      font-size: 14px;
      line-height: 1.6;
    }
  }
}
</style>
