/* Every conversation in the game. Each entry: { name, portrait, start, nodes, onEvidence }.
   Node text: a string, an array of pages, or a function(S). "@Name|portrait: text" switches speaker for one page.
   [term] marks a glossary word. Keep pages under ~50 words. */
'use strict';

const DIALOGUE = {};
function D(id, def) { def.id = id; DIALOGUE[id] = def; return def; }
const met = (S, id) => S.seen[id] && Object.keys(S.seen[id]).length > 0;

// ===========================================================================
// THE MAGISTRATE
// ===========================================================================
D('magistrate', {
  name: 'The Magistrate', portrait: 'magistrate',
  start: (S) => !S.flags.mag_first ? 'first' : 'hub',
  isNew: (S) => !S.flags.mag_first || (Game.warrantReady() && !S.flags.trial_done),
  nodes: {
    first: {
      text: [
        "You've read the files. Good. Then you know what I know: five people in this city had reason to want the President dead, and a house painter with two bad pistols nearly did it for them.",
        "Lawrence is in the cells behind me. Start with him. Then the steps at the Capitol — the hat was still lying there when I left. After that, the city is yours.",
        "Bring me *things*, clerk. Not opinions. Everyone in Washington has an opinion. I want evidence, and I want you to be able to say what each piece proves.",
      ],
      set: { mag_first: true }, next: 'hub',
    },
    hub: {
      text: (S) => Game.warrantReady() && !S.flags.trial_done ? "You've spoken to all five and you're carrying a case. Are you ready to name someone?" : "What is it?",
      choices: (S) => [
        { label: 'Remind me what I am looking for.', next: 'remind' },
        { label: 'Where should I go?', next: 'where' },
        { label: 'I am ready to name a conspirator.', next: Game.warrantReady() ? 'accuse' : 'notready', cond: () => !S.flags.trial_done },
        { label: 'Can I see the files again?', next: 'files' },
      ],
      leaveLabel: "I'll get back to work.",
    },
    remind: {
      text: [
        "Lawrence fired the pistols. That's settled — two hundred people saw it. The question is whether anyone *put* him there. A conspiracy needs more than a grudge.",
        "For each suspect, ask yourself three things. Did they have a reason? Did they have the means — money, access, a way to reach a madman? And is there anything I can hold in my hand that connects them to that morning?",
      ], next: 'hub',
    },
    where: {
      text: [
        "The cells are through the bars to your right. The Capitol steps are at the east end of the Avenue; the President's House at the west. The President, by the way, will see you. He sees everyone. He'll tell you who did it before you sit down.",
        "Clay drinks at Gadsby's tavern. Biddle is at the Bank's office. Calhoun lodges at Mrs. Hill's. The Cherokee delegation is at the Indian Queen. Gregory works at the hatter's on the lane. Talk to *everyone* — clerks, keepers, servants. People tell a clerk what they'd never tell me.",
      ], next: 'hub',
    },
    files: {
      text: "The dossiers are in your head, or should be. But every suspect will tell you their own story if you ask — and it will not be the story in my file. Compare them.",
      next: 'hub',
    },
    notready: {
      text: (S) => "Not yet. Before I sign a warrant you must: " + Game.warrantMissing().join('; ') + ". A judge won't hear a case built on half the city.",
      next: 'hub',
    },
    accuse: {
      text: "Very well. Think before you speak. Once you name a man, Mr. Key will put him on trial — and *you* will be the one holding the evidence. Who conspired with Richard Lawrence?",
      choices: (S) => SUSPECTS.map(s => ({ label: s.name, next: 'confirm', fn: (S) => { S.flags._pick = s.id; } })),
      leaveLabel: 'I need more time.',
    },
    confirm: {
      text: (S) => `${SUSPECT[S.flags._pick].name}. You are certain?`,
      choices: [
        { label: 'Yes. Issue the warrant.', next: 'go' },
        { label: 'No — let me think again.', next: 'accuse' },
      ], leave: false,
    },
    go: {
      text: (S) => `So be it. ${SUSPECT[S.flags._pick].name} will stand before a jury tomorrow. Bring your evidence, and pray it is better than mine was.`,
      fn: (S) => { S.pendingAccuse = S.flags._pick; },
      next: 'END',
    },
  },
});

// ===========================================================================
// RICHARD LAWRENCE — the man who fired the pistols
// ===========================================================================
D('lawrence', {
  name: 'Richard Lawrence', portrait: 'lawrence',
  start: (S) => met(S, 'lawrence') ? 'hub' : 'intro',
  brushOff: "Is it mine? Everything is mine. I am the King.",
  nodes: {
    intro: {
      text: [
        "(He does not look up. He is sitting very straight on the cot, as if on a throne.)",
        "Have you come from the King? No — I am the King. Richard the Third, of England. They keep me in this place because the President has stolen my money.",
        "Ask what you like. A king answers no one, but I am feeling generous.",
      ], next: 'hub',
    },
    hub: {
      text: "(He waits, chin up.)",
      choices: [
        { label: 'Why did you fire at the President?', next: 'why' },
        { label: 'Did anyone tell you to do it?', next: 'who' },
        { label: 'Where did you get the pistols?', next: 'pistols' },
        { label: 'Tell me about the hat.', next: 'hat' },
        { label: 'Do you understand where you are?', next: 'where' },
      ],
    },
    why: {
      text: [
        "He killed my father. He keeps me from my money. The government owes me a great fortune — for my kingdom, you understand — and Jackson stands in the way of Congress paying it.",
        "With him gone, Congress would pay. Someone told me so. A gentleman. Or the newspaper. Or the wind on the Avenue. They all say the same thing, if you listen.",
      ], next: 'hub',
    },
    who: {
      text: [
        "Everyone told me. The papers say he is a tyrant; the men at the tavern say it louder. A gentleman there bought me a bottle and laughed. A man at a shop gave me a coat, and a hat, because I was cold.",
        "None of them said *shoot*. They said *king*. I heard the rest. (He smiles.) Do you have my money?",
      ], set: { law_who: true }, next: 'hub',
    },
    pistols: {
      text: [
        "I bought them. Good pistols — I tested them in the yard. Both misfired on the steps. The damp, or the devil. I used to paint houses. Then the Bank took the credit away and no one could pay for paint, and I found out I was a king instead.",
      ], next: 'hub',
    },
    hat: {
      text: [
        "Not mine. I had a hat — a plain one, red lining, a gift — and I lost it in November. I was bareheaded on the steps. A king needs no hat.",
        "The one they found was a *gentleman's* hat. Someone standing very near dropped it. Very near. Ask him, whoever he is.",
      ], set: { hat_not_lawrence: true }, next: 'hub',
    },
    where: {
      text: [
        "In a cell, waiting for a trial. Mr. Key will prosecute me — the man who wrote the song about the flag. They will say I am mad. Perhaps I am.",
        "Perhaps a madman is the only kind who would do what so many of them *wished*.",
      ], next: 'hub',
    },
    ev_hat: { text: "Not mine. I told you. Mine had a red lining and no mark. That is a rich man's hat.", next: 'hub' },
    ev_note: { text: "My money! A piece of it, at least. A gentleman gave it to me — for a job of painting, he said, but there was no job. He had a big voice and a kind face. They all do.", set: { law_note: true }, next: 'hub' },
    ev_card: { text: "The Bank. Yes. I wrote to them — many letters, to Philadelphia. They owe me too. Mr. Biddle wrote back once, very politely, that they did not. Everyone lies to a king.", next: 'hub' },
    ev_cards: { text: "I played. I lost. The tall Kentucky gentleman laughed and paid for the whiskey and said the President owed *everyone* money. That was true, at least.", next: 'hub' },
    ev_cartoon: { text: "King Andrew. (He studies it a long time.) Yes. But there cannot be two kings. That is the whole trouble, you see.", next: 'hub' },
  },
  onEvidence: { hat: 'ev_hat', bank_note: 'ev_note', address_card: 'ev_card', playing_cards: 'ev_cards', whiskey: 'ev_cards', cartoon: 'ev_cartoon' },
});

