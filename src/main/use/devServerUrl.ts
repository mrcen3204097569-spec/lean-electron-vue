import { app } from 'electron'
import { parseDevServerUrl } from '../../shared/navigationPolicy'

/**
 * 开发服务器地址，只在未打包时生效。
 * 变量名需要和 plugins/devPlugin.mts 里写入的 VITE_DEV_SERVER_URL 一致。
 * 打包后的应用即使带了该环境变量或额外命令行参数，也只会加载 app://。
 */
export function getDevServerUrl(): string | undefined {
  if (app.isPackaged) return undefined
  return parseDevServerUrl(process.env.VITE_DEV_SERVER_URL)
}
