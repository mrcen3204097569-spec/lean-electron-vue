/**
 * 子窗口默认加载这份空脚本，用来盖掉从父窗口继承来的 preload。
 * 需要主进程桥接时，在 window.open 的 features 里传 `{ webPreferences: { preloadMain: true } }`。
 */
export {}