D('jailer', {
  name: 'The Jailer', portrait: null,
  start: (S) => met(S, 'jailer') ? 'hub' : 'intro',
  nodes: {
    intro: {
      text: [
        "Talked to him yet? Twenty minutes ago he was Richard the Third. Now he's Richard the Second. By supper he'll be somebody's cousin.",
        "His things are on the table there, and his coat's in the crate. Have a look. Odd things for a house painter to be carrying.",
      ], next: 'hub',
    },
    hub: {
      text: "What else?",
      choices: [
        { label: 'What do you know about him?', next: 'about' },
        { label: 'Has he had visitors?', next: 'visitors' },
        { label: 'Is he really mad?', next: 'mad' },
      ],
    },
    about: {
      text: [
        "Painter. English-born. Had steady work until two years back, when the [Bank|bank war] tightened credit and nobody in Washington could pay to have a wall painted. Lost his trade, lost his rooms, went odd. Harmless, we all thought.",
        "That's the thing about the [Bank War]. Jackson and Biddle fought it in speeches. Men like him fought it in the street, and lost.",
      ], next: 'hub',
    },
    visitors: {
      text: [
        "The President's men first thing — the General wanted to know who paid him. Then a lawyer nobody sent for. Then a gentleman who wouldn't give his name and left before I got a look. Good coat. Good hat.",
      ], next: 'hub',
    },
    mad: {
      text: "Mad as a March hare. But he loaded two pistols, walked a mile, and picked the one moment the President was in the open. Mad isn't the same as stupid. Somebody may have counted on that.",
      next: 'hub',
    },
  },
  onEvidence: {
    bank_note: 'n', address_card: 'c',
  },
});
DIALOGUE.jailer.nodes.n = { text: "New Bank paper, in that pocket. I've been a jailer twelve years and I've never taken a new Bank note off a man who couldn't pay his rent.", next: 'hub' };
DIALOGUE.jailer.nodes.c = { text: "Chestnut Street. That's the Bank's head office in Philadelphia. He wrote them every week — the postmaster will tell you. Demanding his fortune.", next: 'hub' };

// ===========================================================================
// THE CAPITOL STEPS
// ===========================================================================
D('guard', {
  name: 'Capitol Guard', portrait: null,
  start: (S) => met(S, 'guard') ? 'hub' : 'intro',
  nodes: {
    intro: {
      text: [
        "I was six feet from him. The President came out of the funeral — Congressman Davis, from South Carolina — and this fellow steps from behind a pillar, raises a pistol, and: *click*.",
        "Then the second pistol. *Click*. Then the General went at him with his cane, sixty-seven years old, and it took three of us to pull him off.",
      ], next: 'hub',
    },
    hub: {
      text: "Anything else?",
      choices: [
        { label: 'Who was standing near the President?', next: 'near' },
        { label: 'What about the hat?', next: 'hat' },
        { label: 'Why was the President here?', next: 'why' },
      ],
    },
    near: {
      text: [
        "Everyone. Half the government. Vice President Van Buren. Senator Calhoun at the top of the steps — Davis was his own state's man. Senator Clay, big as life. Two hundred mourners, and every one of them saw it differently.",
      ], set: { guard_near: true }, next: 'hub',
    },
    hat: {
      text: "Not the painter's. He was bareheaded — I'd swear it. Somebody dropped that hat in the crush. Somebody standing very near the President when the pistol came up.",
      set: { hat_not_lawrence: true }, next: 'hub',
    },
    why: {
      text: "A funeral for a congressman. The President walks out with the mourners like anyone else. No guard to speak of — that's how it was, then. He'd have it no other way. Says he was elected by the people; he'll not hide from them.",
      next: 'hub',
    },
  },
  onEvidence: { hat: 'h', pipe: 'p' },
});
DIALOGUE.guard.nodes.h = { text: "That's it. Lay right there. Mind — half the men on those steps could afford a hat like that. It's the mark inside you want to chase.", next: 'hub' };
DIALOGUE.guard.nodes.p = { text: "South Carolina pipe. Half the mourners were South Carolina men; it was their congressman in the box. Senator Calhoun was smoking one, I think. Can't say it was that one.", next: 'hub' };

D('witness', {
  name: 'Congressman Polk (Tennessee)', portrait: null,
  start: (S) => met(S, 'witness') ? 'hub' : 'intro',
  nodes: {
    intro: {
      text: [
        "The [Bank|bank] did this. Mark me. Biddle's money, Clay's tongue, and a lunatic's hand. I've said so to the President and I'll say so to you.",
      ], next: 'hub',
    },
    hub: {
      text: "Well?",
      choices: [
        { label: 'Why blame the Bank?', next: 'bank' },
        { label: 'Is that evidence, or opinion?', next: 'opinion' },
        { label: 'What did you see?', next: 'saw' },
      ],
    },
    bank: {
      text: [
        "The Bank holds the people's money and lends it to congressmen at sweet rates — buys them, in plain words. The General [vetoed|veto] its charter. Biddle answered by calling in loans across the whole country, to make people suffer and blame Jackson.",
        "A man who'd starve a nation to win an argument would hire a madman to end one.",
      ], next: 'hub',
    },
    opinion: {
      text: "It's *sense*. Evidence is your job, clerk. But when you find the money — and you will — remember who told you where to look.",
      next: 'hub',
    },
    saw: {
      text: "The flash of the cap, twice. The General roaring. And Henry Clay, ten feet off, with a face I couldn't read. I've known him twenty years and I couldn't read it.",
      next: 'hub',
    },
  },
  onEvidence: { bank_note: 'n', check: 'c', address_card: 'a' },
});
DIALOGUE.witness.nodes.n = { text: "There. *There.* The Bank's own paper in the assassin's pocket. Take that to the magistrate and be done.", next: 'hub' };
DIALOGUE.witness.nodes.c = { text: "Five million dollars in loans to Congress. I said they bought them. Now you've got the receipt.", next: 'hub' };
DIALOGUE.witness.nodes.a = { text: "Biddle's own door. What more do you need — a signed confession on Bank letterhead?", next: 'hub' };

