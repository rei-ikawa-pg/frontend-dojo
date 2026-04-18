/**
 * Lab 1 の主要フロー。
 * - 概要 → 稽古 → 道場 のモード遷移
 * - チュートリアルのステップ移動（?step=N が URL に反映される）
 * - Playground で実行ボタンが動作する
 *
 * LoAF などの実測値は Chromium 限定なので、ここでは UI が適切に描画されるかだけを見る。
 */

import { expect, test } from '@playwright/test'

test.describe('/lab/render 概要', () => {
  test('概要ページの大 CTA から稽古 / 道場へ遷移できる', async ({ page }) => {
    await page.goto('/lab/render')
    await expect(page.locator('h1')).toContainText('レンダリングパイプライン')

    // モードタブ
    await expect(page.getByRole('tab', { name: '概要' })).toHaveAttribute('aria-selected', 'true')

    // 大 CTA 「稽古」。Header や Footer の「稽古場(一覧)」リンクに当たらないよう
    // モード選択セクションに限定して取得する
    await page
      .locator('section[aria-label="モード選択"]')
      .getByRole('link', { name: /稽古/ })
      .first()
      .click()
    await expect(page).toHaveURL(/\/lab\/render\/tutorial/)
  })
})

test.describe('/lab/render/tutorial 稽古', () => {
  test('step=1 から次のステップへ進める', async ({ page }) => {
    await page.goto('/lab/render/tutorial')
    await expect(page.locator('h1')).toContainText(/導入|ブラウザの 1 フレーム/)

    // モバイル viewport ではラベルが「次」のみになるため regex をゆるめる
    await page.getByRole('button', { name: /^次/ }).click()
    await expect(page).toHaveURL(/\?step=2/)
  })

  test('?step=5 直リンクで 5 ステップ目が開ける', async ({ page }) => {
    await page.goto('/lab/render/tutorial?step=5')
    await expect(page.locator('h1')).toContainText(/理論と実測|Theory/)
  })

  test('最終ステップで道場モードへの誘導が出る', async ({ page }) => {
    await page.goto('/lab/render/tutorial?step=8')
    // モバイル viewport ではラベルが「道場」のみになる
    await expect(page.getByRole('link', { name: /^道場/ })).toBeVisible()
  })
})

test.describe('/lab/render/playground 道場', () => {
  test.describe.configure({ mode: 'serial' })

  test('実行ボタンで計測が始まり停止ボタンに切り替わる', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'LoAF は Chromium 限定なので計測挙動は Chromium のみ検証')

    await page.goto('/lab/render/playground')
    await expect(page.locator('h1')).toContainText('道場')

    const runBtn = page.getByRole('button', { name: /実行/ })
    await expect(runBtn).toBeVisible()
    await runBtn.click()

    // 停止ボタンに切り替わる
    await expect(page.getByRole('button', { name: /停止/ })).toBeVisible()
  })

  test('リセットボタンで初期状態に戻る', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chromium のみで検証')
    await page.goto('/lab/render/playground')
    await page.getByRole('button', { name: /リセット/ }).click()
    // 500 (デフォルト要素数) が表示される
    await expect(page.getByText('500', { exact: true })).toBeVisible()
  })
})
