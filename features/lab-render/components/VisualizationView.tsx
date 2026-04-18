/**
 * 可視化エリア: RenderEngine が直接 DOM を書き込む container をホストする。
 * - React の再レンダー外で要素管理するため、コンテナ div 以下はエンジン管轄
 * - スクロールバー発生を避け、要素はグリッド風に自動配置する（globals.css 側で .lab-render-item を定義）
 */

'use client'

import { useRef } from 'react'
import { useRenderEngine } from '../hooks/useRenderEngine'

export function VisualizationView() {
  const ref = useRef<HTMLDivElement | null>(null)
  useRenderEngine(ref)

  return (
    <div className="relative overflow-hidden border border-rule-dim bg-ink-050/50">
      <div className="absolute inset-x-4 top-3 flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-ink-400">
        <span>§ Canvas</span>
        <span className="text-ink-300">DOM Elements</span>
      </div>
      <div
        ref={ref}
        role="presentation"
        className="flex min-h-[360px] flex-wrap content-start gap-1 p-4 pt-10 md:min-h-[480px]"
      />
    </div>
  )
}
