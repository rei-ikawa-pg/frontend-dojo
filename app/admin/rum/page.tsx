/**
 * /admin/rum — RUM 管理ダッシュボード。
 *
 * 認可:
 *   - クエリ ?token=XXX を環境変数 ADMIN_TOKEN と照合、不一致は 404 相当（notFound）
 *   - 将来は Cloudflare Access に移行予定（docs/05 §5.1）
 *
 * 実装:
 *   - Server Component で D1 を直接叩く（Edge Runtime）
 *   - 集計クエリは features/admin-dashboard/queries に集約
 *   - グラフは Recharts（Client Component）
 */

import { getCloudflareContext } from '@opennextjs/cloudflare'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  DailyLineChart,
  MetricBucketBar,
  SharePie,
  StatCard,
  fetchBrowserShare,
  fetchDailyPageviews,
  fetchDailyUniqueUsers,
  fetchLabUsage,
  fetchMetricDistribution,
  fetchRecentEvents,
} from '@/features/admin-dashboard'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'RUM ダッシュボード',
  robots: { index: false, follow: false },
}

type PageProps = {
  searchParams: Promise<{ token?: string }>
}

export default async function AdminRumPage({ searchParams }: PageProps) {
  const { env } = await getCloudflareContext({ async: true })
  const { token } = await searchParams

  // 期待トークンが未設定なら、安全のため常に 404 を返す
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
    notFound()
  }

  const db = env.DB
  const [pv, uu, lcp, inp, cls, usage, browsers, recent] = await Promise.all([
    fetchDailyPageviews(db),
    fetchDailyUniqueUsers(db),
    fetchMetricDistribution(db, 'web.lcp'),
    fetchMetricDistribution(db, 'web.inp'),
    fetchMetricDistribution(db, 'web.cls'),
    fetchLabUsage(db),
    fetchBrowserShare(db),
    fetchRecentEvents(db),
  ])

  const totalPv = pv.reduce((acc, row) => acc + row.count, 0)
  const totalUu = uu.reduce((acc, row) => acc + row.count, 0)

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <header className="mb-10">
        <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-ink-400">§ Admin</p>
        <h1 className="font-mincho text-3xl tracking-tight text-ink-900 md:text-4xl">
          RUM ダッシュボード
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          直近 7 〜 30 日の計測値を集計して表示。ページリロードで最新化されます。
        </p>
      </header>

      <section aria-label="サマリ" className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="PV (30d)" value={totalPv.toLocaleString()} />
        <StatCard label="UU (30d)" value={totalUu.toLocaleString()} />
        <StatCard
          label="LCP Good比率 (7d)"
          value={`${percent(lcp, 'good')}%`}
          sub="≤ 2500 ms"
        />
        <StatCard
          label="INP Good比率 (7d)"
          value={`${percent(inp, 'good')}%`}
          sub="≤ 200 ms"
        />
      </section>

      <section aria-labelledby="chart-pv" className="mb-10">
        <h2 id="chart-pv" className="mb-3 text-[10px] uppercase tracking-[0.24em] text-ink-400">
          § 01 — Daily Pageviews / Unique Users
        </h2>
        <div className="grid gap-6 border border-rule-dim bg-card p-5 md:grid-cols-2">
          <div>
            <div className="mb-2 text-xs text-ink-500">Pageviews</div>
            <DailyLineChart data={pv} />
          </div>
          <div>
            <div className="mb-2 text-xs text-ink-500">Unique Users</div>
            <DailyLineChart data={uu} />
          </div>
        </div>
      </section>

      <section aria-labelledby="chart-cwv" className="mb-10">
        <h2 id="chart-cwv" className="mb-3 text-[10px] uppercase tracking-[0.24em] text-ink-400">
          § 02 — Core Web Vitals Distribution (7d)
        </h2>
        <div className="grid gap-6 border border-rule-dim bg-card p-5 md:grid-cols-3">
          <CwvCard title="LCP" data={lcp} />
          <CwvCard title="INP" data={inp} />
          <CwvCard title="CLS" data={cls} />
        </div>
      </section>

      <section aria-labelledby="chart-browser" className="mb-10 grid gap-6 md:grid-cols-2">
        <div>
          <h2
            id="chart-browser"
            className="mb-3 text-[10px] uppercase tracking-[0.24em] text-ink-400"
          >
            § 03 — Browser Share (7d)
          </h2>
          <div className="border border-rule-dim bg-card p-5">
            <SharePie data={browsers.map((b) => ({ name: b.browser, value: b.count }))} />
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-[10px] uppercase tracking-[0.24em] text-ink-400">
            § 04 — Lab Usage (7d)
          </h2>
          <div className="border border-rule-dim bg-card p-5">
            <MetricBucketBar
              data={usage.map((u) => ({
                bucket: `${u.lab_id} / ${u.mode}`,
                count: u.count,
              }))}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="recent-events">
        <h2 id="recent-events" className="mb-3 text-[10px] uppercase tracking-[0.24em] text-ink-400">
          § 05 — Recent Events
        </h2>
        <div className="overflow-x-auto border border-rule-dim bg-card">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-rule-dim text-[10px] uppercase tracking-[0.18em] text-ink-400">
                <th className="px-3 py-2 text-left">created_at</th>
                <th className="px-3 py-2 text-left">path</th>
                <th className="px-3 py-2 text-left">lab</th>
                <th className="px-3 py-2 text-left">mode</th>
                <th className="px-3 py-2 text-left">browser</th>
                <th className="px-3 py-2 text-left">metric</th>
                <th className="px-3 py-2 text-right tnum">value</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((row) => (
                <tr
                  key={`${row.created_at}-${row.metric_name}-${row.page_path}`}
                  className="border-b border-rule-dim last:border-b-0 text-ink-500"
                >
                  <td className="px-3 py-2 font-mono">{row.created_at}</td>
                  <td className="px-3 py-2 font-mono">{row.page_path}</td>
                  <td className="px-3 py-2">{row.lab_id ?? '—'}</td>
                  <td className="px-3 py-2">{row.mode}</td>
                  <td className="px-3 py-2">{row.browser}</td>
                  <td className="px-3 py-2 font-mono">{row.metric_name}</td>
                  <td className="px-3 py-2 text-right tnum">{row.metric_value.toFixed(2)}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-ink-400">
                    まだ計測データがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function CwvCard({ title, data }: { title: string; data: { bucket: string; count: number }[] }) {
  const total = data.reduce((acc, d) => acc + d.count, 0)
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="font-mincho text-base text-ink-900">{title}</h3>
        <span className="tnum text-[11px] text-ink-400">{total.toLocaleString()} 件</span>
      </div>
      <MetricBucketBar data={data} />
    </div>
  )
}

/** good/needs-improvement/poor のいずれかの割合（％）を返す */
function percent(
  distribution: { bucket: string; count: number }[],
  bucket: 'good' | 'needs-improvement' | 'poor',
): number {
  const total = distribution.reduce((acc, d) => acc + d.count, 0)
  if (total === 0) return 0
  const target = distribution.find((d) => d.bucket === bucket)?.count ?? 0
  return Math.round((target / total) * 100)
}
