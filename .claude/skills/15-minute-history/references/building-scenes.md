# Building the scenes

Each chapter is a Remotion composition (`src/ch/ChNN.tsx`) timed off its narration's word timings. Read
`visual-style.md` for how things should look; this page is how to build them and check them.

## Contents
1. How a chapter is put together
2. Timing to words (anchors)
3. Component cheat sheet
4. Scene recipes
5. Images in scenes: placement math, masks, Gemini paintings
6. Sound
7. Checking your work (do all of these before showing the user)
8. Lessons from earlier videos

## 1. How a chapter is put together

```tsx
import words from '../../public/audio/ch06_to_the_victor.words.json';
const N = words as Narration;
export const CH06_FRAMES = chapterFrames(N, LEAD);          // logo lead + narration + tail + fade

const Body: React.FC = () => {
  const t = makeTimeline(N, 30);
  const at = t.at;
  const cuts: [number, React.ReactNode][] = [                 // hard cuts, 1 frame before the word
    [0, <Rotation t={t} />],
    [at('His critics') - 1, <Spoils t={t} />],
  ];
  const scene = useScene(cuts);
  return <>{scene}{/* sfx: whoosh per cut, stamp per title, marker per note */}</>;
};

export const Ch06 = () => (
  <ChapterShell n={N} audio="audio/ch06_to_the_victor.wav" lead={LEAD} music={[{src: 'music/good_feelings.mp3', volume: 0.13}]}>
    <Body />
  </ChapterShell>
);
```

- `ChapterShell` handles the logo-break lead-in, the fade up and down, the narration audio, music beds, the
  palette (`quiet` for heavy chapters), the 12 fps graphics step and the grain and vignette (`Finish`).
  Everything inside it runs in **narration time**: frame 0 is the first sample of the narration.
- Chapter 1 is different (cold open → `ChannelIntro` → title card); copy the template's `Ch01.tsx` shape.
- Register every chapter in `src/chapters.ts`; the composition id is `ChNN`.
- Each scene is a small component taking `t`. Keep scenes to 4–12 seconds; cut on the word that starts a new idea.

## 2. Timing to words (anchors)

- `t.at('phrase', nth = 1)` = the frame the phrase starts; `t.end(...)` = the frame it ends. Matching ignores case
  and punctuation, token by token: "here's" is `heres`, "15,000" is `15000`, "Translation:" is `translation`.
- **`t.at` takes the first occurrence.** A phrase that appears twice silently anchors to the wrong place. Run
  `python3 tools/anchors.py chNN_slug --src src/ch/ChNN.tsx` after wiring a chapter: it lists every anchor
  with every occurrence and time, and fails on any that are missing. Fix repeats with `nth`
  (`t.at('His supporters', 2)`) or a longer phrase.
- A missing phrase throws at render time ("Narration has no ..."). Edits to the script after voicing are the usual
  cause: re-run the anchor check after every re-voice.
- Before the real voice exists, `python3 tools/fake_voice.py --all` writes placeholder timings at the same pace so
  scenes can be built and previewed. Never send the user a render made from placeholder audio.
- Offsets in use: titles land **on** the word; notes start 2–4 frames before; cards pop 1–2 frames before;
  traces start 1–4 frames after the subject is named; cuts 1 frame before.
- Never use `Infinity` inside an `interpolate` input range; use `1e7` for "never".

## 3. Component cheat sheet

All from `src/kit/`. Positions are screen pixels on the 1920×1080 frame unless noted. `at` is a frame.

| Component | Use | Key props |
|---|---|---|
| `Highlight` (Kit) | Orange torn-tape title, Abril caps | `text x y size(96) at seed rot(-2) after` |
| `Note` (Kit) | Handwritten teal aside, writes on | `text x y size(46) rot(-4) color at dur out` |
| `Arrow` (Kit) | Bowed hand-drawn arrow | `x1 y1 x2 y2 bow(40) at` |
| `Loop` (Kit) | Hand-drawn circle around something | `cx cy rx ry at seed tilt` |
| `Tag` (Kit) | Source credit, mono caps, bottom-left | `text` (put one on every image) |
| `Picture` + `Tint` + `Traced` (Kit) | B&W image, coral subject, teal outline | `place size mask paths` |
| `Photo` (shell) | Full-bleed image with slow push | `src size fx fy z0 z1 a b mask tint traceAt children(place)` |
| `CropCard` (shell) | Image on a cream card, cropped window | `src size x y w h fx fy scale rot at mask tint children(S)` |
| `PhotoCard` / `Card` | Whole image on a card | `src x y w h rot at` |
| `Definition` (shell) | Vocab bar: term · definition | `term def at x y w` |
| `Quote` (shell) | Primary-source quote, Playfair | `text at x y w size who` |
| `Stamp` (shell) | Big number or word stamping in | `text x y at size color` |
| `DrawnCrown` (shell) | Hand-drawn crown | `x0 x1 y h at` |
| `DarkPaper` (common) | The desk background | |
| `MapScene`, `Pin`, `Route`, `Region`, `PLACES` (map) | 1836 map, camera, pins, routes | `keys: Cam[]`, `children(S, cam)` |
| `Tiles`, `STATES` (tiles) | State tile grid for elections | `state(code) => {fill,label,at}` |
| `Person` (figures) | Drawn voter or crowd figure | `x y h at dashed hat dress` |
| `Sfx` (common) | One sound effect at a frame | `at src volume` |
| `hasFile(path)` (shell) | True once an image exists in public/ | use to fall back gracefully |

