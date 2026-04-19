/**
 * Lab ページのマウント時に RUM のコンテキスト (lab_id / mode) を設定し、
 * アンマウント時に `(null, 'other')` に戻す副作用フック。
 *
 * 各 Lab の PlaygroundMode / TutorialMode で重複していた useEffect を集約した。
 */

'use client'

import { useEffect } from 'react'
import { useRumSetContext } from './useRumCustomMetric'

export type LabRumMode = 'tutorial' | 'playground'

export function useLabRumContext(labId: string, mode: LabRumMode): void {
  const setContext = useRumSetContext()
  useEffect(() => {
    setContext({ lab_id: labId, mode })
    return () => setContext({ lab_id: null, mode: 'other' })
  }, [setContext, labId, mode])
}
