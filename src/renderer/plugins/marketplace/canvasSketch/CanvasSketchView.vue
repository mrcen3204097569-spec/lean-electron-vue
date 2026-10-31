<template>
  <div class="canvas-sketch-view">
    <div class="view-header">
      <div class="header-left">
        <h2>草图白板涂鸦 (Canvas Sketchpad)</h2>
        <span class="sub-desc">灵感手绘草图、流程涂鸦与一键导出图片</span>
      </div>
      <div class="header-actions">
        <el-button size="small" @click="clearCanvas">清空画布</el-button>
        <el-button type="primary" size="small" @click="downloadPng">导出 PNG</el-button>
      </div>
    </div>

    <!-- 绘制工具栏 -->
    <div class="sketch-tools">
      <div class="tool-item">
        <span class="label">画笔颜色:</span>
        <el-color-picker v-model="strokeColor" size="small" />
      </div>

      <div class="tool-item">
        <span class="label">画笔粗细: {{ strokeWidth }}px</span>
        <el-slider v-model="strokeWidth" :min="1" :max="20" style="width: 140px" />
      </div>

      <div class="tool-item">
        <el-checkbox v-model="isEraser">橡皮擦模式</el-checkbox>
      </div>
    </div>

    <!-- 画布主体 -->
    <div class="canvas-container">
      <canvas
        ref="canvasRef"
        width="900"
        height="480"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
      ></canvas>
    </div>
  </div>
</template>

<script lang="ts" setup name="CanvasSketchView">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const strokeColor = ref('#409eff')
const strokeWidth = ref(4)
const isEraser = ref(false)

let isDrawing = false
let ctx: CanvasRenderingContext2D | null = null

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 900, 480)
    }
  }
})

function getCoords(e: MouseEvent) {
  if (!canvasRef.value) return { x: 0, y: 0 }
  const rect = canvasRef.value.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
}

function startDrawing(e: MouseEvent) {
  if (!ctx) return
  isDrawing = true
  const { x, y } = getCoords(e)
  ctx.beginPath()
  ctx.moveTo(x, y)
}

function draw(e: MouseEvent) {
  if (!isDrawing || !ctx) return
  const { x, y } = getCoords(e)
  ctx.lineWidth = strokeWidth.value
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (isEraser.value) {
    ctx.strokeStyle = '#ffffff'
  } else {
    ctx.strokeStyle = strokeColor.value
  }

  ctx.lineTo(x, y)
  ctx.stroke()
}

function stopDrawing() {
  if (!isDrawing || !ctx) return
  isDrawing = false
  ctx.closePath()
}

function clearCanvas() {
  if (!ctx || !canvasRef.value) return
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  ElMessage.info('画布已重置')
}

function downloadPng() {
  if (!canvasRef.value) return
  const dataUrl = canvasRef.value.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `sketch-${Date.now()}.png`
  a.click()
  ElMessage.success('草图已导出为 PNG 图像')
}
</script>

<style scoped lang="scss">
.canvas-sketch-view {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .header-left {
    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    .sub-desc {
      font-size: 12px;
      color: var(--el-text-color-secondary, #909399);
    }
  }
}
.sketch-tools {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 8px 14px;
  background: var(--el-fill-color-light, #f5f7fa);
  border-radius: 6px;
  .tool-item {
    display: flex;
    align-items: center;
    gap: 8px;
    .label {
      font-size: 12px;
      font-weight: 500;
    }
  }
}
.canvas-container {
  display: flex;
  justify-content: center;
  canvas {
    border: 1px solid var(--el-border-color, #dcdfe6);
    border-radius: 6px;
    background: #ffffff;
    cursor: crosshair;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
}
</style>
