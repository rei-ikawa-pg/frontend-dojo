# フロントエンド道場 ディレクトリ構造

最終更新: 2026-04-18 / ステータス: 確定（Phase 1 MVP 実装反映）

## 0. 設計原則

- **Feature-based**: Lab 単位でコードをまとめる（Lab 追加時のリファクタ最小化）
- **App Router 準拠**: Next.js 16 App Router の慣例に従う
- **責務分離**: UI / ロジック / データアクセス / 型定義を明確に分ける
- **コンテンツとコードの分離**: 解説文は MDX で管理（PR レビューしやすく、技術者が読みやすい）
- **テストコロケーション**: ユニットテストはテスト対象と同じディレクトリに置く

---

## 1. トップレベル構造

```
frontend-dojo/
├── app/                          # Next.js App Router（ルーティングのみ）
├── features/                     # 機能ごとの完結コード（Feature-based、解説 MDX も内包）
├── components/                   # 横断で使う共通 UI コンポーネント
├── lib/                          # 横断ユーティリティ・ラッパー
├── workers/                      # Cloudflare Workers（メイン Worker とは別口の Cron 等）
├── public/                       # 静的アセット
├── tests/                        # E2E / Visual Regression
├── docs/                         # プロジェクトドキュメント
│   └── screenshots/              # 作業用スクショ置き場（.gitignore 済み、.gitkeep のみ追跡）
├── scripts/                      # ビルド・デプロイ補助スクリプト
├── migrations/                   # D1 SQL マイグレーション
├── .github/workflows/            # CI/CD
├── package.json
├── tsconfig.json
├── next.config.ts                # MDX 設定等
├── biome.json                    # Lint + Formatter
├── vitest.config.ts
├── playwright.config.ts
├── wrangler.jsonc                # メイン Worker（D1 バインディング）
├── open-next.config.ts           # OpenNext 設定
├── cloudflare-env.d.ts           # `pnpm cf-typegen` で生成（gitignore）
├── lighthouserc.json             # Lighthouse CI しきい値
└── README.md
```

---

## 2. `app/` ディレクトリ（ルーティング専用）

App Router のルーティング責務のみを置く。実装は `features/` 側に集約する。

```
app/
├── layout.tsx                    # ルートレイアウト（RumProvider / NuqsAdapter / Toaster / JsonLd 埋め込み）
├── page.tsx                      # / (ランディング、セクションは components/landing/*)
├── not-found.tsx
├── error.tsx
├── loading.tsx
├── globals.css                   # デザイントークン（ink-* / rule-* / vermilion / sig-*）
├── sitemap.ts                    # /sitemap.xml
├── robots.ts                     # /robots.txt
├── icon.svg / apple-icon.png     # Favicon / Apple Touch Icon
│
├── labs/
│   └── page.tsx                  # /labs（稽古場一覧、フェーズ別に区切って表示）
│
├── lab/
│   ├── layout.tsx                # Lab 共通レイアウト（パンくず / モードタブ / 対応ブラウザ警告）
│   └── render/
│       ├── page.tsx              # /lab/render（概要 + MDX 解説）
│       ├── tutorial/page.tsx     # /lab/render/tutorial
│       └── playground/page.tsx   # /lab/render/playground
│
├── about/page.tsx
├── roadmap/page.tsx
├── privacy/page.tsx
├── terms/page.tsx
├── contact/page.tsx
├── glossary/page.tsx             # 用語集（Term コンポーネントと双方向リンク）
│
├── admin/
│   └── rum/page.tsx              # /admin/rum（?token=XXX で保護、Server Component で D1 集計）
│
└── api/                          # Next.js API Routes (Edge Runtime)
    ├── rum/collect/route.ts
    └── feedback/route.ts
```

**ルール**: `app/` 配下のファイルは「ルーティングの glue」のみ。ビジネスロジックは `features/` から import する。

---

