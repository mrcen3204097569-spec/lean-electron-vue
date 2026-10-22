import { BrowserWindow, BrowserWindowConstructorOptions, ipcMain } from 'electron'
import { LogManage } from './LogManage'
import { join } from 'path'

export class WindowManage {
  /**
   * 注册IpcMain （主进程）事件
   * @param win
   */
  static regWindowIpcMainEvent(win: BrowserWindow) {
    // 首次显示
    ipcMain.handle('show-main-window', () => {
      win.show()
    })

    // 最大化窗口
    ipcMain.handle('maximize-window', () => {
      win.maximize()
    })

    // 最小化窗口
    ipcMain.handle('minimize-window', () => {
      win.minimize()
    })

    // 恢复窗口
    ipcMain.handle('restore-window', () => {
      win.restore()
    })

    // 关闭窗口
    ipcMain.handle('close-window', () => {
      win.close()
    })
  }

  /**
   * 注册窗口事件
   * @param win
   */
  static regWindowEvent(win: BrowserWindow) {
    // 最大化窗口
    win.on('maximize', () => {
      win.webContents.send('on-maximize-window')
    })

    // 最小化窗口
    win.on('unmaximize', () => {
      win.webContents.send('on-un-maximize-window')
    })
  }

  /**
   * 注册窗口创建事件
   * @param mainWin
   */
  static regWindowCreateHandle(mainWin: BrowserWindow) {
    // 注册打开子窗口的回调函数
    mainWin.webContents.setWindowOpenHandler((param) => {
      LogManage.log(JSON.stringify(param))

      // 基础窗口配置对象
      const config: BrowserWindowConstructorOptions = {
        frame: false,
        show: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          webviewTag: true,
          spellcheck: false,
          disableHtmlFullscreenWindowResize: true,
          preload: ''
        }
      }

      // 开发者自定义窗口配置对象
      const features = JSON.parse(param.features)

      // 无论什么时候，都不能让渲染进程自定义使用那些预加载，只能提供选项让其决定选择
      features.webPreferences &&
        (features.webPreferences.preload = features.webPreferences.preloadMain
          ? join(__dirname, '.', '/preload/main.preload.js')
          : '')

      for (const p in features) {
        if (p === 'webPreferences') {
          for (const p2 in features.webPreferences) {
            config.webPreferences && (config.webPreferences[p2] = features.webPreferences[p2])
          }
        } else {
          config[p] = features[p]
        }
      }

      if (config.modal === true) config.parent = mainWin

      // 允许打开窗口，并传递窗口配置对象
      return { action: 'allow', overrideBrowserWindowOptions: config }
    })
  }
}
