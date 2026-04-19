/**
 * Lab 2 自由操作モードのコンテナ。
 * - LeakController をこの階層で保持し、counts を Visualization / Metrics と共有する
 */

'use client'

import { useEffect, useRef } from 'react'
import { useRumSetContext } from '@/features/rum'
import { useLeakController } from '../hooks/useLeakController'
import { ControlPanel } from './ControlPanel'
import { MetricsDisplay } from './MetricsDisplay'
import { VisualizationView } from './VisualizationView'

export function PlaygroundMode() {
  const setContext = useRumSetContext()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { counts, cycleOnce, releaseAll } = useLeakController(containerRef)

  useEffect(() => {
    setContext({ lab_id: 'memory-leak', mode: 'playground' })
    return () => setContext({ lab_id: null, mode: 'other' })
  }, [setContext])

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <VisualizationView containerRef={containerRef} counts={counts} />
        <MetricsDisplay counts={counts} />
      </div>
      <ControlPanel onCycle={cycleOnce} onRelease={releaseAll} />
    </div>
  )
}
