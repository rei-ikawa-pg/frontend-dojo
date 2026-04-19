# フロントエンド道場 状態管理方針

最終更新: 2026-04-18

## 0. 設計原則

- **小さく始める**: MVP 段階では最小ライブラリ構成。必要になったら追加
- **適材適所**: 状態のスコープ（グローバル / ページ / コンポーネント / サーバ）ごとに最適なツールを選ぶ
- **URL with state**: ブックマーク可能な状態は URL に載せる
- **ローカル優先**: 状態はできるだけ近いコンポーネントで管理
- **型安全**: すべての状態に TypeScript の型を持たせる

---

## 1. 状態のスコープ分類

フロントエンド道場で扱う状態を 4 つに分類する。

### 1.1 サーバ状態（Server State）

サーバから取得するデータ。

- `/admin/rum` で集計される RUM データ
- 自前 RUM の送信結果
- フィードバック送信結果

### 1.2 URL 状態（URL State）

URL に載せることでブックマーク / シェア可能な状態。

- 現在のルート（`/lab/render/tutorial` 等）
- チュートリアルの現在ステップ（`?step=3`）
- 自由操作モードのプリセット（将来、`?preset=heavy-paint` 等を想定）

### 1.3 ページ / 機能状態（Feature State）

単一のページや機能内で共有される状態。

- 自由操作モードのパラメータ（要素数 / 有効プロパティ）
- 可視化エンジンの実行状態（running / paused）
- RUM Collector のランタイム状態（React 外で保持）

### 1.4 ローカル状態（Local State）

単一コンポーネントに閉じる状態。

- モーダル / ドロワー / メニューの開閉
- 入力フィールドの値（送信前）
- フィードバックボタンの表示ステート

---

## 2. スコープごとのツール選定

### 2.1 サーバ状態 — Server Components + 直接クエリ

**採用ツール**: Next.js Server Components + Cloudflare D1 バインディングを直接呼ぶ

- `/admin/rum` は `export const runtime = 'edge'` の Server Component 内で `getCloudflareContext()` 経由で `env.DB` を触る
- `Promise.all` で並列集計し、Recharts に渡す（`features/admin-dashboard/queries/rumQueries.ts`）
- ページ単位のリフレッシュ（リロード）で十分、インタラクティブな再取得は現時点で無し

TanStack Query は依存には含めているが、**Phase 1 では未使用**。リアルタイム更新・絞り込み・ページングが必要になった時点で Server Component 側で生成した初期データを Hydrate する形で導入する。

### 2.2 URL 状態 — nuqs

