import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveAppFile } from '../src/shared/appProtocolPath.ts'

const root = '/workspace/dist'

describe('resolveAppFile', () => {
  it('serves index.html for the document and for extension-less routes', () => {
    expect(resolveAppFile(root, '')).toBe(path.join(root, 'index.html'))
    expect(resolveAppFile(root, '/')).toBe(path.join(root, 'index.html'))
    expect(resolveAppFile(root, '/test')).toBe(path.join(root, 'index.html'))
    expect(resolveAppFile(root, '/index.html')).toBe(path.join(root, 'index.html'))
  })

  it('serves real files that stay inside the app directory', () => {
    expect(resolveAppFile(root, '/assets/index.js')).toBe(path.join(root, 'assets/index.js'))
    expect(resolveAppFile(root, '/./assets/a.js')).toBe(path.join(root, 'assets/a.js'))
  })

  it('blocks paths that escape the app directory', () => {
    expect(resolveAppFile(root, '/../../etc/passwd.txt')).toBeNull()
    expect(resolveAppFile(root, 'foo/../../secret.js')).toBeNull()
    expect(resolveAppFile(root, '/assets/../../outside.js')).toBeNull()
    expect(resolveAppFile(root, '/ok.js\0.png')).toBeNull()
  })

  it('blocks Windows drive and traversal paths', () => {
    const winRoot = 'C:\\app\\dist'
    expect(resolveAppFile(winRoot, 'C:/windows/win.ini', path.win32)).toBeNull()
    expect(
      resolveAppFile(winRoot, '/../../Windows/system32/drivers/etc/hosts.txt', path.win32)
    ).toBe(null)
    expect(resolveAppFile(winRoot, '/assets/app.js', path.win32)).toBe(
      'C:\\app\\dist\\assets\\app.js'
    )
  })
})
