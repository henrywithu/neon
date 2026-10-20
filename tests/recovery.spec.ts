import { test, expect } from '@playwright/test';
test('Settings contains focus, isolates held driving keys and restores the opener', async ({ page }) => {
  await page.goto('/tests/harness.html');
  await page.waitForFunction(() => (window as any).harness);
  await page.keyboard.down('w');
  await page.evaluate(() => (window as any).harness.input.update(.1));
  await page.click('#open');
  await expect(page.locator('.settings-glass')).toBeVisible();
  expect(await page.evaluate(() => (window as any).harness.input.state.throttle)).toBe(0);
  await page.locator('[data-reset-game]').focus(); await page.keyboard.press('Tab');
  expect(await page.evaluate(() => !!document.activeElement?.closest('.settings-glass'))).toBe(true);
  await page.keyboard.press('e');
  expect(await page.evaluate(() => (window as any).harness.input.consumeActions())).toBeNull();
  await page.keyboard.press('Escape');
  await expect(page.locator('.settings-overlay')).toBeHidden(); await expect(page.locator('#open')).toBeFocused();
  await page.keyboard.up('w');
});
test('nested About closes only the top surface and filters invisible focus targets', async ({ page }) => {
  await page.goto('/tests/harness.html'); await page.click('#open'); await page.locator('[data-about]').click();
  await expect(page.locator('.about-overlay')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.about-overlay')).toBeHidden(); await expect(page.locator('.citymap')).toHaveCount(0);
});
test('rotation retains CSS target sizes and clears pointer holds', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
  const page = await context.newPage(); await page.goto('/tests/harness.html'); await page.waitForFunction(() => (window as any).harness);
  const gas = page.locator('[data-hold="throttle"]');
  const box = (await gas.boundingBox())!;
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }] });
  await page.evaluate(() => (window as any).harness.input.update(.1));
  expect(await page.evaluate(() => (window as any).harness.input.state.throttle)).toBeGreaterThan(0);
  for (const size of [{ width: 390, height: 844 }, { width: 844, height: 390 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(size);
    await expect.poll(() => page.evaluate(() => document.querySelector('canvas')!.width)).toBe(size.width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(size.width);
    expect(await page.evaluate(() => window.visualViewport!.scale)).toBe(1);
    const utility = await page.locator('.touch-drive__util').first().boundingBox(); expect(utility!.height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => (window as any).harness.input.state.throttle)).toBe(0);
  }
  await page.screenshot({ path: 'docs/evidence/implemented-portrait.png' }); await context.close();
});
test('touch Help and pause work without keyboard controls', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
  const page = await context.newPage(); await page.goto('/tests/harness.html');
  await page.waitForFunction(() => (window as any).harness);
  await page.evaluate(() => (window as any).harness.pause.open());
  await page.locator('[data-help]').tap();
  await expect(page.locator('.touch-help')).toBeVisible(); await expect(page.locator('.touch-help')).toContainText('left thumb');
  await page.locator('.drive-controls .walk-controls__close').tap();
  await page.tap('#open'); await page.locator('[data-about]').tap();
  await expect(page.locator('.about-recommended--mobile')).toBeVisible(); await expect(page.locator('.about-recommended--desktop')).toBeHidden();
  await context.close();
});
test('blur, cancellation, lost capture and disconnection release every held input', async ({ page }) => {
  await page.goto('/tests/harness.html'); await page.waitForFunction(() => (window as any).harness);
  for (const event of ['blur', 'neon:clear-input', 'gamepaddisconnected']) {
    await page.keyboard.down('w'); await page.evaluate(() => (window as any).harness.input.update(.1));
    await page.evaluate(name => window.dispatchEvent(new Event(name)), event);
    expect(await page.evaluate(() => (window as any).harness.input.state.throttle)).toBe(0);
    await page.keyboard.up('w');
  }
});
test('failure screen preserves saves and exposes a lower cost restart without advertising WebGL', async ({ page }) => {
  await page.goto('/tests/harness.html'); await page.waitForFunction(() => (window as any).harness);
  await page.evaluate(() => { localStorage.setItem('trapnest-neon:progress', 'preserved'); (window as any).harness.showRecovery(new Error('blocked kit.glb'), 'asset'); });
  await expect(page.locator('.night-recovery')).toContainText('could not finish loading');
  await expect(page.getByRole('button', { name: 'Retry', exact: true })).toBeFocused();
  await expect(page.locator('.night-recovery')).not.toContainText('WebGL');
  expect(await page.evaluate(() => localStorage.getItem('trapnest-neon:progress'))).toBe('preserved');
  await page.screenshot({ path: 'docs/evidence/implemented-recovery.png' });
});
test('actual required model failure reaches the recovery surface', async ({ page }) => {
  await page.route('**/models/game/city/kit.glb', route => route.abort());
  await page.goto('/?backend=webgl&dpr=0.25&noaudio&nointro');
  await expect(page.locator('.night-recovery')).toBeVisible({ timeout: 40000 });
  await expect(page.getByRole('button', { name: 'Retry', exact: true })).toBeVisible();
});
