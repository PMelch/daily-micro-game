// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: { baseURL: 'http://localhost:3099' },
  projects: [{ name: 'mobile', testMatch: ['day-061-bank-shot-screenshot.spec.js'] }],
  webServer: {
    command: 'PORT=3099 bun dashboard/server.js',
    port: 3099,
    reuseExistingServer: true,
    timeout: 10000,
  },
});
