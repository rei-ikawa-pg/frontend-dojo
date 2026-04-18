import { describe, expect, it } from 'vitest'
import { toKanjiNum } from './kanjiNum'

describe('toKanjiNum', () => {
  it('0 は 〇 になる', () => {
    expect(toKanjiNum(0)).toBe('〇')
  })

  it.each([
    [1, '壱'],
    [2, '弐'],
    [3, '参'],
    [4, '肆'],
    [5, '伍'],
    [6, '陸'],
    [7, '漆'],
    [8, '捌'],
    [9, '玖'],
  ])('1 桁 %i は %s になる', (n, expected) => {
    expect(toKanjiNum(n)).toBe(expected)
  })

  it('10 は拾のみ(壱拾ではない)', () => {
    expect(toKanjiNum(10)).toBe('拾')
  })

  it.each([
    [11, '拾壱'],
    [15, '拾伍'],
    [19, '拾玖'],
  ])('十の位が 1 の %i は 拾X になる', (n, expected) => {
    expect(toKanjiNum(n)).toBe(expected)
  })

  it.each([
    [20, '弐拾'],
    [30, '参拾'],
    [90, '玖拾'],
  ])('一の位が 0 の %i は X拾 になる', (n, expected) => {
    expect(toKanjiNum(n)).toBe(expected)
  })

  it.each([
    [21, '弐拾壱'],
    [57, '伍拾漆'],
    [88, '捌拾捌'],
    [99, '玖拾玖'],
  ])('2 桁 %i は X拾Y になる', (n, expected) => {
    expect(toKanjiNum(n)).toBe(expected)
  })

  it.each([
    [100],
    [999],
    [-1],
    [1.5],
    [Number.NaN],
    [Number.POSITIVE_INFINITY],
  ])('範囲外 %s は空文字を返す', (n) => {
    expect(toKanjiNum(n)).toBe('')
  })
})
