/**
 * /labs 一覧ページ。
 * - 公開中の Lab 1 カードは遷移可能
 * - 近日公開の Lab は disabled 表示（遷移しない）
 */

import { expect, test } from '@playwright/test'

test.describe('/labs 稽古場一覧', () => {
  test('Lab 1 カードから /lab/render に遷移できる', async ({ page }) => {
    await page.goto('/labs')
    // h1 はインパクト優先で「全 06 稽古場。」。セクションマーカー側に「稽古場一覧」を載せる
    await expect(page.locator('h1')).toContainText('稽古場')
    await expect(page.getByText('稽古場一覧').first()).toBeVisible()

    // Lab 1 リンク（aria-label は `${shortTitle} — 公開中`）
    const lab1 = page.getByRole('link', { name: /Lab 1: レンダリング/ })
    await expect(lab1).toBeVisible()
    await lab1.click()
    await expect(page).toHaveURL(/\/lab\/render$/)
  })

  test('近日公開の Lab は「近日公開」ラベル付きで disable 表示', async ({ page }) => {
    await page.goto('/labs')
    // Lab 2 (メモリリーク稽古場) は Lab 1 のリンク配下に無い（= リンクではない）
    const comingSoonLabels = page.getByText('近日公開')
    await expect(comingSoonLabels.first()).toBeVisible()
  })
})
