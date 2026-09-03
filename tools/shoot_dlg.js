const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', e => console.log('PAGEERROR', e.message));
  await page.goto('http://localhost:8080/index.html');
  await page.waitForSelector('#new'); await page.click('#new'); await page.waitForTimeout(300);
  await page.evaluate(() => { UI.closeScreen(); Game.state.phase = 'play'; Game.busy = false; World.load('white_house', 'default'); Game.fade = 0; World.player.x = 7 * 32 + 16; World.player.y = 4 * 32 + 30; World.player.dir = 'up'; });
  await page.waitForTimeout(300);
  await page.keyboard.press('Space'); await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tools/shots/21_jackson_dialogue.png' });
  for (let i = 0; i < 10; i++) { if (await page.$('#dlg-choices button')) break; await page.keyboard.press('Space'); await page.waitForTimeout(450); }
  await page.screenshot({ path: 'tools/shots/22_jackson_choices.png' });
  await browser.close();
})();