D('mourner', {
  name: 'A Mourner', portrait: null,
  start: (S) => met(S, 'mourner') ? 'hub' : 'intro',
  nodes: {
    intro: {
      text: [
        "I came for Mr. Davis's funeral, not for this. Though I suppose it was always going to happen to *him*, one day. The President makes enemies the way other men make conversation.",
      ], next: 'hub',
    },
    hub: {
      text: "Yes?",
      choices: [
        { label: 'Why does he have so many enemies?', next: 'why' },
        { label: 'What did you see?', next: 'saw' },
      ],
    },
    why: {
      text: [
        "Because he treats the law as a suggestion. He ignored the Supreme Court on the Cherokee. He fired six hundred men for voting wrong. He vetoes whatever Congress sends him and calls it the people's will.",
        "The South, the Bank, the Indians, half his own Cabinet. He didn't just make enemies, young man. He *collected* them.",
      ], next: 'hub',
    },
    saw: {
      text: "I saw a man everyone had been told to hate, and a man who believed everything he was told. I'm not sure which of them frightened me more.",
      next: 'hub',
    },
  },
});

// ===========================================================================
// THE POST OFFICE — the spoils system
// ===========================================================================
D('postmaster', {
  name: 'Postmaster Blount', portrait: null,
  start: (S) => met(S, 'postmaster') ? 'hub' : 'intro',
  nodes: {
    intro: {
      text: [
        "Welcome, welcome! New postmaster — well, six years new. Came up from Tennessee with the General in '29. Best day of my life, the day he won.",
        "You'll be asking about Gregory. Everybody does, since the steps. Ask away; I've nothing to hide and a great deal to say.",
      ], next: 'hub',
    },
    hub: {
      text: "What can I tell you?",
      choices: [
        { label: 'What happened to the man before you?', next: 'gregory' },
        { label: 'Is that fair?', next: 'fair', cond: (S) => S.flags.pm_gregory },
        { label: 'Did you know Richard Lawrence?', next: 'lawrence' },
        { label: 'What is the poster on the wall?', next: 'poster' },
      ],
    },
    gregory: {
      text: [
        "Gregory? Good clerk, they say. But he served Mr. Adams, and the people voted for a change. [Rotation in office], the General calls it. A government job isn't a man's *property*. Every citizen should take a turn.",
        "And every man who serves the President ought to be loyal to him. Gregory wasn't. Wrote letters to the papers calling him King Andrew! You can't keep a man like that at the public's desk.",
      ], set: { pm_gregory: true }, next: 'hub',
    },
    fair: {
      text: [
        "Fair? Look — the papers call it a massacre. It was six hundred-odd officers replaced, out of ten thousand. Every president before him did it too, quiet-like. The General just did it *out loud*, and said why.",
        "He says a plain man can do a clerk's job as well as a gentleman. I'm the proof. Mostly.",
      ], next: 'hub',
    },
    lawrence: {
      text: [
        "The painter? In here every week, mailing letters to Philadelphia — to the [Bank|bank], if you can believe it. Demanding money. Pages and pages. I'd have thrown them out, but a letter's a letter. That's the rule.",
      ], set: { pm_lawrence: true }, next: 'hub',
    },
    poster: {
      text: "Jackson and Reform, 1828. I put it up the day I took this desk. Somebody's scratched it — you'll see. Go on, take a look. I never took it down. Reminds me not everyone voted our way.",
      next: 'hub',
    },
  },
  onEvidence: { poster: 'p', cartoon: 'c', address_card: 'a', bank_note: 'n' },
});
DIALOGUE.postmaster.nodes.p = { text: "Ha! Gregory's parting gift. Scratched KING across the General's name the morning he left, and slammed the door on his way out. Petty. But then, he'd lost his living. I'd have been petty too.", next: 'hub' };
DIALOGUE.postmaster.nodes.c = { text: "That filth. Gregory wrote it — the printer will tell you. Free speech, I suppose. Right up until it's a pistol.", next: 'hub' };
DIALOGUE.postmaster.nodes.a = { text: "Chestnut Street — that's where the painter's letters went. Dozens of them. I'd know that address in my sleep.", next: 'hub' };
DIALOGUE.postmaster.nodes.n = { text: "New Bank paper. Hm. That's what they pay the congressmen in. Never seen one in a painter's hand.", next: 'hub' };

D('po_clerk', {
  name: 'Sweeping Boy', portrait: null,
  start: 'a',
  nodes: {
    a: { text: "Mr. Gregory used to give me a penny to sweep. The new man gives me two, and a lecture on democracy. I take the two.", next: 'b' },
    b: { text: "Mr. Gregory still comes by, sometimes. Stands across the street and looks at the door. Doesn't come in.", next: 'END', leave: false },
  },
});

// ===========================================================================
// THE HAT SHOP — John Gregory
// ===========================================================================
D('gregory', {
  name: 'John Gregory', portrait: 'gregory',
  start: (S) => met(S, 'gregory') ? 'hub' : 'intro',
  brushOff: "That means nothing to me.",
  nodes: {
    intro: {
      text: [
        "You're the magistrate's clerk. I heard. Come to ask whether the man who called the President a king wanted him dead.",
        "(He sets down his pen very precisely.) Ask, then. I've answered worse questions from better men.",
      ], interviewed: 'gregory', next: 'hub',
    },
    hub: {
      text: "(He waits.)",
      choices: [
        { label: 'Tell me about the Post Office.', next: 'po' },
        { label: 'Why call him King Andrew?', next: 'king' },
        { label: 'Where were you on the 30th?', next: 'alibi' },
        { label: 'Did you know Richard Lawrence?', next: 'lawrence' },
        { label: 'What would you have done differently?', next: 'diff', cond: (S) => S.flags.greg_po },
      ],
    },
    po: {
      text: [
        "Ten years. I served under Mr. Adams, and I'd have served under Jackson — I don't care who is President; I care whether the mail moves. He cared whether I'd *voted* for him. I hadn't. That was enough.",
        "They call it the [spoils system]. \"To the victor belong the spoils.\" I was the spoils. A man from Tennessee who couldn't spell *Philadelphia* has my desk, because he's loyal.",
      ], set: { greg_po: true }, next: 'hub',
    },
    king: {
      text: [
        "Because he behaves like one. Twelve [vetoes|veto] — more than every president before him put together. He ignored the Supreme Court on the Cherokee. He fires anyone who isn't loyal to *him* — not the country, him.",
        "If a man rules by his own will and calls it the people's, what is he? I wrote the word. I'd write it again.",
      ], next: 'hub',
    },
    alibi: {
      text: [
        "Here. Selling hats. Mr. Fenwick will tell you — though he was at the funeral himself most of the morning, like half the city. I was alone in the shop.",
        "That's not an alibi. I know. It's just the truth, which is a thing I've found doesn't help much.",
      ], next: 'hub',
    },
    lawrence: {
      text: [
        "He came in for a coat in the autumn. Couldn't pay. Talked about being the King of England. I felt sorry for him — I know what it is to lose your work and go a little strange.",
        "I gave him an old hat of mine. Red lining. (A pause.) I should not have told you that.",
      ], set: { greg_lawrence: true }, next: 'hub',
    },
    diff: {
      text: "I'd have kept the clerks and fired the Cabinet. But then, I'd never have been elected, so what does it matter what I'd have done.",
      next: 'hub',
    },
    ev_hat: {
      text: [
        "(He turns it over. His face does something complicated.) Our mark. The stag. I sold — *we* sold — forty of these this winter. Congressmen, clerks, a coachman. It's a popular hat.",
        "It's not the one I gave Lawrence. His had a red lining and no mark; this has neither. (He hands it back.) You'll want the order book. It's on that desk. I keep it honest.",
      ], set: { greg_hat: true }, next: 'hub',
    },
    ev_cartoon: { text: "I wrote it. Every word. And I'd write it again. Writing is not shooting, clerk. If it were, half of Washington would hang and the other half would be printing the tickets.", next: 'hub' },
    ev_poster: { text: "I scratched it. Childish. I was angry. I'm still angry. That is not a crime either — though I gather the President is working on it.", next: 'hub' },
    ev_note: { text: "New Bank money? On a house painter? Then someone gave it to him, and it wasn't me. Look at me. I earn nine dollars a week and I owe six of it.", next: 'hub' },
    ev_cards: { text: "I don't gamble. I can't afford to. That's Clay's table, not mine.", next: 'hub' },
  },
  onEvidence: { hat: 'ev_hat', cartoon: 'ev_cartoon', poster: 'ev_poster', bank_note: 'ev_note', playing_cards: 'ev_cards', whiskey: 'ev_cards' },
});

