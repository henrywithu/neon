import { test, expect } from '@playwright/test';
test('guided job teaches in order, requires stopping, rewards and survives reload', async ({ page }) => {
  await page.goto('/tests/missions.html'); await page.waitForFunction(() => (window as any).missionHarness);
  await page.evaluate(() => { void (window as any).missionHarness.welcome(); });
  await page.locator('[data-guided]').click(); await page.evaluate(() => (window as any).missionHarness.guide.begin());
  await page.evaluate(() => (window as any).missionHarness.step(5));
  await expect(page.locator('.night-objective')).toContainText('get moving');
  await page.evaluate(() => (window as any).missionHarness.setSpeed(20));
  await expect(page.locator('.night-objective')).toContainText('Hold S');
  await page.evaluate(() => (window as any).missionHarness.arrive(30));
  expect(await page.evaluate(() => (window as any).missionHarness.missions.runInfo.stopIndex)).toBe(0);
  await page.evaluate(() => (window as any).missionHarness.arrive(0));
  expect(await page.evaluate(() => (window as any).missionHarness.missions.runInfo.stopIndex)).toBe(1);
  await expect(page.locator('.night-objective')).toContainText('A / D');
  await page.evaluate(() => { const h = (window as any).missionHarness; h.drive.input.state.steer=.6; h.setSpeed(10); });
  await expect(page.locator('.night-objective')).toContainText('final marker');
  await page.evaluate(() => (window as any).missionHarness.arrive(0));
  await expect(page.locator('.night-choice')).toContainText('You left a light on');
  await page.locator('[data-cruise]').click();
  expect(await page.evaluate(() => (window as any).missionHarness.progress.isMissionDone('first-fare'))).toBe(true);
  await page.reload(); await page.waitForFunction(() => (window as any).missionHarness);
  expect(await page.evaluate(() => (window as any).missionHarness.progress.storySeen('glass-turn-reward'))).toBe(true);
  await page.evaluate(() => { void (window as any).missionHarness.welcome(); }); await expect(page.locator('.night-choice')).toBeHidden();
});
test('Just drive is immediate and the short job remains optional', async ({ page }) => {
  await page.goto('/tests/missions.html'); await page.waitForFunction(() => (window as any).missionHarness);
  await page.evaluate(() => { void (window as any).missionHarness.welcome(); }); await page.locator('[data-cruise]').click();
  await page.evaluate(() => (window as any).missionHarness.guide.begin());
  expect(await page.evaluate(() => (window as any).missionHarness.missions.active)).toBe(false);
  await page.evaluate(() => (window as any).missionHarness.guide.start());
  expect(await page.evaluate(() => (window as any).missionHarness.missions.active)).toBe(true);
});
test('comfort, mix and steering settings persist, including denied storage', async ({ page }) => {
  await page.goto('/tests/harness.html'); await page.click('#open');
  await page.locator('[data-pref="steering"]').selectOption('analog');
  await page.locator('[data-pref="cameraMotion"]').uncheck();
  await page.locator('[data-pref="music"]').fill('0.35');
  await page.reload(); await page.click('#open');
  await expect(page.locator('[data-pref="steering"]')).toHaveValue('analog');
  await expect(page.locator('[data-pref="cameraMotion"]')).not.toBeChecked();
  await expect(page.locator('[data-pref="music"]')).toHaveValue('0.35');
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('storage denied'); }; });
  await page.reload(); await page.click('#open'); await page.locator('[data-pref="steering"]').selectOption('buttons');
  await expect(page.locator('[data-pref="steering"]')).toHaveValue('buttons');
});
test('HUD and menus fit all planned CSS viewports', async ({ browser }) => {
  for (const [width,height] of [[1440,900],[1280,720],[844,390],[740,360],[390,844],[360,800]]) {
    const context=await browser.newContext({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000});
    const page=await context.newPage(); await page.goto('/tests/harness.html'); await page.waitForFunction(()=>(window as any).harness);
    await page.evaluate(()=>{document.getElementById('open')!.style.visibility='hidden'});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
    if (width<1000) {
      await expect(page.locator('.phone-instruments')).toBeVisible();
      for (const item of await page.locator('[data-hold]').all()) { const r=(await item.boundingBox())!; expect(r.width).toBeGreaterThanOrEqual(56);expect(r.height).toBeGreaterThanOrEqual(56);expect(r.x+r.width).toBeLessThanOrEqual(width); }
    }
    await page.screenshot({path:`docs/evidence/hud-${width}x${height}.png`});
    await page.evaluate(()=>(window as any).harness.pause.open());
    await expect(page.locator('[data-resume]')).toBeVisible();
    await context.close();
  }
});
