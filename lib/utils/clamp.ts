/**
 * 数値を `[min, max]` に丸める純粋関数。
 *
 * - 入力が NaN の場合は `fallback`（既定では `min`）を返す
 * - `Math.round` で整数化するため、整数ストア用に `clampInt` という名前にしている
 *
 * 各 Lab の playgroundStore（要素数 / サイクル数 / 木の深さ）で同じパターンが
 * 重複していたため、ここに集約した。
 */
export function clampInt(n: number, min: number, max: number, fallback: number = min): number {
  if (Number.isNaN(n)) return fallback
  return Math.min(max, Math.max(min, Math.round(n)))
}
