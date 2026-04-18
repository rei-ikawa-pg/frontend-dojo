/**
 * RUM の型定義。Zod スキーマから z.infer で導出。
 */

import type { z } from 'zod'
import type { rumEventSchema } from './schema'

/** 送信時の完全形イベント（Collector が組み立てた後の形） */
export type RumEvent = z.infer<typeof rumEventSchema>

/** metadata に載せられるフラットな key-value */
export type RumMetadata = Record<string, string | number | boolean | null>

/**
 * Lab コンポーネントから emit するときの入力。
 * session_id / page_path / device_type / browser / timestamp などのコンテキストは
 * Collector 側で付与するので、ここでは最小限の指標のみ要求する。
 */
export type RumEventInput = {
  metric_name: string
  metric_value: number
  metadata?: RumMetadata
  lab_id?: string | null
}
