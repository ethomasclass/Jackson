/* Game flow, state and the main loop. */
'use strict';

const SAVE_KEY = 'capitol-steps-save-v1';

const Game = {
  state: null, busy: false, modal: false, fade: 0, fadeDir: 0, last: 0, ctx: null,

  freshState() {
    return {
      flags: {}, evidence: [], evidenceWhere: {}, interviewed: [], shown: {}, seen: {},
      room: 'magistrate', spawn: 'default', phase: 'title', accused: null, verdict: null, started: Date.now(),
    };
  },
  save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.state)); } catch (e) { /* private mode etc. */ } },
  loadSave() { try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } },
  clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } },

  solidTile(name) { return name.startsWith('wall'); },

  // --- evidence & progress ------------------------------------------------
  has(id) { return this.state.evidence.includes(id); },
  flag(k) { return !!this.state.flags[k]; },
  async collect(id, where) {
    if (this.has(id)) return;
    this.state.evidence.push(id);
    this.state.evidenceWhere[id] = where;
    UI.updateHud(); UI.flashEvidence();
    await UI.Card.show(id, where);
    this.save();
  },
  markInterviewed(id) {
    if (!this.state.interviewed.includes(id)) { this.state.interviewed.push(id); UI.updateHud(); UI.toast(`Suspect interviewed: ${SUSPECTS.find(s => s.id === id).name}`); }
  },
  warrantMissing() {
    const S = this.state, miss = [];
    for (const s of SUSPECTS) if (!S.interviewed.includes(s.id)) miss.push(`speak with ${s.name}`);
    if (S.evidence.length < 6) miss.push(`collect more evidence (${S.evidence.length} of 6 needed)`);
    return miss;
  },
  warrantReady() { return this.warrantMissing().length === 0; },

  // does this NPC have something new to say? (drives the "!" marker)
  npcHasNew(npc) {
    const def = DIALOGUE[npc.def.talk || npc.id];
    if (!def) return false;
    const S = this.state;
    if (def.isNew) return def.isNew(S);
    if (!(S.seen[def.id] && Object.keys(S.seen[def.id]).length)) return true;
    if (def.onEvidence) {
      for (const ev of Object.keys(def.onEvidence)) {
        if (ev === '_default') continue;
        if (S.evidence.includes(ev) && !(S.shown[def.id] && S.shown[def.id][ev])) return true;
      }
    }
    if (def.newTopics && def.newTopics(S)) return true;
    return false;
  },

  // --- rooms --------------------------------------------------------------
  async goto(roomId, spawn) {
    this.busy = true;
    await this.fadeOut();
    World.load(roomId, spawn);
    this.state.room = roomId; this.state.spawn = spawn || 'default';
    UI.banner(ROOMS[roomId].name);
    this.save();
    await this.fadeIn();
    this.busy = false;
  },
  fadeOut() { return new Promise(res => { this.fadeDir = 1; this._fadeDone = res; }); },
  fadeIn() { return new Promise(res => { this.fadeDir = -1; this._fadeDone = res; }); },

  // --- interaction ----------------------------------------------------------
  async interact() {
    const t = World.target();
    if (!t) return;
    this.busy = true;
    World.player.moving = false;
    if (t.kind === 'npc') {
      const npc = t.npc;
      npc.face(World.player.x, World.player.y);
      const def = DIALOGUE[npc.def.talk || npc.id];
      if (def) await UI.Dialogue.run(def, { npc });
      npc.dir = npc.homeDir;
      if (this.state.pendingAccuse) {
        const id = this.state.pendingAccuse; this.state.pendingAccuse = null;
        this.busy = false;
        await this.accuse(id);
        return;
      }
    } else {
      const h = t.hotspot.def;
      if (h.look) {
        const text = typeof h.look === 'function' ? h.look(this.state) : h.look;
        await UI.Dialogue.run({ id: 'look:' + (h.evidence || h.x), name: '', portrait: null, start: 'a', nodes: { a: { text, leave: false } } });
      }
      if (h.evidence && !this.has(h.evidence)) {
        await this.collect(h.evidence, h.where || ROOMS[World.roomId].name);
        if (h.after) await UI.Dialogue.run({ id: 'after:' + h.evidence, name: '', portrait: null, start: 'a', nodes: { a: { text: h.after, leave: false } } });
      }
    }
    this.busy = false;
  },

  // --- loop -----------------------------------------------------------------
  frame(ts) {
    const dt = Math.min(0.05, (ts - this.last) / 1000 || 0);
    this.last = ts;
    if (this.state.phase === 'play' && World.room) {
      if (!this.busy && !this.modal) {
        World.update(dt);
        const ex = World.exitAt();
        if (ex) {
          if (ex.locked && ex.locked(this.state)) {
            // push the player back and explain
            const p = World.player; const d = { down: [0, -6], up: [0, 6], left: [6, 0], right: [-6, 0] }[p.dir];
            p.x += d[0]; p.y += d[1];
            UI.toast(typeof ex.locked === 'function' ? (ex.lockedMsg || ROOMS[World.roomId].lockedMsg || 'Locked.') : 'Locked.');
          } else {
            this.goto(ex.to, ex.spawn);
          }
        } else if (Input.pressed(' ', 'Enter', 'e', 'E')) {
          this.interact();
        } else if (Input.pressed('Tab', 'i', 'I')) {
          UI.Tray.open();
        }
      } else if (this.modal && Input.pressed('Tab', 'Escape')) {
        UI.Tray.close();
      }
      World.draw(this.ctx);
    }
    // fade
    if (this.fadeDir) {
      this.fade = clamp(this.fade + this.fadeDir * dt * 4, 0, 1);
      if ((this.fadeDir > 0 && this.fade >= 1) || (this.fadeDir < 0 && this.fade <= 0)) { this.fadeDir = 0; const f = this._fadeDone; this._fadeDone = null; f && f(); }
    }
    if (this.fade > 0) { this.ctx.fillStyle = `rgba(10,8,10,${this.fade})`; this.ctx.fillRect(0, 0, VIEW_W, VIEW_H); }
    Input.endFrame();
    requestAnimationFrame(t => this.frame(t));
  },

  // --- boot ----------------------------------------------------------------
  async boot() {
    fitStage();
    Input.init();
    this.ctx = document.getElementById('game').getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.state = this.freshState();
    const f = UI.screen(`<div class="scene"><div class="center"><h2>LOADING</h2><div id="loadbar" style="width:200px;height:6px;border:1px solid #6a5636;margin-top:10px"><i style="display:block;height:100%;background:#d0a448;width:0"></i></div></div></div>`);
    await Assets.load(p => { const i = f.querySelector('#loadbar i'); if (i) i.style.width = Math.round(p * 100) + '%'; });
    UI.init(); UI.Dialogue.init(); Touch.init(); Atmosphere.init();
    requestAnimationFrame(t => this.frame(t));
    await Scenes.title();
  },

  async newGame() {
    this.state = this.freshState();
    this.state.phase = 'play';
    World.player = null;
    UI.updateHud();
    await Scenes.opening();
    await Scenes.briefing();
    this.state.flags.briefed = true;
    World.load('magistrate', 'default');
    UI.closeScreen();
    UI.banner(ROOMS.magistrate.name);
    this.fade = 1; await this.fadeIn();
    this.save();
  },
  async continueGame(saved) {
    this.state = saved;
    this.state.phase = 'play';
    World.player = null;
    UI.updateHud();
    World.load(saved.room || 'magistrate', saved.spawn || 'default');
    UI.closeScreen();
    UI.banner(ROOMS[World.roomId].name);
    this.fade = 1; await this.fadeIn();
  },

  // --- accusation & trial ----------------------------------------------------
  async accuse(suspectId) {
    this.state.accused = suspectId;
    this.save();
    this.busy = true;
    await this.fadeOut();
    const result = await Scenes.trial(suspectId);
    this.state.verdict = result;
    this.state.flags.trial_done = true;
    this.save();
    await Scenes.epilogue(suspectId, result);
    UI.closeScreen();
    World.load('magistrate', 'default');
    this.state.room = 'magistrate';
    await this.fadeIn();
    this.busy = false;
    UI.toast('The case is closed. You may keep exploring, or press ? to start over.');
  },
};

window.addEventListener('DOMContentLoaded', () => Game.boot());