D('hatter', {
  name: 'Mr. Fenwick', portrait: null,
  start: (S) => met(S, 'hatter') ? 'hub' : 'intro',
  nodes: {
    intro: { text: "Gregory? Best clerk I've ever had. Keeps the books like a churchman. Angry man, though. Reads the papers and mutters. Reads them twice and writes letters.", next: 'hub' },
    hub: {
      text: "Hm?",
      choices: [
        { label: 'Was he here on the 30th?', next: 'alibi' },
        { label: 'Who buys your hats?', next: 'who' },
      ],
    },
    alibi: { text: "I was at the funeral myself — half the city was. He minded the shop. Whether he *stayed* in it, I couldn't say. It's a five-minute walk to the Capitol.", next: 'hub' },
    who: { text: "Anyone with four dollars. Senators. Clerks. Mr. Clay's coachman. A hat's a hat, sir — it doesn't ask who you voted for.", next: 'hub' },
  },
  onEvidence: { hat: 'h' },
});
DIALOGUE.hatter.nodes.h = { text: "Ours, no question. Beaver felt, this winter's block. Forty-odd sold. Gregory's order book will have the names, if you can get him to open it.", next: 'hub' };

// ===========================================================================
// THE TAVERN — Henry Clay
// ===========================================================================
D('tavernkeeper', {
  name: 'The Keeper', portrait: null,
  start: (S) => met(S, 'tavernkeeper') ? 'hub' : 'intro',
  nodes: {
    intro: { text: "Ale, or information? Information's dearer. (He wipes a glass.) Magistrate's clerk, are you. Then it's free, and you'll get what you pay for.", next: 'hub' },
    hub: {
      text: "Go on.",
      choices: [
        { label: 'Who drinks here?', next: 'who' },
        { label: 'Did the painter come here?', next: 'lawrence' },
        { label: 'What do people say about the President?', next: 'jackson' },
      ],
    },
    who: {
      text: [
        "Congressmen. Mr. Clay holds court at the back table — cards, whiskey, and deals. Half the compromises in the Union were made at that table. The other half were lost at it.",
      ], next: 'hub',
    },
    lawrence: {
      text: [
        "Lawrence? Sat in the corner with a glass he couldn't pay for. Mr. Clay stood him a bottle once — pity, or amusement. He'd go on about being King of England, and the gentlemen would laugh and buy him another.",
      ], set: { tk_lawrence: true }, next: 'hub',
    },
    jackson: {
      text: "In here? That he's a tyrant, a hero, a fool, and a saint — depending on the hour and who's paying. Most of them voted for him. Most of them would again. That's the part nobody says out loud.",
      next: 'hub',
    },
  },
  onEvidence: { whiskey: 'w', playing_cards: 'c', bank_note: 'n' },
});
DIALOGUE.tavernkeeper.nodes.w = { text: "Mr. Clay's brand. He bought that bottle for a guest last week — two glasses, you'll have noticed. Don't ask me who. I pour; I don't listen. Much.", next: 'hub' };
DIALOGUE.tavernkeeper.nodes.c = { text: "Marked, are they? Not Mr. Clay's doing — he doesn't need to cheat; he's that good. Somebody at that table wanted money badly and hadn't the skill to win it.", next: 'hub' };
DIALOGUE.tavernkeeper.nodes.n = { text: "New Bank paper. I see a lot of it lately. The Bank's been generous to the gentlemen this winter. Not to me.", next: 'hub' };

