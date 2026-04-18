/**
 * Lab 1 の可視化エンジン本体。
 *
 * 責務:
 *   - 実 DOM 要素を生成・差分管理（100〜2000個）
 *   - 毎フレーム、選択中の CSS プロパティを「動き続ける値」で更新する
 *
 * 設計方針:
 *   - React の state を経由しない（毎フレームの setState は 60fps を維持できない）
 *   - applyChanges は container.children に直接書き込み、useRef 経由で参照される想定
 *   - 要素数の増減は DocumentFragment / remove() で O(差分) に抑える
 */

/** 要素に付与するクラス名（globals.css 側のデフォルト見た目と対になる） */
const DEFAULT_CLASS = 'lab-render-item'
const TWO_PI = Math.PI * 2
/**
 * sin 波の周波数。元は 1 Hz（= TWO_PI）だったが、視覚的な「チカチカ」が強すぎて
 * 学習者が画面に集中できない問題があったため 0.4 Hz（≒ 2.5 秒に 1 周期）まで下げた。
 * LoAF で観測できる差（Layout 有効時 vs Composite のみ）は周波数が低くても残るので、
 * 計測目的は達成しつつ視覚ノイズだけを抑える狙い。
 */
const WAVE_FREQ = 0.4

export type RendererOptions = {
  container: HTMLElement
  initialCount?: number
  className?: string
}

export class RenderEngine {
  private readonly container: HTMLElement
  private readonly className: string
  private elements: HTMLElement[] = []
  private currentProps: ReadonlySet<string> = new Set()
  private rafId: number | null = null
  private startedAt = 0

  constructor(options: RendererOptions) {
    this.container = options.container
    this.className = options.className ?? DEFAULT_CLASS
    if (options.initialCount && options.initialCount > 0) {
      this.setElementCount(options.initialCount)
    }
  }

  /** 差分で要素数を増減。既存ノードは保ったまま（再マウントコストを避けるため）。 */
  setElementCount(next: number): void {
    const count = Math.max(0, Math.floor(next))
    if (count === this.elements.length) return
    if (count > this.elements.length) {
      // まとめて DocumentFragment に積んでから一度だけ appendChild → Layout を 1 回に抑える
      const fragment = document.createDocumentFragment()
      for (let i = this.elements.length; i < count; i++) {
        const el = document.createElement('div')
        el.className = this.className
        fragment.appendChild(el)
        this.elements.push(el)
      }
      this.container.appendChild(fragment)
    } else {
      for (let i = this.elements.length - 1; i >= count; i--) {
        this.elements[i]?.remove()
      }
      this.elements.length = count
    }
    // 要素構成が変わった瞬間にスタイルをクリアして、古いプロパティが残らないようにする
    this.resetStyles()
  }

  /** 有効化する CSS プロパティを切り替える。切替時は一旦全要素のスタイルをリセットする。 */
  setEnabledProperties(props: Iterable<string>): void {
    this.currentProps = new Set(props)
    this.resetStyles()
  }

  start(): void {
    if (this.rafId !== null) return
    this.startedAt = performance.now()
    this.loop()
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  isRunning(): boolean {
    return this.rafId !== null
  }

  destroy(): void {
    this.stop()
    for (const el of this.elements) el.remove()
    this.elements = []
  }

  private loop = (): void => {
    this.applyChanges()
    this.rafId = requestAnimationFrame(this.loop)
  }

  /**
   * 毎フレーム呼ばれる本体。経過時間 t と要素インデックス i から
   * sin 波で各プロパティを揺らすことで、「継続的にブラウザに仕事をさせる」状態を作る。
   *
   * 各振幅・色相幅は「チカチカ感」を抑えつつ LoAF で差を観測できる最小限に調整済み。
   * 具体的な値の根拠:
   *   - hue-rotate は 0..30deg（旧 0..360deg）。色相が一周すると視覚ノイズが大きすぎた
   *   - background-color は彩度 40% / 明度 50%（旧 70% / 55%）で彩度を抑えた
   *   - color は ink-900 ⇄ ink-400 の同系 2 段（旧 白⇄黒 点滅）
   *   - width/height/font-size は振幅を半減
   */
  private applyChanges(): void {
    if (this.elements.length === 0) return
    const t = (performance.now() - this.startedAt) / 1000 // seconds
    const props = this.currentProps

    for (let i = 0; i < this.elements.length; i++) {
      const el = this.elements[i]
      if (!el) continue
      // インデックスでフェーズをずらすことで、要素ごとに異なるタイミングで動かす
      // 刻みを 64 → 128 に細かくして、同期的な "波" に見えないようにする
      const phase = (i % 128) / 128
      const wave = Math.sin((t + phase) * TWO_PI * WAVE_FREQ)

      // --- Composite only ---
      if (props.has('transform')) {
        el.style.transform = `translateX(${wave * 5}px)`
      }
      if (props.has('opacity')) {
        // 0.75〜1.0 の狭い範囲（旧 0.55〜1.0）。半透明が濃すぎて目障りだった
        el.style.opacity = String(0.75 + 0.25 * (wave * 0.5 + 0.5))
      }
      if (props.has('filter')) {
        // hue-rotate は 0..30deg の微小回転。元は 0..360deg でレインボー状態になっていた
        el.style.filter = `hue-rotate(${(wave * 0.5 + 0.5) * 30}deg)`
      }

      // --- Paint + Composite ---
      if (props.has('background-color')) {
        // 彩度/明度を下げ、要素間の色相拡散も抑制（i * 0.5 → 0.2）
        const hue = ((wave * 0.5 + 0.5) * 360 + i * 0.2) % 360
        el.style.backgroundColor = `hsl(${hue} 40% 50%)`
      }
      if (props.has('color')) {
        // 白黒点滅を廃止し、ink-900 / ink-400 の同系色 2 段に。
        // テキストを持たない正方形でも fill 等に影響するため、Paint は依然として走る
        el.style.color = wave > 0 ? 'var(--ink-900)' : 'var(--ink-400)'
      }
      if (props.has('box-shadow')) {
        const blur = 2 + Math.abs(wave) * 4
        el.style.boxShadow = `0 0 ${blur}px rgba(255,255,255,0.25)`
      }

      // --- Layout + Paint + Composite ---
      if (props.has('width')) {
        el.style.width = `${20 + Math.abs(wave) * 6}px`
      }
      if (props.has('height')) {
        el.style.height = `${20 + Math.abs(wave) * 6}px`
      }
      if (props.has('top')) {
        el.style.position = 'relative'
        el.style.top = `${wave * 3}px`
      }
      if (props.has('font-size')) {
        el.style.fontSize = `${10 + Math.abs(wave) * 3}px`
      }
    }
  }

  private resetStyles(): void {
    for (const el of this.elements) {
      el.removeAttribute('style')
    }
  }
}
