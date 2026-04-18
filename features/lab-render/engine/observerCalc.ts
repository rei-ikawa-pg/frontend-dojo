/** 純粋関数化したフレーム計算ロジック（テスト容易性のため別出し） */

export type LoafLikeEntry = {
  startTime: number
  duration: number
  renderStart: number
  styleAndLayoutStart: number
  scripts?: ReadonlyArray<{ duration: number }>
}

export function sumScripts(entry: Pick<LoafLikeEntry, 'scripts'>): number {
  return entry.scripts?.reduce((acc, s) => acc + (s.duration ?? 0), 0) ?? 0
}

export function calcStyleLayout(
  entry: Pick<LoafLikeEntry, 'renderStart' | 'styleAndLayoutStart'>,
): number {
  if (entry.renderStart <= 0 || entry.styleAndLayoutStart <= 0) return 0
  return Math.max(0, entry.renderStart - entry.styleAndLayoutStart)
}

export function calcRendering(
  entry: Pick<LoafLikeEntry, 'startTime' | 'duration' | 'renderStart'>,
): number {
  if (entry.renderStart <= 0) return 0
  return Math.max(0, entry.startTime + entry.duration - entry.renderStart)
}

export function calcFps(frames: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0
  return Math.round((frames * 1000) / elapsedMs)
}
