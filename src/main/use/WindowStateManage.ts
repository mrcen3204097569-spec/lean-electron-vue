import { app, BrowserWindow, screen, type Rectangle } from 'electron'
import fs from 'node:fs'
import path from 'node:path'

export interface WindowState {
  x?: number
  y?: number
  width: number
  height: number
  isMaximized: boolean
  isFullScreen: boolean
}

const DEFAULT_STATE: WindowState = {
  width: 1080,
  height: 720,
  isMaximized: false,
  isFullScreen: false
}

export class WindowStateManage {
  private static stateFilePath = path.join(app.getPath('userData'), 'window-state.json')
  private static state: WindowState = DEFAULT_STATE
  private static saveTimer: NodeJS.Timeout | null = null

  static loadState(): WindowState {
    try {
      if (fs.existsSync(WindowStateManage.stateFilePath)) {
        const raw = fs.readFileSync(WindowStateManage.stateFilePath, 'utf-8')
        const parsed = JSON.parse(raw)
        WindowStateManage.state = {
          ...DEFAULT_STATE,
          ...parsed
        }
      }
    } catch (e) {
      console.warn('[WindowState] 读取窗口状态失败，采用默认值:', e)
      WindowStateManage.state = { ...DEFAULT_STATE }
    }

    // 屏幕可用性校验（防止拔掉外接屏幕后窗口悬空在屏幕外）
    WindowStateManage.validateBoundsWithDisplays()
    return WindowStateManage.state
  }

  private static validateBoundsWithDisplays() {
    const { x, y, width, height } = WindowStateManage.state
    if (x === undefined || y === undefined) return

    const displays = screen.getAllDisplays()
    const isVisibleOnSomeDisplay = displays.some((display) => {
      const bounds: Rectangle = display.workArea
      return (
        x >= bounds.x &&
        x + width <= bounds.x + bounds.width + 100 &&
        y >= bounds.y &&
        y + height <= bounds.y + bounds.height + 100
      )
    })

    if (!isVisibleOnSomeDisplay) {
      // 自动居中到主屏幕工作区
      const primary = screen.getPrimaryDisplay().workArea
      WindowStateManage.state.x = Math.round(primary.x + (primary.width - width) / 2)
      WindowStateManage.state.y = Math.round(primary.y + (primary.height - height) / 2)
    }
  }

  static track(win: BrowserWindow) {
    const updateState = () => {
      if (win.isDestroyed()) return
      WindowStateManage.state.isMaximized = win.isMaximized()
      WindowStateManage.state.isFullScreen = win.isFullScreen()

      if (!win.isMaximized() && !win.isMinimized() && !win.isFullScreen()) {
        const bounds = win.getBounds()
        WindowStateManage.state.x = bounds.x
        WindowStateManage.state.y = bounds.y
        WindowStateManage.state.width = bounds.width
        WindowStateManage.state.height = bounds.height
      }

      // 防抖写入磁盘
      if (WindowStateManage.saveTimer) clearTimeout(WindowStateManage.saveTimer)
      WindowStateManage.saveTimer = setTimeout(() => {
        WindowStateManage.saveToFile()
      }, 500)
    }

    win.on('resize', updateState)
    win.on('move', updateState)
    win.on('close', () => {
      updateState()
      WindowStateManage.saveToFile()
    })
  }

  private static saveToFile() {
    try {
      const dir = path.dirname(WindowStateManage.stateFilePath)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(
        WindowStateManage.stateFilePath,
        JSON.stringify(WindowStateManage.state),
        'utf-8'
      )
    } catch (e) {
      console.error('[WindowState] 保存窗口状态失败:', e)
    }
  }
}