## 3. `features/` ディレクトリ（Feature-based）

機能を完結して管理する。Lab の追加・削除はここの 1 ディレクトリ増減で済ませるのが目標。

```
features/
├── lab-render/                   # Lab 1: レンダリングパイプライン可視化
│   ├── index.ts                  # 公開 API（LAB_RENDER_META と engine / hooks / store の再 export）
│   ├── types.ts
│   ├── components/
│   │   ├── PlaygroundMode.tsx    # /lab/render/playground の本体
│   │   ├── TutorialMode.tsx      # /lab/render/tutorial の本体（nuqs で ?step=N 同期）
│   │   ├── VisualizationView.tsx # RenderEngine をホストする div コンテナ
│   │   ├── ControlPanel.tsx      # 要素数スライダー / プロパティトグル / 実行ボタン
│   │   ├── MetricsDisplay.tsx    # FPS / フレーム時間 / 理論 vs 実測テーブル
│   │   ├── ComparisonView.tsx    # チュートリアルで 2 種の挙動を並置するビュー
│   │   ├── TheoryVsActual.tsx    # 理論 (CSS Triggers) と実測 (LoAF) の並置テーブル
│   │   └── StepQuiz.tsx          # チュートリアル理解度クイズ
│   ├── engine/                   # 可視化エンジン（React 外で完結）
│   │   ├── index.ts
│   │   ├── renderer.ts           # DOM 操作のコア（RenderEngine クラス）
│   │   ├── observer.ts           # LoAF + PerformanceObserver ラッパー
│   │   ├── observerCalc.ts       # LoAF エントリからの時間計算（純粋関数、テスト対象）
│   │   ├── fpsMeter.ts           # rAF ベースの FPS 計測
│   │   ├── cssTriggersData.ts    # CSS プロパティ → 理論影響テーブル
│   │   ├── types.ts
│   │   └── *.test.ts             # コロケーションのユニットテスト
│   ├── hooks/
│   │   ├── index.ts
│   │   ├── useRenderEngine.ts    # React ライフサイクルに RenderEngine を接続
│   │   └── useFrameMetrics.ts    # FrameObserver 購読、FPS/直近フレーム情報を返す
│   ├── stores/
│   │   ├── playgroundStore.ts    # Zustand: elementCount / enabledProps / isRunning
│   │   └── playgroundStore.test.ts
│   ├── tutorial/
│   │   ├── steps.ts              # 8 ステップ定義（型付き）
│   │   ├── stepContents.ts       # MDX とステップのひも付け
│   │   ├── quizzes.ts            # 各ステップのクイズ定義
│   │   └── quizzes.test.ts
│   └── content/                  # 解説 MDX（この feature 固有）
│       ├── overview.mdx
│       └── tutorial/
│           ├── step-01.mdx
│           ├── step-02.mdx
│           └── ...step-08.mdx
│
├── lab-memory/                   # Phase 2 で追加予定（未作成）
├── lab-jank/                     # Phase 3 で追加予定（未作成）
│
├── rum/                          # 自前 RUM（詳細は docs/05）
│   ├── index.ts
│   ├── client/
│   │   ├── provider.tsx          # ルートレイアウトから 1 回だけ使う
│   │   ├── collector.ts          # PerformanceObserver + web-vitals 統合
│   │   ├── buffer.ts             # 20 件 / 5 秒 の flush
│   │   ├── sender.ts             # sendBeacon 優先、keepalive fallback
│   │   ├── webVitals.ts          # LCP / INP / CLS / FCP / TTFB
│   │   ├── loaf.ts               # Long Animation Frame API ラッパー
│   │   ├── session.ts            # sessionStorage ベースの匿名セッション ID
│   │   └── useRumCustomMetric.ts # Lab からカスタムメトリクスを送るフック
│   └── shared/
│       ├── schema.ts             # Zod スキーマ（クライアント / サーバ共有）
│       └── types.ts
│
├── feedback/                     # Good/Bad + 任意コメント
│   ├── index.ts
│   ├── schema.ts
│   └── components/
│       └── FeedbackButton.tsx
│
├── admin-dashboard/              # /admin/rum の集計と可視化
│   ├── index.ts
│   ├── queries/
│   │   └── rumQueries.ts         # D1 クエリ（Server Component から呼ぶ）
│   └── components/
│       ├── Charts.tsx            # Recharts ラッパー群
│       └── StatCard.tsx
│
├── labs.ts                       # 全 Lab のメタ情報配列（LAB_RENDER_META を参照）
└── labs-status-labels.ts         # ステータス文言マップ（公開中 / 近日公開）
```

