<template>
  <div class="v-home">
    <!-- 头部欢迎区域 -->
    <div class="hero-banner">
      <div class="hero-content">
        <div class="hero-title-row">
          <img src="/vite.svg" alt="logo" class="hero-logo" />
          <h1 class="hero-title">lean-electron-vue</h1>
          <el-tag effect="dark" round class="version-tag">v2.0.0 Pro</el-tag>
        </div>
        <p class="hero-subtitle">
          开箱即用的现代化
          <strong>Vite + Electron + Vue 3 + TypeScript</strong>
          桌面应用开发模板
        </p>
        <div class="hero-badges">
          <el-tag size="small" type="primary">Electron 45</el-tag>
          <el-tag size="small" type="success">Vite 8</el-tag>
          <el-tag size="small" type="warning">Vue 3.5</el-tag>
          <el-tag size="small" type="info">TypeScript 6</el-tag>
          <el-tag size="small" color="#7d85d4" style="color: #fff">插件化架构</el-tag>
        </div>
      </div>
    </div>

    <!-- 快捷功能导航矩阵 -->
    <div class="features-section">
      <h3 class="section-title">功能导航与快速开始</h3>
      <el-row :gutter="16">
        <el-col :span="6">
          <el-card shadow="hover" class="feature-card" @click="goTo('/test')">
            <div class="card-icon-box" style="background: rgba(64, 158, 255, 0.12); color: #409eff">
              <el-icon :size="24"><Operation /></el-icon>
            </div>
            <h4>原生能力演示</h4>
            <p>测试文件对话框、剪贴板交互、系统原生通知与子窗口跨进程通信</p>
            <div class="card-arrow">
              <el-icon><Right /></el-icon>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card shadow="hover" class="feature-card" @click="goTo('/plugins')">
            <div class="card-icon-box" style="background: rgba(103, 194, 58, 0.12); color: #67c23a">
              <el-icon :size="24"><Grid /></el-icon>
            </div>
            <h4>插件扩展中心</h4>
            <p>体验热启停插件、动态路由注入、状态栏部件挂载与存储隔离</p>
            <div class="card-arrow">
              <el-icon><Right /></el-icon>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card shadow="hover" class="feature-card" @click="goTo('/settings')">
            <div class="card-icon-box" style="background: rgba(230, 162, 60, 0.12); color: #e6a23c">
              <el-icon :size="24"><Setting /></el-icon>
            </div>
            <h4>系统个性化设置</h4>
            <p>切换明暗暗黑主题模式、配置系统托盘关闭行为与开机自启动</p>
            <div class="card-arrow">
              <el-icon><Right /></el-icon>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card shadow="hover" class="feature-card" @click="triggerUpdateCheck">
            <div
              class="card-icon-box"
              style="background: rgba(125, 133, 212, 0.15); color: #7d85d4"
            >
              <el-icon :size="24"><Refresh /></el-icon>
            </div>
            <h4>在线更新演练</h4>
            <p>基于 electron-updater 的全自动增量下载与就绪安装更新流程</p>
            <div class="card-arrow">
              <el-icon><Right /></el-icon>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 运行环境与插件状态概览 -->
    <div class="overview-section">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-card shadow="never" class="info-card">
            <template #header>
              <div class="info-card-header">
                <el-icon><Monitor /></el-icon>
                <span>架构特性亮点</span>
              </div>
            </template>
            <ul class="feature-list">
              <li>
                ⚡
                <strong>极致精简构建流程</strong>
                ：两个轻量自定义 Vite 插件替代臃肿方案，透明可控
              </li>
              <li>
                🛡️
                <strong>默认企业级安全沙箱</strong>
                ：上下文隔离、CSP安全策略、子窗口白名单管控
              </li>
              <li>
                📦
                <strong>自定义 app:// 协议</strong>
                ：单页路由直接支持 history 模式刷新
              </li>
              <li>
                🧩
                <strong>原生插件系统 SDK</strong>
                ：支持视图、状态栏、快捷操作及事件通信扩展
              </li>
            </ul>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card shadow="never" class="info-card">
            <template #header>
              <div class="info-card-header">
                <el-icon><InfoFilled /></el-icon>
                <span>当前就绪状态</span>
              </div>
            </template>
            <div class="status-summary">
              <div class="summary-item">
                <span class="label">已载入插件：</span>
                <el-tag size="small">{{ pluginCount }} 个已注册</el-tag>
              </div>
              <div class="summary-item">
                <span class="label">窗口管理：</span>
                <el-tag size="small" type="success">无边框 + 托盘双向联动</el-tag>
              </div>
              <div class="summary-item">
                <span class="label">进程间通信：</span>
                <el-tag size="small" type="info">强类型 IPC 契约保证</el-tag>
              </div>
              <div class="summary-item">
                <span class="label">单实例锁：</span>
                <el-tag size="small" type="warning">已启用（聚焦主窗口）</el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts" setup name="HomeView">
import {
  Grid,
  InfoFilled,
  Monitor,
  Operation,
  Refresh,
  Right,
  Setting
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { pluginManager } from '@/plugin/pluginManager'

const router = useRouter()

const pluginCount = computed(() => pluginManager.allPlugins.value.length)

function goTo(path: string) {
  void router.push(path)
}

function triggerUpdateCheck() {
  if (window.electronAppUpdateApi) {
    window.electronAppUpdateApi.updateCheck()
    ElMessage.info('已向主进程发起更新检查')
  }
}
</script>

<style scoped lang="scss">
.v-home {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-banner {
  background: linear-gradient(135deg, rgba(125, 133, 212, 0.12) 0%, rgba(64, 158, 255, 0.08) 100%);
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;

  .hero-title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;

    .hero-logo {
      width: 36px;
      height: 36px;
    }

    .hero-title {
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      color: var(--el-text-color-primary, #303133);
      letter-spacing: -0.5px;
    }

    .version-tag {
      background-color: $themeBase;
      border: none;
    }
  }

  .hero-subtitle {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: var(--el-text-color-regular, #606266);
    line-height: 1.6;
  }

  .hero-badges {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
}

.features-section {
  margin-bottom: 24px;
}

.feature-card {
  cursor: pointer;
  border-radius: 8px;
  height: 100%;
  transition: all 0.25s ease;
  position: relative;

  &:hover {
    transform: translateY(-3px);
    border-color: $themeBase;

    .card-arrow {
      color: $themeBase;
      transform: translateX(4px);
    }
  }

  .card-icon-box {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 12px;
  }

  h4 {
    margin: 0 0 6px 0;
    font-size: 15px;
    font-weight: 600;
  }

  p {
    margin: 0 0 16px 0;
    font-size: 12px;
    color: var(--el-text-color-secondary, #909399);
    line-height: 1.5;
    min-height: 36px;
  }

  .card-arrow {
    position: absolute;
    bottom: 16px;
    right: 16px;
    color: var(--el-text-color-placeholder, #c0c4cc);
    transition: all 0.2s ease;
  }
}

.overview-section {
  .info-card {
    border-radius: 8px;
    height: 100%;

    .info-card-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 14px;
    }
  }

  .feature-list {
    margin: 0;
    padding-left: 18px;
    font-size: 13px;
    color: var(--el-text-color-regular, #606266);
    line-height: 1.9;
  }

  .status-summary {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;

      .label {
        color: var(--el-text-color-regular, #606266);
      }
    }
  }
}
</style>
