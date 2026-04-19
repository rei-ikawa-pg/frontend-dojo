/**
 * チュートリアルクイズの共通型。
 *
 * 各 Lab の `tutorial/quizzes.ts` で同じ型が重複定義されていたため、
 * ここに 1 箇所で集約した。
 *
 * 型定義のみで実装は持たない（クイズ本文は各 Lab に閉じる）。
 */

export type QuizOption = {
  id: string
  text: string
  /** この選択肢を選んだ時のヒント（正解の選択肢は省略） */
  hint?: string
}

export type Quiz = {
  stepId: number
  question: string
  options: readonly QuizOption[]
  /** 正解の選択肢 id */
  correctId: string
  /** 正解後の補足（「なぜそうなるか」を 1-2 行） */
  explanation: string
}
