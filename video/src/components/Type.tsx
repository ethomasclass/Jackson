import React from 'react';
import {Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, pop} from '../lib/anim';
import {C, F} from '../lib/theme';
import type {Timeline} from '../lib/timing';

type Pos = {x: number; y: number; w?: number; align?: 'left' | 'center' | 'right'};

/** Wood-type word that slams onto the page like a printer's stamp (with a thud). */
export const Stamp: React.FC<
  Pos & {
    text: React.ReactNode;
    at: number;
    out?: number;
    size?: number;
    color?: string;
    font?: string;
    rot?: number;
    sfx?: boolean;
    heavy?: boolean;
    style?: React.CSSProperties;
  }
> = ({text, at, out, x, y, w, align = 'center', size = 120, color = C.ink, font, rot = -2, sfx = true, heavy, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at - 1) return null;
  const s = pop(frame, at, fps, 420, 20);
  const o = out === undefined ? 1 : interpolate(frame, [out, out + 8], [1, 0], clamp);
  if (o <= 0) return null;
  const scale = 1 + 1.3 * (1 - s);
  return (
    <>
      {sfx && (
        <Sequence from={at} durationInFrames={20} layout="none">
          <Audio src={staticFile('sfx/stamp.wav')} volume={0.55} />
        </Sequence>
      )}
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: w,
          textAlign: align,
          transform: `translate(${align === 'center' ? '-50%' : '0'}, -50%) rotate(${rot}deg) scale(${scale})`,
          transformOrigin: align === 'left' ? 'left center' : 'center',
          opacity: Math.min(1, s * 3) * o,
          fontFamily: font ?? F.slab,
          fontSize: size,
          lineHeight: 1,
          color,
          filter: `url(#${heavy ? 'inkHeavy' : 'ink'})`,
          whiteSpace: 'nowrap',
          ...style,
        }}
      >
        {text}
      </div>
    </>
  );
};

/** A line of text that rises and fades in, optionally leaving at `out`. */
export const Rise: React.FC<
  Pos & {at: number; out?: number; children: React.ReactNode; size?: number; font?: string; color?: string; style?: React.CSSProperties}
> = ({at, out, x, y, w, align = 'left', children, size = 56, font, color = C.ink, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at - 1) return null;
  const s = pop(frame, at, fps, 160, 18);
  const o = out === undefined ? 1 : interpolate(frame, [out, out + 10], [1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        textAlign: align,
        transform: `translate(${align === 'center' ? '-50%' : '0'}, ${(1 - s) * 40}px)`,
        opacity: Math.min(1, s * 1.5) * o,
        fontFamily: font ?? F.body,
        fontSize: size,
        lineHeight: 1.15,
        color,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Red emphasis inside running text. */
export const Em: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.red}) => (
  <span style={{color, fontWeight: 700}}>{children}</span>
);

/**
 * Vocabulary card: term, pronunciation, part of speech and a definition whose words appear
 * as the narrator says them. Every vocab word in the series uses this same card.
 */
export const VocabCard: React.FC<{
  term: string;
  say: string;
  pos: string;
  /** narration phrase where the definition starts and its word count (read aloud, synced) */
  defFrom?: string;
  defWords?: number;
  /** or a written definition the narrator does not read, faded in whole */
  def?: string;
  /** band label: VOCABULARY for words, KEY EVENT / KEY TERM for named things */
  label?: string;
  at: number;
  out?: number;
  tl: Timeline;
  x: number;
  y: number;
  w?: number;
  termSize?: number;
}> = ({term, say, pos, defFrom, defWords = 0, def, label = 'VOCABULARY', at, out, tl, x, y, w = 760, termSize = 150}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at - 1 || (out !== undefined && frame > out + 30)) return null;
  const s = pop(frame, at, fps, 120, 16);
  const sOut = out === undefined ? 0 : pop(frame, out, fps, 140, 20);
  const defs = defFrom ? tl.words.slice(tl.idx(defFrom), tl.idx(defFrom) + defWords) : [];
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        transform: `translate(${(1 - s) * 1300 + sOut * 1300}px, 0) rotate(${1.5 - (1 - s) * 6}deg)`,
        background: C.paperLight,
        boxShadow: '8px 14px 24px rgba(45,28,10,0.45)',
        border: `3px solid ${C.ink}`,
        outline: `1px solid ${C.ink}`,
        outlineOffset: -12,
        padding: '0 0 34px',
      }}
    >
      <Sequence from={at} durationInFrames={25} layout="none">
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.4} />
      </Sequence>
      <div
        style={{
          background: C.red,
          color: C.paperLight,
          fontFamily: F.slab,
          fontSize: 30,
          letterSpacing: 8,
          padding: '12px 36px',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>{label}</span>
        {w >= 700 && <span style={{fontFamily: F.sc, letterSpacing: 2}}>{label === 'VOCABULARY' ? '✦ word to know ✦' : '✦ remember this ✦'}</span>}
      </div>
      <div style={{padding: '18px 44px 0'}}>
        <div style={{fontFamily: F.fat, fontSize: termSize, lineHeight: 1, color: C.ink}}>{term}</div>
        <div style={{fontFamily: F.italic, fontStyle: 'italic', fontSize: 36, color: C.inkSoft, marginTop: 6}}>
          {say} &nbsp;·&nbsp; {pos}
        </div>
        <div style={{height: 3, background: C.ink, margin: '20px 0 18px', width: 180}} />
        <div style={{fontFamily: F.body, fontSize: 46, lineHeight: 1.3, color: C.ink}}>
          {def ? (
            <span style={{opacity: interpolate(frame, [at + 10, at + 22], [0, 1], clamp)}}>{def}</span>
          ) : (
            defs.map((d, i) => {
              const f = Math.round(d.s * fps);
              const op = interpolate(frame, [f - 2, f + 4], [0.12, 1], clamp);
              return (
                <span key={i} style={{opacity: op}}>
                  {d.w}{' '}
                </span>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

/** Corner date tag that keeps students oriented in time; flips when the year changes. */
export const DateTag: React.FC<{years: [number, string][]; out?: number}> = ({years, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  let cur = -1;
  years.forEach(([f], i) => {
    if (frame >= f) cur = i;
  });
  if (cur < 0) return null;
  const [f, label] = years[cur];
  const flip = pop(frame, f, fps, 200, 16);
  const o = out === undefined ? 1 : interpolate(frame, [out, out + 10], [1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: 56,
        bottom: 44,
        opacity: o * Math.min(1, flip * 2),
        transform: `perspective(600px) rotateX(${(1 - flip) * 90}deg) rotate(-2deg)`,
        background: C.ink,
        color: C.paperLight,
        padding: '6px 22px 10px',
        boxShadow: '3px 5px 10px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{fontFamily: F.sc, fontSize: 20, letterSpacing: 4, opacity: 0.8}}>THE YEAR</div>
      <div style={{fontFamily: F.fat, fontSize: 58, lineHeight: 1}}>{label}</div>
    </div>
  );
};
