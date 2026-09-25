# Handoff: where the explainer series stands

Read this first when picking the project up in a new session.

## Done
- **Video 1, "The Age of Jackson, Part One"** (10:40): cold open + five chapters + end card.
  Compositions `V1` and `V1-*` in `src/Root.tsx`. Rendered files are not in git; re-render with
  `npx remotion render src/index.ts V1 out/v1_full.mp4 --crf=18` then
  `python3 tools/master.py out/v1_full.mp4 out/Age_of_Jackson_Part1_1080p.mp4`.
- Teacher's requests already applied: no "drawn for this video" tags, no end credits,
  no mention of ElevenLabs on screen.

## Next: "The War Nobody Won" (War of 1812)
- Draft script: `script/v2/_draft_full.txt` (2,307 words, about 15 min at the ~155 wpm the
  narration actually runs). Waiting on the teacher: target length (10 min vs. full) and two
  accuracy rewrites:
  1. The Washington portrait: per Paul Jennings' 1865 memoir, doorkeeper Jean-Pierre Sioussat and
     gardener Thomas McGraw took it down (not Jennings with a knife); the "Save that picture…"
     wording is not Dolley Madison's documented phrasing.
  2. Treaty of Ghent: Britain did demand a Native buffer state at first, then dropped it.
  Minor: Clay was 34 when elected Speaker; Ghent was in the Netherlands in 1814 (now Belgium).
- Agreed look: a 19th-century **paper toy theater**. Proscenium with red velvet side curtains,
  fringed valance, footlights; layered painted flats and rocking wave rows; jointed paper puppets
  on rods with real-portrait heads; playbill chapter cards; saturated vermilion / royal blue /
  mustard / emerald on cream; circus-playbill wood type. Keep the emphasis system, captions and
  vocab cards (restyled as theater tickets). Build a ~30 s style test (Chesapeake cold open) first.
- Imaging: Gemini image generation for backdrops, generic puppets and scenes with no period art;
  real portraits for real people (no life portrait of Tecumseh exists; consider a silhouette).

## Keys and settings
- ElevenLabs: `ELEVENLABS_API_KEY` and `VOICE_ID=mI4rIAStSQeKeqsz4FwM` (voice "Ellis", model
  eleven_v3, speed 0.9). Read from the environment or a gitignored `video/.env`.
- Gemini: `GEMINI_API_KEY` in the environment (generativelanguage.googleapis.com is reachable).
- ElevenLabs Starter plan: 40,000 credits/month; about 14,200 used by Video 1. Music is the
  expensive part (~850 credits/minute), so reuse cues.

## Setup in a fresh cloud session
```sh
cd video && npm install && pip install pillow numpy imageio-ffmpeg
python3 tools/prep_images.py      # rebuilds public/cut (gitignored)
```
Render with `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`.
