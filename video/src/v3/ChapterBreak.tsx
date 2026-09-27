// Chapter break for the 15 Minute History look: the last scene turns away like a notebook page onto a
// divider page. On it, the channel clock (the logo's hand-drawn teal ring) advances its coral wedge to
// how far into the 15 minutes we are, the chapter number stamps in the middle, and the title and dates
// land beside it. Then the divider turns away onto the next chapter.
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp, DarkPaper, Finish, FONT, Highlight, Note, PAL, useGFrame} from './look';

/** Frames a page takes to turn away. */
export const TURN = 14;
/** Length of a chapter break, turn-out included. */
export const BREAK_FRAMES = 66;

export type BreakInfo = {
  n: number;
  title: string;
  dates?: string;
  /** Minutes into the video where the previous chapter began and where this one begins. */
  fromMin: number;
  toMin: number;
  /** Heavy chapter: teal lines only, plain cream title, no coral. */
  quiet?: boolean;
};

const Sfx: React.FC<{at: number; src: string; volume: number}> = ({at, src, volume}) => (
  <Sequence from={at} durationInFrames={60} layout="none"><Audio src={staticFile(src)} volume={volume} /></Sequence>
);

/** Clockwise from 12 o'clock, `a` in turns. */
const pt = (cx: number, cy: number, r: number, a: number) => [cx + r * Math.sin(a * 2 * Math.PI), cy - r * Math.cos(a * 2 * Math.PI)];

const Clock: React.FC<{cx: number; cy: number; r: number; from: number; to: number; quiet?: boolean}> = ({cx, cy, r, from, to, quiet}) => {
  const g = useGFrame();
  // Ring: 70 segments plus 6 of overshoot, ±1% wobble, growing 2.5% over the stroke (the logo's ring).
  const ring: string[] = [];
  const N = 70;
  for (let i = 0; i <= N + 6; i++) {
    const t = i / N;
    const rr = r * (1 + 0.01 * (random(`cw${i}`) - 0.5) * 2) * (1 + 0.025 * t);
    const [x, y] = pt(cx, cy, rr, t - 0.03);
    ring.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const draw = interpolate(g, [0, 8], [0, 1], clamp);
  const frac = interpolate(g, [10, 26], [from, to], {...clamp, easing: Easing.inOut(Easing.quad)});
  const wr = r * 0.92;
  const [ex, ey] = pt(cx, cy, wr, frac);
  const wedge = frac <= 0 ? '' : `M${cx},${cy} L${cx},${cy - wr} A${wr},${wr} 0 ${frac > 0.5 ? 1 : 0} 1 ${ex},${ey} Z`;
  const arc = frac <= 0 ? '' : `M${cx},${cy - r * 0.8} A${r * 0.8},${r * 0.8} 0 ${frac > 0.5 ? 1 : 0} 1 ${pt(cx, cy, r * 0.8, frac).join(',')}`;
  const [hx, hy] = pt(cx, cy, r * 0.82, frac);
  const [bx, by] = pt(cx, cy, r * 0.5, frac);
  const ticks = draw >= 1;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1920} height={1080}>
      {!quiet && wedge && <path d={wedge} fill={PAL.coral} opacity={0.9} />}
      {quiet && arc && <path d={arc} fill="none" stroke={PAL.teal} strokeWidth={14} strokeLinecap="round" opacity={0.55} />}
      <polyline points={ring.join(' ')} fill="none" stroke={PAL.teal} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      {ticks && [0, 0.25, 0.5, 0.75].map((a) => {
        const [x1, y1] = pt(cx, cy, r * 0.78, a);
        const [x2, y2] = pt(cx, cy, r * 0.95, a);
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={PAL.teal} strokeWidth={8} strokeLinecap="round" />;
      })}
      {ticks && <>
        {/* Only the outer part of the hand, so it never crosses the chapter number. */}
        <line x1={bx} y1={by} x2={hx} y2={hy} stroke={PAL.cream} strokeWidth={9} strokeLinecap="round" />
      </>}
    </svg>
  );
};

/** Stamp scale 1.35 -> 0.95 -> 1 over 6 frames. */
const stamp = (g: number, at: number) => interpolate(g, [at, at + 3, at + 6], [1.35, 0.95, 1], clamp);

