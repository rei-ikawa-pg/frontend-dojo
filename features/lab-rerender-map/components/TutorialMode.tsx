/**
 * Lab 3 チュートリアルモード。
 * - URL に step を同期
 * - ステップ切替時に playgroundStore に preset を適用し、renderTracker もリセット
 * - 共通 TutorialShell でレイアウト・ステップナビを描画
 */

'use client'

import { parseAsInteger, useQueryState } from 'nuqs'
import { useEffect, useMemo } from 'react'
import { StepQuiz } from '@/components/lab/StepQuiz'
import { TutorialShell } from '@/components/lab/TutorialShell'
import { LAB_RERENDER_MAP_META } from '@/features/lab-rerender-map'
import { useLabRumContext, useStepDuration } from '@/features/rum'
import { renderTracker } from '../engine/renderTracker'
import { buildTree, collectIds } from '../engine/tree'
import { useRerenderPlaygroundStore } from '../stores/playgroundStore'
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

  const setDepth = useRerenderPlaygroundStore((s) => s.setDepth)
  const setFanout = useRerenderPlaygroundStore((s) => s.setFanout)
  const setAllMemo = useRerenderPlaygroundStore((s) => s.setAllMemo)
  const setPropKind = useRerenderPlaygroundStore((s) => s.setPropKind)
  const setStateSource = useRerenderPlaygroundStore((s) => s.setStateSource)
  const resetStore = useRerenderPlaygroundStore((s) => s.reset)

  useLabRumContext('rerender-map', 'tutorial')
  useStepDuration('rerender-map', stepId)

  // ステップ切替時に preset を適用
  useEffect(() => {
    if (!step) return
    // まず store を初期化し、renderTracker も 0 に戻す
    resetStore()
    renderTracker.reset()
    setDepth(step.preset.depth)
    setFanout(step.preset.fanout)
    setPropKind(step.preset.propKind)
    setStateSource(step.preset.stateSource)
    if (step.preset.memoIds && step.preset.memoIds.length > 0) {
      const allIds = collectIds(
        buildTree({
          depth: step.preset.depth,
          fanout: step.preset.fanout,
        }),
      )
      // preset.memoIds のうち、実在する id のみ有効化
      const filtered = step.preset.memoIds.filter((id) => allIds.includes(id))
      setAllMemo(true, filtered)
    }
  }, [step, resetStore, setDepth, setFanout, setPropKind, setStateSource, setAllMemo])

  const Content = useMemo(() => STEP_CONTENTS[stepId], [stepId])
  const quiz = useMemo(() => getQuiz(stepId), [stepId])

  if (!step || !Content) return null

  return (
    <TutorialShell
      labId="rerender-map"
      labPath={LAB_RERENDER_MAP_META.path}
      step={step}
      stepId={stepId}
      totalSteps={TUTORIAL_STEP_COUNT}
      stepIds={STEP_IDS}
      onStepChange={setStepIdRaw}
      explanation={<Content />}
      extras={quiz && <StepQuiz quiz={quiz} labId="rerender-map" />}
    >
      <VisualizationView />
      <MetricsDisplay focus={step.focus} />
      <ControlPanel />
    </TutorialShell>
  )
}
