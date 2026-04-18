/**
 * フィードバック送信。
 * - Lab ページ末尾の FeedbackButton が描画される
 * - Good を押すとコメント欄が展開する
 * - /api/feedback は route.intercept で stub し、成功トーストの描画を確認する
 */

import { expect, test } from '@playwright/test'

test.describe('フィードバック送信', () => {
  test('Good → コメント入力 → 送信で完了メッセージが出る', async ({ page }) => {
    // API を stub（実ネットワーク・実 D1 を呼ばずに済ませる）
    await page.route('**/api/feedback', (route) => route.fulfill({ status: 204, body: '' }))

    await page.goto('/lab/render')

    const section = page.getByLabel('フィードバック')
    await expect(section).toBeVisible()

    // WebKit など hydration の遅いブラウザで click が React のイベントハンドラ登録前に
    // 届くと state 更新が走らず、そのまま textarea が出ない。aria-pressed の反映を
    // 成功判定にして、届いていなければクリックを再試行する
    const goodBtn = section.getByRole('button', { name: /役立った/ })
    await expect(async () => {
      await goodBtn.click()
      await expect(goodBtn).toHaveAttribute('aria-pressed', 'true', { timeout: 1000 })
    }).toPass({ timeout: 10000 })

    // コメント欄が表示される
    const textarea = section.getByLabel('コメント')
    await expect(textarea).toBeVisible()
    await textarea.fill('動きが分かりやすかった')

    await section.getByRole('button', { name: /送信する/ }).click()

    // 完了ブロックに置き換わる
    await expect(page.getByText('送信ありがとうございます')).toBeVisible()
  })
})
