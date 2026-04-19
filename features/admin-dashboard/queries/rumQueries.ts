/**
 * /admin/rum で用いる集計クエリ群。
 * D1 に対する SELECT のみ。書き込みは行わない。
 *
 * 期間は呼び出し側から `days: number` で受け取る（URL の `?range=` と連動）。
 */

// D1Database の型は wrangler cf-typegen が生成する cloudflare-env.d.ts からグローバルに取得する

export type DailyCount = { day: string; count: number }
export type MetricDistribution = { bucket: string; count: number }
export type LabUsage = { lab_id: string; mode: string; count: number }
export type BrowserShare = { browser: string; count: number }
export type RumRecentRow = {
  created_at: string
  page_path: string
  lab_id: string | null
  mode: string
  browser: string
  metric_name: string
  metric_value: number
}
export type FpsSummary = {
  count: number
  avg: number | null
  min: number | null
}
export type LoafSummary = {
  count: number
  avg: number | null
  max: number | null
}

/** ISO8601 で N 日前の閾値を作る */
function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

/** 期間内の総 PV（web.lcp の発生件数 ≒ ページロード数） */
export async function fetchTotalPageviews(db: D1Database, days: number): Promise<number> {
  const res = await db
    .prepare(
      `SELECT COUNT(*) AS count
       FROM rum_events
       WHERE metric_name = 'web.lcp' AND created_at >= ?`,
    )
    .bind(daysAgo(days))
    .first<{ count: number }>()
  return res?.count ?? 0
}

/**
 * 期間内のユニークセッション数（重複排除）。
 * 注: 日次 UU を単純合算すると複数日訪問したセッションを二重カウントするため、
 *     期間 UU は必ず COUNT(DISTINCT session_id) で取得する。
 */
export async function fetchTotalUniqueUsers(db: D1Database, days: number): Promise<number> {
  const res = await db
    .prepare(
      `SELECT COUNT(DISTINCT session_id) AS count
       FROM rum_events
       WHERE created_at >= ?`,
    )
    .bind(daysAgo(days))
    .first<{ count: number }>()
  return res?.count ?? 0
}

/** デイリー PV（JST 日付で集計）
 * created_at は UTC 保存のため +9h シフトして日付を切ると、深夜帯のイベントも
 * JST 基準の日付に正しく属する。`datetime(col, '+9 hours')` は SQLite の日時関数。
 */
export async function fetchDailyPageviews(db: D1Database, days: number): Promise<DailyCount[]> {
  const res = await db
    .prepare(
      `SELECT substr(datetime(created_at, '+9 hours'), 1, 10) AS day, COUNT(*) AS count
       FROM rum_events
       WHERE metric_name = 'web.lcp' AND created_at >= ?
       GROUP BY day
       ORDER BY day ASC`,
    )
    .bind(daysAgo(days))
    .all<DailyCount>()
  return res.results ?? []
}

/** デイリー UU（session_id の distinct, JST 日付で集計） */
export async function fetchDailyUniqueUsers(db: D1Database, days: number): Promise<DailyCount[]> {
  const res = await db
    .prepare(
      `SELECT substr(datetime(created_at, '+9 hours'), 1, 10) AS day, COUNT(DISTINCT session_id) AS count
       FROM rum_events
       WHERE created_at >= ?
       GROUP BY day
       ORDER BY day ASC`,
    )
    .bind(daysAgo(days))
    .all<DailyCount>()
  return res.results ?? []
}

/**
 * Core Web Vitals のバケット別分布。
 * LCP は 2500/4000ms、INP は 200/500ms、CLS は 0.1/0.25 で 3 分類
 */
export async function fetchMetricDistribution(
  db: D1Database,
  metric: 'web.lcp' | 'web.inp' | 'web.cls',
  days: number,
): Promise<MetricDistribution[]> {
  // SQL 側でバケット化（case 式）。Web Vitals 公式のしきい値を採用
  const buckets: Record<typeof metric, [number, number]> = {
    'web.lcp': [2500, 4000],
    'web.inp': [200, 500],
    'web.cls': [0.1, 0.25],
  }
  const [good, needs] = buckets[metric]
  const res = await db
    .prepare(
      `SELECT
         CASE
           WHEN metric_value <= ?1 THEN 'good'
           WHEN metric_value <= ?2 THEN 'needs-improvement'
           ELSE 'poor'
         END AS bucket,
         COUNT(*) AS count
       FROM rum_events
       WHERE metric_name = ?3 AND created_at >= ?4
       GROUP BY bucket`,
    )
    .bind(good, needs, metric, daysAgo(days))
    .all<MetricDistribution>()
  return res.results ?? []
}

