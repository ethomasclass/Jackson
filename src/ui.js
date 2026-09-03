/* DOM layer: dialogue box, evidence tray, card pop-ups, HUD, toasts, fullscreen scenes. */
'use strict';

const $ = (sel) => document.querySelector(sel);

const UI = {
  init() {
    $('#tray-close').onclick = () => UI.Tray.close();
    $('#evidence-btn').onclick = () => { if (!Game.busy) UI.Tray.open(); };
    $('#help-btn').onclick = () => { if (!Game.busy) Scenes.help(); };
    $('#card-pop').onclick = () => UI.Card._resolve && UI.Card._resolve();
    this.buildHud();
  },

  // ---- HUD -------------------------------------------------------------
  buildHud() {
    const box = $('#suspects');
    box.innerHTML = '';
    for (const s of SUSPECTS) {
      const d = document.createElement('div');
      d.className = 'sus'; d.dataset.id = s.id; d.title = s.name;
      const im = document.createElement('img'); im.src = Assets.url(`assets/portraits/${s.portrait}.png`); im.className = 'px';
      d.appendChild(im);
      box.appendChild(d);
    }
    this.updateHud();
  },
  updateHud() {
    for (const el of document.querySelectorAll('#suspects .sus')) {
      el.classList.toggle('done', Game.state.interviewed.includes(el.dataset.id));
    }
    $('#evidence-count').textContent = Game.state.evidence.length;
  },
  flashEvidence() {
    const b = $('#evidence-btn'); b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash');
  },

  // ---- toasts / banners --------------------------------------------------
  toast(msg, ms = 2200) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(this._toastT); this._toastT = setTimeout(() => t.classList.remove('show'), ms);
  },
  banner(name) {
    const b = $('#location-banner'); b.textContent = name; b.classList.add('show');
    clearTimeout(this._bannerT); this._bannerT = setTimeout(() => b.classList.remove('show'), 2200);
  },

  // ---- glossary markup ---------------------------------------------------
  // "[tariff]" -> underlined term with a hover definition; "[tariffs|tariff]" shows the first word, defines the second.
  markup(text) {
    return text
      .replace(/\[([^\]|]+)(?:\|([^\]]+))?\]/g, (m, shown, key) => {
        const k = (key || shown).toLowerCase();
        const def = GLOSSARY[k];
        if (!def) return shown;
        return `<span class="term" data-def="${def.replace(/"/g, '&quot;')}">${shown}</span>`;
      })
      .replace(/\*([^*]+)\*/g, '<i>$1</i>');
  },

  // ---- fullscreen scenes -------------------------------------------------
  screen(html) {
    const f = $('#fullscreen'); f.innerHTML = html; f.classList.remove('hidden'); return f;
  },
  closeScreen() { $('#fullscreen').classList.add('hidden'); $('#fullscreen').innerHTML = ''; },
  wait(ms) { return new Promise(r => setTimeout(r, ms)); },
  // resolves on click anywhere in element or Space/Enter
  clickOrKey(el) {
    return new Promise(res => {
      const done = () => { el.removeEventListener('click', done); window.removeEventListener('keydown', kd); res(); };
      const kd = (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); done(); } };
      el.addEventListener('click', done);
      setTimeout(() => window.addEventListener('keydown', kd), 50);
    });
  },
};

