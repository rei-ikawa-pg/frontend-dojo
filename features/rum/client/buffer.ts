/**
 * RUM イベントの送信前バッファ。
 *
 * Flush のトリガー:
 *   - maxSize に到達したら即時送信
 *   - flushIntervalMs の経過で送信
 *   - 外部（Collector）から visibilitychange / pagehide で強制 flush
 *
 * 理由: 個別イベントごとに送ると D1 への書き込み負荷と Worker 実行回数が跳ね上がるため、
 * 教材としても参考になる「20件 or 5秒」方針で集約している。
 */

import type { RumEvent } from '../shared/types'

export type BufferOptions = {
  maxSize?: number
  flushIntervalMs?: number
  onFlush: (events: RumEvent[]) => void
}

const DEFAULT_MAX_SIZE = 20
const DEFAULT_FLUSH_INTERVAL_MS = 5000

export class RumBuffer {
  private events: RumEvent[] = []
  private timer: ReturnType<typeof setTimeout> | null = null
  private readonly maxSize: number
  private readonly intervalMs: number
  private readonly onFlush: (events: RumEvent[]) => void

  constructor(options: BufferOptions) {
    this.maxSize = options.maxSize ?? DEFAULT_MAX_SIZE
    this.intervalMs = options.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS
    this.onFlush = options.onFlush
  }

  add(event: RumEvent): void {
    this.events.push(event)
    if (this.events.length >= this.maxSize) {
      this.flush()
      return
    }
    this.ensureTimer()
  }

  flush(): void {
    this.clearTimer()
    if (this.events.length === 0) return
    const batch = this.events
    // 送信中に add() が来ても混ざらないよう、先にスワップする
    this.events = []
    this.onFlush(batch)
  }

  size(): number {
    return this.events.length
  }

  private ensureTimer(): void {
    if (this.timer !== null) return
    this.timer = setTimeout(() => {
      this.timer = null
      this.flush()
    }, this.intervalMs)
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
}
