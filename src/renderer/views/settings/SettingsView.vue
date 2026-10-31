<template>
  <div class="settings-view">
    <div class="view-header">
      <h2>系统设置</h2>
      <span class="sub-desc">个性化配置应用外观、窗口行为与系统参数</span>
    </div>

    <div class="settings-sections">
      <!-- 1. 外观偏好 -->
      <el-card shadow="never" class="settings-card">
        <template #header>
          <div class="card-title">
            <el-icon><Sunny /></el-icon>
            <span>外观偏好</span>
          </div>
        </template>
        <div class="setting-item">
          <div class="item-info">
            <span class="item-label">主题模式</span>
            <span class="item-desc">切换应用程序的明暗外观色彩</span>
          </div>
          <el-radio-group :model-value="currentTheme" @change="handleThemeChange">
            <el-radio-button value="auto">跟随系统</el-radio-button>
            <el-radio-button value="light">浅色模式</el-radio-button>
            <el-radio-button value="dark">深色模式</el-radio-button>
          </el-radio-group>
        </div>
      </el-card>

      <!-- 2. 窗口行为与托盘 -->
      <el-card shadow="never" class="settings-card">
        <template #header>
          <div class="card-title">
            <el-icon><Monitor /></el-icon>
            <span>窗口与系统托盘</span>
          </div>
        </template>
        <div class="setting-item">
          <div class="item-info">
            <span class="item-label">关闭时最小化到托盘</span>
            <span class="item-desc">点击右上角关闭按钮时，保持应用在系统托盘后台运行</span>
          </div>
          <el-switch v-model="closeToTray" @change="handleCloseToTrayChange" />
        </div>
        <el-divider />
        <div class="setting-item">
          <div class="item-info">
            <span class="item-label">开机自动启动</span>
            <span class="item-desc">操作系统登录后自动在后台拉起应用程序</span>
          </div>
          <el-switch v-model="openAtLogin" @change="handleLoginItemChange" />
        </div>
      </el-card>

      <!-- 3. 环境与服务接口 -->
      <el-card shadow="never" class="settings-card">
        <template #header>
          <div class="card-title">
            <el-icon><Connection /></el-icon>
            <span>环境与网络配置</span>
          </div>
        </template>
        <div class="setting-item">
          <div class="item-info">
            <span class="item-label">当前运行模式</span>
            <span class="item-desc">应用程序环境变量标识</span>
          </div>
          <el-tag :type="isDev ? 'warning' : 'success'">
            {{ isDev ? 'Development (开发环境)' : 'Production (生产环境)' }}
          </el-tag>
        </div>
        <el-divider />
        <div class="setting-item">
          <div class="item-info">
            <span class="item-label">后端 API 基础地址</span>
            <span class="item-desc">Axios 请求默认使用的 BaseURL</span>
          </div>
          <span class="api-url-text">{{ apiBaseUrl || '未配置（同源默认）' }}</span>
        </div>
      </el-card>

      <!-- 4. 关于与版本信息 -->
      <el-card shadow="never" class="settings-card">
        <template #header>
          <div class="card-title">
            <el-icon><InfoFilled /></el-icon>
            <span>关于应用</span>
          </div>
        </template>
        <div class="about-container">
          <div class="about-app">
            <img src="/vite.svg" alt="logo" class="about-logo" />
            <div class="about-details">
              <span class="app-title">lean-electron-vue</span>
              <span class="app-version">版本: v2.0.0 (支持插件化架构)</span>
              <span class="app-license">开源许可: MIT License</span>
            </div>
          </div>
          <div class="about-actions">
            <el-button type="primary" size="small" @click="checkForUpdates">检查新版本</el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup name="SettingsView">
import { Connection, InfoFilled, Monitor, Sunny } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { currentTheme, setTheme, type ThemeMode } from '@/common/theme'

const isDev = import.meta.env.DEV
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

const closeToTray = ref(false)
const openAtLogin = ref(false)

function handleThemeChange(val: string | number | boolean | undefined) {
  if (typeof val === 'string') {
    setTheme(val as ThemeMode)
    ElMessage.success(
      `主题已切换为: ${val === 'auto' ? '跟随系统' : val === 'dark' ? '深色模式' : '浅色模式'}`
    )
  }
}

async function handleCloseToTrayChange(val: boolean | string | number) {
  if (window.electronSystemApi) {
    await window.electronSystemApi.setCloseToTray(Boolean(val))
    ElMessage.success(val ? '已开启最小化到托盘' : '已关闭最小化到托盘')
  }
}

async function handleLoginItemChange(val: boolean | string | number) {
  if (window.electronSystemApi) {
    await window.electronSystemApi.setLoginItemSettings(Boolean(val))
    ElMessage.success(val ? '已开启开机自启' : '已关闭开机自启')
  }
}

function checkForUpdates() {
  if (window.electronAppUpdateApi) {
    window.electronAppUpdateApi.updateCheck()
    ElMessage.info('已发起版本检查请求')
  }
}

onMounted(async () => {
  if (window.electronSystemApi) {
    try {
      closeToTray.value = await window.electronSystemApi.getCloseToTray()
      const login = await window.electronSystemApi.getLoginItemSettings()
      openAtLogin.value = login.openAtLogin
    } catch (e) {
      console.error('加载系统设置失败', e)
    }
  }
})
</script>

<style scoped lang="scss">
.settings-view {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.view-header {
  margin-bottom: 24px;

  h2 {
    margin: 0 0 6px 0;
    font-size: 20px;
    font-weight: 600;
  }

  .sub-desc {
    font-size: 13px;
    color: var(--el-text-color-secondary, #909399);
  }
}

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settings-card {
  border-radius: 8px;

  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 14px;
    color: var(--el-text-color-primary, #303133);
  }
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;

  .item-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .item-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary, #303133);
  }

  .item-desc {
    font-size: 12px;
    color: var(--el-text-color-secondary, #909399);
  }

  .api-url-text {
    font-family: monospace;
    font-size: 12px;
    color: var(--el-text-color-regular, #606266);
    background: var(--el-fill-color-light, #f5f7fa);
    padding: 3px 8px;
    border-radius: 4px;
  }
}

.about-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;

  .about-app {
    display: flex;
    align-items: center;
    gap: 16px;

    .about-logo {
      width: 48px;
      height: 48px;
    }

    .about-details {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .app-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary, #303133);
      }

      .app-version,
      .app-license {
        font-size: 12px;
        color: var(--el-text-color-secondary, #909399);
      }
    }
  }
}
</style>
