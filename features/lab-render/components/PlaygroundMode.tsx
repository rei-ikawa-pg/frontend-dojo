/**
 * 自由操作モード (Playground) のコンテナ。
 * - レイアウト責務のみ（具体的な操作は ControlPanel / MetricsDisplay / VisualizationView）
 * - ページ表示時に RUM コンテキストを render / playground に切り替える
 */

'use client'

import { usePlaygroundStore } from '@/features/lab-render'
import { useLabRumContext } from '@/features/rum'
import { ControlPanel } from './ControlPanel'
import { MetricsDisplay } from './MetricsDisplay'
import { PipelineDiagram } from './PipelineDiagram'
import { VisualizationView } from './VisualizationView'

export function PlaygroundMode() {
  // ControlPanel の toggle 操作を PipelineDiagram に即時反映させる
  const enabledProps = usePlaygroundStore((s) => s.enabledProps)

  useLabRumContext('render', 'playground')

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <PipelineDiagram props={enabledProps} />
        <VisualizationView />
        <MetricsDisplay />
      </div>
      <ControlPanel />
    </div>
  )
}
