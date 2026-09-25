# Handoff: Jackson explainer videos (how they are built and rendered)

Read this first in a new session. The keys are not in git: ask the owner for them and put them in `video/.env`.

## Status

| Video | Length | Where |
|---|---|---|
| 1. "The Age of Jackson, Part One" | 10:40 | composition `V1` |
| 2. "The War Nobody Won" (War of 1812) | 14:23 | composition `V2` (scenes `V2-ColdOpen` … `V2-Legacy`) |

## Repositories and branches

- **Project code and assets:** `ethomasclass/Jackson`, branch **`claude/youthful-allen-f14v7e`**, folder `video/`.
  - Video 1 was built on branch `claude/jackson-explainer-videos-oseyfs`. Video 2's branch was started from it, so it contains both videos.
  - The repo's default branch holds an unrelated detective game.
- **Review copies and the 1080p master:** `ethomasclass/Jackson-Videos`, branch `claude/youthful-allen-f14v7e`.
  - `review/`: the script, the accuracy notes, the style test and the four preview parts.
  - `master/War_Nobody_Won_1080p.mp4`: the 1080p master (1.16 GB), stored with Git LFS.
- **720p renders in git:** `video/renders/Age_of_Jackson_Part1_720p.mp4` and `video/renders/War_Nobody_Won_720p.mp4`.

## Keys and settings

Put these in `video/.env`. That file is gitignored, and every tool reads it automatically.

```
ELEVENLABS_API_KEY=<ask the owner>
VOICE_ID=mI4rIAStSQeKeqsz4FwM
GEMINI_API_KEY=<ask the owner>
```

- **ElevenLabs:**
  - Voice "Ellis" (the cloned voice), model `eleven_v3`, speed 0.9. These are the defaults in `tools/voice.py`.
  - Starter plan: 40,000 credits per month, resetting on the 24th. 20,652 were used as of Sep 25, 2026.
  - Voicing one ~2,000-word video cost about 6,500 credits.
- **Gemini:**
  - Billing is on. The key is used for images (`gemini-3-pro-image`, about $0.13 each) and for Lyria music.
  - Lyria costs `lyria-3.5` about $0.08 per full cue, or `lyria-3-clip-preview` about $0.04 per 30 s clip.

## Fresh cloud session setup

```sh
git clone https://github.com/ethomasclass/jackson && cd jackson && git checkout claude/youthful-allen-f14v7e
cd video
npm install
pip install pillow numpy imageio-ffmpeg scipy
pip install rembg onnxruntime        # only for cutting new puppets (downloads a 179 MB model on first use)
apt-get install -y git-lfs            # only for pushing masters over 100 MB
python3 tools/prep_images.py          # rebuilds public/cut (gitignored; used by Video 1)
# then create video/.env with the keys above
export REMOTION_CHROME=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell | head -1)
```

## Pipeline (how a video is made)

Everything is code: Remotion (React), rendered to MP4, then mastered with ffmpeg.

1. **Script.**
   - One text file per scene: `script/v2/v2_*.txt`. Paragraphs are separated by blank lines.
   - Markup: `*key idea*` turns red in the captions; `{vocab}` is underlined and gets a vocabulary card.
   - Accuracy changes are logged in `script/v2/CHANGES.md`.
2. **Narration.**
   - Command: `python3 tools/voice.py script/v2/v2_s4_tecumseh.txt v2_s4_tecumseh`
   - Output: `public/audio/<name>.wav` plus `<name>.words.json`, which holds the time of every word.
   - Each paragraph is voiced separately, and a short breath is added after each sentence. The word timings then come from ElevenLabs forced alignment.
   - **Responses are cached in `public/audio/cache/`:** only changed paragraphs cost credits when you re-run.
   - Mispronounced names and years go in the `PRONOUNCE` table in `voice.py`. Examples: "Guerriere" becomes "Gair-ee-air", "1807" becomes "eighteen oh-seven".
3. **Timing.**
   - Scene code anchors every cue to a spoken phrase, like `at('opens fire')`, not to a second. Re-voicing therefore re-times everything automatically.
   - `at(phrase, n)` picks the n-th time a phrase occurs. Punctuation is ignored, so "four weeks" inside a quote and "Four weeks." match each other.
