import { test, expect } from '@playwright/test';
test('diagnostic renderer boots the full city and exposes recoverable context loss', async ({ page }) => {
  test.setTimeout(150000);
  await page.goto('/?backend=webgl&dpr=0.25&quality=low&nointro&noaudio&debug');
  await page.waitForFunction(() => !!(window as any).__neon || !!document.querySelector('.night-recovery'), null, { timeout: 120000 });
  const failure = await page.locator('.night-recovery').count();
  if (failure) throw new Error(await page.locator('.night-recovery').innerText());
  await expect(page.locator('#app-loader')).toHaveCount(0, { timeout: 30000 });
  await expect(page.locator('.app-header.show')).toBeVisible();
  await expect(page.locator('.drive-hud')).toBeVisible();
  await page.screenshot({ path: 'docs/evidence/diagnostic-city.png' });
  await page.evaluate(() => { document.querySelector('body > canvas')!.dispatchEvent(new Event('webglcontextlost', { cancelable: true })); });
  await expect(page.locator('.night-recovery')).toContainText('graphics connection was interrupted');
  expect(await page.evaluate(() => (window as any).__neon.drive.input.state.throttle)).toBe(0);
});
