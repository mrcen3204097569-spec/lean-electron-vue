import { describe, it, expect } from 'vitest'

describe('Plugin Engine & Governance', () => {
  it('should serialize and parse backup payload accurately', () => {
    const backup = {
      timestamp: Date.now(),
      version: '2.0.0',
      enabledMap: {
        'system-monitor': true,
        'dev-toolbox': true,
        'pomodoro-timer': false
      },
      localStorages: {
        LEAN_DEV_SCRATCHPAD: 'test scratchpad',
        LEAN_EXPENSE_TRANSACTIONS: '[]'
      }
    }
    const jsonStr = JSON.stringify(backup)
    const parsed = JSON.parse(jsonStr)
    expect(parsed.version).toBe('2.0.0')
    expect(parsed.enabledMap['pomodoro-timer']).toBe(false)
    expect(parsed.localStorages['LEAN_DEV_SCRATCHPAD']).toBe('test scratchpad')
  })

  it('should sort marketplace items by stars and downloads correctly', () => {
    const list = [
      { id: 'a', name: 'Alpha', stars: 100, downloads: '1.2k' },
      { id: 'b', name: 'Beta', stars: 300, downloads: '500' },
      { id: 'c', name: 'Gamma', stars: 200, downloads: '10k' }
    ]

    const parseDl = (s: string) => {
      const n = parseFloat(s)
      return s.includes('k') ? n * 1000 : n
    }

    const byStars = [...list].sort((x, y) => y.stars - x.stars)
    expect(byStars[0].id).toBe('b')

    const byDownloads = [...list].sort((x, y) => parseDl(y.downloads) - parseDl(x.downloads))
    expect(byDownloads[0].id).toBe('c')

    const byName = [...list].sort((x, y) => x.name.localeCompare(y.name))
    expect(byName[0].id).toBe('a')
  })
})
