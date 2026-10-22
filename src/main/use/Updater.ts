import { autoUpdater } from 'electron-updater'
import { BrowserWindow, ipcMain } from 'electron'

export class Updater {
  static regUpdateEvent(mainWindow: BrowserWindow) {
    autoUpdater.autoDownload = false // 自动下载
    autoUpdater.autoInstallOnAppQuit = false // 应用退出后自动安装

    // 监听检查更新操作
    ipcMain.handle('app-update-check', async (event) => {
      const result = await autoUpdater.checkForUpdates()
    })

    // 监听开始下载操作
    ipcMain.handle('app-down-start', async (event) => {
      // 开始下载
      await autoUpdater.downloadUpdate()
    })

    // 监听安装操作
    ipcMain.handle('app-install', async (event, callback) => {
      autoUpdater.quitAndInstall()
    })

    // 监听验证更新结果
    autoUpdater.on('update-available', (info) => {
      mainWindow.webContents.send('app-validate-update-notice', info)
    })

    // 监听包下载状态
    autoUpdater.on('download-progress', (info) => {
      mainWindow.webContents.send('app-down-progress', info)
    })

    // 下载完成
    autoUpdater.on('update-downloaded', (info) => {
      mainWindow.webContents.send('app-down-complete', info)
    })
  }
}