**ルール**:

- `features/*/index.ts` が公開 API（他の feature からはここ経由で import）
- feature 間の循環依存は禁止（Biome の import 解析で検出）
- 共通化したくなったら `lib/` に昇格
- ユニットテストはコロケーション（`features/lab-render/engine/renderer.test.ts` のように隣接）

---

## 4. `components/` ディレクトリ（共通 UI）

feature をまたいで使う UI プリミティブ。

```
components/
├── ui/                           # shadcn/ui 生成物
│   ├── button.tsx
│   ├── tabs.tsx
│   ├── slider.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── toggle.tsx
│   ├── progress.tsx
│   └── sonner.tsx
├── layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Nav.tsx
│   └── MobileMenu.tsx
├── lab/
│   ├── LabBreadcrumb.tsx
│   ├── LabModeTabs.tsx
│   └── BrowserCompatBanner.tsx   # 非 Chromium 警告
├── landing/                      # / 専用のセクション群
│   ├── Hero.tsx
│   ├── HeroScope.tsx             # ヒーロー右側の計測器モチーフ
│   ├── IndexSection.tsx          # このサイトとは
│   ├── ValueSection.tsx          # 得られるもの
│   ├── CatalogSection.tsx        # Lab 一覧ハイライト
│   └── FlowSection.tsx           # 稽古の進め方
├── instrument/                   # 計測器デザインの共通プリミティブ
│   ├── InstrumentPanel.tsx
│   ├── MetricReadout.tsx
│   ├── RuleTicks.tsx
│   ├── SectionMarker.tsx         # § 01 — LABEL / 和文キャプション
│   └── Sparkline.tsx
├── glossary/
│   └── Term.tsx                  # 本文中に用語リンクを打てるインラインコンポーネント
├── typography/
│   └── Prose.tsx                 # MDX の装飾ラッパー
└── seo/
    └── JsonLd.tsx                # JSON-LD 埋め込み
```

---

## 5. `lib/` ディレクトリ（横断ユーティリティ）

特定の機能に属さないユーティリティ。

```
lib/
├── browser/
│   ├── detect.ts                 # ブラウザ / デバイス判定
│   ├── detect.test.ts
│   ├── capabilities.ts           # LoAF や WebGL などの機能判定
│   └── types.ts
├── glossary.ts                   # 用語集データ（components/glossary から参照）
├── seo.ts                        # JSON-LD ビルダー（WebSite / TechArticle）
├── site.ts                       # サイト全体の定数（SITE.name / description / url 等）
└── utils.ts                      # cn（clsx + tailwind-merge）
```

※ `performance/` と `utils/` のサブディレクトリ枠は残っているが、現状はトップに `*.ts` を置く運用で十分。必要になった時点でサブ化する。

---

## 6. コンテンツの配置方針

解説 MDX は各 feature の `content/` 以下に配置する（トップレベルの `content/` は作らない）。

理由: Lab 追加時に 1 ディレクトリで完結する、feature の独立性が高まる、共通文章や多言語対応の要件が現時点で無い。

将来、以下のいずれかに該当したら再構成を検討:

- 英語版など多言語対応を始める
- 複数の執筆者が関わる
- Zenn の下書きやブログ記事もサイト内に集約する

