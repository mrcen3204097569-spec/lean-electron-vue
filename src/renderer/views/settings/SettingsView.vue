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
        <el-divider />
        <div class="setting-item">
          <div class="item-info">
            <span class="item-label">视窗预设分辨率</span>
            <span class="item-desc">快速将主视窗调整为标准分辨率</span>
          </div>
          <div class="preset-size-buttons">
            <el-button size="small" @click="setPresetSize(1024, 768)">1024 x 768</el-button>
            <el-button size="small" @click="setPresetSize(1280, 800)">1280 x 800</el-button>
            <el-button size="small" @click="setPresetSize(1440, 900)">1440 x 900</el-button>
            <el-button size="small" type="primary" plain @click="centerWindow">居中视窗</el-button>
          </div>
        </div>
      </el-card>

      <!-- 存储与缓存诊断管理 -->
      <el-card shadow="never" class="settings-card">
        <template #header>
          <div class="card-title">
            <el-icon><Delete /></el-icon>
            <span>缓存与存储诊断清理</span>
          </div>
        </template>
        <div class="setting-item">
          <div class="item-info">
            <span class="item-label">本地数据与磁盘缓存</span>
            <span class="item-desc">
              存储键数量: {{ storageKeyCount }} 项，估算占用: {{ storageSizeKb }} KB
            </span>
          </div>
          <el-button type="danger" plain size="small" @click="clearAppStorage">
            一键深度清理
          </el-button>
        </div>
      </el-card>

      <!-- 3. 声音与触觉反馈 -->
      <el-card shadow="never" class="settings-card">
        <template #header>
          <div class="card-title">
            <el-icon><Bell /></el-icon>
            <span>声音与交互反馈</span>
          </div>
        </template>
        <div class="setting-item">
          <div class="item-info">
            <span class="item-label">操作音效反馈</span>
            <span class="item-desc">在复制文本、完成番茄钟或切换开关时播放微交互提示音</span>
          </div>
          <el-switch v-model="soundEnabled" @change="handleSoundChange" />
        </div>
        <el-divider />
        <div class="setting-item">
          <div class="item-info">
            <span class="item-label">音效试听</span>
            <span class="item-desc">点击测试不同场景下的合成提示音</span>
          </div>
          <div class="sound-test-buttons">
            <el-button size="small" @click="testSound('click')">按钮微点击</el-button>
            <el-button size="small" @click="testSound('toggle')">开关声</el-button>
            <el-button size="small" type="success" plain @click="testSound('success')">
              成功提示音
            </el-button>
            <el-button size="small" type="warning" plain @click="testSound('alert')">
              警示提示音
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 4. 环境与服务接口 -->
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
import { Bell, Connection, Delete, InfoFilled, Monitor, Sunny } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { currentTheme, setTheme, type ThemeMode } from '@/common/theme'
import { isSoundEnabled, setSoundEnabled, playSound, type SoundType } from '@/common/sound'

const isDev = import.meta.env.DEV
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

const closeToTray = ref(false)
const openAtLogin = ref(false)
const soundEnabled = ref(isSoundEnabled.value)
const storageKeyCount = ref(0)
const storageSizeKb = ref(0)

function calculateStorage() {
  if (typeof localStorage === 'undefined') return
  storageKeyCount.value = localStorage.length
  let totalBytes = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) || ''
    const val = localStorage.getItem(key) || ''
    totalBytes += key.length + val.length
  }
  storageSizeKb.value = Math.round((totalBytes / 1024) * 10) / 10
}

async function setPresetSize(w: number, h: number) {
  if (window.electronWindowApi?.setPresetSize) {
    await window.electronWindowApi.setPresetSize(w, h)
    ElMessage.success(`窗口已调整为 ${w} x ${h}`)
  }
}

async function centerWindow() {
  if (window.electronWindowApi?.centerWindow) {
    await window.electronWindowApi.centerWindow()
    ElMessage.success('视窗已重新居中')
  }
}

async function clearAppStorage() {
  try {
    await ElMessageBox.confirm(
      '清理将删除所有本地持久化配置与缓存数据并重新载入，确认继续吗？',
      '提示',
      {
        type: 'warning',
        confirmButtonText: '确认清理',
        cancelButtonText: '取消'
      }
    )
    if (window.electronSystemApi?.clearStorageData) {
      await window.electronSystemApi.clearStorageData()
    }
    localStorage.clear()
    sessionStorage.clear()
    calculateStorage()
    ElMessage.success('缓存已清空，正在重载页面...')
    setTimeout(() => {
      window.location.reload()
    }, 500)
  } catch {
    // canceled
  }
}

function handleThemeChange(val: string | number | boolean | undefined) {
  if (typeof val === 'string') {
    setTheme(val as ThemeMode)
    playSound('toggle')
    ElMessage.success(
      `主题已切换为: ${val === 'auto' ? '跟随系统' : val === 'dark' ? '深色模式' : '浅色模式'}`
    )
  }
}

function handleSoundChange(val: boolean | string | number) {
  setSoundEnabled(Boolean(val))
  if (val) {
    playSound('success')
  }
  ElMessage.success(val ? '已开启音效反馈' : '已关闭音效反馈')
}

function testSound(type: SoundType) {
  playSound(type)
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
  calculateStorage()
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

  .sound-test-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
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
