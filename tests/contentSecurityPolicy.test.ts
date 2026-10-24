import { describe, expect, it } from 'vitest'
import { buildContentSecurityPolicy } from '../src/shared/contentSecurityPolicy.ts'

describe('buildContentSecurityPolicy', () => {
  it('keeps production scripts on self and allows inline styles', () => {
    const policy = buildContentSecurityPolicy()
    expect(policy).toContain("script-src 'self'")
    expect(policy).not.toContain('unsafe-eval')
    expect(policy).toContain("style-src 'self' 'unsafe-inline'")
    expect(policy).toContain("object-src 'none'")
  })

  it('allows the Vite client and its websocket in development', () => {
    const policy = buildContentSecurityPolicy('http://127.0.0.1:5173/')
    expect(policy).toContain('unsafe-eval')
    expect(policy).toContain('http://127.0.0.1:5173')
    expect(policy).toContain('ws://127.0.0.1:5173')
    expect(policy).toContain("style-src 'self' 'unsafe-inline'")
  })
})
