import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
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
  expect(await page.evaluate(() => (window as any).missionHarness.landmark.marker().done)).toBe(true);
  await page.evaluate(() => (window as any).missionHarness.progress.setCar('tsurugi'));
  await page.locator('[data-cruise]').click();
  expect(await page.evaluate(() => (window as any).missionHarness.progress.isMissionDone('first-fare'))).toBe(true);
  await page.reload(); await page.waitForFunction(() => (window as any).missionHarness);
  expect(await page.evaluate(() => (window as any).missionHarness.progress.storySeen('glass-turn-reward'))).toBe(true);
  expect(await page.evaluate(() => (window as any).missionHarness.progress.car)).toBe('tsurugi');
  expect(await page.evaluate(() => (window as any).missionHarness.landmark.marker().done)).toBe(true);
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
  const coverage = [];
  for (const [width,height] of [[1440,900],[1280,720],[844,390],[740,360],[390,844],[360,800]]) {
    const context=await browser.newContext({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000});
    const page=await context.newPage(); await page.goto('/tests/harness.html'); await page.waitForFunction(()=>(window as any).harness);
    await page.evaluate(()=>{document.getElementById('open')!.style.visibility='hidden'});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
    const measured = await page.evaluate(() => {
      const rects = [...document.querySelectorAll<HTMLElement>('.drive-hud, .minimap, .gps-hud, .app-header-actions > .hdr-btn, .night-objective')].filter(el => getComputedStyle(el).visibility !== 'hidden' && +getComputedStyle(el).opacity > 0 && el.getClientRects().length).map(el => {
        const r=el.getBoundingClientRect(); return {selector:el.className,left:Math.max(0,r.left),right:Math.min(innerWidth,r.right),top:Math.max(0,r.top),bottom:Math.min(innerHeight,r.bottom)};
      });
      const xs=[...new Set(rects.flatMap(r=>[r.left,r.right]))].sort((a,b)=>a-b);let area=0;
      for(let i=1;i<xs.length;i++){const intervals=rects.filter(r=>r.left<xs[i]&&r.right>xs[i-1]).map(r=>[r.top,r.bottom]).sort((a,b)=>a[0]-b[0]);let total=0,end=-Infinity;for(const [top,bottom] of intervals){total+=Math.max(0,bottom-Math.max(top,end));end=Math.max(end,bottom)}area+=(xs[i]-xs[i-1])*total}
      return {width:innerWidth,height:innerHeight,unionArea:area,ratio:area/(innerWidth*innerHeight),rects,method:'Conservative union of instrument/control backing rectangles; overlaps counted once. Circle/gradient instrument corners overestimate coverage.'};
    });
    coverage.push(measured); if (width>=1000) expect(measured.ratio).toBeLessThan(.2);
    if (width<1000) {
      await expect(page.locator('.phone-instruments')).toBeVisible();
      for (const item of await page.locator('[data-hold]').all()) { const r=(await item.boundingBox())!; expect(r.width).toBeGreaterThanOrEqual(56);expect(r.height).toBeGreaterThanOrEqual(56);expect(r.x+r.width).toBeLessThanOrEqual(width); }
    }
    await page.screenshot({path:`docs/evidence/hud-${width}x${height}.png`});
    await page.evaluate(()=>(window as any).harness.pause.open());
    await expect(page.locator('[data-resume]')).toBeVisible();
    await context.close();
  }
  await writeFile('docs/evidence/hud-coverage.json', JSON.stringify(coverage,null,2)+'\n');
});
test('reading, map, radio and room surfaces share focus and top-only Escape', async ({ page }) => {
  await page.goto('/tests/harness.html');await page.waitForFunction(()=>(window as any).harness?.openSurface);
  for (const [name,selector] of [['story','.story-screen'],['messages','.phone-screen'],['radio','.radio'],['map','.citymap'],['achievements','.achievements'],['rooms','.lby'],['friends','.mp-chip']]) {
    await page.locator('#open').focus(); await page.evaluate(name=>(window as any).harness.openSurface(name),name);
    await expect(page.locator(selector).last()).toBeVisible();
    await page.keyboard.press('Shift+Tab');await page.keyboard.press('Tab');
    expect(await page.evaluate(selector=>!!document.activeElement?.closest(selector),selector)).toBe(true);
    await page.keyboard.press('e');expect(await page.evaluate(()=>(window as any).harness.input.consumeActions())).toBeNull();
    if(name==='friends'){await page.locator('[data-do=track]').click();expect(await page.evaluate(()=>(window as any).trackedDriver)).toBe('TESTB001')}
    await page.keyboard.press('Escape');
    if(name==='friends') await expect(page.locator(selector).last()).not.toHaveClass(/is-open/);
    else await expect(page.locator(selector).last()).not.toBeVisible();
  }
});
test('save failure is explained while the player can continue', async ({ page }) => {
  await page.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('storage unavailable')};Storage.prototype.setItem=()=>{throw new Error('storage unavailable')}});
  await page.goto('/tests/harness.html');await page.click('#open');
  await expect(page.locator('[data-save-status]')).toContainText('Local saving is unavailable');
  await page.locator('[data-pref="speedBlur"]').uncheck();await expect(page.locator('[data-pref="speedBlur"]')).not.toBeChecked();
});
test('anchored steering and powered drift work with two touches and cancel cleanly', async ({ browser }) => {
  const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true});const page=await context.newPage();
  await page.goto('/tests/harness.html');await page.tap('#open');await page.locator('[data-pref=steering]').selectOption('analog');await page.locator('.settings-close').tap();
  const pad=(await page.locator('.touch-drive__steer').boundingBox())!;const drift=(await page.locator('[data-hold=handbrake]').boundingBox())!;
  const cdp=await context.newCDPSession(page);const left={id:1,x:pad.x+pad.width/2,y:pad.y+pad.height/2};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[left]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...left,x:left.x-48}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...left,x:left.x-48},{id:2,x:drift.x+drift.width/2,y:drift.y+drift.height/2}]});
  const held=await page.evaluate(()=>(window as any).harness.input.update(.3));expect(held.steer).toBeGreaterThan(.1);expect(held.throttle).toBeGreaterThan(.5);expect(held.handbrake).toBe(1);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  const released=await page.evaluate(()=>(window as any).harness.input.update(1));expect(released.steer).toBe(0);expect(released.throttle).toBe(0);expect(released.handbrake).toBe(0);
  await context.close();
});
test('gamepad focus works in Pause and a held trigger must return to neutral', async ({ page }) => {
  await page.goto('/tests/harness.html');await page.waitForFunction(()=>(window as any).harness);
  await page.evaluate(()=>{const pad={index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};(window as any).testPad=pad;Object.defineProperty(navigator,'getGamepads',{value:()=>[pad]});(window as any).harness.pause.open()});
  await page.waitForTimeout(60);
  await page.evaluate(()=>(window as any).testPad.buttons[13].pressed=true);
  await expect(page.locator('[data-help]')).toBeFocused();
  await page.evaluate(()=>(window as any).testPad.buttons[13].pressed=false);
  await page.evaluate(()=>(window as any).testPad.buttons[0].pressed=true);
  await expect(page.locator('.drive-controls .walk-controls__overlay')).toBeVisible();
  await page.evaluate(()=>{(window as any).testPad.buttons[0].pressed=false;(window as any).testPad.buttons[7]={pressed:true,value:1}});
  await page.keyboard.press('Escape');
  expect(await page.evaluate(()=>(window as any).harness.input.update(.2).throttle)).toBe(0);
  await page.evaluate(()=>(window as any).testPad.buttons[7]={pressed:false,value:0});await page.evaluate(()=>(window as any).harness.input.update(.2));
  await page.evaluate(()=>(window as any).testPad.buttons[7]={pressed:true,value:1});
  expect(await page.evaluate(()=>(window as any).harness.input.update(.2).throttle)).toBeGreaterThan(0);
});
