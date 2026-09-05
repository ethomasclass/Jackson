/* Runs the whole three-act story on the fast clock (?fast: act deadlines in seconds) and screenshots
   each beat. Usage: python3 -m http.server 8080 & CHROMIUM=... node tools/shoot_story.js */
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const PORT = process.env.PORT || 8080;
const OUT = path.join(__dirname, 'shots'); fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }).catch(async () => chromium.launch({ args: ['--no-sandbox'] }));
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts.googleapis/.test(m.text())) errors.push('console: ' + m.text()); });
  const shot = (n) => page.screenshot({ path: `${OUT}/s${n}.png` });
  const sleep = (ms) => page.waitForTimeout(ms);
  const dlgOpen = () => page.evaluate(() => !document.querySelector('#dialogue').classList.contains('hidden'));
  const state = () => page.evaluate(() => ({ act: Game.state.act, clock: Math.round(Game.state.clock), room: Game.state.room, busy: Game.busy, cut: Story.cut, prelim: Game.state.prelim, flags: Object.keys(Game.state.flags).filter(k => /crack|toby|thorne|foy|stewart/.test(k)) }));
  // advance a dialogue: click a choice by regex if given, else the last (leave) button, else Space
  const advance = async (pick) => {
    for (let i = 0; i < 80; i++) {
      if (!(await dlgOpen())) return;
      const btns = await page.$$('#dlg-choices button');
      if (btns.length) {
        let b = null;
        if (pick) for (const x of btns) { if (pick.test(await x.textContent())) { b = x; break; } }
        if (!b) b = btns[btns.length - 1];
        await b.click(); await sleep(250);
      } else { await page.keyboard.press('Space'); await sleep(160); }
    }
  };
  const untilFree = async (ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const s = await state(); if (!s.busy && !s.cut && !(await dlgOpen())) return; await sleep(200); } };
  // wait for an act-break to begin (Toby's summons dialogue) then play through the cutscene
  const playBreak = async (label, choiceRx) => {
    const t0 = Date.now();
    while (Date.now() - t0 < 40000) { if (await dlgOpen()) break; await sleep(200); }
    await sleep(300); await shot(label + 'a');
    await page.keyboard.press('Space'); await sleep(2500); await shot(label + 'b');
    // step through everything until the act card shows or the game is free again
    for (let i = 0; i < 120; i++) {
      if (await page.$('.actcard')) break;
      if (await dlgOpen()) await advance(choiceRx); else await sleep(300);
      if (i === 12) await shot(label + 'c');
    }
    await shot(label + 'd');
    const go = await page.$('.actcard #go'); if (go) await go.click();
    await sleep(800);
    if (await dlgOpen()) { await shot(label + 'e'); await advance(); }
    await untilFree();
    await shot(label + 'f');
    console.log(label, JSON.stringify(await state()));
  };

  await page.goto(`http://localhost:${PORT}/index.html?fast=8`);
  await page.waitForSelector('#new', { timeout: 20000 });
  await page.click('#new'); await sleep(500);
  for (let i = 0; i < 7; i++) { await page.keyboard.press('Space'); await sleep(120); }
  await sleep(300);
  await page.keyboard.press('Space'); await sleep(150); await page.keyboard.press('Space'); await sleep(400);
  for (const b of await page.$$('.dossier-list button[data-id]')) { await b.click(); await sleep(60); }
  await page.click('.dossier-list .btn'); await sleep(300);
  await page.keyboard.press('Space'); await sleep(150); await page.keyboard.press('Space'); await sleep(600);
  await shot('01_actcard1');
  await page.click('.actcard #go'); await sleep(900);
  await shot('02_office_hud');
  // out to the street: Toby attaches
  page.evaluate(() => { void Game.goto('street', 'default'); });
  await sleep(1500);
  for (let i = 0; i < 30 && !(await dlgOpen()); i++) await sleep(200);
  await shot('03_toby_meet');
  await advance(); await untilFree();
  await page.keyboard.down('ArrowRight'); await sleep(900); await page.keyboard.up('ArrowRight'); await sleep(300);
  await shot('04_follower');
  // grab the steps evidence quickly so Act I can also end by progress in a real game (here the clock will end it)
  console.log('act1', JSON.stringify(await state()));
  await playBreak('05_break1');
  // Act II: talk to both witnesses
  await page.evaluate(() => { World.player.x = 12 * 32 + 16; World.player.y = 8 * 32 + 30; World.player.dir = 'right'; });
  await sleep(200); await page.keyboard.press('Space'); await sleep(400); await shot('06_foy'); await advance(/coat/); await advance(); await untilFree();
  await page.evaluate(() => { World.player.x = 14 * 32 + 16; World.player.y = 8 * 32 + 30; World.player.dir = 'right'; });
  await sleep(200); await page.keyboard.press('Space'); await sleep(400); await advance(/drinks/); await advance(); await untilFree();
  console.log('act2', JSON.stringify(await state()));
  await shot('07_after_witnesses');
  // Thorne in the office
  await page.evaluate(() => { World.player.x = 5 * 32 + 16; World.player.y = 8 * 32 + 30; World.player.dir = 'left'; });
  await sleep(200); await page.keyboard.press('Space'); await sleep(400); await shot('08_thorne'); await advance(/threatening/); await advance(); await untilFree();
  await playBreak('09_break2', /Poindexter|Send/);
  console.log('act3', JSON.stringify(await state()));
  // Act III: the senator at the hotel reacts to the paper (only if the clock has not already run out)
  if (!(await dlgOpen())) {
    page.evaluate(() => { void Game.goto('hotel', 'default'); }); await sleep(1500); await untilFree();
    if (!(await dlgOpen())) {
      await page.evaluate(() => { World.player.x = 15 * 32 + 16; World.player.y = 8 * 32 + 30; World.player.dir = 'right'; });
      await sleep(200); await page.keyboard.press('Space'); await sleep(400); await shot('10_poindexter'); await advance(/newspaper/); await advance(); await untilFree(8000);
    }
  }
  // let the clock run out: forced accusation
  const t0 = Date.now();
  while (Date.now() - t0 < 40000) { if (await dlgOpen()) break; await sleep(200); }
  await shot('11_force'); await advance(/Clay|Issue/); await sleep(2500);
  await shot('12_trial');
  for (let i = 0; i < 6; i++) { const r = await page.$('#rack .slot'); if (r) await r.click(); else await page.keyboard.press('Space'); await sleep(500); }
  await shot('13_trial_mid');
  console.log('end', JSON.stringify(await state()));
  console.log(errors.length ? errors.join('\n') : 'no errors');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
