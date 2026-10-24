import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  WebContents,
  ipcMain,
  shell
} from 'electron'
import { join } from 'path'
import { decideNavigation, sanitizeWindowFeatures } from '../../shared/navigationPolicy'
import { getDevServerUrl } from './devServerUrl'
import { LogManage } from './LogManage'

const MAIN_PRELOAD = join(__dirname, 'preload', 'main.preload.js')
const EMPTY_PRELOAD = join(__dirname, 'preload', 'empty.preload.js')

/**
 * 子窗口的 webPreferences 全部在这里写死。
 * setWindowOpenHandler 的 override 优先级高于父窗口继承值和 features 字符串，
 * 所以危险项必须显式设成安全值，不能从渲染进程合并进来。
 */
function secureWebPreferences(
  preloadMain: boolean
): BrowserWindowConstructorOptions['webPreferences'] {
  return {
    preload: preloadMain ? MAIN_PRELOAD : EMPTY_PRELOAD,
    nodeIntegration: false,
    nodeIntegrationInWorker: false,
    nodeIntegrationInSubFrames: false,
    contextIsolation: true,
    sandbox: true,
    webviewTag: false,
    webSecurity: true,
    allowRunningInsecureContent: false,
    experimentalFeatures: false,
    spellcheck: false,
    disableHtmlFullscreenWindowResize: true
  }
}

function openExternal(url: string) {
  shell.openExternal(url).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    LogManage.log(`打开外部链接失败：${message}`)
  })
}

function childWindowOptions(
  opener: WebContents,
  features: string
): BrowserWindowConstructorOptions {
  // 标准 window.open / <a target="_blank"> 的 features 不是 JSON，解析失败会抛错。
  // 外链在调用本函数之前已经拒绝，这里仍只服务允许的 app:// 和开发服务器地址。
  const requested = sanitizeWindowFeatures(JSON.parse(features))
  const windowOptions: BrowserWindowConstructorOptions = {
    show: true,
    ...requested.options,
    frame: false,
    webPreferences: secureWebPreferences(requested.preloadMain)
  }

  if (windowOptions.modal) {
    const parent = BrowserWindow.fromWebContents(opener)
    if (parent && !parent.isDestroyed()) {
      windowOptions.parent = parent
    } else {
      windowOptions.modal = false
    }
  }

  return windowOptions
}

function attachNavigationGuards(contents: WebContents) {
  const decisionFor = (url: string) => decideNavigation(url, getDevServerUrl())

  contents.on('will-navigate', (event, url) => {
    const decision = decisionFor(url)
    if (decision === 'allow') return
    event.preventDefault()
    if (decision === 'external') openExternal(url)
    else LogManage.log(`已拦截跳转：${url}`)
  })

  contents.on('will-redirect', (event, url) => {
    if (decisionFor(url) === 'allow') return
    event.preventDefault()
    LogManage.log(`已拦截重定向：${url}`)
  })

  contents.setWindowOpenHandler((details) => {
    const decision = decisionFor(details.url)
    if (decision !== 'allow') {
      if (decision === 'external') openExternal(details.url)
      else LogManage.log(`已拒绝打开窗口：${details.url}`)
      return { action: 'deny' }
    }

    const overrideBrowserWindowOptions = childWindowOptions(contents, details.features)
    return {
      action: 'allow',
      overrideBrowserWindowOptions,
      createWindow: (options) => {
        const child = new BrowserWindow(options)
        WindowManage.regWindowEvent(child)
        attachNavigationGuards(child.webContents)
        return child.webContents
      }
    }
  })
}

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
   * 注册窗口创建事件，并限制子窗口能打开和跳转到哪些地址。
   * @param mainWin
   */
  static regWindowCreateHandle(mainWin: BrowserWindow) {
    attachNavigationGuards(mainWin.webContents)
  }
}
