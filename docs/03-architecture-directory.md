# フロントエンド道場 ディレクトリ構造ドラフト

最終更新: 2026-04-17 / ステータス: ドラフト

## 0. 設計原則

- **Feature-based**: Lab単位でコードをまとめる（Lab追加時のリファクタ最小化）
- **App Router準拠**: Next.js 15+ の慣例に従う
- **責務分離**: UI / ロジック / データアクセス / 型定義 を明確に分ける
- **コンテンツとコードの分離**: 解説文は MDX で管理（技術者が読みやすく、PR しやすい）
- **テストコロケーション**: テストはテスト対象と近い場所に置く

---

## 1. トップレベル構造

```
frontend-dojo/
├── app/                          # Next.js App Router（ルーティングのみ）
├── features/                     # 機能ごとの完結コード（Feature-based、解説MDXも内包）
├── components/                   # 横断で使う共通UIコンポーネント
├── lib/                          # 横断ユーティリティ、ラッパー
├── workers/                      # Cloudflare Workers コード（BFF）
├── public/                       # 静的アセット
├── tests/                        # E2E / 統合テスト
├── docs/                         # プロジェクトドキュメント
├── scripts/                      # ビルド・デプロイ補助スクリプト
├── .github/workflows/            # CI/CD
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── biome.json or eslint.config.mjs
├── vitest.config.ts
├── playwright.config.ts
└── README.md
```

---

## 2. `app/` ディレクトリ（ルーティング専用）

App Router のルーティング責務のみ。実装は `features/` に置く。

```
app/
├── layout.tsx                    # ルートレイアウト
├── page.tsx                      # / (ランディング)
├── not-found.tsx
├── error.tsx
├── loading.tsx
├── sitemap.ts                    # /sitemap.xml
├── robots.ts                     # /robots.txt
│
├── labs/
│   └── page.tsx                  # /labs
│
├── lab/
│   ├── layout.tsx                # Lab 共通レイアウト（パンくず、モードタブ枠）
│   └── render/
│       ├── page.tsx              # /lab/render (概要、MDX解説含む)
│       ├── tutorial/
│       │   └── page.tsx          # /lab/render/tutorial
│       └── playground/
│           └── page.tsx          # /lab/render/playground
│
├── about/
│   └── page.tsx
├── roadmap/
│   └── page.tsx
├── privacy/
│   └── page.tsx
├── terms/
│   └── page.tsx
├── contact/
│   └── page.tsx
│
├── admin/
│   └── rum/
│       └── page.tsx              # /admin/rum (環境変数で保護)
│
└── api/                          # Next.js API Routes (Edge Runtime 優先)
    ├── rum/
    │   └── collect/
    │       └── route.ts
    └── feedback/
        └── route.ts
```

**ルール**: `app/` 配下のファイルは「ルーティングの glue」のみ。ロジックは `features/` から import するだけ。

---

## 3. `features/` ディレクトリ（Feature-based）

各機能を完結して管理。Labの追加・削除がここの1ディレクトリ増減で済む。

