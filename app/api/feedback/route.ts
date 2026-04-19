/**
 * フィードバック受信エンドポイント。
 * - Cloudflare Workers / OpenNext（Node.js ランタイム）
 * - Origin 制限は RUM と同じ方針（ALLOWED_ORIGIN + localhost）
 * - 成功時 204（クライアント側はトーストで完了表示）
 */

import { getCloudflareContext } from '@opennextjs/cloudflare'
import type { NextRequest } from 'next/server'
import { feedbackSchema } from '@/features/feedback/schema'
import { corsHeaders, isDevEnvironment, preflightResponse } from '@/lib/api/cors'
import { classifyUserAgent } from '@/lib/browser/detect'

export async function OPTIONS(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true })
  return preflightResponse(request.headers.get('origin'), env.ALLOWED_ORIGIN, {
    allowLocal: isDevEnvironment(),
  })
}

export async function POST(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true })
  const origin = request.headers.get('origin')
  const cors = corsHeaders(origin, env.ALLOWED_ORIGIN, { allowLocal: isDevEnvironment() })

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
    // UA は生文字列を保存せず、分類ラベル (browser/os/device_type) に落としてから保存する。
    // fingerprint 性の低減（docs/05 §2.6 RUM 方針と同じ扱い）。
    const { browser, os, device_type } = classifyUserAgent(request.headers.get('user-agent'))
    await env.DB.prepare(
      'INSERT INTO feedback (page_path, lab_id, rating, comment, session_id, browser, os, device_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    )
      .bind(
        page_path,
        lab_id ?? null,
        rating,
        comment ?? null,
        session_id ?? null,
        browser,
        os,
        device_type,
      )
      .run()
  } catch (err) {
    console.error('feedback insert failed', err)
    return new Response('Internal Error', { status: 500, headers: cors })
  }

  return new Response(null, { status: 204, headers: cors })
}
