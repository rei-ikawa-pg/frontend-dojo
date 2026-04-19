/**
 * Lab 3 自由操作モードのコンテナ。
 */

'use client'

import { useLabRumContext } from '@/features/rum'
import { ControlPanel } from './ControlPanel'
import { MetricsDisplay } from './MetricsDisplay'
import { VisualizationView } from './VisualizationView'

export function PlaygroundMode() {
  useLabRumContext('rerender-map', 'playground')

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
