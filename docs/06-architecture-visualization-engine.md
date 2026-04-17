# Lab 1 可視化エンジン設計ドラフト

最終更新: 2026-04-17 / ステータス: ドラフト

## 0. 設計方針サマリ

- **実DOM操作**: 実際のDOM要素100〜2000個を操作してブラウザの振る舞いを観察
- **観測 + 判定のハイブリッド**: LoAFで実測、CSS Triggersデータで理論補完
- **Lab 1専用の最小実装**: 抽象化は将来必要になったら
- **DevTools誘導**: サイトは「入口」、詳細はPerformance panelへ

---

## 1. ディレクトリ構造

```
features/lab-render/
├── engine/
│   ├── renderer.ts           # DOM操作のコア
│   ├── observer.ts           # LoAF + PerformanceObserver ラッパー
│   ├── fpsMeter.ts           # FPS計測
│   ├── cssTriggersData.ts    # CSSプロパティ → 理論影響 のテーブル
│   ├── types.ts
│   └── index.ts
├── components/
│   ├── VisualizationView.tsx # 可視化エリア全体
│   ├── ElementGrid.tsx       # 実DOM要素のグリッド
│   ├── ControlPanel.tsx      # スライダー、プロパティトグル
│   ├── MetricsDisplay.tsx    # FPS, フレーム時間, Layout時間等
│   ├── PhaseIndicator.tsx    # Paint/Layout/Composite 色分けハイライト
│   └── TheoryVsActual.tsx    # 理論 vs 実測の並置表示
├── hooks/
│   ├── useRenderEngine.ts
│   ├── useFrameMetrics.ts
│   └── useCssTriggers.ts
├── stores/
│   └── playgroundStore.ts
├── tutorial/
│   └── steps.ts
├── content/
│   ├── overview.mdx
│   └── tutorial/
│       └── step-*.mdx
├── types.ts
└── index.ts
```

---

## 2. エンジンのコア設計

### 2.1 RenderEngine クラス

責務: 実DOM要素の生成、CSS変更、フレーム計測の統括。

```typescript
// features/lab-render/engine/renderer.ts
export class RenderEngine {
  private container: HTMLElement
  private elements: HTMLElement[] = []
  private observer: FrameObserver
  private fpsMeter: FpsMeter
  private animationFrameId: number | null = null
  private currentProps: Set<string> = new Set()

  constructor(container: HTMLElement) {
    this.container = container
    this.observer = new FrameObserver()
    this.fpsMeter = new FpsMeter()
  }

  init(count: number) {
    this.clear()
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div')
      el.className = 'lab-render-item'
      this.container.appendChild(el)
      this.elements.push(el)
    }
  }

  setElementCount(next: number) {
    // 差分追加/削除
  }

  setEnabledProperties(props: Set<string>) {
    this.currentProps = props
  }

  start() {
    if (this.animationFrameId !== null) return
    this.observer.start()
    this.fpsMeter.start()
    this.loop()
  }

  stop() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId)
    this.animationFrameId = null
    this.observer.stop()
    this.fpsMeter.stop()
  }

  private loop = () => {
    // 現在の currentProps に応じて要素に変更を適用
    this.applyChanges()
    this.animationFrameId = requestAnimationFrame(this.loop)
  }

  private applyChanges() {
    // currentProps に含まれるプロパティを毎フレーム少しずつ変える
    // 例: transform なら translateX を時間で振動させる
  }

  clear() {
    this.elements.forEach(el => el.remove())
    this.elements = []
  }

  destroy() {
    this.stop()
    this.clear()
  }
}
```

### 2.2 FrameObserver クラス

責務: LoAF API と PerformanceObserver でフレーム情報を収集。

```typescript
// features/lab-render/engine/observer.ts
export type FrameSample = {
  timestamp: number
  totalDuration: number
  scriptDuration: number       // JS実行時間
  styleLayoutDuration: number  // Style再計算 + Layout
  renderingDuration: number    // Paint + Composite（合算）
  wasLongFrame: boolean        // 50ms超えたか
}

type FrameSampleCallback = (sample: FrameSample) => void

export class FrameObserver {
  private observer: PerformanceObserver | null = null
  private listeners: Set<FrameSampleCallback> = new Set()

  start() {
    if (!('PerformanceObserver' in window)) return
    if (!PerformanceObserver.supportedEntryTypes?.includes('long-animation-frame')) return

    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const loaf = entry as PerformanceLongAnimationFrameTiming
        const sample: FrameSample = {
          timestamp: loaf.startTime,
          totalDuration: loaf.duration,
          scriptDuration: this.sumScripts(loaf),
          styleLayoutDuration: this.calcStyleLayout(loaf),
          renderingDuration: this.calcRendering(loaf),
          wasLongFrame: loaf.duration > 50,
        }
        this.listeners.forEach(fn => fn(sample))
      }
    })

    this.observer.observe({ type: 'long-animation-frame', buffered: true })
  }

  stop() {
    this.observer?.disconnect()
    this.observer = null
  }

  subscribe(fn: FrameSampleCallback): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  private sumScripts(loaf: PerformanceLongAnimationFrameTiming): number {
    return loaf.scripts.reduce((acc, s) => acc + s.duration, 0)
  }

  private calcStyleLayout(loaf: PerformanceLongAnimationFrameTiming): number {
    if (loaf.styleAndLayoutStart === 0) return 0
    return loaf.renderStart - loaf.styleAndLayoutStart
  }

  private calcRendering(loaf: PerformanceLongAnimationFrameTiming): number {
    if (loaf.renderStart === 0) return 0
    return (loaf.startTime + loaf.duration) - loaf.renderStart
  }
}
```

