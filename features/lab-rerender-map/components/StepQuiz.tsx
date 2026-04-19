/**
 * Lab 3 のステップクイズ。lab_id='rerender-map' 固定。
 * 共通化はせず feature ローカル実装で独立性を維持する（Lab 1 / 2 と同方針）。
 */

'use client'

import { ArrowClockwise, CheckCircle, XCircle } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRumCustomMetric } from '@/features/rum'
import { cn } from '@/lib/utils'
import type { Quiz } from '../tutorial/quizzes'

type StepQuizProps = {
  quiz: Quiz
}

export function StepQuiz({ quiz }: StepQuizProps) {
  const { stepId } = quiz
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const emit = useRumCustomMetric()

  // biome-ignore lint/correctness/useExhaustiveDependencies: stepId 変化でリセット
  useEffect(() => {
    setSelectedId(null)
    setDismissed(false)
    setAttempts(0)
  }, [stepId])

  if (dismissed) {
    return (
      <div className="flex items-center justify-between border border-dashed border-rule-dim bg-card/60 p-4 text-xs text-ink-400">
        <span>理解度チェックはスキップしました</span>
        <button
          type="button"
          onClick={() => setDismissed(false)}
          className="cursor-pointer text-[11px] uppercase tracking-[0.18em] text-ink-500 hover:text-ink-900"
        >
          もう一度挑戦
        </button>
      </div>
    )
  }

  const isAnswered = selectedId !== null
  const isCorrect = isAnswered && selectedId === quiz.correctId
  const selected = isAnswered ? quiz.options.find((o) => o.id === selectedId) : null

  const pick = (id: string) => {
    if (isAnswered) return
    setSelectedId(id)
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    emit({
      metric_name: 'lab.tutorial.quiz_result',
      metric_value: id === quiz.correctId ? 1 : 0,
      lab_id: 'rerender-map',
      metadata: {
        step_id: quiz.stepId,
        option_id: id,
        correct: id === quiz.correctId,
        attempts: nextAttempts,
      },
    })
  }

  const retry = () => setSelectedId(null)

  return (
    <section
      aria-labelledby={`quiz-${quiz.stepId}`}
      className="flex flex-col gap-3 border border-rule-dim bg-card p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3
            id={`quiz-${quiz.stepId}`}
            className="text-[11px] uppercase tracking-[0.24em] text-vermilion"
          >
            § 理解度チェック
          </h3>
          <p className="mt-2 font-mincho text-base leading-relaxed text-ink-900">{quiz.question}</p>
        </div>
        {!isAnswered && (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="cursor-pointer text-[11px] uppercase tracking-[0.18em] text-ink-400 hover:text-ink-900"
          >
            あとで
          </button>
        )}
      </div>

      <ul className="flex flex-col gap-2">
        {quiz.options.map((opt) => {
          const isSelected = selectedId === opt.id
          const showAsCorrect = isAnswered && opt.id === quiz.correctId
          const showAsWrong = isAnswered && isSelected && opt.id !== quiz.correctId
          return (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => pick(opt.id)}
                disabled={isAnswered}
                className={cn(
                  'flex w-full items-start gap-3 border px-3 py-2.5 text-left text-sm transition-colors',
                  !isAnswered && 'cursor-pointer hover:border-ink-500 hover:text-ink-900',
                  !isAnswered && 'border-rule-dim text-ink-500',
                  showAsCorrect && 'border-emerald-500/70 bg-emerald-500/10 text-emerald-100',
                  showAsWrong && 'border-vermilion/70 bg-vermilion/10 text-vermilion',
                  isAnswered &&
                    !showAsCorrect &&
                    !showAsWrong &&
                    'cursor-not-allowed border-rule-dim/60 text-ink-300 opacity-60',
                )}
              >
                <span
                  aria-hidden
                  className="tnum mt-0.5 shrink-0 text-[11px] uppercase tracking-[0.18em] text-ink-400"
                >
                  {opt.id.toUpperCase()}
                </span>
                <span className="flex-1">{opt.text}</span>
                {showAsCorrect && (
                  <CheckCircle size={16} weight="duotone" className="shrink-0 mt-0.5" />
                )}
                {showAsWrong && <XCircle size={16} weight="duotone" className="shrink-0 mt-0.5" />}
              </button>
            </li>
          )
        })}
      </ul>

      {isAnswered && (
        <div
          className={cn(
            'flex flex-col gap-3 border-l-2 px-3 py-3 text-sm leading-relaxed',
            isCorrect
              ? 'border-emerald-500/60 bg-emerald-500/5 text-ink-900'
              : 'border-vermilion/60 bg-vermilion/5 text-ink-900',
          )}
        >
          {isCorrect ? (
            <>
              <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-300">正解</div>
              <p>{quiz.explanation}</p>
            </>
          ) : (
            <>
              <div className="text-[11px] uppercase tracking-[0.24em] text-vermilion">
                もう一度見てみましょう
              </div>
              <p>{selected?.hint ?? 'もう一度、画面のメトリクスを観察してみてください。'}</p>
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={retry}>
                  <ArrowClockwise size={14} weight="bold" className="mr-2" />
                  もう一度
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}
