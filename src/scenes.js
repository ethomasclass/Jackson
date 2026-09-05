/* Fullscreen DOM scenes: title, opening, briefing, act cards, trial, epilogue, help.
   All text at a 9th-grade reading level. */
'use strict';

const Scenes = {
  // A pixel backdrop built from a building sprite, tiled ground and falling snow.
  backdrop(building, opts = {}) {
    const bd = Assets.buildings[building];
    const W = VIEW_W, H = VIEW_H;
    const c = document.createElement('canvas'); c.width = W; c.height = H; c.className = 'bg';
    const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1a1c2c'); g.addColorStop(1, '#3a3446');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const scale = opts.scale || 2;
    const w = bd.w * scale, h = bd.h * scale;
    const x = Math.round((W - w) / 2), y = opts.y != null ? opts.y + Math.round((H - 360) / 2) : Math.round(H - h - 40);
    for (let tx = 0; tx < W; tx += 64) for (let ty = y + h - 60; ty < H; ty += 64) {
      const t = Assets.tile(tx % 128 ? 'flag0' : 'flag1');
      ctx.drawImage(Assets.atlas, t.x, t.y, 32, 32, tx, ty, 64, 64);
    }
    ctx.drawImage(bd.im, x, y, w, h);
    ctx.fillStyle = 'rgba(230,232,240,0.6)';
    for (let i = 0; i < 90 * (W * H) / 230400; i++) ctx.fillRect((i * 173) % W, (i * 97) % H, 2, 2);
    ctx.fillStyle = 'rgba(10,8,14,0.35)'; ctx.fillRect(0, 0, W, H);
    return c;
  },

  async title() {
    const saved = Game.loadSave();
    const f = UI.screen(`<div class="scene"></div>`);
    const sc = f.querySelector('.scene');
    sc.appendChild(this.backdrop('capitol', { scale: 2, y: 60 }));
    const c = document.createElement('div'); c.className = 'center';
    c.innerHTML = `<h2>WASHINGTON CITY · JANUARY 30, 1835</h2><h1>The Capitol Steps</h1>
      <div style="font-size:11px;color:#c8b890;margin-top:6px;font-style:italic">Who plotted against Andrew Jackson? You have one afternoon to find out.</div>
      <div style="display:flex;gap:12px">
        <button class="btn" id="new">New Case</button>
        ${saved && saved.phase === 'play' ? '<button class="btn" id="cont">Continue</button>' : ''}
      </div>
      ${saved && saved.phase === 'play' ? '<div style="font-size:9px;color:#8a7a60;margin-top:6px">A saved case exists. New Case erases it.</div>' : ''}
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
    const litho = document.createElement('canvas'); litho.width = VIEW_W; litho.height = VIEW_H; litho.className = 'bg';
    const lc = litho.getContext('2d'); lc.imageSmoothingEnabled = false;
    const k = Math.max(VIEW_W / 640, VIEW_H / 360);   // cover
    lc.drawImage(Assets.ui.opening, Math.round((VIEW_W - 640 * k) / 2), Math.round((VIEW_H - 360 * k) / 2), Math.round(640 * k), Math.round(360 * k));
    lc.fillStyle = 'rgba(10,8,14,0.25)'; lc.fillRect(0, 0, VIEW_W, VIEW_H);
    sc.appendChild(litho);
    const cap = document.createElement('div'); cap.style.cssText = 'position:absolute;left:10px;top:8px;font-size:8.5px;color:#c8b890;font-style:italic;text-shadow:0 1px 0 #000';
    cap.textContent = '"The Attempted Assassination of the President of the United States" — a print from 1835';
    sc.appendChild(cap);
    await this.textCards(sc, [
      "<b>January 30th, 1835.</b> A cold, wet morning. Inside the Capitol, Congress is holding a funeral for one of its own: Warren Davis of South Carolina.",
      "President Andrew Jackson is sixty-seven years old and walks with a cane. He follows the coffin out onto the East Portico. Two hundred mourners crowd the steps.",
      "A man steps out from behind a pillar. Richard Lawrence, a house painter. He points a pistol at the President's chest and pulls the trigger. <i>Click.</i> It does not fire.",
      "He drops it and raises a second pistol. <i>Click.</i> That one does not fire either. Two loaded pistols, six feet away, and neither one goes off.",
      "Jackson goes at him with his cane. It takes three men to pull the President off. Lawrence is dragged to the city jail. Within the hour, the President is telling everyone that this was a <b>plot</b>, and that he knows who paid for it.",
      "You are a clerk to the city magistrate. You are nineteen. And as of this afternoon, finding out whether the President is right is your job. You have until tonight.",
    ]);
  },

  async briefing() {
    const f = UI.screen(`<div class="scene"></div>`);
    const sc = f.querySelector('.scene');
    sc.style.background = '#2a2226';
    const mag = (t) => `<div style="display:flex;gap:12px;align-items:flex-start"><img class="px" src="${Assets.url(`assets/portraits/magistrate.png`)}" style="width:96px;height:96px;border:2px solid #6a5636"><div><b style="color:#d0a448">The Magistrate</b><br>${t}</div></div>`;
    await this.textCards(sc, [
      mag(`"Sit down. Lawrence fired the pistols. Two hundred people saw him. That part is settled. What is <i>not</i> settled is whether anybody put him up to it."`),
      mag(`"The President says it was the Bank. The Whigs say it was the President's own bullying. Here is my problem. In six years this man has made more enemies than any president before him. I have five files. Read them."`),
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
      mag(`"Any one of them had a reason. That is exactly the problem. Go and talk to them, and to anyone else who will talk to a clerk. Bring me <i>things</i>. And watch the clock. The President wants a name by tonight, and he is not a patient man."`),
      `<b>How this works:</b> The afternoon is split into three parts. Each part has goals, shown at the top of the screen with the time. When you finish the goals, or when time runs out, the magistrate will call you back and the story moves on.<br><br>Keep your <b>worksheet</b> up to date as you go. At each break the game will tell you what to write down.<br><br><span style="color:#d0a448">There is no single right answer.</span> What matters is whether you can back up your accusation with evidence when it goes to trial.`,
    ]);
  },

  // Act title card with worksheet prompts (and, for Act III, the newspaper).
  async actCard(n) {
    const A = STORY.acts[n], S = Game.state;
    const f = UI.screen(`<div class="scene"></div>`);
    const sc = f.querySelector('.scene');
    sc.appendChild(this.backdrop(n === 3 ? 'print_shop' : n === 2 ? 'jail' : 'capitol', { scale: 2, y: 120 }));
    const card = document.createElement('div'); card.className = 'actcard';
    const prev = STORY.acts[n - 1];
    let html = `<div class="kicker">${A.title.toUpperCase()}</div><h1>${A.name}</h1><div class="blurb">${A.blurb}</div>`;
    if (n === 3 && S.prelim) {
      const h = STORY.headline(S.prelim);
      html += `<div class="paper"><div class="masthead">THE WASHINGTON GLOBE — EXTRA</div><div class="dateline">WASHINGTON CITY · FRIDAY EVENING, JANUARY 30, 1835 · TWO CENTS</div><div class="head">${h.head}</div><div class="sub">${h.sub}</div></div>`;
    }
    if (prev) html += `<div class="notebook"><b>Before you go on, write on your worksheet:</b><ol>${prev.notebook.map(p => `<li>${p}</li>`).join('')}</ol></div>`;
    else html += `<div class="notebook"><b>On your worksheet:</b><ol><li>Write the five suspects' names. Leave room under each for what they wanted from Jackson.</li><li>Leave a box for evidence. There are ten pieces in the city.</li></ol></div>`;
    html += `<div class="clockline">It is ${Story.timeLabel(S)}. This part of the day ends by ${Story.deadlineLabel(n)}.</div><button class="btn" id="go">${n === 1 ? 'Begin' : 'Continue'}</button>`;
    card.innerHTML = html;
    sc.appendChild(card);
    await new Promise(res => { card.querySelector('#go').onclick = res; });
    UI.closeScreen();
  },

  // -------------------------------------------------------------------------
  // THE TRIAL — Francis Scott Key prosecutes; the player supplies the evidence
  // -------------------------------------------------------------------------
  WEAK: {
    hat: "A hat. The prosecution shows the jury a hat. Forty hats like it were sold this winter. My client owns none of them.",
    pipe: "A pipe proves that somebody, somewhere, smokes. Half the mourners were from South Carolina. Shall we try them all?",
    address_card: "The address of a bank, printed on every note that bank makes. The clerk might as well have shown you a penny.",
    bank_note: "Money. The prosecution has found that a man had money. Amazing. Where is the hand that gave it? Not my client's.",
    resolutions: "A pamphlet from 1798, written by Thomas Jefferson. If reading Jefferson is a plot, the prosecution should arrest the Library of Congress.",
    poster: "A scratched election poster. The prosecution's case is that my client was <i>annoyed</i>.",
    playing_cards: "Cards. From a tavern. The jury will notice that my client was not at that table, and that the deck does not have his name on it.",
    check: "A list of loans, made legally, to men who are not on trial. The prosecution has wandered into a different case.",
    whiskey: "Whiskey. Kentucky whiskey. In a tavern. I am shocked.",
    cartoon: "A cartoon. The prosecution's idea is that a <i>drawing</i> pulled the trigger. A pen is not a pistol.",
  },

  async trial(suspectId) {
    const s = SUSPECT[suspectId];
    const f = UI.screen(`<div class="scene"><div class="court">
      <div class="bench">
        <div class="jury">THE JURY<div class="meter"><i></i></div><div id="jury-word" style="margin-top:2px">unconvinced</div></div>
        <div class="who"><img src="${Assets.url(`assets/portraits/magistrate.png`)}"><span>The Court</span></div>
        <div class="who"><img src="${Assets.url(`assets/portraits/key.png`)}"><span>F. S. Key, prosecuting</span></div>
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
    await say('The Court', `The United States against ${s.name}, charged with plotting with Richard Lawrence to murder the President. Mr. Key, for the prosecution.`);
    await say('Francis Scott Key', `Gentlemen of the jury. You know what happened on the steps. The question is who stood behind the man who stood behind the pillar. The magistrate's clerk has brought the evidence. I will ask for it three times.`);
    await say('Defense Counsel', `And I will remind the jury three times that a grudge is not a crime, and that this city runs on grudges. My client had reasons to dislike the President. So does every man in this room.`);
    const available = [...Game.state.evidence];
    if (!available.length) await say('Francis Scott Key', `The clerk has brought... nothing. (A long pause.) I have never opened a case with an empty table before. I find I do not enjoy it.`);
    for (let round = 1; round <= 3; round++) {
      if (!available.length) break;
      speech.innerHTML = `<b>Francis Scott Key:</b> ${round === 1 ? `Clerk. What connects ${s.name} to that morning? Choose your strongest piece.` : round === 2 ? 'Again. What else do you have?' : 'One more. Make it count.'}`;
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
        await say('Defense Counsel', round === 3 ? "The jury will weigh it. I have said what I can." : "...The jury will weigh it.");
      } else {
        await say('Defense Counsel', this.WEAK[pick]);
        setJury();
      }
    }
    let verdict;
    if (strong >= 3) verdict = 'convinced';
    else if (strong === 2) verdict = 'divided';
    else if (strong === 1) verdict = 'doubtful';
    else verdict = 'acquitted';
    if (suspectId === 'ross') {
      await say('Defense Counsel', `Gentlemen. The prosecution has accused a man against whom it holds <i>not one object</i>. No hat, no note, no paper. He was in his hotel with eleven witnesses. He is here because of who he is, and what has been done to his people. Not for anything he did.`);
      await say('Defense Counsel', `If we hang men for having been wronged by the President, the gallows will be busy until spring.`);
    } else {
      await say('Defense Counsel', verdict === 'convinced' ? `The prosecution has built a chain. I ask the jury only this: does a chain of *reasons* make a chain of *acts*? Nobody has shown my client's hand on the pistol.` : `The prosecution has shown that my client disliked the President, and that objects exist. Gentlemen, so do I, and so do they.`);
    }
    await say('Francis Scott Key', verdict === 'convinced' ? `Three pieces of evidence, each pointing the same way. The jury may draw its own conclusion.` : verdict === 'acquitted' ? `The clerk has done what could be done with what there was. I have no more to offer.` : `The evidence is not complete. Little in this city ever is. I ask the jury to weigh what it has.`);
    await say('The Court', {
      convinced: `The jury is persuaded that ${s.name} had a motive, the means, and a link to the assassin. Whether that is a plot or a pile of grudges, the jury will decide tonight. This court suspects it will decide the way its politics lean.`,
      divided: `The jury is divided. Two strong pieces of evidence and one that proved nothing. They will argue until morning, and this court expects no verdict.`,
      doubtful: `The jury is doubtful. One piece of evidence pointed at the accused. The rest pointed elsewhere, or nowhere. ${s.name} will walk out of this room.`,
      acquitted: `The jury is unconvinced. Not one piece of evidence tied ${s.name} to that morning. The accused is free to go. The clerk is reminded that an accusation needs more than a reason.`,
    }[verdict]);
    return { verdict, strong, picks };
  },

  async epilogue(suspectId, result) {
    const s = SUSPECT[suspectId], S = Game.state;
    const f = UI.screen(`<div class="scene"></div>`);
    const sc = f.querySelector('.scene');
    sc.appendChild(this.backdrop('capitol', { scale: 2, y: 100 }));
    const verdictLine = {
      convinced: `You accused <b>${s.name}</b> and the jury was persuaded.`,
      divided: `You accused <b>${s.name}</b> and the jury could not agree.`,
      doubtful: `You accused <b>${s.name}</b> and the jury let him go.`,
      acquitted: `You accused <b>${s.name}</b> and the jury found nothing tying him to the attack.`,
    }[result.verdict];
    const prelimLine = S.prelim ? (S.prelim === suspectId
      ? `<p>Earlier in the day you gave the newspaper the same name. You stuck with it.</p>`
      : `<p>Earlier in the day you gave the newspaper a different name: <b>${Story.nameOf(S.prelim)}</b>. ${S.prelim === 'poindexter' ? 'That name came from two witnesses who turned out to be lying.' : 'The paper printed it. You changed your mind after you saw what it cost.'} Think about why.</p>`) : '';
    const rossNote = suspectId === 'ross' ? `<p class="fact"><b>Notice:</b> John Ross had the strongest <i>motive</i> of anyone in the city, and there was not a single piece of physical evidence against him. If you accused him, ask yourself why. Motive is not evidence. In 1835, a lot of people did not need evidence to suspect a Cherokee.</p>` : '';
    const e = document.createElement('div'); e.className = 'epilogue';
    e.innerHTML = UI.markup(`<h2>WHAT REALLY HAPPENED</h2>
      <p>${verdictLine} You presented ${result.strong} piece${result.strong === 1 ? '' : 's'} of evidence the prosecution could actually use.</p>
      ${prelimLine}${rossNote}
      <p class="fact">Richard Lawrence was tried in April 1835. The prosecutor really was Francis Scott Key. The jury took <b>five minutes</b> to find him <b>not guilty by reason of [insanity]</b>. It was the first such verdict for an attack on a president. He spent the rest of his life in asylums and died in 1861.</p>
      <p class="fact">Jackson went to his grave sure it was a plot. He publicly accused Senator George Poindexter of Mississippi. Two men swore they had seen Lawrence at Poindexter's house. Their story fell apart under questioning. The Senate investigated and found <b>nothing</b>. No plot was ever proven, against anyone.</p>
      <p class="fact">The Bank of the United States lost its charter in 1836 and collapsed. Nicholas Biddle died in 1844, ruined. Henry Clay ran for president again in 1844 and lost. John C. Calhoun spent the rest of his life defending the South and slavery. In 1838 and 1839 the Cherokee were marched west on the [Trail of Tears]. About 4,000 died, including John Ross's wife.</p>
      <p><b>Now compare notes.</b> Who did your classmates name in the paper, and who did they accuse at the end? Which evidence was strongest for each suspect, and which suspect had none? Your worksheet is the record of your case. The argument is the point.</p>
      <div style="text-align:center"><button class="btn" id="back">Return to the city</button></div>`);
    sc.appendChild(e);
    await new Promise(res => { e.querySelector('#back').onclick = res; });
  },

  async help() {
    Game.modal = true;
    const f = UI.screen(`<div class="scene" style="background:rgba(8,6,8,.6)"><div class="help">
      <h3>How to investigate</h3>
      <b>Walk</b> with the arrow keys or <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>. Walk into a door to go inside. Walk out the bottom of a room to leave.<br>
      <b>Talk / examine</b> with <kbd>Space</kbd> or <kbd>Enter</kbd> while facing someone or something. A <span style="color:#d0a448">!</span> over a person means they have something new to say, often about evidence you are carrying.<br>
      <b>Evidence</b>: <kbd>Tab</kbd> or the button at the top right. In a conversation, choose <i>Show them something…</i> to hand an item over. Most people won't care. Some will.<br>
      <b>Toby</b> follows you. Turn around and talk to him for hints. <b>Words with a dotted underline</b> have a definition; hover over them.<br><br>
      <b>The clock</b> at the top is real. The afternoon has three parts, each with goals. When you finish them, or time runs out, the story moves on. At the end you must name someone and back it up in court. Keep your worksheet up to date; the game won't fill it in for you.<br><br>
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
