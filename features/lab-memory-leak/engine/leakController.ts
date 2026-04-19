/**
 * Lab 2 (メモリリーク) の可視化エンジン本体。
 *
 * 責務:
 *   - 4 種類のリークシナリオを意図的に作り出す (timer / listener / detached-dom / closure)
 *   - 対策の on/off で同じシナリオが「リークしない」状態も作れる
 *   - マウント/アンマウントのサイクルを模擬し、何度繰り返してもヒープが増えるかを観察する
 *
 * 設計方針:
 *   - GC の挙動に頼らず、自前カウンタで「生存している参照」の件数も可視化する
 *   - リーク自体はメインスレッドで動くのでユーザー操作には軽量に保つ
 *     (各サイクルで数 ms の仕事しかしない)
 *   - React の再レンダリングを挟まないよう、container への書き込みは DOM 直操作
 */

import { HOLD_SIZE_BYTES, type HoldSize, type LeakType, type Mitigation } from './types'

const ITEM_CLASS = 'lab-memory-item'
const DETACHED_CLASS = 'lab-memory-detached'

/** 1 サイクルで「マウント」する小ユニット。Timer/Listener/DOM/Closure を 1 つずつ内包 */
type LeakUnit = {
  type: LeakType
  mitigation: Mitigation
  /** setInterval ID。cleanup なしの場合は忘れる（意図的） */
  intervalId?: number
  /** AbortController。mitigation='abort-controller' の時に listener 登録で使う */
  abortController?: AbortController
  /** Listener の参照。cleanup なしだと溜まり続ける */
  listener?: () => void
  /** ターゲット要素 */
  element?: HTMLElement
  /** Detached DOM 参照。消したはずの要素を抱え続ける（意図的リーク） */
  detachedRef?: HTMLElement | WeakRef<HTMLElement>
  /** Closure が保持する大きな配列 */
  hold?: number[]
}

export type LeakControllerOptions = {
  container: HTMLElement
  onCountsChange?: (counts: LeakCounts) => void
}

export type LeakCounts = {
  /** 生存中の Timer */
  timers: number
  /** 生存中の Listener */
  listeners: number
  /** 消したつもりの Detached DOM 参照 */
  detached: number
  /** Closure 経由で保持中の大きな配列数 */
  closures: number
}

export class LeakController {
  private readonly container: HTMLElement
  private readonly onCountsChange?: (counts: LeakCounts) => void
  private units: LeakUnit[] = []

  constructor(options: LeakControllerOptions) {
    this.container = options.container
    this.onCountsChange = options.onCountsChange
  }

  /**
   * マウント → アンマウントを 1 回分実行する。
   * mitigation 次第で、アンマウント時に参照が解放されるかが決まる。
   */
  cycleOnce(type: LeakType, mitigation: Mitigation, holdSize: HoldSize): void {
    const unit = this.mount(type, mitigation, holdSize)
    // アンマウント時の挙動。mitigation='none' なら何もしない（意図的リーク）
    this.unmount(unit)
    this.notify()
  }

  /** 指定サイクル数をまとめて回す（プレイグラウンドの「サイクル数」スライダー用） */
  cycleMany(type: LeakType, mitigation: Mitigation, holdSize: HoldSize, n: number): void {
    for (let i = 0; i < n; i++) {
      const unit = this.mount(type, mitigation, holdSize)
      this.unmount(unit)
    }
    this.notify()
  }

  /** 全ての unit を強制解放する（リセットボタン用）。実験開始前にヒープを平らに戻す */
  releaseAll(): void {
    for (const u of this.units) {
      if (u.intervalId !== undefined) window.clearInterval(u.intervalId)
      if (u.abortController) u.abortController.abort()
      if (u.element && u.listener) u.element.removeEventListener('click', u.listener)
    }
    this.units = []
    // container の detached 可視化要素もクリア
    for (const el of this.container.querySelectorAll(`.${ITEM_CLASS}, .${DETACHED_CLASS}`)) {
      el.remove()
    }
    this.notify()
  }

  getCounts(): LeakCounts {
    return computeCounts(this.units)
  }

  destroy(): void {
    this.releaseAll()
  }

