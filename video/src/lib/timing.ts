// Scenes are timed off the narration's word timestamps (public/audio/<name>.words.json, written
// by tools/voice.py). Anchoring every cue to a phrase instead of a second means re-recording the
// voice re-times the whole video automatically.

export type Word = {w: string; s: number; e: number; k?: 'key' | 'vocab'; para_end?: boolean};
export type Narration = {voice: string; duration: number; words: Word[]};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export type Timeline = ReturnType<typeof makeTimeline>;

export const makeTimeline = (n: Narration, fps: number) => {
  const toks = n.words.map((w) => norm(w.w));
  const find = (phrase: string, nth = 1) => {
    const p = phrase.split(/\s+/).map(norm);
    let count = 0;
    for (let i = 0; i + p.length <= toks.length; i++) {
      if (p.every((x, j) => toks[i + j] === x) && ++count === nth) return i;
    }
    throw new Error(`Narration has no "${phrase}" (occurrence ${nth})`);
  };
  const len = (phrase: string) => phrase.split(/\s+/).length;
  return {
    fps,
    words: n.words,
    frames: Math.ceil(n.duration * fps),
    /** index of the first word of the phrase */
    idx: find,
    /** frame at which the phrase starts being spoken */
    at: (phrase: string, nth = 1) => Math.round(n.words[find(phrase, nth)].s * fps),
    /** frame at which the phrase finishes */
    end: (phrase: string, nth = 1) => Math.round(n.words[find(phrase, nth) + len(phrase) - 1].e * fps),
    /** frame of word i */
    wordAt: (i: number) => Math.round(n.words[i].s * fps),
  };
};
