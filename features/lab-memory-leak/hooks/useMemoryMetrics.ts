/**
 * `performance.memory` と DOM ノード数を定期サンプリングするフック。
 *
 * - `enabled=false` の間はポーリングしない（非アクティブ時にも計測を回さないため）
 * - サンプル間隔は 500ms 固定（チャート表示の滑らかさと CPU コストのバランス）
 * - リングバッファで過去 120 秒分を保持
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { countAttachedNodes, readHeapUsed } from '../engine/memoryReader'
import type { MemorySample } from '../engine/types'

const SAMPLE_INTERVAL_MS = 500
const MAX_SAMPLES = 240 // 120 秒分

type UseMemoryMetricsArgs = {
  enabled: boolean
  getRetainedCount: () => number
}

export function useMemoryMetrics({ enabled, getRetainedCount }: UseMemoryMetricsArgs) {
  const [samples, setSamples] = useState<MemorySample[]>([])
  const getRetainedRef = useRef(getRetainedCount)
  getRetainedRef.current = getRetainedCount

  useEffect(() => {
    if (!enabled) return

    const tick = () => {
      const sample: MemorySample = {
        t: performance.now(),
        used: readHeapUsed(),
        domNodes: countAttachedNodes(),
        retained: getRetainedRef.current(),
      }
      setSamples((prev) => {
        const next = prev.length >= MAX_SAMPLES ? prev.slice(1) : prev.slice()
        next.push(sample)
        return next
      })
    }

    // 開始直後に 1 サンプル取ると、ベースラインが画面に載る
    tick()
    const id = window.setInterval(tick, SAMPLE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [enabled])

  // 手動で過去サンプルをクリアするためのユーティリティ
  const clear = () => setSamples([])

  return { samples, clear }
}
