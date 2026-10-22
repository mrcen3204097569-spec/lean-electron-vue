/***
 * 在这里可以声明 主进程 and 渲染进程共用的数据类型
 */

/**
 * 扩展 Window 对象
 */
declare interface Window {
  /** app更新相关api */
  electronAppUpdateApi: {
    /** 下载进度 */
    downProgress(callback: Function): void
    /** 下载完成 */
    downComplete(callback: Function): void
    /** 下载开始 */
    downStart(): void
    /** 检查更新 */
    updateCheck(): void
    /** 安装app */
    appInstall(): void
    /** 检查更新结果通知 */
    validateUpdateNotice(callback: Function): void
  }

  /** 窗口相关api */
  electronWindowApi: {
    /** 显示主窗口 */
    showMainWindow(): void
    /** 最大化窗口 */
    maximizeWindow(): void
    /** 最小化窗口 */
    minimizeWindow(): void
    /** 恢复原始窗口大小 */
    restoreWindow(): void
    /** 关闭窗口 */
    closeWindow(): void
    /** 事件：窗口最大化 */
    onMaximizeWindow: (callback: Function) => void
    /** 事件：取消窗口最大化 */
    onUnMaximizeWindow: (callback: Function) => void
  }

  electronPathApi: {
    getRootPath: (callback: (path: string) => void) => void
  }

  /** 调试相关api */
  electronLogApi: {
    log(callback: Function): void
  }
}
