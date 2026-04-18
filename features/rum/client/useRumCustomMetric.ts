/**
 * Lab コンポーネントが RUM にカスタムメトリクスを送るためのフック。
 * - RumProvider 配下でのみ有効
 * - Provider が disabled の場合は no-op（window.__RUM__ が未定義）
 */

'use client'

import { useCallback } from 'react'
import type { RumEventInput } from '../shared/types'

export function useRumCustomMetric() {
  return useCallback((input: RumEventInput) => {
    if (typeof window === 'undefined') return
    window.__RUM__?.emit(input)
  }, [])
}

/** Lab ページで lab_id / mode を差し替えるためのヘルパー */
export function useRumSetContext() {
  return useCallback((next: Parameters<NonNullable<Window['__RUM__']>['setContext']>[0]) => {
    if (typeof window === 'undefined') return
    window.__RUM__?.setContext(next)
  }, [])
}
