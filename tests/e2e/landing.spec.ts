/**
 * ランディングページの基本動作。
 * - メタ情報とタイトルが正しく出る
 * - Lab 1 への大 CTA があり、クリックで /lab/render/tutorial に遷移する
 * - Header / Footer の主要リンクが存在する
 */

import { expect, test } from '@playwright/test'

test.describe('/ ランディング', () => {
  test('ヒーロー見出しと CTA が表示される', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/フロントエンド道場/)

    // H1 に道場のキーコピー
    await expect(page.locator('h1')).toContainText('触って')

    // 稽古場一覧への導線
    await expect(page.getByRole('link', { name: /稽古場一覧/ })).toBeVisible()
  })

  test('Lab 1 の CTA から /lab/render/tutorial へ遷移できる', async ({ page }) => {
    await page.goto('/')
    // Hero の大 CTA ラベルは "Lab 01 を試す"（ゼロ埋め）
    await page.getByRole('link', { name: /Lab 0?1 を試す/ }).click()
    await expect(page).toHaveURL(/\/lab\/render\/tutorial/)
  })

  test('Footer のプライバシーポリシーへ遷移できる', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'プライバシーポリシー' }).click()
    await expect(page).toHaveURL(/\/privacy/)
    // ランディングの hero h1 が DOM に残っているタイミングでも誤検出しないよう
    // 見出しレベル + 名前で厳密に特定する
    await expect(
      page.getByRole('heading', { level: 1, name: 'プライバシーポリシー' }),
    ).toBeVisible()
  })
})
