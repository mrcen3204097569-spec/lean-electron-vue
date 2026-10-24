import type { AddressInfo } from 'node:net'
import type { Plugin } from 'vite'
import { createDevElectron } from './devElectron.mts'
import { watchMainProcess } from './mainProcess.mts'

export const devPlugin = (): Plugin => {
  return {
    name: 'dev-plugin',
    apply: 'serve',

    configureServer(server) {
      if (process.env.VITEST) return

      const devServerUrl = new Promise<string>((resolve) => {
        server.httpServer?.once('listening', () => {
          const addressInfo = server.httpServer?.address() as AddressInfo
          resolve(`http://${addressInfo.address}:${addressInfo.port}`)
        })
      })

      let shuttingDown = false
      let electron: ReturnType<typeof createDevElectron> | undefined
      let restartTimer: ReturnType<typeof setTimeout> | undefined
      let reloadTimer: ReturnType<typeof setTimeout> | undefined

      const scheduleRestart = () => {
        if (reloadTimer) clearTimeout(reloadTimer)
        if (restartTimer) clearTimeout(restartTimer)
        restartTimer = setTimeout(() => {
          restartTimer = undefined
          console.log('[dev] 主进程已变更，正在重启 Electron')
          void electron?.restart()
        }, 100)
      }

      const scheduleReload = () => {
        if (restartTimer) return
        if (reloadTimer) clearTimeout(reloadTimer)
        reloadTimer = setTimeout(() => {
          reloadTimer = undefined
          if (restartTimer) return
          console.log('[dev] preload 已变更，正在刷新窗口')
          electron?.reload()
        }, 100)
      }

      const watched = watchMainProcess({
        onMainRebuilt: scheduleRestart,
        onPreloadRebuilt: scheduleReload
      })

      const shutdown = async (code: number | null) => {
        if (shuttingDown) return
        shuttingDown = true
        if (restartTimer) clearTimeout(restartTimer)
        if (reloadTimer) clearTimeout(reloadTimer)
        const dispose = await watched.catch(() => undefined)
        await dispose?.()
        await electron?.stop()
        await server.close()
        process.exit(code ?? 0)
      }

      process.once('SIGINT', () => {
        void shutdown(0)
      })
      process.once('SIGTERM', () => {
        void shutdown(0)
      })

      void Promise.all([devServerUrl, watched])
        .then(async ([url]) => {
          if (shuttingDown) return
          const { default: electronPath } = await import('electron')
          electron = createDevElectron((code) => {
            void shutdown(code)
          })
          // 地址放在环境变量里。命令行参数会被打包后的应用忽略，也不能再被当成要加载的 URL。
          electron.start(String(electronPath), url)
        })
        .catch((error: unknown) => {
          console.error('[dev] 启动 Electron 失败', error)
          void shutdown(1)
        })
    }
  }
}
