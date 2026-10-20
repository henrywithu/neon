import { test, expect } from '@playwright/test';
test('diagnostic renderer boots the full city and exposes recoverable context loss', async ({ page }) => {
  test.setTimeout(240000);
  let blockModel = true;
  await page.route('**/models/game/city/kit.glb', route => blockModel ? route.abort() : route.continue());
  await page.goto('/?backend=webgl&dpr=0.25&quality=low&nointro&noaudio&debug');
  await expect(page.locator('.night-recovery')).toContainText('could not finish loading');
  blockModel = false;
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await page.waitForFunction(() => !!(window as any).__neon || !!document.querySelector('.night-recovery'), null, { timeout: 120000 });
  const failure = await page.locator('.night-recovery').count();
  if (failure) throw new Error(await page.locator('.night-recovery').innerText());
  await expect(page.locator('#app-loader')).toHaveCount(0, { timeout: 30000 });
  await expect(page.locator('.app-header.show')).toBeVisible();
  await expect(page.locator('.drive-hud')).toBeVisible();
  await page.keyboard.down('w');
  await page.waitForFunction(() => Math.abs((window as any).__neon.drive.vehicle.telemetry.speedKmh) > 1, null, { timeout: 20000 });
  await page.keyboard.up('w');
  await page.keyboard.press('p');
  await expect(page.locator('.night-pause')).toBeVisible();
  expect(await page.evaluate(() => (window as any).__neon.drive.isPaused())).toBe(true);
  await page.locator('[data-resume]').click();
  // The full scene and driving have run. Isolate DOM/transfer checks from
  // SwiftShader's steady rendering cost; hardware first-use stalls are a manual gate.
  await page.evaluate(() => (window as any).__neon.renderLoop.stopLoop());
  await page.screenshot({ path: 'docs/evidence/diagnostic-city.png' });
  await page.evaluate(async () => (window as any).__neon.garage.open());
  await expect(page.locator('.garage.is-open')).toBeVisible();
  await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab');
  expect(await page.evaluate(() => !!document.activeElement?.closest('.garage'))).toBe(true);
  let optionalAttempts = 0;
  await page.route('**/models/game/tsurugi_rig.glb', route => { optionalAttempts++; return route.abort(); });
  for (let attempt = 1; attempt <= 2; attempt++) {
    await page.locator('.garage [data-step="1"]').click({ timeout: 10000 });
    await expect.poll(() => optionalAttempts).toBe(attempt);
    await expect(page.locator('.garage__blurb')).toContainText('could not arrive');
    await expect(page.locator('.garage-transit')).not.toHaveClass(/is-active/);
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('.garage')).toBeHidden({ timeout: 30000 });
  await page.evaluate(() => { document.querySelector('body > canvas')!.dispatchEvent(new Event('webglcontextlost', { cancelable: true })); });
  await expect(page.locator('.night-recovery')).toContainText('graphics connection was interrupted');
  expect(await page.evaluate(() => (window as any).__neon.drive.input.state.throttle)).toBe(0);
});