// ---------------------------------------------------------------------------
// Dialogue runner
// ---------------------------------------------------------------------------
UI.Dialogue = {
  el: null, typing: false, _skip: null, _advance: null,
  init() {
    this.el = $('#dialogue');
    this.el.addEventListener('click', (e) => {
      if (e.target.classList.contains('term')) { const was = e.target.classList.contains('open'); for (const t of this.el.querySelectorAll('.term.open')) t.classList.remove('open'); if (!was) e.target.classList.add('open'); return; }
      if (e.target.tagName !== 'BUTTON') this.tap();
    });
    window.addEventListener('keydown', (e) => {
      if (this.el.classList.contains('hidden')) return;
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); this.tap(); }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 9) {
        const btns = $('#dlg-choices').querySelectorAll('button');
        if (btns[n - 1]) btns[n - 1].click();
      }
    });
  },
  tap() {
    if (this.typing && this._skip) this._skip();
    else if (this._advance) this._advance();
  },

  setSpeaker(name, portrait) {
    $('#dlg-name').textContent = name || '';
    const p = $('#dlg-portrait');
    p.innerHTML = ''; p.className = '';
    if (portrait === 'player') { p.appendChild(UI.playerPortrait()); }
    else if (portrait) { const im = document.createElement('img'); im.src = Assets.url(`assets/portraits/${portrait}.png`); p.appendChild(im); }
    else { p.style.visibility = 'hidden'; return; }
    p.style.visibility = 'visible';
  },

  // typewriter one page of text; resolves when the player advances
  async page(text) {
    const box = $('#dlg-text');
    const html = UI.markup(text);
    $('#dlg-choices').innerHTML = '';
    $('#dlg-hint').classList.remove('hidden');
    // type out plain characters while keeping tags intact
    box.innerHTML = html;
    const full = box.innerHTML;
    const nodes = [];
    const walk = (n) => { for (const c of n.childNodes) { if (c.nodeType === 3) nodes.push(c); else walk(c); } };
    walk(box);
    const texts = nodes.map(n => n.nodeValue);
    nodes.forEach(n => n.nodeValue = '');
    this.typing = true;
    await new Promise(res => {
      let i = 0, j = 0;
      const step = () => {
        if (!this.typing) { nodes.forEach((n, k) => n.nodeValue = texts[k]); res(); return; }
        let budget = 2;
        while (budget-- > 0) {
          if (i >= nodes.length) { this.typing = false; res(); return; }
          if (j < texts[i].length) { nodes[i].nodeValue += texts[i][j++]; }
          else { i++; j = 0; }
        }
        this._timer = setTimeout(step, 16);
      };
      this._skip = () => { this.typing = false; clearTimeout(this._timer); nodes.forEach((n, k) => n.nodeValue = texts[k]); res(); };
      step();
    });
    this._skip = null; this.typing = false;
    await new Promise(res => { this._advance = res; });
    this._advance = null;
  },

  async choose(options) {
    $('#dlg-hint').classList.add('hidden');
    const box = $('#dlg-choices'); box.innerHTML = '';
    return new Promise(res => {
      options.forEach((o, i) => {
        const b = document.createElement('button');
        b.innerHTML = UI.markup(o.label);
        if (o.cls) b.className = o.cls;
        b.onclick = (e) => { e.stopPropagation(); box.innerHTML = ''; res(o); };
        box.appendChild(b);
      });
    });
  },

  show() { this.el.classList.remove('hidden'); },
  hide() { this.el.classList.add('hidden'); this._advance = null; this._skip = null; },

  /* Run a dialogue definition. def = { name, portrait, start(S)->id, nodes:{...}, onEvidence:{...} } */
  async run(def, ctx = {}) {
    const S = Game.state;
    this.show();
    let id = typeof def.start === 'function' ? def.start(S, ctx) : (def.start || 'start');
    let guard = 0;
    while (id && id !== 'END' && guard++ < 200) {
      const node = def.nodes[id];
      if (!node) { console.warn('missing node', id); break; }
      S.seen[def.id] = S.seen[def.id] || {}; S.seen[def.id][id] = true;
      const speaker = node.speaker !== undefined ? node.speaker : def.name;
      const portrait = node.portrait !== undefined ? node.portrait : def.portrait;
      this.setSpeaker(speaker, portrait);
      let text = typeof node.text === 'function' ? node.text(S, ctx) : node.text;
      if (text && !Array.isArray(text)) text = [text];
      for (const t of (text || [])) {
        if (t.startsWith('@')) { // "@speaker|portrait: text" inline speaker switch
          const m = t.match(/^@([^|:]*)\|?([^:]*):\s*(.*)$/s);
          if (m) { this.setSpeaker(m[1], m[2] || null); await this.page(m[3]); this.setSpeaker(speaker, portrait); continue; }
        }
        await this.page(t);
      }
      if (node.set) for (const k of Object.keys(node.set)) S.flags[k] = node.set[k];
      if (node.fn) node.fn(S, ctx);
      if (node.interviewed) Game.markInterviewed(node.interviewed);
      if (node.give) {
        for (const g of [].concat(node.give)) await Game.collect(g, node.where || def.name);
      }
      if (node.choices || node.evidence || node.leave) {
        let next = null;
        while (next === null) {
          let opts = (typeof node.choices === 'function' ? node.choices(S, ctx) : node.choices) || [];
          opts = opts.filter(o => !o.cond || o.cond(S, ctx));
          if (node.evidence !== false && (node.evidence || def.onEvidence) && S.evidence.length) opts.push({ label: 'Show them something…', cls: 'evidence', ev: true });
          if (node.leave !== false) opts.push({ label: node.leaveLabel || "That's all for now.", cls: 'leave', next: 'END' });
          const pick = await this.choose(opts);
          if (pick.ev) {
            const item = await UI.Tray.pick();
            if (!item) continue;                       // tray cancelled: same menu again
            S.shown[def.id] = S.shown[def.id] || {}; S.shown[def.id][item] = true;
            let target = def.onEvidence && (def.onEvidence[item] || def.onEvidence._default);
            if (typeof target === 'function') target = target(S, item, ctx);
            if (target) { next = target; break; }
            this.setSpeaker(speaker, portrait);          // generic brush-off, then the menu again
            await this.page(def.brushOff || "I've no idea what that is. Put it away.");
            continue;
          }
          if (pick.set) for (const k of Object.keys(pick.set)) S.flags[k] = pick.set[k];
          if (pick.fn) pick.fn(S, ctx);
          next = typeof pick.next === 'function' ? pick.next(S, ctx) : pick.next;
        }
        id = next;
        continue;
      }
      id = typeof node.next === 'function' ? node.next(S, ctx) : node.next;
    }
    this.hide();
    Game.save();
  },
};

