import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({
  ...base,
  testIgnore: [], testMatch: '**/runtime.spec.ts',
  use: { ...base.use, baseURL: 'http://127.0.0.1:4173' },
  webServer: { command: 'npm run build && npm run preview', url: 'http://127.0.0.1:4173', timeout: 120000, reuseExistingServer: false }
});
