---
name: 15-minute-history
description: Produce a "15 Minute History" YouTube explainer video in the channel's established style (field-notebook look, ElevenLabs voice clone, Remotion), end to end, from topic to upload. It covers the narration script, pronunciation check, voicing, archival images and Gemini painting prompts, coral-tint/teal-trace masks, scenes timed to the narration's words, render and master, previews, thumbnail, SEO'd YouTube title/description/tags, and a student note-taking handout. Use this whenever the user wants a new history video or explainer for their channel, mentions 15 Minute History, or asks for any one piece of it (a script in their style, scenes, a re-render, a thumbnail, YouTube text, a viewing guide for a video), even if they don't name the channel.
---

# 15 Minute History videos

The user makes ~15-minute U.S. history explainers for a general audience and for their own students (APUSH and
U.S. History). Earlier videos: *Fix Everything: America's Reform Era*, the Ambrose Bierce video, and *King Andrew:
How the People's President Got a Crown* (the most recent, and the source of this skill's template). The look:
black-and-white archival images on a dark desk, one figure tinted coral and traced in teal, orange torn-tape
titles, teal handwritten notes, graphics stepping at 12 fps, hard cuts, film grain. The voice: the user's own
ElevenLabs voice clone, plain and a little wry.

This skill carries a working starter project (`assets/template/`): the visual kit, the tools, fonts, sound
effects, the channel intro and logo break, the title sting, an 1836 map, and two example chapters. Start every new
video from it so the style matches exactly.

## The workflow

Each phase ends at a **checkpoint**: show the user the result and wait for their go-ahead before spending money
(voice credits) or hours (renders). The user steers in short messages; take each note literally and apply it
everywhere it applies.

| # | Phase | You produce | Read |
|---|---|---|---|
| 1 | **Set up** | new project from the template | below |
| 2 | **Script** | beat outline → full draft in `script/SCRIPT.md` + one `chNN_slug.txt` per chapter | `references/script-writing.md` |
| 3 | **Content review** | answers to "are we missing anything?", cuts to ~15 min, fact-check flags | `references/script-writing.md` |
| 4 | **Pronunciation check** | respellings + a test MP3 for the user | `references/voice-and-audio.md` |
| 5 | **Voice** | chapter WAVs + word timings, a narration preview MP3 | `references/voice-and-audio.md` |
| 6 | **Images** | archival images with credits; `GEMINI_PROMPTS.md` for the gaps; masks | `references/images-and-masks.md` |
| 7 | **Scenes** | `src/ch/ChNN.tsx` per chapter, checked with stills, anchor and text probes | `references/building-scenes.md`, `references/visual-style.md` |
| 8 | **Render** | 1080p master, 720p, a <30 MB preview for the user | `references/render-and-deliver.md` |
| 9 | **Feedback rounds** | batched fixes, partial re-renders, new previews | `references/render-and-deliver.md` |
| 10 | **Package** | thumbnail concepts, YouTube title/description/tags, 1080p via Git LFS | `references/thumbnail-and-youtube.md` |
| 11 | **Classroom** (if asked) | a simple note-taking handout | `references/classroom-handout.md` |

Phases 6 and 7 overlap with 5: scenes can be built on placeholder timings (`tools/fake_voice.py`) while the user
reviews the script or makes Gemini images, and the real voice re-times them automatically.

## 1. Set up

```sh
sh <this-skill>/scripts/new_project.sh video "<Slug_For_Files>"   # e.g. video King_Andrew
cd video
```

This copies the template, writes placeholder narration for the example chapters, and runs `npm install`. Then
edit `src/project.ts` (title, subtitle, dates, intro cards, thumbnail portrait), and preview with
`npx remotion studio` or `node tools/stills.mjs Ch01 out/stills 3 9`. The two example chapters show the
patterns (cold open + intro + title card; map, vocab, quote and two-views scenes); replace their scripts and
scenes with the real ones, and delete `public/img/demo/` once the video has its own images.

Python tools need `pip install pillow numpy imageio-ffmpeg` (and `rembg onnxruntime opencv-python-headless` for
masks). Keys go in `.env` (see `.env.example`), never in chat or git.

Project layout:

```
script/      chNN_slug.txt per chapter, SCRIPT.md, GEMINI_PROMPTS.md, MUSIC.md
src/         project.ts (per-video settings), chapters.ts, masks.ts, Thumbnail.tsx, ch/ChNN.tsx, kit/ (shared look), lib/
public/      audio/ (narration + timings), img/ (archival by chapter, gen/ for AI, masks/, maps/), music/, sfx/, fonts/
tools/       voice.py, voice_all.sh, fake_voice.py, anchors.py, mask.py, trace.py, find_images.py, stills.mjs,
             sheet.py, probe_text.mjs, render.sh, master.py, frames_sheet.py, thumbs.mjs, youtube_check.py, music_eleven.py
review/      YouTube_description.md and anything else for the user
renders/     720p video, thumbnails, (LFS) 1080p master
```

## Principles that hold across phases

- **The script drives everything.** Scenes are timed to spoken words, not seconds, so a re-voice re-times the
  video. Lock the script before voicing; a later wording change means re-voicing that chapter and re-checking its
  anchors.
- **Objective, evidence-first, both sides.** No historian names, no modern politicians, no false continuity with
  today's parties or institutions. Say who was left out of "the people."
- **Archival first.** Real people only from period images. AI paintings only for gaps, never showing a
  recognizable real person, all sharing one style paragraph.
- **One subject in color per image, a source tag on every image, text never off the frame edge.** Run the text
  probe on every chapter before each render the user will see.
- **Check your own work visually before the user does**: contact sheets of stills, the text-edge probe, the
  anchor check, frames pulled from the finished render. Report what you checked and anything still imperfect.
- **Spend carefully.** Voice and music cost credits (responses are cached); renders cost time. Re-voice and
  re-render only what changed.
- **Deliver where the user can open it.** Chat attachments max out at 30 MB (send a 480p preview); the 1080p
  master goes on the branch through Git LFS, verified by a fresh clone.
- **Commit as you go** on the working branch: scripts, audio, images, masks, code, the 720p. Never commit `.env`,
  `node_modules/` or `out/`.

## When the user asks for only one piece

- "Write a script about X": phases 2–3 only; SCRIPT.md plus chapter files, ending with the fact-check flags and an
  offer to run the pronunciation check.
- "Make a thumbnail": `src/Thumbnail.tsx` + `tools/thumbs.mjs`; show two or three concepts.
- "YouTube description / tags": `references/thumbnail-and-youtube.md`, timestamps from the real render, then
  `python3 tools/youtube_check.py`.
- "Handout / viewing guide / questions for the video": `references/classroom-handout.md`. Keep it simple.
- Working inside an existing video project (not the template): the same kit lives under `src/v3/` or `src/jh/`
  there; read that project's `HANDOFF.md` or `README.md` first and follow its paths.
