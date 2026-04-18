#!/usr/bin/env bash
# フロントエンド道場の本番デプロイ。
# 1) D1 マイグレーション適用
# 2) Next.js を OpenNext でビルド + Workers にデプロイ
# 3) 付帯 Cron Worker (rum-cleanup) をデプロイ
#
# 前提: CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID が環境変数で設定済み（CI 環境）
# ローカルから実行する場合は事前に `wrangler login` が必要。
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> D1 migrations (remote)"
pnpm exec wrangler d1 migrations apply frontend-dojo-rum --remote

echo "==> Build + Deploy main site"
pnpm deploy

echo "==> Deploy rum-cleanup cron worker"
pnpm exec wrangler deploy --config workers/rum-cleanup/wrangler.jsonc

echo "==> Done."
