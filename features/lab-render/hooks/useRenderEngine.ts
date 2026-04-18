/**
 * RenderEngine を React ライフサイクルに結びつけるフック。
 *
 * - container ref に RenderEngine をアタッチし、unmount 時に destroy する
 * - playgroundStore の変化を検知して setElementCount / setEnabledProperties / start/stop を呼ぶ
 *
 * 毎フレーム描画は RenderEngine 側が rAF で回すため、React の再レンダリングはここでは発火しない。
 */

'use client'

import { useEffect, useRef } from 'react'
import { RenderEngine } from '../engine/renderer'
import { usePlaygroundStore } from '../stores/playgroundStore'

export function useRenderEngine(containerRef: React.RefObject<HTMLElement | null>) {
  const engineRef = useRef<RenderEngine | null>(null)
  const elementCount = usePlaygroundStore((s) => s.elementCount)
  const enabledProps = usePlaygroundStore((s) => s.enabledProps)
  const isRunning = usePlaygroundStore((s) => s.isRunning)

  // container がマウントされたタイミングで Engine を生成し、アンマウント時に破棄する
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const engine = new RenderEngine({ container })
    engineRef.current = engine
    return () => {
      engine.destroy()
      engineRef.current = null
    }
  }, [containerRef])

  useEffect(() => {
    engineRef.current?.setElementCount(elementCount)
  }, [elementCount])

  useEffect(() => {
    engineRef.current?.setEnabledProperties(enabledProps)
  }, [enabledProps])

  useEffect(() => {
    if (!engineRef.current) return
    if (isRunning) engineRef.current.start()
    else engineRef.current.stop()
  }, [isRunning])
}
