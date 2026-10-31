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
  electronLog: 'electron-log',
  systemGetInfo: 'system-get-info',
  dialogOpenFile: 'dialog-open-file',
  dialogSaveFile: 'dialog-save-file',
  clipboardRead: 'clipboard-read',
  clipboardWrite: 'clipboard-write',
  notificationShow: 'notification-show',
  systemGetLoginItem: 'system-get-login-item',
  systemSetLoginItem: 'system-set-login-item',
  traySetCloseToTray: 'tray-set-close-to-tray',
  trayGetCloseToTray: 'tray-get-close-to-tray',
  shortcutRegister: 'shortcut-register',
  shortcutUnregister: 'shortcut-unregister',
  onGlobalShortcutTriggered: 'on-global-shortcut-triggered',
  windowSetAlwaysOnTop: 'window-set-always-on-top',
  windowGetAlwaysOnTop: 'window-get-always-on-top',
  windowSetOpacity: 'window-set-opacity',
  windowGetOpacity: 'window-get-opacity',
  windowCenter: 'window-center',
  windowSetPresetSize: 'window-set-preset-size',
  windowCaptureScreenshot: 'window-capture-screenshot',
  windowSetZoomFactor: 'window-set-zoom-factor',
  windowGetZoomFactor: 'window-get-zoom-factor',
  systemClearStorage: 'system-clear-storage',
  systemGetProcessMemory: 'system-get-process-memory'
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
  setAlwaysOnTop: (alwaysOnTop: boolean) => Promise<boolean>
  getAlwaysOnTop: () => Promise<boolean>
  setOpacity: (opacity: number) => Promise<void>
  getOpacity: () => Promise<number>
  centerWindow: () => Promise<void>
  setPresetSize: (width: number, height: number) => Promise<void>
  captureScreenshot: () => Promise<{ success: boolean; dataUrl?: string }>
  setZoomFactor: (factor: number) => Promise<void>
  getZoomFactor: () => Promise<number>
}

export interface ElectronLogApi {
  /** Receives the log text only. Returns a function that removes the listener. */
  log: (callback: (text: string) => void) => () => void
}

export interface SystemInfo {
  platform: string
  arch: string
  osRelease: string
  cpuModel: string
  totalMemory: number
  freeMemory: number
  electronVersion: string
  nodeVersion: string
  chromeVersion: string
  v8Version: string
  appVersion: string
  isPackaged: boolean
}

export interface OpenFileDialogOptions {
  title?: string
  defaultPath?: string
  buttonLabel?: string
  filters?: Array<{ name: string; extensions: string[] }>
  properties?: Array<
    | 'openFile'
    | 'openDirectory'
    | 'multiSelections'
    | 'showHiddenFiles'
    | 'createDirectory'
    | 'promptToCreate'
    | 'noResolveAliases'
    | 'treatPackageAsDirectory'
    | 'dontAddToRecent'
  >
}

export interface SaveFileDialogOptions {
  title?: string
  defaultPath?: string
  buttonLabel?: string
  filters?: Array<{ name: string; extensions: string[] }>
}

export interface NotificationOptions {
  title: string
  body: string
  silent?: boolean
}

export interface ElectronSystemApi {
  getSystemInfo: () => Promise<SystemInfo>
  openFileDialog: (
    options?: OpenFileDialogOptions
  ) => Promise<{ canceled: boolean; filePaths: string[] }>
  saveFileDialog: (
    options?: SaveFileDialogOptions
  ) => Promise<{ canceled: boolean; filePath?: string }>
  clipboardReadText: () => Promise<string>
  clipboardWriteText: (text: string) => Promise<void>
  showNotification: (options: NotificationOptions) => Promise<boolean>
  getLoginItemSettings: () => Promise<{ openAtLogin: boolean }>
  setLoginItemSettings: (openAtLogin: boolean) => Promise<void>
  getCloseToTray: () => Promise<boolean>
  setCloseToTray: (enabled: boolean) => Promise<void>
  registerShortcut: (accelerator: string) => Promise<boolean>
  unregisterShortcut: (accelerator: string) => Promise<void>
  onShortcut: (callback: (accelerator: string) => void) => () => void
  clearStorageData: () => Promise<void>
  getProcessMemory: () => Promise<{
    main: { rss: number; heapTotal: number; heapUsed: number }
    systemFreeMemory: number
    systemTotalMemory: number
  }>
}
