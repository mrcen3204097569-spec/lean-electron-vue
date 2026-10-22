import { BrowserWindow } from 'electron'

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
      LogManage.mainWindow.webContents.send('electron-log', `electron-log：${text}`)
  }
}
