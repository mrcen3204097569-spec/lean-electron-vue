import { parseDevServerUrl } from '../../shared/navigationPolicy'

/**
 * 开发服务器地址。devPlugin 启动 Electron 时通过命令行参数传入。
 * 只接受 http(s)，避免把特权 preload 挂到任意协议上。
 */
export function getDevServerUrl(): string | undefined {
  return parseDevServerUrl(process.argv[2])
}
