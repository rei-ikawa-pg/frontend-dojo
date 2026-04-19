/**
 * お問い合わせ受信エンドポイント。
 * - Cloudflare Workers / OpenNext（Node.js ランタイム）
 * - Origin 制限は RUM / feedback と同じ方針（ALLOWED_ORIGIN + localhost）
 * - honeypot フィールド (`website`) に値が入っていれば bot とみなして 204 を返す（黙って破棄）
 * - 成功時 204
 */

import { getCloudflareContext } from '@opennextjs/cloudflare'
import type { NextRequest } from 'next/server'
import { contactSchema } from '@/features/contact/schema'
import { corsHeaders, preflightResponse } from '@/lib/api/cors'

export async function OPTIONS(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true })
  return preflightResponse(request.headers.get('origin'), env.ALLOWED_ORIGIN)
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

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    return new Response('Validation Error', { status: 400, headers: cors })
  }

  // honeypot: 値が入っていれば bot として黙って破棄（成功ステータスを返して挙動を悟られない）
  if (parsed.data.website && parsed.data.website.length > 0) {
    return new Response(null, { status: 204, headers: cors })
  }

  try {
    const { category, body: message, email, page_path, session_id } = parsed.data
    const userAgent = request.headers.get('user-agent')?.slice(0, 200) ?? null
    await env.DB.prepare(
      'INSERT INTO contact_messages (category, body, email, page_path, session_id, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    )
      .bind(
        category,
        message,
        email && email.length > 0 ? email : null,
        page_path ?? null,
        session_id ?? null,
        userAgent,
      )
      .run()
  } catch (err) {
    console.error('contact insert failed', err)
    return new Response('Internal Error', { status: 500, headers: cors })
  }

  return new Response(null, { status: 204, headers: cors })
}
