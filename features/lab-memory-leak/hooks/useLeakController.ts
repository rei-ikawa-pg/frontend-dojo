/**
 * LeakController を React ライフサイクルに結び付けるフック。
 *
 * - container ref にコントローラをアタッチし、unmount 時に releaseAll → destroy
 * - `isRunning` が true の間は 1 秒おきに cycleMany(cycleCount) を回す
 * - 自動モードでなければ外部から `cycleOnce()` を呼ぶことで単発実行できる
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { LeakController, type LeakCounts } from '../engine/leakController'
import { useMemoryPlaygroundStore } from '../stores/playgroundStore'

type UseLeakControllerResult = {
  counts: LeakCounts
  cycleOnce: () => void
  releaseAll: () => void
}

const INITIAL_COUNTS: LeakCounts = { timers: 0, listeners: 0, detached: 0, closures: 0 }

export function useLeakController(
  containerRef: React.RefObject<HTMLElement | null>,
): UseLeakControllerResult {
  const controllerRef = useRef<LeakController | null>(null)
  const [counts, setCounts] = useState<LeakCounts>(INITIAL_COUNTS)

  const leakType = useMemoryPlaygroundStore((s) => s.leakType)
  const mitigation = useMemoryPlaygroundStore((s) => s.mitigation)
  const holdSize = useMemoryPlaygroundStore((s) => s.holdSize)
  const cycleCount = useMemoryPlaygroundStore((s) => s.cycleCount)
  const isRunning = useMemoryPlaygroundStore((s) => s.isRunning)

  // 最新の操作パラメータを rAF / setInterval のコールバックから読めるように ref で保持
  const paramsRef = useRef({ leakType, mitigation, holdSize, cycleCount })
  paramsRef.current = { leakType, mitigation, holdSize, cycleCount }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const controller = new LeakController({
      container,
      onCountsChange: setCounts,
    })
    controllerRef.current = controller
    return () => {
      controller.destroy()
      controllerRef.current = null
      setCounts(INITIAL_COUNTS)
    }
  }, [containerRef])

  useEffect(() => {
    if (!isRunning) return
    const id = window.setInterval(() => {
      const c = controllerRef.current
      if (!c) return
      const p = paramsRef.current
      c.cycleMany(p.leakType, p.mitigation, p.holdSize, p.cycleCount)
    }, 1000)
    return () => window.clearInterval(id)
  }, [isRunning])

  const cycleOnce = useCallback(() => {
    const c = controllerRef.current
    if (!c) return
    const p = paramsRef.current
    c.cycleMany(p.leakType, p.mitigation, p.holdSize, p.cycleCount)
  }, [])

  const releaseAll = useCallback(() => {
    controllerRef.current?.releaseAll()
  }, [])

  return { counts, cycleOnce, releaseAll }
}