**採用ツール**: [nuqs](https://nuqs.47ng.com/)（`useQueryState`）

- `app/layout.tsx` の `<NuqsAdapter>` で有効化済み
- `useSearchParams` 手書き同期は書かない
- 型付きパーサ（`parseAsInteger`、`parseAsString` 等）を使って URL から直接 state として扱う

**使用例**（実装済み / `features/lab-render/components/TutorialMode.tsx`）:

```tsx
import { parseAsInteger, useQueryState } from 'nuqs'

const [stepIdRaw, setStepIdRaw] = useQueryState(
  'step',
  parseAsInteger.withDefault(1).withOptions({ history: 'push' }),
)
```

- `history: 'push'` でブラウザの Back / Forward に履歴を残す
- 範囲外値は呼び出し側で clamp して扱う（安全側）

### 2.3 ページ / 機能状態 — Zustand

**採用ツール**: Zustand

- Lab ごとに store を分け、`features/*/stores/*.ts` に配置
- 可視化エンジンのように高頻度更新が発生するケースでも、React state では扱わず **RenderEngine 側で useRef + DOM 直接操作** に閉じる。Zustand には「ユーザーの操作意図」のみ載せる
- Context API は再レンダリング最適化が効きにくいので原則使わない（ローカル Provider 除く）

**使用例**（実装済み / `features/lab-render/stores/playgroundStore.ts`）:

```ts
import { create } from 'zustand'

export const PLAYGROUND_PROPS = [
  'transform', 'opacity', 'filter',
  'background-color', 'color', 'box-shadow',
  'width', 'height', 'top', 'font-size',
] as const

type PlaygroundState = {
  elementCount: number
  enabledProps: ReadonlySet<PlaygroundProp>
  isRunning: boolean
  setElementCount: (n: number) => void
  toggleProp: (prop: PlaygroundProp) => void
  setEnabledProps: (props: Iterable<PlaygroundProp>) => void
  start: () => void
  stop: () => void
  reset: () => void
}

export const usePlaygroundStore = create<PlaygroundState>((set) => ({ /* ... */ }))
```

### 2.4 ローカル状態 — `useState` / `useReducer`

**採用ツール**: React 標準フック

他のコンポーネントと共有しない状態はすべてここに収める。

```ts
const [rating, setRating] = useState<'good' | 'bad' | null>(null)
```

---

## 3. 可視化エンジンの状態管理

Lab 1 の可視化エンジンは **毎フレーム更新** が走る。React state を毎フレーム更新すると 60fps を維持できないため、以下の分離で扱う。

- **Zustand**: ユーザーの操作意図（要素数 / 有効プロパティ / 実行フラグ）のみ
- **useRef**: `RenderEngine` のインスタンス、`requestAnimationFrame` の ID
- **DOM 直接操作**: 毎フレームのスタイル適用は `element.style.*` で直接書く（React を経由しない）

```ts
// features/lab-render/hooks/useRenderEngine.ts
export function useRenderEngine(ref: RefObject<HTMLElement | null>) {
  const engineRef = useRef<RenderEngine | null>(null)
  const elementCount = usePlaygroundStore((s) => s.elementCount)
  const enabledProps = usePlaygroundStore((s) => s.enabledProps)
  const isRunning = usePlaygroundStore((s) => s.isRunning)

  useEffect(() => {
    if (!ref.current) return
    engineRef.current = new RenderEngine({ container: ref.current })
    return () => engineRef.current?.destroy()
  }, [ref])

  useEffect(() => {
    engineRef.current?.setElementCount(elementCount)
    engineRef.current?.setEnabledProperties(enabledProps)
  }, [elementCount, enabledProps])

  useEffect(() => {
    if (isRunning) engineRef.current?.start()
    else engineRef.current?.stop()
  }, [isRunning])
}
```

原則: Zustand の state は「何をしたいか」、実行と描画は `Ref + DOM` で完結させる。

---

## 4. チュートリアル進捗の管理

チュートリアルの現在ステップは **URL のみ** を正とする。Zustand には複製しない。

### 同期戦略

- 正 = URL（`?step=3`）
- `nuqs` の `useQueryState` で読み書き
- ステップ切り替わりで Zustand の `playgroundStore` に **プリセット適用**（`setElementCount` / `setEnabledProps` / `start|stop`）を副作用として走らせる

### URL に載せるメリット

- ブックマーク可能
- Zenn 記事から「ステップ 3 から始める」リンクが貼れる
- リロードしても状態が保たれる
- ブラウザ Back で前のステップに戻れる

### 実装（抜粋）

```tsx
// features/lab-render/components/TutorialMode.tsx
const [stepIdRaw, setStepIdRaw] = useQueryState(
  'step',
  parseAsInteger.withDefault(1).withOptions({ history: 'push' }),
)
const stepId = stepIdRaw >= 1 && stepIdRaw <= TUTORIAL_STEP_COUNT ? stepIdRaw : 1
const step = getStep(stepId)

useEffect(() => {
  if (!step) return
  setElementCount(step.preset.elementCount)
  setEnabledProps(step.preset.enabledProps)
  if (step.preset.autoStart) start()
  else stop()
}, [step, setElementCount, setEnabledProps, start, stop])
```

---

## 5. RUM 状態管理

自前 RUM のクライアント側は **Provider + React 外クラス** の組み合わせで動かす。

```tsx
// app/layout.tsx（抜粋）
<NuqsAdapter>
  <RumProvider endpoint="/api/rum/collect" enabled={RUM_ENABLED}>
    <Header />
    <main>{children}</main>
    <Footer />
  </RumProvider>
</NuqsAdapter>
```

- `RumProvider` は `enabled` が `true` の時だけ `RumCollector` を生成して `start` / `stop` を React ライフサイクルに結ぶ
- `RumCollector` は PerformanceObserver / web-vitals / LoAF / sendBeacon を統括する React 外のクラス（`features/rum/client/collector.ts`）
- Lab 側からは `useRumCustomMetric()` フックまたは `window.__RUM__.emit` で計測値を投げる

原則: RUM の内部状態は React 外で管理。React からは「開始 / 停止」「context 切替」だけ公開 API として見せる。

---

## 6. データフロー全体図

```
[URL]                 ← ブックマーク / シェア可能な状態（nuqs）
  ↕ (sync)
[Zustand store]       ← UI 応答性、複雑な状態（playgroundStore 等）
  ↓ (subscribe)
[React コンポーネント]
  ↓ (ref)
[RenderEngine / DOM]  ← 高頻度更新、描画（React 外）

[Server Component]
  ↓ Cloudflare D1 直叩き
[/admin/rum]          ← 集計表示（Server Components で完結）

[RumCollector]        ← React 外で独立動作
  ↓ (sendBeacon)
[/api/rum/collect]    ← Edge Runtime
  ↓
[Cloudflare D1]
```

---

## 7. 使わないもの（明示的な No）

- **Redux / Redux Toolkit**: 個人開発には過剰
- **Jotai / Recoil**: Zustand で代替可能、学習コストを増やさない
- **MobX**: React のイミュータブルな発想と合わない
- **Context API をグローバル状態に使う**: 再レンダリング最適化が難しいので避ける（Provider で「React 外のオブジェクトを配る」用途には使う）
- **手書きの useSearchParams 同期**: nuqs に統一

TanStack Query は依存には含めているが、Phase 1 では未使用。管理ダッシュボードで必要になったら導入する。

---

## 8. 採用スタック要約

| スコープ | ツール | 置き場所 |
|---|---|---|
| サーバ状態 | Server Components + Cloudflare D1 直接 | `app/admin/rum/page.tsx`, `features/admin-dashboard/queries/` |
| URL 状態 | nuqs (`useQueryState`) | 使う箇所に直接 |
| ページ / 機能状態 | Zustand | `features/*/stores/*.ts` |
| ローカル状態 | `useState` / `useReducer` | コンポーネント内 |
| 高頻度更新 / 描画 | `useRef` + DOM 直接操作 | `features/lab-render/engine/` |
| RUM 収集 | `RumProvider` + React 外クラス | `features/rum/client/` |

---

## 9. 採用済みの技術判断

当初「判断ポイント」に並べていた項目は、MVP 実装時に以下で確定した。

- **Zustand vs Jotai**: Zustand 採用（日本語情報が豊富、学習コスト低、個人開発で使いやすい）
- **TanStack Query**: 依存には含めたが Phase 1 では未使用。将来 `/admin/rum` で絞り込み / ページング / リアルタイム更新が必要になった時点で導入
- **nuqs**: 採用（`useSearchParams` 手書き同期より明らかに楽、型付きパーサが使える）

---

## 10. 変更履歴

- 2026-04-17 初稿（ドラフト）
- 2026-04-18 Phase 1 MVP 実装に合わせて全面改訂。URL 状態を nuqs 採用前提に書き換え、`/admin/rum` を Server Component 直叩きに訂正、§9 を採用済みに畳み込み
