import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'test/e2e',
  timeout: 120_000,
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce', // gyors robotfutás, nincs konfetti
    launchOptions: { executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium' }
  },
  webServer: { command: 'npm run dev', url: 'http://localhost:4173', reuseExistingServer: true, timeout: 120_000 }
})
