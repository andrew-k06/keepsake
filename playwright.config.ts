import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  use: {
    baseURL: 'http://localhost:5199/keepsake/',
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command: 'npm run dev -- --port 5199',
    url: 'http://localhost:5199/keepsake/',
    reuseExistingServer: true,
    timeout: 30_000,
  },
})
