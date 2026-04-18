/**
 * チュートリアルモード本体。
 * - URL に step を nuqs で同期（?step=3 で直リンク可能、docs/02 §2.1）
 * - ステップ切替時に playgroundStore の preset を強制適用
 * - 各ステップ滞在時間を RUM に `lab.tutorial.step_duration` として送信
 * - 最終ステップで道場モードへ誘導
 */

'use client'

import { ArrowLeft, ArrowRight, CheckCircle } from '@phosphor-icons/react'
import Link from 'next/link'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useEffect, useMemo, useRef } from 'react'
import { Prose } from '@/components/typography/Prose'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { LAB_RENDER_META, usePlaygroundStore } from '@/features/lab-render'
import { getQuiz } from '@/features/lab-render/tutorial/quizzes'
import { STEP_CONTENTS } from '@/features/lab-render/tutorial/stepContents'
import { getStep, TUTORIAL_STEP_COUNT, TUTORIAL_STEPS } from '@/features/lab-render/tutorial/steps'
import { useRumCustomMetric, useRumSetContext } from '@/features/rum'
import { ComparisonView } from './ComparisonView'
import { MetricsDisplay } from './MetricsDisplay'
import { StepQuiz } from './StepQuiz'
import { VisualizationView } from './VisualizationView'

export function TutorialMode() {
  const [stepIdRaw, setStepIdRaw] = useQueryState(
    'step',
    parseAsInteger.withDefault(1).withOptions({ history: 'push' }),
  )
  // 範囲外の step は 1 として扱う（安全側）
  const stepId = stepIdRaw >= 1 && stepIdRaw <= TUTORIAL_STEP_COUNT ? stepIdRaw : 1
  const step = getStep(stepId)
  const setContext = useRumSetContext()
  const emit = useRumCustomMetric()
  const setElementCount = usePlaygroundStore((s) => s.setElementCount)
  const setEnabledProps = usePlaygroundStore((s) => s.setEnabledProps)
  const start = usePlaygroundStore((s) => s.start)
  const stop = usePlaygroundStore((s) => s.stop)

  // RUM コンテキストをチュートリアルに切替
  useEffect(() => {
    setContext({ lab_id: 'render', mode: 'tutorial' })
    return () => setContext({ lab_id: null, mode: 'other' })
  }, [setContext])

  // ステップ切り替わりで preset を適用
  useEffect(() => {
    if (!step) return
    setElementCount(step.preset.elementCount)
    setEnabledProps(step.preset.enabledProps)
    if (step.preset.autoStart) start()
    else stop()
  }, [step, setElementCount, setEnabledProps, start, stop])

  // 各ステップの滞在時間を RUM に送信
  const enteredAtRef = useRef<number>(performance.now())
  useEffect(() => {
    enteredAtRef.current = performance.now()
    return () => {
      const duration = performance.now() - enteredAtRef.current
      emit({
        metric_name: 'lab.tutorial.step_duration',
        metric_value: duration,
        lab_id: 'render',
        metadata: { step_id: stepId },
      })
    }
  }, [stepId, emit])

  // ステップ切替時は常に画面トップへ戻す（前ステップで下部まで読み進めていても、
  // 新しい目的・解説から読み始められるように）。初回マウントはデフォで top=0 なのでスキップ。
  const isFirstRenderRef = useRef(true)
  // biome-ignore lint/correctness/useExhaustiveDependencies: stepId の変化を純粋にトリガとしてのみ使用
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [stepId])

  const Content = useMemo(() => STEP_CONTENTS[stepId], [stepId])
  const quiz = useMemo(() => getQuiz(stepId), [stepId])
  const progress = (stepId / TUTORIAL_STEP_COUNT) * 100
  const isLast = stepId >= TUTORIAL_STEP_COUNT

  if (!step || !Content) return null

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-ink-400">
          <span>
            § {String(step.id).padStart(2, '0')} / {String(TUTORIAL_STEP_COUNT).padStart(2, '0')} —
            Tutorial
          </span>
          <span>{step.slug}</span>
        </div>
        <Progress value={progress} aria-label="進捗" />
        <h1 className="font-mincho text-2xl tracking-tight text-ink-900 md:text-3xl">
          {step.title}
        </h1>
      </header>

      {/*
        レイアウト: 左に読み物（目的→観察ポイント→解説→クイズ）、右に観測対象（Canvas / Metrics）。
        日本語の左→右の読み順と学習フロー（理解 → 観察）に揃えている。
        lg 未満では aside が先に積まれる（stack）のでモバイルでも「読んでから観察」の順になる。
      */}
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <aside className="flex flex-col gap-6 border border-rule-dim bg-card p-5">
          <section>
            <h2 className="text-[11px] uppercase tracking-[0.24em] text-ink-400">
              § 目的 / Objective
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-900">{step.objective}</p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.24em] text-ink-400">
              § 観察ポイント / Observation
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.observation}</p>
          </section>

          <section className="border-t border-rule-dim pt-4">
            <h2 className="mb-3 text-[11px] uppercase tracking-[0.24em] text-ink-400">§ 解説</h2>
            <Prose className="text-sm">
              <Content />
            </Prose>
          </section>

          {quiz && <StepQuiz quiz={quiz} />}
        </aside>

        {/* 右カラム: 長い解説を読む間もキャンバスが見えるよう sticky にする */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-20">
          {step.comparison ? (
            <ComparisonView
              elementCount={step.preset.elementCount}
              left={step.comparison.left}
              right={step.comparison.right}
            />
          ) : (
            <>
              <VisualizationView />
              <MetricsDisplay focus={step.focus} />
            </>
          )}
        </div>
      </div>

      <nav
        aria-label="ステップ移動"
        className="flex items-center justify-between border-t border-rule-dim pt-6"
      >
        <Button
          type="button"
          variant="ghost"
          onClick={() => setStepIdRaw(Math.max(1, stepId - 1))}
          disabled={stepId <= 1}
        >
          <ArrowLeft size={14} weight="bold" className="mr-2" />
          前のステップ
        </Button>

        <div className="flex items-center gap-1">
          {TUTORIAL_STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-label={`ステップ ${s.id}: ${s.title} へ`}
              aria-current={s.id === stepId ? 'step' : undefined}
              onClick={() => setStepIdRaw(s.id)}
              className="group/dot flex h-8 w-8 cursor-pointer items-center justify-center focus-visible:outline-none"
            >
              <span
                aria-hidden="true"
                className={`block h-[3px] w-7 border transition-all group-hover/dot:h-[5px] ${
                  s.id === stepId
                    ? 'border-vermilion bg-vermilion shadow-[0_0_8px_var(--vermilion)]'
                    : s.id < stepId
                      ? 'border-ink-400 bg-ink-400/70'
                      : 'border-rule-normal bg-transparent group-hover/dot:border-ink-300'
                }`}
              />
            </button>
          ))}
        </div>

        {isLast ? (
          <Button asChild>
            <Link href={`${LAB_RENDER_META.path}/playground`}>
              <CheckCircle size={14} weight="bold" className="mr-2" />
              道場モードへ
            </Link>
          </Button>
        ) : (
          <Button type="button" onClick={() => setStepIdRaw(stepId + 1)}>
            次のステップ
            <ArrowRight size={14} weight="bold" className="ml-2" />
          </Button>
        )}
      </nav>
    </div>
  )
}
