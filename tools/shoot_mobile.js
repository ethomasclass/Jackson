const { chromium, devices } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ ...devices['iPhone 13 landscape'] });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.goto('http://localhost:8080/dist/index.html');
  await page.waitForSelector('#new', { timeout: 20000 });
  await page.tap('#new');
  await page.waitForTimeout(300);
  await page.evaluate(() => { UI.closeScreen(); Game.state.phase = 'play'; Game.busy = false; World.load('magistrate', 'default'); Game.fade = 0; });
  await page.waitForTimeout(300);
  // hold the up button via touch for a moment
  const up = await page.$('#dpad button[data-d="up"]');
  const box = await up.boundingBox();
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'tools/shots/20_mobile.png' });
  console.log(errs.join('\n') || 'no errors', await page.evaluate(() => ({ scale: window.STAGE_SCALE, touch: Touch.active, w: innerWidth, h: innerHeight })));
  await browser.close();
})();
