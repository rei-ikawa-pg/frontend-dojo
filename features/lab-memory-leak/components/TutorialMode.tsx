/**
 * Lab 2 チュートリアルモード。
 * - URL に step を nuqs で同期
 * - ステップ切替時に preset を playgroundStore に流し込む
 * - LeakController はここで保持（Visualization / Metrics で counts を共有）
 * - 共通 TutorialShell でレイアウト・ステップナビを描画
 */

'use client'

import { parseAsInteger, useQueryState } from 'nuqs'
import { useEffect, useMemo, useRef } from 'react'
import { StepQuiz } from '@/components/lab/StepQuiz'
import { TutorialShell } from '@/components/lab/TutorialShell'
import { LAB_MEMORY_LEAK_META } from '@/features/lab-memory-leak'
import { useLabRumContext, useStepDuration } from '@/features/rum'
import { useLeakController } from '../hooks/useLeakController'
import { useMemoryPlaygroundStore } from '../stores/playgroundStore'
import { getQuiz } from '../tutorial/quizzes'
import { STEP_CONTENTS } from '../tutorial/stepContents'
import { getStep, TUTORIAL_STEP_COUNT, TUTORIAL_STEPS } from '../tutorial/steps'
import { ControlPanel } from './ControlPanel'
import { MetricsDisplay } from './MetricsDisplay'
import { VisualizationView } from './VisualizationView'

const STEP_IDS = TUTORIAL_STEPS.map((s) => s.id)

export function TutorialMode() {
  const [stepIdRaw, setStepIdRaw] = useQueryState(
    'step',
    parseAsInteger.withDefault(1).withOptions({ history: 'push' }),
  )
  const stepId = stepIdRaw >= 1 && stepIdRaw <= TUTORIAL_STEP_COUNT ? stepIdRaw : 1
  const step = getStep(stepId)

  const setLeakType = useMemoryPlaygroundStore((s) => s.setLeakType)
  const setMitigation = useMemoryPlaygroundStore((s) => s.setMitigation)
  const setHoldSize = useMemoryPlaygroundStore((s) => s.setHoldSize)
  const setCycleCount = useMemoryPlaygroundStore((s) => s.setCycleCount)
  const start = useMemoryPlaygroundStore((s) => s.start)
  const stop = useMemoryPlaygroundStore((s) => s.stop)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const { counts, cycleOnce, releaseAll } = useLeakController(containerRef)

  useLabRumContext('memory-leak', 'tutorial')
  useStepDuration('memory-leak', stepId)

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

  const Content = useMemo(() => STEP_CONTENTS[stepId], [stepId])
  const quiz = useMemo(() => getQuiz(stepId), [stepId])

  if (!step || !Content) return null

  return (
    <TutorialShell
      labId="memory-leak"
      labPath={LAB_MEMORY_LEAK_META.path}
      step={step}
      stepId={stepId}
      totalSteps={TUTORIAL_STEP_COUNT}
      stepIds={STEP_IDS}
      onStepChange={setStepIdRaw}
      explanation={<Content />}
      extras={quiz && <StepQuiz quiz={quiz} labId="memory-leak" />}
    >
      <VisualizationView containerRef={containerRef} counts={counts} />
      <MetricsDisplay counts={counts} focus={step.focus} />
      <ControlPanel onCycle={cycleOnce} onRelease={releaseAll} />
    </TutorialShell>
  )
}
