import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import {
  IpcChannel,
  type DownloadProgressInfo,
  type ElectronAppUpdateApi,
  type ElectronLogApi,
  type ElectronSystemApi,
  type ElectronWindowApi,
  type OpenFileDialogOptions,
  type NotificationOptions,
  type SaveFileDialogOptions,
  type UpdateNotice
} from '../../shared/electronApi'

function subscribe<Args extends unknown[]>(
  channel: string,
  callback: (...args: Args) => void
): () => void {
  const listener = (_event: IpcRendererEvent, ...args: Args) => {
    callback(...args)
  }
  ipcRenderer.on(channel, listener)
  return () => {
    ipcRenderer.removeListener(channel, listener)
  }
}

const electronAppUpdateApi: ElectronAppUpdateApi = {
  downStart: () => ipcRenderer.invoke(IpcChannel.appDownStart),
  downComplete: (callback) => subscribe(IpcChannel.appDownComplete, callback),
  downProgress: (callback) =>
    subscribe<[DownloadProgressInfo]>(IpcChannel.appDownProgress, callback),
  updateCheck: () => ipcRenderer.invoke(IpcChannel.appUpdateCheck),
  appInstall: () => ipcRenderer.invoke(IpcChannel.appInstall),
  validateUpdateNotice: (callback) =>
    subscribe<[UpdateNotice]>(IpcChannel.appValidateUpdateNotice, callback)
}

const electronWindowApi: ElectronWindowApi = {
  showMainWindow: () => ipcRenderer.invoke(IpcChannel.showMainWindow),
  maximizeWindow: () => ipcRenderer.invoke(IpcChannel.maximizeWindow),
  minimizeWindow: () => ipcRenderer.invoke(IpcChannel.minimizeWindow),
  restoreWindow: () => ipcRenderer.invoke(IpcChannel.restoreWindow),
  closeWindow: () => ipcRenderer.invoke(IpcChannel.closeWindow),
  onMaximizeWindow: (callback) => subscribe(IpcChannel.onMaximizeWindow, callback),
  onUnMaximizeWindow: (callback) => subscribe(IpcChannel.onUnMaximizeWindow, callback)
}

const electronLogApi: ElectronLogApi = {
  log: (callback) => subscribe<[string]>(IpcChannel.electronLog, callback)
}

const electronSystemApi: ElectronSystemApi = {
  getSystemInfo: () => ipcRenderer.invoke(IpcChannel.systemGetInfo),
  openFileDialog: (options?: OpenFileDialogOptions) =>
    ipcRenderer.invoke(IpcChannel.dialogOpenFile, options),
  saveFileDialog: (options?: SaveFileDialogOptions) =>
    ipcRenderer.invoke(IpcChannel.dialogSaveFile, options),
  clipboardReadText: () => ipcRenderer.invoke(IpcChannel.clipboardRead),
  clipboardWriteText: (text: string) => ipcRenderer.invoke(IpcChannel.clipboardWrite, text),
  showNotification: (options: NotificationOptions) =>
    ipcRenderer.invoke(IpcChannel.notificationShow, options),
  getLoginItemSettings: () => ipcRenderer.invoke(IpcChannel.systemGetLoginItem),
  setLoginItemSettings: (openAtLogin: boolean) =>
    ipcRenderer.invoke(IpcChannel.systemSetLoginItem, openAtLogin),
  getCloseToTray: () => ipcRenderer.invoke(IpcChannel.trayGetCloseToTray),
  setCloseToTray: (enabled: boolean) => ipcRenderer.invoke(IpcChannel.traySetCloseToTray, enabled)
}

contextBridge.exposeInMainWorld('electronAppUpdateApi', electronAppUpdateApi)
contextBridge.exposeInMainWorld('electronWindowApi', electronWindowApi)
contextBridge.exposeInMainWorld('electronLogApi', electronLogApi)
contextBridge.exposeInMainWorld('electronSystemApi', electronSystemApi)
