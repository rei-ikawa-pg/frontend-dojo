/**
 * /admin/rum — RUM 管理ダッシュボード。
 *
 * 認可:
 *   - `requireAdminContext` で `?token=XXX` を ADMIN_TOKEN と照合（不一致は 404 相当）
 *   - 将来は Cloudflare Access に移行予定（docs/05 §5.1）
 *
 * 集計期間:
 *   - URL `?range=7d|30d|90d`（既定 30d）。セレクタで切替すると全セクションが連動
 *
 * セクション構成:
 *   §00 サマリカード（PV / UU / LCP/INP/CLS Good 率）
 *   §01 デイリー PV / UU
 *   §02 Core Web Vitals 分布
 *   §03 ブラウザシェア
 *   §04 Lab / mode 別アクセス
 *   §05 Lab 1 — 描画メトリクス（FPS 分布 + LoAF）
 *   §06 Recent Events（生ログ）
 */

import type { Metadata } from 'next'
import {
  DailyLineChart,
  fetchBrowserShare,
  fetchDailyPageviews,
  fetchDailyUniqueUsers,
  fetchFpsDistribution,
  fetchFpsSummary,
  fetchLabUsage,
  fetchLoafSummary,
  fetchMetricDistribution,
  fetchRecentEvents,
  fetchTotalPageviews,
  fetchTotalUniqueUsers,
  MetricBucketBar,
  MetricGuide,
  parseRange,
  RangeSelector,
  rangeLabel,
  rangeToDays,
  SharePie,
  StatCard,
} from '@/features/admin-dashboard'
import { requireAdminContext } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'RUM',
}

type PageProps = {
  searchParams: Promise<{ token?: string; range?: string }>
}

// FPS の良し悪しは CWV と異なる閾値なので独自のパレットを用意
const FPS_COLORS: Record<string, string> = {
  '< 30': '#dd4b39',
  '30-50': '#e8b34c',
  '50-60': '#4f9d69',
  '60+': '#4f9d69',
}

