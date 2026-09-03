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

**Controls:** arrow keys / WASD to walk · Space or Enter to talk and examine · Tab for the evidence tray.
Progress autosaves to the browser (`localStorage`), so a student can reload and continue.

## Structure of a play session (~60 minutes)

1. **Opening** — the attack on the East Portico, in text over the Capitol.
2. **Briefing** — the magistrate's five dossiers. Students must open all five before the game continues.
3. **Investigation** — the street, ten interiors, the crime scene. Evidence is picked up by examining
   objects; conversations open new lines when the player *shows* someone an item.
4. **The warrant** — the magistrate will not accept an accusation until all five suspects have been
   interviewed and at least six pieces of evidence are in hand. This guarantees coverage of every topic.
5. **The trial** — Francis Scott Key prosecutes; the student supplies three pieces of evidence; defense
   counsel rebuts anything that does not actually connect to the accused.
6. **Epilogue** — what really happened, and a prompt to compare accusations with classmates.

John Ross deliberately has *no* physical evidence against him. Accusing him is possible, and the trial
makes the lesson explicit: motive is not evidence.

Nothing is typed into the game. Students keep a physical worksheet of suspects, evidence and motives.

## Layout

```
index.html          page shell
src/engine.js       canvas renderer, tilemap, collision, entities, camera
src/ui.js           dialogue runner, evidence tray, cards, HUD
src/scenes.js       title, opening, briefing, trial, epilogue, help
src/game.js         state, saving, main loop, accusation flow
data/rooms.js       every map (street + interiors), in tile coordinates
data/dialogue.js    every conversation
data/evidence.js    the ten evidence items, trial links, glossary
data/suspects.js    the five dossiers
assets/             generated PNGs (do not edit by hand)
tools/art/          Pillow scripts that generate all the art:  ./tools/art/build.sh
tools/shoot.js      Playwright smoke test that screenshots every scene
```

All art is procedural + hand-authored pixel grids in `tools/art/`. Regenerate with `tools/art/build.sh`
(needs Python 3 and Pillow).

## Historical notes

Lawrence, the misfires, Jackson's cane, Warren Davis's funeral, Francis Scott Key as prosecutor, the
five-minute insanity verdict, Jackson's accusation of Senator Poindexter and the Senate's finding of nothing
are all historical. John Gregory is a fictional stand-in for the hundreds of clerks removed under the spoils
system. The evidence items and their placement are invented for the game.
