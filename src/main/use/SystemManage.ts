import { app, BrowserWindow, clipboard, dialog, ipcMain, Notification } from 'electron'
import os from 'node:os'
import {
  IpcChannel,
  type NotificationOptions,
  type OpenFileDialogOptions,
  type SaveFileDialogOptions,
  type SystemInfo
} from '../../shared/electronApi'

export class SystemManage {
  static regSystemIpc() {
    // 获取硬件和系统环境信息
    ipcMain.handle(IpcChannel.systemGetInfo, async (): Promise<SystemInfo> => {
      const cpus = os.cpus()
      return {
        platform: os.platform(),
        arch: os.arch(),
        osRelease: os.release(),
        cpuModel: cpus.length > 0 ? cpus[0].model : 'Unknown CPU',
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        electronVersion: process.versions.electron || '',
        nodeVersion: process.versions.node || '',
        chromeVersion: process.versions.chrome || '',
        v8Version: process.versions.v8 || '',
        appVersion: app.getVersion(),
        isPackaged: app.isPackaged
      }
    })

    // 原生打开文件 / 选择文件夹对话框
    ipcMain.handle(IpcChannel.dialogOpenFile, async (event, options?: OpenFileDialogOptions) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (!win || win.isDestroyed()) {
        return { canceled: true, filePaths: [] }
      }
      return dialog.showOpenDialog(win, {
        title: options?.title,
        defaultPath: options?.defaultPath,
        buttonLabel: options?.buttonLabel,
        filters: options?.filters,
        properties: options?.properties || ['openFile']
      })
    })

    // 原生保存文件对话框
    ipcMain.handle(IpcChannel.dialogSaveFile, async (event, options?: SaveFileDialogOptions) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (!win || win.isDestroyed()) {
        return { canceled: true }
      }
      return dialog.showSaveDialog(win, {
        title: options?.title,
        defaultPath: options?.defaultPath,
        buttonLabel: options?.buttonLabel,
        filters: options?.filters
      })
    })

    // 剪贴板读取
    ipcMain.handle(IpcChannel.clipboardRead, async () => {
      return clipboard.readText()
    })

    // 剪贴板写入
    ipcMain.handle(IpcChannel.clipboardWrite, async (_event, text: string) => {
      clipboard.writeText(String(text ?? ''))
    })

    // 原生系统通知
    ipcMain.handle(IpcChannel.notificationShow, async (_event, options: NotificationOptions) => {
      if (!Notification.isSupported()) return false
      const notification = new Notification({
        title: options.title,
        body: options.body,
        silent: options.silent
      })
      notification.show()
      return true
    })

    // 开机自启动设置获取
    ipcMain.handle(IpcChannel.systemGetLoginItem, async () => {
      const settings = app.getLoginItemSettings()
      return { openAtLogin: settings.openAtLogin }
    })

    // 开机自启动设置更改
    ipcMain.handle(IpcChannel.systemSetLoginItem, async (_event, openAtLogin: boolean) => {
      if (app.isPackaged) {
        app.setLoginItemSettings({ openAtLogin: Boolean(openAtLogin) })
      }
    })
  }
}
