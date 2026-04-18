/**
 * フィードバック受信エンドポイント。
 * - Edge Runtime
 * - Origin 制限は RUM と同じ方針（ALLOWED_ORIGIN + localhost）
 * - 成功時 204（クライアント側はトーストで完了表示）
 */

import { getCloudflareContext } from '@opennextjs/cloudflare'
import type { NextRequest } from 'next/server'
import { feedbackSchema } from '@/features/feedback/schema'

export const runtime = 'edge'

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
  if (/^https?:\/\/localhost(?::\d+)?$/.test(origin)) return true
  if (/^https?:\/\/127\.0\.0\.1(?::\d+)?$/.test(origin)) return true
  return false
}

export async function OPTIONS(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true })
  const origin = request.headers.get('origin')
  return new Response(null, { status: 204, headers: corsHeaders(origin, env.ALLOWED_ORIGIN) })
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

  const parsed = feedbackSchema.safeParse(body)
  if (!parsed.success) {
    return new Response('Validation Error', { status: 400, headers: cors })
  }

  try {
    const { rating, comment, page_path, lab_id, session_id } = parsed.data
    // UA はサーバ受信時に抽出する（生のヘッダはログ保存しない方針）
    const userAgent = request.headers.get('user-agent')?.slice(0, 200) ?? null
    await env.DB.prepare(
      'INSERT INTO feedback (page_path, lab_id, rating, comment, session_id, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    )
      .bind(page_path, lab_id ?? null, rating, comment ?? null, session_id ?? null, userAgent)
      .run()
  } catch (err) {
    console.error('feedback insert failed', err)
    return new Response('Internal Error', { status: 500, headers: cors })
  }

  return new Response(null, { status: 204, headers: cors })
}
