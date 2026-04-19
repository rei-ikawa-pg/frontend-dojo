/**
 * Lab 1 チュートリアルモード本体。
 * - URL に step を nuqs で同期（?step=3 で直リンク可能、docs/02 §2.1）
 * - ステップ切替時に playgroundStore の preset を強制適用
 * - 共通 TutorialShell に解説 + StepQuiz / 観測 UI を流し込む
 * - 共通フック `useLabRumContext` / `useStepDuration` で RUM 計測を実施
 */

'use client'

import { parseAsInteger, useQueryState } from 'nuqs'
import { useEffect, useMemo } from 'react'
import { StepQuiz } from '@/components/lab/StepQuiz'
import { TutorialShell } from '@/components/lab/TutorialShell'
import { LAB_RENDER_META, usePlaygroundStore } from '@/features/lab-render'
import { getQuiz } from '@/features/lab-render/tutorial/quizzes'
import { STEP_CONTENTS } from '@/features/lab-render/tutorial/stepContents'
import { getStep, TUTORIAL_STEP_COUNT, TUTORIAL_STEPS } from '@/features/lab-render/tutorial/steps'
import { useLabRumContext, useStepDuration } from '@/features/rum'
import { ComparisonView } from './ComparisonView'
import { MetricsDisplay } from './MetricsDisplay'
import { PipelineDiagram } from './PipelineDiagram'
import { VisualizationView } from './VisualizationView'

const STEP_IDS = TUTORIAL_STEPS.map((s) => s.id)

export function TutorialMode() {
  const [stepIdRaw, setStepIdRaw] = useQueryState(
    'step',
    parseAsInteger.withDefault(1).withOptions({ history: 'push' }),
  )
  // 範囲外の step は 1 として扱う（安全側）
  const stepId = stepIdRaw >= 1 && stepIdRaw <= TUTORIAL_STEP_COUNT ? stepIdRaw : 1
  const step = getStep(stepId)
  const setElementCount = usePlaygroundStore((s) => s.setElementCount)
  const setEnabledProps = usePlaygroundStore((s) => s.setEnabledProps)
  const start = usePlaygroundStore((s) => s.start)
  const stop = usePlaygroundStore((s) => s.stop)

  useLabRumContext('render', 'tutorial')
  useStepDuration('render', stepId)

  // ステップ切り替わりで preset を適用
  useEffect(() => {
    if (!step) return
    setElementCount(step.preset.elementCount)
    setEnabledProps(step.preset.enabledProps)
    if (step.preset.autoStart) start()
    else stop()
  }, [step, setElementCount, setEnabledProps, start, stop])

  const Content = useMemo(() => STEP_CONTENTS[stepId], [stepId])
  const quiz = useMemo(() => getQuiz(stepId), [stepId])

  if (!step || !Content) return null

  return (
    <TutorialShell
      labId="render"
      labPath={LAB_RENDER_META.path}
      step={step}
      stepId={stepId}
      totalSteps={TUTORIAL_STEP_COUNT}
      stepIds={STEP_IDS}
      onStepChange={setStepIdRaw}
      explanation={<Content />}
      extras={quiz && <StepQuiz quiz={quiz} labId="render" />}
    >
      {/* PipelineDiagram を最上段に置き「概念の地図」で理解を固定してから、
          下の VisualizationView / MetricsDisplay で「実測の裏付け」を見せる順番にしている。
          comparison モードは左右の PipelineDiagram を各 Lane に内包するので、ここでは出さない。 */}
      {step.comparison ? (
        <ComparisonView
          elementCount={step.preset.elementCount}
          left={step.comparison.left}
          right={step.comparison.right}
        />
      ) : (
        <>
          <PipelineDiagram props={step.preset.enabledProps} />
          <VisualizationView />
          <MetricsDisplay focus={step.focus} />
        </>
      )}
    </TutorialShell>
  )
}
