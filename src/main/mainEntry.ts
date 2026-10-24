import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { installContentSecurityPolicy } from './use/ContentSecurityPolicy'
import { CustomScheme } from './use/CustomScheme'
import { getDevServerUrl } from './use/devServerUrl'
import { Updater } from './use/Updater'
import { WindowManage } from './use/WindowManage'
import { LogManage } from './use/LogManage'

// 开发时 Vite 和 CSP 的提示很吵。打包后保留警告，方便发现真正的安全配置问题。
if (!app.isPackaged) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'
}

let mainWindow: BrowserWindow | undefined

function focusMainWindow() {
  const win =
    mainWindow && !mainWindow.isDestroyed()
      ? mainWindow
      : BrowserWindow.getAllWindows().find((item) => !item.isDestroyed())
  if (!win) return
  if (win.isMinimized()) win.restore()
  win.show()
  win.focus()
}

// 开发插件用 IPC 通知刷新。只有未打包、且由插件拉起（存在 process.send）时才接受。
if (!app.isPackaged && typeof process.send === 'function') {
  process.on('message', (message: unknown) => {
    if (!message || typeof message !== 'object') return
    if ((message as { type?: unknown }).type !== 'reload-renderer') return
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) win.webContents.reload()
    }
  })
}

const gotSingleInstanceLock = app.requestSingleInstanceLock()
if (!gotSingleInstanceLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    focusMainWindow()
  })
}

app.whenReady().then(async () => {
  if (!gotSingleInstanceLock) return
  // 只有未打包的开发进程会看到 VITE_DEV_SERVER_URL。打包后忽略它，始终走 app://。
  const devServerUrl = getDevServerUrl()
  installContentSecurityPolicy(devServerUrl)

  const win = new BrowserWindow({
    // 设置为false不显示窗口，待主页面资源加载完成再手动显示
    show: false,
    // 无边框窗口
    frame: false,
    webPreferences: {
      // 打包后关闭开发者工具，避免额外命令行参数把调试入口留在正式包里
      devTools: !app.isPackaged,
      // 默认关闭 <webview>。启用前要确认页面不能加载不受信任的内容；
      // webview 的 preload 拥有 Node 能力，不能和主窗口共用。
      webviewTag: false,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      // 预加载js：用于暴露API给渲染进程
      preload: join(__dirname, 'preload', 'main.preload.js')
    }
  })
  mainWindow = win
  if (devServerUrl) {
    win.loadURL(devServerUrl).then(() => {
      if (!win.isDestroyed()) win.webContents.openDevTools()
    })
  } else {
    CustomScheme.registerScheme()
    win.loadURL(`app://index.html`)
  }

  // app更新：注册更新事件
  Updater.regUpdateEvent(win)

  // 注册调试 log
  LogManage.regMainWidow(win)

  // 窗口事件注册：ipcMain事件注册
  WindowManage.regWindowIpcMainEvent()

  // 窗口管理：窗口事件注册
  WindowManage.regWindowEvent(win)

  // 窗口管理：注册窗口创建处理
  WindowManage.regWindowCreateHandle(win)
})
