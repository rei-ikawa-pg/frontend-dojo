# フロントエンド道場 状態管理方針ドラフト

最終更新: 2026-04-17 / ステータス: ドラフト

## 0. 設計原則

- **小さく始める**: MVP段階では最小ライブラリで済ませる、必要になったら追加
- **適材適所**: 状態のスコープ（グローバル / ページ / コンポーネント / サーバ）ごとに最適なツールを選ぶ
- **URL with state**: ブックマーク可能な状態は URL に載せる
- **ローカル優先**: 状態は可能な限り近いコンポーネントで管理
- **型安全**: すべての状態は TypeScript の型を持つ

---

## 1. 状態のスコープ分類

フロントエンド道場で扱う状態を4つに分類します。

### 1.1 サーバ状態（Server State）
サーバから取得するデータ。

- 管理ダッシュボードの RUM データ（`/admin/rum`）
- RUM 送信の成否
- フィードバック送信の成否

### 1.2 URL状態（URL State）
URLに載せることでブックマーク/シェア可能な状態。

- 現在のルート（/lab/render/tutorial 等）
- チュートリアルの現在ステップ（`?step=3`）
- 自由操作モードのプリセット（`?preset=heavy-paint`）

### 1.3 ページ/機能状態（Feature State）
単一のページや機能内で共有される状態。

- チュートリアルの進捗
- 自由操作モードのパラメータ（要素数、CSSプロパティ選択）
- 可視化エンジンの実行状態（running / paused）
- FPSメーターの現在値

### 1.4 ローカル状態（Local State）
単一コンポーネントに閉じる状態。

- ボタンのホバー状態
- モーダルの開閉
- 入力フィールドの値

---

## 2. スコープごとのツール選定

各スコープで使うツールを決めます。

### 2.1 サーバ状態: `fetch` + React Suspense / Server Components

**採用ツール**: Next.js の Server Components と標準 `fetch`

理由:
- Next.js App Router の Server Components でサーバ側でデータ取得してレンダリングできる
- MVPでは外部APIを叩く機会が少ない（管理ダッシュボードのみ）
- 複雑なキャッシュ制御が不要なので TanStack Query は過剰

**TanStack Query の採用時期**: 管理ダッシュボードで複雑な絞り込み・ページング・リアルタイム更新が必要になったら導入。MVPでは不要。

### 2.2 URL状態: `useSearchParams` / `usePathname`

**採用ツール**: Next.js 標準フック + `URLSearchParams`

理由:
- Next.js 14+ で `useSearchParams` が安定して使える
- サードパーティライブラリ（nuqs等）もあるが、MVPでは標準で十分

**使用例**:
```typescript
// /lab/render/tutorial?step=3
const searchParams = useSearchParams()
const step = Number(searchParams.get('step') ?? '1')
```

### 2.3 ページ/機能状態: Zustand

**採用ツール**: Zustand

理由:
- Context API では再レンダリング最適化が難しい（特に可視化エンジンのように高頻度更新するケース）
- Redux は過剰（個人開発にはボイラープレートが多い）
- Jotai も良いが、Zustand の方が学習コストが低く日本語情報も多い
- Lab ごとに store を分離すれば、Feature-based 構造と整合する

**使用例**:
```typescript
// features/lab-render/stores/playgroundStore.ts
import { create } from 'zustand'

type PlaygroundState = {
  elementCount: number
  enabledProps: Set<string>
  isRunning: boolean
  setElementCount: (n: number) => void
  toggleProp: (prop: string) => void
  start: () => void
  stop: () => void
}

export const usePlaygroundStore = create<PlaygroundState>((set) => ({
  elementCount: 1000,
  enabledProps: new Set(['transform']),
  isRunning: false,
  setElementCount: (n) => set({ elementCount: n }),
  toggleProp: (prop) => set((state) => {
    const next = new Set(state.enabledProps)
    next.has(prop) ? next.delete(prop) : next.add(prop)
    return { enabledProps: next }
  }),
  start: () => set({ isRunning: true }),
  stop: () => set({ isRunning: false }),
}))
```

**store の置き場所**: 各 feature 内の `stores/` ディレクトリ。

```
features/lab-render/
├── stores/
│   ├── tutorialStore.ts
│   └── playgroundStore.ts
```

### 2.4 ローカル状態: `useState` / `useReducer`

**採用ツール**: React 標準フック

理由: 他のコンポーネントと共有しない状態はすべてここに収める。

**使用例**:
```typescript
const [isMenuOpen, setIsMenuOpen] = useState(false)
```

---

## 3. 可視化エンジンの状態管理

Lab 1 の可視化エンジンは**毎フレーム更新**が走るので、通常のReact状態管理では適さない部分があります。

### 方針

- **React state**: パラメータ（要素数、有効プロパティ）の管理に使用（Zustand）
- **Ref**: エンジンインスタンス、requestAnimationFrame の ID など
- **DOM/Canvas 直接操作**: 描画自体はReactの外で行う（再レンダリング回避）