D('clay', {
  name: 'Henry Clay', portrait: 'clay',
  start: (S) => met(S, 'clay') ? 'hub' : 'intro',
  brushOff: "Charming. Irrelevant.",
  nodes: {
    intro: {
      text: [
        "Ah! The magistrate's bloodhound. Sit, sit. You'll take a glass? No? Sensible. I never was.",
        "You want to know if Henry Clay hired a lunatic to shoot Andrew Jackson. (He laughs, genuinely.) My dear boy, if I wanted him dead I'd have run against him again. It nearly worked in '32.",
      ], interviewed: 'clay', next: 'hub',
    },
    hub: {
      text: "(He leans back, entirely at ease.)",
      choices: [
        { label: 'Why does the President hate you?', next: 'bargain' },
        { label: 'What is the American System?', next: 'system' },
        { label: 'Tell me about the Bank.', next: 'bank' },
        { label: 'Did you know Richard Lawrence?', next: 'lawrence' },
        { label: 'Where were you on the 30th?', next: 'alibi' },
      ],
    },
    bargain: {
      text: [
        "1824. Four candidates, no majority, so the House of Representatives chose — and I chose Adams. He made me Secretary of State. Jackson called it a [corrupt bargain] and has called me a cheat every day since. Eleven years.",
        "It was politics. He took it personally. He takes *everything* personally — that's his genius and his sickness. And he's never lost a fight he took personally.",
      ], next: 'hub',
    },
    system: {
      text: [
        "Roads. Canals. A national [bank]. A [tariff] to pay for it all. An [American System] to knit a country of farmers into a nation. Jackson sees the rich robbing the poor. I see the future.",
        "One of us is right. The voters seem to think it's him. Twice.",
      ], next: 'hub',
    },
    bank: {
      text: [
        "Biddle's [Bank|bank]. Yes, I pushed its [charter] through Congress four years early, in '32, to make Jackson [veto] it before the election. I thought the country would punish him for it.",
        "He vetoed it, called it a monster, and won by a landslide. So much for cleverness. Then he pulled out the government's money and the Bank started to die. It is dying still.",
      ], next: 'hub',
    },
    lawrence: {
      text: [
        "The painter king! He'd sit in that corner declaiming. I bought him a bottle once; he told me Jackson owed him money. \"So does everyone,\" I said. We all laughed. He laughed too, I think.",
        "If pity is conspiracy, arrest me. Arrest the keeper. Arrest the man who gave him a hat.",
      ], set: { clay_lawrence: true }, next: 'hub',
    },
    alibi: {
      text: [
        "At the funeral, with two hundred others. I stood near the President — everyone did; it's a funeral, one crowds. I saw the flash. Then I saw an old man beat a lunatic with a cane.",
        "And I confess I thought: *there is the whole presidency in one picture*.",
      ], next: 'hub',
    },
    ev_cards: { text: "Marked? (His smile thins.) Not by me. A man who marks cards at my table needs money and lacks nerve. Lawrence played, now and then. Lost. Always. That is not a conspiracy; that is a Tuesday.", next: 'hub' },
    ev_whiskey: { text: "Mine, or was. The second glass? A guest. I entertain a great many people, clerk — that is what politics *is*. If you want the name, ask the keeper. He never remembers, which is why I drink here.", next: 'hub' },
    ev_check: {
      text: [
        "(He reads it, and for once he stops smiling.) Where did you get this. — No. Never mind. Yes. The Bank lends money to members of Congress. I have borrowed. So has Webster. So would you.",
        "It's a loan, not a bribe. Though I grant you the General has never been able to tell the difference, and it seems I've just handed you the same trouble.",
      ], set: { clay_check: true }, next: 'hub',
    },
    ev_note: { text: "New Washington paper. The Bank's been paying out a good deal lately — to a good many people. Ask Biddle. Or his clerk; clerks know everything. You'd know.", next: 'hub' },
    ev_cartoon: { text: "Splendid, isn't it? King Andrew. I've had one framed. Gregory writes well for a man who's never been elected to anything.", next: 'hub' },
    ev_pipe: { text: "Calhoun's. He was on the steps — Davis was his man. He and I made peace over the tariff in '33, you know. Saved the Union, I like to think. He'd say he did.", next: 'hub' },
  },
  onEvidence: { playing_cards: 'ev_cards', whiskey: 'ev_whiskey', check: 'ev_check', bank_note: 'ev_note', cartoon: 'ev_cartoon', pipe: 'ev_pipe' },
});

D('congressman', {
  name: 'A Whig Congressman', portrait: null,
  start: (S) => met(S, 'congressman') ? 'hub' : 'intro',
  nodes: {
    intro: { text: "Everyone knows who did this, clerk. The trouble is that everyone knows something different.", next: 'hub' },
    hub: {
      text: "Mm?",
      choices: [
        { label: 'What is a Whig?', next: 'whig' },
        { label: 'What does Washington think?', next: 'think' },
      ],
    },
    whig: {
      text: [
        "A [Whig|whig] is a man who thinks the President has too much power. We took the name from the English party that stood up to the king. Clay leads us. Jackson gave us our reason to exist — every veto, every fired clerk, every ignored court.",
      ], next: 'hub',
    },
    think: {
      text: [
        "Jackson says the Bank did it. Biddle says Jackson's own mob drove the man mad. The South says Providence was clumsy. The Cherokee say nothing at all — which is wiser than the rest of us.",
      ], next: 'hub',
    },
  },
});

// ===========================================================================
// THE BANK — Nicholas Biddle
// ===========================================================================
D('bank_clerk', {
  name: "The Bank's Clerk", portrait: null,
  start: (S) => met(S, 'bank_clerk') ? 'hub' : 'intro',
  nodes: {
    intro: { text: "The Bank is a private institution and I really cannot discuss — well. The magistrate. Yes. (He straightens his collar.) Ask. I'll say what I can.", next: 'hub' },
    hub: {
      text: "(He glances toward Mr. Biddle.)",
      choices: [
        { label: 'What does this office do?', next: 'do' },
        { label: 'Did the Bank cause the panic?', next: 'panic' },
      ],
    },
    do: {
      text: [
        "It held the government's money. *Held.* The President withdrew the deposits in '33 and gave them to state banks — his \"pet banks\", the papers call them. Now we... manage. Mr. Biddle has been here a week, managing.",
      ], next: 'hub',
    },
    panic: {
      text: [
        "Mr. Biddle tightened credit last year. Called in loans, refused new ones. He said it would show the country what Jackson's policy would cost. It showed a great many farmers and tradesmen the inside of a courtroom.",
        "He won the argument, in a way. He lost the country.",
      ], next: 'hub',
    },
  },
  onEvidence: { bank_note: 'n', address_card: 'a', check: 'c' },
});
DIALOGUE.bank_clerk.nodes.n = {
  text: [
    "Ours. Washington branch, this series — paid out three weeks ago. (He checks the book before he can stop himself.) Part of a draw of five hundred dollars. Cash. To... Senator Clay's account.",
    "I should not have said that. Please don't tell Mr. Biddle I said that.",
  ], set: { note_to_clay: true }, next: 'hub',
};
DIALOGUE.bank_clerk.nodes.a = { text: "Chestnut Street — head office. We receive letters from every lunatic in the Union. Lawrence wrote weekly, demanding a fortune. Mr. Biddle answered once, kindly. Once.", next: 'hub' };
DIALOGUE.bank_clerk.nodes.c = { text: "That ledger is *private*. — Yes. Loans to members of Congress. It's how business is done. It's how it has always been done. The President simply chose to be shocked by it.", next: 'hub' };

