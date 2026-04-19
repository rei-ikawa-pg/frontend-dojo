/**
 * チュートリアルの各ステップ滞在時間を計測し、
 * ステップ離脱時に `lab.tutorial.step_duration` として RUM に送信するフック。
 *
 * 各 Lab の TutorialMode で重複していた useEffect を集約。
 * `stepId` が変わった時のみ計測区間が切り替わる（依存に stepId を含める）。
 */

'use client'

import { useEffect, useRef } from 'react'
import { useRumCustomMetric } from './useRumCustomMetric'

export function useStepDuration(labId: string, stepId: number): void {
  const emit = useRumCustomMetric()
  const enteredAtRef = useRef<number>(performance.now())

  useEffect(() => {
    enteredAtRef.current = performance.now()
    return () => {
      const duration = performance.now() - enteredAtRef.current
      emit({
        metric_name: 'lab.tutorial.step_duration',
        metric_value: duration,
        lab_id: labId,
        metadata: { step_id: stepId },
      })
    }
  }, [stepId, labId, emit])
}
