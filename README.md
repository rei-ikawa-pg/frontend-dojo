# フロントエンド道場 / Frontend Dojo

> フロントエンドの鬼門を、読むのではなく触って理解する。日本語のインタラクティブラボ。

中級フロントエンドエンジニア向けに、ブラウザのレンダリング・再レンダリング・パフォーマンス等の難所を「自分で触れる Lab」を通じて学べる個人プロジェクトです。

- 本番 URL: https://frontend-dojo.rakurai.dev

---

## 技術スタック

### フロントエンド

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- React 19
- TypeScript (strict mode)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [MDX](https://mdxjs.com/) (`@next/mdx`) — 解説コンテンツ管理

### 状態管理

- [Zustand](https://github.com/pmndrs/zustand) — ページ/機能状態
- [nuqs](https://nuqs.47ng.com/) — URL 同期状態
- [TanStack Query](https://tanstack.com/query) — サーバ状態・キャッシュ

### バリデーション / 計測

- [Zod](https://zod.dev/) — スキーマバリデーション
- [web-vitals](https://github.com/GoogleChrome/web-vitals) — Core Web Vitals 計測

### ツール

- [Biome](https://biomejs.dev/) — Lint + Formatter
- [Vitest](https://vitest.dev/) — ユニットテスト
- [Playwright](https://playwright.dev/) — E2E / Visual Regression

### インフラ

- [Cloudflare Workers](https://developers.cloudflare.com/workers/) + [OpenNext](https://opennext.js.org/cloudflare) — ホスティング / BFF
- [Cloudflare D1](https://developers.cloudflare.com/d1/) — SQLite（RUM データ保存）
- [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) — ビジネス指標測定
- GitHub Actions — Lint / Test / Build の CI
- Cloudflare Workers Builds — `main` への push で本番へ自動デプロイ

---

## セットアップ（ローカル開発）

前提:

- Node.js 20 以上
- pnpm 10 以上

```bash
# 依存インストール
pnpm install

# 開発サーバ起動
pnpm dev
# → http://localhost:3000
```

Cloudflare バインディング（D1 / env など）を含めた挙動を確認したい場合は:

```bash
pnpm preview
```

Worker としてローカル起動します（Wrangler + OpenNext）。

---

## 主な npm スクリプト

| コマンド          | 内容                                                    |
| ----------------- | ------------------------------------------------------- |
| `pnpm dev`        | Next.js 開発サーバ（Turbopack）                         |
| `pnpm build`      | Next.js 本番ビルド                                      |
| `pnpm start`      | ビルド成果物をローカルで起動（Next.js 単体）            |
| `pnpm preview`    | OpenNext で Worker としてローカル起動（本番に最も近い） |
| `pnpm run deploy` | 手動で Cloudflare Workers に本番デプロイ                |
| `pnpm lint`       | Biome Lint                                              |
| `pnpm check`      | Biome Lint + Format（自動修正込み）                     |
| `pnpm test`       | Vitest ユニットテスト                                   |
| `pnpm test:e2e`   | Playwright E2E                                          |
| `pnpm cf-typegen` | `cloudflare-env.d.ts` を生成（D1 等のバインディング型） |

> 通常は `pnpm dev` で開発 → `git push main` で自動デプロイ、という運用です。手動デプロイ（`pnpm run deploy`）は緊急時のみ。

---

## 環境変数

### 本番（Cloudflare Workers 側で管理）

| 種類         | 名前                             | 備考                                                     |
| ------------ | -------------------------------- | -------------------------------------------------------- |
| シークレット | `ADMIN_TOKEN`                    | 管理者ダッシュボード保護（`wrangler secret put` で登録） |
| 変数         | `ENVIRONMENT`                    | `wrangler.jsonc` の `vars` で定義                        |
| 変数         | `ALLOWED_ORIGIN`                 | CORS 許可オリジン                                        |
| ビルド変数   | `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` | Web Analytics beacon（ビルド時に HTML へ埋め込み）       |

### ローカル

| ファイル       | 用途                                                  | Git       |
| -------------- | ----------------------------------------------------- | --------- |
| `.env.local`   | `next build` / `next dev` が読む。`NEXT_PUBLIC_*` 用  | ignored   |
| `.dev.vars`    | Wrangler / OpenNext preview が読む。Worker 実行時 env | ignored   |
| `.env.example` | 必要な変数名の雛形                                    | committed |

新しくセットアップする場合は `.env.example` をコピーして `.env.local` を作成し、値を埋めてください。

---

## ディレクトリ構造（抜粋）

```
frontend-dojo/
├── app/                  # Next.js App Router（ルーティングのみ）
├── features/             # 機能ごとの完結コード（Lab / RUM / Feedback 等）
├── components/
│   ├── ui/               # shadcn/ui 自動生成
│   └── ...               # レイアウト・共通コンポーネント
├── lib/                  # 横断ユーティリティ
├── migrations/           # D1 SQL マイグレーション
├── tests/                # E2E / 共通テストセットアップ
├── docs/                 # 設計ドキュメント一式
│   ├── 01-requirements.md            # Phase 1 MVP 要件定義
│   ├── 02-information-architecture.md
│   ├── 03-architecture-directory.md
│   ├── 04-architecture-state-management.md
│   ├── 05-architecture-rum.md
│   ├── 06-architecture-visualization-engine.md
│   └── 07-task-list.md               # 実装タスクリスト
├── wrangler.jsonc        # Cloudflare Workers 設定
├── open-next.config.ts   # OpenNext 設定
└── CLAUDE.md             # Claude Code 向けガイド
```

ルール詳細は [`CLAUDE.md`](CLAUDE.md) および [`docs/architecture/directory.md`](docs/architecture/directory.md) を参照。

---

## デプロイ

### 自動デプロイ（通常運用）

`main` ブランチに push すると Cloudflare Workers Builds が以下を実行:

1. `pnpm install --frozen-lockfile`
2. `pnpm exec opennextjs-cloudflare build`
3. `pnpm exec opennextjs-cloudflare deploy`

成功すれば https://frontend-dojo.rakurai.dev に反映されます。

非本番ブランチ（feature ブランチ）も自動でプレビュー URL が発行されます。

### 手動デプロイ

```bash
pnpm run deploy
```

ローカルで build + deploy を行います。通常は不要。

---

## D1 マイグレーション

```bash
# 新しいマイグレーションを作る場合は migrations/000X_xxx.sql を追加

# ローカル反映
pnpm exec wrangler d1 execute frontend-dojo-rum --local --file=migrations/000X_xxx.sql

# 本番反映
pnpm exec wrangler d1 execute frontend-dojo-rum --remote --file=migrations/000X_xxx.sql
```

スキーマ設計は [`docs/architecture/rum.md`](docs/architecture/rum.md) を参照。

---

## 非ゴール（やらないこと）

- 多言語対応
- ログイン / アカウント機能
- コメント機能
- モバイルでのフル機能（MVP は簡易版）

---

## 参考ドキュメント

- [`CLAUDE.md`](CLAUDE.md) — プロジェクト全体のガイド（ADR、規約、アンチパターン）
- [`docs/`](docs/) — 各種設計書（要件、情報設計、アーキテクチャ、タスクリスト）
