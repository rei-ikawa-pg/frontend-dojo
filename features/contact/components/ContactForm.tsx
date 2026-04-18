/**
 * サイト内お問い合わせフォーム。
 *
 * 仕様:
 *   - カテゴリ（提案 / バグ / コンテンツ / その他）・本文必須、メール任意
 *   - honeypot フィールド (`website`) を視覚非表示で仕込む
 *   - 匿名 session_id を添付（同一セッション分析用）
 *   - 成功 / 失敗は sonner トーストで通知
 */

'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  CONTACT_BODY_MAX,
  CONTACT_CATEGORIES,
  CONTACT_CATEGORY_LABELS,
  type ContactCategory,
  type ContactInput,
} from '@/features/contact/schema'
import { getOrCreateSessionId } from '@/features/rum'
import { cn } from '@/lib/utils'

type State = 'idle' | 'submitting' | 'submitted'

export function ContactForm() {
  const pathname = usePathname()
  const [category, setCategory] = useState<ContactCategory>('suggestion')
  const [body, setBody] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [state, setState] = useState<State>('idle')

  const trimmedBody = body.trim()
  const canSubmit = trimmedBody.length > 0 && state === 'idle'

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSubmit) return
    setState('submitting')
    try {
      const payload: ContactInput = {
        category,
        body: trimmedBody,
        email: email.trim() || undefined,
        page_path: pathname,
        session_id: getOrCreateSessionId(),
        website: website || undefined,
      }
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setState('submitted')
      toast.success('お問い合わせを送信しました。ありがとうございます。')
    } catch (err) {
      console.error('contact failed', err)
      setState('idle')
      toast.error('送信に失敗しました。しばらくしてから再度お試しください。')
    }
  }

  if (state === 'submitted') {
    return (
      <div className="border border-rule-dim bg-card p-8 text-center">
        <p className="font-mincho text-lg text-ink-900">送信ありがとうございます。</p>
        <p className="mt-2 text-sm text-ink-500">
          内容を確認のうえ、必要に応じてご連絡いたします（ベストエフォート）。
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-6 border border-rule-dim bg-card p-6 md:p-8"
      aria-label="お問い合わせフォーム"
    >
      <fieldset className="flex flex-col gap-3">
        <legend className="text-[11px] uppercase tracking-[0.24em] text-ink-400">§ Category</legend>
        <div className="flex flex-wrap gap-2">
          {CONTACT_CATEGORIES.map((c) => (
            <CategoryButton
              key={c}
              label={CONTACT_CATEGORY_LABELS[c]}
              active={category === c}
              onClick={() => setCategory(c)}
            />
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="contact-body"
          className="text-[11px] uppercase tracking-[0.24em] text-ink-400"
        >
          § Body (必須)
        </label>
        <Textarea
          id="contact-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="ご意見・ご要望・バグ報告などをご記入ください（最大 2000 字）"
          maxLength={CONTACT_BODY_MAX}
          rows={8}
          required
          className="min-h-40"
        />
        <div className="text-right text-[11px] text-ink-400">
          {body.length} / {CONTACT_BODY_MAX}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="contact-email"
          className="text-[11px] uppercase tracking-[0.24em] text-ink-400"
        >
          § Email (任意)
        </label>
        <Input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@example.com"
          autoComplete="email"
          inputMode="email"
          className="h-10 text-sm"
        />
        <p className="text-[11px] text-ink-400">
          返信を希望される場合のみご記入ください。未入力でも送信できます。
        </p>
      </div>

      {/* honeypot: 視覚・支援技術の双方から隠す。bot は埋めがち */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website (do not fill)</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-end">
        <Button type="submit" size="lg" disabled={!canSubmit}>
          {state === 'submitting' ? '送信中…' : '送信する'}
        </Button>
      </div>
    </form>
  )
}

type CategoryButtonProps = {
  label: string
  active: boolean
  onClick: () => void
}

function CategoryButton({ label, active, onClick }: CategoryButtonProps) {
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
      {label}
    </button>
  )
}