export default async function AdminRumPage({ searchParams }: PageProps) {
  const { token, range: rangeParam } = await searchParams
  const { env } = await requireAdminContext(token)
  const range = parseRange(rangeParam)
  const days = rangeToDays(range)
  const periodLabel = rangeLabel(range)

  const db = env.DB
  const [
    totalPv,
    totalUu,
    pv,
    uu,
    lcp,
    inp,
    cls,
    usage,
    browsers,
    fpsDist,
    fpsSummary,
    loafSummary,
    recent,
  ] = await Promise.all([
    fetchTotalPageviews(db, days),
    fetchTotalUniqueUsers(db, days),
    fetchDailyPageviews(db, days),
    fetchDailyUniqueUsers(db, days),
    fetchMetricDistribution(db, 'web.lcp', days),
    fetchMetricDistribution(db, 'web.inp', days),
    fetchMetricDistribution(db, 'web.cls', days),
    fetchLabUsage(db, days),
    fetchBrowserShare(db, days),
    fetchFpsDistribution(db, days),
    fetchFpsSummary(db, days),
    fetchLoafSummary(db, days),
    fetchRecentEvents(db),
  ])

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-ink-400">§ Admin / RUM</p>
          <h1 className="font-mincho text-3xl tracking-tight text-ink-900 md:text-4xl">
            RUM ダッシュボード
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            {periodLabel}の計測値を集計。ページリロードで最新化されます。
          </p>
        </div>
        <RangeSelector />
      </header>

      {/* §00 サマリ */}
      <section aria-label="サマリ" className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard
          label={`PV (${range})`}
          value={totalPv.toLocaleString()}
          sub="web.lcp の発生件数 ≒ ページロード数"
        />
        <StatCard
          label={`UU (${range})`}
          value={totalUu.toLocaleString()}
          sub="同じセッションなら 1 カウント（タブを閉じると別扱い）"
        />
        <StatCard label="LCP Good%" value={`${percent(lcp, 'good')}%`} sub="≤ 2.5s" />
        <StatCard label="INP Good%" value={`${percent(inp, 'good')}%`} sub="≤ 200ms" />
        <StatCard label="CLS Good%" value={`${percent(cls, 'good')}%`} sub="≤ 0.1" />
      </section>

      {/* §01 PV / UU 推移 */}
      <section aria-labelledby="chart-pv" className="mb-12">
        <h2 id="chart-pv" className="mb-3 text-[11px] uppercase tracking-[0.24em] text-ink-400">
          § 01 — Daily Pageviews / Unique Users
        </h2>
        <MetricGuide>
          <p>
            折れ線が右肩上がりなら流入が増えている。UU が急増した日は外部からの導線が効いた可能性。
          </p>
          <p>
            PV / UU の比が高いほど 1
            人あたりの回遊が多い（複数ページ見られている）。比が極端に低い日はボット疑惑。
          </p>
        </MetricGuide>
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

      {/* §02 Core Web Vitals 分布 */}
      <section aria-labelledby="chart-cwv" className="mb-12">
        <h2 id="chart-cwv" className="mb-3 text-[11px] uppercase tracking-[0.24em] text-ink-400">
          § 02 — Core Web Vitals Distribution ({range})
        </h2>
        <MetricGuide>
          <p>
            <strong className="text-ink-700">LCP</strong>: ページが表示された実感までの時間。 ≤ 2.5s
            = Good / ≤ 4s = Needs / それ以上 =
            Poor。遅いなら画像最適化・SSR/SSG・フォントの優先度を疑う。
          </p>
          <p>
            <strong className="text-ink-700">INP</strong>: 操作に対する応答の遅さ。 ≤ 200ms =
            Good。Poor が目立つなら重い JS・長い Task をスキャン。
          </p>
          <p>
            <strong className="text-ink-700">CLS</strong>: レイアウトのガタつき。 ≤ 0.1 = Good。画像
            / 広告 / フォントの読み込み時に高さ予約が無いと悪化。
          </p>
          <p>
            各バーの「good」割合が 75% を超えれば健全。poor
            が積み上がっているなら該当ページの特定が必要。
          </p>
        </MetricGuide>
        <div className="grid gap-6 border border-rule-dim bg-card p-5 md:grid-cols-3">
          <CwvCard title="LCP" data={lcp} />
          <CwvCard title="INP" data={inp} />
          <CwvCard title="CLS" data={cls} />
        </div>
      </section>

      {/* §03 / §04 */}
      <section aria-labelledby="chart-browser" className="mb-12 grid gap-6 md:grid-cols-2">
        <div>
          <h2
            id="chart-browser"
            className="mb-3 text-[11px] uppercase tracking-[0.24em] text-ink-400"
          >
            § 03 — Browser Share ({range})
          </h2>
          <MetricGuide>
            <p>
              想定は Chromium 優勢。Safari / Firefox が極端に少ないのは LoAF
              非対応の計測対象外ブラウザなので妥当。
            </p>
            <p>Other が目立つ場合はボットや希少ブラウザが混じっている可能性。</p>
          </MetricGuide>
          <div className="border border-rule-dim bg-card p-5">
            <SharePie data={browsers.map((b) => ({ name: b.browser, value: b.count }))} />
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-[11px] uppercase tracking-[0.24em] text-ink-400">
            § 04 — Lab Usage ({range})
          </h2>
          <MetricGuide>
            <p>
              `{'{lab_id} / {mode}'}` ごとのイベント件数。tutorial / playground / overview
              の比率で学習段階が読める。
            </p>
            <p>`(site)` は Lab 外（ランディング等）のイベント。</p>
          </MetricGuide>
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

      {/* §05 Lab 1 描画メトリクス */}
      <section aria-labelledby="chart-render" className="mb-12">
        <h2 id="chart-render" className="mb-3 text-[11px] uppercase tracking-[0.24em] text-ink-400">
          § 05 — Lab 1 Render Metrics ({range})
        </h2>
        <MetricGuide>
          <p>
            <strong className="text-ink-700">FPS 分布</strong>: 60+ が支配的なら健全。30
            未満が目立つ帯は Playground の設定（要素数・重いプロパティ）でユーザーが体感できた証。
          </p>
          <p>
            <strong className="text-ink-700">LoAF</strong>: 50ms
            超の長いフレームの発生回数と平均。Chromium のみで計測可能。件数が 0
            なら現状問題なし、増えているなら Playground
            の負荷が実ユーザー環境でも発生している可能性。
          </p>
        </MetricGuide>
        <div className="grid gap-6 border border-rule-dim bg-card p-5 md:grid-cols-2">
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="font-mincho text-base text-ink-900">FPS Distribution</h3>
              <span className="tnum text-[11px] text-ink-400">
                {fpsSummary.count.toLocaleString()} サンプル
              </span>
            </div>
            {fpsSummary.count > 0 ? (
              <>
                <MetricBucketBar data={fpsDist} colorMap={FPS_COLORS} />
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-ink-500">
                  <Stat label="平均 FPS" value={formatNumber(fpsSummary.avg, 1)} />
                  <Stat label="最低 FPS" value={formatNumber(fpsSummary.min, 0)} />
                </div>
              </>
            ) : (
              <EmptyHint>
                まだ `lab.render.fps` のサンプルがありません。Playground を実行すると記録されます。
              </EmptyHint>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="font-mincho text-base text-ink-900">LoAF Summary</h3>
              <span className="tnum text-[11px] text-ink-400">
                {loafSummary.count.toLocaleString()} フレーム
              </span>
            </div>
            {loafSummary.count > 0 ? (
              <div className="grid grid-cols-2 gap-3 text-xs text-ink-500">
                <Stat label="発生回数" value={loafSummary.count.toLocaleString()} />
                <Stat label="平均 duration" value={`${formatNumber(loafSummary.avg, 1)} ms`} />
                <Stat label="最長 duration" value={`${formatNumber(loafSummary.max, 1)} ms`} />
                <Stat label="対応ブラウザ" value="Chromium のみ" />
              </div>
            ) : (
              <EmptyHint>
                LoAF エントリがまだありません。Chromium で重い描画を起こすと記録されます。
              </EmptyHint>
            )}
          </div>
        </div>
      </section>

      {/* §06 Recent Events */}
      <section aria-labelledby="recent-events">
        <h2
          id="recent-events"
          className="mb-3 text-[11px] uppercase tracking-[0.24em] text-ink-400"
        >
          § 06 — Recent Events
        </h2>
        <MetricGuide>
          <p>最新 20 件の生イベント。デバッグ用途で、異常値が入っていないか一次確認する場所。</p>
        </MetricGuide>
        <div className="overflow-x-auto border border-rule-dim bg-card">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-rule-dim text-[11px] uppercase tracking-[0.18em] text-ink-400">
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
    </>
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

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-rule-dim bg-card/60 p-3">
      <div className="text-[10px] uppercase tracking-[0.2em] text-ink-400">{label}</div>
      <div className="mt-1 tnum font-mincho text-lg text-ink-900">{value}</div>
    </div>
  )
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-dashed border-rule-dim bg-card/40 p-4 text-xs text-ink-400">
      {children}
    </div>
  )
}

/** good / needs-improvement / poor のいずれかの割合（％）を返す */
function percent(
  distribution: { bucket: string; count: number }[],
  bucket: 'good' | 'needs-improvement' | 'poor',
): number {
  const total = distribution.reduce((acc, d) => acc + d.count, 0)
  if (total === 0) return 0
  const target = distribution.find((d) => d.bucket === bucket)?.count ?? 0
  return Math.round((target / total) * 100)
}

function formatNumber(value: number | null, digits: number): string {
  if (value == null) return '—'
  return value.toFixed(digits)
}
