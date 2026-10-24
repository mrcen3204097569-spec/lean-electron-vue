/**
 * Document CSP for the renderer.
 * Production keeps scripts on 'self'. Development also allows the Vite client
 * (inline style injection, HMR websocket, and the eval Vite uses while transforming).
 */
export function buildContentSecurityPolicy(devServerUrl?: string): string {
  const scriptSrc = ["'self'"]
  const connectSrc = ["'self'"]

  if (devServerUrl) {
    scriptSrc.push("'unsafe-inline'", "'unsafe-eval'", 'blob:')
    try {
      const devServer = new URL(devServerUrl)
      const wsProtocol = devServer.protocol === 'https:' ? 'wss:' : 'ws:'
      connectSrc.push(devServer.origin, `${wsProtocol}//${devServer.host}`)
    } catch {
      // A bad dev URL is ignored. 'self' still covers the page that was actually loaded.
    }
  }

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(' ')}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-src 'none'"
  ].join('; ')
}
