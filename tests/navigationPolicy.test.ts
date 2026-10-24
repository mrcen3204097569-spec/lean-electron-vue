import { describe, expect, it } from 'vitest'
import {
  decideNavigation,
  parseDevServerUrl,
  parseWindowFeatures,
  sanitizeWindowFeatures
} from '../src/shared/navigationPolicy.ts'

describe('decideNavigation', () => {
  const devServer = 'http://127.0.0.1:5173/'

  it('allows the app scheme and the dev server origin', () => {
    expect(decideNavigation('app://index.html')).toBe('allow')
    expect(decideNavigation('app://index.html/test')).toBe('allow')
    expect(decideNavigation('http://127.0.0.1:5173/test', devServer)).toBe('allow')
  })

  it('sends other http(s) urls to the system browser and denies the rest', () => {
    expect(decideNavigation('https://example.com/docs', devServer)).toBe('external')
    expect(decideNavigation('http://example.com', devServer)).toBe('external')
    expect(decideNavigation('file:///etc/passwd', devServer)).toBe('deny')
    expect(decideNavigation('javascript:alert(1)')).toBe('deny')
    expect(decideNavigation('http://user:pass@example.com')).toBe('deny')
    expect(decideNavigation('not a url')).toBe('deny')
  })

  it('rejects a dev server url that is not http(s) or that carries credentials', () => {
    expect(parseDevServerUrl('file:///tmp/index.html')).toBeUndefined()
    expect(parseDevServerUrl('http://user:pass@127.0.0.1:5173')).toBeUndefined()
    expect(parseDevServerUrl('http://127.0.0.1:5173/')).toBe('http://127.0.0.1:5173/')
  })
})

describe('parseWindowFeatures', () => {
  it('accepts an empty string, invalid JSON, and the standard comma form', () => {
    expect(parseWindowFeatures('')).toEqual({})
    expect(parseWindowFeatures('{')).toEqual({})
    expect(parseWindowFeatures('width=800,height=600,left=10,top=20,resizable=yes')).toEqual({
      width: 800,
      height: 600,
      x: 10,
      y: 20,
      resizable: true
    })
  })

  it('keeps a JSON options object and drops anything that is not an object', () => {
    expect(parseWindowFeatures('{"width":400,"modal":true}')).toEqual({ width: 400, modal: true })
    expect(parseWindowFeatures('[1,2,3]')).toEqual([1, 2, 3])
    expect(sanitizeWindowFeatures(parseWindowFeatures('[1,2,3]')).options).toEqual({})
  })

  it('ignores oversized feature strings', () => {
    expect(parseWindowFeatures(`{${'a'.repeat(20_000)}}`)).toEqual({})
  })
})

describe('sanitizeWindowFeatures', () => {
  it('drops renderer-controlled webPreferences except the preload toggle', () => {
    const sanitized = sanitizeWindowFeatures(
      parseWindowFeatures(
        JSON.stringify({
          width: 100,
          title: 'dialog',
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            sandbox: false,
            webviewTag: true,
            preload: '/tmp/evil.js',
            preloadMain: true
          }
        })
      )
    )

    expect(sanitized.preloadMain).toBe(true)
    expect(sanitized.options).toEqual({ width: 100, title: 'dialog' })
  })

  it('requires preloadMain to be exactly true', () => {
    expect(sanitizeWindowFeatures({ webPreferences: { preloadMain: 'true' } }).preloadMain).toBe(
      false
    )
  })
})
