/**
 * 各チュートリアルステップの MDX を map 化して TutorialMode から参照する。
 * next/mdx のインポートはトップレベルで行い、動的遅延読み込みは避ける
 * （ステップ切替時のチラつきを回避するため）。
 */

import Step01 from '../content/tutorial/step-01.mdx'
import Step02 from '../content/tutorial/step-02.mdx'
import Step03 from '../content/tutorial/step-03.mdx'
import Step04 from '../content/tutorial/step-04.mdx'
import Step05 from '../content/tutorial/step-05.mdx'
import Step06 from '../content/tutorial/step-06.mdx'
import Step07 from '../content/tutorial/step-07.mdx'
import Step08 from '../content/tutorial/step-08.mdx'

export const STEP_CONTENTS: Record<number, React.ComponentType> = {
  1: Step01,
  2: Step02,
  3: Step03,
  4: Step04,
  5: Step05,
  6: Step06,
  7: Step07,
  8: Step08,
}
