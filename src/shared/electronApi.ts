/**
 * IPC contract shared by the main process, the preload bridge, and the renderer.
 * Channel names live here so the three sides cannot drift apart.
 */

export const IpcChannel = {
  appDownStart: 'app-down-start',
  appDownComplete: 'app-down-complete',
  appDownProgress: 'app-down-progress',
  appUpdateCheck: 'app-update-check',
  appInstall: 'app-install',
  appValidateUpdateNotice: 'app-validate-update-notice',
  showMainWindow: 'show-main-window',
  maximizeWindow: 'maximize-window',
  minimizeWindow: 'minimize-window',
  restoreWindow: 'restore-window',
  closeWindow: 'close-window',
  onMaximizeWindow: 'on-maximize-window',
  onUnMaximizeWindow: 'on-un-maximize-window',
  electronLog: 'electron-log'
} as const

export interface DownloadProgressInfo {
  percent: number
  transferred: number
  total: number
  bytesPerSecond: number
}

/** Custom fields are appended to latest*.yml when the app is packaged. */
export interface UpdateNotice {
  version: string
  updateTitle?: string
  updateSubTitle?: string
  updateContent?: string
}

export interface ElectronAppUpdateApi {
  downStart: () => Promise<void>
  downComplete: (callback: (info: unknown) => void) => () => void
  downProgress: (callback: (info: DownloadProgressInfo) => void) => () => void
  updateCheck: () => Promise<void>
  appInstall: () => Promise<void>
  validateUpdateNotice: (callback: (info: UpdateNotice) => void) => () => void
}

export interface ElectronWindowApi {
  showMainWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  minimizeWindow: () => Promise<void>
  restoreWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  onMaximizeWindow: (callback: () => void) => () => void
  onUnMaximizeWindow: (callback: () => void) => () => void
}

export interface ElectronLogApi {
  /** Receives the log text only. Returns a function that removes the listener. */
  log: (callback: (text: string) => void) => () => void
}