共通ページ（`/about`, `/privacy`, `/terms` 等）は現状 `app/*/page.tsx` に直書き（短いため）。肥大化したら `features/site-pages/content/` のような専用 feature に切り出す。

---

## 7. `workers/` ディレクトリ（メイン Worker 以外）

メイン Worker は OpenNext が生成する。`workers/` には **別スケジュールで動く追加 Worker** だけを置く。

```
workers/
└── rum-cleanup/                  # D1 の 90 日超データを削除する Cron Worker
    ├── src/index.ts              # scheduled handler
    ├── tsconfig.json
    └── wrangler.jsonc            # 独立したデプロイ単位
```

デプロイは `pnpm deploy:cron`、または `pnpm deploy:all`（メイン Worker + Cron 両方）。

---

## 8. `tests/` ディレクトリ

```
tests/
├── e2e/                          # Playwright
│   ├── landing.spec.ts
│   ├── labs.spec.ts
│   ├── lab-render.spec.ts
│   └── feedback.spec.ts
├── visual/                       # Visual Regression（baseline 運用、ローカル専用）
│   └── landing.spec.ts
├── helpers/
└── setup.ts                      # Vitest セットアップ（@testing-library/jest-dom 等）
```

ユニットテストは**コロケーション**（`features/lab-render/engine/renderer.test.ts`）。

CI では Chromium / mobile-chrome のみ実行する（`tests/e2e` のみ対象、Visual Regression はローカル）。

---

## 9. `docs/` ディレクトリ

プロジェクトドキュメント。

```
docs/
├── 01-requirements.md                     # Phase 1 MVP 要件定義
├── 02-information-architecture.md         # 情報設計（URL / ナビ / ページ役割）
├── 03-architecture-directory.md           # 本ドキュメント
├── 04-architecture-state-management.md    # 状態管理方針
├── 05-architecture-rum.md                 # 自前 RUM アーキテクチャ
├── 06-architecture-visualization-engine.md# Lab 1 可視化エンジン設計
├── 07-task-list.md                        # Phase 1 MVP 実装タスクリスト
└── screenshots/                           # 作業用スクショ置き場（.gitignore 済）
```

---

## 10. 採用済みの技術判断

当初「判断ポイント」として並べていた項目は、MVP 実装時に以下で確定した。

| 項目 | 採用 | 補足 |
|---|---|---|
| API 配置 | Next.js API Routes（Edge Runtime） | `app/api/*/route.ts`。Cron だけ `workers/rum-cleanup/` に切り出し |
| 解説コンテンツ | MDX (`@next/mdx`) | feature 配下の `content/` に配置 |
| UI ライブラリ | shadcn/ui + Tailwind CSS v4 | `components/ui/*`、カラートークンは `app/globals.css` |
| Feature 粒度 | Lab 単位で 1 feature | `features/lab-render/` 内に全部入り。肥大化すれば再分割 |
| Lint / Formatter | Biome | `biome.json` 単独。ESLint は未使用 |
| URL 状態 | nuqs | `useQueryState` を直接使う。手動 URL 同期はしない |
| ページ状態 | Zustand | `features/*/stores/*.ts` に store を置く |
| サーバ状態 | Server Components + fetch | TanStack Query は依存には入っているが現時点では未使用 |
| バリデーション | Zod | クライアント・サーバ共有（`features/*/shared/schema.ts`） |
| パッケージマネージャ | pnpm | workspaces は未使用（単一パッケージ） |

詳細な理由や検討経緯は、各 docs（04 は状態管理、05 は RUM、06 は可視化）に集約。

---

## 11. 変更履歴

- 2026-04-17 初稿（ドラフト）
- 2026-04-18 Phase 1 MVP 実装に合わせて全面改訂（§1-9 を実態反映、§10 を「判断ポイント」→「採用済み」に畳み込み）
