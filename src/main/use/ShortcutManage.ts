import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron'
import { IpcChannel } from '../../shared/electronApi'
import { LogManage } from './LogManage'

export class ShortcutManage {
  private static registeredAccelerators = new Set<string>()

  static init(mainWindow: BrowserWindow) {
    // 默认注册一键呼出 / 隐藏应用的全局快捷键 (CommandOrControl+Shift+Space)
    const toggleAccelerator = 'CommandOrControl+Shift+Space'
    ShortcutManage.register(toggleAccelerator, () => {
      if (mainWindow.isDestroyed()) return

      if (mainWindow.isMinimized()) {
        mainWindow.restore()
        mainWindow.show()
        mainWindow.focus()
      } else if (!mainWindow.isVisible()) {
        mainWindow.show()
        mainWindow.focus()
      } else if (mainWindow.isFocused()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
    })

    // 监听渲染进程发起的动态快捷键注册
    ipcMain.handle(IpcChannel.shortcutRegister, async (_event, accelerator: string) => {
      if (!accelerator || typeof accelerator !== 'string') return false
      return ShortcutManage.register(accelerator, () => {
        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send(IpcChannel.onGlobalShortcutTriggered, accelerator)
        }
      })
    })

    // 监听注销快捷键
    ipcMain.handle(IpcChannel.shortcutUnregister, async (_event, accelerator: string) => {
      ShortcutManage.unregister(accelerator)
    })

    // 应用退出前注销所有全局快捷键
    app.on('will-quit', () => {
      globalShortcut.unregisterAll()
      ShortcutManage.registeredAccelerators.clear()
    })
  }

  static register(accelerator: string, callback: () => void): boolean {
    try {
      if (globalShortcut.isRegistered(accelerator)) {
        globalShortcut.unregister(accelerator)
      }
      const success = globalShortcut.register(accelerator, callback)
      if (success) {
        ShortcutManage.registeredAccelerators.add(accelerator)
        LogManage.log(`全局快捷键注册成功: ${accelerator}`)
      } else {
        LogManage.log(`全局快捷键已被占用或注册失败: ${accelerator}`)
      }
      return success
    } catch (e) {
      LogManage.log(`注册全局快捷键异常: ${e}`)
      return false
    }
  }

  static unregister(accelerator: string) {
    if (globalShortcut.isRegistered(accelerator)) {
      globalShortcut.unregister(accelerator)
      ShortcutManage.registeredAccelerators.delete(accelerator)
      LogManage.log(`已注销全局快捷键: ${accelerator}`)
    }
  }
}
