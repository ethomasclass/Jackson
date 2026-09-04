/* Core engine: asset loading, input, tile world, entities, camera, rendering.
   Internal resolution is 640x360; the stage is integer-scaled with CSS. */
'use strict';

const TILE = 32;
const VIEW_W = 640, VIEW_H = 360;

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------
const Assets = {
  images: {}, atlas: null, atlasIndex: null, sprites: {}, buildings: {}, portraits: {}, evidence: {}, ui: {},

  // When bundled into a single file, window.EMBEDDED maps asset paths to data URIs / parsed JSON.
  url(src) { return (window.EMBEDDED && window.EMBEDDED[src]) || src; },
  img(src) {
    return new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => rej(new Error('missing ' + src));
      im.src = this.url(src);
    });
  },
  json(src) {
    if (window.EMBEDDED && window.EMBEDDED[src]) return Promise.resolve(window.EMBEDDED[src]);
    return fetch(src).then(r => r.json());
  },

  async load(onProgress) {
    const jobs = [];
    let done = 0, total = 0;
    const track = (p) => { total++; return p.then(v => { done++; onProgress && onProgress(done / total); return v; }); };
    this.atlasIndex = await this.json('assets/tiles/atlas.json');
    this.atlas = await track(this.img('assets/tiles/atlas.png'));
    const spriteIndex = await this.json('assets/sprites/index.json');
    const buildingIndex = await this.json('assets/buildings/index.json');
    const evidenceIndex = await this.json('assets/evidence/index.json');
    for (const n of Object.keys(spriteIndex)) jobs.push(track(this.img(`assets/sprites/${n}.png`)).then(im => { this.sprites[n] = { im, ...spriteIndex[n] }; }));
    for (const n of Object.keys(buildingIndex)) jobs.push(track(this.img(`assets/buildings/${n}.png`)).then(im => { this.buildings[n] = { im, ...buildingIndex[n] }; }));
    for (const n of evidenceIndex) jobs.push(track(this.img(`assets/evidence/${n}.png`)).then(im => { this.evidence[n] = im; }));
    for (const n of ['jackson', 'calhoun', 'clay', 'biddle', 'ross', 'gregory', 'lawrence', 'magistrate', 'key']) jobs.push(track(this.img(`assets/portraits/${n}.png`)).then(im => { this.portraits[n] = im; }));
    for (const n of ['bang', 'arrow', 'spark', 'opening']) jobs.push(track(this.img(`assets/ui/${n}.png`)).then(im => { this.ui[n] = im; }));
    await Promise.all(jobs);
  },

  tile(name) {
    const t = this.atlasIndex[name];
    if (!t) throw new Error('unknown tile ' + name);
    return t;
  },
  drawTile(ctx, name, x, y) {
    const t = this.tile(name);
    ctx.drawImage(this.atlas, t.x, t.y, t.w, t.h, x, y, t.w, t.h);
  },
};

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
const Input = {
  down: {}, pressedKeys: {}, enabled: true,
  init() {
    window.addEventListener('keydown', e => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Tab'].includes(e.key)) e.preventDefault();
      if (!this.down[e.key]) this.pressedKeys[e.key] = true;
      this.down[e.key] = true;
    });
    window.addEventListener('keyup', e => { this.down[e.key] = false; });
    window.addEventListener('blur', () => { this.down = {}; });
  },
  touch: { x: 0, y: 0 },
  axis() {
    if (!this.enabled) return { x: 0, y: 0 };
    let x = 0, y = 0;
    if (this.touch.x || this.touch.y) return { x: this.touch.x, y: this.touch.y };
    if (this.down.ArrowLeft || this.down.a || this.down.A) x -= 1;
    if (this.down.ArrowRight || this.down.d || this.down.D) x += 1;
    if (this.down.ArrowUp || this.down.w || this.down.W) y -= 1;
    if (this.down.ArrowDown || this.down.s || this.down.S) y += 1;
    return { x, y };
  },
  pressed(...keys) { return this.enabled && keys.some(k => this.pressedKeys[k]); },
  endFrame() { this.pressedKeys = {}; },
};

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------
class Entity {
  constructor(sprite, x, y, dir = 'down') {
    this.sprite = Assets.sprites[sprite];
    this.spriteName = sprite;
    this.x = x; this.y = y;          // feet centre, pixels
    this.dir = dir;
    this.frame = 0; this.animT = 0; this.moving = false;
    this.bob = Math.random() * 10;
  }
  get box() { return { x: this.x - 8, y: this.y - 8, w: 16, h: 8 }; }
  draw(ctx, cam) {
    const s = this.sprite;
    const row = s.rows.indexOf(this.dir);
    const fr = this.moving ? this.frame : 0;
    // idle breathing: the whole figure settles 1px for a moment on a slow cycle
    const t = World.t + this.bob;
    const breathe = !this.moving && ((t % 3.1) < 0.45) ? 1 : 0;
    const dx = Math.round(this.x - 16 - cam.x), dy = Math.round(this.y - 46 - cam.y) + breathe;
    ctx.drawImage(s.im, fr * s.fw, row * s.fh, s.fw, s.fh, dx, dy, s.fw, s.fh);
    // blink: cover the eye pixels with skin for a few frames every few seconds
    const eyes = s.eyes && s.eyes[this.dir];
    if (eyes && eyes.length && ((t * 0.37) % 4.3) < 0.12) {
      ctx.fillStyle = `rgb(${s.skin[0]},${s.skin[1]},${s.skin[2]})`;
      for (const [ex, ey] of eyes) ctx.fillRect(dx + ex, dy + ey, 1, 1);
    }
  }
  animate(dt) {
    if (this.moving) {
      this.animT += dt;
      if (this.animT > 0.13) { this.animT = 0; this.frame = (this.frame + 1) % 4; }
    } else { this.frame = 0; this.animT = 0; }
  }
}

