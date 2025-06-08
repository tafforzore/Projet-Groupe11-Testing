
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  use: {
    headless: true,
    browserName: 'chromium', // uniquement chromium
    baseURL: 'http://localhost:3000',
  },
});
