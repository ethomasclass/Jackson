# Handoff: where the explainer series stands

Read this first when picking the project up in a new session.

## Done
- **Video 1, "The Age of Jackson, Part One"** (10:40): cold open + five chapters + end card.
  Compositions `V1` and `V1-*` in `src/Root.tsx`. Rendered files are not in git; re-render with
  `npx remotion render src/index.ts V1 out/v1_full.mp4 --crf=18` then
  `python3 tools/master.py out/v1_full.mp4 out/Age_of_Jackson_Part1_1080p.mp4`.
- Teacher's requests already applied: no "drawn for this video" tags, no end credits,
  no mention of ElevenLabs on screen.

- **Video 2, "The War Nobody Won" (War of 1812)** (14:23): toy-theater style. Composition `V2`
  (scenes `V2-ColdOpen` ... `V2-Legacy`) in `src/Root.tsx`; scene code in `src/v2`, the theater kit in
  `src/theater`. Scripts in `script/v2/v2_*.txt` (accuracy fixes listed in `script/v2/CHANGES.md`).
  720p copy in `renders/War_Nobody_Won_720p.mp4`. Re-render:
  `npx remotion render src/index.ts V2 out/v2_full.mp4 --crf=18` then
  `python3 tools/master.py out/v2_full.mp4 out/War_Nobody_Won_1080p.mp4`.
- Video 2 asset tools: `tools/puppet.py` (archival art -> cut-out puppets, needs `pip install rembg onnxruntime scipy`),
  `tools/gemini_image.py` + `tools/scenery.py` (painted backcloths), `tools/props.py` (smoke, flames,
  silhouettes), `tools/music_lyria.py` (Lyria cues via the Gemini API, ~$0.08 each). Wikimedia's API
  often rate-limits cloud IPs; direct upload.wikimedia.org file URLs and the Library of Congress still work.

## Keys and settings
- ElevenLabs: `ELEVENLABS_API_KEY` and `VOICE_ID=mI4rIAStSQeKeqsz4FwM` (voice "Ellis", model
  eleven_v3, speed 0.9). Read from the environment or a gitignored `video/.env`.
- Gemini: `GEMINI_API_KEY` (billing on; used for images and Lyria music).
- ElevenLabs Starter plan: 40,000 credits/month (resets the 24th); Video 2's narration used about 6,500.
  Music now comes from Lyria instead of ElevenLabs.

## Setup in a fresh cloud session
```sh
cd video && npm install && pip install pillow numpy imageio-ffmpeg
python3 tools/prep_images.py      # rebuilds public/cut (gitignored)
```
Render with `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`.
