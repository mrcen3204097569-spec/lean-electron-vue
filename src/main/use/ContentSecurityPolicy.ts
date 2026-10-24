import { session } from 'electron'
import { buildContentSecurityPolicy } from '../../shared/contentSecurityPolicy'
import { isAllowedNavigationUrl } from '../../shared/navigationPolicy'

/**
 * 只给本应用的文档响应加 CSP，避免改到 DevTools 或更新服务器的响应头。
 */
export function installContentSecurityPolicy(devServerUrl?: string) {
  const policy = buildContentSecurityPolicy(devServerUrl)

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders: Record<string, string[]> = { ...details.responseHeaders }
    const isDocument = details.resourceType === 'mainFrame' || details.resourceType === 'subFrame'
    if (isDocument && isAllowedNavigationUrl(details.url, devServerUrl)) {
      for (const key of Object.keys(responseHeaders)) {
        if (key.toLowerCase() === 'content-security-policy') delete responseHeaders[key]
      }
      responseHeaders['Content-Security-Policy'] = [policy]
    }
    callback({ responseHeaders })
  })
}
