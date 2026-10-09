// Vertical YouTube Shorts (1080x1920) cut from the King Andrew narration. Nothing new is generated: the narration is
// sliced from the chapter WAVs, the pictures and masks are the video's own, the music is a chapter cue.
//
// Shorts-specific rules:
//  - The hook headline is on screen, fully drawn, from frame 0 to the end, and a coral-tinted face is always in
//    frame, so whatever frame YouTube picks for the cover reads as a thumbnail.
//  - Text stays in the safe zone: headline y 190-470, pictures' focus y 520-1200, captions y 1230-1440.
//    YouTube covers the top ~170 px (search, menu), the bottom ~460 px (title, channel, music) and the
//    right ~130 px from y 900 down (like / comment / share buttons).
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from '../../lib/anim';
import type {Narration, Word} from '../../lib/timing';
import {Finish, Highlight, JF, PALETTES, PaletteCtx, type Place, StepCtx, usePal} from '../Kit';
import {Sfx} from '../common';

export const SW = 1080;
export const SH = 1920;

/** Full-bleed placement for the vertical frame, centred on source pixel (fx, fy) at zoom z. */
export const fillV = (size: [number, number], fx: number, fy: number, z: number): Place => {
  const sc = Math.max(SW / size[0], SH / size[1]) * z;
  return {left: Math.min(0, Math.max(SW - size[0] * sc, SW / 2 - fx * sc)), top: Math.min(0, Math.max(SH - size[1] * sc, SH / 2 - fy * sc)), scale: sc};
};

/** A slice of a chapter's narration: source file stem and the seconds to keep (cut in a pause between words). */
export type Clip = {stem: string; words: Narration; from: number; to: number};

/** Where each clip lands in the short (frames), with a short breath between clips. */
const GAP = 6;
export const layout = (clips: Clip[]) => {
  let at = 0;
  return clips.map((c) => {
    const len = Math.round((c.to - c.from) * 30);
    const r = {...c, at, len};
    at += len + GAP;
    return r;
  });
};

/** One narration (words re-timed onto the short's clock) so t.at('phrase') works across clips. */
export const joinWords = (clips: Clip[]): Narration => {
  const placed = layout(clips);
  const words: Word[] = [];
  for (const c of placed) {
    for (const w of c.words.words) {
      if (w.s >= c.from && w.e <= c.to) words.push({...w, s: w.s - c.from + c.at / 30, e: w.e - c.from + c.at / 30});
    }
  }
  const last = placed[placed.length - 1];
  return {voice: 'short', duration: (last.at + last.len) / 30, words};
};

/** Word-synced captions: chunks of up to 3 words (breaking at punctuation), the spoken word in teal. */
const Captions: React.FC<{n: Narration; y?: number}> = ({n, y = 1250}) => {
  const frame = useCurrentFrame();
  const pal = usePal();
  const t = frame / 30;
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  for (const w of n.words) {
    cur.push(w);
    if (cur.length === 3 || /[.,?!:;"”]$/.test(w.w) || w.para_end) {
      chunks.push(cur);
      cur = [];
    }
  }
  if (cur.length) chunks.push(cur);
  const i = chunks.findIndex((c, k) => t >= c[0].s - 0.05 && (k + 1 < chunks.length ? t < chunks[k + 1][0].s - 0.05 : t < c[c.length - 1].e + 0.4));
  if (i < 0) return null;
  return (
    <div style={{position: 'absolute', left: 50, top: y, width: 900, textAlign: 'center', fontFamily: JF.sans, fontWeight: 800, fontSize: 70, lineHeight: 1.15,
      color: '#fff', textShadow: '0 0 3px #000, 0 0 6px #000, 3px 3px 0 #000, -3px 3px 0 #000, 3px -3px 0 #000, -3px -3px 0 #000, 0 6px 18px rgba(0,0,0,0.8)'}}>
      {chunks[i].map((w, k) => (
        <span key={k} style={{color: t >= w.s && (k + 1 < chunks[i].length ? t < chunks[i][k + 1].s : true) ? pal.mark : '#fff'}}>{w.w.replace(/[“”"]/g, '')}{k + 1 < chunks[i].length ? ' ' : ''}</span>
      ))}
    </div>
  );
};

/** The hook: two lines of orange tape, fully drawn from frame 0, on a dark band so it reads over any picture. */
const Headline: React.FC<{lines: [string, string]; size?: number}> = ({lines, size = 92}) => (
  <>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,7,5,0.85) 0%, rgba(8,7,5,0.7) 22%, rgba(8,7,5,0) 34%)'}} />
    <Highlight text={lines[0]} x={56} y={200} size={size} at={-100} seed={901} rot={-2} />
    <Highlight text={lines[1]} x={86} y={200 + size * 1.42} size={size} at={-100} seed={903} rot={-2} />
  </>
);

/** Small source credit just above YouTube's bottom overlay. */
export const TagV: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', left: 56, top: 1462, width: 860, fontFamily: JF.mono, fontSize: 20, letterSpacing: 1, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase',
    textShadow: '0 1px 6px rgba(0,0,0,0.95)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{text}</div>
);

export const TAIL = 45;
export const shortFrames = (clips: Clip[]) => {
  const p = layout(clips);
  return p[p.length - 1].at + p[p.length - 1].len + TAIL;
};

/** Narration clips, a music bed, captions, the persistent headline, grain. `children` = the pictures (short time). */
export const ShortShell: React.FC<{clips: Clip[]; headline: [string, string]; music: {src: string; volume: number}; cuts: number[]; children: React.ReactNode}> = ({clips, headline, music, cuts, children}) => {
  const placed = layout(clips);
  const n = joinWords(clips);
  const total = shortFrames(clips);
  return (
    <PaletteCtx.Provider value={PALETTES.locked}>
      <StepCtx.Provider value={2.5}>
        <AbsoluteFill style={{background: '#0d0c09', overflow: 'hidden'}}>
          {children}
          <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(8,7,5,0.8) 0%, rgba(8,7,5,0.55) 28%, rgba(8,7,5,0) 42%)'}} />
          <Headline lines={headline} />
          <Captions n={n} />
          <Finish vignette={0.25} />
          {placed.map((c, i) => (
            <Sequence key={i} from={c.at} durationInFrames={c.len} layout="none">
              <Audio src={staticFile(`audio/${c.stem}.wav`)} startFrom={Math.round(c.from * 30)} endAt={Math.round(c.from * 30) + c.len} />
            </Sequence>
          ))}
          <Audio src={staticFile(music.src)} volume={(f) => interpolate(f, [0, 10, total - 40, total], [0, music.volume, music.volume, 0], clamp)} />
          {cuts.map((f) => <Sfx key={f} at={f} src="sfx/whoosh.wav" volume={0.26} />)}
        </AbsoluteFill>
      </StepCtx.Provider>
    </PaletteCtx.Provider>
  );
};
