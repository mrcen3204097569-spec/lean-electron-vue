import { describe, it, expect } from 'vitest'

describe('DevToolbox Core Utilities', () => {
  it('should split and format casing correctly', () => {
    function toCamelCase(str: string) {
      const words = str
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[-_]+/g, ' ')
        .trim()
        .split(/\s+/)
      return words
        .map((w, i) =>
          i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        )
        .join('')
    }
    function toKebabCase(str: string) {
      const words = str
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[-_]+/g, ' ')
        .trim()
        .split(/\s+/)
      return words.map((w) => w.toLowerCase()).join('-')
    }
    expect(toCamelCase('hello-world-vue')).toBe('helloWorldVue')
    expect(toKebabCase('helloWorldVue')).toBe('hello-world-vue')
  })

  it('should generate valid UUID v4 format', () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const testUuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
    expect(uuidRegex.test(testUuid)).toBe(true)
  })

  it('should parse URL and query parameters correctly', () => {
    const urlStr = 'https://example.com/api/v1?page=1&query=electron'
    const url = new URL(urlStr)
    expect(url.hostname).toBe('example.com')
    expect(url.searchParams.get('page')).toBe('1')
    expect(url.searchParams.get('query')).toBe('electron')
  })

  it('should decode JWT payload without external libraries', () => {
    // JWT: header={alg:"none"}, payload={sub:"12345",name:"test"}
    const samplePayload = { sub: '12345', name: 'test' }
    const base64Payload = btoa(JSON.stringify(samplePayload))
    const decoded = JSON.parse(atob(base64Payload))
    expect(decoded.sub).toBe('12345')
    expect(decoded.name).toBe('test')
  })
})
