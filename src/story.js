/* Story runtime: the clock, the acts and their deadlines, act breaks and set pieces, Toby the
   follower with his speech bubbles, Mr. Thorne's interceptions, and small cutscene tools. */
'use strict';

const Story = {
  minutes: 45, fast: false, _hudT: 0, tweens: [], bubbles: [], follower: null, trail: [], _barkQ: [], cut: false,

  init() {
    const q = new URLSearchParams(location.search);
    const m = parseFloat(q.get('minutes'));
    if (m >= 5 && m <= 180) this.minutes = m;
    this.fast = q.has('fast');            // ?fast=N: N real seconds per story minute instead of 60, for testing
    this.fastSec = parseFloat(q.get('fast')) || 1;
    this.el = { box: $('#story'), act: $('#story-act'), clock: $('#story-clock'), goals: $('#story-goals') };
  },

  // ---- time -----------------------------------------------------------------
  scale() { return (this.minutes / STORY.totalMinutes) * (this.fast ? this.fastSec : 60); },   // seconds per "story minute"
  deadline(a) { return STORY.acts[a].deadline * this.scale(); },
  totalSec() { return STORY.totalMinutes * this.scale(); },
  elapsed(S) { return (S || Game.state).clock || 0; },
  timeLabel(S) {
    const frac = Math.min(1, this.elapsed(S) / this.totalSec());
    const mins = Math.floor(STORY.startHour * 60 + frac * STORY.spanHours * 60);
    const h = Math.floor(mins / 60), m = mins % 60;
    const h12 = ((h + 11) % 12) + 1;
    return `${h12}:${m < 10 ? '0' : ''}${m} ${h < 12 ? 'AM' : 'PM'}`;
  },
  // "half past two" style label for dialogue that mentions the clock
  deadlineLabel(a) {
    const frac = this.deadline(a) / this.totalSec();
    const mins = Math.round((STORY.startHour * 60 + frac * STORY.spanHours * 60) / 30) * 30;
    const h = Math.floor(mins / 60), m = mins % 60;
    return `${((h + 11) % 12) + 1}${m ? ':30' : ''} ${h < 12 ? 'AM' : 'PM'}`;
  },

  // ---- state helpers -----------------------------------------------------------
  act(S) { return (S || Game.state).act || 1; },
  cracks(S) { return Object.keys(STORY.cracks).filter(k => (S || Game.state).flags['crack_' + k]).length; },
  crack(id) {
    const S = Game.state;
    if (S.flags['crack_' + id]) return;
    S.flags['crack_' + id] = true;
    UI.toast('In your notes: ' + STORY.cracks[id], 4500);
    this.bark(STORY.barks.crack);
    this.updateHud(); Game.save();
  },
  nameOf(id) { return SUSPECT[id] ? SUSPECT[id].name : (STORY.names[id] || id); },
  goalsDone(a, S) { return STORY.acts[a].goals.every(g => g.done(S || Game.state)); },

  // ---- per-frame ------------------------------------------------------------------
  tick(dt) {
    const S = Game.state;
    if (!S || S.phase !== 'play') return;
    if (!S.flags.trial_done && !S.accused) S.clock = (S.clock || 0) + dt;
    // tweens (cutscene walking) and idle animation continue even while the game is "busy"
    if (Game.busy) { World.t += dt; for (const e of World.extras) if (e.animate) e.animate(dt); for (const n of World.npcs) n.animate(dt); }
    for (const tw of [...this.tweens]) {
      const o = tw.obj, dx = tw.tx - o.x, dy = tw.ty - o.y, d = Math.hypot(dx, dy), step = tw.speed * dt;
      if (d <= step) { o.x = tw.tx; o.y = tw.ty; o.moving = false; this.tweens.splice(this.tweens.indexOf(tw), 1); tw.res(); continue; }
      o.x += dx / d * step; o.y += dy / d * step; o.moving = true;
      if (o.dir !== undefined) o.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      if (o.animate) o.animate(dt);
    }
    if (this.follower && World.room) this.updateFollower(dt);
    this.placeBubbles();
    this._hudT += dt;
    if (this._hudT > 0.5) { this._hudT = 0; this.updateHud(); }
    if (!Game.busy && !Game.modal && !this.cut) this.check();
  },

  check() {
    const S = Game.state, a = this.act(S), t = this.elapsed(S);
    if (S.flags.trial_done || S.accused) return;
    if (a <= 2) {
      if (this.goalsDone(a, S) || t >= this.deadline(a)) { this.endAct(a); return; }
    } else if (t >= this.deadline(3)) { this.force(); return; }
    if (t >= this.deadline(a) - 2 * this.scale() && !S.flags['warned' + a]) { S.flags['warned' + a] = true; this.bark(STORY.barks.warn[a]); }
    if (a === 3 && Game.warrantReady() && !S.flags.ready_bark) { S.flags.ready_bark = true; this.bark(STORY.barks.ready); }
  },

  // ---- HUD ------------------------------------------------------------------------
  updateHud() {
    const S = Game.state; if (!S || !this.el || !this.el.box) return;
    if (S.phase !== 'play' || !World.room) { this.el.box.classList.add('hidden'); return; }
    this.el.box.classList.remove('hidden');
    const a = this.act(S), A = STORY.acts[a];
    this.el.act.textContent = `${A.title} · ${A.name}`;
    this.el.clock.textContent = this.timeLabel(S);
    const left = this.deadline(a) - this.elapsed(S);
    this.el.clock.classList.toggle('late', left < 2 * this.scale());
    this.el.goals.innerHTML = A.goals.map(g => {
      const d = g.done(S); const c = g.count ? g.count(S) : null;
      return `<span class="${d ? 'done' : ''}">${d ? '☑' : '☐'} ${g.label}${c && !d ? ` (${c[0]}/${c[1]})` : ''}</span>`;
    }).join('');
  },

  // ---- Toby: follower ------------------------------------------------------------------
  attachToby() {
    const p = World.player;
    this.follower = new Entity('boy', p.x - 24, p.y, p.dir);
    this.follower.id = 'toby'; this.trail = [];
    World.follower = this.follower;
  },
  placeFollower() {
    if (!this.follower) return;
    const p = World.player, d = { down: [0, -1], up: [0, 1], left: [1, 0], right: [-1, 0] }[p.dir] || [0, 1];
    this.follower.x = p.x + d[0] * 26; this.follower.y = p.y + d[1] * 26; this.follower.dir = p.dir; this.follower.moving = false;
    this.trail = [];
  },
  updateFollower(dt) {
    const p = World.player, f = this.follower, tr = this.trail;
    const last = tr[tr.length - 1];
    if (!last || Math.hypot(p.x - last.x, p.y - last.y) > 6) tr.push({ x: p.x, y: p.y });
    if (tr.length > 60) tr.splice(0, tr.length - 60);
    const far = Math.hypot(p.x - f.x, p.y - f.y);
    if (far > 30 && tr.length) {
      const t = tr[0], dx = t.x - f.x, dy = t.y - f.y, d = Math.hypot(dx, dy), step = Math.min(d, 118 * dt);
      if (d < 3) { tr.shift(); }
      else { f.x += dx / d * step; f.y += dy / d * step; f.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }
      f.moving = true;
    } else { f.moving = false; if (!p.moving && far < 40) f.dir = p.dir; }
    f.animate(dt);
  },

  // ---- speech bubbles (Toby and crowds) -------------------------------------------------
  bubble(ent, text, ms = 3600) {
    const el = document.createElement('div'); el.className = 'bubble'; el.textContent = text;
    $('#overlay').appendChild(el);
    const b = { ent, el, until: performance.now() + ms };
    this.bubbles.push(b);
    setTimeout(() => { el.remove(); this.bubbles.splice(this.bubbles.indexOf(b), 1); }, ms);
    return b;
  },
  placeBubbles() {
    const cam = World.cam;
    for (const b of this.bubbles) {
      const x = Math.round(b.ent.x - cam.x), y = Math.round(b.ent.y - 52 - cam.y);
      b.el.style.left = x + 'px'; b.el.style.top = y + 'px';
      b.el.style.visibility = (x < -100 || x > VIEW_W + 100 || y < -40) ? 'hidden' : 'visible';
    }
  },
  bark(text) {
    if (!text || !this.follower) return;
    this._barkQ.push(text);
    if (!this._barking) this._drain();
  },
  _drain() {
    const t = this._barkQ.shift();
    if (!t) { this._barking = false; return; }
    this._barking = true;
    const ms = 2600 + t.length * 28;
    this.bubble(this.follower, t, ms);
    setTimeout(() => this._drain(), ms + 300);
  },
  onEvidence(id) { this.bark(STORY.barks.evidence[id]); },
  onInterviewed(id) { this.bark(STORY.barks.interviewed[id]); },

  // ---- cutscene tools ------------------------------------------------------------------
  spawn(sprite, tx, ty, dir = 'down') {
    const e = new Entity(sprite, tx * TILE + 16, ty * TILE + 30, dir);
    World.extras.push(e); return e;
  },
  prop(name, tx, ty) {
    const bd = Assets.buildings[name];
    const o = { kind: 'prop', im: bd.im, x: tx * TILE, y: ty * TILE, w: bd.w, h: bd.h };
    World.extras.push(o); return o;
  },
  walk(obj, tx, ty, speed = 70) {
    return new Promise(res => this.tweens.push({ obj, tx: tx * TILE + (obj.kind === 'prop' ? 0 : 16), ty: ty * TILE + (obj.kind === 'prop' ? 0 : 30), speed, res }));
  },
  wait(ms) { return new Promise(r => setTimeout(r, ms)); },
  say(lines) { return UI.Dialogue.run({ id: 'cut', name: '', portrait: null, start: 'a', nodes: { a: { text: lines, leave: false } } }); },
  pan(tx, ty) { World.camOverride = { x: tx * TILE, y: ty * TILE }; World.updateCamera(true); },
  clear() { World.extras = []; World.camOverride = null; this.tweens.forEach(t => t.res()); this.tweens = []; },

  // ---- entering a room: interceptions and Toby's remarks ---------------------------------------
  async onEnter(roomId) {
    const S = Game.state, a = this.act(S);
    if (roomId === 'street' && !S.flags.toby && a === 1) { await this.meetToby(); return; }
    if (roomId === 'street' && a >= 2 && !S.flags['thorne_int' + a]) { S.flags['thorne_int' + a] = true; await this.thorneIntercept(); return; }
    if (!S.flags['seen_room_' + roomId]) { S.flags['seen_room_' + roomId] = true; this.bark(STORY.barks.room[roomId]); }
  },
  async meetToby() {
    const S = Game.state; Game.busy = true; this.cut = true;
    const p = World.player;
    const boy = this.spawn('boy', Math.floor(p.x / TILE) + 5, Math.floor(p.y / TILE), 'left');
    await this.walk(boy, Math.floor(p.x / TILE) + 1, Math.floor(p.y / TILE), 90);
    p.dir = 'right';
    await UI.Dialogue.run(DIALOGUE.toby_meet);
    World.extras.splice(World.extras.indexOf(boy), 1);
    S.flags.toby = true; this.attachToby(); this.follower.x = boy.x; this.follower.y = boy.y;
    this.cut = false; Game.busy = false; Game.save();
    this.bark(STORY.barks.toby_attached);
  },
  async thorneIntercept() {
    Game.busy = true; this.cut = true;
    const p = World.player, px = Math.floor(p.x / TILE), py = Math.floor(p.y / TILE);
    const th = this.spawn('gentleman', px + 6, py, 'left');
    await this.walk(th, px + 1, py, 80);
    p.dir = 'right';
    await UI.Dialogue.run(DIALOGUE.thorne, { npc: th });
    this.walk(th, px + 7, py, 80).then(() => { const i = World.extras.indexOf(th); if (i >= 0) World.extras.splice(i, 1); });
    this.cut = false; Game.busy = false; Game.save();
  },

  // ---- act breaks --------------------------------------------------------------------------
  async endAct(a) {
    const S = Game.state; Game.busy = true; this.cut = true;
    UI.Tray.close();
    await UI.Dialogue.run(DIALOGUE.toby_summons);
    await Game.fadeOut();
    if (a === 1) await this.funeral(); else await this.bankCrowd();
    await Game.fadeOut();
    this.clear();
    if (a === 2) {
      // the magistrate wants a name for the President tonight
      World.load('magistrate', 'default'); this.placeFollower(); Game.state.room = 'magistrate';
      await Game.fadeIn();
      await UI.Dialogue.run(DIALOGUE.magistrate_prelim);
      await Game.fadeOut();
    }
    S.act = a + 1; S['actStart' + S.act] = S.clock;
    Game.save();
    await Scenes.actCard(S.act);
    World.load('magistrate', 'default'); this.placeFollower(); S.room = 'magistrate'; S.spawn = 'default';
    UI.banner(ROOMS.magistrate.name);
    await Game.fadeIn();
    if (S.act === 2) await UI.Dialogue.run(DIALOGUE.magistrate_act2);
    else this.bark(S.prelim === 'poindexter' ? "Everybody read it. Everybody. The Senator's at the hotel and he is not happy." : "Everybody's read it. The one you named is going to have things to say.");
    this.updateHud(); Game.save();
    this.cut = false; Game.busy = false;
  },

  async force() {
    const S = Game.state; Game.busy = true; this.cut = true;
    UI.Tray.close();
    await UI.Dialogue.run(DIALOGUE.toby_summons);
    await Game.fadeOut();
    World.load('magistrate', 'default'); this.placeFollower(); S.room = 'magistrate';
    UI.banner(ROOMS.magistrate.name);
    await Game.fadeIn();
    await UI.Dialogue.run(DIALOGUE.magistrate_force);
    this.cut = false; Game.busy = false;
    const id = S.pendingAccuse; S.pendingAccuse = null;
    if (id) await Game.accuse(id);
  },

  // Act I break: Congressman Davis's funeral procession leaves the Capitol along the Avenue.
  async funeral() {
    World.load('street', 'watch_funeral'); this.placeFollower(); Game.state.room = 'street';
    this.pan(53 - VIEW_W / 2 / TILE, 15.5 - VIEW_H / 2 / TILE);
    const hearse = this.prop('hearse', 62, 12);
    const MOURNERS = [['gentleman', 71, 14], ['lady', 72, 15], ['gentleman2', 74, 14], ['delegate', 75, 15], ['lady2', 77, 14], ['gentleman', 78, 15]];
    const mourners = MOURNERS.map(([s, x, y]) => this.spawn(s, x, y, 'left'));
    const line = [['calhoun', 50], ['clay', 52], ['ross', 55], ['gregory', 58]].map(([s, x]) => this.spawn(s, x, 12, 'down'));
    const guard = this.spawn('guard', 47, 13, 'right');
    await Game.fadeIn();
    await this.wait(500);
    this.walk(hearse, 4, 12, 44);
    mourners.forEach((m, i) => this.walk(m, MOURNERS[i][1] - 60, MOURNERS[i][2], 44));
    await this.wait(1400);
    await this.say(STORY.scenes.funeral);
    line.forEach(() => { }); guard.dir = 'left';
  },

  // Act II break: a crowd outside the Bank; Biddle at the door; Thorne collects the clerk.
  async bankCrowd() {
    World.load('street', 'watch_bank'); this.placeFollower(); Game.state.room = 'street';
    const door = ROOMS.street.spawns.from_bank_office;
    this.pan(door.x - VIEW_W / 2 / TILE, door.y + 1 - VIEW_H / 2 / TILE);
    const biddle = this.spawn('biddle', door.x, door.y - 0.4, 'down');
    const crowd = [['labourer', -2, 2], ['gentleman', -1, 3], ['lady2', 0, 2], ['gentleman2', 1, 3], ['labourer', 2, 2], ['coachman', 3, 3], ['lady', -3, 3], ['printer', 4, 2], ['servant', -2, 4], ['boy', 3, 4]]
      .map(([s, dx, dy]) => this.spawn(s, door.x + dx, door.y + dy, 'up'));
    await Game.fadeIn();
    let on = true, i = 0;
    const loop = () => { if (!on) return; const c = crowd[(i * 7) % crowd.length]; this.bubble(c, STORY.scenes.crowd[i % STORY.scenes.crowd.length], 1800); i++; setTimeout(loop, 700); };
    loop();
    await this.wait(1200);
    await this.say(STORY.scenes.bank1);
    const p = World.player;
    const th = this.spawn('gentleman', Math.floor(p.x / TILE) + 6, Math.floor(p.y / TILE), 'left');
    await this.walk(th, Math.floor(p.x / TILE) + 1, Math.floor(p.y / TILE), 90);
    p.dir = 'right';
    await this.say(STORY.scenes.bank2);
    on = false;
    void biddle;
  },
};
