/**
 * RUM Collector: クライアント側の統括クラス。
 *
 * 責務:
 *   - セッション ID / UA 判定などのコンテキストを 1 箇所で保持
 *   - web-vitals / LoAF / Lab からのカスタムメトリクスを一本化して Buffer に流す
 *   - visibilitychange / pagehide での強制 flush を配線
 *
 * 公開手段:
 *   - window.__RUM__.emit / setContext … Lab から window 経由で利用できるようにする
 *     （フック経由も useRumCustomMetric で提供）
 */

import { detectBrowser, detectDeviceType } from '@/lib/browser/detect'
import type { MetricMode } from '../shared/schema'
import { SDK_VERSION } from '../shared/schema'
import type { RumEvent, RumEventInput } from '../shared/types'
import { RumBuffer } from './buffer'
import { observeLoaf } from './loaf'
import { createSender } from './sender'
import { getOrCreateSessionId } from './session'
import { registerWebVitals } from './webVitals'

export type RumContext = {
  lab_id?: string | null
  mode: MetricMode
}

declare global {
  interface Window {
    __RUM__?: {
      emit: (input: RumEventInput) => void
      setContext: (next: Partial<RumContext>) => void
    }
  }
}

export type CollectorOptions = {
  endpoint: string
  enabled: boolean
}

export class RumCollector {
  private buffer: RumBuffer
  private unsubscribeLoaf: (() => void) | null = null
  private boundVisibility: (() => void) | null = null
  private boundPageHide: (() => void) | null = null
  private readonly sessionId: string
  private readonly browser = detectBrowser()
  private readonly deviceType = detectDeviceType()
  // document.referrer は空文字のことがあるので null に正規化
  private readonly referrer = typeof document !== 'undefined' ? document.referrer || null : null
  // Lab ページ遷移時に setContext で上書きされる
  private context: RumContext = { lab_id: null, mode: 'other' }
  private started = false

  constructor(private readonly options: CollectorOptions) {
    this.sessionId = getOrCreateSessionId()
    const send = createSender(options.endpoint)
    this.buffer = new RumBuffer({
      onFlush: (events) => {
        // enabled=false の時は flush されてもネットワーク送信はしない（開発時の挙動）
        if (!this.options.enabled) return
        send(events)
      },
    })
  }

  start(): void {
    if (this.started) return
    this.started = true

    this.unsubscribeLoaf = observeLoaf(({ name, value, metadata }) => {
      this.enqueue({ metric_name: name, metric_value: value, metadata })
    })

    registerWebVitals(({ name, value, metadata }) => {
      this.enqueue({ metric_name: name, metric_value: value, metadata })
    })

    // タブが隠れる / ページを離れるタイミングは最重要 flush ポイント
    this.boundVisibility = () => {
      if (document.visibilityState === 'hidden') this.buffer.flush()
    }
    this.boundPageHide = () => this.buffer.flush()
    document.addEventListener('visibilitychange', this.boundVisibility)
    window.addEventListener('pagehide', this.boundPageHide)
  }

  stop(): void {
    if (!this.started) return
    this.unsubscribeLoaf?.()
    this.unsubscribeLoaf = null
    if (this.boundVisibility) document.removeEventListener('visibilitychange', this.boundVisibility)
    if (this.boundPageHide) window.removeEventListener('pagehide', this.boundPageHide)
    this.boundVisibility = null
    this.boundPageHide = null
    // アンマウント時点で持ってるイベントは送り切る
    this.buffer.flush()
    this.started = false
  }

  setContext(next: Partial<RumContext>): void {
    this.context = { ...this.context, ...next }
  }

  emit(input: RumEventInput): void {
    this.enqueue(input)
  }

  private enqueue(input: RumEventInput): void {
    if (typeof window === 'undefined') return
    // Infinity / NaN が来たら null に潰す（Zod の finite バリデーションで落とさないよう事前正規化）
    const metadataWithNumbers = input.metadata
      ? Object.fromEntries(
          Object.entries(input.metadata).map(([k, v]) => [
            k,
            typeof v === 'number' && !Number.isFinite(v) ? null : v,
          ]),
        )
      : undefined

    const event: RumEvent = {
      session_id: this.sessionId,
      page_path: window.location.pathname,
      lab_id: input.lab_id ?? this.context.lab_id ?? null,
      mode: this.context.mode,
      device_type: this.deviceType,
      browser: this.browser,
      metric_name: input.metric_name,
      metric_value: Number.isFinite(input.metric_value) ? input.metric_value : 0,
      metadata: metadataWithNumbers,
      timestamp: new Date().toISOString(),
      sdk_version: SDK_VERSION,
      referrer: this.referrer,
    }
    this.buffer.add(event)
  }
}
