/**
 * Recharts ラッパー。Client Component 必須（SVG を React 内で扱うため）。
 * ダッシュボードの可視化を最小限のインターフェースでまとめる。
 */

'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const AXIS_CLASS = 'text-[11px]'
const PIE_COLORS = ['#dd4b39', '#e8b34c', '#4f9d69', '#4a6fa5', '#7a5ba9']

type DailySeries = { day: string; count: number }[]

export function DailyLineChart({ data }: { data: DailySeries }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-rule-dim)" strokeDasharray="3 3" />
        <XAxis dataKey="day" tick={{ fill: 'currentColor' }} className={AXIS_CLASS} />
        <YAxis tick={{ fill: 'currentColor' }} className={AXIS_CLASS} width={32} />
        <Tooltip
          contentStyle={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-rule-normal)',
            fontSize: 12,
          }}
        />
        <Line type="monotone" dataKey="count" stroke="#dd4b39" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

type BucketBarProps = {
  data: { bucket: string; count: number }[]
}

export function MetricBucketBar({ data }: BucketBarProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-rule-dim)" strokeDasharray="3 3" />
        <XAxis dataKey="bucket" tick={{ fill: 'currentColor' }} className={AXIS_CLASS} />
        <YAxis tick={{ fill: 'currentColor' }} className={AXIS_CLASS} width={32} />
        <Tooltip
          contentStyle={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-rule-normal)',
            fontSize: 12,
          }}
        />
        <Bar dataKey="count">
          {data.map((entry) => (
            <Cell
              key={entry.bucket}
              fill={
                entry.bucket === 'good'
                  ? '#4f9d69'
                  : entry.bucket === 'needs-improvement'
                    ? '#e8b34c'
                    : '#dd4b39'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

type SharePieProps = {
  data: { name: string; value: number }[]
}

export function SharePie({ data }: SharePieProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-rule-normal)',
            fontSize: 12,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