// player mini-portrait: the sprite's head, blown up
UI.playerPortrait = function () {
  const s = Assets.sprites.player;
  const c = document.createElement('canvas'); c.width = 96; c.height = 96;
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#3a3034'; ctx.fillRect(0, 0, 96, 96);
  ctx.drawImage(s.im, 4, 0, 24, 32, 12, 8, 72, 96);
  c.style.imageRendering = 'pixelated';
  return c;
};

// ---------------------------------------------------------------------------
// Evidence tray (viewer + picker)
// ---------------------------------------------------------------------------
UI.Tray = {
  _pick: null,
  render(mode) {
    const grid = $('#tray-grid'); grid.innerHTML = '';
    $('#tray-title').textContent = mode === 'pick' ? 'Show which item?' : 'Evidence collected';
    const detail = $('#tray-detail');
    detail.innerHTML = mode === 'pick' ? '<i>Click an item to show it. Most people will have nothing to say about most things — but some will.</i>' : '<i>Click an item to read about it. Your worksheet is the record — write it down.</i>';
    for (let i = 0; i < EVIDENCE_ORDER.length; i++) {
      const id = Game.state.evidence[i];
      const slot = document.createElement('div');
      slot.className = 'slot' + (id ? ' filled' : '');
      if (id) {
        const im = document.createElement('img'); im.src = Assets.url(`assets/evidence/${id}.png`); slot.appendChild(im);
        slot.onclick = () => {
          if (mode === 'pick') { this._pick && this._pick(id); this.close(); return; }
          for (const s of grid.children) s.classList.remove('sel');
          slot.classList.add('sel');
          const e = EVIDENCE[id];
          detail.innerHTML = `<b>${e.name}</b><span class="tier">${e.tier}</span><br><span class="where">Found: ${Game.state.evidenceWhere[id] || '?'}</span><br>${UI.markup(e.desc)}`;
        };
      }
      grid.appendChild(slot);
    }
  },
  open() { this.render('view'); $('#tray').classList.remove('hidden'); Game.modal = true; },
  close() { $('#tray').classList.add('hidden'); Game.modal = false; if (this._pick) { const p = this._pick; this._pick = null; p(null); } },
  pick() {
    return new Promise(res => { this._pick = res; this.render('pick'); $('#tray').classList.remove('hidden'); Game.modal = true; });
  },
};

// ---------------------------------------------------------------------------
// Card pop (evidence found)
// ---------------------------------------------------------------------------
UI.Card = {
  _resolve: null,
  show(id, where) {
    const e = EVIDENCE[id];
    const pop = $('#card-pop');
    pop.querySelector('.card-art').innerHTML = `<img src="${Assets.url(`assets/evidence/${id}.png`)}">`;
    pop.querySelector('.card-title').textContent = e.name;
    pop.querySelector('.card-where').textContent = `Found: ${where}  ·  ${e.tier} evidence`;
    pop.querySelector('.card-desc').innerHTML = UI.markup(e.desc);
    pop.classList.remove('hidden');
    return new Promise(res => {
      const done = () => { this._resolve = null; window.removeEventListener('keydown', kd); pop.classList.add('hidden'); res(); };
      const kd = (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); done(); } };
      setTimeout(() => { this._resolve = done; window.addEventListener('keydown', kd); }, 300);
    });
  },
};
