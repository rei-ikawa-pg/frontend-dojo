export type PhaseImpact = {
  layout: boolean
  paint: boolean
  composite: boolean
}

/** プロパティ → 理論上どのフェーズが走るか（Blink ベース、CSS Triggers 系資料準拠） */
export const cssTriggersMap = {
  // Layout + Paint + Composite
  width: { layout: true, paint: true, composite: true },
  height: { layout: true, paint: true, composite: true },
  top: { layout: true, paint: true, composite: true },
  left: { layout: true, paint: true, composite: true },
  right: { layout: true, paint: true, composite: true },
  bottom: { layout: true, paint: true, composite: true },
  margin: { layout: true, paint: true, composite: true },
  padding: { layout: true, paint: true, composite: true },
  'border-width': { layout: true, paint: true, composite: true },
  'font-size': { layout: true, paint: true, composite: true },
  display: { layout: true, paint: true, composite: true },

  // Paint + Composite
  'background-color': { layout: false, paint: true, composite: true },
  color: { layout: false, paint: true, composite: true },
  'box-shadow': { layout: false, paint: true, composite: true },
  'border-color': { layout: false, paint: true, composite: true },
  'background-image': { layout: false, paint: true, composite: true },

  // Composite only
  transform: { layout: false, paint: false, composite: true },
  opacity: { layout: false, paint: false, composite: true },
  filter: { layout: false, paint: false, composite: true },
} as const satisfies Record<string, PhaseImpact>

export type SupportedProperty = keyof typeof cssTriggersMap

const FALLBACK_IMPACT: PhaseImpact = { layout: true, paint: true, composite: true }

export function getPhaseImpact(prop: string): PhaseImpact {
  return (cssTriggersMap as Record<string, PhaseImpact>)[prop] ?? FALLBACK_IMPACT
}

export function aggregateImpact(props: Iterable<string>): PhaseImpact {
  const result: PhaseImpact = { layout: false, paint: false, composite: false }
  for (const prop of props) {
    const impact = getPhaseImpact(prop)
    result.layout ||= impact.layout
    result.paint ||= impact.paint
    result.composite ||= impact.composite
  }
  return result
}
