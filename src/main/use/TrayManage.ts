import { app, BrowserWindow, ipcMain, Menu, nativeImage, Tray } from 'electron'
import { IpcChannel } from '../../shared/electronApi'

// 16x16 简洁透明应用图标 Data URL，确保任何平台环境无需外部文件直接加载托盘
const DEFAULT_TRAY_ICON =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAExJREFUOE9jZKAQMFKon2HUAAYGBoa/DAwM52F8RkZGhn/omvEahq55vKqJMYxYjYx4DQxpYCRkGF7DRi5ghGJy08gYQ8oYMlQxDAwAcP8TET3r1V8AAAAASUVORK5CYII='

export class TrayManage {
  static tray: Tray | null = null
  static closeToTray = false
  static isQuitting = false

  static initTray(mainWindow: BrowserWindow) {
    if (TrayManage.tray) return

    const image = nativeImage.createFromDataURL(DEFAULT_TRAY_ICON)
    const tray = new Tray(image)
    TrayManage.tray = tray
    tray.setToolTip('lean-electron-vue')

    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示主窗口',
        click: () => {
          if (!mainWindow.isDestroyed()) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.show()
            mainWindow.focus()
          }
        }
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => {
          TrayManage.isQuitting = true
          app.quit()
        }
      }
    ])

    tray.setContextMenu(contextMenu)

    // 单击托盘图标切换窗口显示与隐藏
    tray.on('click', () => {
      if (!mainWindow.isDestroyed()) {
        if (mainWindow.isVisible()) {
          mainWindow.hide()
        } else {
          if (mainWindow.isMinimized()) mainWindow.restore()
          mainWindow.show()
          mainWindow.focus()
        }
      }
    })

    // 拦截主窗口关闭事件
    mainWindow.on('close', (event) => {
      if (TrayManage.closeToTray && !TrayManage.isQuitting) {
        event.preventDefault()
        mainWindow.hide()
      }
    })

    // 注册 IPC 控制
    ipcMain.handle(IpcChannel.trayGetCloseToTray, async () => {
      return TrayManage.closeToTray
    })

    ipcMain.handle(IpcChannel.traySetCloseToTray, async (_event, enabled: boolean) => {
      TrayManage.closeToTray = Boolean(enabled)
    })
  }

  static destroyTray() {
    if (TrayManage.tray) {
      TrayManage.tray.destroy()
      TrayManage.tray = null
    }
  }
}
