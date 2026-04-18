/**
 * requestAnimationFrame ベースの FPS 計測。
 * 1秒間のフレーム数を集計して subscribe 先に流す。
 *
 * 注意: 高精度な FPS ではなく「体感」用途。
 * 厳密な値は LoAF API の totalDuration から算出するのが正確。
 */

import { calcFps } from './observerCalc'

type Listener = (fps: number) => void

export class FpsMeter {
  private rafId: number | null = null
  private lastTime = 0
  private frames = 0
  private currentFps = 0
  private readonly listeners = new Set<Listener>()

  start(): void {
    if (this.rafId !== null) return
    this.lastTime = performance.now()
    this.frames = 0
    this.loop()
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  fps(): number {
    return this.currentFps
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  // アロー関数で保持して rAF に渡す (this 束縛のため)
  private loop = (): void => {
    const now = performance.now()
    this.frames += 1
    const elapsed = now - this.lastTime
    // 1秒ごとに集計してリスナーに通知（毎フレーム通知だと React 側が追いつかない）
    if (elapsed >= 1000) {
      this.currentFps = calcFps(this.frames, elapsed)
      for (const fn of this.listeners) fn(this.currentFps)
      this.frames = 0
      this.lastTime = now
    }
    this.rafId = requestAnimationFrame(this.loop)
  }
}
