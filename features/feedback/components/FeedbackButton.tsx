/**
 * Lab 末尾に置くフィードバック入力ウィジェット。
 *
 * 仕様:
 *   - 2 択 (Good / Bad) をクリック → 任意のコメント欄を展開
 *   - コメントはスキップ可（Good/Bad クリック直後でも送信ボタンで確定）
 *   - 送信成功/失敗は sonner トーストで通知
 *   - pathname と匿名 session_id を添える（サーバ側で同一セッション分析に使う）
 */

'use client'

import { ThumbsDown, ThumbsUp } from '@phosphor-icons/react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { FeedbackInput } from '@/features/feedback/schema'
import { getOrCreateSessionId } from '@/features/rum'
import { cn } from '@/lib/utils'

type State = 'idle' | 'selected' | 'submitting' | 'submitted'

/** pathname から Lab の slug を推測（例: /lab/render/tutorial → render） */
function deriveLabId(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean)
  if (parts[0] !== 'lab') return null
  return parts[1] ?? null
}

export function FeedbackButton() {
  const pathname = usePathname()
  const [state, setState] = useState<State>('idle')
  const [rating, setRating] = useState<'good' | 'bad' | null>(null)
  const [comment, setComment] = useState('')

  const selectRating = (next: 'good' | 'bad') => {
    if (state === 'submitting' || state === 'submitted') return
    setRating(next)
    setState('selected')
  }

  const submit = async () => {
    if (!rating || state === 'submitting') return
    setState('submitting')
    try {
      const payload: FeedbackInput = {
        rating,
        comment: comment.trim() || undefined,
        page_path: pathname,
        lab_id: deriveLabId(pathname),
        session_id: getOrCreateSessionId(),
      }
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setState('submitted')
      toast.success('フィードバックありがとうございました')
    } catch (err) {
      console.error('feedback failed', err)
      setState('selected')
      toast.error('送信に失敗しました。しばらくしてから再度お試しください。')
    }
  }

  if (state === 'submitted') {
    return (
      <div className="border border-rule-dim bg-card p-6 text-center text-sm text-ink-500">
        送信ありがとうございます。参考にさせていただきます。
      </div>
    )
  }

  return (
    <section
      aria-label="フィードバック"
      className="flex flex-col gap-4 border border-rule-dim bg-card p-6"
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-[11px] uppercase tracking-[0.24em] text-ink-400">§ Feedback</h3>
        <p className="font-mincho text-lg text-ink-900">この稽古場はいかがでしたか？</p>
      </div>

      <div className="flex gap-2">
        <RatingButton
          icon={<ThumbsUp size={16} weight="duotone" />}
          label="役立った"
          active={rating === 'good'}
          onClick={() => selectRating('good')}
        />
        <RatingButton
          icon={<ThumbsDown size={16} weight="duotone" />}
          label="改善してほしい"
          active={rating === 'bad'}
          onClick={() => selectRating('bad')}
        />
      </div>

      {rating !== null && (
        <div className="flex flex-col gap-3">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="任意: 一言コメント（最大 200 字、スキップ可）"
            maxLength={200}
            rows={3}
            aria-label="コメント"
          />
          <div className="flex items-center justify-between text-[11px] text-ink-400">
            <span>{comment.length} / 200</span>
            <Button type="button" size="sm" onClick={submit} disabled={state === 'submitting'}>
              {state === 'submitting' ? '送信中…' : '送信する'}
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}

type RatingButtonProps = {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}

function RatingButton({ icon, label, active, onClick }: RatingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 border px-4 py-2 text-sm transition-colors',
        active
          ? 'border-vermilion bg-vermilion/10 text-vermilion'
          : 'border-rule-dim text-ink-500 hover:border-ink-500 hover:bg-ink-100 hover:text-ink-900',
      )}
    >
      {icon}
      {label}
    </button>
  )
}
