/**
 * renderTracker を React から購読するフック。
 * - render ごとの通知は throttle されているが、さらに低頻度で十分な場所用に短い節流を入れておく
 */

'use client'

import { useEffect, useState } from 'react'
import { type RenderStats, renderTracker } from '../engine/renderTracker'

const EMPTY: RenderStats = { counts: {}, lastRenderAt: {} }

export function useRenderStats(): RenderStats {
  const [stats, setStats] = useState<RenderStats>(EMPTY)

  useEffect(() => {
    setStats(renderTracker.snapshot())
    return renderTracker.subscribe(setStats)
  }, [])

  return stats
}
