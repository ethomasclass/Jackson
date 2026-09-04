/* Headless smoke test + screenshots. Usage: node tools/shoot.js [port]
   Starts nothing itself — run `python3 -m http.server 8080` in the repo root first. */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PORT = process.argv[2] || 8080;
const OUT = path.join(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }).catch(async () => chromium.launch({ args: ['--no-sandbox'] }));
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  const untilChoices = async () => { for (let i = 0; i < 24; i++) { if (await page.$('#dlg-choices button')) return true; await page.keyboard.press('Space'); await page.waitForTimeout(450); } return false; };
  await page.goto(`http://localhost:${PORT}/index.html`);
  await page.waitForSelector('#new', { timeout: 20000 });
  await page.screenshot({ path: `${OUT}/01_title.png` });
  await page.click('#new');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/02_opening.png` });
  for (let i = 0; i < 6; i++) { await page.keyboard.press('Space'); await page.waitForTimeout(150); }
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/03_briefing_intro.png` });
  await page.keyboard.press('Space'); await page.waitForTimeout(200); await page.keyboard.press('Space'); await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/04_dossier.png` });
  for (const b of await page.$$('.dossier-list button[data-id]')) { await b.click(); await page.waitForTimeout(80); }
  await page.screenshot({ path: `${OUT}/05_dossier_ross.png` });
  await page.click('.dossier-list .btn');
  await page.waitForTimeout(300);
  await page.keyboard.press('Space'); await page.waitForTimeout(200); await page.keyboard.press('Space');
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/06_magistrate_office.png` });
  // stand at the magistrate's desk and talk
  await page.evaluate(() => { World.player.x = 8 * 32 + 16; World.player.y = 6 * 32 + 30; World.player.dir = 'up'; });
  await page.waitForTimeout(200);
  await page.keyboard.press('Space'); await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/07_dialogue.png` });
  await untilChoices();
  await page.screenshot({ path: `${OUT}/08_choices.png` });
  // leave the conversation (last option)
  const btns = await page.$$('#dlg-choices button'); if (btns.length) await btns[btns.length - 1].click();
  await page.waitForTimeout(300);
  // walk to the street: down and out the door (exit gap is at columns 9-10)
  await page.evaluate(() => { World.player.x = 9 * 32 + 16; });
  await page.keyboard.down('ArrowDown'); await page.waitForTimeout(1600); await page.keyboard.up('ArrowDown');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/09_street.png` });
  // pick up the hat at the Capitol steps
  await page.evaluate(() => { World.load('capitol_steps', 'default'); Game.state.room = 'capitol_steps'; World.player.x = 10 * 32 + 16; World.player.y = 14 * 32 + 30; World.player.dir = 'up'; });
  await page.waitForTimeout(200);
  await page.keyboard.press('Space'); await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/09a_look.png` });
  await page.keyboard.press('Space'); await page.waitForTimeout(300); await page.keyboard.press('Space'); await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/09b_card.png` });
  await page.keyboard.press('Space'); await page.waitForTimeout(300);
  // show the hat to Gregory
  await page.evaluate(() => { World.load('hat_shop', 'default'); Game.state.room = 'hat_shop'; World.player.x = 8 * 32 + 16; World.player.y = 6 * 32 + 30; World.player.dir = 'up'; });
  await page.waitForTimeout(200);
  await page.keyboard.press('Space'); await page.waitForTimeout(300);
  await untilChoices();
  await page.screenshot({ path: `${OUT}/09c_gregory_menu.png` });
  const ev = await page.$('#dlg-choices button.evidence'); if (ev) await ev.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/09d_pick.png` });
  const slot = await page.$('#tray-grid .slot.filled'); if (slot) await slot.click();
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `${OUT}/09e_gregory_hat.png` });
  await page.evaluate(() => UI.Dialogue.hide());
  // teleport around for coverage using the engine directly
  const rooms = ['capitol_steps', 'jail', 'post_office', 'hat_shop', 'tavern', 'bank_office', 'print_shop', 'boarding_house', 'hotel', 'white_house'];
  for (const r of rooms) {
    await page.evaluate((r) => { World.load(r, 'default'); Game.state.room = r; }, r);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${OUT}/10_${r}.png` });
  }
  // street overview at a few camera spots
  await page.evaluate(() => { World.load('street', 'default'); World.player.x = 1500; World.player.y = 480; World.updateCamera(true); });
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}/11_street_east.png` });
  await page.evaluate(() => { World.player.x = 800; World.player.y = 860; World.updateCamera(true); });
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}/12_street_south.png` });
  // evidence tray with everything
  await page.evaluate(() => { for (const id of EVIDENCE_ORDER) { Game.state.evidence.push(id); Game.state.evidenceWhere[id] = 'test'; } UI.updateHud(); UI.Tray.open(); });
  await page.waitForTimeout(200);
  await page.click('#tray-grid .slot.filled');
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/13_tray.png` });
  await page.evaluate(() => UI.Tray.close());
  // trial + epilogue
  await page.evaluate(() => { for (const s of SUSPECTS) Game.state.interviewed.push(s.id); UI.updateHud(); });
  page.evaluate(() => Game.accuse('clay')).catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/14_trial.png` });
  for (let i = 0; i < 3; i++) { await page.keyboard.press('Space'); await page.waitForTimeout(200); }
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/15_trial_rack.png` });
  for (let round = 0; round < 3; round++) {
    const slot = await page.$('.rack .slot'); if (slot) await slot.click();
    await page.waitForTimeout(200); await page.keyboard.press('Space'); await page.waitForTimeout(200); await page.keyboard.press('Space'); await page.waitForTimeout(200);
  }
  for (let i = 0; i < 4; i++) { await page.keyboard.press('Space'); await page.waitForTimeout(200); }
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/16_epilogue.png` });
  console.log(errors.length ? errors.join('\n') : 'no console errors');
  await page.waitForTimeout(500); await browser.close();
})();