/** The divider page itself (BREAK_FRAMES long; the last TURN frames are its own turn-out, done by the caller). */
export const ChapterCard: React.FC<{info: BreakInfo}> = ({info}) => {
  const frame = useCurrentFrame();
  const g = useGFrame();
  const {n, title, dates, fromMin, toMin, quiet} = info;
  const cx = 500;
  const cy = 540;
  const r = 230;
  const size = Math.min(124, 1000 / (title.length * 0.64));
  const push = interpolate(frame, [0, BREAK_FRAMES], [1, 1.035]);
  return (
    <AbsoluteFill style={{background: PAL.night}}>
      <DarkPaper />
      <AbsoluteFill style={{transform: `scale(${push})`}}>
        <Clock cx={cx} cy={cy} r={r} from={fromMin / 15} to={toMin / 15} quiet={quiet} />
        {g >= 12 && (
          <div style={{position: 'absolute', left: cx - 200, top: cy - 90, width: 400, textAlign: 'center', fontFamily: FONT.display, fontSize: 150, lineHeight: 1,
            color: PAL.cream, textShadow: '0 6px 24px rgba(0,0,0,0.85), 0 0 3px #000', transform: `scale(${stamp(g, 12)})`}}>{String(n).padStart(2, '0')}</div>
        )}
        <div style={{position: 'absolute', left: 840, top: 390, fontFamily: FONT.mono, fontSize: 26, letterSpacing: 8, color: 'rgba(244,239,230,0.75)',
          opacity: interpolate(g, [6, 12], [0, 1], clamp)}}>CHAPTER {n} · {Math.floor(toMin)}:{String(Math.round((toMin % 1) * 60)).padStart(2, '0')}</div>
        <Highlight text={title.toUpperCase()} x={820} y={450} size={size} at={16} seed={n * 7} box={quiet ? null : PAL.orange} color={quiet ? PAL.cream : PAL.ink} />
        {dates && <Note text={dates} x={870} y={460 + size * 1.25 + 30} size={50} rot={-5} at={24} dur={10} />}
      </AbsoluteFill>
      <Finish vignette={0.45} />
      <Sfx at={10} src="sfx/tick.wav" volume={0.45} />
      <Sfx at={16} src="sfx/stamp.wav" volume={quiet ? 0.18 : 0.3} />
      {dates && <Sfx at={22} src="sfx/marker_tick.wav" volume={0.2} />}
    </AbsoluteFill>
  );
};

/**
 * Wrap a layer that turns away like a notebook page, hinged on the left edge, starting at `at`.
 * Stepped at 15 fps so it moves like paper, with a sheen on the lifting page and a shadow on the page below.
 */
export const PageTurn: React.FC<{at: number; children: React.ReactNode; sound?: boolean}> = ({at, children, sound = true}) => {
  const f = useCurrentFrame();
  const fs = Math.floor(f / 2) * 2;
  if (f >= at + TURN) return null;
  const p = interpolate(fs, [at, at + TURN], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const ang = 95 * p;
  return (
    <AbsoluteFill style={{perspective: 2600, perspectiveOrigin: '0% 50%'}}>
      {f >= at && p > 0 && (
        <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(0,0,0,${0.75 * (1 - p)}) 0%, rgba(0,0,0,${0.35 * (1 - p)}) 40%, transparent 85%)`}} />
      )}
      <AbsoluteFill style={{transformOrigin: '0% 50%', transform: `rotateY(${ang}deg)`, backfaceVisibility: 'hidden', boxShadow: p > 0 ? `0 0 ${60 * p}px rgba(0,0,0,0.8)` : undefined}}>
        {children}
        {p > 0 && <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(0,0,0,${0.5 * p}) 0%, rgba(255,250,240,${0.18 * Math.sin(p * Math.PI)}) 70%, rgba(0,0,0,${0.3 * p}) 100%)`}} />}
      </AbsoluteFill>
      {sound && <Sfx at={at - 2} src="sfx/page_turn.wav" volume={0.45} />}
    </AbsoluteFill>
  );
};
