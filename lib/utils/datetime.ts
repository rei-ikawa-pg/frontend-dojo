/**
 * D1 に UTC で保存された `created_at` を JST (`Asia/Tokyo`) で整形するユーティリティ。
 *
 * 入力として想定する 3 形式:
 *   1. `2026-04-19T08:27:54.000Z`      — `Date.toISOString()` 由来（rum_events）
 *   2. `2026-04-19 08:27:54`           — SQLite `CURRENT_TIMESTAMP` 由来（feedback / contact_messages）
 *                                         仕様上 UTC だが `Z` が付かず、JS の `Date` はローカル時刻として解釈するため明示的に補う。
 *   3. `2026-04-19T08:27:54` / `+09:00` 付きなど、TZ 指定ありの ISO8601
 */

function toUtcDate(value: string): Date {
  // "YYYY-MM-DD HH:MM:SS" を ISO 形式に寄せる
  let s = value.replace(' ', 'T')
  // 末尾に Z or ±HH(:MM) が無ければ UTC とみなして Z を補う
  if (!/(Z|[+-]\d{2}:?\d{2})$/.test(s)) {
    s += 'Z'
  }
  return new Date(s)
}

/**
 * `YYYY-MM-DD HH:mm:ss` (JST) 形式で返す。
 * パース失敗時は入力文字列をそのまま返す（表示が壊れない方を優先）。
 */
export function formatJst(value: string | null | undefined): string {
  if (!value) return '—'
  const date = toUtcDate(value)
  if (Number.isNaN(date.getTime())) return value

  const parts = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`
}
