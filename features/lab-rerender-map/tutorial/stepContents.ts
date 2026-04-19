/**
 * Lab 3 チュートリアルの MDX を id → Component の map で束ねる。
 */

import Step01 from '../content/tutorial/step-01.mdx'
import Step02 from '../content/tutorial/step-02.mdx'
import Step03 from '../content/tutorial/step-03.mdx'
import Step04 from '../content/tutorial/step-04.mdx'
import Step05 from '../content/tutorial/step-05.mdx'
import Step06 from '../content/tutorial/step-06.mdx'

export const STEP_CONTENTS: Record<number, React.ComponentType> = {
  1: Step01,
  2: Step02,
  3: Step03,
  4: Step04,
  5: Step05,
  6: Step06,
}
