import { describe, expect, it, beforeEach } from 'vitest'
import { isSoundEnabled, setSoundEnabled, playSound } from '../src/renderer/common/sound'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value)
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock
})

describe('Sound & Haptic Feedback Engine', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('persists sound enabled state correctly', () => {
    setSoundEnabled(false)
    expect(isSoundEnabled.value).toBe(false)
    expect(localStorageMock.getItem('lean_app_sound_enabled')).toBe('false')

    setSoundEnabled(true)
    expect(isSoundEnabled.value).toBe(true)
    expect(localStorageMock.getItem('lean_app_sound_enabled')).toBe('true')
  })

  it('does not throw when playSound is called in test environment', () => {
    expect(() => {
      playSound('click')
      playSound('success')
      playSound('toggle')
      playSound('alert')
    }).not.toThrow()
  })
})
