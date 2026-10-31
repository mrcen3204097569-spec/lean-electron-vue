import { BrowserWindow } from 'electron'
import { IpcChannel } from '../../shared/electronApi'

/**
 * log
 */
export class LogManage {
  static mainWindow?: BrowserWindow

  /**
   * 设置主窗口
   * @param win
   */
  static regMainWindow(win: BrowserWindow) {
    LogManage.mainWindow = win
  }

  /**
   * 兼容旧版方法名
   */
  static regMainWidow(win: BrowserWindow) {
    LogManage.regMainWindow(win)
  }

  /**
   * 输出日志
   * @param text
   */
  static log(text: string) {
    console.log(`[electron-log] ${text}`)
    if (LogManage.mainWindow && !LogManage.mainWindow.isDestroyed()) {
      LogManage.mainWindow.webContents.send(IpcChannel.electronLog, `electron-log：${text}`)
    }
  }
}
