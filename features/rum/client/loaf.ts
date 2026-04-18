/**
 * LoAF (Long Animation Frame) API の購読。
 *
 * LoAF は Chromium 123+ で動作する新しい PerformanceObserver の type で、
 * 「1フレームの中で JS / Style+Layout / Rendering に何ms使ったか」を粒度で得られる唯一の手段。
 * Safari / Firefox ではまだ未対応のため、非対応時は no-op でフォールバックする。
 *
 * Paint と Composite は LoAF でも分離できないので、renderingDuration は合算値として扱う
 * （docs/06 の設計判断に準拠）。
 */

import { supportsLoaf } from '@/lib/browser/capabilities'

type Emit = (metric: {
  name: string
  value: number
  metadata?: Record<string, number | string | boolean | null>
}) => void

type LoafEntry = PerformanceEntry & {
  renderStart?: number
  styleAndLayoutStart?: number
  blockingDuration?: number
  scripts?: ReadonlyArray<{ duration: number; invoker?: string }>
}

/**
 * @param emit  フレームごとに RUM Collector に流すコールバック
 * @returns 購読解除関数（非対応ブラウザでも安全に呼べる）
 */
export function observeLoaf(emit: Emit): () => void {
  if (!supportsLoaf()) return () => {}

  let observer: PerformanceObserver | null = null
  try {
    observer = new PerformanceObserver((list) => {
      for (const raw of list.getEntries()) {
        const entry = raw as LoafEntry
        // 各フェーズの開始時刻から区間を逆算する
        const renderStart = entry.renderStart ?? 0
        const styleLayoutStart = entry.styleAndLayoutStart ?? 0
        const scriptDuration = entry.scripts?.reduce((acc, s) => acc + (s.duration ?? 0), 0) ?? 0
        const styleLayoutDuration =
          renderStart > 0 && styleLayoutStart > 0 ? renderStart - styleLayoutStart : 0
        const renderingDuration =
          renderStart > 0 ? entry.startTime + entry.duration - renderStart : 0

        emit({
          name: 'loaf',
          value: entry.duration,
          metadata: {
            script_ms: Math.max(0, scriptDuration),
            style_layout_ms: Math.max(0, styleLayoutDuration),
            rendering_ms: Math.max(0, renderingDuration),
            blocking_ms: entry.blockingDuration ?? 0,
            // 教材上の閾値: 50ms を超えたフレームは long frame
            long_frame: entry.duration > 50,
          },
        })
      }
    })
    // buffered: true で、observe 登録前に発生した分も取りこぼさない
    observer.observe({ type: 'long-animation-frame', buffered: true })
  } catch {
    observer = null
  }

  return () => {
    observer?.disconnect()
    observer = null
  }
}
