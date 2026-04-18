import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RumEvent } from '../shared/types'
import { RumBuffer } from './buffer'

const mkEvent = (n: number): RumEvent => ({
  session_id: '00000000-0000-4000-8000-000000000000',
  page_path: '/',
  mode: 'other',
  device_type: 'desktop',
  browser: 'chromium',
  metric_name: `test.${n}`,
  metric_value: n,
  timestamp: '2026-04-18T00:00:00.000Z',
  sdk_version: '0.1.0',
})

describe('RumBuffer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('flushes when reaching maxSize', () => {
    const onFlush = vi.fn()
    const buffer = new RumBuffer({ maxSize: 3, flushIntervalMs: 1000, onFlush })
    buffer.add(mkEvent(1))
    buffer.add(mkEvent(2))
    expect(onFlush).not.toHaveBeenCalled()
    buffer.add(mkEvent(3))
    expect(onFlush).toHaveBeenCalledTimes(1)
    expect(onFlush.mock.calls[0]?.[0]).toHaveLength(3)
  })

  it('flushes after the interval', () => {
    const onFlush = vi.fn()
    const buffer = new RumBuffer({ maxSize: 10, flushIntervalMs: 1000, onFlush })
    buffer.add(mkEvent(1))
    expect(onFlush).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1000)
    expect(onFlush).toHaveBeenCalledTimes(1)
    expect(onFlush.mock.calls[0]?.[0]).toHaveLength(1)
  })

  it('does not flush on empty buffer', () => {
    const onFlush = vi.fn()
    const buffer = new RumBuffer({ maxSize: 5, flushIntervalMs: 1000, onFlush })
    buffer.flush()
    expect(onFlush).not.toHaveBeenCalled()
  })

  it('resets after flush', () => {
    const onFlush = vi.fn()
    const buffer = new RumBuffer({ maxSize: 5, flushIntervalMs: 1000, onFlush })
    buffer.add(mkEvent(1))
    buffer.flush()
    expect(buffer.size()).toBe(0)
    buffer.add(mkEvent(2))
    expect(buffer.size()).toBe(1)
  })
})
