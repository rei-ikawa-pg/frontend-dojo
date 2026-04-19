/**
 * Lab 3 の可視化エリア。
 * - store の depth / fanout / memoIds から木を組み立てる
 * - propKind に応じて「payload」を親から渡す
 *   - primitive: tick そのもの
 *   - object-literal: { id: 1 } を毎 render で新規作成
 *   - stable-ref: useMemo で固定
 *   - function: 毎 render で新しい関数
 * - stateSource=context の場合は TickContext.Provider でラップ
 *
 * DOM mutation は親の container 直下のみ観測する（ノードが自前で付与する data-flashing 属性は
 * attribute mutation としてカウント外にしたいため、attributes: false で取る）。
 */

'use client'

import { ArrowCounterClockwise, Lightning } from '@phosphor-icons/react'
import { createContext, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { renderTracker } from '../engine/renderTracker'
import { buildTree } from '../engine/tree'
import { useRerenderPlaygroundStore } from '../stores/playgroundStore'
import { TreeNodeView } from './TreeNodeView'

const TickContext = createContext<number>(0)

export function VisualizationView() {
  const depth = useRerenderPlaygroundStore((s) => s.depth)
  const fanout = useRerenderPlaygroundStore((s) => s.fanout)
  const memoIds = useRerenderPlaygroundStore((s) => s.memoIds)
  const propKind = useRerenderPlaygroundStore((s) => s.propKind)
  const stateSource = useRerenderPlaygroundStore((s) => s.stateSource)
  const tick = useRerenderPlaygroundStore((s) => s.tick)
  const bumpTick = useRerenderPlaygroundStore((s) => s.bumpTick)
  const reset = useRerenderPlaygroundStore((s) => s.reset)

  const tree = useMemo(() => buildTree({ depth, fanout, memoIds }), [depth, fanout, memoIds])

  // propKind に応じた「payload」を生成。
  // 親 (VisualizationView) は tick が増えるたびに再 render するが、
  // 子へ渡す payload が安定しているか毎回別物かで memo の効き方が分かれる。
  const stableObj = useMemo(() => ({ id: 1 }), [])
  const payload = (() => {
    switch (propKind) {
      case 'primitive':
        // 常に 42 を渡す (memo が効く前提)
        return 42
      case 'object-literal':
        // 毎 render で別オブジェクトが生成される (memo 失効)
        return { id: 1 }
      case 'stable-ref':
        // useMemo で参照を固定 (memo が効く)
        return stableObj
      case 'function':
        // 毎 render で新しい関数 (memo 失効)
        return () => undefined
    }
  })()

  // Context モード時のみ Provider で tick を流す
  const contextValue = stateSource === 'context' ? tick : undefined

  // DOM mutation 数のカウント
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [mutations, setMutations] = useState(0)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new MutationObserver((records) => {
      let count = 0
      for (const r of records) {
        count += r.addedNodes.length + r.removedNodes.length
      }
      if (count > 0) setMutations((m) => m + count)
    })
    observer.observe(el, { childList: true, subtree: true, attributes: false })
    return () => observer.disconnect()
  }, [])

  // リセットボタン用に tick=0 に戻った時は mutation もリセット
  useEffect(() => {
    if (tick === 0) setMutations(0)
  }, [tick])

  const tree_view = <TreeNodeView node={tree} payload={payload} contextTick={contextValue} />

  return (
    <div className="relative overflow-hidden border border-rule-dim bg-ink-050/50">
      <div className="absolute inset-x-4 top-3 flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-ink-400">
        <span>
          § Render Tree <span className="text-ink-500 normal-case tracking-normal">／ 依存木</span>
        </span>
        <span className="tnum text-ink-300">mutations: {mutations}</span>
      </div>
      <div
        ref={containerRef}
        className="flex h-[320px] items-start justify-center overflow-auto p-4 pt-10 [contain:layout] md:h-[420px]"
      >
        {stateSource === 'context' ? (
          <TickContext.Provider value={tick}>{tree_view}</TickContext.Provider>
        ) : (
          tree_view
        )}
      </div>
      {/* 結果（Render Tree のフラッシュ）と原因（state 更新）を同じ枠に置き、
          視線移動なしに因果関係を観察できるようにする。 */}
      <div className="flex border-t border-rule-dim">
        <Button
          type="button"
          onClick={bumpTick}
          className="h-10 flex-1 rounded-none border-0 border-r border-rule-dim"
        >
          <Lightning size={14} weight="bold" className="mr-2" />
          state を更新
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            reset()
            renderTracker.reset()
          }}
          className="h-10 rounded-none px-4"
        >
          <ArrowCounterClockwise size={14} weight="bold" className="mr-2" />
          リセット
        </Button>
      </div>
    </div>
  )
}
