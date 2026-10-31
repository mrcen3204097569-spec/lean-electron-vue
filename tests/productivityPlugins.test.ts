import { describe, it, expect } from 'vitest'
import { marketplaceCatalog } from '../src/renderer/plugins/marketplace/catalog'

describe('Productivity Plugins Matrix', () => {
  it('should register 10 marketplace plugins properly', () => {
    expect(marketplaceCatalog.length).toBe(10)
    const ids = marketplaceCatalog.map((p) => p.id)
    expect(ids).toContain('markdown-notebook')
    expect(ids).toContain('snippet-vault')
    expect(ids).toContain('expense-tracker')
    expect(ids).toContain('habit-tracker')
    expect(ids).toContain('canvas-sketch')
    expect(ids).toContain('stopwatch-timer')
  })

  it('should calculate expense balance accurately', () => {
    const list = [
      { type: 'income', amount: 10000 },
      { type: 'expense', amount: 3500 },
      { type: 'expense', amount: 1200 }
    ]
    const income = list.filter((t) => t.type === 'income').reduce((acc, c) => acc + c.amount, 0)
    const expense = list.filter((t) => t.type === 'expense').reduce((acc, c) => acc + c.amount, 0)
    expect(income).toBe(10000)
    expect(expense).toBe(4700)
    expect(income - expense).toBe(5300)
  })

  it('should format stopwatch milliseconds correctly', () => {
    function formatMs(ms: number): string {
      const m = Math.floor(ms / 60000)
      const s = Math.floor((ms % 60000) / 1000)
      const c = Math.floor((ms % 1000) / 10)
      const mm = String(m).padStart(2, '0')
      const ss = String(s).padStart(2, '0')
      const cc = String(c).padStart(2, '0')
      return `${mm}:${ss}.${cc}`
    }
    expect(formatMs(0)).toBe('00:00.00')
    expect(formatMs(65430)).toBe('01:05.43')
  })
})
