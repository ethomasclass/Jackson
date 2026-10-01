# Writing the script

The script is the video. Everything on screen is timed to its words, so get it right before voicing: a change
after voicing means re-voicing that chapter and re-checking its anchors.

## Contents
1. Length and shape
2. The voice (with examples)
3. Objectivity rules
4. Teaching moves: vocab, key concepts, callbacks
5. File format and markup
6. SCRIPT.md: the master document
7. Fact-check flags
8. Pronunciation check (before voicing)
9. The review loop with the user

## 1. Length and shape

- **Target 15:00–15:30 finished.** The narration runs about 185 words a minute at the locked pace, and the intro,
  title card and logo breaks add about 35 seconds. So aim for **2,700–2,800 words** of narration.
  *King Andrew*: 2,757 words → 14:53 of narration → 15:30 finished.
- **10–11 chapters**, one idea each, 30 seconds to 2:20 long. Short chapters (30–45 s) are fine for a single beat.
  A chapter is the unit of re-voicing and re-rendering, so keep each one self-contained.
- **Chapter 1 is a cold open, under a minute.** Open on a concrete artifact: a cartoon, a pamphlet, a portrait,
  a document. Describe it in short sentences. Then pose the **driving question** the whole video answers:
  "So here's the question I want to answer today: How did the People's President end up being called a king?"
  End with a hook into chapter 2 ("And it starts with a teenager, a British officer, and a pair of dirty boots.").
