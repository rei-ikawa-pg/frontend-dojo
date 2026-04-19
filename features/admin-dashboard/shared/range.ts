/**
 * 管理画面の期間プリセット。
 *
 * - `7d` / `30d` / `90d` の 3 段階。上限 90 日は D1 側の保持期間に合わせた値
 *   （90 日以前のデータは Cron で削除される / docs/05 §4.3）
 * - URL に `?range=XXX` を載せることでサーバ / クライアントで同じ値を扱う
 */

export const RANGE_OPTIONS = ['7d', '30d', '90d'] as const
export type RangeKey = (typeof RANGE_OPTIONS)[number]

/** 未指定時のデフォルト */
export const DEFAULT_RANGE: RangeKey = '30d'

/** クエリ文字列を安全に RangeKey に丸める（知らない値は既定にフォールバック） */
export function parseRange(value: string | undefined | null): RangeKey {
  return (RANGE_OPTIONS as readonly string[]).includes(value ?? '')
    ? (value as RangeKey)
    : DEFAULT_RANGE
}

/** 集計クエリに渡す日数 */
export function rangeToDays(range: RangeKey): number {
  switch (range) {
    case '7d':
      return 7
    case '30d':
      return 30
    case '90d':
      return 90
  }
}

/** 見出し等に表示する日本語ラベル */
export function rangeLabel(range: RangeKey): string {
  return `直近 ${rangeToDays(range)} 日`
}
