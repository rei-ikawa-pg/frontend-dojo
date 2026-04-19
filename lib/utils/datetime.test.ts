import { describe, expect, it } from 'vitest'
import { formatJst } from './datetime'

describe('formatJst', () => {
  // UTC 2026-04-19 00:00:00 → JST 2026-04-19 09:00:00
  it('Date.toISOString() 形式 (末尾 Z) を JST に変換する', () => {
    expect(formatJst('2026-04-19T00:00:00.000Z')).toBe('2026-04-19 09:00:00')
  })

  // SQLite CURRENT_TIMESTAMP の形式（スペース区切り, Z なし）は UTC として扱う
  it('SQLite CURRENT_TIMESTAMP 形式 (スペース区切り) を UTC とみなし JST に変換する', () => {
    expect(formatJst('2026-04-19 00:00:00')).toBe('2026-04-19 09:00:00')
  })

  // 日付境界: UTC 23:30 → JST 翌日 08:30
  it('UTC 深夜帯は JST では翌日の日付になる', () => {
    expect(formatJst('2026-04-19T23:30:00Z')).toBe('2026-04-20 08:30:00')
  })

  it('既に +09:00 付きの ISO8601 は二重変換しない', () => {
    expect(formatJst('2026-04-19T15:00:00+09:00')).toBe('2026-04-19 15:00:00')
  })

  it('null / undefined / 空文字は "—" を返す', () => {
    expect(formatJst(null)).toBe('—')
    expect(formatJst(undefined)).toBe('—')
    expect(formatJst('')).toBe('—')
  })

  it('パース失敗時は入力をそのまま返す（表示は壊さない）', () => {
    expect(formatJst('not-a-date')).toBe('not-a-date')
  })
})
