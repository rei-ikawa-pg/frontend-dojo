/**
 * フィードバックのコメント一覧（テーブル表示）。
 *
 * - comment が空でないレコードのみを受け取る前提
 * - UA は生文字列では保存せず、別列 (browser / os / device_type) に分類済みラベルとして保持。
 *   それらはデバッグ用で画面には表示しない。
 */

import type { FeedbackComment } from '../queries/feedbackQueries'

type CommentListProps = {
  rows: FeedbackComment[]
}

export function CommentList({ rows }: CommentListProps) {
  if (rows.length === 0) {
    return (
      <div className="border border-rule-dim bg-card p-6 text-center text-xs text-ink-400">
        コメント付きのフィードバックはまだありません
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-rule-dim bg-card">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-rule-dim text-[11px] uppercase tracking-[0.18em] text-ink-400">
            <th className="px-3 py-2 text-left">created_at</th>
            <th className="px-3 py-2 text-left">rating</th>
            <th className="px-3 py-2 text-left">path</th>
            <th className="px-3 py-2 text-left">lab</th>
            <th className="px-3 py-2 text-left">comment</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-rule-dim last:border-b-0 align-top text-ink-500"
            >
              <td className="whitespace-nowrap px-3 py-2 font-mono">{row.created_at}</td>
              <td className="px-3 py-2">
                <span
                  className={`tnum rounded px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] ${
                    row.rating === 'good'
                      ? 'bg-[color:rgb(79_157_105_/_0.15)] text-[color:rgb(79_157_105)]'
                      : 'bg-[color:rgb(221_75_57_/_0.15)] text-[color:rgb(221_75_57)]'
                  }`}
                >
                  {row.rating}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-2 font-mono">{row.page_path}</td>
              <td className="whitespace-nowrap px-3 py-2">{row.lab_id ?? '—'}</td>
              <td className="px-3 py-2 text-ink-700 whitespace-pre-wrap">{row.comment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
