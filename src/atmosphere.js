/* Atmosphere: a light map multiplied over the scene, glow bloom from light sources,
   chimney smoke, breath in cold air, and snow in two depths. Canvas 2D only. */
'use strict';

const Atmosphere = {
  lights: [], smoke: [], particles: [], patches: [], lm: null, glow: null, t: 0,
  // ambient tints (multiplied over the scene). Warm interiors, a cold blue dusk outside.
  ambient: {
    outdoor: [140, 150, 196],
    indoor: [222, 208, 192],
    dim: [176, 160, 158],
  },
  KIND: {
    window: { color: [255, 214, 150], flicker: 0.05 },
    lamp: { color: [255, 226, 170], flicker: 0.08 },
    fire: { color: [255, 170, 90], flicker: 0.22 },
    candle: { color: [255, 210, 140], flicker: 0.18 },
    daylight: { color: [200, 214, 240], flicker: 0 },
  },

  init() {
    this.lm = document.createElement('canvas');
    this.glow = document.createElement('canvas');
    this.resize();
  },
  resize() {
    this.lm.width = VIEW_W; this.lm.height = VIEW_H;
    this.glow.width = VIEW_W; this.glow.height = VIEW_H;
  },

  // Called by World.load: gather light sources and smoke points from the room.
  collect(room) {
    this.lights = []; this.smoke = []; this.particles = []; this.patches = [];
    for (const o of World.objects) {
      if (o.kind === 'building') {
        const bd = Assets.buildings[o.name];
        // window glow is pushed a little downward so it pools on the ground instead of bleaching the wall
        for (const [x, y, r, kind] of (bd.lights || [])) this.lights.push({ x: o.x + x, y: o.y + y + (kind === 'window' ? 14 : 0), r, kind, seed: Math.random() * 100, gain: kind === 'window' ? 0.55 : 1 });
        for (const [x, y] of (bd.smoke || [])) this.smoke.push({ x: o.x + x, y: o.y + y, seed: Math.random() * 100 });
      } else {
        const n = o.name;
        if (n === 'fireplace') this.lights.push({ x: o.x + 32, y: o.y + 22, r: 120, kind: 'fire', seed: Math.random() * 100 });
        else if (n === 'candle_table') this.lights.push({ x: o.x + 15, y: o.y + 8, r: 52, kind: 'candle', seed: Math.random() * 100 });
        else if (n === 'stove') this.lights.push({ x: o.x + 16, y: o.y + 16, r: 70, kind: 'fire', seed: Math.random() * 100 });
        else if (n === 'argand_lamp') this.lights.push({ x: o.x + 16, y: o.y + 6, r: 88, kind: 'lamp', seed: Math.random() * 100 });
        else if (n === 'sconce') this.lights.push({ x: o.x + 16, y: o.y + 12, r: 64, kind: 'candle', seed: Math.random() * 100 });
        else if (n === 'desk2' || n === 'desk3') this.lights.push({ x: o.x + o.w - 10, y: o.y + 14, r: 46, kind: 'candle', seed: Math.random() * 100 });
      }
    }
    // interior windows let in cold daylight; wall lamps would go here too
    for (let ty = 0; ty < room.h; ty++) for (let tx = 0; tx < room.w; tx++) {
      const n = World.ground[ty][tx];
      if (n && n.endsWith('_win')) { this.lights.push({ x: tx * TILE + 16, y: ty * TILE + 12, r: 90, kind: 'daylight', seed: 0 }); this.patches.push({ x: tx * TILE, y: (ty + 1) * TILE }); }
    }
    for (const l of (room.lights || [])) this.lights.push({ x: l.x * TILE + 16, y: l.y * TILE + 16, r: l.r || 80, kind: l.kind || 'lamp', seed: Math.random() * 100 });
    // interiors get a soft central fill so rooms without fires aren't gloomy
    if (!room.outdoor) this.lights.push({ x: room.w * TILE / 2, y: room.h * TILE / 2, r: Math.max(room.w, room.h) * TILE * 0.75, kind: 'daylight', seed: 0, soft: true });
  },

  flick(l, t) {
    const k = this.KIND[l.kind];
    if (!k.flicker) return 1;
    return 1 - k.flicker * (0.5 + 0.5 * Math.sin(t * 13 + l.seed) * Math.sin(t * 7.3 + l.seed * 2));
  },

  draw(ctx, cam, dt) {
    this.t += dt;
    const room = World.room;
    const amb = room.ambient || (room.outdoor ? this.ambient.outdoor : room.dim ? this.ambient.dim : this.ambient.indoor);
    const lc = this.lm.getContext('2d');
    lc.globalCompositeOperation = 'source-over';
    lc.fillStyle = `rgb(${amb[0]},${amb[1]},${amb[2]})`;
    lc.fillRect(0, 0, VIEW_W, VIEW_H);
    lc.globalCompositeOperation = 'lighter';
    const gc = this.glow.getContext('2d');
    gc.globalCompositeOperation = 'source-over';
    gc.clearRect(0, 0, VIEW_W, VIEW_H);
    gc.globalCompositeOperation = 'lighter';
    for (const l of this.lights) {
      const x = l.x - cam.x, y = l.y - cam.y;
      if (x < -l.r || y < -l.r || x > VIEW_W + l.r || y > VIEW_H + l.r) continue;
      const k = this.KIND[l.kind];
      const f = this.flick(l, this.t);
      const r = l.r * (0.92 + 0.08 * f);
      const [cr, cg, cb] = k.color;
      // brightness contribution (multiply map): light lifts the ambient toward its colour
      const g = lc.createRadialGradient(x, y, 0, x, y, r);
      const a = (l.soft ? 0.35 : 0.9) * (l.gain || 1);
      g.addColorStop(0, `rgba(${cr},${cg},${cb},${(a * f).toFixed(3)})`);
      g.addColorStop(0.35, `rgba(${cr},${cg},${cb},${(a * 0.55 * f).toFixed(3)})`);
      g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      lc.fillStyle = g; lc.fillRect(x - r, y - r, r * 2, r * 2);
      // bloom (screen-added, small and soft)
      if (!l.soft && l.kind !== 'daylight') {
        const rg = r * 0.5;
        const g2 = gc.createRadialGradient(x, y, 0, x, y, rg);
        g2.addColorStop(0, `rgba(${cr},${cg},${cb},${(0.28 * f).toFixed(3)})`);
        g2.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        gc.fillStyle = g2; gc.fillRect(x - rg, y - rg, rg * 2, rg * 2);
      }
    }
    // daylight through the windows lands on the floor
    for (const p of this.patches) {
      const x = p.x - cam.x, y = p.y - cam.y;
      if (x < -120 || x > VIEW_W + 60 || y < -20 || y > VIEW_H + 120) continue;
      const g = lc.createLinearGradient(0, y, 0, y + 110);
      g.addColorStop(0, 'rgba(210,222,245,0.55)'); g.addColorStop(1, 'rgba(210,222,245,0)');
      lc.fillStyle = g;
      lc.beginPath(); lc.moveTo(x + 4, y); lc.lineTo(x + 28, y); lc.lineTo(x + 46, y + 110); lc.lineTo(x - 14, y + 110); lc.closePath(); lc.fill();
    }
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(this.lm, 0, 0);
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(this.glow, 0, 0);
    ctx.restore();
    // vignette on exteriors
    if (room.outdoor) {
      const v = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, 180, VIEW_W / 2, VIEW_H / 2, 460);
      v.addColorStop(0, 'rgba(10,12,30,0)'); v.addColorStop(1, 'rgba(10,12,30,0.4)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
    this.drawParticles(ctx, cam, dt);
  },

  drawParticles(ctx, cam, dt) {
    const room = World.room;
    // chimney smoke: spawn a puff every so often per chimney
    for (const s of this.smoke) {
      if (Math.random() < dt * 2.2) this.particles.push({ kind: 'smoke', x: s.x + (Math.random() - 0.5) * 4, y: s.y, vx: 6 + Math.random() * 6, vy: -14 - Math.random() * 8, life: 0, max: 3 + Math.random() * 2, size: 2 });
    }
    // breath from the player and NPCs outdoors
    if (room.outdoor) {
      const who = [World.player, ...World.npcs];
      for (const e of who) if (Math.random() < dt * 0.35) this.particles.push({ kind: 'breath', x: e.x + (e.dir === 'left' ? -6 : e.dir === 'right' ? 6 : 0), y: e.y - 30, vx: (e.dir === 'left' ? -8 : e.dir === 'right' ? 8 : 0), vy: -6, life: 0, max: 1.1, size: 1.5 });
    }
    for (const p of this.particles) {
      p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.kind === 'smoke') { p.vx *= 0.995; p.size += dt * 2.4; }
      else p.size += dt * 3;
    }
    this.particles = this.particles.filter(p => p.life < p.max);
    for (const p of this.particles) {
      const k = 1 - p.life / p.max;
      const a = p.kind === 'smoke' ? 0.28 * k : 0.35 * k;
      ctx.fillStyle = `rgba(226,224,232,${a.toFixed(3)})`;
      const sz = Math.max(1, Math.round(p.size));
      ctx.fillRect(Math.round(p.x - cam.x - sz / 2), Math.round(p.y - cam.y - sz / 2), sz, sz);
      if (sz > 3) ctx.fillRect(Math.round(p.x - cam.x - sz / 2) + 1, Math.round(p.y - cam.y - sz / 2) - 1, sz - 2, 1);
    }
    if (room.fx === 'snow') this.drawSnow(ctx, cam);
  },

  drawSnow(ctx, cam) {
    const t = this.t;
    // far layer: small, slow, dim
    ctx.fillStyle = 'rgba(226,230,240,0.45)';
    for (let i = 0; i < 70; i++) {
      const x = ((i * 137 + t * (10 + i % 5) + Math.sin(t * 0.8 + i) * 6) % (VIEW_W + 40)) - 20 - ((cam.x * 0.15) % 40);
      const y = ((i * 89 + t * (18 + i % 7)) % (VIEW_H + 20)) - 10;
      ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
    // near layer: bigger, faster, drifting
    ctx.fillStyle = 'rgba(236,238,246,0.8)';
    for (let i = 0; i < 26; i++) {
      const x = ((i * 211 + t * (26 + i % 6) + Math.sin(t * 1.3 + i * 2) * 14) % (VIEW_W + 60)) - 30 - ((cam.x * 0.4) % 60);
      const y = ((i * 149 + t * (44 + i % 9)) % (VIEW_H + 30)) - 15;
      ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
  },
};
