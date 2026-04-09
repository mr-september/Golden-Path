import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3001/Golden-Path/',
    browserName: 'chromium',
    headless: true,
  },
});