D('biddle', {
  name: 'Nicholas Biddle', portrait: 'biddle',
  start: (S) => met(S, 'biddle') ? 'hub' : 'intro',
  brushOff: "I've no idea what that is, and I doubt you do.",
  nodes: {
    intro: {
      text: [
        "The magistrate sends a clerk. (He does not rise.) Well. I have been called *Czar Nicholas* by the President of the United States. I can bear a clerk.",
        "You'll want to know whether the Bank hired a madman. Ask it properly and I'll answer properly.",
      ], interviewed: 'biddle', next: 'hub',
    },
    hub: {
      text: "(He folds his hands.)",
      choices: [
        { label: 'Why does the President hate the Bank?', next: 'why' },
        { label: 'Tell me about the veto.', next: 'veto' },
        { label: 'Did you punish the country?', next: 'punish' },
        { label: 'Richard Lawrence wrote to you.', next: 'lawrence', cond: (S) => S.flags.pm_lawrence || Game.has('address_card') },
        { label: 'Where were you on the 30th?', next: 'alibi' },
      ],
    },
    why: {
      text: [
        "Because he doesn't understand it. The [Bank] holds the nation's money, steadies its currency, and lends where lending is wise. He sees a monster. He sees a monster in most things he cannot command.",
        "He is a soldier. A soldier believes an institution is a man with a plan. It is not. It is a *ledger*.",
      ], next: 'hub',
    },
    veto: {
      text: [
        "1832. Clay and I brought the [charter] to Congress early. It passed. Jackson [vetoed|veto] it — and told the people the Bank made the rich richer and the poor poorer. The people believed him.",
        "The people are not economists. Neither, it turns out, is he. But he counts better.",
      ], next: 'hub',
    },
    punish: {
      text: [
        "I contracted credit. Loans were called in. Yes, it hurt; it was *meant* to show what a nation without a bank feels like. You call it punishment. I called it a lesson.",
        "(A pause.) It cost me the argument. Every ruined farmer blamed me, not him. I know that now. I did not know it then.",
      ], set: { biddle_punish: true }, next: 'hub',
    },
    lawrence: {
      text: [
        "Hundreds of lunatics write to me. He believed the Bank owed him a kingdom's ransom. I answered once, out of pity, to say we did not. If pity is conspiracy, arrest Henry Clay — he is kinder than I am, and it has done him no good either.",
      ], next: 'hub',
    },
    alibi: {
      text: "In this office, with my clerk and a very large ledger. I do not attend funerals for Jacksonian congressmen. I would be asked to leave, and I would deserve it.",
      next: 'hub',
    },
    ev_card: { text: "My address. In a madman's pocket. He wrote every week. What would you have me do — refuse the mail? Half the city has that card; it's printed on our notes.", next: 'hub' },
    ev_note: { text: "(He examines it closely.) Genuine. Washington, this month. Someone gave a house painter new money. It was not the Bank — the Bank does not *give*. Ask my clerk who drew it, if you can make him talk. I never can.", next: 'hub' },
    ev_check: {
      text: [
        "(Coldly.) Where did you — . Very well. Loans. To members of Congress. Legal, ordinary, and no affair of a magistrate's clerk. Senators borrow money. It buys nothing but interest.",
        "The President said I bought Congress. If I had, clerk, the veto would have been overturned. It was not. Draw your own conclusion about what five million dollars buys in this city.",
      ], next: 'hub',
    },
    ev_cartoon: { text: "Crude. Accurate. The man has vetoed twelve bills, ignored the Supreme Court, and fired his own Treasury Secretary for obeying the law. Kings have done less and lost their heads for it.", next: 'hub' },
  },
  onEvidence: { address_card: 'ev_card', bank_note: 'ev_note', check: 'ev_check', cartoon: 'ev_cartoon' },
});

// ===========================================================================
// THE PRINT SHOP
// ===========================================================================
D('printer', {
  name: 'The Printer', portrait: null,
  start: (S) => met(S, 'printer') ? 'hub' : 'intro',
  nodes: {
    intro: { text: "Print's cheap. Ink's cheap. Opinions are free. Which do you want, clerk?", next: 'hub' },
    hub: {
      text: "Well?",
      choices: [
        { label: 'Who writes for you?', next: 'who' },
        { label: 'Is it true — twelve vetoes?', next: 'veto' },
        { label: 'Whose side is the press on?', next: 'side' },
      ],
    },
    who: {
      text: "Anyone with a grievance and a dollar. This week: a fired postal clerk with a fine turn of phrase. Gregory. Wrote the words under *King Andrew*. It sells. Anger always sells.",
      set: { printer_gregory: true }, next: 'hub',
    },
    veto: {
      text: [
        "Twelve. Every president before him, together, managed nine. He [vetoed|veto] the Bank, the roads, the canals — anything Clay liked. Then he fired the Treasury Secretary who wouldn't move the deposits. The Senate censured him. He didn't care.",
        "That's the thing about the General. He decided long ago that the *people* elected him, not Congress, and the people would forgive him anything. So far, they have.",
      ], next: 'hub',
    },
    side: {
      text: "Whoever's paying. I printed for Jackson in '28. I print against him now. The paper doesn't care and neither, honestly, do I. But a man who reads only one paper thinks he knows something.",
      next: 'hub',
    },
  },
  onEvidence: { cartoon: 'c', poster: 'p' },
});
DIALOGUE.printer.nodes.c = { text: "Mine. Gregory's words, my press. Free country — or it was. Though I'll say this: he writes like a man who wants the President *gone*. Whether that means out of office or out of the world, I couldn't tell you.", next: 'hub' };
DIALOGUE.printer.nodes.p = { text: "1828 — I printed *that* too. For Jackson. Times change, customers change. The ink's the same.", next: 'hub' };

// ===========================================================================
// THE BOARDING HOUSE — John C. Calhoun
// ===========================================================================
D('calhoun', {
  name: 'John C. Calhoun', portrait: 'calhoun',
  start: (S) => met(S, 'calhoun') ? 'hub' : 'intro',
  brushOff: "Irrelevant.",
  nodes: {
    intro: {
      text: [
        "You are the magistrate's clerk. I will answer your questions once, precisely. Do not ask twice, and do not ask what you already know.",
      ], interviewed: 'calhoun', next: 'hub',
    },
    hub: {
      text: "(He waits, perfectly still.)",
      choices: [
        { label: 'Why did you resign the Vice Presidency?', next: 'resign' },
        { label: 'Would he really have hanged you?', next: 'hang', cond: (S) => S.flags.cal_resign },
        { label: "What is the South's grievance?", next: 'south' },
        { label: 'Tell me about the funeral.', next: 'funeral' },
      ],
    },
    resign: {
      text: [
        "The [Tariff of 1828] taxed the South to enrich the North. We sell cotton abroad and buy manufactured goods; a tariff makes everything we buy dearer and helps only Northern factories. Jackson supported it.",
        "I argued that a state may refuse to enforce an unconstitutional law — [nullification]. Jackson called that treason and said he would hang me. A Vice President cannot serve a man who has threatened to hang him. So I resigned. No one had ever done so.",
      ], set: { cal_resign: true }, next: 'hub',
    },
    hang: {
      text: [
        "He raised an army. South Carolina raised its own. Then Clay — Clay, of all people — made a compromise: lower the tariff, slowly, over ten years. We stood down. He stood down.",
        "The principle stands. A state made this Union. A state may judge it.",
      ], next: 'hub',
    },
    south: {
      text: [
        "That a majority in the North can vote to take from us and call it law. Today it is tariffs. Tomorrow it may be our property. A Union that can do that is not a Union. It is a conquest.",
        "(He looks at you steadily.) You are thinking that by *property* I mean slaves. I do. I will not pretend otherwise for a clerk, or for a President.",
      ], next: 'hub',
    },
    funeral: {
      text: [
        "Warren Davis was a South Carolinian and my friend. I stood on the steps. So did the President — a courtesy I noted. When the pistol flashed I dropped my pipe. I expect you have it.",
        "You will observe that I am the only man in this city who has *told* you where he stood.",
      ], set: { cal_funeral: true }, next: 'hub',
    },
    ev_pipe: { text: "Mine. The palmetto is my state's tree. I dropped it at a funeral, beside the President, because I was standing beside the President — as were fifty others who have not told you so.", next: 'hub' },
    ev_res: {
      text: [
        "Jefferson and Madison, 1798. They wrote that the states made the Union and may judge its acts. I underlined it because it is true. That is not a plot. It is a principle.",
        "Kings fear principles more than pistols. Ask this one.",
      ], next: 'hub',
    },
    ev_cartoon: { text: "Crude. But not wrong.", next: 'hub' },
    ev_note: { text: "I have no interest in the Bank and less in its paper. Ask the Kentuckian. He has a great deal of interest in it — in every sense.", next: 'hub' },
  },
  onEvidence: { pipe: 'ev_pipe', resolutions: 'ev_res', cartoon: 'ev_cartoon', bank_note: 'ev_note', check: 'ev_note' },
});

