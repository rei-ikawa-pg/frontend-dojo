/**
 * RUM バッチの送信ロジック。
 *
 * 優先順位:
 *   1. navigator.sendBeacon … ページ離脱時でも送信が保証される
 *   2. fetch with keepalive  … sendBeacon 未対応環境向け
 *   3. 通常の fetch          … 最後の手段
 *
 * 送信失敗は握りつぶす方針。サーバ側の受信件数で異常を検知する。
 * （クライアント側で無限リトライすると悪意ある送信の温床になるため）
 */

import { supportsSendBeacon } from '@/lib/browser/capabilities'
import type { RumEvent } from '../shared/types'

export type Sender = (events: RumEvent[]) => void

export function createSender(endpoint: string): Sender {
  return (events) => {
    if (events.length === 0) return
    const body = JSON.stringify(events)

    if (supportsSendBeacon()) {
      try {
        // sendBeacon は Blob で送ることで Content-Type を明示できる
        const blob = new Blob([body], { type: 'application/json' })
        if (navigator.sendBeacon(endpoint, blob)) return
      } catch {
        // キュー溢れや CSP 拒否の可能性。fetch フォールバックに進む
      }
    }

    try {
      void fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        // pagehide 中でも送信を継続してもらう
        keepalive: true,
        credentials: 'omit',
      }).catch(() => {
        // 握りつぶし（方針の通り）
      })
    } catch {
      // fetch 自体が投げる（同期エラー）ケース。ここまで来たら諦める
    }
  }
}
