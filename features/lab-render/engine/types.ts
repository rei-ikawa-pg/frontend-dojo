export type FrameSample = {
  /** performance.now() ベースの開始時刻 */
  timestamp: number
  /** フレーム全体の時間 (ms) */
  totalDuration: number
  /** JS 実行時間 (ms) */
  scriptDuration: number
  /** Style 再計算 + Layout の時間 (ms) */
  styleLayoutDuration: number
  /** Paint + Composite の合算時間 (ms) — LoAF では分離不能なため合算で扱う */
  renderingDuration: number
  /** 50ms 超過したか（教育的閾値） */
  wasLongFrame: boolean
}

export type FrameMetricsSnapshot = {
  fps: number
  lastFrame: FrameSample | null
}
