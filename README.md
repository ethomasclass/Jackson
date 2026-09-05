# The Capitol Steps — an 1835 investigation

A browser-based, top-down detective game for a 9th-grade U.S. History unit on Andrew Jackson's presidency.
Students play a clerk to the Washington City magistrate on the morning after Richard Lawrence's attempt on
Jackson's life (January 30, 1835). They roam 1830s Washington, interview five suspects and a dozen other
characters, collect the ten pieces of evidence from the classroom card deck, and finally accuse someone
before a jury. There is no single right answer: the trial scores the *evidence chain*, not the name.

The content of the presidency — the spoils system, the Bank War, the tariff and nullification, the Corrupt
Bargain, Indian Removal, the veto and "King Andrew" — is delivered through the characters themselves.

## Running it

It is a static site: no build step, no server-side code.

```sh
python3 -m http.server 8080      # then open http://localhost:8080
```

or push the repository to GitHub Pages. It targets classroom Chromebooks: a 640×360 pixel-art canvas,
integer-scaled to the window, with a DOM layer for text. Total assets are under 1 MB.

**Controls:** arrow keys / WASD to walk · Space or Enter to talk and examine · Tab for the evidence tray. On a
phone or tablet a D-pad and TALK button appear.
Progress autosaves to the browser (`localStorage`), so a student can reload and continue.

## Structure of a play session (a hard 45 minutes)

The game runs on a real clock. It opens at noon on January 30th and the in-game time (top of the screen)
reaches eight in the evening after 45 real minutes. The afternoon is split into three acts. Each act has
goals; when the goals are met *or* the act's deadline passes, Toby the newsboy fetches the student back to
the magistrate and the story moves on. Nothing a student does can stretch the session past 45 minutes.

| | Act | Ends by | Goals | Break |
|---|---|---|---|---|
| 0 | Opening & briefing | ~4 min | read the five dossiers | Act I title card, worksheet setup |
| I | *Who Wanted Him Dead?* | 14 min | search the Capitol steps; interview two suspects | Warren Davis's funeral procession crosses the Avenue; the suspects talk among themselves |
| II | *The Case That Fell Apart* | 27 min | hear both witnesses; find two holes in their story | a crowd outside the Bank; Mr. Thorne collects the clerk; the magistrate demands a **preliminary name** for the President's desk |
| III | *Name Someone Anyway* | 37 min | all five suspects; six pieces of evidence; the warrant | the paper has printed the name; the person named reacts; at 37 minutes the magistrate forces the accusation |
| — | Trial & epilogue | 45 min | present three pieces of evidence | compare notes |

Act II is the historical reversal: two house painters, Foy and Stewart, swear they saw Lawrence at Senator
Poindexter's house, exactly as happened in 1835. The story has five holes (they disagree on the day; Foy has
a brand-new government job; Stewart was drunk that night; the Senator has an alibi; Lawrence has never
heard the name). Students need two. Whatever they find, the magistrate then forces a name onto paper, so
that Act III opens with the cost of a wrong accusation.

Recurring characters carry the pressure: **Toby**, a newsboy who follows the player and comments (turn
around and talk to him for hints); **Mr. Thorne** of the party Committee, who politely reminds the clerk
that their job is a political appointment; and **Richard Lawrence**, who is a king in Act I, a lucid
house painter in Act II, and does not remember the player in Act III.

At each act break the game shows a card of things to write on the physical worksheet.

Teacher options: `?minutes=40` scales every deadline (5 to 180). `?fast=4` runs the clock at four real
seconds per story minute, for previewing the whole arc in about six minutes.

John Ross deliberately has *no* physical evidence against him. Accusing him is possible, and the trial
makes the lesson explicit: motive is not evidence.

Nothing is typed into the game. Students keep a physical worksheet of suspects, evidence and motives.

## Layout

```
index.html          page shell
src/engine.js       canvas renderer, tilemap, collision, entities, camera
src/ui.js           dialogue runner, evidence tray, cards, HUD
src/scenes.js       title, opening, briefing, act cards, trial, epilogue, help
src/story.js        the clock, acts, act breaks and set pieces, Toby the follower, cutscene tools
src/game.js         state, saving, main loop, accusation flow
data/rooms.js       every map (street + interiors), in tile coordinates
data/story.js       act definitions, goals, worksheet prompts, Toby's remarks, set-piece scripts
data/dialogue.js    every conversation (9th-grade reading level; act-dependent branches)
data/evidence.js    the ten evidence items, trial links, glossary
data/suspects.js    the five dossiers
assets/             generated PNGs (do not edit by hand)
tools/art/          Pillow scripts that generate all the art:  ./tools/art/build.sh
tools/shoot.js      Playwright smoke test that screenshots every scene
tools/shoot_story.js  plays all three acts on the fast clock
```

All art is generated in `tools/art/` (Python 3, Pillow, numpy). Regenerate with `tools/art/build.sh`.

- `buildings.py` — 3/4-view facades drawn against period references (Gadsby's Tavern, the Brown's Indian
  Queen Hotel lithograph, Cooke's 1833 views of the Capitol, the 1846 daguerreotypes of the Capitol and the
  President's House).
- `tiles.py` — interiors: Windsor chairs, a Columbian hand press, a caged taproom bar, Franklin stove, Argand
  lamps, ingrain carpets, wainscot and sprigged wallpaper.
- `sprites.py` + `shade.py` — characters authored as material maps and auto-shaded (5-tone ramps, selective
  outlines, 1830s gigot sleeves), with blink and idle-breathing metadata.
- `photo_portrait.py` — dialogue portraits derived from public-domain paintings: Sully's Jackson, Neagle's
  Clay, Healy's Calhoun, Sully's Biddle, the McKenney & Hall lithograph of John Ross, Joseph Wood's Francis
  Scott Key; two anonymous period portraits stand in for the magistrate and John Gregory.
- `evidence.py` — evidence cards; the King Andrew cartoon and the 1828 Coffin Handbill are the real prints.
- `fetch_refs.py` — pulls the references from Wikimedia Commons with licence checks; attributions in
  `tools/art/ref/CREDITS.md`.

## Historical notes

Lawrence, the misfires, Jackson's cane, Warren Davis's funeral, Francis Scott Key as prosecutor, the
five-minute insanity verdict, Jackson's accusation of Senator Poindexter, the two witnesses (Foy and Stewart)
whose story collapsed, and the Senate's finding of nothing are all historical. Toby and Mr. Thorne are
invented. John Gregory is a fictional stand-in for the hundreds of clerks removed under the spoils
system. The evidence items and their placement are invented for the game.