### 2.3 FpsMeter クラス

責務: FPSを requestAnimationFrame ベースで計測。

```typescript
// features/lab-render/engine/fpsMeter.ts
export class FpsMeter {
  private rafId: number | null = null
  private lastTime = 0
  private frames = 0
  private currentFps = 0
  private listeners: Set<(fps: number) => void> = new Set()

  start() {
    this.lastTime = performance.now()
    this.frames = 0
    this.loop()
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId)
    this.rafId = null
  }

  subscribe(fn: (fps: number) => void): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  private loop = () => {
    const now = performance.now()
    this.frames++
    if (now - this.lastTime >= 1000) {
      this.currentFps = Math.round((this.frames * 1000) / (now - this.lastTime))
      this.listeners.forEach(fn => fn(this.currentFps))
      this.frames = 0
      this.lastTime = now
    }
    this.rafId = requestAnimationFrame(this.loop)
  }
}
```

---

## 3. CSS Triggers データ

プロパティごとの理論的な影響を持つテーブル。

```typescript
// features/lab-render/engine/cssTriggersData.ts
export type PhaseImpact = {
  layout: boolean
  paint: boolean
  composite: boolean
}

export const cssTriggersMap: Record<string, PhaseImpact> = {
  'width': { layout: true, paint: true, composite: true },
  'height': { layout: true, paint: true, composite: true },
  'top': { layout: true, paint: true, composite: true },
  'left': { layout: true, paint: true, composite: true },
  'margin': { layout: true, paint: true, composite: true },
  'padding': { layout: true, paint: true, composite: true },
  'border-width': { layout: true, paint: true, composite: true },
  'font-size': { layout: true, paint: true, composite: true },
  'display': { layout: true, paint: true, composite: true },
  'background-color': { layout: false, paint: true, composite: true },
  'color': { layout: false, paint: true, composite: true },
  'box-shadow': { layout: false, paint: true, composite: true },
  'border-color': { layout: false, paint: true, composite: true },
  'background-image': { layout: false, paint: true, composite: true },
  'transform': { layout: false, paint: false, composite: true },
  'opacity': { layout: false, paint: false, composite: true },
  'filter': { layout: false, paint: false, composite: true },
}

export function getPhaseImpact(prop: string): PhaseImpact {
  return cssTriggersMap[prop] ?? { layout: true, paint: true, composite: true }
}

export function aggregateImpact(props: Set<string>): PhaseImpact {
  let result: PhaseImpact = { layout: false, paint: false, composite: false }
  for (const prop of props) {
    const impact = getPhaseImpact(prop)
    result.layout = result.layout || impact.layout
    result.paint = result.paint || impact.paint
    result.composite = result.composite || impact.composite
  }
  return result
}
```

---

## 4. 可視化UI

### 4.1 画面レイアウト

```
┌──────────────────────────────────────────────────────┐
│ [Lab 1: レンダリングパイプライン可視化] モード: 自由操作  │
├──────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────────┐  ┌──────────────────────────┐   │
│  │                 │  │ 操作パネル                │   │
│  │                 │  │                           │   │
│  │  実DOM要素の    │  │ 要素数: [===|====] 500   │   │
│  │  グリッド表示   │  │                           │   │
│  │                 │  │ プロパティ:              │   │
│  │  (500個)        │  │ ☑ transform              │   │
│  │                 │  │ ☐ width                  │   │
│  │                 │  │ ☐ background-color       │   │
│  │                 │  │ ☐ top                    │   │
│  └─────────────────┘  │ ☐ box-shadow             │   │
│                        │                           │   │
│                        │ [▶ 実行] [■ 停止]         │   │
│                        └──────────────────────────┘   │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ メトリクス                                     │    │
│  │                                               │    │
│  │ FPS: 60 ████████████  フレーム: 12ms         │    │
│  │                                               │    │
│  │ 理論 vs 実測                                   │    │
│  │ ┌─────────┬─────┬─────┬───────────┐         │    │
│  │ │         │ 理論 │ 実測 │ 時間     │         │    │
│  │ ├─────────┼─────┼─────┼───────────┤         │    │
│  │ │ Layout  │  ×  │  ×  │  0ms     │         │    │
│  │ │ Paint   │  ×  │  -  │  -       │         │    │
│  │ │Composite│  ○  │  ○  │  8ms     │         │    │
│  │ └─────────┴─────┴─────┴───────────┘         │    │
│  │                                               │    │
│  │ [DevToolsで詳細を見る]                        │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

### 4.2 Phase Indicator コンポーネント

理論と実測を並べて表示。

```typescript
// features/lab-render/components/TheoryVsActual.tsx
type Props = {
  theoretical: PhaseImpact
  actual: {
    styleLayoutDuration: number
    renderingDuration: number
  }
}

