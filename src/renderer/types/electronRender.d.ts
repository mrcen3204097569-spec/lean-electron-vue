import type {
  ElectronAppUpdateApi,
  ElectronLogApi,
  ElectronWindowApi
} from '../../shared/electronApi'

export {}

declare global {
  interface Window {
    /** 未注入 preload 的子窗口上不存在。 */
    electronAppUpdateApi?: ElectronAppUpdateApi
    /** 未注入 preload 的子窗口上不存在。 */
    electronWindowApi?: ElectronWindowApi
    /** 未注入 preload 的子窗口上不存在。 */
    electronLogApi?: ElectronLogApi
  }
}
