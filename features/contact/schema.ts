/**
 * お問い合わせフォーム (/contact) のバリデーションスキーマ。
 * クライアント・サーバで共有する。
 */

import { z } from 'zod'
import { sitePathSchema } from '@/lib/validation/path'

export const CONTACT_CATEGORIES = ['suggestion', 'bug', 'content', 'other'] as const

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number]

export const CONTACT_CATEGORY_LABELS: Record<ContactCategory, string> = {
  suggestion: '提案・要望',
  bug: 'バグ報告',
  content: 'コンテンツへの指摘',
  other: 'その他',
}

export const CONTACT_BODY_MAX = 2000
export const CONTACT_EMAIL_MAX = 200

export const contactSchema = z.object({
  category: z.enum(CONTACT_CATEGORIES),
  /** 本文。前後空白は trim 後、最低 1 文字必要 */
  body: z.string().trim().min(1).max(CONTACT_BODY_MAX),
  /** 任意。空文字も許容（未入力扱い） */
  email: z.union([z.string().trim().email().max(CONTACT_EMAIL_MAX), z.literal('')]).optional(),
  page_path: sitePathSchema.optional(),
  session_id: z.string().uuid().nullable().optional(),
  /**
   * honeypot。通常ユーザには非表示のフィールド。値が入っていたら bot と判断するが、
   * スキーマでは弾かずに受け入れ、ハンドラ側で silent に破棄する（検知を悟られないため）。
   */
  website: z.string().max(200).optional(),
})

export type ContactInput = z.infer<typeof contactSchema>
