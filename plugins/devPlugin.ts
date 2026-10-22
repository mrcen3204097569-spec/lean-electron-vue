import { ViteDevServer } from 'vite'

export const devPlugin = () => {
  return {
    name: 'dev-plugin',

    configureServer(server: ViteDevServer) {
      // 编译入口文件
      require('esbuild').buildSync({
        entryPoints: ['./src/main/mainEntry.ts', './src/main/preload/*.preload.ts'],
        bundle: true,
        platform: 'node',
        outdir: './dist/',
        external: ['electron']
      })

      // vite http服务启动监听
      server.httpServer.once('listening', () => {
        const { spawn } = require('child_process')
        const addressInfo = server.httpServer.address()
        const httpAddress = `http://${addressInfo.address}:${addressInfo.port}`
        const electronProcess = spawn(
          require('electron').toString(),
          ['./dist/mainEntry.js', httpAddress],
          {
            cwd: process.cwd(),
            stdio: 'inherit'
          }
        )

        // server.httpServer.once('close', () => {
        //   console.log('服务关闭')
        // })

        // electron 服务关闭监听
        electronProcess.on('close', () => {
          server.close()
          process.exit()
        })
      })
    }
  }
}
