const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: { baseURL: 'http://localhost:3099' },
  projects: [
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
      testMatch: ['polar-pull.spec.js'],
    }
  ],
  webServer: {
    command: 'PORT=3099 bun dashboard/server.js',
    port: 3099,
    reuseExistingServer: true,
    timeout: 10000,
  },
});
