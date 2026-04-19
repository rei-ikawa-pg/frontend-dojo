/**
 * Lab 2 チュートリアルモード。
 * - URL に step を nuqs で同期
 * - ステップ切替時に preset を playgroundStore に流し込む
 * - LeakController はここで保持（Visualization / Metrics で counts を共有）
 */

'use client'

import { ArrowLeft, ArrowRight, CheckCircle } from '@phosphor-icons/react'
import Link from 'next/link'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useEffect, useMemo, useRef } from 'react'
import { Prose } from '@/components/typography/Prose'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useRumCustomMetric, useRumSetContext } from '@/features/rum'
import { useLeakController } from '../hooks/useLeakController'
import { useMemoryPlaygroundStore } from '../stores/playgroundStore'
import { getQuiz } from '../tutorial/quizzes'
import { STEP_CONTENTS } from '../tutorial/stepContents'
import { getStep, TUTORIAL_STEP_COUNT, TUTORIAL_STEPS } from '../tutorial/steps'
import { ControlPanel } from './ControlPanel'
import { MetricsDisplay } from './MetricsDisplay'
import { StepQuiz } from './StepQuiz'
import { VisualizationView } from './VisualizationView'

const LAB_PATH = '/lab/memory-leak'

export function TutorialMode() {
  const [stepIdRaw, setStepIdRaw] = useQueryState(
    'step',
    parseAsInteger.withDefault(1).withOptions({ history: 'push' }),
  )
  const stepId = stepIdRaw >= 1 && stepIdRaw <= TUTORIAL_STEP_COUNT ? stepIdRaw : 1
  const step = getStep(stepId)

  const setContext = useRumSetContext()
  const emit = useRumCustomMetric()

  const setLeakType = useMemoryPlaygroundStore((s) => s.setLeakType)
  const setMitigation = useMemoryPlaygroundStore((s) => s.setMitigation)
  const setHoldSize = useMemoryPlaygroundStore((s) => s.setHoldSize)
  const setCycleCount = useMemoryPlaygroundStore((s) => s.setCycleCount)
  const start = useMemoryPlaygroundStore((s) => s.start)
  const stop = useMemoryPlaygroundStore((s) => s.stop)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const { counts, cycleOnce, releaseAll } = useLeakController(containerRef)

  useEffect(() => {
    setContext({ lab_id: 'memory-leak', mode: 'tutorial' })
    return () => setContext({ lab_id: null, mode: 'other' })
  }, [setContext])

  useEffect(() => {
    if (!step) return
    setLeakType(step.preset.leakType)
    setMitigation(step.preset.mitigation)
    setHoldSize(step.preset.holdSize)
    setCycleCount(step.preset.cycleCount)
    if (step.preset.autoStart) start()
    else stop()
    // ステップ切替時は保持している unit も解放して、前ステップの結果を持ち越さない
    releaseAll()
  }, [step, setLeakType, setMitigation, setHoldSize, setCycleCount, start, stop, releaseAll])

  const enteredAtRef = useRef<number>(performance.now())
  useEffect(() => {
    enteredAtRef.current = performance.now()
    return () => {
      const duration = performance.now() - enteredAtRef.current
      emit({
        metric_name: 'lab.tutorial.step_duration',
        metric_value: duration,
        lab_id: 'memory-leak',
        metadata: { step_id: stepId },
      })
    }
  }, [stepId, emit])

  const isFirstRenderRef = useRef(true)
  // biome-ignore lint/correctness/useExhaustiveDependencies: stepId 変化をトリガに使う
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

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <aside className="flex flex-col gap-6 border border-rule-dim bg-card p-5 lg:sticky lg:top-20 lg:self-start">
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

        <div className="flex flex-col gap-4 lg:sticky lg:top-20">
          <VisualizationView containerRef={containerRef} counts={counts} />
          <MetricsDisplay counts={counts} focus={step.focus} />
          <ControlPanel onCycle={cycleOnce} onRelease={releaseAll} />
        </div>
      </div>

      <nav
        aria-label="ステップ移動"
        className="flex items-center justify-between gap-3 border-t border-rule-dim pt-6"
      >
        <Button
          type="button"
          variant="ghost"
          onClick={() => setStepIdRaw(Math.max(1, stepId - 1))}
          disabled={stepId <= 1}
        >
          <ArrowLeft size={14} weight="bold" className="mr-1 md:mr-2" />前
          <span className="hidden sm:inline">のステップ</span>
        </Button>

        <span className="tnum shrink-0 text-[11px] uppercase tracking-[0.24em] text-ink-400 md:hidden">
          {String(stepId).padStart(2, '0')} / {String(TUTORIAL_STEP_COUNT).padStart(2, '0')}
        </span>

        <div className="hidden items-center gap-1 md:flex">
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
            <Link href={`${LAB_PATH}/playground`}>
              <CheckCircle size={14} weight="bold" className="mr-1 md:mr-2" />
              道場<span className="hidden sm:inline">モードへ</span>
            </Link>
          </Button>
        ) : (
          <Button type="button" onClick={() => setStepIdRaw(stepId + 1)}>
            次<span className="hidden sm:inline">のステップ</span>
            <ArrowRight size={14} weight="bold" className="ml-1 md:ml-2" />
          </Button>
        )}
      </nav>
    </div>
  )
}