4. **Images.**
   - **Archival:** `python3 tools/find_images.py search "…"`, then `… get <id> public/img/v2/<name>.jpg`. Credits are logged in `public/img/credits.json`.
   - **Wikimedia's API often returns 429 errors in cloud sessions**, because the IP is shared. Direct `upload.wikimedia.org` file URLs still work (path = md5 of the file name), and so does the Library of Congress (`loc:` ids).
   - **Puppets:** `python3 tools/puppet.py <name>` cuts a person or ship out with rembg and adds a card edge, writing `public/v2/puppets/<name>.png`. Crops and thresholds are set per puppet in the `PUPPETS` table.
   - **Painted scenery:** `python3 tools/gemini_image.py <name>` writes a raw painting to `public/img/v2/gen/`, then `python3 tools/scenery.py <name>` crops it to `public/v2/scenery/<name>.jpg`.
   - **Props:** `python3 tools/props.py smoke|sailors|people|flames` splits prop sheets (smoke, flames, silhouettes) into `public/v2/props/`.
5. **Music and sound.**
   - `python3 tools/music_lyria.py <cue>` writes `public/music/v2/<cue>.mp3`; the prompts are in the `CUES` table. Reuse cues where possible: Video 1's are in `public/music/`.
   - Sound effects: `python3 tools/sfx_eleven.py <name>` (ElevenLabs, a small number of credits).
6. **Preview.**
   - Live preview: `npm run studio`.
   - Quick stills: `node tools/stills_all.mjs '{"V2-Tecumseh":[5,20,40]}'` writes `out/stills2/` (times are in seconds).
7. **Render.**
   ```sh
   npx remotion render src/index.ts V2 out/v2_full.mp4 --crf=18 --browser-executable=$REMOTION_CHROME --concurrency=4
   ```
   - About 70 minutes for the full 14-minute video and about 8 minutes for one scene. Render a single scene with `V2-<Scene>`.
   - Run long renders in the background, with nohup, and watch the log.
8. **Master.**
   - Command: `python3 tools/master.py out/v2_full.mp4 out/War_Nobody_Won_1080p.mp4`
   - Two-pass loudness to -14 LUFS (YouTube's target), a peak limiter, then H.264 with faststart. The result is about 1.15 GB because of the paper grain.
9. **Delivery copies.**
   - **720p under GitHub's 100 MB limit** (two-pass at 780k):
     ```sh
     ffmpeg -i War_Nobody_Won_1080p.mp4 -vf scale=1280:720 -c:v libx264 -b:v 780k -pass 1 -an -f null /dev/null
     ffmpeg -i War_Nobody_Won_1080p.mp4 -vf scale=1280:720 -c:v libx264 -b:v 780k -pass 2 -c:a aac -b:a 112k -movflags +faststart War_Nobody_Won_720p.mp4
     ```
   - **Chat previews:** the upload limit is 30 MB, so split the 720p into four 216-second parts with `-ss/-t … -c copy`.
   - **1080p master:** push with Git LFS (`git lfs track "master/*.mp4"`).
   - ffmpeg is the static build from imageio-ffmpeg: `python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"`.

## Code map

- `src/Root.tsx`: all compositions. `playlist()` joins scenes into `V1` and `V2`.
- `src/theater/`: Video 2's kit.
  - `Stage.tsx`: the proscenium, camera, backcloths, waves, lighting and curtain. The camera is clamped so it never shows past the proscenium edges.
  - `Puppet.tsx`: puppets, name cards and source tags.
  - `Signs.tsx`: hanging signs, scrolls, smoke, the calendar, the flag, the ticket captions and the playbill.
  - `Props.tsx`: vocabulary tickets, framed pictures, flames and rockets.
  - `Scene.tsx`: the scene card, plus the shell that holds narration and captions.
- `src/v2/*.tsx`: one file per scene.
- `src/components`, `src/v1`: Video 1.

## Gotchas

- **Repo rules:** commit and push when you're done (a stop hook checks for uncommitted files). GitHub rejects files over 100 MB, so use LFS for masters.
- **Video 1's teacher requests carry over:** no end credits, no "drawn for this video" tags, and no mention of ElevenLabs on screen. The title playbill has no "presents" line.
- **Honest labeling:** people with no surviving likeness (Tecumseh, Sioussat, McGraw, Lafitte, the sailors) are black silhouettes with a note. Stand-in images and later paintings carry a tag saying so.
