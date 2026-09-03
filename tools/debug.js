const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('response', r => { if (r.status() === 404) errs.push('404 ' + r.url()); });
  await page.goto('http://localhost:8080/index.html');
  await page.waitForSelector('#new');
  await page.click('#new');
  await page.waitForTimeout(300);
  const r = await page.evaluate(async () => {
    UI.closeScreen(); Game.state.phase = 'play'; Game.busy = false; Game.modal = false;
    World.load('magistrate', 'default');
    World.player.y = 134; World.player.dir = 'up';
    const t = World.target();
    return { target: t && t.kind, py: World.player.y, px: World.player.x, npc: World.npcs.map(n => [n.id, n.x, n.y, JSON.stringify(n.def.reach)]), busy: Game.busy, modal: Game.modal, fade: Game.fade, dir: Game.fadeDir };
  });
  console.log(JSON.stringify(r));
  await page.keyboard.press('Space');
  await page.waitForTimeout(800);
  console.log('dialogue hidden?', await page.evaluate(() => document.getElementById('dialogue').classList.contains('hidden')), await page.evaluate(() => ({busy: Game.busy, pressed: Object.keys(Input.pressedKeys), down: Input.down})));
  console.log(errs.join('\n'));
  await browser.close();
})();
