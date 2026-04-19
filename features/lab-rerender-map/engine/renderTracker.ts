/**
 * 各ノードの render 回数と最新 render 時刻を集計するグローバルレジストリ。
 *
 * - Zustand / useState を通さず、低コストな pub/sub で更新（render 時に毎回購読先を再レンダーさせないため）
 * - ノードが自身のマウント時に `increment(id)` を呼ぶ → 内部カウンタを更新し subscriber に通知
 * - subscribers が MetricsDisplay 等で購読して画面に反映する
 *
 * 「render を観測するための render」が増えすぎないように、subscriber 側で `throttle` して使うのが前提。
 */

export type RenderStats = {
  counts: Record<string, number>
  lastRenderAt: Record<string, number>
}

type Listener = (stats: RenderStats) => void

class RenderTracker {
  private counts: Record<string, number> = {}
  private lastRenderAt: Record<string, number> = {}
  private listeners = new Set<Listener>()
  /** 通知の throttle 用タイマ */
  private pendingNotify: ReturnType<typeof setTimeout> | null = null

  increment(id: string): void {
    this.counts[id] = (this.counts[id] ?? 0) + 1
    this.lastRenderAt[id] = performance.now()
    this.scheduleNotify()
  }

  reset(): void {
    this.counts = {}
    this.lastRenderAt = {}
    this.scheduleNotify()
  }

  snapshot(): RenderStats {
    return { counts: { ...this.counts }, lastRenderAt: { ...this.lastRenderAt } }
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private scheduleNotify(): void {
    if (this.pendingNotify !== null) return
    // rAF + 次の tick で 1 度だけ通知。リフロー前に購読先が最新値を受け取れる
    this.pendingNotify = setTimeout(() => {
      this.pendingNotify = null
      const snap = this.snapshot()
      for (const listener of this.listeners) listener(snap)
    }, 0)
  }
}

/**
 * シングルトン。1 ページ内で複数ツリーを描画しないことを前提にしている
 * (Tutorial / Playground で同時に出すことはない)。
 */
export const renderTracker = new RenderTracker()
