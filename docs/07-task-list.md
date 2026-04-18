# Phase 1 MVP タスクリスト

最終更新: 2026-04-18 / ステータス: 実装計画

`docs/01-requirements.md` の Phase 1 スコープを実装単位に分解したタスク一覧。番号順に進めると依存関係が自然に解決する構成。

---

## 使い方

- 番号順に着手するのを推奨（後続タスクの前提になるものから並べている）
- 1 タスク = 1 PR が理想（大きすぎる場合はサブタスクに分割）
- 完了条件は各タスクの「受け入れ条件」欄に記載

---

## フェーズ別サマリ

| # | フェーズ | タスク |
|---|---|---|
| 1-4 | 基盤整備 | 依存追加、features 骨組み、Next/MDX/CF 設定、D1 マイグレーション |
| 5-9 | 共通 UI / 静的ページ | Header/Footer、ランディング、Labs 一覧、about 等、sitemap |
| 10-14 | 自前 RUM | スキーマ、Collector/Buffer/Sender、Provider、API Route、カスタムメトリクス |
| 15-16 | Lab 共通 + Lab 1 概要 | Lab layout、/lab/render + MDX 解説 |
| 17-19 | Lab 1 エンジン | CSS Triggers、RenderEngine/Observer/Meter、Zustand store |
| 20 | Playground モード | /lab/render/playground UI |
| 21-22 | Tutorial モード | ステップ定義 + UI |
| 23-24 | 付帯機能 | フィードバック、管理ダッシュボード |
| 25-26 | アナリティクス / SEO | CF Web Analytics、OGP/JSON-LD |
| 27-28 | 品質保証 | Playwright E2E、GitHub Actions CI |
| 29-30 | デプロイ / リリース | Cloudflare Workers (OpenNext)、受け入れ条件チェック + Zenn 記事 |

---

## タスク詳細

### #1 依存追加とツール設定

zustand / nuqs / zod / web-vitals / @next/mdx / vitest / @vitest/ui / @testing-library/react / @playwright/test / recharts / wrangler を `pnpm add`。package.json の scripts に test / test:e2e / db:migrate / deploy を追加。Biome 設定に循環依存検出ルールを追加（features 間）。tsconfig の strict と path alias (`@/`) 確認。

- 参照: `CLAUDE.md` 技術スタック, `docs/03-architecture-directory.md` §10.1-10.5
- 完了条件: `pnpm test`, `pnpm lint`, `pnpm build` が通る

### #2 features/ スケルトン + 公開 API 骨組み作成

`features/{lab-render, rum, feedback, admin-dashboard}` の各ディレクトリと `index.ts`（re-export 用、空で可）を作成。サブディレクトリ: `lab-render/{components, engine, hooks, stores, tutorial, content}`、`rum/{client, shared}`、`feedback/{components, hooks}`。

- 参照: `docs/03-architecture-directory.md` §3
- 完了条件: 全ディレクトリ + index.ts が存在し、tsc が通る

### #3 Next.js + MDX + OpenNext (Cloudflare Workers) 設定

`next.config.ts` に @next/mdx を追加、MDX コンポーネントマッピング設定。`wrangler.jsonc`（D1 バインディング名 `DB`）と `open-next.config.ts` は SETUP.md §5/§10 で作成済み。`cloudflare-env.d.ts` を `pnpm cf-typegen` で生成して Cloudflare バインディングの型を取得。

- 参照: `docs/03-architecture-directory.md` §2, `docs/05-architecture-rum.md` §3-4
- 完了条件: .mdx ファイルが import でき、`pnpm preview` でローカル Worker が起動できる

### #4 Cloudflare D1 マイグレーション定義

`migrations/0001_rum_events.sql`、`migrations/0002_feedback.sql` を作成。rum_events テーブル（`docs/05-architecture-rum.md` §4.1 のスキーマ）、feedback テーブル（rating, comment, page_path, session_id, created_at）。インデックス設定も含む。`scripts/migrate.sh` で `wrangler d1 migrations apply` を実行できるように。

