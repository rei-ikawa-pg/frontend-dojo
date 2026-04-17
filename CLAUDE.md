# CLAUDE.md - フロントエンド道場 プロジェクトガイド

このドキュメントは Claude Code がこのプロジェクトで作業する際の最重要リファレンスです。**作業開始前に必ず全体を読むこと**。

---

## プロジェクト概要

**サイト名**: フロントエンド道場 / Frontend Dojo
**URL (予定)**: https://frontend-dojo.pages.dev
**一文コンセプト**: 「フロントエンドの鬼門を、読むのではなく触って理解する。日本語のインタラクティブラボ」
**現在**: Phase 1 MVP（詳細は `docs/01-requirements.md` §0.1）

### ターゲット読者

- プライマリ: 中級フロントエンドエンジニア（英語記事を読むのはハードルがあり、日本語で触って学びたい層）
- セカンダリ: 採用担当者・技術リード

### 非ゴール（明示的にやらない）

- 多言語対応
- ログイン / アカウント機能
- コメント機能
- モバイルでのフル機能（MVPは簡易版）

---

## 技術スタック（確定）

### フロントエンド

- **Next.js 15+** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS**
- **shadcn/ui**
- **MDX** (`@next/mdx`) - 解説コンテンツ管理

### 状態管理

- **Zustand** - ページ/機能状態
- **nuqs** - URL同期状態（useSearchParams のラッパー）
- **TanStack Query** - サーバ状態・キャッシュ管理
- **React 標準** - ローカル状態（useState / useReducer）

### バリデーション・ユーティリティ

- **Zod** - スキーマバリデーション（クライアント・サーバ共有）
- **web-vitals** - Core Web Vitals 計測

### ツール

- **Biome** - Lint + Formatter（ESLint/Prettierの代替）
- **Vitest** - ユニットテスト
- **Playwright** - E2E / Visual Regression

### インフラ

- **Cloudflare Pages** - ホスティング
- **Cloudflare D1** - SQLite データベース（RUM データ保存）
- **Cloudflare Workers** (via Next.js API Routes, Edge Runtime) - BFF
- **Cloudflare Web Analytics** - ビジネス指標測定
- **GitHub Actions** - CI/CD

---

## 重要な設計判断（ADR サマリ）

### ADR-001: Next.js App Router を採用

- 理由: Rの7年の経験を活かす、SSG + Client Components + API Routes を単一FWでカバー
- 却下案: Astro（学習コストと成熟度でNext.js優位）、Remix（SSG弱い）

### ADR-002: モードのルーティングはサブルート方式

- `/lab/render/tutorial` と `/lab/render/playground`（クエリパラメータではない）
- 理由: SEO最強、Zenn記事から直接ディープリンク可能、OGPをモード別に設定可能
- モード間の状態維持は MVP では実装しない（切り替え時にリセット）

### ADR-003: Feature-based ディレクトリ構造

- Lab単位でコードを集約（`features/lab-render/` 以下に components/engine/stores/content/ 全部）
- 理由: Lab追加時のリファクタ最小化
- 解説MDXも feature 内の `content/` に配置（トップレベル `content/` は作らない）

### ADR-004: 状態管理は Zustand + nuqs + TanStack Query

- Zustand: ページ/機能状態、Context の再レンダリング問題を回避
- nuqs: URL状態、useSearchParams を useState ライクに扱える
- TanStack Query: 最初から導入（将来の管理ダッシュボードで必要になる）
- 却下案: Redux（過剰）、Jotai（学習コスト）、MobX（Reactの思想と合わない）

### ADR-005: Biome を採用

- 理由: 高速（Rust製）、ESLint + Prettier を1つで、個人開発で自由度高い
- 却下案: ESLint + Prettier（エコシステムは強いが速度で劣る）

### ADR-006: 可視化は「観測 + 判定のハイブリッド」

- 観測: LoAF API でフレーム時間、Style+Layout時間、Rendering時間を実測
- 判定: CSS Triggers データを内蔵、プロパティから理論上の影響を表示
- 理由: PerformanceObserverで Paint と Composite を個別に取るAPIは存在しないため

### ADR-007: API は Next.js API Routes（Edge Runtime）

- 理由: MVP向き、必要に応じて Cloudflare Workers に切り出し可能
- 将来 RUM の負荷が問題になったら Workers 分離を検討

---

## ディレクトリ構造

```
frontend-dojo/
├── app/                          # Next.js App Router（ルーティングのみ）
│   ├── layout.tsx                # ルートレイアウト（RumProvider 等）
│   ├── page.tsx                  # / (ランディング)
│   ├── labs/page.tsx             # /labs (Lab一覧)
│   ├── lab/
│   │   ├── layout.tsx            # Lab 共通レイアウト
│   │   └── render/
│   │       ├── page.tsx          # /lab/render (概要)
│   │       ├── tutorial/page.tsx # /lab/render/tutorial
│   │       └── playground/page.tsx
│   ├── about/page.tsx
│   ├── roadmap/page.tsx
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── contact/page.tsx
│   ├── admin/rum/page.tsx        # 管理者ダッシュボード（環境変数保護）
│   └── api/
│       ├── rum/collect/route.ts
│       └── feedback/route.ts
│
├── features/                     # 機能ごとの完結コード
│   ├── lab-render/               # Lab 1
│   │   ├── components/
│   │   ├── engine/               # 可視化エンジン
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── tutorial/
│   │   ├── content/              # MDX
│   │   ├── types.ts
│   │   └── index.ts              # 公開API
│   ├── rum/                      # 自前RUM
│   │   ├── client/
│   │   ├── shared/
│   │   └── index.ts
│   ├── feedback/
│   └── admin-dashboard/
│
├── components/                   # 横断で使う共通UIコンポーネント
│   ├── ui/                       # shadcn/ui
│   ├── layout/                   # Header, Footer, Nav
│   ├── lab/                      # パンくず、モードタブ
│   └── typography/
│
├── lib/                          # 横断ユーティリティ
│   ├── performance/
│   ├── browser/
│   └── utils/
│
├── workers/                      # 将来 Workers に切り出す時のプレースホルダ
├── public/
├── tests/                        # E2E / Visual Regression
├── docs/                         # 設計ドキュメント（このファイル群）
├── scripts/
├── migrations/                   # D1 マイグレーション
└── .github/workflows/
```

