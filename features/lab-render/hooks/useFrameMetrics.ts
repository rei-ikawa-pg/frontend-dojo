/**
 * Lab UI（メトリクス表示）向けのフレーム計測フック。
 *
 * - playgroundStore.isRunning に追従して FPS メーター + LoAF を開始/停止
 * - FPS は 1 秒ごと、LoAF はフレーム発生時のみ state 更新する
 *   （毎フレーム setState を避けるため、更新頻度を意図的に絞る）
 */

'use client'

import { useEffect, useState } from 'react'
import { FpsMeter } from '../engine/fpsMeter'
import { FrameObserver } from '../engine/observer'
import type { FrameMetricsSnapshot, FrameSample } from '../engine/types'
import { usePlaygroundStore } from '../stores/playgroundStore'

export function useFrameMetrics(): FrameMetricsSnapshot {
  const isRunning = usePlaygroundStore((s) => s.isRunning)
  const [fps, setFps] = useState(0)
  const [lastFrame, setLastFrame] = useState<FrameSample | null>(null)

  useEffect(() => {
    if (!isRunning) {
      setFps(0)
      return
    }
    const meter = new FpsMeter()
    const observer = new FrameObserver()
    const unsubMeter = meter.subscribe(setFps)
    const unsubObserver = observer.subscribe(setLastFrame)
    meter.start()
    observer.start()
    return () => {
      unsubMeter()
      unsubObserver()
      meter.stop()
      observer.stop()
    }
  }, [isRunning])

  return { fps, lastFrame }
}
