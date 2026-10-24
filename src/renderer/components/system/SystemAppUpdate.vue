<template>
  <transition
    enter-active-class="animate__animated animate__fadeIn"
    leave-active-class="animate__animated animate__fadeOut"
  >
    <div v-if="status !== EUpdateStatus.NOT_UPDATE" class="c-system-app-update">
      <div class="animate__animated animate__zoomIn box">
        <div class="head">
          <div class="head__title">{{ title }}</div>
          <div class="head__version">{{ version ? `v.${version}` : '' }}</div>
        </div>
        <div class="content">
          <div class="content__subtitle">{{ subTitle }}</div>
          <div class="content__info">{{ content }}</div>
        </div>

        <!--有更新，等待手动点击更新-->
        <div v-if="status === EUpdateStatus.WAIT_UPDATE" class="footer">
          <el-button @click="downStart">立即下载</el-button>
        </div>

        <!--下载中-->
        <div v-if="status === EUpdateStatus.DOWN_ING" class="footer">
          <el-progress :text-inside="true" :stroke-width="26" :percentage="downPercentage" />
        </div>

        <!--下载完成-->
        <div v-if="status === EUpdateStatus.DOWN_END" class="footer">
          <el-button @click="appInstall">立即安装</el-button>
        </div>

        <div
          class="animate__animated animate__fadeInDown close"
          @click="status = EUpdateStatus.NOT_UPDATE"
        >
          <el-icon>
            <CloseBold />
          </el-icon>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup name="SystemAppUpdate">
import { CloseBold } from '@element-plus/icons-vue'

enum EUpdateStatus {
  NOT_UPDATE = 0,
  WAIT_UPDATE = 1,
  DOWN_ING = 2,
  DOWN_END = 3
}

const status = ref(EUpdateStatus.NOT_UPDATE)

const title = ref('')
const subTitle = ref('')
const version = ref('')
const content = ref('')

const downPercentage = ref(0)

const updateCheck = () => {
  // 询问是否需要更新
  window.electronAppUpdateApi?.updateCheck()
}

const downStart = () => {
  // 下载开始
  window.electronAppUpdateApi?.downStart()
}

const appInstall = () => {
  // 安装app
  window.electronAppUpdateApi?.appInstall()
}

onMounted(() => {
  // 监听验证更新结果
  window.electronAppUpdateApi?.validateUpdateNotice(
    (
      event,
      info: { version: string; updateTitle: string; updateSubTitle: string; updateContent: string }
    ) => {
      console.log('更新验证结果：', info)
      if (info) {
        status.value = EUpdateStatus.WAIT_UPDATE
        title.value = info.updateTitle
        subTitle.value = info.updateSubTitle
        content.value = info.updateContent
        version.value = info.version
      }
    }
  )

  // 下载中ing
  window.electronAppUpdateApi?.downProgress((event, info) => {
    console.log('下载中ing：', event, info)
    status.value = EUpdateStatus.DOWN_ING
    downPercentage.value = info.percent
  })

  // 下载结束
  window.electronAppUpdateApi?.downComplete(() => {
    console.log('下载结束')
    status.value = EUpdateStatus.DOWN_END
  })

  // 询问是否需要更新
  updateCheck()
})
</script>

<style scoped lang="scss">
.c-system-app-update {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  animation-duration: 0.15s !important;
}

.box {
  background-color: #7d85d4;
  min-width: 20rem;
  min-height: 15rem;
  position: relative;
  display: flex;
  flex-direction: column;
  animation-duration: 0.25s !important;
  animation-delay: 0.15s;

  .head {
    height: 5rem;
    width: 100%;
    color: #fff;
    font-weight: 600;
    padding: 0.5rem;
    box-sizing: border-box;
    text-align: center;

    .head__title {
      font-size: 1.3rem;
      overflow-wrap: anywhere;
    }

    .head__version {
      font-size: 0.9rem;
    }
  }

  .content {
    flex-grow: 2;
    height: 70%;
    background-color: #fff;
    width: 100%;
    padding: 0.5rem;
    box-sizing: border-box;
    text-align: center;
    display: flex;
    flex-direction: column;

    .content__subtitle {
      font-weight: 600;
      padding: 0.5rem;
      overflow-wrap: anywhere;
    }

    .content__info {
      flex-grow: 2;
      display: flex;
      justify-content: center;
      align-items: center;
      color: $themeBase;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
  }

  .footer {
    padding: 0.5rem;
    box-sizing: border-box;
    background-color: #fff;
  }
}

.hr {
  width: 100%;
}

.close {
  cursor: pointer;
  position: absolute;
  left: calc(50% - 1.25rem);
  bottom: -3.5rem;
  color: #fff;
  height: 2.5rem;
  width: 2.5rem;
  border: 0.1rem solid #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
