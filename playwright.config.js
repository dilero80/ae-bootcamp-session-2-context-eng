const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm run start:backend',
      url: 'http://127.0.0.1:3030/',
      env: { PORT: '3030' },
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'npm run start:frontend',
      url: 'http://127.0.0.1:3000/',
      env: { PORT: '3000', BROWSER: 'none' },
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
