/**
 * /admin/rum で用いる集計クエリ群。
 * D1 に対する SELECT のみ。書き込みは行わない。
 */

// D1Database の型は wrangler cf-typegen が生成する cloudflare-env.d.ts からグローバルに取得する

export type DailyCount = { day: string; count: number }
export type MetricSample = { metric_value: number; created_at: string }
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

/** ISO8601 で N 日前の閾値を作る */
function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

/** デイリー PV（直近 30 日、UTC 日付で集計） */
export async function fetchDailyPageviews(db: D1Database): Promise<DailyCount[]> {
  const res = await db
    .prepare(
      `SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count
       FROM rum_events
       WHERE metric_name = 'web.lcp' AND created_at >= ?
       GROUP BY day
       ORDER BY day ASC`,
    )
    .bind(daysAgo(30))
    .all<{ day: string; count: number }>()
  return res.results ?? []
}

/** デイリー UU（直近 30 日、session_id の distinct） */
export async function fetchDailyUniqueUsers(db: D1Database): Promise<DailyCount[]> {
  const res = await db
    .prepare(
      `SELECT substr(created_at, 1, 10) AS day, COUNT(DISTINCT session_id) AS count
       FROM rum_events
       WHERE created_at >= ?
       GROUP BY day
       ORDER BY day ASC`,
    )
    .bind(daysAgo(30))
    .all<{ day: string; count: number }>()
  return res.results ?? []
}

/**
 * Core Web Vitals のバケット別分布。
 * LCP は 2500/4000ms、INP は 200/500ms、CLS は 0.1/0.25 で 3 分類
 */
export async function fetchMetricDistribution(
  db: D1Database,
  metric: 'web.lcp' | 'web.inp' | 'web.cls',
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
    .bind(good, needs, metric, daysAgo(7))
    .all<MetricDistribution>()
  return res.results ?? []
}

/** Lab / mode 別のアクセス数（直近 7 日） */
export async function fetchLabUsage(db: D1Database): Promise<LabUsage[]> {
  const res = await db
    .prepare(
      `SELECT COALESCE(lab_id, '(site)') AS lab_id, mode, COUNT(*) AS count
       FROM rum_events
       WHERE created_at >= ?
       GROUP BY lab_id, mode
       ORDER BY count DESC`,
    )
    .bind(daysAgo(7))
    .all<LabUsage>()
  return res.results ?? []
}

/** ブラウザ別シェア（直近 7 日） */
export async function fetchBrowserShare(db: D1Database): Promise<BrowserShare[]> {
  const res = await db
    .prepare(
      `SELECT browser, COUNT(*) AS count
       FROM rum_events
       WHERE created_at >= ?
       GROUP BY browser
       ORDER BY count DESC`,
    )
    .bind(daysAgo(7))
    .all<BrowserShare>()
  return res.results ?? []
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
