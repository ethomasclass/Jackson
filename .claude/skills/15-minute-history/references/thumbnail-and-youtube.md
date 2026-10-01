# Thumbnail and YouTube upload text

## Contents
1. Thumbnail
2. YouTube title, description, chapters, tags
3. Upload settings

## 1. Thumbnail

`src/Thumbnail.tsx` holds two concepts drawn with the video's own kit; `node tools/thumbs.mjs` renders them to
`renders/thumbnails/<SLUG>_{A,B}.png` at 1280×720. Offer the user two or three concepts, then refine the one they
pick. For *King Andrew* they chose **A, the split**:

- **A · Split portrait.** One cut-out portrait on the dark desk, centred on the frame's middle line. The left half
  is tinted teal, the right half coral, with a cream line down the middle. A hand-drawn crown or other symbol sits
  on the head. Two words in orange tape sit under the chin, one each side ("HERO" / "OR KING?").
- **B · Title-led.** A tinted, traced portrait card on the right; a handwritten setup line plus a two-line
  highlighter title on the left over a dark gradient.

Rules the user enforced:

- **The whole head is in frame, with room above it.** Zoom out (`THUMB_PORTRAIT.scale`, `top` in
  `src/project.ts`) rather than cropping the top of the head.
- **A symbol on the head must sit on the head and match its width.** Measure the hair line from the mask instead
  of guessing: for each source x, the first opaque row of `public/img/masks/<name>_subject_a.png` is the top of
  the hair. Put the crown's base a little below that line, spanning the head's width there (*King Andrew*: hair
  top about y 145–250 across x 650–1150, base at y 275 from x 660 to 1200). Draw it across the whole head (both
  halves), in gold `#FF9F1C` with a dark drop shadow. Coral on the coral half disappears.
- **Text never covers the face, and above all not the mouth.** Keep the titles below the chin (y ≥ 840 at
  1920×1080) or beside the head.
- Keep the bottom-right corner clear (YouTube's duration badge covers it). The channel logo goes top-left.
- No source tag at thumbnail size. Big, few words: 2–4 words, cap height ≥ 12% of the frame.

Render frame 140 (every write-on finished), look at the result at 1280×720 and at phone size before sending.

## 2. YouTube title, description, chapters, tags

Write them into `review/YouTube_description.md` as four sections: Title (in a code block, with 2 alternates
listed below), Description (one code block, ready to paste), Tags (one code block), Upload settings. Then run
`python3 tools/youtube_check.py`.

**Title** (≤ 70 characters): the person or topic people search for first, then the hook.
`Andrew Jackson: How the People's President Became "King Andrew"` / `Why America Tried to Fix Everything | The Reform Era Explained`

**Description template:**

```
<Hook question with the main keywords, 1–2 sentences: who, what, the paradox.> <The cold open's artifact in one or two vivid sentences.>

This is <topic> explained in 15 minutes: <the big topics, in video order, named the way students search for them>. Along the way we look at both sides: <supporters' view> and <critics' view>.

⏱️ CHAPTERS
0:00 <chapter 1 name, with its keyword>
0:55 ...                    (from tools/render.sh's chapter start times; round down)

📚 IN THIS VIDEO
• <one bullet per chapter, packed with the specific names, laws, cases and terms covered>

Great for APUSH Period <N> (<years>) review, U.S. History class, or anyone who wants to understand <topic>.

👍 If this helped, like and subscribe for more 15 Minute History.   (add "Next time: ..." only if the next video is decided)

🖼️ SOURCES & CREDITS
Historical images: <institutions actually used, from public/img/credits.json: Library of Congress, Wikimedia Commons, ...>. A few scenes with no surviving image were illustrated with AI image generation. Narration uses an AI voice; music is AI-generated.

#<MainTopic> #APUSH #USHistory
```

SEO notes:
- The first ~150 characters show in search and above "Show more": put the main keywords there.
- Chapter titles use the same searchable terms (they become Google "key moments").
- Only the first three hashtags show above the title.
- Pull terms from the script's vocab list and key concepts; don't promise topics the video doesn't cover.

**Tags** (≤ 500 characters counted YouTube's way): 20–30 tags, most specific first: the person, the nickname,
the era name, each major event, law, court case and concept, key people, then `apush`, `apush period N`,
`us history`. Drop the broadest tags first if over the limit.

## 3. Upload settings

- **Altered or synthetic content: Yes.** The AI-illustrated scenes could pass for real historical images, and the
  narrator is an AI voice clone. Say how many AI scenes there are.
- **Category:** Education.
- **Thumbnail:** `renders/thumbnails/<SLUG>_A.png` (or the chosen concept).
- **Video file:** `renders/<SLUG>_1080p.mp4` (the LFS master).
