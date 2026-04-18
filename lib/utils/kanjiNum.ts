/**
 * 非負整数を大字(旧字体の漢数字)文字列に変換する。
 *
 * 大字は金額表記等で改ざん防止のため使われる旧字体の数字。道場の Lab 識別記号として
 * 採用しており、Lab 数が増えても一貫した表示を保つために関数化している。
 *
 * 対応範囲: 0〜99。100 以上、負数、非整数は空文字を返す。
 *
 * 例:
 *   toKanjiNum(1)  => '壱'
 *   toKanjiNum(7)  => '漆'
 *   toKanjiNum(10) => '拾'       (壱拾とはしない慣例)
 *   toKanjiNum(19) => '拾玖'
 *   toKanjiNum(20) => '弐拾'
 *   toKanjiNum(99) => '玖拾玖'
 */

const DAIJI_ONES: readonly string[] = ['〇', '壱', '弐', '参', '肆', '伍', '陸', '漆', '捌', '玖']

const DAIJI_TEN = '拾'

export function toKanjiNum(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 99) return ''

  if (n < 10) return DAIJI_ONES[n] ?? ''

  const tens = Math.floor(n / 10)
  const ones = n % 10

  // 10 は慣例的に「拾」のみ。20 以上は「弐拾」「参拾」のように十の位を明示する
  const tensPart = tens === 1 ? DAIJI_TEN : `${DAIJI_ONES[tens]}${DAIJI_TEN}`
  const onesPart = ones === 0 ? '' : (DAIJI_ONES[ones] ?? '')

  return `${tensPart}${onesPart}`
}
