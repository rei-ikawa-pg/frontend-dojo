import { describe, expect, it } from 'vitest'
import { rumEventArraySchema, rumEventSchema, SDK_VERSION } from './schema'

const baseEvent = {
  session_id: '00000000-0000-4000-8000-000000000000',
  page_path: '/lab/render/playground',
  lab_id: 'render',
  mode: 'playground' as const,
  device_type: 'desktop' as const,
  browser: 'chromium' as const,
  metric_name: 'lab.render.fps',
  metric_value: 60,
  timestamp: '2026-04-18T12:00:00.000Z',
  sdk_version: SDK_VERSION,
}

describe('rumEventSchema', () => {
  it('accepts a valid event', () => {
    expect(rumEventSchema.parse(baseEvent)).toMatchObject({ metric_name: 'lab.render.fps' })
  })

  it('accepts lab_id=null (共通基盤メトリクス)', () => {
    expect(() => rumEventSchema.parse({ ...baseEvent, lab_id: null })).not.toThrow()
  })

  it('accepts metadata with mixed primitive values', () => {
    expect(() =>
      rumEventSchema.parse({
        ...baseEvent,
        metadata: { frames: 60, stable: true, preset: 'heavy-paint', note: null },
      }),
    ).not.toThrow()
  })

  it('rejects invalid mode', () => {
    expect(() => rumEventSchema.parse({ ...baseEvent, mode: 'wat' })).toThrow()
  })

  it('rejects non-UUID session_id', () => {
    expect(() => rumEventSchema.parse({ ...baseEvent, session_id: 'not-a-uuid' })).toThrow()
  })

  it('rejects NaN metric_value', () => {
    expect(() => rumEventSchema.parse({ ...baseEvent, metric_value: Number.NaN })).toThrow()
  })

  it('rejects timestamps without offset', () => {
    expect(() => rumEventSchema.parse({ ...baseEvent, timestamp: '2026-04-18T12:00:00' })).toThrow()
  })
})

describe('rumEventArraySchema', () => {
  it('accepts 1..50 events', () => {
    expect(() => rumEventArraySchema.parse([baseEvent])).not.toThrow()
    expect(() => rumEventArraySchema.parse(Array(50).fill(baseEvent))).not.toThrow()
  })

  it('rejects empty arrays', () => {
    expect(() => rumEventArraySchema.parse([])).toThrow()
  })

  it('rejects arrays longer than 50', () => {
    expect(() => rumEventArraySchema.parse(Array(51).fill(baseEvent))).toThrow()
  })
})
