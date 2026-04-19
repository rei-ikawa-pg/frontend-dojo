/**
 * フィードバック送信のバリデーションスキーマ（クライアント・サーバ共有）。
 */

import { z } from 'zod'
import { sitePathSchema } from '@/lib/validation/path'

export const feedbackSchema = z.object({
  rating: z.enum(['good', 'bad']),
  /** 空文字も許容（未入力送信を許す）。前後空白は事前に trim する */
  comment: z.string().max(200).optional(),
  page_path: sitePathSchema,
  lab_id: z.string().max(50).nullable().optional(),
  session_id: z.string().uuid().nullable().optional(),
})

export type FeedbackInput = z.infer<typeof feedbackSchema>
