import path from 'node:path'
import type { PlatformPath } from 'node:path'

/**
 * Map an app:// pathname onto a file inside appRoot.
 * Paths without an extension are the SPA shell and resolve to index.html.
 * Returns null when the path would leave appRoot.
 */
export function resolveAppFile(
  appRoot: string,
  requestPath: string,
  pathApi: PlatformPath = path
): string | null {
  if (requestPath.includes('\0')) return null

  let pathName = requestPath
  if (pathApi.extname(pathName) === '') {
    pathName = 'index.html'
  }

  const root = pathApi.resolve(appRoot)
  // join, not resolve: a pathname from a URL starts with "/" and resolve()
  // would treat that as an absolute path, dropping appRoot.
  const target = pathApi.normalize(pathApi.join(root, pathName))
  const relative = pathApi.relative(root, target)
  if (relative.startsWith('..') || pathApi.isAbsolute(relative)) return null

  const prefix = root.endsWith(pathApi.sep) ? root : root + pathApi.sep
  if (target !== root && !target.startsWith(prefix)) return null
  return target
}
