<template>
  <div class="c-system-bar-top">
    <div class="title">{{ title }}</div>

    <div class="options">
      <div class="options__item minimize">
        <el-button text plain :icon="Minus" @click="minimizeWindow"></el-button>
      </div>

      <div v-if="!windowIsMax" class="options__item maximize">
        <el-button text plain :icon="FullScreen" @click="maximizeWindow"></el-button>
      </div>

      <div v-if="windowIsMax" class="options__item maximize">
        <el-button text plain :icon="CopyDocument" @click="restoreWindow"></el-button>
      </div>

      <div class="options__item close">
        <el-button text plain :icon="Close" @click="closeWindow"></el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="SystemBarTop">
import { Close, CopyDocument, FullScreen, Minus } from '@element-plus/icons-vue'

withDefaults(defineProps<{ title?: string }>(), {
  title: '应用程序'
})

const windowIsMax = ref(false)

/**
 * 最大化窗口
 */
const maximizeWindow = () => {
  window.electronWindowApi?.maximizeWindow()
}

/**
 * 最小化窗口
 */
const minimizeWindow = () => {
  window.electronWindowApi?.minimizeWindow()
}

/**
 * 恢复窗口
 */
const restoreWindow = () => {
  window.electronWindowApi?.restoreWindow()
}

/**
 * 关闭窗口
 */
const closeWindow = () => {
  window.electronWindowApi?.closeWindow()
}

onMounted(() => {
  window.electronWindowApi?.onMaximizeWindow(() => {
    windowIsMax.value = true
  })

  window.electronWindowApi?.onUnMaximizeWindow(() => {
    windowIsMax.value = false
  })
})
</script>

<style scoped lang="scss">
.c-system-bar-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  width: 100%;
  box-shadow: 0 0.1rem 0.1rem rgba(0, 0, 0, 0.05);
}

.title {
  -webkit-app-region: drag;
  flex-grow: 2;
  text-align: left;
  padding: 0.5rem;
  box-sizing: border-box;
}

.options {
  display: flex;
  justify-content: space-around;
  align-items: center;

  .options__item {
    margin-right: 0.3rem;
  }
}
</style>
