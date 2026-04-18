#!/usr/bin/env bash
# D1 マイグレーションを適用するヘルパー。
# 引数なし = ローカル、--remote = 本番。
set -euo pipefail

TARGET="${1:-local}"

case "$TARGET" in
  local|--local)
    pnpm exec wrangler d1 migrations apply frontend-dojo-rum --local
    ;;
  remote|--remote)
    pnpm exec wrangler d1 migrations apply frontend-dojo-rum --remote
    ;;
  *)
    echo "Usage: $0 [local|remote]" >&2
    exit 1
    ;;
esac
