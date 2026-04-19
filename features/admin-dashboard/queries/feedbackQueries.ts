/**
 * /admin/feedback で用いる集計クエリ群。
 * D1 の feedback テーブルを SELECT するだけで、書き込みは行わない。
 *
 * 個人特定性のある `user_agent` 列は画面表示しないため、このクエリ層からも返さない。
 */

export type FeedbackSummary = { total: number; good: number; bad: number }
export type FeedbackByPage = { page_path: string; good: number; bad: number }
export type FeedbackByLab = { lab_id: string; good: number; bad: number }
export type FeedbackComment = {
  id: number
  created_at: string
  page_path: string
  lab_id: string | null
  rating: 'good' | 'bad'
  comment: string
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

/** 期間内の総件数と good/bad の内訳 */
export async function fetchFeedbackSummary(db: D1Database, days: number): Promise<FeedbackSummary> {
  const res = await db
    .prepare(
      `SELECT
         SUM(CASE WHEN rating = 'good' THEN 1 ELSE 0 END) AS good,
         SUM(CASE WHEN rating = 'bad' THEN 1 ELSE 0 END) AS bad,
         COUNT(*) AS total
       FROM feedback
       WHERE created_at >= ?`,
    )
    .bind(daysAgo(days))
    .first<{ good: number | null; bad: number | null; total: number }>()
  return {
    total: res?.total ?? 0,
    good: res?.good ?? 0,
    bad: res?.bad ?? 0,
  }
}

/** ページ別 good/bad 内訳（上位 20 ページ） */
export async function fetchFeedbackByPage(db: D1Database, days: number): Promise<FeedbackByPage[]> {
  const res = await db
    .prepare(
      `SELECT
         page_path,
         SUM(CASE WHEN rating = 'good' THEN 1 ELSE 0 END) AS good,
         SUM(CASE WHEN rating = 'bad' THEN 1 ELSE 0 END) AS bad
       FROM feedback
       WHERE created_at >= ?
       GROUP BY page_path
       ORDER BY (good + bad) DESC
       LIMIT 20`,
    )
    .bind(daysAgo(days))
    .all<FeedbackByPage>()
  return res.results ?? []
}

/** Lab 別 good/bad 内訳 */
export async function fetchFeedbackByLab(db: D1Database, days: number): Promise<FeedbackByLab[]> {
  const res = await db
    .prepare(
      `SELECT
         COALESCE(lab_id, '(site)') AS lab_id,
         SUM(CASE WHEN rating = 'good' THEN 1 ELSE 0 END) AS good,
         SUM(CASE WHEN rating = 'bad' THEN 1 ELSE 0 END) AS bad
       FROM feedback
       WHERE created_at >= ?
       GROUP BY lab_id
       ORDER BY (good + bad) DESC`,
    )
    .bind(daysAgo(days))
    .all<FeedbackByLab>()
  return res.results ?? []
}

/** コメント付きフィードバックの新しい順リスト（最大 100 件） */
export async function fetchFeedbackComments(
  db: D1Database,
  days: number,
): Promise<FeedbackComment[]> {
  const res = await db
    .prepare(
      `SELECT id, created_at, page_path, lab_id, rating, comment
       FROM feedback
       WHERE created_at >= ?
         AND comment IS NOT NULL
         AND TRIM(comment) != ''
       ORDER BY created_at DESC
       LIMIT 100`,
    )
    .bind(daysAgo(days))
    .all<FeedbackComment>()
  return res.results ?? []
}
