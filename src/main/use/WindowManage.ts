import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  IpcMainInvokeEvent,
  WebContents,
  ipcMain,
  shell
} from 'electron'
import { join } from 'path'
import {
  decideNavigation,
  parseWindowFeatures,
  sanitizeWindowFeatures
} from '../../shared/navigationPolicy'
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
    disableHtmlFullscreenWindowResize: true,
    devTools: !app.isPackaged
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
  const requested = sanitizeWindowFeatures(parseWindowFeatures(features))
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

function windowFromEvent(event: IpcMainInvokeEvent): BrowserWindow | null {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win || win.isDestroyed()) return null
  return win
}

export class WindowManage {
  /**
   * 窗口控制绑定到发送 IPC 的窗口，而不是创建时传入的主窗口。
   * 这样子窗口标题栏不会误关主窗口。
   */
  static regWindowIpcMainEvent() {
    ipcMain.handle('show-main-window', (event) => {
      windowFromEvent(event)?.show()
    })

    ipcMain.handle('maximize-window', (event) => {
      windowFromEvent(event)?.maximize()
    })

    ipcMain.handle('minimize-window', (event) => {
      windowFromEvent(event)?.minimize()
    })

    ipcMain.handle('restore-window', (event) => {
      windowFromEvent(event)?.restore()
    })

    ipcMain.handle('close-window', (event) => {
      windowFromEvent(event)?.close()
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
