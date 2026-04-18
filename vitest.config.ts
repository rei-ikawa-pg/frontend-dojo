import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
    // Playwright のテストは vitest で拾わない（tests/e2e, tests/visual は playwright 管轄）
    exclude: ['node_modules', '.next', '.open-next', 'tests/e2e/**', 'tests/visual/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
