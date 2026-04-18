/**
 * Playwright 設定。
 * - MVP では Chromium を主ターゲット、Safari/Firefox は解説ページの読み込みだけ確認する
 * - モバイルは Pixel 5 を 1 プロファイル追加（「PC 推奨」表示の確認）
 * - webServer は本番ビルドを使う（dev は HMR で挙動が変わるため）
 */

import { defineConfig, devices } from '@playwright/test'

const PORT = 3000
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests',
  testMatch: ['e2e/**/*.spec.ts', 'visual/**/*.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    // CI では build 済みを前提に start、ローカルは reuseExistingServer で pnpm dev も許可
    command: process.env.CI ? 'pnpm start' : 'pnpm dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
