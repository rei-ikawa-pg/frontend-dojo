# SETUP.md - フロントエンド道場 初期セットアップ手順

Rさんが手を動かす初期セットアップのコマンド集です。上から順に実行してください。

---

## 0. 前提条件

以下が揃っているか確認してください。

```bash
# Node.js 20+ が入っているか
node -v  # v20.x.x or later

# pnpm が入っているか（無ければインストール）
pnpm -v
# 無ければ: npm install -g pnpm

# Git が入っているか
git --version

# GitHub CLI（あると楽、なくてもOK）
gh --version
# 無ければ: https://cli.github.com/ からインストール

# Cloudflare アカウント
# https://dash.cloudflare.com/sign-up で作成済みであること
```

---

## 1. Next.js プロジェクト作成

```bash
# プロジェクト作成
pnpm create next-app@latest frontend-dojo \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --turbopack \
  --use-pnpm

cd frontend-dojo
```

生成される構造を確認:

```bash
ls -la
# app/ public/ node_modules/ package.json tsconfig.json tailwind.config.ts 等
```

---

## 2. ESLint を削除して Biome に置き換え

```bash
# ESLint 関連を削除
pnpm remove eslint eslint-config-next
rm -f .eslintrc.json eslint.config.mjs

# Biome インストール
pnpm add -D --save-exact @biomejs/biome

# Biome 初期化
pnpm biome init
```

`biome.json` を以下に編集:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "useExhaustiveDependencies": "warn"
      },
      "style": {
        "noNonNullAssertion": "warn"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded",
      "trailingCommas": "all"
    }
  },
  "files": {
    "ignore": [".next", "node_modules", ".vercel", "dist"]
  }
}
```

`package.json` のスクリプトを更新:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "biome lint .",
    "format": "biome format --write .",
    "check": "biome check --write ."
  }
}
```

---

## 3. shadcn/ui 初期化

```bash
pnpm dlx shadcn@latest init
```

対話で以下を選択:
- Style: `Default`
- Base color: `Slate`（道場のダーク基調と相性が良い）
- CSS variables: `Yes`

初期コンポーネントをいくつか追加:

```bash
pnpm dlx shadcn@latest add button card tabs slider input textarea toggle progress sonner
```

---

## 4. 状態管理・バリデーション・MDX・ユーティリティ

```bash
# 状態管理
pnpm add zustand nuqs @tanstack/react-query

# バリデーション
pnpm add zod

# Performance 計測
pnpm add web-vitals

# MDX
pnpm add @next/mdx @mdx-js/loader @mdx-js/react
pnpm add -D @types/mdx

# ユーティリティ
pnpm add clsx tailwind-merge

# 型
pnpm add -D @types/node
```

---

## 5. Cloudflare Workers / OpenNext / Wrangler

> 当初 `@cloudflare/next-on-pages` を採用予定だったが、公式が deprecated にし OpenNext Cloudflare アダプタへ移行を推奨しているため切り替え。本プロジェクトは Next.js 16 + OpenNext で **Cloudflare Workers（Static Assets）** にデプロイする。

```bash
# OpenNext Cloudflare アダプタと wrangler
pnpm add @opennextjs/cloudflare
pnpm add -D wrangler

# wrangler にログイン
pnpm exec wrangler login
# ブラウザが開くので Cloudflare アカウントで認証
```

`open-next.config.ts` を作成:

```typescript
import { defineCloudflareConfig } from '@opennextjs/cloudflare'

export default defineCloudflareConfig({})
```

`wrangler.jsonc` を作成（D1 は §10 で追記）:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "frontend-dojo",
  "main": ".open-next/worker.js",
  "compatibility_date": "2026-04-17",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "observability": { "enabled": true },
  "vars": { "ENVIRONMENT": "production" }
}
```

`.dev.vars` を作成（`.gitignore` 済み）:

```
NEXTJS_ENV=development
```

`next.config.ts` に初期化コールを追加:

```typescript
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {}

initOpenNextCloudflareForDev()

