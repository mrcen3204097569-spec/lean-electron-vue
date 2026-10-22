import { app, BrowserWindow } from 'electron'
import { CustomScheme } from './use/CustomScheme'
import * as path from 'path'
import { join } from 'path'
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
      // 打开dev工具栏
      devTools: true,
      // 是否开启webview标签，开启后可在渲染进程使用<webview></webview>
      webviewTag: true,
      // 集成node
      nodeIntegration: true,
      // 预加载js：用于暴露API给渲染进程
      preload: join(__dirname, '.', '/preload/main.preload.js')
    }
  })

  // 生产环境 or 开发环境
  if (process.argv[2]) {
    // 打开开发工具栏
    mainWindow.loadURL(process.argv[2]).then(() => {
      mainWindow.webContents.openDevTools()

      setTimeout(() => {
        mainWindow.webContents.send(
          'get-root-path',
          app.isPackaged ? path.dirname(app.getPath('exe')) : app.getAppPath()
        )
      }, 3000)
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
  WindowManage.regWindowIpcMainEvent(mainWindow)

  // 窗口管理：窗口事件注册
  WindowManage.regWindowEvent(mainWindow)

  // 窗口管理：注册窗口创建处理
  WindowManage.regWindowCreateHandle(mainWindow)
})