Colors come from the palette context: `usePal().mark` (teal), `.subject` (coral), `boxOf(pal)` (orange). White
`#ffffff` notes are neutral asides; coral notes are punchlines; orange notes are disputed claims.

## 4. Scene recipes

- **Full-bleed archival image**: `Photo` with a mask on the subject, title top-left (x 100–140, y 90–120), notes
  on the empty side, `Tag` at the bottom-left. Push 1.02 → 1.1 across the scene.
- **Subject left, notes right**: `CropCard` at x 140–220 (about 520×700), titles and notes stacked at x 860+.
- **Desk of cards**: `DarkPaper`, 2–3 cards across the top two-thirds, alternating rotation ±2–4°, title and notes
  along the bottom.
- **Map**: `MapScene` with 2–3 camera keys (log-space zoom), `Pin` + `Note` label per place as it is spoken,
  `Route` for journeys, `Region` for territory. Dim 0.15 when the map is the subject, 0.3–0.5 behind text.
- **Vocab beat**: `Highlight` on the term, `Definition` 8–10 frames later directly under it.
- **Quote beat**: `Quote` on the desk or over a dimmed image (`brightness(0.45–0.55)`), attribution in `who`.
- **Two views**: a thin cream divider at x 958–962, mono caps headers (teal left, coral right), a title or note
  per side. Keep each side's text inside its half (a size-110 title is about 75 px per character).
- **Counting graphic**: `Stamp` numbers, rows of small marks or stamps (12 vetoes vs 10), a note with the takeaway.
- **Multi-beat explainer** (e.g. "who gets to vote"): 2–3 scenes reusing the same figures or tiles so change is
  visible; one number per beat.
- **Ending split**: the same portrait, teal half and coral half, a label each. The thumbnail can reuse it.

## 5. Images in scenes

- **Always read an image's real pixel size** before placing it (`python3 -c "from PIL import Image;
  print(Image.open('public/img/x.jpg').size)"`) and pass it as `size`. AI images in particular don't come back
  at the ratio you asked for (*King Andrew*'s "16:9" Gemini paintings were 1200×896). One constant per family:
  `const GEN: [number, number] = [1200, 896];`.
- `fill(size, fx, fy, zoom)` gives a full-bleed placement centred on source pixel (fx, fy). `onScreen(place)` or
  `CropCard`'s `S(sx, sy)` map source pixels to screen for overlays (loops, crowns, arrows onto a face).
- **Masks** come from `tools/mask.py` (see `images-and-masks.md`); add each to `src/masks.ts` and pass
  `mask={MASKS.name}`. `tint={null}` keeps the trace without the coral.
- **The tint must not sit inside a wrapper with `clip-path`**: the clip isolates the `color` blend and the tint
  goes flat. Put the clip on each blended layer itself (see `SideTint` in `src/Thumbnail.tsx`).
- Gemini paintings live in `public/img/gen/`. Build the scene with `hasFile('img/gen/x.png') ? painting :
  fallback` so it renders before the user has made the image.

## 6. Sound

Per chapter, in `Body`: a whoosh on every cut after the first (0.28–0.35), a stamp on every `Highlight` (0.27–0.3),
the marker sound 2 frames before every `Note` (`WRITE`, 0.2), a tick on pins and card flips (0.45). Music beds go
in `ChapterShell`'s `music` at 0.13–0.17. Keep the lists of cue words next to the scenes so they stay in sync.

## 7. Checking your work

Do all of these before sending the user anything. Each one caught real problems on *King Andrew*.

1. **Typecheck:** `npx tsc --noEmit -p .`
2. **Anchors:** `python3 tools/anchors.py <stem> --src src/ch/ChNN.tsx` for each chapter you touched.
3. **Stills:** `node tools/stills.mjs ChNN out/stills 3 9.5 17 ...` (seconds), then
   `python3 tools/sheet.py out/sheet.jpg out/stills/ChNN_*.jpg` and look at the sheet. Pick seconds a little
   after each anchor so every write-on has finished. Look for: text over faces or other text, text running into a
   divider, arrows crossing words, titles on busy image areas, empty scenes, a tint gone flat.
4. **Text-edge probe:** `node tools/probe_text.mjs Ch01,Ch02,... 10 2>&1 | grep -v "PROBECOUNT\|emory"`.
   It renders every 10th frame and lists any text whose box crosses the frame edge. Fix every hit (shorter line,
   smaller size, move left, `whiteSpace: 'nowrap'` plus a width check). The user noticed right-edge cut-offs in a
   480p preview, so treat any hit as a bug.
5. **After rendering:** `python3 tools/frames_sheet.py out/ch/chNN.mp4 out/check.jpg 12 18.5 40` to look at the
   finished frames, especially every spot the probe flagged and every new graphic.

## 8. Lessons from earlier videos

- **Prefer clean drawn diagrams to literal props.** A three-legged stool for Clay's American System looked fussy
  and the user disliked it ("the whole table illustration isn't great"). It was replaced by three teal line-drawn
  index cards, one per policy, each knocked out with a coral X as Jackson kills it. Labels in nowrap at a size
  that fits the card.
- **Every image gets a source tag**, generated ones too ("Illustration · ...").
- **One subject in color per image.** If two people matter, use two scenes or trace the second without tint.
- **Cut, don't dissolve.** The only fades are the chapter fade up and down and the intro's end.
- **Heavy chapter = quiet chapter.** Fewer marks, longer holds, no jokes, slower voice, respectful images.
- **The bundle copies public/ into /tmp** (~500 MB for a full video) on every render; the tools delete theirs.
  If the disk fills, remove `/tmp/remotion-webpack-bundle-*` and `out/` scratch files.