```
features/
├── lab-render/                   # Lab 1: レンダリングパイプライン可視化
│   ├── components/
│   │   ├── RenderOverview.tsx    # 概要ページ用
│   │   ├── TutorialMode.tsx      # チュートリアルモード
│   │   ├── PlaygroundMode.tsx    # 自由操作モード
│   │   ├── ControlPanel.tsx      # 操作パネル
│   │   ├── MetricsDisplay.tsx    # FPS等の表示
│   │   └── VisualizationView.tsx # 可視化ビュー（エンジン呼び出し）
│   ├── engine/                   # 可視化エンジン（技術選定は D で決定）
│   │   ├── renderer.ts
│   │   ├── paintDetector.ts
│   │   └── types.ts
│   ├── tutorial/                 # チュートリアルシナリオ
│   │   └── steps.ts              # ステップ定義（型付き）
│   ├── content/                  # 解説MDX（この feature 固有）
│   │   ├── overview.mdx
│   │   ├── tutorial/
│   │   │   ├── step-01.mdx
│   │   │   └── step-02.mdx
│   │   └── references.mdx
│   ├── hooks/
│   │   ├── useRenderEngine.ts
│   │   └── useFrameMetrics.ts
│   ├── types.ts
│   └── index.ts                  # 公開API
│
├── lab-memory/                   # Phase 2 で追加
├── lab-jank/                     # Phase 3 で追加
│
├── rum/                          # 自前RUM
│   ├── client/
│   │   ├── collector.ts          # PerformanceObserver ラッパー
│   │   ├── sender.ts             # sendBeacon + バッチング
│   │   ├── provider.tsx          # Reactプロバイダ
│   │   └── webVitals.ts          # web-vitals ライブラリ統合
│   ├── schema.ts                 # D1 テーブルスキーマ定義
│   ├── types.ts
│   └── index.ts
│
├── feedback/                     # フィードバック機能
│   ├── components/
│   │   └── FeedbackButton.tsx
│   ├── hooks/
│   │   └── useFeedback.ts
│   ├── schema.ts
│   └── types.ts
│
└── admin-dashboard/              # RUM 管理画面
    ├── components/
    └── queries/
```

**ルール**:
- `features/*/index.ts` が公開API（他のfeatureからはここ経由で import）
- feature 間の循環依存は禁止（lint で検出）
- 共通で使いたくなったら `lib/` に昇格

---

## 4. `components/` ディレクトリ（共通UI）

Feature をまたいで使う UI プリミティブ。

```
components/
├── ui/                           # shadcn/ui 系のプリミティブ
│   ├── button.tsx
│   ├── tabs.tsx
│   ├── slider.tsx
│   ├── card.tsx
│   └── ...
├── layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Nav.tsx
│   └── MobileMenu.tsx
├── lab/
│   ├── LabBreadcrumb.tsx
│   ├── LabModeTabs.tsx
│   ├── LabHero.tsx
│   └── BrowserCompatBanner.tsx   # ブラウザ非対応警告
├── typography/
│   ├── H1.tsx
│   ├── Prose.tsx                 # MDX用のラッパー
│   └── Code.tsx
└── feedback/                     # 注: components 配下にも置くか features に置くか要判断
```

---

## 5. `lib/` ディレクトリ（横断ユーティリティ）

特定の機能に属さないユーティリティ。

```
lib/
├── performance/
│   ├── fps.ts                    # FPS計測のプリミティブ
│   ├── observer.ts               # PerformanceObserver ラッパー
│   └── memory.ts                 # performance.memory ラッパー
├── browser/
│   ├── detect.ts                 # ブラウザ判定
│   ├── capabilities.ts           # 機能サポート判定（LoAF、WebGL 等）
│   └── chromium.ts
├── utils/
│   ├── cn.ts                     # clsx + tailwind-merge
│   ├── format.ts
│   └── uuid.ts
└── constants.ts
```

---

## 6. コンテンツの配置方針

解説 MDX は各 feature の `content/` 以下に配置する（トップレベルの `content/` は作らない）。

理由: Lab 追加時に1ディレクトリで完結する、feature の独立性が高まる、共通文章や多言語対応の要件が現時点で無い。

将来、以下のいずれかに該当したら再構成を検討:
- 英語版など多言語対応を始める
- 複数の執筆者が関わる
- Zennの下書きやブログ記事もサイト内に集約する

共通ページ（`/about`, `/privacy`, `/terms` 等）の MDX は暫定で `app/*/content.mdx` として各ルートに置くか、または `features/site-pages/content/` のような専用 feature を作る（Lab 2 を実装する頃に判断）。

---

## 7. `workers/` ディレクトリ（Cloudflare Workers）

Next.js の API Routes と分離するか統合するかは要判断（下記参照）。

```
workers/
├── rum-collector/
│   ├── src/
│   │   └── index.ts
│   └── wrangler.toml
├── feedback/
│   ├── src/
│   │   └── index.ts
│   └── wrangler.toml
└── shared/                       # Workers 間で共有するコード
    └── schemas.ts
```

---

## 8. `tests/` ディレクトリ

