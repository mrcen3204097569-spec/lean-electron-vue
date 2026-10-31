import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  clipboard as electronClipboard,
  IpcMainInvokeEvent,
  WebContents,
  ipcMain,
  shell
} from 'electron'
import { join } from 'path'
import { IpcChannel } from '../../shared/electronApi'
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
        // 必须继承传入的 options 以连接 Electron 预创建的 guest webContents
        const child = new BrowserWindow({
          ...options,
          ...overrideBrowserWindowOptions,
          alwaysOnTop: false,
          transparent: false,
          focusable: true,
          fullscreen: false,
          kiosk: false,
          simpleFullscreen: false
        })
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
    ipcMain.handle(IpcChannel.showMainWindow, (event) => {
      windowFromEvent(event)?.show()
    })

    ipcMain.handle(IpcChannel.maximizeWindow, (event) => {
      windowFromEvent(event)?.maximize()
    })

    ipcMain.handle(IpcChannel.minimizeWindow, (event) => {
      windowFromEvent(event)?.minimize()
    })

    ipcMain.handle(IpcChannel.restoreWindow, (event) => {
      windowFromEvent(event)?.restore()
    })

    ipcMain.handle(IpcChannel.closeWindow, (event) => {
      windowFromEvent(event)?.close()
    })

    // 视窗置顶切换
    ipcMain.handle(IpcChannel.windowSetAlwaysOnTop, (event, alwaysOnTop: boolean) => {
      const win = windowFromEvent(event)
      if (!win) return false
      win.setAlwaysOnTop(Boolean(alwaysOnTop))
      return win.isAlwaysOnTop()
    })

    ipcMain.handle(IpcChannel.windowGetAlwaysOnTop, (event) => {
      return windowFromEvent(event)?.isAlwaysOnTop() ?? false
    })

    // 视窗透明度调节 (0.2 ~ 1.0)
    ipcMain.handle(IpcChannel.windowSetOpacity, (event, opacity: number) => {
      const win = windowFromEvent(event)
      if (!win) return
      const safeVal = Math.min(Math.max(Number(opacity) || 1, 0.2), 1)
      win.setOpacity(safeVal)
    })

    ipcMain.handle(IpcChannel.windowGetOpacity, (event) => {
      return windowFromEvent(event)?.getOpacity() ?? 1
    })

    // 视窗居中
    ipcMain.handle(IpcChannel.windowCenter, (event) => {
      windowFromEvent(event)?.center()
    })

    // 视窗预设分辨率切换
    ipcMain.handle(IpcChannel.windowSetPresetSize, (event, width: number, height: number) => {
      const win = windowFromEvent(event)
      if (!win) return
      win.setSize(Math.round(width), Math.round(height))
      win.center()
    })

    // 视窗屏幕截图捕获并写入剪贴板
    ipcMain.handle(IpcChannel.windowCaptureScreenshot, async (event) => {
      const win = windowFromEvent(event)
      if (!win) return { success: false }
      try {
        const image = await win.capturePage()
        const dataUrl = image.toDataURL()
        await electronClipboard.writeText(dataUrl)
        return { success: true, dataUrl }
      } catch (err) {
        LogManage.log(`视窗截图失败: ${err}`)
        return { success: false }
      }
    })

    // 视窗缩放因子
    ipcMain.handle(IpcChannel.windowSetZoomFactor, (event, factor: number) => {
      const win = windowFromEvent(event)
      if (!win) return
      const safeFactor = Math.min(Math.max(Number(factor) || 1, 0.5), 2.5)
      win.webContents.setZoomFactor(safeFactor)
    })

    ipcMain.handle(IpcChannel.windowGetZoomFactor, (event) => {
      return windowFromEvent(event)?.webContents.getZoomFactor() ?? 1
    })
  }

  /**
   * 注册窗口事件
   * @param win
   */
  static regWindowEvent(win: BrowserWindow) {
    // 最大化窗口
    win.on('maximize', () => {
      win.webContents.send(IpcChannel.onMaximizeWindow)
    })

    // 最小化窗口
    win.on('unmaximize', () => {
      win.webContents.send(IpcChannel.onUnMaximizeWindow)
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