D('landlady', {
  name: 'Mrs. Hill', portrait: null,
  start: (S) => met(S, 'landlady') ? 'hub' : 'intro',
  nodes: {
    intro: { text: "Mr. Calhoun? Pays on time, reads all night, and hasn't smiled since 1828. I've had worse boarders. Louder ones, certainly.", next: 'hub' },
    hub: {
      text: "Yes, dear?",
      choices: [
        { label: 'Was he here on the 30th?', next: 'alibi' },
        { label: 'Does he have visitors?', next: 'visitors' },
      ],
    },
    alibi: { text: "Out before breakfast for the funeral. Back at noon, grey as paper, without his pipe. Sat in that chair till dark and didn't touch his dinner. I've never seen him not touch his dinner.", next: 'hub' },
    visitors: { text: "South Carolina gentlemen, mostly. Very serious. They talk about tariffs the way other men talk about horses. Once Mr. Clay came — they shook hands like two men testing a bridge.", next: 'hub' },
  },
});

// ===========================================================================
// THE INDIAN QUEEN — John Ross
// ===========================================================================
D('ross', {
  name: 'John Ross', portrait: 'ross',
  start: (S) => met(S, 'ross') ? 'hub' : 'intro',
  brushOff: "That is not mine. You know that it is not.",
  nodes: {
    intro: {
      text: [
        "The magistrate's clerk. (He rises, and offers a chair.) I have met the President twice in his own house. I can meet his clerk in mine. What do you wish to know?",
      ], interviewed: 'ross', next: 'hub',
    },
    hub: {
      text: "(He listens with complete attention.)",
      choices: [
        { label: 'Why are you in Washington?', next: 'why' },
        { label: 'What about the Supreme Court?', next: 'court' },
        { label: 'Did you want him dead?', next: 'dead' },
        { label: 'Where were you on the 30th?', next: 'alibi' },
      ],
    },
    why: {
      text: [
        "To ask Congress to honor its own treaties. The Cherokee Nation has a written constitution, schools, a newspaper in our own alphabet, and the oldest claim to our land of anyone in this city.",
        "The [Indian Removal Act] says that means nothing — that we may be moved west for our own good. I say it means everything. I have said so for six years. I will say it until I cannot.",
      ], next: 'hub',
    },
    court: {
      text: [
        "We sued. We *won* — [Worcester v. Georgia]. The Supreme Court ruled that Georgia had no power over our land. And the President did nothing. He is said to have remarked: John Marshall has made his decision; now let him enforce it.",
        "A ruling no one enforces is a piece of paper. He taught me that. It is the only thing he has taught me that I believe.",
      ], set: { ross_court: true }, next: 'hub',
    },
    dead: {
      text: [
        "(A long pause.) I want my people on their land. His death would not give it to them. It would give me a gallows and Georgia an excuse, and the next President would sign the same paper with a steadier hand.",
        "Do not mistake grief for stupidity, clerk. I have had six years to consider what would help us. Murder is not on the list.",
      ], next: 'hub',
    },
    alibi: {
      text: [
        "Here, with the delegation, drafting a memorial to the Senate. Eleven witnesses. (A very slight smile.) If a Cherokee witness counts in your court. I am told that in Georgia it does not.",
      ], set: { ross_alibi: true }, next: 'hub',
    },
    ev_cartoon: { text: "I have been called worse by kinder men. He is not a king. A king would be bound by *something*.", next: 'hub' },
    ev_hat: { text: "Look at the size of it. Then look at me. (He is a small man.) You are welcome to try it on my head if it will satisfy the magistrate.", next: 'hub' },
    ev_res: { text: "Mr. Calhoun's states' rights. Georgia used the same argument to take our land. It is a fine principle. It has never once been used in our favor.", next: 'hub' },
  },
  onEvidence: { cartoon: 'ev_cartoon', hat: 'ev_hat', resolutions: 'ev_res' },
});

D('delegate', {
  name: 'Cherokee Delegate', portrait: null,
  start: 'a',
  nodes: {
    a: { text: "The Chief has not left this hotel in three days. Eleven of us will swear to it. Write that down — and then write down that no one in this city will believe you.", next: 'b' },
    b: { text: "We are here because we are *civilized*, they said. Learn to farm, build churches, write laws. We did all of it. It turns out the land was the point all along.", next: 'END', leave: false },
  },
});

