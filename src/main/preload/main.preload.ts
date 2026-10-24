import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import {
  IpcChannel,
  type DownloadProgressInfo,
  type ElectronAppUpdateApi,
  type ElectronLogApi,
  type ElectronWindowApi,
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

contextBridge.exposeInMainWorld('electronAppUpdateApi', electronAppUpdateApi)
contextBridge.exposeInMainWorld('electronWindowApi', electronWindowApi)
contextBridge.exposeInMainWorld('electronLogApi', electronLogApi)