```
tests/
├── e2e/                          # Playwright
│   ├── landing.spec.ts
│   ├── lab-render.spec.ts
│   └── feedback.spec.ts
├── visual/                       # Visual Regression
│   └── ...
└── helpers/
```

ユニットテストは**コロケーション**で配置（`features/lab-render/engine/renderer.test.ts` のように隣接）。

---

## 9. `docs/` ディレクトリ

プロジェクトドキュメント。

```
docs/
├── 00-overview.md
├── 01-purpose-and-goals.md       # ステップ0の成果物
├── 02-concept-and-positioning.md # ステップ1
├── 03-scope-and-mvp.md           # ステップ2
├── 04-technical-decisions.md     # ステップ3
├── 05-requirements.md            # ステップ4
├── 06-information-architecture.md # ステップ5-1
├── 07-architecture.md            # ステップ5-3 (本ドキュメント)
├── 08-lab1-detail.md             # Lab 1 詳細設計
├── adr/                          # Architecture Decision Records
│   ├── 0001-use-nextjs-app-router.md
│   ├── 0002-routing-strategy.md
│   └── ...
└── CONTRIBUTING.md
```

**採用担当者が GitHub を見たときの印象**: `docs/` があるだけで「設計できるエンジニア」の評価が跳ね上がる。

---

## 10. 主要な判断ポイント（R調整要望）

### 10.1 API Routes vs Cloudflare Workers の配置

**案A**: Next.js API Routes を使う（`app/api/` 配下）
- メリット: 単一フレームワークで完結、デプロイが1つ、開発体験が良い
- デメリット: Next.js ランタイムの制約を受ける、Workers の生の機能が使いにくい

**案B**: Cloudflare Workers を別途立てる（`workers/` 配下）
- メリット: Workers の機能をフルに使える、スケール、cron、Durable Objects等
- デメリット: デプロイ単位が増える、開発が複雑化

**推奨**: **案A から始める、必要に応じて案Bに切り出す**。MVP では API Routes で十分、RUM のスケール問題が出てから Workers に分離。

### 10.2 MDX 採用の有無

**案A**: MDX を使う（現ドラフト）
- メリット: コードと解説の分離、Reactコンポーネント埋め込み可能、GitHub でレンダリングされる
- デメリット: MDX のセットアップと理解が必要、ビルド時間増加

**案B**: TSXベタ書き
- メリット: セットアップ不要、シンプル
- デメリット: 解説文が TSX に埋まる、翻訳や CMS 化がしにくい

**推奨**: **案A**。教育サイトの性質上、解説文の量が多くなる前提なので MDX 管理が有利。

### 10.3 shadcn/ui 採用の有無

**案A**: shadcn/ui を使う（現ドラフト）
- メリット: 質の高いコンポーネントが揃う、カスタマイズ自由、Tailwindと相性良い
- デメリット: コピペベースで管理するクセがある

**案B**: Radix UI + 自前スタイル
- メリット: より細かい制御
- デメリット: コンポーネントを一から作る工数

**案C**: 完全自前
- メリット: 完全カスタム
- デメリット: 工数大、MVP に向かない

**推奨**: **案A**。MVP の速度優先。

### 10.4 Feature-based の粒度

**案A**: Lab 単位で1 feature（現ドラフト）
- `features/lab-render/`, `features/lab-memory/` ...

**案B**: さらに細かく分割
- `features/lab-render/engine/`, `features/lab-render/tutorial/` を独立した feature 扱い

**推奨**: **案A**。現時点では Lab 単位で十分。肥大化したら B に分割。

### 10.5 Lint / Formatter

**案A**: Biome（最近の高速オルタナティブ）
- メリット: 爆速、Rust製、ESLint + Prettier を1つで
- デメリット: エコシステムがまだ若い、ESLint プラグインが使えない

**案B**: ESLint + Prettier（定番）
- メリット: 成熟、プラグイン豊富
- デメリット: 遅い、設定が複雑

**推奨**: **Biome**。個人開発で自由度が高く、エコシステムの制約より速度を優先できる。

---

## 11. R調整要望欄

- 
- 
- 
