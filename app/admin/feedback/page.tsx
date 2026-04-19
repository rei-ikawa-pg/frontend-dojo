/**
 * /admin/feedback — フィードバック管理ダッシュボード。
 *
 * 認可・期間切替は /admin/rum と同じ仕組み（requireAdminContext + RangeSelector）。
 *
 * 画面項目:
 *   §00 サマリカード: 総数 / Good / Bad / Good 率
 *   §01 ページ別レーティング（上位 20 ページ、good/bad 並列バー）
 *   §02 Lab 別レーティング
 *   §03 コメント一覧（新しい順、最大 100 件、user_agent は非表示）
 */

import type { Metadata } from 'next'
import {
  CommentList,
  fetchFeedbackByLab,
  fetchFeedbackByPage,
  fetchFeedbackComments,
  fetchFeedbackSummary,
  MetricGuide,
  parseRange,
  RangeSelector,
  rangeLabel,
  rangeToDays,
  StatCard,
} from '@/features/admin-dashboard'
import { requireAdminContext } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'フィードバック',
}

type PageProps = {
  searchParams: Promise<{ range?: string }>
}

export default async function AdminFeedbackPage({ searchParams }: PageProps) {
  const { range: rangeParam } = await searchParams
  const { env } = await requireAdminContext()
  const range = parseRange(rangeParam)
  const days = rangeToDays(range)
  const periodLabel = rangeLabel(range)

  const db = env.DB
  const [summary, byPage, byLab, comments] = await Promise.all([
    fetchFeedbackSummary(db, days),
    fetchFeedbackByPage(db, days),
    fetchFeedbackByLab(db, days),
    fetchFeedbackComments(db, days),
  ])

  const goodRate = summary.total > 0 ? Math.round((summary.good / summary.total) * 100) : 0

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-ink-400">
            § Admin / Feedback
          </p>
          <h1 className="font-mincho text-3xl tracking-tight text-ink-900 md:text-4xl">
            フィードバック
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            {periodLabel}に投稿された Good / Bad とコメント。
          </p>
        </div>
        <RangeSelector />
      </header>

      {/* §00 サマリ */}
      <section aria-label="サマリ" className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label={`総数 (${range})`} value={summary.total.toLocaleString()} />
        <StatCard label="Good" value={summary.good.toLocaleString()} sub="ポジティブな評価" />
        <StatCard label="Bad" value={summary.bad.toLocaleString()} sub="改善要望のシグナル" />
        <StatCard label="Good 率" value={`${goodRate}%`} sub="≥ 80% が目安" />
      </section>

      {/* §01 ページ別 */}
      <section aria-labelledby="by-page" className="mb-12">
        <h2 id="by-page" className="mb-3 text-[11px] uppercase tracking-[0.24em] text-ink-400">
          § 01 — By Page ({range})
        </h2>
        <MetricGuide>
          <p>ページ単位の good / bad 内訳。件数降順の上位 20 ページ。</p>
          <p>
            bad が集中しているページが改善の最優先。逆に good が多いページは成功事例として要因分析。
          </p>
        </MetricGuide>
        <RatingTable
          rows={byPage.map((r) => ({ label: r.page_path, good: r.good, bad: r.bad }))}
          labelHeader="page_path"
          empty="ページ別データはまだありません"
        />
      </section>

      {/* §02 Lab 別 */}
      <section aria-labelledby="by-lab" className="mb-12">
        <h2 id="by-lab" className="mb-3 text-[11px] uppercase tracking-[0.24em] text-ink-400">
          § 02 — By Lab ({range})
        </h2>
        <MetricGuide>
          <p>
            Lab 単位の good / bad。`(site)` は Lab 外（ランディングや about 等）のフィードバック。
          </p>
        </MetricGuide>
        <RatingTable
          rows={byLab.map((r) => ({ label: r.lab_id, good: r.good, bad: r.bad }))}
          labelHeader="lab_id"
          empty="Lab 別データはまだありません"
        />
      </section>

      {/* §03 コメント一覧 */}
      <section aria-labelledby="comments">
        <h2 id="comments" className="mb-3 text-[11px] uppercase tracking-[0.24em] text-ink-400">
          § 03 — Comments ({range})
        </h2>
        <MetricGuide>
          <p>
            コメント付きフィードバックを新しい順に最大 100 件。UA は生文字列では保存せず、ブラウザ /
            OS / デバイス種別のラベルのみ記録しています。
          </p>
        </MetricGuide>
        <CommentList rows={comments} />
      </section>
    </>
  )
}

type RatingRow = { label: string; good: number; bad: number }

function RatingTable({
  rows,
  labelHeader,
  empty,
}: {
  rows: RatingRow[]
  labelHeader: string
  empty: string
}) {
  if (rows.length === 0) {
    return (
      <div className="border border-rule-dim bg-card p-6 text-center text-xs text-ink-400">
        {empty}
      </div>
    )
  }

  // バー描画の基準（最大件数）を揃える
  const max = rows.reduce((acc, r) => Math.max(acc, r.good + r.bad), 1)

  return (
    <div className="overflow-x-auto border border-rule-dim bg-card">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-rule-dim text-[11px] uppercase tracking-[0.18em] text-ink-400">
            <th className="px-3 py-2 text-left">{labelHeader}</th>
            <th className="px-3 py-2 text-right tnum">good</th>
            <th className="px-3 py-2 text-right tnum">bad</th>
            <th className="px-3 py-2 text-left">ratio</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const total = row.good + row.bad
            const goodPct = total > 0 ? (row.good / max) * 100 : 0
            const badPct = total > 0 ? (row.bad / max) * 100 : 0
            return (
              <tr key={row.label} className="border-b border-rule-dim last:border-b-0 text-ink-500">
                <td className="px-3 py-2 font-mono">{row.label}</td>
                <td className="px-3 py-2 text-right tnum text-[color:rgb(79_157_105)]">
                  {row.good}
                </td>
                <td className="px-3 py-2 text-right tnum text-[color:rgb(221_75_57)]">{row.bad}</td>
                <td className="w-1/2 px-3 py-2">
                  <div className="flex h-2 w-full overflow-hidden bg-card/40">
                    <div
                      className="bg-[color:rgb(79_157_105)]"
                      style={{ width: `${goodPct}%` }}
                      aria-hidden
                    />
                    <div
                      className="bg-[color:rgb(221_75_57)]"
                      style={{ width: `${badPct}%` }}
                      aria-hidden
                    />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
