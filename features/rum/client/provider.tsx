/**
 * RumCollector を React のライフサイクルに結びつけるプロバイダ。
 * - ルートレイアウトで一度だけマウントする
 * - enabled=false の時は Collector を生成しない（開発時の挙動）
 */

'use client'

import { useEffect } from 'react'
import { RumCollector } from './collector'

export type RumProviderProps = {
  endpoint: string
  enabled: boolean
  children: React.ReactNode
}

export function RumProvider({ endpoint, enabled, children }: RumProviderProps) {
  useEffect(() => {
    if (!enabled) return
    const collector = new RumCollector({ endpoint, enabled })
    // Lab の useRumCustomMetric から window 経由で参照するため、グローバルに公開する
    window.__RUM__ = {
      emit: (input) => collector.emit(input),
      setContext: (next) => collector.setContext(next),
    }
    collector.start()
    return () => {
      collector.stop()
      delete window.__RUM__
    }
  }, [endpoint, enabled])

  return <>{children}</>
}
