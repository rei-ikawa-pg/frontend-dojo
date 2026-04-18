/**
 * RUM 収集エンドポイント（Cloudflare Workers / Edge Runtime）。
 *
 * 処理:
 *   1. Origin を ALLOWED_ORIGIN または localhost に制限
 *   2. JSON ボディを Zod バリデーション
 *   3. D1 へ batch insert
 *
 * プライバシー:
 *   - IP アドレスやリクエストヘッダーは D1 に保存しない
 *   - CF-Connecting-IP 等はレイヤー側（Workers / WAF）で処理させ、
 *     アプリ層では参照しない（方針は docs/05 §2.6）
 */

import { getCloudflareContext } from '@opennextjs/cloudflare'
import type { NextRequest } from 'next/server'
import { rumEventArraySchema } from '@/features/rum/shared/schema'

function corsHeaders(origin: string | null, allowed: string): Record<string, string> {
  const allowOrigin = origin && isOriginAllowed(origin, allowed) ? origin : allowed
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function isOriginAllowed(origin: string, allowed: string): boolean {
  if (origin === allowed) return true
  // 開発時: pnpm dev / pnpm preview を許可
  if (/^https?:\/\/localhost(?::\d+)?$/.test(origin)) return true
  if (/^https?:\/\/127\.0\.0\.1(?::\d+)?$/.test(origin)) return true
  return false
}

export async function OPTIONS(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true })
  const origin = request.headers.get('origin')
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin, env.ALLOWED_ORIGIN),
  })
}

export async function POST(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true })
  const origin = request.headers.get('origin')
  const cors = corsHeaders(origin, env.ALLOWED_ORIGIN)

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return new Response('Bad Request', { status: 400, headers: cors })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response('Invalid JSON', { status: 400, headers: cors })
  }

  const parsed = rumEventArraySchema.safeParse(body)
  if (!parsed.success) {
    // 何が落ちたかのヒントはサーバ側では残さない（不正入力のフィードバックを返さない方針）
    return new Response('Validation Error', { status: 400, headers: cors })
  }

  try {
    // prepare + bind + batch で単一トランザクションとして書き込む（D1 の書き込み回数を節約）
    const stmt = env.DB.prepare(
      'INSERT INTO rum_events (session_id, page_path, lab_id, mode, device_type, browser, metric_name, metric_value, metadata, sdk_version, referrer, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    const batch = parsed.data.map((event) =>
      stmt.bind(
        event.session_id,
        event.page_path,
        event.lab_id ?? null,
        event.mode,
        event.device_type,
        event.browser,
        event.metric_name,
        event.metric_value,
        event.metadata ? JSON.stringify(event.metadata) : null,
        event.sdk_version,
        event.referrer ?? null,
        event.timestamp,
      ),
    )
    await env.DB.batch(batch)
  } catch (err) {
    // D1 の書き込み失敗は運用上は致命的なので観測しておく
    console.error('rum_events insert failed', err)
    return new Response('Internal Error', { status: 500, headers: cors })
  }

  return new Response(null, { status: 204, headers: cors })
}
