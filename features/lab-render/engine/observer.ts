/**
 * LoAF API をラップした Lab 1 用 FrameObserver。
 * - features/rum 側にも類似の observeLoaf があるが、そちらは RUM 送信専用。
 *   この FrameObserver は Lab UI（TheoryVsActual / MetricsDisplay）向けに
 *   フレーム内の Style+Layout と Rendering 時間を分離した形で取り出す。
 * - 純粋な計算ロジックは observerCalc.ts に切り出してテスト可能にしている。
 */

import { supportsLoaf } from '@/lib/browser/capabilities'
import { calcRendering, calcStyleLayout, type LoafLikeEntry, sumScripts } from './observerCalc'
import type { FrameSample } from './types'

type Listener = (sample: FrameSample) => void

/** 教材上「long frame」と判断する閾値（ms） */
const LONG_FRAME_MS = 50

type LoafEntry = PerformanceEntry &
  Partial<LoafLikeEntry> & {
    blockingDuration?: number
  }

export class FrameObserver {
  private observer: PerformanceObserver | null = null
  private readonly listeners = new Set<Listener>()

  start(): void {
    if (this.observer) return
    // LoAF 非対応ブラウザでは observer を作らず、UI 側では「実測は観測不可」と表示する
    if (!supportsLoaf()) return

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const raw of list.getEntries()) {
          const entry = raw as LoafEntry
          const sample: FrameSample = {
            timestamp: entry.startTime,
            totalDuration: entry.duration,
            scriptDuration: sumScripts({ scripts: entry.scripts }),
            styleLayoutDuration: calcStyleLayout({
              renderStart: entry.renderStart ?? 0,
              styleAndLayoutStart: entry.styleAndLayoutStart ?? 0,
            }),
            renderingDuration: calcRendering({
              startTime: entry.startTime,
              duration: entry.duration,
              renderStart: entry.renderStart ?? 0,
            }),
            wasLongFrame: entry.duration > LONG_FRAME_MS,
          }
          for (const fn of this.listeners) fn(sample)
        }
      })
      this.observer.observe({ type: 'long-animation-frame', buffered: true })
    } catch {
      this.observer = null
    }
  }

  stop(): void {
    this.observer?.disconnect()
    this.observer = null
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }
}
