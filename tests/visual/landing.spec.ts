/**
 * Visual Regression のベースライン。
 * - MVP では「ランディング」と「Lab 概要」の 2 つだけ。
 * - フル機能 Lab 画面（Playground / Tutorial）は RenderEngine の出力が
 *   プラットフォーム毎に微妙に揺れるため、対象外にする
 * - スナップショットは Chromium のみで取得する（他ブラウザでは差分が出やすい）
 */

import { expect, test } from '@playwright/test'

test.describe('Visual Regression', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'VR は Chromium のみ')

  test('ランディング', async ({ page }) => {
    await page.goto('/')
    // フォント読み込みを待機
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('landing.png', { fullPage: true, maxDiffPixelRatio: 0.02 })
  })

  test('Lab 概要', async ({ page }) => {
    await page.goto('/lab/render')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('lab-render-overview.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    })
  })
})
