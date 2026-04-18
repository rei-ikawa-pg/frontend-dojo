/**
 * web-vitals ライブラリのラッパー。
 * Core Web Vitals (LCP / INP / CLS / FCP / TTFB) を Collector に流す。
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'

type Emit = (metric: { name: string; value: number; metadata?: Record<string, number> }) => void

export function registerWebVitals(emit: Emit): void {
  // delta を metadata に残しておくことで、同一 session 内の累積値と差分を両方サーバで確認できる
  onLCP((m) => emit({ name: 'web.lcp', value: m.value, metadata: { delta: m.delta } }))
  onINP((m) => emit({ name: 'web.inp', value: m.value, metadata: { delta: m.delta } }))
  onCLS((m) => emit({ name: 'web.cls', value: m.value, metadata: { delta: m.delta } }))
  onFCP((m) => emit({ name: 'web.fcp', value: m.value }))
  onTTFB((m) => emit({ name: 'web.ttfb', value: m.value }))
}
