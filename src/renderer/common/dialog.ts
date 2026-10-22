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
    const readyHandler = (e) => {
      const msg = e.data
      if (msg.msgName === `__dialogReady`) {
        window.removeEventListener('message', readyHandler)
        resolve(windowProxy)
      }
    }
    window.addEventListener('message', readyHandler)
  })
}

/**
 * 窗口准备就绪：子窗口向父窗口发布信（我的已经加载完成了，可以进行任何操作）
 */
export const dialogReady = () => {
  const msg = { msgName: `__dialogReady` }
  window.opener.postMessage(msg)
}