- 参照: `docs/05-architecture-rum.md` §4
- 完了条件: ローカル D1 に両テーブルが作成される

### #5 共通レイアウト（Header / Footer / Nav）作成

`components/layout/{Header, Footer, Nav, MobileMenu}.tsx` を実装。Header: ロゴ、稽古場、ロードマップ、道場について、GitHub、Zenn。Footer: 3 カラム（道場について / 規約 / 連絡 + フィードバックボタン + Google Forms）。モバイルはハンバーガー。

- 参照: `docs/02-information-architecture.md` §3
- 完了条件: 全ページでヘッダー/フッターが一貫表示、モバイルメニュー動作

### #6 ランディングページ (/) 実装

`app/page.tsx` を書き換え。セクション: ヒーロー（サイト名 + 一文コンセプト + Lab 1 大 CTA）、何を学べるか、今後の予定（/roadmap 誘導）、誰向けか、フッター。完全 SSG。メタタグ + OGP 設定。

- 参照: `docs/02-information-architecture.md` §4.1, `docs/01-requirements.md` §1.1
- 完了条件: Lighthouse で全 Core Web Vitals が Good

### #7 Labs 一覧ページ (/labs) 実装

`app/labs/page.tsx` を作成。Lab カード配列: Lab 1 [公開中]、Lab 2 [Phase 2]、Lab 3 [Phase 3]、Lab 4-6 [正式版]。公開中のみリンク有効、他は disabled 状態表示。Lab メタ情報は `features/*/index.ts` または配列定数から取得。

- 参照: `docs/02-information-architecture.md` §4.2
- 完了条件: Lab 1 カードから /lab/render に遷移できる

### #8 静的ページ群（about / roadmap / privacy / terms / contact / 404）実装

各ページを MDX またはサーバコンポーネントで作成。

- **privacy**: RUM 収集項目を明記（`docs/05-architecture-rum.md` §2.6）
- **terms**: 免責・学習目的・広告なし明記
- **contact**: Google Forms リンクへ誘導
- **about**: 道場の理念 + 作者 + 技術スタック
- **roadmap**: Phase 構成可視化
- `not-found.tsx` + `error.tsx` + `loading.tsx` も作成

- 参照: `docs/02-information-architecture.md` §4.6-4.7, `docs/01-requirements.md` §1.8
- 完了条件: 全ページがアクセス可能、メタタグ設定済み

### #9 sitemap.ts + robots.ts 作成

