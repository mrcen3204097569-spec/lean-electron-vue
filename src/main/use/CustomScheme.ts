import { net, protocol } from 'electron'
import * as path from 'path'
import { pathToFileURL } from 'url'

// 为自定义的app协议提供特权（必须在 app ready 之前调用）
const schemeConfig = {
  standard: true,
  secure: true,
  supportFetchAPI: true,
  bypassCSP: true,
  corsEnabled: true,
  stream: true
}
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: schemeConfig }])

/**
 * 自定义协议，便于在生产环境中加载html or 其他文件
 */
export class CustomScheme {
  // 注册自定义app协议
  static registerScheme() {
    protocol.handle('app', (request) => {
      let pathName = decodeURIComponent(new URL(request.url).pathname)

      // 没有扩展名的路径（前端路由）统一返回 index.html
      if (path.extname(pathName) === '') {
        pathName = 'index.html'
      }

      // 防止通过 ../ 访问应用目录之外的文件
      const tarFile = path.join(__dirname, pathName)
      if (path.relative(__dirname, tarFile).startsWith('..')) {
        return new Response('Not Found', { status: 404 })
      }

      // net.fetch 读取本地文件时会根据扩展名自动设置 content-type
      return net.fetch(pathToFileURL(tarFile).toString())
    })
  }
}