/** Lab / mode 別のアクセス数 */
export async function fetchLabUsage(db: D1Database, days: number): Promise<LabUsage[]> {
  const res = await db
    .prepare(
      `SELECT COALESCE(lab_id, '(site)') AS lab_id, mode, COUNT(*) AS count
       FROM rum_events
       WHERE created_at >= ?
       GROUP BY lab_id, mode
       ORDER BY count DESC`,
    )
    .bind(daysAgo(days))
    .all<LabUsage>()
  return res.results ?? []
}

/** ブラウザ別シェア */
export async function fetchBrowserShare(db: D1Database, days: number): Promise<BrowserShare[]> {
  const res = await db
    .prepare(
      `SELECT browser, COUNT(*) AS count
       FROM rum_events
       WHERE created_at >= ?
       GROUP BY browser
       ORDER BY count DESC`,
    )
    .bind(daysAgo(days))
    .all<BrowserShare>()
  return res.results ?? []
}

/**
 * Lab 1 (render) の FPS 分布。
 * バケット: < 30 / 30-50 / 50-60 / 60+ の 4 段階。
 * ORDER BY で順序を保証するため sort_order を sub-column として持つ。
 */
export async function fetchFpsDistribution(
  db: D1Database,
  days: number,
): Promise<MetricDistribution[]> {
  const res = await db
    .prepare(
      `SELECT
         CASE
           WHEN metric_value < 30 THEN '< 30'
           WHEN metric_value < 50 THEN '30-50'
           WHEN metric_value < 60 THEN '50-60'
           ELSE '60+'
         END AS bucket,
         CASE
           WHEN metric_value < 30 THEN 1
           WHEN metric_value < 50 THEN 2
           WHEN metric_value < 60 THEN 3
           ELSE 4
         END AS sort_order,
         COUNT(*) AS count
       FROM rum_events
       WHERE metric_name = 'lab.render.fps' AND created_at >= ?
       GROUP BY bucket, sort_order
       ORDER BY sort_order`,
    )
    .bind(daysAgo(days))
    .all<MetricDistribution & { sort_order: number }>()
  // sort_order は外には出さない
  return (res.results ?? []).map(({ bucket, count }) => ({ bucket, count }))
}

/** Lab 1 (render) の FPS サマリ: 計測回数 / 平均 / 最低 */
export async function fetchFpsSummary(db: D1Database, days: number): Promise<FpsSummary> {
  const res = await db
    .prepare(
      `SELECT COUNT(*) AS count, AVG(metric_value) AS avg, MIN(metric_value) AS min
       FROM rum_events
       WHERE metric_name = 'lab.render.fps' AND created_at >= ?`,
    )
    .bind(daysAgo(days))
    .first<{ count: number; avg: number | null; min: number | null }>()
  return {
    count: res?.count ?? 0,
    avg: res?.avg ?? null,
    min: res?.min ?? null,
  }
}

/**
 * LoAF（長いフレーム）の発生状況サマリ。
 * LoAF API はデフォルトで 50ms 以上のフレームしかエントリを生成しないため、
 * ここで得られる件数＝長いフレーム（long animation frame）の発生回数になる。
 */
export async function fetchLoafSummary(db: D1Database, days: number): Promise<LoafSummary> {
  const res = await db
    .prepare(
      `SELECT COUNT(*) AS count, AVG(metric_value) AS avg, MAX(metric_value) AS max
       FROM rum_events
       WHERE metric_name = 'loaf' AND created_at >= ?`,
    )
    .bind(daysAgo(days))
    .first<{ count: number; avg: number | null; max: number | null }>()
  return {
    count: res?.count ?? 0,
    avg: res?.avg ?? null,
    max: res?.max ?? null,
  }
}

/** 最新 20 件の生イベント（デバッグ用） */
export async function fetchRecentEvents(db: D1Database): Promise<RumRecentRow[]> {
  const res = await db
    .prepare(
      `SELECT created_at, page_path, lab_id, mode, browser, metric_name, metric_value
       FROM rum_events
       ORDER BY created_at DESC
       LIMIT 20`,
    )
    .all<RumRecentRow>()
  return res.results ?? []
}
