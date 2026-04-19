/**
 * RUM イベントのスキーマ定義（クライアント・サーバで共有）。
 *
 * 設計ポイント:
 * - 個人特定情報を含めない（session_id のみ匿名UUID、Cookie不使用）
 * - metadata は Lab 固有フィールドを載せるために key-value を許容するが
 *   ネスト不可・値はプリミティブに限定（D1 に JSON 文字列として保存する際の健全性のため）
 * - 1 リクエストあたり最大 50 件（Worker 側の負荷と D1 の batch 上限を考慮）
 */

import { z } from 'zod'
import { BROWSERS, DEVICE_TYPES } from '@/lib/browser/types'
import { sitePathSchema } from '@/lib/validation/path'

/** 計測時のページモード。`other` は共通基盤メトリクス用 */
export const METRIC_MODES = ['tutorial', 'playground', 'overview', 'other'] as const
export type MetricMode = (typeof METRIC_MODES)[number]

/** SDK バージョン。RUM ロジックを変更した時に新旧データを区別するために埋め込む */
export const SDK_VERSION = '0.1.0'

export const rumEventSchema = z.object({
  session_id: z.string().uuid(),
  page_path: sitePathSchema,
  // 共通基盤メトリクス（Web Vitals 等）の時は null
  lab_id: z.string().max(50).nullable().optional(),
  mode: z.enum(METRIC_MODES),
  device_type: z.enum(DEVICE_TYPES),
  browser: z.enum(BROWSERS),
  metric_name: z.string().max(100),
  metric_value: z.number().finite(),
  metadata: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
    .optional(),
  timestamp: z.string().datetime({ offset: true }),
  sdk_version: z.string().max(20),
  // referrer は URL 形式に限定。document.referrer が空文字の場合はクライアント側で null に正規化済み
  referrer: z.string().url().max(500).nullable().optional(),
})

export const rumEventArraySchema = z.array(rumEventSchema).min(1).max(50)
