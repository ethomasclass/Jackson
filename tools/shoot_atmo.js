/* Screenshots of the atmosphere pass in a few rooms. Uses continueGame with a synthetic save. */
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', e => console.log('PAGEERROR', e.message));
  await page.goto('http://localhost:8080/index.html');
  await page.waitForSelector('#new');
  await page.evaluate(() => { const s = Game.freshState(); s.phase = 'play'; s.flags.briefed = true; s.room = 'street'; Game.continueGame(s); });
  await page.waitForTimeout(600);
  const shots = [
    ['street', 13 * 32, 19 * 32, '30_atmo_lane'],
    ['street', 30 * 32, 9 * 32, '31_atmo_avenue'],
    ['street', 48 * 32, 9 * 32, '32_atmo_capitol'],
    ['tavern', 7 * 32, 6 * 32, '33_atmo_tavern'],
    ['white_house', 6 * 32, 6 * 32, '34_atmo_whitehouse'],
    ['jail', 6 * 32, 5 * 32, '35_atmo_jail'],
    ['capitol_steps', 9 * 32, 10 * 32, '36_atmo_steps'],
    ['magistrate', 5 * 32, 6 * 32, '37_atmo_magistrate'],
    ['bank_office', 5 * 32, 6 * 32, '38_atmo_bank'],
    ['print_shop', 4 * 32, 5 * 32, '39_atmo_print'],
    ['boarding_house', 5 * 32, 6 * 32, '40_atmo_boarding'],
    ['hotel', 5 * 32, 6 * 32, '41_atmo_hotel'],
    ['post_office', 5 * 32, 6 * 32, '42_atmo_post'],
    ['hat_shop', 4 * 32, 5 * 32, '43_atmo_hat'],
  ];
  for (const [room, x, y, name] of shots) {
    await page.evaluate(([room, x, y]) => { World.load(room, 'default'); Game.state.room = room; World.player.x = x + 16; World.player.y = y + 30; World.updateCamera(true); }, [room, x, y]);
    await page.waitForTimeout(1400);
    await page.screenshot({ path: `tools/shots/${name}.png` });
  }
  await browser.close();
})();