export default nextConfig
```

`package.json` にスクリプト追加:

```json
{
  "scripts": {
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
    "upload": "opennextjs-cloudflare build && opennextjs-cloudflare upload",
    "cf-typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts"
  }
}
```

`.gitignore` に追加:

```
.open-next/
.wrangler/
.dev.vars
cloudflare-env.d.ts
```

`public/_headers` を作成（静的アセットのキャッシュ）:

```
/_next/static/*
  Cache-Control: public,max-age=31536000,immutable
```

---

## 6. テストフレームワーク

```bash
# Vitest (ユニットテスト)
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom

# Playwright (E2E)
pnpm add -D @playwright/test
pnpm exec playwright install chromium firefox webkit
```

`vitest.config.ts` を作成:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

`playwright.config.ts` を作成:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## 7. 設計ドキュメント一式をリポジトリに配置

設計ドキュメント（`CLAUDE.md` と `docs/` 配下）をプロジェクトルートに配置:

```bash
# プロジェクトルートに CLAUDE.md を置く
cp ~/Downloads/CLAUDE.md ./CLAUDE.md

# docs/ を作成してドキュメント類を配置
mkdir -p docs
cp ~/Downloads/phase1_mvp_requirements.md docs/01-requirements.md
cp ~/Downloads/information_architecture.md docs/02-information-architecture.md
cp ~/Downloads/architecture_directory.md docs/03-architecture-directory.md
cp ~/Downloads/architecture_state_management.md docs/04-architecture-state-management.md
cp ~/Downloads/architecture_rum.md docs/05-architecture-rum.md
cp ~/Downloads/architecture_visualization_engine.md docs/06-architecture-visualization-engine.md
```

---

## 8. GitHub リポジトリ作成 + 初期コミット

```bash
# 初期コミット
git add .
git commit -m "chore: initial project setup with Next.js + Biome + shadcn/ui"

# GitHub リポジトリ作成（gh CLI がある場合）
gh repo create frontend-dojo --public --source=. --remote=origin --description "フロントエンドの鬼門を触って学べる日本語インタラクティブラボ"

git push -u origin main
```

`gh` が無い場合は GitHub の Web UI で空リポジトリを作って、以下を実行:

```bash
git remote add origin https://github.com/[USERNAME]/frontend-dojo.git
git branch -M main
git push -u origin main
```

---

## 9. Cloudflare Workers プロジェクト作成（Workers Builds）

> OpenNext で Next.js 16 を Workers（Static Assets）にデプロイする方針。Dashboard からの Git 連携は Workers Builds を使う。

### A. CLI で最初に手動デプロイして Worker を作成（推奨）

```bash
# §10 の D1 作成が先。wrangler.jsonc の database_id が埋まった状態で実行すること。
pnpm deploy
```

初回は未ログイン／未リンクなら `wrangler` が案内してくれる。

### B. Dashboard で Git 連携（CI 化）

Cloudflare Dashboard (https://dash.cloudflare.com) → Workers & Pages → 作成済み `frontend-dojo` Worker を開く → Settings → Builds → **Connect to Git**。

Build 設定:
- Git repo: `rei-ikawa-pg/frontend-dojo`
- Branch: `main`
- Build command: `pnpm run deploy`（`opennextjs-cloudflare build && opennextjs-cloudflare deploy`）
- Deploy command: （空でよい。Build コマンド内で deploy まで実行）
- Root directory: `/`
- Node.js version: `20` （Environment variables で `NODE_VERSION=20`）

初回ビルドはエラーになる可能性が高い。エラーログを見ながら調整する。

---

## 10. Cloudflare D1 データベース作成

```bash
# D1 データベース作成
pnpm exec wrangler d1 create frontend-dojo-rum
```

出力される `database_id` をメモしてください。既存の `wrangler.jsonc`（§5 で作成済）に D1 バインディングを追記します:

```jsonc
{
  // ...既存の設定...
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "frontend-dojo-rum",
      "database_id": "ここに先ほどメモした database_id"
    }
  ]
}
```

マイグレーションファイルを作成:

```bash
mkdir -p migrations
cat > migrations/0001_initial.sql <<'EOF'
CREATE TABLE IF NOT EXISTS rum_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  lab_id TEXT,
  mode TEXT NOT NULL,
  device_type TEXT NOT NULL,
  browser TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value REAL NOT NULL,
  metadata TEXT,
  sdk_version TEXT NOT NULL,
  referrer TEXT,
  created_at TEXT NOT NULL,
  inserted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rum_created_at ON rum_events(created_at);
CREATE INDEX IF NOT EXISTS idx_rum_lab_metric ON rum_events(lab_id, metric_name);
CREATE INDEX IF NOT EXISTS idx_rum_session ON rum_events(session_id);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_path TEXT NOT NULL,
  lab_id TEXT,
  rating TEXT NOT NULL CHECK (rating IN ('good', 'bad')),
  comment TEXT,
  session_id TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
EOF

# ローカルに適用（開発用）
pnpm exec wrangler d1 execute frontend-dojo-rum --local --file=migrations/0001_initial.sql

# 本番に適用（リモート）
pnpm exec wrangler d1 execute frontend-dojo-rum --remote --file=migrations/0001_initial.sql
```

---

## 11. Cloudflare Workers の環境変数・シークレット設定

Workers では機密値は **シークレット**として登録する。`wrangler.jsonc` の `vars` は非機密のみ。

**シークレット**（CLI で登録）:

```bash
pnpm exec wrangler secret put ADMIN_TOKEN
# プロンプトで `openssl rand -hex 32` で生成した値を貼る
```

**非機密の `vars`**（`wrangler.jsonc` の `vars` に追記）:

```jsonc
{
  // ...
  "vars": {
    "ENVIRONMENT": "production",
    "ALLOWED_ORIGIN": "https://frontend-dojo.your-subdomain.workers.dev"
  }
}
```

> ドメインは Workers 既定のサブドメイン、または独自ドメインを Dashboard → Workers → Settings → Domains & Routes で付与後に正しい値へ差し替え。

D1 バインディングは §10 で `wrangler.jsonc` に記述済み。Dashboard 上のバインディング追加は不要（`wrangler.jsonc` が Source of Truth）。

---

## 12. Cloudflare Web Analytics 有効化

Cloudflare Dashboard → Web Analytics → Add a site
- Hostname: デプロイ後の Workers URL（例: `frontend-dojo.<your-subdomain>.workers.dev`）、または独自ドメイン
- 「Manual setup」を選択し、発行されたスニペットを `app/layout.tsx` に貼る（Workers では自動統合がないため手動）

---

## 13. GitHub Actions ワークフロー（CI/CD）

`.github/workflows/ci.yml` を作成:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm biome check .
      - run: pnpm test --run
      - run: pnpm build

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps
      - run: pnpm exec playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

---

## 14. 動作確認

```bash
# 開発サーバー起動
pnpm dev
```

http://localhost:3000 にアクセスして Next.js デフォルトページが表示されれば OK。

```bash
# ビルド確認
pnpm build

# Biome 確認
pnpm check
```

---

## 15. Claude Code に引き継ぎ

ここまで完了したら、プロジェクトディレクトリで Claude Code を起動:

```bash
cd frontend-dojo
claude
```

Claude Code が `CLAUDE.md` と `docs/` を読み込み、プロジェクトのコンテキストを把握します。最初の指示として以下を試してください:

```
CLAUDE.md と docs/ を読んだら、Phase 1 MVP の Lab 1 実装に向けた作業計画を提案してください。
```

---

## トラブルシューティング

### `pnpm exec next-on-pages` がエラーで止まる
- `next.config.mjs` を確認、`experimental.runtime = 'edge'` が設定されているか
- 使用している Node.js API が Edge Runtime 非対応の可能性あり

### D1 マイグレーションが失敗する
- `wrangler.toml` の `database_id` が正しいか確認
- `--remote` フラグ付き忘れていないか

### GitHub Actions で Playwright が落ちる
- `--with-deps` フラグが付いているか確認
- テスト対象のサーバが起動しているか（`webServer` 設定）

---

最終更新: 2026-04-17