```typescript
// features/lab-render/hooks/useRenderEngine.ts
export function useRenderEngine() {
  const engineRef = useRef<RenderEngine | null>(null)
  const { elementCount, enabledProps, isRunning } = usePlaygroundStore()

  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new RenderEngine()
    }
    engineRef.current.update({ elementCount, enabledProps })
  }, [elementCount, enabledProps])

  useEffect(() => {
    if (isRunning) engineRef.current?.start()
    else engineRef.current?.stop()
  }, [isRunning])
}
```

**原則**: Reactの state は「操作の意図」を持つ、実行と描画は Ref と DOM/Canvas で完結する。

---

## 4. チュートリアル進捗の管理

チュートリアルの現在ステップは **URL** と **Zustand** の両方で管理します。

### 同期戦略

- **正** = URL（`?step=3`）
- **副** = Zustand store（UI 応答性のため）
- URL 変更を監視して store を同期
- store 変更時は `router.push` で URL を更新

### URL に載せるメリット

- ブックマーク可能
- Zenn記事から「ステップ3から始める」リンクが貼れる
- リロードしても状態が保たれる
- ブラウザバックで前のステップに戻れる

### 実装イメージ

```typescript
// features/lab-render/hooks/useTutorialProgress.ts
export function useTutorialProgress() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const step = Number(searchParams.get('step') ?? '1')

  const goToStep = useCallback((next: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('step', String(next))
    router.push(`${pathname}?${params}`)
  }, [searchParams, router, pathname])

  return { step, goToStep }
}
```

---

## 5. RUM 状態管理

自前 RUM のクライアント側は**Provider パターン**で提供します。

### 構造

```typescript
// features/rum/client/provider.tsx
'use client'
export function RumProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const collector = new RumCollector()
    collector.start()
    return () => collector.stop()
  }, [])
  return <>{children}</>
}
```

ルートレイアウトで1回だけラップ:
```tsx
// app/layout.tsx
<RumProvider>
  {children}
</RumProvider>
```

**原則**: RUM の内部状態は React 外で管理（PerformanceObserver が直接イベントを掴む）、React からは「開始/停止」だけ制御できる API を公開。

---

## 6. データフロー全体図

```
[URL]           ← ブックマーク/シェア可能な状態
  ↕ (sync)
[Zustand store] ← UI応答性、複雑な状態
  ↓ (subscribe)
[React コンポーネント]
  ↓ (ref)
[Ref / DOM / Canvas] ← 高頻度更新、描画

[Server Components] ← サーバ側データ取得
  ↓
[クライアント]

[RUM Collector] ← React外で独立動作
  ↓ (sendBeacon)
[Cloudflare Workers]
  ↓
[D1 database]
```

---

## 7. 使わないもの（明示的なNo）

- **Redux / Redux Toolkit**: 個人開発には過剰、ボイラープレート多い
- **Jotai / Recoil**: Zustand で代替可能、学習コストを増やさない
- **MobX**: Reactのイミュータブルな考え方と相性悪い
- **TanStack Query**: MVPでは不要（管理ダッシュボードで必要になったら追加）
- **Context API をグローバル状態に使う**: 再レンダリング問題で Zustand の方が優れる（localProvider は使う）

---

## 8. 採用スタック要約

| スコープ | ツール | 置き場所 |
|---|---|---|
| サーバ状態 | Server Components + fetch | `app/` |
| URL状態 | useSearchParams | 使う箇所に直接 |
| ページ/機能状態 | Zustand | `features/*/stores/` |
| ローカル状態 | useState / useReducer | コンポーネント内 |
| 高頻度更新/描画 | useRef + DOM/Canvas | `features/*/engine/` |
| RUM収集 | 独自Provider + React外クラス | `features/rum/client/` |

---

## 9. 主要な判断ポイント（R調整要望）

### 9.1 Zustand vs Jotai

どちらも優れたライブラリ。Rさんの好みで決めてください。

- **Zustand**: 単一 store ベース、Redux的な発想
- **Jotai**: atom ベース、Recoil 的な発想、React 18 と相性良い

**推奨**: Zustand（日本語情報が豊富、学習コスト低い、個人開発で使いやすい）

### 9.2 TanStack Query を最初から入れるか

MVP 段階では管理ダッシュボードくらいしかデータフェッチがない。

**推奨**: 最初は入れない。必要になったら追加（数時間で導入できる）。

### 9.3 URL 同期を nuqs で楽にするか

`nuqs` は URLSearchParams を React state のように扱えるライブラリ。手動同期が不要になる。

**推奨**: **nuqs を使う**方が楽。書き味がuseState とほぼ同じになる。

```typescript
// nuqs 使用例
import { useQueryState } from 'nuqs'
const [step, setStep] = useQueryState('step', { defaultValue: '1' })
```

手書きの useSearchParams より明らかに楽。Rさんの書いた useTutorialProgress が10行→1行になる。

---

## 10. R調整要望欄

- 
- 
- 
