import type { PluginDefinition } from '../../../shared/plugin/types'
import { pomodoroPlugin } from './pomodoro'
import { clipboardPlugin } from './clipboard'
import { colorPalettePlugin } from './colorPalette'
import { apiClientPlugin } from './apiClient'

export interface MarketplacePluginItem {
  id: string
  name: string
  version: string
  author: string
  description: string
  icon: string
  stars: number
  downloads: string
  category: 'productivity' | 'devtools' | 'utilities'
  tags: string[]
  definition: PluginDefinition
}

export const marketplaceCatalog: MarketplacePluginItem[] = [
  {
    id: 'pomodoro-timer',
    name: '番茄专注时钟',
    version: '1.0.0',
    author: 'FlowCraft Team',
    description: '科学的番茄工作法时钟，支持专注/休息倒计时、原生完成弹窗与累计时长统计',
    icon: 'AlarmClock',
    stars: 128,
    downloads: '2.4k',
    category: 'productivity',
    tags: ['番茄钟', '效率', '健康'],
    definition: pomodoroPlugin
  },
  {
    id: 'clipboard-history',
    name: '剪贴板历史卫士',
    version: '1.0.0',
    author: 'RayMaster',
    description: '自动追踪与持久化剪贴板文本记录，支持模糊搜索、一键回写系统剪贴板与单条清理',
    icon: 'DocumentCopy',
    stars: 256,
    downloads: '5.1k',
    category: 'utilities',
    tags: ['剪贴板', '历史', '系统'],
    definition: clipboardPlugin
  },
  {
    id: 'color-palette',
    name: '设计调色盘与对比度',
    version: '1.0.0',
    author: 'DesignOps',
    description: '内置 Apple、Tailwind、Nord 精品现代色卡，并提供 WCAG 文本可访问性对比度检测工具',
    icon: 'Brush',
    stars: 94,
    downloads: '1.8k',
    category: 'devtools',
    tags: ['设计', '配色', 'WCAG'],
    definition: colorPalettePlugin
  },
  {
    id: 'api-client',
    name: 'REST API 接口调试器',
    version: '1.0.0',
    author: 'API Craft',
    description:
      '轻量极速的 HTTP / REST 接口演练场，支持请求头参数配置、JSON 格式化与响应体实时解析',
    icon: 'Connection',
    stars: 312,
    downloads: '7.8k',
    category: 'devtools',
    tags: ['API', 'HTTP', '调试', '接口'],
    definition: apiClientPlugin
  }
]