**ルール**:

- `app/` 配下のファイルは「ルーティングの glue」のみ、ロジックは `features/` から import
- `features/*/index.ts` が公開API（他の feature からはここ経由で import）
- feature 間の循環依存は禁止
- ユニットテストはコロケーション（`features/lab-render/engine/renderer.test.ts`）

---

## コーディング規約

### TypeScript

- `strict: true` を有効化
- `any` 禁止（どうしても必要な場合は `// eslint-disable-next-line` でコメント）
- Zodスキーマから型を導出: `z.infer<typeof schema>`
- Public API には JSDoc 付与

### React

- Server Components デフォルト、Client Components は明示（`'use client'`）
- `useCallback` / `useMemo` は必要な時だけ（過剰最適化は避ける）
- コンポーネントは Props interface を明示

### CSS / スタイリング

- Tailwind CSS でレイアウトを組む
- カスタム値が多い場合は `tailwind.config.ts` の theme を拡張
- `globals.css` はリセット + ダークモード設定のみ

### 命名

- ファイル: PascalCase（コンポーネント）、camelCase（フック・ユーティリティ）
- コンポーネント: PascalCase
- Zustand store: `useXxxStore`
- カスタムフック: `useXxx`
- 定数: SCREAMING_SNAKE_CASE

---

## 実装時のアンチパターン（避けるべきこと）

### 状態管理

- ❌ Context API をグローバル状態に使う（再レンダリング問題）
- ❌ Redux や Jotai を新規導入する（Zustand で統一）
- ❌ URL状態をZustand だけで管理する（nuqsでURL同期する）

### 可視化エンジン

- ❌ 毎フレーム React setState を呼ぶ（useRef + DOM直接操作）
- ❌ Paint と Composite を個別に計測しようとする（合算のみ取得可能）
- ❌ 可視化エンジンを過度に抽象化（Lab 1 専用から始める）

### RUM

- ❌ 個別イベントごとに即時送信（バッファリング必須）
- ❌ Cookie を使う（sessionStorage のみ、プライバシー保護）
- ❌ IP アドレスを保存する（Workerで受信時に即破棄）

### パフォーマンス

- ❌ `'use client'` をページ全体に付ける（必要なコンポーネントだけ）
- ❌ 大きなライブラリを初期ロードに含める（dynamic import）
- ❌ 画像を最適化せず `<img>` を使う（`next/image` を使う）

---

## テスト戦略

### ユニットテスト（Vitest）

- 計測ロジック、ユーティリティ、CSS Triggersデータ等、**純粋関数**を中心にテスト
- コロケーション: `features/lab-render/engine/renderer.test.ts`

### 統合テスト（Vitest + Testing Library）

- カスタムフック、Zustand store、コンポーネントの相互作用
- MVP では薄く

### E2Eテスト（Playwright）

- 主要ユーザーフロー（ランディング → Lab 1 → チュートリアル完走）
- Visual Regression（スナップショット比較）

### パフォーマンステスト

- Lighthouse CI を GitHub Actions に組み込み
- PR で Core Web Vitals 回帰をブロック
- バンドルサイズバジェット設定

---

## 受け入れ条件（Phase 1 リリース判定）

Phase 1 リリース判定のチェックリストは `docs/01-requirements.md` §6 に集約。更新時はそちらを編集する。

---

## 参考ドキュメント

この `docs/` 配下に以下の詳細設計書があります。作業時に該当するものを参照してください。

- `01-requirements.md`: Phase 1 MVP 要件定義
- `02-information-architecture.md`: 情報設計（URL構造、ページ役割）
- `03-architecture-directory.md`: ディレクトリ構造詳細
- `04-architecture-state-management.md`: 状態管理方針
- `05-architecture-rum.md`: RUM基盤アーキテクチャ
- `06-architecture-visualization-engine.md`: Lab 1 可視化エンジン設計

---

## 作業開始前のチェックリスト

Claude Code が作業を始める前に以下を確認すること。

- [ ] CLAUDE.md を全体読んだ
- [ ] 関連する docs/ のドキュメントを読んだ
- [ ] 現在のフェーズ（Phase 1）とやるべきことを把握した
- [ ] 非ゴールに含まれる機能を新規追加しないよう注意
- [ ] ADR に反する設計判断をしない
- [ ] アンチパターンを避ける

---

## コミュニケーション

### 報告

- 大きな設計判断を変更する場合は事前に確認
- ADRに反する判断が必要になったら、理由とトレードオフを提示
- 詰まった箇所は隠さず報告

### コミット規約

- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- 1コミット1論理変更
- メッセージは日本語 or 英語（統一）
