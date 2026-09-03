/* Fullscreen DOM scenes: title, opening, briefing, trial, epilogue, help. */
'use strict';

const Scenes = {
  // A pixel backdrop built from a building sprite, tiled ground and falling snow.
  backdrop(building, opts = {}) {
    const bd = Assets.buildings[building];
    const c = document.createElement('canvas'); c.width = 640; c.height = 360; c.className = 'bg';
    const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
    const g = ctx.createLinearGradient(0, 0, 0, 360);
    g.addColorStop(0, '#1a1c2c'); g.addColorStop(1, '#3a3446');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 640, 360);
    const scale = opts.scale || 2;
    const w = bd.w * scale, h = bd.h * scale;
    const x = Math.round((640 - w) / 2), y = opts.y != null ? opts.y : Math.round(360 - h - 40);
    // ground
    for (let tx = 0; tx < 640; tx += 64) for (let ty = y + h - 60; ty < 360; ty += 64) {
      const t = Assets.tile(tx % 128 ? 'flag0' : 'flag1');
      ctx.drawImage(Assets.atlas, t.x, t.y, 32, 32, tx, ty, 64, 64);
    }
    ctx.drawImage(bd.im, x, y, w, h);
    // snow
    ctx.fillStyle = 'rgba(230,232,240,0.6)';
    for (let i = 0; i < 90; i++) ctx.fillRect((i * 173) % 640, (i * 97) % 360, 2, 2);
    ctx.fillStyle = 'rgba(10,8,14,0.35)'; ctx.fillRect(0, 0, 640, 360);
    return c;
  },

  async title() {
    const saved = Game.loadSave();
    const f = UI.screen(`<div class="scene"></div>`);
    const sc = f.querySelector('.scene');
    sc.appendChild(this.backdrop('capitol', { scale: 2, y: 60 }));
    const c = document.createElement('div'); c.className = 'center';
    c.innerHTML = `<h2>WASHINGTON CITY · JANUARY 1835</h2><h1>The Capitol Steps</h1>
      <div style="font-size:11px;color:#c8b890;margin-top:6px;font-style:italic">Who conspired against Andrew Jackson?</div>
      <div style="display:flex;gap:12px">
        <button class="btn" id="new">New Case</button>
        ${saved && saved.phase === 'play' ? '<button class="btn" id="cont">Continue</button>' : ''}
      </div>
      ${saved && saved.phase === 'play' ? '<div style="font-size:9px;color:#8a7a60;margin-top:6px">A saved investigation exists. New Case erases it.</div>' : ''}
      <div style="position:absolute;bottom:10px;font-size:9px;color:#8a7a60">Arrow keys or WASD to walk · Space to talk and examine · Tab for evidence</div>`;
    sc.appendChild(c);
    await new Promise(res => {
      c.querySelector('#new').onclick = () => { Game.clearSave(); res('new'); };
      const cont = c.querySelector('#cont'); if (cont) cont.onclick = () => res('cont');
    }).then(async (r) => { if (r === 'cont') await Game.continueGame(saved); else await Game.newGame(); });
  },

  async textCards(sc, cards) {
    const t = document.createElement('div'); t.className = 'text'; sc.appendChild(t);
    for (const card of cards) {
      t.innerHTML = UI.markup(card) + '<span class="cont">click or Space to continue ▸</span>';
      await UI.clickOrKey(sc);
    }
    t.remove();
  },

  async opening() {
    const f = UI.screen(`<div class="scene"></div>`);
    const sc = f.querySelector('.scene');
    sc.appendChild(this.backdrop('capitol', { scale: 2, y: 20 }));
    await this.textCards(sc, [
      "<b>January 30th, 1835.</b> A cold, wet morning. Inside the Capitol, Congress is burying one of its own — Warren Davis of South Carolina.",
      "President Andrew Jackson, sixty-seven years old and walking with a cane, follows the coffin out onto the East Portico. Two hundred mourners crowd the steps.",
      "A man steps out from behind a pillar. Richard Lawrence, a house painter. He raises a pistol at the President's chest and pulls the trigger. <i>Click.</i> A misfire.",
      "He drops it, raises a second pistol. <i>Click.</i> Another misfire. Two loaded pistols, six feet away, and neither one fires. The odds are later put at one in a hundred and twenty-five thousand.",
      "Jackson goes at him with his cane. It takes three men to pull the President off. Lawrence is dragged to the city jail. By nightfall the President is telling anyone who will listen that this was a <b>conspiracy</b> — and he knows who paid for it.",
      "You are a clerk to the city magistrate. You are nineteen. And as of this morning, finding out whether the President is right is your job.",
    ]);
  },

  async briefing() {
    const f = UI.screen(`<div class="scene"></div>`);
    const sc = f.querySelector('.scene');
    sc.style.background = '#2a2226';
    // magistrate's introduction
    await this.textCards(sc, [
      `<div style="display:flex;gap:12px;align-items:flex-start"><img class="px" src="${Assets.url(`assets/portraits/magistrate.png`)}" style="width:96px;height:96px;border:2px solid #6a5636"><div><b style="color:#d0a448">The Magistrate</b><br>"Sit down. Lawrence fired the pistols; two hundred people saw him. That part is settled. What is <i>not</i> settled is whether anybody put him up to it."</div></div>`,
      `<div style="display:flex;gap:12px;align-items:flex-start"><img class="px" src="${Assets.url(`assets/portraits/magistrate.png`)}" style="width:96px;height:96px;border:2px solid #6a5636"><div><b style="color:#d0a448">The Magistrate</b><br>"The President says it was the Bank. The Whigs say it was the President's own tyranny. Here is my difficulty: in six years this man has made more enemies than any president in the history of the country. I have five files. Read them."</div></div>`,
    ]);
    // dossiers
    const read = new Set();
    const wrap = document.createElement('div'); wrap.className = 'dossiers';
    const list = document.createElement('div'); list.className = 'dossier-list';
    const doss = document.createElement('div'); doss.className = 'dossier';
    wrap.appendChild(list); wrap.appendChild(doss); sc.appendChild(wrap);
    const done = document.createElement('button'); done.className = 'btn small'; done.textContent = 'Begin the investigation'; done.disabled = true;
    done.style.marginTop = 'auto';
    list.appendChild(done);
    const show = (s) => {
      read.add(s.id);
      for (const b of list.querySelectorAll('button[data-id]')) { b.classList.toggle('sel', b.dataset.id === s.id); b.classList.toggle('read', read.has(b.dataset.id)); }
      doss.innerHTML = `<img class="big" src="${Assets.url(`assets/portraits/${s.portrait}.png`)}"><div class="body"><h3>${s.name}</h3><div class="meta">${s.title}<br>${s.born} · ${s.where}</div>${s.dossier.map(p => `<p style="margin:0 0 5px">${UI.markup(p)}</p>`).join('')}<div class="grudge">${UI.markup(s.grudge)}</div></div><div class="stamp">${s.topic}</div>`;
      if (read.size === SUSPECTS.length) done.disabled = false;
    };
    for (const s of SUSPECTS) {
      const b = document.createElement('button'); b.dataset.id = s.id;
      b.innerHTML = `<img src="${Assets.url(`assets/portraits/${s.portrait}.png`)}">${s.name.split(' ').slice(-1)[0]}`;
      b.onclick = () => show(s);
      list.insertBefore(b, done);
    }
    show(SUSPECTS[0]);
    await new Promise(res => { done.onclick = res; });
    wrap.remove();
    await this.textCards(sc, [
      `<div style="display:flex;gap:12px;align-items:flex-start"><img class="px" src="${Assets.url(`assets/portraits/magistrate.png`)}" style="width:96px;height:96px;border:2px solid #6a5636"><div><b style="color:#d0a448">The Magistrate</b><br>"Any one of them had reason. That is precisely the problem. Go and talk to them — all five — and to anyone else who'll talk to a clerk. Bring me <i>things</i>. When you've seen everyone and have a case in your hands, come back, and we'll put a name before a jury."</div></div>`,
      `<b>Your task:</b> Interview all five suspects. Collect evidence — at least six pieces. Show evidence to people; some of them will have something to say about it. Keep your <b>worksheet</b> up to date as you go: the game will not do it for you.<br><br><span style="color:#d0a448">There is no single right answer.</span> What matters is whether you can back your accusation with evidence when it goes to trial.`,
    ]);
  },

  // -------------------------------------------------------------------------
  // THE TRIAL — Francis Scott Key prosecutes; the player supplies the evidence
  // -------------------------------------------------------------------------
  WEAK: {
    hat: "A hat. The prosecution presents a hat. Forty such hats were sold this winter; my client owns none of them.",
    pipe: "A pipe proves that somebody, somewhere, smokes. Half the mourners were from South Carolina. Shall we try them all?",
    address_card: "The address of a bank, printed on every note that bank issues. The clerk might as well have presented a penny.",
    bank_note: "Money. The prosecution has found that a man had money. Remarkable. Where is the hand that gave it? Not my client's.",
    resolutions: "A pamphlet from 1798, written by Thomas Jefferson. If reading Jefferson is conspiracy, the prosecution should arrest the Library of Congress.",
    poster: "A scratched election poster. The prosecution's case is that my client was <i>annoyed</i>.",
    playing_cards: "Cards. From a tavern. The jury will note that my client was not at that table, and that the deck does not have his name on it.",
    check: "A ledger of loans, made lawfully, to men who are not on trial. The prosecution has wandered into a different case.",
    whiskey: "Whiskey. Kentucky whiskey. In a tavern. I confess I am astonished.",
    cartoon: "A cartoon. The prosecution's theory is that a <i>drawing</i> pulled the trigger. My client has never held a pen in his life against the President — and a pen is not a pistol.",
  },

  async trial(suspectId) {
    const s = SUSPECT[suspectId];
    const f = UI.screen(`<div class="scene"><div class="court">
      <div class="bench">
        <div class="jury">THE JURY<div class="meter"><i></i></div><div id="jury-word" style="margin-top:2px">unconvinced</div></div>
        <div class="who"><img src="${Assets.url(`assets/portraits/magistrate.png`)}"><span>The Court</span></div>
        <div class="who accused"><img src="${Assets.url(`assets/portraits/${s.portrait}.png`)}"><span>${s.name}</span></div>
      </div>
      <div class="floor">
        <div class="speech" id="speech"></div>
        <div class="rack" id="rack"></div>
        <div id="cont" style="text-align:right;font-size:9px;color:#8a7a60;font-style:italic;margin-top:4px"></div>
      </div></div></div>`);
    const sc = f.querySelector('.scene');
    const speech = f.querySelector('#speech'), rack = f.querySelector('#rack'), meter = f.querySelector('.meter i'), word = f.querySelector('#jury-word'), cont = f.querySelector('#cont');
    let strong = 0;
    const picks = [];
    const say = async (who, text) => {
      speech.innerHTML = `<b>${who}:</b> ${UI.markup(text)}`;
      cont.textContent = 'click or Space ▸';
      await UI.clickOrKey(sc);
      cont.textContent = '';
    };
    const setJury = () => {
      const pct = 10 + strong * 30;
      meter.style.width = pct + '%';
      word.textContent = ['unconvinced', 'listening', 'leaning', 'persuaded'][strong] || 'persuaded';
    };
    await say('The Court', `The United States against ${s.name}, on the charge of conspiring with Richard Lawrence to murder the President. Mr. Key, for the prosecution.`);
    await say('Francis Scott Key', `Gentlemen of the jury. You know what happened on the steps. The question is who stood behind the man who stood behind the pillar. The magistrate's clerk has brought the evidence. I will ask for it three times.`);
    await say('Defense Counsel', `And I will remind the jury three times that a grudge is not a crime, and that this city runs on grudges. My client had reasons to dislike the President. So does every man in this room.`);
    const available = [...Game.state.evidence];
    for (let round = 1; round <= 3; round++) {
      if (!available.length) break;
      speech.innerHTML = `<b>Francis Scott Key:</b> ${round === 1 ? `Clerk — what connects ${s.name} to that morning? Choose your strongest piece.` : round === 2 ? 'Again. What else do you have?' : 'One more. Make it count.'}`;
      rack.innerHTML = '';
      const pick = await new Promise(res => {
        for (const id of available) {
          const d = document.createElement('div'); d.className = 'slot'; d.title = EVIDENCE[id].name;
          d.innerHTML = `<img src="${Assets.url(`assets/evidence/${id}.png`)}">`;
          d.onclick = () => res(id);
          rack.appendChild(d);
        }
      });
      rack.innerHTML = '';
      available.splice(available.indexOf(pick), 1);
      picks.push(pick);
      const e = EVIDENCE[pick];
      const link = e.links && e.links[suspectId];
      await say('Francis Scott Key', `The clerk presents the <b>${e.name}</b>. ${link ? link : 'The jury will consider what it shows.'}`);
      if (link) {
        strong++; setJury();
        await say('Defense Counsel', round === 3 ? "The jury will weigh it. I have said what I can." : "…The jury will weigh it.");
      } else {
        await say('Defense Counsel', this.WEAK[pick]);
        setJury();
      }
    }
    // closing
    let verdict;
    if (strong >= 3) verdict = 'convinced';
    else if (strong === 2) verdict = 'divided';
    else if (strong === 1) verdict = 'doubtful';
    else verdict = 'acquitted';
    if (suspectId === 'ross') {
      await say('Defense Counsel', `Gentlemen. The prosecution has accused a man against whom it holds <i>not one object</i>. No hat, no note, no paper. He was in his hotel with eleven witnesses. He is here because of who he is, and what has been done to his people — not for anything he did.`);
      await say('Defense Counsel', `If we hang men for having been wronged by the President, the gallows will be busy until spring.`);
    } else {
      await say('Defense Counsel', verdict === 'convinced' ? `The prosecution has built a chain. I ask the jury only this: does a chain of *reasons* make a chain of *acts*? Nobody has shown my client's hand on the pistol.` : `The prosecution has shown that my client disliked the President, and that objects exist. Gentlemen, so do I, and so do they.`);
    }
    await say('Francis Scott Key', verdict === 'convinced' ? `Three pieces of evidence, each pointing the same way. The jury may draw its own conclusion.` : verdict === 'acquitted' ? `The clerk has done what could be done with what there was. I have no more to offer.` : `The evidence is not complete. Little in this city ever is. I ask the jury to weigh what it has.`);
    await say('The Court', {
      convinced: `The jury is persuaded that ${s.name} had motive, means, and a connection to the assassin. Whether that is a conspiracy or a coincidence of grudges, the jury will decide tonight — and this court suspects it will decide the way its politics lean.`,
      divided: `The jury is divided. Two strong pieces of evidence and one that proved nothing. They will argue until morning, and this court expects no verdict.`,
      doubtful: `The jury is doubtful. One piece of evidence pointed at the accused; the rest pointed elsewhere, or nowhere. ${s.name} will walk out of this room.`,
      acquitted: `The jury is unconvinced. Not one piece of evidence tied ${s.name} to that morning. The accused is discharged. The clerk is reminded that an accusation requires more than a reason.`,
    }[verdict]);
    return { verdict, strong, picks };
  },

  async epilogue(suspectId, result) {
    const s = SUSPECT[suspectId];
    const f = UI.screen(`<div class="scene"></div>`);
    const sc = f.querySelector('.scene');
    sc.appendChild(this.backdrop('capitol', { scale: 2, y: 100 }));
    const verdictLine = {
      convinced: `You accused <b>${s.name}</b> and the jury was persuaded.`,
      divided: `You accused <b>${s.name}</b> and the jury could not agree.`,
      doubtful: `You accused <b>${s.name}</b> and the jury let him go.`,
      acquitted: `You accused <b>${s.name}</b> and the jury found nothing tying him to the attack.`,
    }[result.verdict];
    const rossNote = suspectId === 'ross' ? `<p class="fact"><b>Notice:</b> John Ross had the strongest <i>motive</i> of anyone in the city — and there was not a single piece of physical evidence against him. If you accused him, ask yourself why. Motive is not evidence. In 1835, a lot of people did not need evidence to suspect a Cherokee.</p>` : '';
    const e = document.createElement('div'); e.className = 'epilogue';
    e.innerHTML = UI.markup(`<h2>WHAT REALLY HAPPENED</h2>
      <p>${verdictLine} You presented ${result.strong} piece${result.strong === 1 ? '' : 's'} of evidence the prosecution could actually use.</p>
      ${rossNote}
      <p class="fact">Richard Lawrence was tried in April 1835. The prosecutor really was Francis Scott Key. The jury took <b>five minutes</b> to find him <b>not guilty by reason of [insanity]</b> — the first such verdict for an attack on a president. He spent the rest of his life in asylums and died in 1861.</p>
      <p class="fact">Jackson went to his grave certain it was a conspiracy. He publicly accused Senator George Poindexter of Mississippi. The Senate investigated and found <b>nothing</b>. No conspiracy was ever proven — against Poindexter, the Bank, Clay, Calhoun, or anyone else.</p>
      <p class="fact">The Bank of the United States lost its charter in 1836 and collapsed. Nicholas Biddle died in 1844, ruined. Henry Clay ran for president again in 1844 and lost. John C. Calhoun spent the rest of his life defending the South and slavery. In 1838–39 the Cherokee were marched west on the [Trail of Tears]; about 4,000 died, including John Ross's wife.</p>
      <p><b>Now compare notes.</b> Who did your classmates accuse, and with what? Which evidence was strongest for each suspect — and which suspect had none? Your worksheet is the record of your case; the debate is the point.</p>
      <div style="text-align:center"><button class="btn" id="back">Return to the city</button></div>`);
    sc.appendChild(e);
    await new Promise(res => { e.querySelector('#back').onclick = res; });
  },

  async help() {
    Game.modal = true;
    const f = UI.screen(`<div class="scene" style="background:rgba(8,6,8,.6)"><div class="help">
      <h3>How to investigate</h3>
      <b>Walk</b> with the arrow keys or <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>. Walk into a door to go inside; walk out the bottom of a room to leave.<br>
      <b>Talk / examine</b> with <kbd>Space</kbd> or <kbd>Enter</kbd> while facing someone or something. A <span style="color:#d0a448">!</span> over a person means they have something new to say — often about evidence you're carrying.<br>
      <b>Evidence</b>: <kbd>Tab</kbd> or the button at the top right. In a conversation, choose <i>Show them something…</i> to hand an item over. Most people won't care. Some will.<br>
      <b>Words with a dotted underline</b> have a definition — hover over them.<br><br>
      <b>Your goal</b>: interview all five suspects (the portraits at top left light up), collect at least six pieces of evidence, then return to the magistrate to accuse someone. Keep your worksheet up to date — the game won't fill it in for you.<br><br>
      <div style="display:flex;gap:10px"><button class="btn small" id="close">Back to the game</button><button class="btn small" id="restart" style="border-color:#962428">Start over (erases your case)</button></div>
    </div></div>`);
    await new Promise(res => {
      f.querySelector('#close').onclick = res;
      const rb = f.querySelector('#restart');
      rb.onclick = () => { if (rb.dataset.armed) { Game.clearSave(); location.reload(); } else { rb.dataset.armed = '1'; rb.textContent = 'Tap again to erase and restart'; } };
    });
    UI.closeScreen(); Game.modal = false;
  },
};
