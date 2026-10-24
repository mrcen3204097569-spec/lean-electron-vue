import { BrowserWindow } from 'electron'
import { IpcChannel } from '../../shared/electronApi'

/**
 * log
 */
export class LogManage {
  static mainWindow: BrowserWindow

  /**
   * 设置主窗口
   * @param win
   */
  static regMainWidow(win: BrowserWindow) {
    LogManage.mainWindow = win
  }

  /**
   * 输出日志
   * @param text
   */
  static log(text: string) {
    LogManage.mainWindow &&
      LogManage.mainWindow.webContents.send(IpcChannel.electronLog, `electron-log：${text}`)
  }
}
