/**
 * 自由操作モード (Playground) のコンテナ。
 * - レイアウト責務のみ（具体的な操作は ControlPanel / MetricsDisplay / VisualizationView）
 * - ページ表示時に RUM コンテキストを render / playground に切り替える
 */

'use client'

import { useEffect } from 'react'
import { useRumSetContext } from '@/features/rum'
import { ControlPanel } from './ControlPanel'
import { MetricsDisplay } from './MetricsDisplay'
import { VisualizationView } from './VisualizationView'

export function PlaygroundMode() {
  const setContext = useRumSetContext()

  useEffect(() => {
    setContext({ lab_id: 'render', mode: 'playground' })
    return () => setContext({ lab_id: null, mode: 'other' })
  }, [setContext])

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <VisualizationView />
        <MetricsDisplay />
      </div>
      <ControlPanel />
    </div>
  )
}