class NPC extends Entity {
  constructor(def) {
    super(def.sprite, def.x * TILE + 16, def.y * TILE + 30, def.dir || 'down');
    this.id = def.id; this.def = def; this.homeDir = this.dir;
    this.solid = true;
  }
  get box() { return { x: this.x - 10, y: this.y - 10, w: 20, h: 12 }; }
  face(px, py) {
    const dx = px - this.x, dy = py - this.y;
    this.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  }
}

// ---------------------------------------------------------------------------
// World: current room, collision, drawing
// ---------------------------------------------------------------------------
const World = {
  room: null, roomId: null, w: 0, h: 0, ground: [], solids: [], objects: [], npcs: [], exits: [], hotspots: [],
  player: null, cam: { x: 0, y: 0 }, t: 0,

  load(roomId, spawnName) {
    const room = ROOMS[roomId];
    if (!room) throw new Error('no room ' + roomId);
    this.room = room; this.roomId = roomId;
    this.w = room.w * TILE; this.h = room.h * TILE;
    this.solids = []; this.objects = []; this.npcs = []; this.exits = []; this.hotspots = [];
    // ground: expand legend (variant arrays picked deterministically)
    this.ground = [];
    let seed = 7;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let ty = 0; ty < room.h; ty++) {
      const row = room.ground[ty] || '';
      const out = [];
      for (let tx = 0; tx < room.w; tx++) {
        const ch = row[tx] || room.fill || ' ';
        let name = room.legend[ch];
        if (Array.isArray(name)) name = name[Math.floor(rnd() * name.length)];
        out.push(name || null);
        if (name && Game.solidTile(name)) this.solids.push({ x: tx * TILE, y: ty * TILE, w: TILE, h: TILE });
        if (!name) this.solids.push({ x: tx * TILE, y: ty * TILE, w: TILE, h: TILE });
      }
      this.ground.push(out);
    }
    // objects (atlas tiles)
    for (const o of room.objects || []) {
      if (o.cond && !o.cond(Game.state)) continue;
      const t = Assets.tile(o.t);
      const obj = { kind: 'tile', name: o.t, x: o.x * TILE + (o.dx || 0), y: o.y * TILE + (o.dy || 0), w: t.w, h: t.h, def: o };
      this.objects.push(obj);
      if (o.solid !== false) {
        const sh = o.solidH != null ? o.solidH : Math.min(t.h, 32);
        this.solids.push({ x: obj.x + 2, y: obj.y + t.h - sh + 2, w: t.w - 4, h: sh - 4 });
      }
      if (o.evidence || o.look) this.hotspots.push({ x: obj.x, y: obj.y, w: t.w, h: t.h, def: o });
    }
    // buildings (exterior sprites)
    for (const b of room.buildings || []) {
      const bd = Assets.buildings[b.b];
      const obj = { kind: 'building', name: b.b, x: b.x * TILE, y: b.y * TILE, w: bd.w, h: bd.h, def: b };
      this.objects.push(obj);
      if (bd.door) {
        const [dx, dy, dw, dh] = bd.door;
        // solid everywhere except the door strip
        this.solids.push({ x: obj.x, y: obj.y, w: bd.w, h: bd.h - dh });
        this.solids.push({ x: obj.x, y: obj.y + bd.h - dh, w: dx, h: dh });
        this.solids.push({ x: obj.x + dx + dw, y: obj.y + bd.h - dh, w: bd.w - dx - dw, h: dh });
        if (b.to) {
          this.exits.push({ x: obj.x + dx, y: obj.y + bd.h - dh, w: dw, h: dh, to: b.to, spawn: b.spawn, label: b.label, locked: b.locked });
          // coming back out of this building puts you just below its door
          room.spawns['from_' + b.b] = { x: Math.floor((obj.x + dx + dw / 2) / TILE), y: Math.floor((obj.y + bd.h) / TILE), dir: 'down' };
        }
      } else if (bd.solid) {
        const [sx, sy, sw, sh] = bd.solid;
        this.solids.push({ x: obj.x + sx, y: obj.y + sy, w: sw, h: sh });
      } else {
        this.solids.push({ x: obj.x, y: obj.y, w: bd.w, h: bd.h });
      }
    }
    for (const e of room.exits || []) this.exits.push({ x: e.x * TILE, y: e.y * TILE, w: e.w * TILE, h: e.h * TILE, to: e.to, spawn: e.spawn, label: e.label, locked: e.locked });
    for (const h of room.hotspots || []) this.hotspots.push({ x: h.x * TILE, y: h.y * TILE, w: (h.w || 1) * TILE, h: (h.h || 1) * TILE, def: h });
    for (const n of room.npcs || []) {
      if (n.cond && !n.cond(Game.state)) continue;
      this.npcs.push(new NPC(n));
    }
    // player
    const sp = (room.spawns && room.spawns[spawnName]) || room.spawns.default;
    if (!this.player) this.player = new Entity('player', 0, 0);
    this.player.x = sp.x * TILE + 16; this.player.y = sp.y * TILE + 30; this.player.dir = sp.dir || 'down';
    this.player.moving = false;
    this.updateCamera(true);
    Atmosphere.collect(room);
  },

  // --- collision --------------------------------------------------------
  hit(box, ignoreNpc) {
    if (box.x < 0 || box.y < 0 || box.x + box.w > this.w || box.y + box.h > this.h) return true;
    for (const s of this.solids) if (overlap(box, s)) return true;
    for (const n of this.npcs) if (n !== ignoreNpc && n.solid && overlap(box, n.box)) return true;
    return false;
  },

  movePlayer(dt) {
    const p = this.player;
    const a = Input.axis();
    p.moving = !!(a.x || a.y);
    if (!p.moving) return;
    const speed = 100;
    let dx = a.x * speed * dt, dy = a.y * speed * dt;
    if (a.x && a.y) { dx *= 0.7071; dy *= 0.7071; }
    if (a.x) p.dir = a.x > 0 ? 'right' : 'left';
    if (a.y && !a.x) p.dir = a.y > 0 ? 'down' : 'up';
    else if (a.y && Math.abs(dy) > Math.abs(dx)) p.dir = a.y > 0 ? 'down' : 'up';
    // axis-separated movement so you slide along walls
    let b = p.box; b.x += dx;
    if (!this.hit(b)) p.x += dx;
    b = p.box; b.y += dy;
    if (!this.hit(b)) p.y += dy;
  },

  // what is in front of the player?
  facingPoint(dist = 18) {
    const p = this.player;
    const d = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] }[p.dir];
    return { x: p.x + d[0] * dist, y: p.y - 4 + d[1] * dist };
  },
  target() {
    const f = this.facingPoint();
    const probe = { x: f.x - 6, y: f.y - 6, w: 12, h: 12 };
    const live = this.hotspots.filter(h => !(h.def.cond && !h.def.cond(Game.state)) && !(h.def.evidence && Game.state.evidence.includes(h.def.evidence) && !h.def.look));
    // a hotspot directly under the probe wins (so a table in front of someone is still examinable)
    for (const h of live) if (overlap(probe, h)) return { kind: 'hotspot', hotspot: h };
    for (const n of this.npcs) {
      const r = n.def.reach || {};
      const nb = { x: n.x - 18 - (r.l || 0), y: n.y - 34 - (r.u || 0), w: 36 + (r.l || 0) + (r.r || 0), h: 46 + (r.u || 0) + (r.d || 0) };
      if (overlap(probe, nb)) return { kind: 'npc', npc: n };
    }
    for (const h of live) {
      const hb = { x: h.x - 4, y: h.y - 4, w: h.w + 8, h: h.h + 8 };
      if (overlap(probe, hb)) return { kind: 'hotspot', hotspot: h };
    }
    return null;
  },
  exitAt() {
    const b = this.player.box;
    for (const e of this.exits) if (overlap(b, e)) return e;
    return null;
  },

  // --- camera ------------------------------------------------------------
  updateCamera(snap) {
    const p = this.player;
    let cx = p.x - VIEW_W / 2, cy = p.y - 24 - VIEW_H / 2;
    cx = clamp(cx, 0, Math.max(0, this.w - VIEW_W));
    cy = clamp(cy, 0, Math.max(0, this.h - VIEW_H));
    if (this.w < VIEW_W) cx = -(VIEW_W - this.w) / 2;
    if (this.h < VIEW_H) cy = -(VIEW_H - this.h) / 2;
    if (snap) { this.cam.x = cx; this.cam.y = cy; }
    else { this.cam.x += (cx - this.cam.x) * 0.18; this.cam.y += (cy - this.cam.y) * 0.18; }
  },

  update(dt) {
    this.t += dt; this.lastDt = dt;
    this.movePlayer(dt);
    this.player.animate(dt);
    for (const n of this.npcs) n.animate(dt);
    this.updateCamera(false);
  },

  // --- drawing -----------------------------------------------------------
  draw(ctx) {
    const cam = { x: Math.round(this.cam.x), y: Math.round(this.cam.y) };
    ctx.fillStyle = '#121013';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    const tx0 = Math.max(0, Math.floor(cam.x / TILE)), ty0 = Math.max(0, Math.floor(cam.y / TILE));
    const tx1 = Math.min(this.room.w - 1, Math.ceil((cam.x + VIEW_W) / TILE)), ty1 = Math.min(this.room.h - 1, Math.ceil((cam.y + VIEW_H) / TILE));
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
      const n = this.ground[ty][tx];
      if (n) Assets.drawTile(ctx, n, tx * TILE - cam.x, ty * TILE - cam.y);
    }
    // depth sort: objects by bottom edge, entities by feet
    const list = [];
    for (const o of this.objects) {
      if (o.def.flat) { this.drawObject(ctx, o, cam); continue; }
      list.push({ y: o.y + o.h - (o.def.sortBias || 0), draw: () => this.drawObject(ctx, o, cam) });
    }
    for (const n of this.npcs) list.push({ y: n.y, draw: () => n.draw(ctx, cam) });
    list.push({ y: this.player.y, draw: () => this.player.draw(ctx, cam) });
    list.sort((a, b) => a.y - b.y);
    for (const it of list) it.draw();
    // markers over NPCs with something new
    for (const n of this.npcs) {
      if (Game.npcHasNew(n)) {
        const bob = Math.round(Math.sin(this.t * 4 + n.bob) * 2);
        ctx.drawImage(Assets.ui.bang, Math.round(n.x - 8 - cam.x), Math.round(n.y - 66 - cam.y + bob), 16, 16);
      }
    }
    for (const h of this.hotspots) {
      if (h.def.cond && !h.def.cond(Game.state)) continue;
      if (h.def.evidence && !Game.state.evidence.includes(h.def.evidence)) {
        const bob = Math.round(Math.sin(this.t * 3 + h.x) * 1.5);
        ctx.drawImage(Assets.ui.spark, Math.round(h.x + h.w / 2 - 8 - cam.x), Math.round(h.y - 10 - cam.y + bob), 16, 16);
      }
    }
    // interaction arrow
    const t = this.target();
    if (t && !Game.busy) {
      const p = t.kind === 'npc' ? { x: t.npc.x, y: t.npc.y - 66 } : { x: t.hotspot.x + t.hotspot.w / 2, y: t.hotspot.y - 14 };
      const bob = Math.round(Math.sin(this.t * 6) * 2);
      ctx.drawImage(Assets.ui.arrow, Math.round(p.x - 8 - cam.x), Math.round(p.y - cam.y + bob), 16, 16);
    }
    // lighting, smoke, breath, snow
    Atmosphere.draw(ctx, cam, this.lastDt || 0.016);
  },
  drawObject(ctx, o, cam) {
    if (o.kind === 'tile') Assets.drawTile(ctx, o.name, o.x - cam.x, o.y - cam.y);
    else ctx.drawImage(Assets.buildings[o.name].im, o.x - cam.x, o.y - cam.y);
  },
  drawSnow(ctx, cam) {
    ctx.fillStyle = 'rgba(230,232,240,0.7)';
    for (let i = 0; i < 40; i++) {
      const x = ((i * 137 + this.t * (18 + i % 7)) % (VIEW_W + 40)) - 20 - (cam.x * 0.2 % 40);
      const y = ((i * 89 + this.t * (28 + i % 5)) % (VIEW_H + 20)) - 10;
      ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
  },
};

function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ---------------------------------------------------------------------------
// Stage scaling
// ---------------------------------------------------------------------------
function fitStage() {
  const raw = Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H);
  const s = raw >= 1 ? Math.floor(raw) : Math.max(0.3, raw);   // integer scale on big screens, fit-to-screen on phones
  const stage = document.getElementById('stage');
  stage.style.transform = `scale(${s})`;
  stage.style.left = Math.floor((window.innerWidth - VIEW_W * s) / 2) + 'px';
  stage.style.top = Math.floor((window.innerHeight - VIEW_H * s) / 2) + 'px';
  window.STAGE_SCALE = s;
}
window.addEventListener('resize', fitStage);
