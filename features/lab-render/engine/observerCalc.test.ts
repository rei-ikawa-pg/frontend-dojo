import { describe, expect, it } from 'vitest'
import { calcFps, calcRendering, calcStyleLayout, sumScripts } from './observerCalc'

describe('sumScripts', () => {
  it('returns 0 when no scripts', () => {
    expect(sumScripts({ scripts: [] })).toBe(0)
    expect(sumScripts({})).toBe(0)
  })
  it('sums multiple script durations', () => {
    expect(sumScripts({ scripts: [{ duration: 4 }, { duration: 6 }, { duration: 2 }] })).toBe(12)
  })
})

describe('calcStyleLayout', () => {
  it('returns 0 when renderStart is 0', () => {
    expect(calcStyleLayout({ renderStart: 0, styleAndLayoutStart: 5 })).toBe(0)
  })
  it('returns 0 when styleAndLayoutStart is 0', () => {
    expect(calcStyleLayout({ renderStart: 10, styleAndLayoutStart: 0 })).toBe(0)
  })
  it('returns the difference otherwise', () => {
    expect(calcStyleLayout({ renderStart: 14, styleAndLayoutStart: 4 })).toBe(10)
  })
  it('clamps negatives to 0', () => {
    expect(calcStyleLayout({ renderStart: 4, styleAndLayoutStart: 14 })).toBe(0)
  })
})

describe('calcRendering', () => {
  it('returns 0 when renderStart is 0', () => {
    expect(calcRendering({ startTime: 0, duration: 16, renderStart: 0 })).toBe(0)
  })
  it('returns the rendering tail of the frame', () => {
    expect(calcRendering({ startTime: 100, duration: 16, renderStart: 110 })).toBe(6)
  })
  it('clamps negatives', () => {
    expect(calcRendering({ startTime: 100, duration: 5, renderStart: 200 })).toBe(0)
  })
})

describe('calcFps', () => {
  it('returns 0 for 0ms elapsed', () => {
    expect(calcFps(60, 0)).toBe(0)
  })
  it('returns rounded fps', () => {
    expect(calcFps(60, 1000)).toBe(60)
    expect(calcFps(45, 1000)).toBe(45)
    expect(calcFps(59, 1001)).toBe(59) // 58.94 -> 59
  })
})
