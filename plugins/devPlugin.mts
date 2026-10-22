import { spawn } from 'node:child_process'
import type { AddressInfo } from 'node:net'
import type { Plugin } from 'vite'
import { buildMainProcess } from './mainProcess.mts'

export const devPlugin = (): Plugin => {
  return {
    name: 'dev-plugin',
    apply: 'serve',

    configureServer(server) {
      // 编译入口文件
      buildMainProcess()

      // vite http服务启动监听
      server.httpServer?.once('listening', async () => {
        const addressInfo = server.httpServer?.address() as AddressInfo
        const httpAddress = `http://${addressInfo.address}:${addressInfo.port}`

        // electron 包导出的是可执行文件路径（首次使用时会自动下载二进制）
        const { default: electronPath } = await import('electron')
        const electronProcess = spawn(String(electronPath), ['./dist/mainEntry.js', httpAddress], {
          cwd: process.cwd(),
          stdio: 'inherit'
        })

        // electron 服务关闭监听
        electronProcess.on('close', () => {
          server.close()
          process.exit()
        })
      })
    }
  }
}
