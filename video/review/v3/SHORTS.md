# King Andrew: YouTube Shorts

Vertical (1080×1920) shorts cut from the long video's own narration, pictures and music. Nothing new was generated.
Code: `video/src/v3/shorts/` (`Short.tsx` = the shared vertical shell, one file per short). Render with
`npx remotion render src/index.ts Short-Boots out/shorts/raw.mp4` then `python3 tools/master.py` (−14 LUFS).

## Short 1 · He wouldn't bow to a king (test)

**File:** `renders/shorts/King_Andrew_Short_1_Bow_to_a_King.mp4` (46 s, −14 LUFS)
**Narration:** ch02 0:00–0:35 (born in the Waxhaws → the boots → "no family left") + ch11 1:02–1:11 ("Remember that kid… the nickname King Andrew.")
**Music:** the chapter 2 cue (`cold_open.mp3`) · **Pictures:** Brave Boy of the Waxhaws (1876), Sully portrait (1845), "King Andrew the First" (1833)

**Title**
```
He Wouldn't Bow to a King… So Why Did They Call Him One?
```
Alternate: `The Boy Who Wouldn't Bow to a King`

**Description**
```
At 13, Andrew Jackson refused to clean a British officer's boots, and carried the scar for life. Decades later, his enemies were calling him King Andrew. Full story: <link to the King Andrew video>

#AndrewJackson #APUSH #history
```

**Upload settings**
- **Related video:** link the full *King Andrew* video (Shorts → Related video), so viewers can tap through to it.
- **Cover:** every frame carries the headline and a coral face, so YouTube's own pick will work. To choose it yourself in the YouTube app, use the very first frame (0:00), the boy facing the officer, which is saved as `King_Andrew_Short_1_cover_frame0.jpg` for reference.
- **Altered or synthetic content:** this short uses only archival pictures. The narration is your voice clone, so answer the same way you did for the full video.

## Build notes (for the rest of the set)

- **Safe zones** (YouTube covers them): top ~170 px, bottom ~460 px, right ~130 px below y 900. Headline y 190–470; pictures' focus y 520–1200; captions y 1250–1440; source tag y 1462.
- **Cover:** the headline is fully drawn from frame 0 and stays all the way through; a tinted face is always in frame.
- **Engravings with printed captions:** zoom until the print's own caption text falls below the frame (it otherwise shows in the cover).
- **Payoff images whose head sits at the very top:** put them on a card in the middle band, not full-bleed, or the headline covers the face.
- **Captions:** up to 3 words, breaking at punctuation, the spoken word in teal (Inter 800, 70 px).
- Clips are cut in the pauses between words, with a 0.2 s breath between clips.
