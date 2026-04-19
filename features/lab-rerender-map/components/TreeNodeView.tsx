/**
 * Lab 3 のツリーノード表示。
 *
 * 各ノードはマウント/更新のたびに renderTracker に `increment(id)` を通知する。
 * render 直後に `data-flashing` 属性を立てて 600ms で外すことで、CSS 側で
 * 「光る」アニメーションを付与する（React state を通さないため、観測のための
 * 再 render を増やさない）。
 *
 * memo 化するかは props の `memoize` で切り替える。メモ化された場合は React.memo を介すため、
 * shallow 比較で同じ props なら再 render されない。
 */

'use client'

import { memo, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { renderTracker } from '../engine/renderTracker'
import type { TreeNode } from '../engine/tree'

type NodeCommonProps = {
  node: TreeNode
  /** 親から渡される「値」。propKind の違いを表現する */
  payload: unknown
  /** 状態ソースが context の時にのみ defined (Provider から降ってきた tick) */
  contextTick?: number
}

function NodeBody({ node, payload, contextTick }: NodeCommonProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  // マウント/更新のたびに 1 度だけ呼ばれる
  useEffect(() => {
    renderTracker.increment(node.id)
    const el = ref.current
    if (!el) return
    el.setAttribute('data-flashing', 'true')
    const t = window.setTimeout(() => {
      el.removeAttribute('data-flashing')
    }, 600)
    return () => window.clearTimeout(t)
  })

  return (
    <div
      ref={ref}
      className={cn(
        'lab-rerender-node relative flex min-w-[52px] flex-col items-center gap-0.5 border px-2 py-1.5 text-center',
        node.memo ? 'border-sig-ok/60 bg-sig-ok/5' : 'border-rule-dim bg-card',
      )}
      data-node-id={node.id}
      title={`${node.label}${node.memo ? ' (memo)' : ''}`}
    >
      <span className="font-mincho text-xs leading-none text-ink-900">{node.label}</span>
      {node.memo && (
        <span className="text-[9px] uppercase tracking-[0.18em] text-sig-ok">memo</span>
      )}
      {/* payload / contextTick の変化が確実に render を発火させるため読み取る */}
      <span aria-hidden className="sr-only">
        {String(payload ?? '')}
        {contextTick ?? ''}
      </span>
    </div>
  )
}

const NodeBodyMemo = memo(NodeBody, (prev, next) => {
  // payload は shallow 等価。object literal だと毎回異なる参照が入るので false になる
  if (prev.node !== next.node) return false
  if (prev.payload !== next.payload) return false
  if (prev.contextTick !== next.contextTick) return false
  return true
})

/**
 * ノードと子を連結して描くラッパ。
 * memoize=true なら NodeBodyMemo を、false なら NodeBody を使う。
 */
export function TreeNodeView({ node, payload, contextTick }: NodeCommonProps) {
  const Body = node.memo ? NodeBodyMemo : NodeBody
  return (
    <div className="flex flex-col items-center gap-2">
      <Body node={node} payload={payload} contextTick={contextTick} />
      {node.children.length > 0 && (
        <>
          <span aria-hidden className="block h-2 w-px bg-rule-dim" />
          <div className="flex flex-wrap items-start justify-center gap-2">
            {node.children.map((child) => (
              <TreeNodeView
                key={child.id}
                node={child}
                payload={payload}
                contextTick={contextTick}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