- **The last chapter answers the question out loud** ("So let's go back to the question."), pulls the threads
  together through callbacks, and ends on a short line for a general audience that lands the title. *King
  Andrew* ended on one word: "King." *Fix Everything* ended on a one-line tease of what comes next ("It split
  the country in two. But that's a story for next time."). Either works; asks to like or subscribe belong in
  the description, not the narration.
- **Early life gets color.** One or two vivid, human details (the boots, the duel, the bullet he carried) make the
  rest of the story land.
- When the user asks for something to be cut "to get to 15 minutes", give a cut list with word counts per cut and
  the new total, then apply it.

## 2. The voice

Plain, quick and a little wry: a smart friend explaining history, not a textbook and not a comedian.

- **Short sentences.** Fragments are fine. "A man in royal robes. A crown on his head."
- **Plain words.** Define a hard word the moment it appears, in an appositive:
  "That's called expanding suffrage, the right to vote." / "a tariff, a tax on imported goods like British cloth"
  / "nullify, or cancel, a federal law".
- **Dry one-line asides**, one every minute or so, never two in a row:
  - "Okay. Dramatic." (after Jackson's "Judas of the West" letter)
  - "Which is not normally what cabinet meetings are for."
  - "Which is basically your vice president running a burner account against you."
  - "Subtle." (the Whigs naming themselves after the anti-king party)
  - "Translation: I'm the people. You're just Congress."
  - "Not a great start." (his father died weeks before he was born)
  - "So, basically, the skirt scandal."
  A modern comparison is allowed when it is instantly clear, and rarely.
- **Humanize the people.** Loyal? Absolutely. Stubborn? Also absolutely. Grief, temper and friendship explain
  choices; use them.
- **Heavy material gets no jokes.** Slavery, removal, deaths: plain statements, numbers, a primary source, and
  space. The heavy chapter is voiced slower (see voice-and-audio.md).
- **Numbers as people say them**: "about 23 million acres", "about one in ten", "perhaps as many as one in four".
  The voice tool spells out years and numbers itself, so write digits.

## 3. Objectivity rules

These came from the user directly; follow them in every video.

- **Let's look at the evidence.** Present what supporters and critics each saw ("To Jackson's supporters, he had
  saved the Union. To South Carolina, he was a tyrant..."). The ending explains why both readings existed; it
  doesn't hand down a verdict.
- **No historian names** in the narration or on screen. "Historians still argue about this one" is fine.
- **Don't imply false continuity with today.** If a party, institution or word shares a modern name, say plainly
  it was different: "Same name as today's Democrats, but a very different party, with very different ideas."
- **No modern politicians**, even by implication. The closer can gesture at "ever since" without naming anyone.
- **Hedge what's uncertain, in plain words**: "reportedly", "probably never said that", "There's no proof of an
  actual deal." Myths get named and corrected ("You may have heard that he said...").
- **Say who was left out** when "the people" or "democracy" is the theme: women, enslaved people, Native nations,
  and in most states free Black men.

## 4. Teaching moves

- **Vocab** (a highlighter title plus a definition bar on screen): list 10–20 per video in SCRIPT.md. Mark the
  term in the script with `{braces}` where it is defined.
- **Key concepts** the user names (e.g. "spoils system and Kitchen Cabinet need to be key concepts") get their own
  beat: the term, a definition in one sentence, an example, and why it mattered.
- **Primary-source quotes**: short, exact, dated, attributed on screen (not in the narration unless natural).
  Shorten as spoken and note the full wording in the fact-check flags.
- **Callbacks** make 15 minutes feel like one story: "Hold that thought." / "Remember that kid." / "Hold onto
  that. It's about to cause a scandal." List them in SCRIPT.md so the scenes can reuse the same image.
- **Emphasis graphics**: when the user wants a point hit hard ("expanded suffrage is why he won"), plan a
  multi-beat graphic in SCRIPT.md's production notes and make the narration give it room (three short
  paragraphs, each with one number).

## 5. File format and markup

One file per chapter: `script/chNN_slug.txt` (`ch01_cold_open.txt`, `ch05_the_people.txt`). The audio and the
scene import use the same stem.

- Paragraphs are separated by a blank line. Each paragraph is voiced as one take, with the paragraphs either side
  as context, so a paragraph is a breath group: 1–4 sentences.
- `*key idea*` marks emphasis; `{vocab term}` marks a defined term. Both may span words; the voice tool strips
  them and records them per word (`k: 'key' | 'vocab'` in words.json).
- Write digits for numbers and years; write names normally (the pronunciation table handles respellings).
- Quotes in straight or curly double quotes are fine.

## 6. SCRIPT.md: the master document

`script/SCRIPT.md` is what the user reads and approves. Rebuild it from the chapter files whenever they change.
Layout used for *King Andrew*:

```
# <Title>: <Subtitle>
**15 Minute History** · narration script · <N> words · about <mm:ss>
**Driving question:** ...   **Answer:** ...
## 0:00 | <Chapter 1 name>
<narration>
---
## 0:58 | <Chapter 2 name>
...
## Production notes      (heavy chapter, callbacks, vocab cards, quote cards, key concepts, emphasis graphics, ending)
## Pronunciation (for ElevenLabs)   (table: Word | Say it)
## Fact-check flags      (each claim that could be challenged, with the evidence and how the script hedges)
## Sources
```

Re-time the headings from the real chapter lengths after voicing (tools/render.sh prints chapter start times).

## 7. Fact-check flags

For every date, number, quote and contested claim, write a flag: what the script says, what the record says,
and why the wording is safe. Also flag places where class readings or popular memory differ from the script
(wrong year in a textbook, a famous misquote). Teachers use this, and it is what lets the user trust the script.
Re-check anything time-sensitive before publishing (e.g. "Jackson is still on the $20").

## 8. Pronunciation check (before voicing)

Always do this before voicing a whole video; the user asked for it explicitly.

1. List every name and term the voice could misread: Native nations and leaders, French and Spanish names, place
   names (Worcester, Waxhaws), abbreviations (IOUs), anything the user flags.
2. Put the risky ones in `PRONOUNCE` in `tools/voice.py` as respellings ("Worcester": "Wooster",
   "Sequoyah": "Sih-kwoy-uh", "Tocqueville": "Toke-vill", "Floride": "Flor-id", "IOUs": "I-O-U's").
   A respelling must keep the same number of words, or the timing alignment breaks.
3. Voice a short test file (`script/tests/pronunciation.txt`, one sentence per term, in context) and send the
   user the MP3 to listen to. Fix and repeat before voicing chapters.

## 9. The review loop with the user

The user steers content in short messages. Expect, and invite, these passes:

1. **Beat outline** (chapter list with one line each, the driving question and the answer). Get approval.
2. **Full draft** in SCRIPT.md. Ask: "Are we missing anything important, content-wise?" Suggest additions with
   their cost in seconds.
3. **Coverage checks** the user names (a required concept, a topic to touch lightly and save for another video,
   a favorite moment from an earlier draft to keep). Answer each directly, then edit.
4. **Trim to time** with a cut list.
5. **Fact-check flags and pronunciation check**, then voice.