  /**
   * 1 unit をマウント: container に要素を作り、指定種別のリソースを紐付ける。
   * mitigation によって、紐付け方（cleanup 可能 / 不可能）が変わる。
   */
  private mount(type: LeakType, mitigation: Mitigation, holdSize: HoldSize): LeakUnit {
    const element = document.createElement('div')
    element.className = ITEM_CLASS
    element.textContent = type[0]?.toUpperCase() ?? '?'
    this.container.appendChild(element)

    const unit: LeakUnit = { type, mitigation, element }

    switch (type) {
      case 'timer':
        // 100ms おきに「何か重い処理」を模擬して heap を食わせる
        unit.intervalId = window.setInterval(() => {
          void 0
        }, 100)
        break

      case 'listener':
        unit.listener = () => {
          /* no-op — 参照保持が目的 */
        }
        if (mitigation === 'abort-controller') {
          unit.abortController = new AbortController()
          element.addEventListener('click', unit.listener, { signal: unit.abortController.signal })
        } else {
          element.addEventListener('click', unit.listener)
        }
        break

      case 'detached-dom': {
        // 大きな文字列を持つ小要素を作り、後で「削除したのに参照を握り続ける」ようにする
        const heavy = document.createElement('div')
        heavy.textContent = 'x'.repeat(HOLD_SIZE_BYTES[holdSize])
        element.appendChild(heavy)
        // mitigation='weak-ref' なら WeakRef 経由で保持し、GC で消えるようにする
        unit.detachedRef = mitigation === 'weak-ref' ? new WeakRef(heavy) : heavy
        break
      }

      case 'closure': {
        // Closure が大きな配列をキャプチャする典型リーク
        const big = new Array(HOLD_SIZE_BYTES[holdSize]).fill(0)
        unit.hold = big
        // 外側から参照される関数に封じる（本当の実戦ではこの関数が event handler 等に渡る）
        unit.listener = () => {
          void big.length
        }
        break
      }
    }

    this.units.push(unit)
    return unit
  }

  /**
   * 1 unit をアンマウント。mitigation に応じて適切な解放を行う。
   * mitigation='none' の時は何もせず「リーク状態」を保つ。
   */
  private unmount(unit: LeakUnit): void {
    const { mitigation, element, type } = unit

    // element 自体は DOM から外す（可視領域は保たない）
    if (element && type !== 'detached-dom') {
      element.remove()
    } else if (element && type === 'detached-dom') {
      // detached-dom シナリオでは「要素を削除した見た目」を演出するため dim に変える
      element.classList.add(DETACHED_CLASS)
      element.classList.remove(ITEM_CLASS)
    }

    if (mitigation === 'none') {
      // リーク状態。参照を残したまま何もしない
      return
    }

    if (mitigation === 'cleanup') {
      if (unit.intervalId !== undefined) {
        window.clearInterval(unit.intervalId)
        unit.intervalId = undefined
      }
      if (element && unit.listener) {
        element.removeEventListener('click', unit.listener)
        unit.listener = undefined
      }
      if (type === 'closure') {
        unit.hold = undefined
        unit.listener = undefined
      }
      if (type === 'detached-dom') {
        unit.detachedRef = undefined
      }
    }

    if (mitigation === 'abort-controller') {
      unit.abortController?.abort()
      unit.listener = undefined
      unit.abortController = undefined
    }

    if (mitigation === 'weak-ref') {
      // 参照は WeakRef なので GC 対象。ここでは何もしなくても解放可能
      // ただし教育目的で「明示的 deref() は保証しない」ことも示せる
    }
  }

  private notify(): void {
    this.onCountsChange?.(computeCounts(this.units))
  }
}

function computeCounts(units: LeakUnit[]): LeakCounts {
  let timers = 0
  let listeners = 0
  let detached = 0
  let closures = 0
  for (const u of units) {
    if (u.intervalId !== undefined) timers++
    if (u.listener) listeners++
    if (u.type === 'detached-dom') {
      // WeakRef の場合は既に回収されている可能性があるので deref を見る
      if (u.detachedRef instanceof WeakRef) {
        if (u.detachedRef.deref()) detached++
      } else if (u.detachedRef) {
        detached++
      }
    }
    if (u.type === 'closure' && u.hold) closures++
  }
  return { timers, listeners, detached, closures }
}