`app/sitemap.ts` で全公開 URL を列挙。`app/robots.ts` で /admin/* を disallow。Lab 一覧と Lab 1 系ページ全部を含める。

- 参照: `docs/02-information-architecture.md` §1, `docs/01-requirements.md` §2.3
- 完了条件: `/sitemap.xml` と `/robots.txt` が正しく応答する

### #10 RUM Zod スキーマ + 型定義（shared）

`features/rum/shared/schema.ts` に rumEventSchema / rumEventArraySchema を定義（`docs/05-architecture-rum.md` §3.2）。`features/rum/shared/types.ts` で `z.infer` で型導出。sdk_version 定数定義。session_id UUID 生成ユーティリティ（sessionStorage 永続化）を `features/rum/client/session.ts` に分離。

- 参照: `docs/05-architecture-rum.md` §2.2, §2.6, §3.2
- 完了条件: スキーマ単体テストが通る、クライアント・サーバで同じ型を共有

### #11 RumCollector / RumBuffer / RumSender 実装

`features/rum/client/` 配下:

- `collector.ts`: web-vitals + LoAF + カスタムメトリクス受付、`window.__RUM__` に公開
- `buffer.ts`: 20 件 or 5 秒 flush
- `sender.ts`: sendBeacon 優先、fetch keepalive フォールバック、visibilitychange/beforeunload で強制 flush、3 回リトライ
- `webVitals.ts`: onLCP/INP/CLS/FCP/TTFB 登録

- 参照: `docs/05-architecture-rum.md` §2.3-2.4, §7
- 完了条件: ブラウザ DevTools で送信イベントが確認できる

### #12 RumProvider + ルートレイアウト統合

`features/rum/client/provider.tsx`（'use client'、RumCollector インスタンス化 + start/stop）。`app/layout.tsx` に `<RumProvider>` 追加。`lib/browser/detect.ts` でブラウザ・デバイス判定してコンテキスト注入。開発環境では送信を無効化するフラグ。

- 参照: `docs/04-architecture-state-management.md` §5, `docs/05-architecture-rum.md` §2.2
- 完了条件: 本番ビルドでのみ送信される

### #13 /api/rum/collect Edge Route 実装

`app/api/rum/collect/route.ts`（`runtime = 'edge'`）。CORS チェック、Content-Type 検証、Zod バリデーション、D1 batch insert。IP アドレスを受信時に即破棄、ログにも残さない。`env.DB` バインディング利用。環境別 CORS（NEXT_PUBLIC_SITE_URL から導出）。

- 参照: `docs/05-architecture-rum.md` §3.1, §3.3-3.4
- 完了条件: curl で POST → 204、D1 に行が挿入される

### #14 useRumCustomMetric フック + Lab 統合準備

`features/rum/client/useRumCustomMetric.ts` を実装。`window.__RUM__.emit` 経由でカスタムメトリクス送信。Lab 側で `lab.render.fps` / `lab.render.frame_budget` / `lab.render.paint_phase` を送れるようにする。`features/rum/index.ts` で公開 API 整理。

- 参照: `docs/05-architecture-rum.md` §2.2, §6
- 完了条件: Lab から呼び出して D1 に届く

### #15 Lab 共通レイアウト（パンくず + モードタブ）

`app/lab/layout.tsx` + `components/lab/{LabBreadcrumb, LabModeTabs, LabHero, BrowserCompatBanner}.tsx` 作成。BrowserCompatBanner は `lib/browser/detect.ts` を使って非 Chromium で警告表示。モードタブは「概要 / 稽古 / 道場」の 3 つを切替。

- 参照: `docs/02-information-architecture.md` §3.2, `docs/01-requirements.md` §1.2 共通 UI
- 完了条件: モード間遷移がタブで可能、非 Chromium で警告が出る

### #16 Lab 1 概要ページ (/lab/render) + MDX 解説

`app/lab/render/page.tsx` を SSG で実装。`features/lab-render/content/overview.mdx` に解説（なぜ重要か、DevTools 対応、実務応用、参考文献）を執筆。モード選択は大 CTA ボタン 2 つ（チュートリアル / 自由操作）。SEO 強化のため 300 字以上のコンテキスト説明を先頭に配置。OGP 設定。

- 参照: `docs/02-information-architecture.md` §4.3, §2.1, `docs/01-requirements.md` §1.2 解説セクション
- 完了条件: MDX がレンダリングされ、両モードへ遷移できる

### #17 CSS Triggers データテーブル + ユニットテスト

`features/lab-render/engine/cssTriggersData.ts` に `docs/06-architecture-visualization-engine.md` §3 のテーブルを実装。`getPhaseImpact` / `aggregateImpact` 関数。`cssTriggersData.test.ts` で純粋関数をテスト（各プロパティの期待値、空 Set、未知プロパティのデフォルト挙動）。

- 参照: `docs/06-architecture-visualization-engine.md` §3
- 完了条件: ユニットテストカバレッジ 100%

### #18 RenderEngine / FrameObserver / FpsMeter 実装 + テスト

`features/lab-render/engine/{renderer, observer, fpsMeter, types}.ts` を `docs/06-architecture-visualization-engine.md` §2 に従って実装。RenderEngine は実 DOM 操作（100〜2000 要素生成・差分増減）、毎フレーム `applyChanges` で sin 波ベースの変更適用。FrameObserver は LoAF API（未対応時は longtask フォールバック）。FpsMeter は rAF ベース。計算ロジック（sumScripts, calcStyleLayout, calcRendering, FPS 計算）を純粋関数化してユニットテスト。

- 参照: `docs/06-architecture-visualization-engine.md` §2, `CLAUDE.md` アンチパターン「毎フレーム setState 禁止」
- 完了条件: 1000 要素で Chromium 60fps、純粋関数の単体テスト通過

### #19 playgroundStore (Zustand) + hooks 実装

`features/lab-render/stores/playgroundStore.ts`: elementCount, enabledProps (Set), isRunning + アクション。`features/lab-render/hooks/{useRenderEngine, useFrameMetrics, useCssTriggers}.ts`: Engine と store の橋渡し、ref 管理。再レンダー発生頻度をテスト確認。

- 参照: `docs/04-architecture-state-management.md` §2.3, §3, `docs/06-architecture-visualization-engine.md` §2
- 完了条件: store 変更で UI が更新されるが毎フレーム setState はしない

### #20 Playground モード UI (/lab/render/playground) 実装

`app/lab/render/playground/page.tsx` + `features/lab-render/components/{PlaygroundMode, VisualizationView, ElementGrid, ControlPanel, MetricsDisplay, PhaseIndicator, TheoryVsActual}.tsx`。`docs/06-architecture-visualization-engine.md` §4.1 のレイアウト。要素数スライダー、プロパティトグル、▶実行/■停止、FPS メーター、フレームバジェット、理論 vs 実測テーブル。初期状態は停止。nuqs でプリセットを URL に載せる（`?preset=heavy-paint` 等）。RUM に FPS を 1 秒おきに送信。

- 参照: `docs/06-architecture-visualization-engine.md` §4, §6
- 完了条件: 受け入れ条件（`docs/06-architecture-visualization-engine.md` §7）を全満たす

### #21 Tutorial ステップ定義 + MDX 執筆

`features/lab-render/tutorial/steps.ts` に型付きステップ配列（`docs/06-architecture-visualization-engine.md` §5 の 8 ステップ）。各ステップ: id, title, objective, instruction, observationPoints, presetConfig（要素数・有効プロパティ）、次ステップ活性条件。`features/lab-render/content/tutorial/step-{01..08}.mdx` に解説本文を執筆。

- 参照: `docs/06-architecture-visualization-engine.md` §5, `docs/01-requirements.md` §4.2
- 完了条件: 全 8 ステップが型エラーなくロードできる

### #22 Tutorial モード UI (/lab/render/tutorial) 実装

`app/lab/render/tutorial/page.tsx` + `features/lab-render/components/TutorialMode.tsx`。進捗バー + Prev/Next、メインエリアに可視化ビュー、サイドパネルにステップ MDX。step は nuqs で URL 同期（`?step=3`）。最終ステップで「完了 → 自由操作モードへ」誘導。各ステップ滞在時間を RUM に `lab.tutorial.step_duration` で送信。

- 参照: `docs/02-information-architecture.md` §4.4, `docs/04-architecture-state-management.md` §4, `docs/05-architecture-rum.md` §2.2 カスタムメトリクス
- 完了条件: 8 ステップを通しで完走できる、リロードでも進捗維持

### #23 フィードバック機能（/api/feedback + FeedbackButton）

`features/feedback/schema.ts` に Zod スキーマ（rating: 'good' | 'bad', comment: optional string<=200, page_path, session_id）。`features/feedback/components/FeedbackButton.tsx`（Good/Bad 選択 → 任意コメント → 送信）。`app/api/feedback/route.ts` で D1 に保存。Footer と Lab 末尾に配置。

- 参照: `docs/01-requirements.md` §1.5, §1.6
- 完了条件: ボタンから送信 → D1 に保存、成功トーストが出る

### #24 管理ダッシュボード (/admin/rum) 実装

`app/admin/rum/page.tsx`。`?token=XXX` を `env.ADMIN_TOKEN` と照合、不一致は 404 相当。Server Component で D1 クエリ実行 → デイリー PV/UU、LCP/INP/CLS ヒストグラム、Lab 別アクセス、ブラウザ別シェア、直近 20 件テーブル。Recharts で描画。`features/admin-dashboard/queries/` に集計クエリを配置。

- 参照: `docs/05-architecture-rum.md` §5
- 完了条件: トークン一致時のみ表示、全グラフが描画される

### #25 Cloudflare Web Analytics タグ埋め込み

`app/layout.tsx` に Cloudflare Web Analytics の beacon スクリプト追加。本番のみ有効化（`NEXT_PUBLIC_CF_ANALYTICS_TOKEN` が設定されている時だけ）。プライバシーポリシー側にも記載。

- 参照: `docs/01-requirements.md` §1.4
- 完了条件: CF ダッシュボードで PV が観測できる

### #26 OGP/メタタグ/JSON-LD 全ページ設定

各ページの `generateMetadata` で title / description / OGP（og:image は `/api/og` で動的生成 or 静的 `public/og/*.png`）、canonical URL、JSON-LD (TechArticle) を設定。日本語の description は 200 字程度。モード別 OGP（tutorial と playground で別画像）も対応。

- 参照: `docs/01-requirements.md` §2.3, `docs/02-information-architecture.md` §2.1
- 完了条件: OGP デバッガでプレビューが正しく出る

### #27 Playwright E2E + Visual Regression 整備

`tests/e2e/{landing, lab-render, feedback}.spec.ts` を作成。主要フロー: ランディング → Lab 1 → チュートリアル完走、Playground 操作、フィードバック送信。`tests/visual/` でスナップショット。`playwright.config.ts` で Chromium 固定 + モバイルプロファイル。

- 参照: `docs/03-architecture-directory.md` §8, `CLAUDE.md` テスト戦略
- 完了条件: CI で全 E2E が緑

### #28 GitHub Actions CI（Lint / 型チェック / テスト / Lighthouse / Bundle）

`.github/workflows/ci.yml`: Biome check, `tsc --noEmit`, vitest, playwright。`.github/workflows/lighthouse.yml`: Lighthouse CI を PR で実行し Core Web Vitals 回帰をブロック。`next build` のバンドルサイズを size-limit 等でチェック（初期 JS 200KB gzip 以下）。

- 参照: `CLAUDE.md` パフォーマンステスト, `docs/01-requirements.md` §2.1
- 完了条件: PR でワークフローが全て通る

### #29 Cloudflare Workers (OpenNext) デプロイ + D1 Cron cleanup

`pnpm deploy`（= `opennextjs-cloudflare build && opennextjs-cloudflare deploy`）で Worker を本番に公開。シークレット `ADMIN_TOKEN` は `wrangler secret put`、非機密（`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CF_ANALYTICS_TOKEN`, `ALLOWED_ORIGIN`）は `wrangler.jsonc` の `vars`。D1 バインディング `DB` は `wrangler.jsonc` の `d1_databases`。Workers Builds で GitHub 連携して main push 自動デプロイ。`workers/rum-cleanup/`（Cron Trigger、毎日 3AM UTC、90 日超データ削除）を別 Worker としてデプロイ。初回デプロイで `/api/rum/collect` が 204 を返すこと、`/admin/rum` が動くことを確認。

- 参照: `docs/05-architecture-rum.md` §4.3, `docs/01-requirements.md` §2.5
- 完了条件: 本番 URL（Workers 既定 or 独自ドメイン）でサイトが稼働

### #30 Phase 1 受け入れ条件チェック + Zenn 第 1 弾記事

`docs/01-requirements.md` §6 の全項目を実機で確認（Chromium/Safari/Firefox/モバイル）。Core Web Vitals が全ページで Good、プライバシーポリシー・利用規約公開、GitHub 公開、Zenn 記事第 1 弾投稿（Lab 1 のコンセプトと使い方、DevTools との対応）。初回公開後の RUM データが D1 に届いているかを確認。

- 参照: `docs/01-requirements.md` §6, `CLAUDE.md` 受け入れ条件
- 完了条件: チェックリスト全項目にチェック

---

## 運用ルール

- タスクを着手する際は Claude Code の TaskList/TaskUpdate でステータスを `in_progress` に更新
- タスクが拡大したら本書にサブタスクを追加するか、新規タスクを切る
- Phase 2 以降のタスクは別ドキュメント（`docs/08-phase-2-tasks.md` 等）に分ける
