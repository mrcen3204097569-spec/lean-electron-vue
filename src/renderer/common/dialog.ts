import type { BrowserWindowConstructorOptions } from 'electron'

/**
 * 创建会话窗口
 * @param url
 * @param config
 */
export const createDialog = (
  url: string,
  config: BrowserWindowConstructorOptions
): Promise<Window> => {
  return new Promise((resolve, reject) => {
    const windowProxy = window.open(url, '_blank', config ? JSON.stringify(config) : '{}')
    if (!windowProxy) return reject(new Error('窗口打开失败'))

    const cleanup = () => {
      clearInterval(timer)
      window.removeEventListener('message', readyHandler)
    }

    const readyHandler = (e: MessageEvent) => {
      const msg = e.data
      if (msg && typeof msg === 'object' && msg.msgName === '__dialogReady') {
        cleanup()
        resolve(windowProxy)
      }
    }

    // 若子窗口被用户直接关闭，及时清理并结束挂起的 Promise
    const timer = setInterval(() => {
      if (windowProxy.closed) {
        cleanup()
        reject(new Error('窗口在准备就绪前已关闭'))
      }
    }, 300)

    window.addEventListener('message', readyHandler)
  })
}

/**
 * 窗口准备就绪：子窗口向父窗口发布信（我的已经加载完成了，可以进行任何操作）
 */
export const dialogReady = () => {
  const msg = { msgName: '__dialogReady' }
  if (window.opener) {
    window.opener.postMessage(msg, '*')
  }
}
