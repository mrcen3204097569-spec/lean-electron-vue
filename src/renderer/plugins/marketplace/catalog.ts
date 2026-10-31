import type { PluginDefinition } from '../../../shared/plugin/types'
import { pomodoroPlugin } from './pomodoro'
import { clipboardPlugin } from './clipboard'
import { colorPalettePlugin } from './colorPalette'
import { apiClientPlugin } from './apiClient'
import { markdownNotebookPlugin } from './markdownNotebook'
import { snippetVaultPlugin } from './snippetVault'
import { expenseTrackerPlugin } from './expenseTracker'
import { habitTrackerPlugin } from './habitTracker'
import { canvasSketchPlugin } from './canvasSketch'
import { stopwatchPlugin } from './stopwatch'

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
  },
  {
    id: 'markdown-notebook',
    name: 'Markdown 实时笔记本',
    version: '1.0.0',
    author: 'DocCraft',
    description: '双栏即时渲染排版、常用语法快捷插入、字数统计与标准 Markdown 文件导出',
    icon: 'Document',
    stars: 189,
    downloads: '3.6k',
    category: 'productivity',
    tags: ['笔记', 'Markdown', '文档', '写作'],
    definition: markdownNotebookPlugin
  },
  {
    id: 'snippet-vault',
    name: '代码片段金库',
    version: '1.0.0',
    author: 'DevVault',
    description: '常用代码片段、脚手架与配置文件跨语言集中管理、按语言过滤与一键复制',
    icon: 'DocumentCopy',
    stars: 215,
    downloads: '4.2k',
    category: 'devtools',
    tags: ['代码', '片段', '开发', 'TypeScript'],
    definition: snippetVaultPlugin
  },
  {
    id: 'expense-tracker',
    name: '极简日常记账',
    version: '1.0.0',
    author: 'MoneyCraft',
    description: '收支流水记录、分类统计、净结余自动计算与本地 JSON 导出',
    icon: 'Wallet',
    stars: 145,
    downloads: '2.9k',
    category: 'productivity',
    tags: ['记账', '财务', '消费', '效率'],
    definition: expenseTrackerPlugin
  },
  {
    id: 'habit-tracker',
    name: '习惯打卡追踪',
    version: '1.0.0',
    author: 'HabitCraft',
    description: '自律习惯打卡、连续坚持天数记录与最近打卡热力方块可视化',
    icon: 'Calendar',
    stars: 167,
    downloads: '3.1k',
    category: 'productivity',
    tags: ['打卡', '习惯', '坚持', '自律'],
    definition: habitTrackerPlugin
  },
  {
    id: 'canvas-sketch',
    name: '草图白板涂鸦',
    version: '1.0.0',
    author: 'SketchLab',
    description: '轻量 HTML5 Canvas 手绘草图、流程涂鸦与一键导出 PNG 图像',
    icon: 'EditPen',
    stars: 112,
    downloads: '2.1k',
    category: 'utilities',
    tags: ['画板', '草图', '涂鸦', 'Canvas'],
    definition: canvasSketchPlugin
  },
  {
    id: 'stopwatch-timer',
    name: '高精度秒表与计次',
    version: '1.0.0',
    author: 'TimeCraft',
    description: '毫秒级秒表计时、支持分段计次 (Lap) 对比与耗时分析',
    icon: 'Timer',
    stars: 98,
    downloads: '1.5k',
    category: 'utilities',
    tags: ['秒表', '计时', 'Lap', '效率'],
    definition: stopwatchPlugin
  }
]
