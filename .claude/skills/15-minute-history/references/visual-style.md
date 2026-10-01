# Visual style: the 15 Minute History "field-notebook documentary" look

**Canvas:** 1920 × 1080, 30 fps, built in Remotion/React · **Format:** ~15-minute explainer for adults and students

This guide was written from the code of *Fix Everything* and holds for *King Andrew*; every value matches the
template kit (`src/kit/Kit.tsx`, `src/kit/shell.tsx`, `src/kit/common.tsx`, `src/kit/map.tsx`, `tools/trace.py`).
Examples name scenes from those videos. **(derived)** marks advice that goes beyond the code.

## Contents
1. Brand summary (do / don't) · 2. Color palette (incl. 2.5 heavy chapters) · 3. Typography · 4. Components ·
5. Motion and timing · 6. Sound design · 7. Imagery rules · 8. Layout (compositions, thumbnails) ·
9. Channel identity (wordmark, title card) · 10. Prompt starter for outside design tools · 11. Chapter breaks

---

## 1. Brand summary

A researcher's desk at night. Black-and-white archival engravings, daguerreotypes and an 1836 wall map sit on dark, faintly ruled paper. One figure per image is picked out in warm coral and circled by a loose, hand-traced teal outline, as if someone went over the print with a marker. Titles are heavy Didone serif caps, stamped onto torn strips of orange highlighter tape. Lowercase handwritten teal notes and bowed arrows explain the picture. Photos land on the desk as cream-bordered cards at slight angles. Film grain and a soft vignette sit over everything. The camera glides smoothly, while every drawn mark moves at a choppy 12 fps, like stop-motion. The tone is curious, fast and a little wry, and it gets quieter and slower when the subject is suffering.

**Do**
- Start from a real archival image, shown in black and white with contrast boosted.
- Colour **one** subject per image in coral, and trace it in teal.
- Set titles in UPPERCASE Abril Fatface on a torn orange box, tilted about −2°.
- Write asides in lowercase Nanum Pen Script, teal, with a hard dark outline.
- Put a mono uppercase source tag on every image.
- Keep dark, warm, near-black backgrounds (desk paper or dimmed map).
- Animate marks on a stepped 12 fps. Move the camera smoothly.
- Cut hard, and sync every mark to a spoken word.

**Don't**
- Don't show full-colour photos or colour grades. The only colour is the palette, plus the occasional "colour creeping in" reveal.
- Don't colour more than one subject per image.
- Don't use teal or coral for a title box. Don't use orange for outlines.
- Don't use drop-shadowed sans-serif headlines, gradients, glows on type, or neon.
- Don't use dissolves or crossfades between scenes. Don't use smooth, tweened graphic motion.
- Don't use invented portraits or AI faces of real people.
- Don't clean up the hand-drawn wobble. Don't close every outline perfectly.
- Don't use the earlier rejected looks (yellow highlighter, Anton collage, Fraunces cinematic).

---

## 2. Colour palette

The chosen palette is `PALETTES.locked`: *"teal outlines, orange titles, coral subject"*. It is option **A** in the palette comparisons.

### 2.1 Signature colours

| Token | Hex | Role (one job each) |
|---|---|---|
| **mark** (teal) | `#2FE0C4` | Traced outlines, hand-drawn loops, handwritten notes, arrows, map routes, pins, pin labels, district outlines, ripples, timeline line. Also used for secondary title lines ("ALL AT ONCE,", "HISTORY", "America's Reform Era") and the term in definition bars. |
| **box** (orange) | `#FF9F1C` | Torn highlighter boxes behind titles, and "after" text that runs beyond a box. Also strike-through lines, the dashed "letters" route, the underline in the wordmark, card label tabs, KNOCK onomatopoeia, the "? ? ?" on the pamphlet. |
| **ink** | `#111111` | Type on the highlighter box, pin borders, outline shadow on handwriting, the background behind full-bleed photos. |
| **subject** (coral) | `#FF6F61` | The single figure in colour (tint), the clock's quarter wedge, the ember/spark, the end dot of a timeline and its year, the "✕" death marker, the core of map "fever" glows. |

**One job per colour:** teal draws and explains. Orange labels (titles). Coral is the story's subject. Ink is type-on-colour. The code sometimes breaks this on purpose for emphasis: a handwritten note in orange for a disputed claim ("he said: translated from golden plates", "Smith killed by a mob, 1844"), a coral punchline line ("...but not God"), and white notes for neutral asides and credits ("Puritan belief", "profile drawn from life, 1842"). Keep such exceptions rare.

### 2.2 Neutrals and backgrounds

| Name | Value | Where |
|---|---|---|
| Card cream | `#f4efe6` | Photo-card border. Also the "15" numeral, clock hand and hub, and the quote text. |
| Envelope paper | `#f3ead8` | Envelope icon on the map |
| Desk paper gradient | `radial-gradient(ellipse at 45% 40%, #2a2620 0%, #16140f 70%, #0d0c09 100%)` | `DarkPaper`, the desk behind cards and diagrams |
| Desk ruling | 1px lines of `rgba(255,255,255,0.35)` every **64px**, layer opacity **0.12** | Faint notebook lines on `DarkPaper` |
| Map scene base | `#15130f` | Behind every MapView scene |
| Map-test base | `#1a1814` | Cold-open map sequence |
| Deep black | `#0b0a08` / `#0d0c09` | Ember/spark scenes, channel intro base |
| Photo base | `#111111` (ink) / `#111` | Full-bleed image scenes, montage |
| White | `#fff` / `#ffffff` | Definition-bar text, neutral notes, the "1/7" counter |

### 2.3 Image and map treatments

| Treatment | Exact value |
|---|---|
| Archival picture, default B&W | `grayscale(1) contrast(1.2) brightness(0.97)` |
| B&W as used in scenes | `grayscale(1) contrast(1.25–1.45) brightness(0.95–1.02)`. Engravings run hottest (1.4–1.45). |
| Photo cards | default `grayscale(1) contrast(1.2)`; also `grayscale(1) contrast(1.15)`, or `sepia(0.3) contrast(1.1)` for printed documents |
| Dimmed background photo | `grayscale(1) contrast(1.25) brightness(0.55)`, or `grayscale(0.4) brightness(0.45)` behind a quote |
| Blurred fill (portrait on 16:9) | same image, `grayscale(1) blur(18–20px) brightness(0.4–0.45)`, behind a `contain`-fitted copy |
| **1836 map** | `grayscale(1) sepia(0.25) contrast(1.2) brightness(0.8 − dim)`, drop shadow `0 30px 80px rgba(0,0,0,0.8)` |
| Map `dim` values used | 0 (active map), 0.3 (behind cards), 0.35 (behind notes), 0.5 (title card), 0.55 (behind a big question) |
| Map vignette overlay | `radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(8,6,4,0.8) 100%)` |
| Extra map darkening | flat `rgba(8,6,4,0.35–0.45)` when text sits on the map |
| Title-card map overlay | `radial-gradient(ellipse at 50% 50%, rgba(8,6,4,0.2) 30%, rgba(8,6,4,0.85) 100%)` |
| Photo scene vignette | `radial-gradient(… transparent 30–50%, rgba(0,0,0,0.6–0.75) 100%)` |
| **Global vignette** (`Finish`) | `radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,V) 100%)`. **V = 0.3** in chapters, 0.45 in the channel intro, 0.55 default. |
| **Film grain** (`Finish`) | SVG `feTurbulence` fractalNoise, `baseFrequency 0.9`, `numOctaves 2`, desaturated. Layer **opacity 0.13**, `mix-blend-mode: overlay`. Re-seeded every 2 frames (40-seed cycle), so it flickers at 15 fps. |

### 2.4 Subject tint (the one figure in colour)

A mask of the subject is filled with the subject colour three times, stacked over the B&W picture:

| Layer | Blend mode | Opacity |
|---|---|---|
| 1 | `color` | 1.0 × strength |
| 2 | `multiply` | 0.3 × strength |
| 3 | `screen` | 0.28 × strength |

- **strength = 1** for figures inside an engraving (preacher, revival crowd).
- **strength = 0.5** for a cut-out portrait on the desk (Finney).
- The `color` blend keeps the engraving's line shading. The figure reads as a coral-tinted print, not a flat fill.
- **Colour reveal** (the alternative): the original colour image is revealed through `linear-gradient(90deg, transparent F%, #000 T%)`. F = 50–58% and T = 82–92% in use, so colour creeps in from the right edge. Optional `saturate(1.3–1.5)`.

### 2.5 Palette in heavy chapters

In heavy chapters (asylums, slavery, Indian Removal and the Trail of Tears) pass `quiet` to `ChapterShell`. That switches to `PALETTES.quiet`: teal lines only, titles on bone paper (`#EDE7DC`) instead of orange, no coral subject tint. No jokes and no punch-ins; the narration is voiced slower too (`HEAVY=` in `tools/voice_all.sh`). *King Andrew* chapter 10 (Indian Removal) is the reference: it kept highlighter titles only on the chapter card, then let the images and teal notes carry it. The final chapter comes back to normal colour, gently.

---

## 3. Typography

All sizes are CSS px at 1920 × 1080.

| Face | Weight | Role | Sizes in use | Case / spacing | Package / Google name | Never use for |
|---|---|---|---|---|---|---|
| **Abril Fatface** | 400 | Display: every highlighter title, wordmark, title card, map place labels, years, onomatopoeia, card tabs, diagram box labels | Highlight default **96**. Map labels 60–70. Scene titles 76–100. Punch words 110. Section cards 140. **FIX EVERYTHING 170**. "15" **250**, HISTORY **196**, MINUTE **128**. KNOCK 130. Subtitle 72. Timeline years 56. Diagram labels 64. Card tabs 34. | UPPERCASE for titles (title case only for the "America's Reform Era" subtitle). Letter-spacing **not specified** (default 0). Line-height **1.05**. | `@fontsource/abril-fatface` (latin-400) · Google: *Abril Fatface* | Body text, notes, captions, sources, lowercase sentences |
| **Playfair Display** | 900 | Quoted primary-source text set large (the First Amendment) | **64**, line-height 1.3, colour `#f4efe6`, shadow `0 3px 14px #000` | Sentence case with curly quotes. Spacing not specified. | `@fontsource/playfair-display` (latin-900) · Google: *Playfair Display* | Titles in boxes, labels, handwriting substitute |
| **Inter** | 600 | Definition bars, small factual captions (dates line under a name) | Definition bars **34–40**. Caption **24**. | Sentence case. Spacing not specified. | `@fontsource/inter` (latin-600) · Google: *Inter* | Headlines, anything that should feel hand-made |
| **Inter** | 800 | Graphic symbols on maps (the coral "✕") | **70** | n/a | `@fontsource/inter` (latin-800) | Titles |
| **IBM Plex Mono** | 400 | Source tags / credits, scene counters ("1/7") | Source tag **18**. Counter **34**. | Source tag: **UPPERCASE, letter-spacing 1px**. | `@fontsource/ibm-plex-mono` (latin-400) · Google: *IBM Plex Mono* | Titles, notes, anything the viewer must read quickly |
| **Nanum Pen Script** | 400 | All handwriting: notes, asides, questions, pin and town labels | Scaled **×1.55** in code. Written size → rendered: 42→65, 46→71 (default), 50→78, 56→87, 60→93, 64→99, 88→136. Pin labels 40→62. Town labels 34→53. | lowercase, conversational, with ellipses and parentheses ("(kind of a bummer)"). Spacing not specified. | `@fontsource/nanum-pen-script` (latin-400) · Google: *Nanum Pen Script* | Titles, source credits, long paragraphs |

`JF.hand` in code still points at Permanent Marker, and other hand fonts are loaded (Caveat Brush, Gochi Hand, Kalam, Rock Salt and others). These were candidates in a handwriting test. The locked handwriting is **Nanum Pen Script** (`HANDS.nanum`, "locked").

---

## 4. Components

Durations are in frames at 30 fps. Graphics step at 12 fps (see §5), so an 8-frame animation shows about 3–4 distinct drawings.

### 4.1 Torn highlighter box (`Highlight`)
| Property | Value |
|---|---|
| Type | Abril Fatface, UPPERCASE, `size` px (default 96), colour ink `#111111`, line-height 1.05, no wrap |
| Box colour | orange `#FF9F1C` |
| Padding | top **0.10 × size**, left/right **0.22 × size**, bottom **0.06 × size** |
| Torn edges | top and bottom edges each have 41 random points, pushed in by **0–9% of box height** (seeded). Left and right edges are straight. |
| Wipe-on | box scales X from 0 → 1 from the **left** over **8 frames**. Text fades in frames 3–7. |
| "after" text | extra words set **outside** the box in **box orange**, same font and size, gap **0.28 × size**, shadow `0 3px 14px rgba(0,0,0,0.55)`, fades in frames 6–10. Example: [SALVATION] IS A CHOICE. |
| Rotation | usually **−2°**, sometimes +2°, ±3° for variety in stacked lists |
| Sound | stamp |

### 4.2 Traced outline (`Traced`)
| Property | Value |
|---|---|
| Colour | teal `#2FE0C4` |
| Stroke | **5px** default (4–6 used), round caps and joins, no fill |
| Offset | outline sits outside the subject: the mask is dilated **7 source px**, blurred (σ = 4.2), simplified (2.5 px) and Chaikin-smoothed twice |
| Draw-on | **14 frames** default, **8–12** used, starting 1–4 frames after the cue |
| Open loop | `part` 0.86–0.93 leaves a small gap, like a hand-drawn loop that doesn't close |

### 4.3 Hand-drawn loop (`Loop`)
- An ellipse drawn as a 70-segment polyline plus **6 extra segments of overshoot** (about 31° past the start). Radius wobble ±1%, and the radius grows 3% over the stroke, so the end misses the start like a real pen.
- Stroke **5px** default, **6px** in chapters. Teal. Tilt −12° to +3°.
- Draw-on **12 frames** default, **8–12** used.
- On the map, `MapLoop` uses a 7px screen stroke and a 10-frame draw.

### 4.4 Arrow (`Arrow`)
- A quadratic curve with a sideways **bow of 40px** default (±18 to ±30 used). Stroke **5px**, teal, round cap.
- Shaft draws over **8 frames**. The head appears once the shaft is complete: an open chevron of two **26px** strokes at ±0.45 rad (about 26°).

### 4.5 Handwritten note (`Note`)
| Property | Value |
|---|---|
| Font | Nanum Pen Script, `size × 1.55` |
| Colour | teal by default. White for neutral asides and credits, orange for disputed claims, coral for a punchline. |
| Outline shadow | `0 0 2px #111, 0 0 4px #111, 2px 2px 0 #111, -2px 2px 0 #111, 2px -2px 0 #111, -2px -2px 0 #111, 0 3px 12px rgba(0,0,0,0.7)`: a hard 2px ink outline plus a soft drop |
| Write-on | revealed left → right with a clip-path over **10 frames** default (9–16 used; longer lines get longer) |
| Rotation | default **−4°**. Range in use **−6° to +8°**, mostly −2° to −5°. |
| Exit | hard off at `out` (no fade) |
| Sound | marker stroke, 2 frames before the note |

### 4.6 Photo card (`Card`)
| Property | Value |
|---|---|
| Border | cream `#f4efe6`, padding **max(8px, 2.5% of card width)** |
| Shadow | `0 18px 34px rgba(0,0,0,0.6)` |
| Widths used | 330–700px (typically 420–640) |
| Rotation | **−4° to +4°**, alternating signs across neighbours |
| Pop-on | scale **0.6 → 1.0 over 5 frames** with an overshoot ease; opacity reaches 1 halfway |
| Image | `object-fit: cover` (or `contain`), B&W filter as in §2.3 |
| Variants | *Wall of causes:* 420px card, 10px padding, shadow `0 16px 30px rgba(0,0,0,0.6)`, back-ease (1.6) pop over 5 frames, staggered **3 frames** apart, with an orange **label tab** (Abril 34px, ink, padding `2px 12px`, hanging off the bottom-left at left 14, bottom −24). *Intro flip cards:* 660px, 12px padding, shadow `0 20px 40px rgba(0,0,0,0.7)`, teal **5px outline offset 10px**, rotation ±7°, one every 6 frames. |

### 4.7 Source tag (`Tag`)
- IBM Plex Mono 400, **18px**, **UPPERCASE**, letter-spacing **1px**, `rgba(255,255,255,0.85)`, shadow `0 1px 6px rgba(0,0,0,0.9)`.
- Position: bottom-left **(x 44, y 1030)** by default. Moves to top-left **(44, 40)** when a title or notes occupy the bottom.
- Format: `Title, medium, date · Institution`. Separate multiple sources with ` · `. Mark generated images `Illustration · …` and later depictions "(later depiction)".

### 4.8 Map pins, routes and marks
| Element | Spec |
|---|---|
| Pin | teal circle, **24px** (chapters) or **26px** (map sequence), **4px `#111` border**. The map sequence adds a halo `0 0 0 4px rgba(47,224,196,0.35)`. Pop **0 → 1.35 → 1 over 6 frames**. Sound: tick. |
| Pin label | Nanum Pen Script 40 × 1.55 = 62px, teal, ink outline, offset about +16px, −46px from the pin |
| Town dot | 20px teal, 3px ink border, labels 34 × 1.55 = 53px, staggered 4 frames |
| Voyage route | teal, **≈8px** on screen, round joins, with a shadow copy `rgba(0,0,0,0.45)` ≈11.5px wide offset (4, 6). Draws on along the path (ease in-out quad). A 16px teal dot with ink stroke rides the leading end. |
| Journey legs | teal ≈6px lines, one leg per spoken place. The final leg is **dashed** (40/30 map px) for "off the map". |
| Letters / secondary route | orange dashed arc, 8px, with a small envelope icon (56×38, `#f3ead8`, 3px ink stroke) riding it |
| Region | teal polygon, 7–14px stroke, fill teal at alpha `0x22` (≈13%), drawn on over 14 frames |
| Ripple (news spreading) | 3–4 teal rings expanding from a point, stroke 10 → 4px, fading to 0 |
| Fever / wave glow | radial gradient: coral 0.9–0.95 → orange 0.35–0.4 at 55–60% → transparent. Blooms over 16–18 frames and pulses ±10–12%. |
| Death marker | "✕" Inter 800, 70px, coral |
| Map place title | Highlight 60–70px placed next to the pin |
| Map orientation | the East Coast is shown **rotated 36°** (so the coast runs diagonally). Other scenes use 0°. |

### 4.9 Grid overlay (`Grid`)
White `rgba(255,255,255,0.55)` 1.5px lines, **88px cells**, layer opacity **0.5**, masked by `radial-gradient(ellipse at 60% 45%, #000 30%, transparent 75%)` so it fades out. Used over the top-right quadrant of mockups (e.g. x 1180, y 0, 740 × 560). It does not appear in the built chapters.

### 4.10 Ember / spark motif (`Ember`)
- A glowing coral ember for "the spark" of reform, drawn with `mix-blend-mode: screen`.
- **Core:** a circle of radius **26 × size**, fill `#fff3e0`, glow `0 0 1.5r 0.6r` coral.
- **Halo:** a circle of radius 6r, `radial-gradient(coral @80% 0%, coral @33% 18%, rgba(255,159,28,0.18) 40%, transparent 70%)`.
- **Pulse** ±8%. Fades in over 10 frames.
- **Sparks:** 10 (+30 × flare) dots of 3–7px, `#ffd7b0` with a coral glow. Each rises **220px × size**, lives 40–90 frames and flickers.
- **Flare:** 0 → 1.4 over 20 frames on "catching fire".
- Sizes used: 0.7 (small, top-right accent) and 1.2 (hero, centred at 960, 470).

### 4.11 Vocabulary definition bar
- Appears **8–10 frames after** its Highlight title and fades in over 6 frames. Placed directly under the title (about x +20, y +160).
- Box `rgba(10,10,10,0.75–0.8)`, padding `16px 24–26px`, width **820–1200px**.
- Inter 600, **34–40px**, white, line-height 1.35.
- Format: **term in teal with syllable dots**, then ` · `, then a plain-language definition. Example: `pre·des·ti·na·tion · the belief that God decided, before you were born, whether you would be saved`.

### 4.12 Other recurring pieces
- **Strike-through:** an orange 8px quadratic stroke across a note, drawn over 5 frames. Used for rejected ideas ("guns?", "pray harder?").
- **Stamped word** (onomatopoeia): Abril 130 orange, ±6°, scale 1.4 → 0.95 → 1 over 6 frames, held 18 frames.
- **Timeline:** teal 6px line (x 200 → 1700 at y 170) with r14 dots. The start dot is teal and the end dot coral. Years in Abril 56: start in white, end in coral.
- **Diagram boxes:** hand-jittered rectangle (±5px corners), 6px teal stroke, fill `rgba(0,0,0,0.25)`, Abril 64 white label, drawn over 8 frames.
- **Scene counter:** "1/7" in IBM Plex Mono 34px white, top-right (right 60, top 50).

---

## 5. Motion and timing

| Rule | Value |
|---|---|
| Graphics step | `StepCtx = 2.5`: graphics sample time as `floor(frame / 2.5) × 2.5`, so **12 fps** marks over a 30 fps video |
| Smooth layer | camera moves, map zooms and photo push-ins use the real frame (smooth 30 fps) |
| Grain | re-seeds every 2 frames (15 fps) |
| Highlight wipe | 8 frames. Text fades in frames 3–7, "after" text frames 6–10. |
| Outline draw | 8–14 frames |
| Loop draw | 8–12 frames |
| Arrow draw | 8 frames, head at the end |
| Note write-on | 9–16 frames (default 10) |
| Card pop | 5 frames, 0.6 → 1 with overshoot. Staggered 3 frames in groups. |
| Pin pop / stamped type | 0 → 1.35 → 1 (pins) or 1.35–1.4 → 0.95 → 1 (type) over 6 frames |
| Camera easing | `Easing.inOut(Easing.cubic)`. Zoom scale is interpolated in **log space** so zooms feel even. |
| Push-ins | slow scale over a scene: 1.02 → 1.10, 1.04 → 1.16, 1.12 → 1.24, or 1.04 + 0.004 per frame in montages |
| Punch-ins | a hard cut to a 1.65–2.3× crop of a detail, still creeping +0.2% per frame. A **hard ×1.14 punch** on the climax word ("DEAD OR ALIVE"). |
| Cuts | **hard cuts only**, 1–2 frames before the cue word, each with a whoosh. No dissolves. The only fade is the channel intro's last 8 frames. |
| Exits | marks switch off instantly at their `out` frame |
| Sync | narration has word-level timings (ElevenLabs forced alignment). A cue is "the frame word X starts" (optionally the nth occurrence). Titles land **on** the word. Notes start **2–4 frames before** the word. Cards pop **1–2 frames before**. Outlines start 1–4 frames after the subject is named. |
| Wordmark push | the intro scales 1 → 1.04 from the "15" to the end |

---

## 6. Sound design

The template ships every file below except `knock.wav` and `sea_ambience.wav`, which were made for single scenes in *Fix Everything* (make new ones with ElevenLabs sound generation when a scene needs them).

| Event | File | Volume | Timing |
|---|---|---|---|
| Handwritten note | `sfx/marker_tick.wav` (the `WRITE` setting) | **0.2** | 2 frames before the note's word |
| Highlighter title | `sfx/stamp.wav` | 0.26–0.45 (0.26–0.28 in chapters) | on the word |
| Pin / card flip / montage beat / clock tick | `sfx/tick.wav` | 0.45–0.5 | on the pop |
| Scene cut | `sfx/whoosh.wav` | 0.28–0.3 (Ch02–03), 0.4–0.5 (Ch01) | at the cut frame |
| Big hit ("DEAD OR ALIVE", "HISTORY") | `sfx/boom.wav` | 0.45–0.5 | on the word |
| Knock | `sfx/knock.wav` | 0.5 | on each "knock" |
| Letter sent / diagram flip | `sfx/page_turn.wav` | 0.45–0.5 | on the action |
| Sea voyage bed | `sfx/sea_ambience.wav` | 0.12 | fades in and out over 10–30 frames |
| Music under narration | `music/<chapter>.mp3` | **0.15** (Ch02, Ch03), 0.16 (map sequence), 0.17 (Ch01, dipping to 0.06 at the end) | 15–20-frame fade in and out |
| Title sting | `music/title_sting.mp3` | 0.45 | 4 frames before the "15" |

---

## 7. Imagery rules

1. **Archival first.** Engravings, lithographs, daguerreotypes, broadsides, the 1836 Mitchell map, and printed pages (pamphlets, memorials, the Bill of Rights). Always B&W with contrast boosted (§2.3). Documents may keep a light sepia (0.3).
2. **One subject in colour.** Coral tint plus teal trace, or the colour-reveal gradient. Never both on different subjects in one image.
3. **Source tag on every image**, including maps and illustrations.
4. **Illustrations only where no archive exists.** They are generated with Gemini at 16:9, and every prompt ends with the shared style paragraph (below, verbatim). They must show **no recognizable real person** and **no invented portraits**: show figures from behind, anonymous crowds, or empty rooms. A mask pass (a pixel-aligned copy with the subject filled flat magenta `#FF00FF`, a second subject in green `#00FF00`) gives the coral tint and teal trace their shapes.
5. **Tone map.** Lighter chapters (revivals, spiritualism, temperance) get more energy: stacked highlights, punch-ins, onomatopoeia, montage counters, more notes. Heavy chapters (Dix, Oneida, abolition) get fewer marks, teal only, slower pacing, longer holds and respectful imagery (e.g. empty cells rather than suffering figures).

**Shared illustration style paragraph (verbatim):**

> Style: an American oil painting from the 1830s–1840s in the manner of the period's genre painters, such as George Caleb Bingham and William Sidney Mount. Muted earth palette (umber, ochre, slate blue, dull red), warm directional light, visible brushwork, faint craquelure, slightly aged varnish. Every detail must be historically accurate for the stated year and place: clothing, hairstyles, buildings, furniture, lamps and tools. No text of any kind: no letters, words, signs, labels, captions, signatures, dates or watermarks. No frame or border. No recognizable real historical person. Faces, where visible, belong to ordinary anonymous people.

---

## 8. Layout

**Frame:** 1920 × 1080. No formal safe-area constant exists in code. The margins used in practice are:

| Zone | Values in use |
|---|---|
| Top-left title | Highlight at **x 100–140, y 90–120** (e.g. 120/120, 120/110, 110/100, 100/90, 140/100) |
| Note under a top title | x +20 to +50, **y ≈ 215–260** (about 130px below) |
| Lower title | **x 110–180, y 820–960** (montage 110/820, punch-ins 110/860, cards 150/920) |
| Lower note line | y 880–985 |
| Right-hand notes column | x ≈ 820–1400 |
| Source tag | (44, 1030) bottom-left, or (44, 40) top-left |
| Counter | top-right, 60px in, 50px down |
| Frame edge | marks and cards stay ≥ about 60px from edges, except full-bleed images and the map |

**Common compositions**
1. **Subject left, notes right:** a cut-out portrait or card at x ≈ 60–220 (height 900–960), with the title and a stack of notes or an arrow chain at x ≈ 780–1400.
2. **Full-bleed image, title top-left** (or lower-left), with the source tag at the other corner. The subject is tinted and traced, and a slow push-in runs throughout.
3. **Map with pins:** the dimmed 1836 map, a vignette, teal route and pins, orange-box place names by the pins, the title top-left, and the tag bottom-left.
4. **Desk of cards:** `DarkPaper` with 2–3 cards across the upper two-thirds (y 60–470), a title and notes along the bottom.
5. **Two-column comparison:** two cards at x ≈ 200 and 1080, a title each at y 600, and notes at y 760 and 850.
6. **Big statement:** a dimmed map or black background, stacked 96px lines alternating orange-box and teal plain type, left-aligned at x ≈ 200.
7. **Diagram on paper:** boxes, locks and arrows in teal, with coral for the "after" state.

**Thumbnails** (`src/Thumbnail.tsx`; full rules in `thumbnail-and-youtube.md`)
- 1280 × 720, built from the same pieces. One B&W archival image, large, with **one coral-tinted, teal-traced figure** filling about 40–50% of the frame.
- One torn orange box with 2–4 words of Abril Fatface in ink, tilted −2°, sized so its cap height is at least about 12% of frame height.
- Optionally one short teal Nanum note with an arrow pointing at the subject.
- Dark map or desk behind. Keep the vignette, and keep grain subtle.
- Keep the bottom-right corner clear (the platform's duration badge covers it). Leave out the source tag at thumbnail size.

---

## 9. Channel identity

### 9.1 "15 MINUTE HISTORY" wordmark (channel intro, 132 frames = 4.4 s)
Background: `#0d0c09` with `DarkPaper`, vignette 0.45.

| Element | Spec | Enters (frame) |
|---|---|---|
| Card flip | 5 archival B&W cards (660px, cream border, teal 5px outline offset 10), random ±7° and scatter, one every 6 frames, tick each | 0–30. All clear at 32 with a whoosh. |
| Clock ring | centre **(440, 540)**, r **250**. Hand-drawn teal polyline **10px** (overshoots, ±1% wobble, grows 2.5%). Draws over 8 frames. | 34 |
| Quarter ticks | 4 teal strokes, **8px**, from 0.78r to 0.95r, at 12/3/6/9 | when the ring completes |
| Quarter wedge | coral, opacity **0.9**, radius 0.92r, sweeps from 12 to 3 o'clock over 16 frames (ease in-out quad). Ticks at +8, +14, +20. | 40 |
| Hand + hub | cream `#f4efe6`: hand 9px long to 0.82r, hub r 12 | with the ticks |
| "15" | Abril 250, cream, centred on the clock (box 400 wide at x 240, y 390), shadow `0 6px 24px rgba(0,0,0,0.7)`, stamp 1.35 → 0.95 → 1. Title sting starts 4 frames earlier. | 58 |
| "MINUTE" | Highlight 128px at **(760, 350)**, −2°: orange box, ink type. Stamp sfx. | 64 |
| "HISTORY" | Abril **196**, teal, at **(770, 520)**, shadow `0 6px 26px rgba(0,0,0,0.7)`, stamp 1.3 → 0.97 → 1 from the left. Boom. | 71 |
| Underline | orange bar **8px** tall at **(780, 760)**, grows 0 → **820px** over 10 frames | 77 |
| Push | whole mark scales 1 → 1.04 | 58 → 132 |
| Out | fade to black over the last 8 frames | 124–132 |

### 9.2 Title card (150 frames = 5 s; follows the cold open and the channel intro)

Built in `src/ch/Ch01.tsx` (`Title`) from `TITLE`, `SUBTITLE` and `DATES` in `src/project.ts`. *Fix Everything* values:
- **Background:** the 1836 map, whole country (centre 2600, 2320), scale 0.26 creeping +0.0003 per frame, dim 0.5, with the title-card overlay `radial-gradient(rgba(8,6,4,0.2) 30% → rgba(8,6,4,0.85) 100%)`.
- **Title:** Highlight **"FIX EVERYTHING"**, **170px**, at **(330, 380)**, **−2°**, at frame 4, with a stamp (0.4).
- **Subtitle:** "America's Reform Era", Abril **72**, teal, at **(380, 640)**, shadow `0 3px 16px rgba(0,0,0,0.8)`, fades in frames 14–20.
- **Date note:** "1820s – 1850s", Nanum 52 (→ 81px), teal, at **(1260, 740)**, **−5°**, writes on at frame 24.

---

## 10. Prompt starter for Claude Design

> Design a [thumbnail / title card / lower-third / social graphic] for "Fix Everything: America's Reform Era" on the 15 Minute History channel, in a "field-notebook documentary" style. Use a dark, warm near-black desk background (radial gradient #2a2620 → #16140f → #0d0c09 with faint ruled lines), or a dimmed black-and-white 1836 map. Use one black-and-white archival engraving or photograph with the contrast boosted, and pick out exactly one figure in coral #FF6F61 (a tint that keeps the engraving's shading) with a loose, slightly open hand-traced outline in teal #2FE0C4, 5px, sitting just outside the figure. Set the title in UPPERCASE Abril Fatface, ink #111111, on a torn-edged orange #FF9F1C highlighter strip (padding 10% top, 22% sides, 6% bottom of the type size; ragged top and bottom edges), rotated −2°, placed top-left around x 120, y 110 on a 1920×1080 canvas. Optional extras: a short lowercase handwritten note in Nanum Pen Script, teal, with a hard 2px #111 outline, rotated about −4°, and a bowed teal arrow with an open chevron head. Photos can sit on cream #f4efe6 cards with a 2.5% border, a 0 18px 34px rgba(0,0,0,.6) shadow, and ±4° rotation. Add a source credit in 18px uppercase IBM Plex Mono at the bottom-left (x 44, y 1030), a soft vignette to 30% black at the edges, and 13% overlay film grain. One job per colour: teal draws, orange titles, coral is the subject. No other colours, no gradients on type, no invented portraits of real people. Attached are reference frames and palette sheet A.

---

## 11. Chapter breaks (built for *King Andrew*, now standard)

Chapters 2 onward open on a 44-frame logo break (`LEAD` in `src/kit/shell.tsx`, drawn by `LogoBreak`): the last
shot has already faded to black, the wordmark fades up at 62% scale, its clock wedge ticks round a quarter hour in
three soft ticks (`sfx/tick_soft.wav` at 0.18), it fades out, and the chapter fades up over 10 frames. No chapter
title cards between chapters: the logo is the break. Chapter 1 has no break; it runs cold open, channel intro,
title card.
