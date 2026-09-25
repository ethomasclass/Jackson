# The Age of Jackson — explainer videos

Three ~12-minute classroom explainers, built as code with [Remotion](https://www.remotion.dev)
(React → MP4). The look is an 1830s broadside: aged paper, wood type, one vermilion, and real
public-domain prints and portraits as torn-paper cutouts.

## Pipeline

```
script/*.txt ──voice.py──▶ public/audio/<name>.wav + <name>.words.json (word timings)
                                         │
public/img (archival scans) ─prep_images.py─▶ public/cut (torn scraps, paper, grain)
                                         ▼
                           src/v1/*.tsx scenes (every cue anchored to a spoken phrase)
                                         │ remotion render
                                         ▼
                           out/*.mp4 ──master.py──▶ −14 LUFS, H.264 delivery file
```

Narration uses ElevenLabs **v3** (`eleven_v3`, override with `ELEVEN_MODEL`) at speed 0.9 with
a short breath added after each sentence (~160 words per minute). v3's own timestamps drift around
its natural pauses, so the finished track is run through ElevenLabs **forced alignment** for exact
word timings. Every ElevenLabs response is cached in `public/audio/cache/`, so re-running
`voice.py` after changing pauses or the script only pays for paragraphs whose text changed.

Because every animation cue is tied to a phrase in the narration (`at('fired first')`), not to a
second, re-recording the voice re-times the whole video with no code changes.

## Emphasis markup in scripts

- `*key idea*` — red and bold in the captions; usually gets a kinetic-type moment on screen.
- `{vocab}` — red and underlined in the captions, and gets a **Vocabulary card** that shows the
  definition word by word as the narrator reads it.

Markers can span several words. They are stripped before the text is sent to the voice.

## Commands

```sh
npm install
pip install pillow numpy imageio-ffmpeg        # piper-tts too, for the offline stand-in voice

# narration (ElevenLabs: put ELEVENLABS_API_KEY and VOICE_ID in .env or the environment)
python3 tools/voice.py script/v1_cold_open.txt v1_cold_open
python3 tools/voice.py script/v1_cold_open.txt v1_cold_open --piper    # stand-in voice, needs PIPER_MODEL

python3 tools/sfx_eleven.py        # ElevenLabs sound effects; originals kept in public/sfx/raw
python3 tools/sfx_eleven.py --finish   # re-trim/normalise from the originals, no credits
python3 tools/music_eleven.py good_feelings   # ElevenLabs music cue (~850 credits/minute)
python3 tools/prep_images.py       # rebuild cutouts after adding scans
python3 tools/commons.py search "Peggy Eaton portrait"
python3 tools/commons.py get "File:....jpg" public/img/name.jpg 1920

npm run studio                      # live preview with a timeline scrubber
npx remotion render src/index.ts V1-ColdOpen out/v1_cold_open.mp4 --crf=18
python3 tools/master.py out/v1_cold_open.mp4 out/v1_cold_open_master.mp4
node tools/stills.mjs V1-ColdOpen out/stills 4.8 10.5   # review frames
```

In a cloud session, point Remotion at the preinstalled browser:
`--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`.

Compositions: `V1` (the whole video so far), and one per scene (`V1-ColdOpen`,
`V1-Election1820`) for quicker previews. Each chapter opens with a chapter card.

Captions are a prop: render with `--props='{"captions":false}'` for a clean version.

## Images

`tools/find_images.py` searches every open archive we can reach and only downloads what passes that
archive's copyright test, recording title, artist, date, licence and source page in
`public/img/credits.json`:

| Source | Counts as usable |
|---|---|
| Wikimedia Commons | public domain, CC0 or CC BY (per file) |
| Library of Congress (Prints & Photographs) | "No known restrictions on publication" |
| The Met, Art Institute of Chicago, Cleveland Museum of Art | flagged public domain / CC0 |
| Internet Archive (images and scanned books) | explicit PD/CC licence, or published before 1930 |

```sh
python3 tools/find_images.py search "King Andrew"                 # all sources; OK / SKIP / ?? per result
python3 tools/find_images.py get loc:2008661753 public/img/king_andrew.jpg
python3 tools/find_images.py books "Andrew Jackson"                # 1800s books full of engraved plates
python3 tools/find_images.py pages lifeofandrewjack01partuoft 1 40 out/pages.jpg
python3 tools/find_images.py get iabook:lifeofandrewjack01partuoft:7 public/img/plate.jpg
```

Library of Congress items often have only a small JPEG online, so the tool pulls the archival TIFF
and converts it. Every image on screen carries a small **PRIMARY SOURCE** tag naming what it is.

Fonts (Abril Fatface, Alfa Slab One, Libre Caslon Text, IM Fell English SC) are vendored in
`public/fonts` under the SIL Open Font License.
