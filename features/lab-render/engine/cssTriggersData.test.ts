import { describe, expect, it } from 'vitest'
import { aggregateImpact, getPhaseImpact } from './cssTriggersData'

describe('getPhaseImpact', () => {
  it('returns Composite-only for transform/opacity/filter', () => {
    for (const prop of ['transform', 'opacity', 'filter']) {
      expect(getPhaseImpact(prop)).toEqual({ layout: false, paint: false, composite: true })
    }
  })

  it('returns Paint+Composite for background-color/color/box-shadow', () => {
    for (const prop of ['background-color', 'color', 'box-shadow']) {
      expect(getPhaseImpact(prop)).toEqual({ layout: false, paint: true, composite: true })
    }
  })

  it('returns full pipeline for width/height/top/font-size', () => {
    for (const prop of ['width', 'height', 'top', 'font-size']) {
      expect(getPhaseImpact(prop)).toEqual({ layout: true, paint: true, composite: true })
    }
  })

  it('falls back to full pipeline for unknown property', () => {
    expect(getPhaseImpact('unknown-prop')).toEqual({ layout: true, paint: true, composite: true })
  })
})

describe('aggregateImpact', () => {
  it('returns all-false for empty input', () => {
    expect(aggregateImpact([])).toEqual({ layout: false, paint: false, composite: false })
  })

  it('returns the OR-merge of multiple props', () => {
    expect(aggregateImpact(['transform'])).toEqual({
      layout: false,
      paint: false,
      composite: true,
    })
    expect(aggregateImpact(['transform', 'background-color'])).toEqual({
      layout: false,
      paint: true,
      composite: true,
    })
    expect(aggregateImpact(['transform', 'background-color', 'width'])).toEqual({
      layout: true,
      paint: true,
      composite: true,
    })
  })

  it('treats Set inputs the same as arrays', () => {
    const set = new Set(['transform', 'opacity'])
    expect(aggregateImpact(set)).toEqual({ layout: false, paint: false, composite: true })
  })
})
