import { contextBridge, ipcRenderer } from 'electron'

/***
 * app 更新相关 - api
 */
contextBridge.exposeInMainWorld('electronAppUpdateApi', {
  downStart: () => ipcRenderer.invoke('app-down-start'),
  downComplete: (callback) => ipcRenderer.on('app-down-complete', callback),
  downProgress: (callback) => ipcRenderer.on('app-down-progress', callback),
  updateCheck: () => ipcRenderer.invoke('app-update-check'),
  appInstall: () => ipcRenderer.invoke('app-install'),
  validateUpdateNotice: (callback) => ipcRenderer.on('app-validate-update-notice', callback)
})

/**
 * 窗口相关 - api
 *
 */
contextBridge.exposeInMainWorld('electronWindowApi', {
  showMainWindow: () => ipcRenderer.invoke('show-main-window'),
  /** 最大化窗口 */
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  /** 最小化窗口 */
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  /** 恢复原始窗口大小 */
  restoreWindow: () => ipcRenderer.invoke('restore-window'),
  /** 关闭窗口 */
  closeWindow: () => ipcRenderer.invoke('close-window'),
  /** 事件：窗口最大化 */
  onMaximizeWindow: (callback) => ipcRenderer.on('on-maximize-window', callback),
  /** 事件：取消窗口最大化 */
  onUnMaximizeWindow: (callback) => ipcRenderer.on('on-un-maximize-window', callback)
})

/**
 * 调试相关
 */
contextBridge.exposeInMainWorld('electronLogApi', {
  log: (callback) => ipcRenderer.on('electron-log', callback)
})