export function TheoryVsActual({ theoretical, actual }: Props) {
  // 実測値から走ったフェーズを逆算
  const actualLayout = actual.styleLayoutDuration > 1
  const actualRendering = actual.renderingDuration > 1

  return (
    <table>
      <thead>
        <tr>
          <th></th>
          <th>理論</th>
          <th>実測</th>
          <th>時間</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Layout</td>
          <td>{theoretical.layout ? '○' : '×'}</td>
          <td>{actualLayout ? '○' : '×'}</td>
          <td>{actual.styleLayoutDuration.toFixed(1)}ms</td>
        </tr>
        <tr>
          <td>Paint/Composite</td>
          <td>{theoretical.composite ? '○' : '×'}</td>
          <td>{actualRendering ? '○' : '×'}</td>
          <td>{actual.renderingDuration.toFixed(1)}ms</td>
        </tr>
      </tbody>
    </table>
  )
}
```

注: PaintとCompositeは観測では区別できないので、合算した「Rendering」として表示。教育的には「Layout走るか / Renderingが軽いか重いか」で区別できる。

---

## 5. チュートリアルステップ設計

8ステップ構成の草案。

1. **導入**: 「ブラウザの1フレーム」の概念図を見る
2. **Layoutが走る例**: `width` 変更、Style+Layout時間が出る様子を観察
3. **Layoutが走らない例**: `background-color` 変更、Style+Layout時間が0に近い様子
4. **最軽量の例**: `transform` 変更、Rendering時間も軽い様子
5. **理論と実測の一致**: CSS Triggers表と実測が一致する確認
6. **プロパティ組み合わせ**: 重いプロパティと軽いプロパティを組み合わせ
7. **低スペック端末シミュレーション**: 要素数を増やしてFPS低下を観察
8. **DevToolsへ**: Performance panel で同じ現象を見る手順

---

## 6. 主要な判断ポイント

### 6.1 要素の描画スタイル

各DOM要素をどう見せるか。

**案A**: 単色の正方形（ミニマル）
**案B**: 数字入り、プロパティ変更時に色が変わる（教育的）
**案C**: グリッド表示、変更中の要素がハイライトされる（差分視覚化）

**推奨**: 案B + 案C の組み合わせ。変更中は色が変わり、全体はグリッドで並ぶ。

### 6.2 変更の適用パターン

プロパティ有効化時の実際の変更。

**案A**: 毎フレーム値を更新（連続アニメーション）
- transform なら translateX を sin波で動かす
- width なら 50% ↔ 100% をサイン波で

**案B**: 1秒おきにトグル
- ON/OFF で切り替える

**推奨**: 案A。教育的に「継続的にブラウザが処理している」状態を見せる方が、フレーム時間の差が分かりやすい。

### 6.3 実行/停止の初期状態

ページを開いた時点で実行中か停止中か。

**推奨**: **停止状態**で開始、ユーザーが「▶実行」を押したら動く。自動実行だと低スペック端末で重くなる。

### 6.4 DevTools誘導の深さ

Phase 1 MVPでどこまで詳しく誘導するか。

**案A**: 「Performance panelで見てみよう」のリンクとスクショ1枚
**案B**: 手順を3〜5ステップで詳しく説明、スクショ複数枚
**案C**: 動画で手順を見せる

**推奨**: **案B**。Lab 1ならではの見どころセクションとして、チュートリアル完了画面に配置。

---

## 7. 受け入れ条件

- [ ] 実DOM要素を100〜2000個生成・管理できる
- [ ] LoAF APIでフレーム時間を取得できる（Chromium）
- [ ] フォールバック: LoAF非対応ブラウザでは longtask で代替
- [ ] CSSプロパティ変更時に要素に実際に変更が適用される
- [ ] FPS / フレーム時間 / Style+Layout時間 / Rendering時間が表示される
- [ ] 理論（CSS Triggersデータ）と実測が並置される
- [ ] 停止・再開ができる
- [ ] 要素数スライダーでリアルタイムに増減できる
- [ ] DevTools誘導セクションがある
- [ ] 1000要素で Chromium 60fps 維持、低スペック端末で30fps以上

---

## 8. R調整要望欄

- 
- 
- 