// ===========================================================================
// THE PRESIDENT'S HOUSE — Andrew Jackson
// ===========================================================================
D('jackson', {
  name: 'President Jackson', portrait: 'jackson',
  start: (S) => met(S, 'jackson') ? 'hub' : 'intro',
  brushOff: "What in blazes is that? Never mind. Get on.",
  nodes: {
    intro: {
      text: [
        "Come in, come in! You're the magistrate's boy? Good. Sit. No — stand; I'll stand. They tried to kill me, you know. Two pistols. Both misfired.",
        "*Providence*, the papers say. Damn Providence. It was damp powder and a steady hand with a cane. Now — what have you found? Tell me it's the Bank.",
      ], next: 'hub',
    },
    hub: {
      text: "(He paces. He has not stopped pacing since you came in.)",
      choices: [
        { label: 'Who do you think did it?', next: 'who' },
        { label: 'Do you have proof?', next: 'proof', cond: (S) => S.flags.jack_who },
        { label: 'Why do you fight the Bank?', next: 'bank' },
        { label: 'What about the Cherokee?', next: 'cherokee' },
        { label: 'Why so many vetoes?', next: 'veto' },
        { label: 'Why did you fire the clerks?', next: 'spoils' },
      ],
    },
    who: {
      text: [
        "Biddle's Bank! And Poindexter — Senator Poindexter, the Mississippi snake; the man was seen with Lawrence, I'm told. The Bank has millions and no honor. Clay's tongue, Biddle's gold, a madman's hand. Write that down.",
      ], set: { jack_who: true }, next: 'hub',
    },
    proof: {
      text: [
        "Proof! I've been *shot at*, sir. What more proof do you want? ...",
        "(Quieter. He stops pacing for the first time.) No. I don't. I have a feeling in my gut, and forty years of enemies. That's what you're for.",
      ], next: 'hub',
    },
    bank: {
      text: [
        "Because it's a *monster*. It takes the people's money and lends it to congressmen and calls that liberty. Rich men in Philadelphia deciding what a farmer in Tennessee can borrow. I [vetoed|veto] its charter. I pulled the deposits.",
        "I'll kill it if it kills me. (A short laugh.) It nearly did.",
      ], next: 'hub',
    },
    cherokee: {
      text: [
        "John Marshall made his ruling. Let him enforce it. I've moved forty thousand Indians west and I'll move the rest — it's for their own good. They can't live among white men; Georgia would have destroyed them by inches.",
        "That's what I believe, and I'll not pretend otherwise for a clerk. Ross is an honest man. He's also wrong, and he's going west with the rest.",
      ], next: 'hub',
    },
    veto: {
      text: [
        "Because Congress passes trash and expects me to sign it. The Constitution gives me the [veto]; I use it. They call me King Andrew. *Kings inherit.* I was elected — twice — by more men than ever voted in this country.",
        "Every farmer, every workman, every [common man] who never had a vote before — they have one now, and they gave it to me. I answer to them. Not to Henry Clay.",
      ], next: 'hub',
    },
    spoils: {
      text: [
        "[Rotation in office]. A clerk isn't a nobleman; the job isn't his by right. Six hundred men out of ten thousand, and the papers made it a slaughter. Loyalty isn't a crime, sir. It's the only thing that holds a government together.",
        "Gregory, was it? Called me a king. Well. A king would have had him whipped. I only had him replaced.",
      ], next: 'hub',
    },
    ev_note: { text: "THERE! The Bank's money in the assassin's pocket! Take that to the magistrate this minute! ... What do you mean, *who drew it*? Does it matter? It's Biddle's paper!", next: 'hub' },
    ev_card: { text: "Chestnut Street! Biddle's own door! Do you need me to draw you a map, boy?", next: 'hub' },
    ev_check: { text: "Five million to buy Congress. I said so in '32 and they called me a madman. Well — now there are two of us in the jail, and one of them's the wrong one.", next: 'hub' },
    ev_pipe: { text: "Calhoun's. He was on the steps; I saw him. He'd have hanged in '33 if I'd had my way. (A pause.) But a man doesn't shoot at a funeral. Not even Calhoun. Not even at me.", next: 'hub' },
    ev_hat: { text: "Not the painter's? Then somebody else's. Somebody close. Find him. That's the first useful thing anyone's brought me.", next: 'hub' },
    ev_cartoon: { text: "(He laughs — then doesn't.) King Andrew. Gregory's words. I gave that man's job to a better one. A *loyal* one. If that's tyranny then every president's a tyrant, and the country can go hang.", next: 'hub' },
    ev_res: { text: "Nullification. Treason with a bookmark. I told them I'd hang the first man who tried it from the first tree I found, and I meant it.", next: 'hub' },
    ev_clay: { text: "Clay's table. Cards and whiskey. Of course. The man's been drunk and gambling since 1811 and they call *him* the statesman.", next: 'hub' },
  },
  onEvidence: { bank_note: 'ev_note', address_card: 'ev_card', check: 'ev_check', pipe: 'ev_pipe', hat: 'ev_hat', cartoon: 'ev_cartoon', resolutions: 'ev_res', playing_cards: 'ev_clay', whiskey: 'ev_clay' },
});

D('servant', {
  name: 'Household Servant', portrait: null,
  start: 'a',
  nodes: {
    a: { text: "The General doesn't sleep. Walks the hall at night with his cane. Since the steps, he walks faster.", next: 'b' },
    b: { text: "(He looks at you a moment.) You'll ask if I'm afraid for him. I've been afraid for twenty years, sir. Not for him.", next: 'END', leave: false },
  },
});

D('doorman', {
  name: 'Doorman', portrait: null,
  start: 'a',
  nodes: {
    a: { text: "The General sees anyone. Always has — farmers, beggars, senators, in that order of welcome. Walk in. Mind the cane.", next: 'END', leave: false },
  },
});

// ===========================================================================
// THE STREET
// ===========================================================================
D('newsboy', {
  name: 'Newsboy', portrait: null,
  start: (S) => met(S, 'newsboy') ? 'hub' : 'intro',
  nodes: {
    intro: { text: "*Extra!* President attacked at the Capitol! Assassin taken! Two cents! (He looks at you.) You're the clerk. Free, then, but only the one.", next: 'hub' },
    hub: {
      text: "Which paper?",
      choices: [
        { label: "What does Jackson's paper say?", next: 'globe' },
        { label: 'What does the Whig paper say?', next: 'whig' },
      ],
    },
    globe: { text: "The *Globe* says the Bank did it — Biddle's gold and Clay's speeches drove a poor man mad. Says the General is the people's champion and his enemies are cowards.", next: 'hub' },
    whig: { text: "The *Intelligencer* says the General's own tyranny did it — a man who ignores courts and fires clerks and vetoes Congress can't be surprised when the country goes mad. Same facts. Different paper.", next: 'hub' },
  },
});

D('street_gentleman', {
  name: 'A Gentleman', portrait: null,
  start: 'a',
  nodes: {
    a: { text: "A dreadful business. Dreadful. Though one can't say the man wasn't provoked — the whole country has been provoked, these six years. (He touches his hat.) I say that as a friend of the administration, you understand.", next: 'END', leave: false },
  },
});

D('street_lady', {
  name: 'A Lady', portrait: null,
  start: 'a',
  nodes: {
    a: { text: "My husband says the Bank is ruined and the Cherokee are doomed and the South will leave the Union — and he'll vote for Jackson again anyway. Because he's *ours*, he says. He's one of us.", next: 'b' },
    b: { text: "I don't know what that means, exactly. But I know a great many men who feel it.", next: 'END', leave: false },
  },
});

D('coachman', {
  name: 'Coachman', portrait: null,
  start: 'a',
  nodes: {
    a: { text: "Drove Senator Clay to the funeral. Drove him back. Talked the whole way — about roads, mostly. Never saw a man care so much about roads.", next: 'b' },
    b: { text: "He gave me this hat at Christmas. From the shop on the lane. Fine hat. Half the gentlemen in town have one like it.", next: 'END', leave: false },
  },
});

D('labourer', {
  name: 'A Carter', portrait: null,
  start: 'a',
  nodes: {
    a: { text: "Bank called in my loan last spring. Lost the cart. Jackson says that's Biddle's doing; Biddle says it's Jackson's. I say I lost my cart.", next: 'b' },
    b: { text: "I voted for the General. I'd vote for him again. At least he's angry at the same people I am.", next: 'END', leave: false },
  },
});
