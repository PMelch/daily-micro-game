// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3099',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['smoke.spec.js', 'sync-or-sink.spec.js', 'neon-drift.spec.js', 'roll-call.spec.js', 'vibe-check.spec.js', 'patch-panic.spec.js', 'patch-panic-screenshot.spec.js', 'day-061-bank-shot.spec.js'],
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: ['smoke.spec.js', 'day-061-bank-shot.spec.js'],
    },
  ],
  webServer: {
    command: 'PORT=3099 bun dashboard/server.js',
    port: 3099,
    reuseExistingServer: !process.env.CI,
    timeout: 10_000,
  },
});
