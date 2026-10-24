import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { CustomScheme } from './use/CustomScheme'
import { getDevServerUrl } from './use/devServerUrl'
import { Updater } from './use/Updater'
import { WindowManage } from './use/WindowManage'
import { LogManage } from './use/LogManage'

// 屏蔽electron console 控制台警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

let mainWindow: BrowserWindow

app.whenReady().then(async () => {
  mainWindow = new BrowserWindow({
    // 设置为false不显示窗口，待主页面资源加载完成再手动显示
    show: false,
    // 无边框窗口
    frame: false,
    webPreferences: {
      // 打包后关闭开发者工具，避免额外命令行参数把调试入口留在正式包里
      devTools: !app.isPackaged,
      // 是否开启webview标签，开启后可在渲染进程使用<webview></webview>
      webviewTag: true,
      // 渲染进程不直接使用 node，所有能力都通过 preload 暴露
      nodeIntegration: false,
      // 预加载js：用于暴露API给渲染进程
      preload: join(__dirname, 'preload', 'main.preload.js')
    }
  })

  // 只有未打包的开发进程会看到 VITE_DEV_SERVER_URL。打包后忽略它，始终走 app://。
  const devServerUrl = getDevServerUrl()
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl).then(() => {
      mainWindow.webContents.openDevTools()
    })
  } else {
    CustomScheme.registerScheme()
    mainWindow.loadURL(`app://index.html`)
  }

  // app更新：注册更新事件
  Updater.regUpdateEvent(mainWindow)

  // 注册调试 log
  LogManage.regMainWidow(mainWindow)

  // 窗口事件注册：ipcMain事件注册
  WindowManage.regWindowIpcMainEvent()

  // 窗口管理：窗口事件注册
  WindowManage.regWindowEvent(mainWindow)

  // 窗口管理：注册窗口创建处理
  WindowManage.regWindowCreateHandle(mainWindow)
})
