// Chapter break: just the channel logo, kept quiet. The last shot fades to black, the "15 Minute History"
// wordmark fades up small, its clock ticks softly round a quarter hour, and the next chapter fades up.
// The wordmark is the one from the channel intro (Fix Everything, src/ch/Intro.tsx), same layout.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp, FONT, Highlight, PAL} from './look';

/** Frames to fade the old shot to black, and to fade the next one up from black. */
export const FADE = 10;
/** Whole break. It overlaps the last FADE frames of one chapter and the first FADE of the next. */
export const BREAK_FRAMES = 60;
/** Frames where the clock ticks. */
const TICKS = [22, 30, 38];

const Sfx: React.FC<{at: number; src: string; volume: number}> = ({at, src, volume}) => (
  <Sequence from={at} durationInFrames={60} layout="none"><Audio src={staticFile(src)} volume={volume} /></Sequence>
);

/** The logo's clock: hand-drawn teal ring, quarter ticks, coral wedge swept to `sweep` of a quarter hour. */
const Clock: React.FC<{cx: number; cy: number; r: number; sweep: number}> = ({cx, cy, r, sweep}) => {
  const a = -Math.PI / 2 + sweep * (Math.PI / 2);
  const pts: string[] = [];
  for (let i = 0; i <= 74; i++) {
    const t = (i / 70) * Math.PI * 2 - Math.PI / 2 - 0.2;
    const w = 1 + (random(`ck${i}`) - 0.5) * 0.02 + (i / 70) * 0.025;
    pts.push(`${(cx + Math.cos(t) * r * w).toFixed(1)},${(cy + Math.sin(t) * r * w).toFixed(1)}`);
  }
  const wr = r * 0.92;
  const wedge = sweep > 0 ? `M${cx},${cy} L${cx},${cy - wr} A${wr},${wr} 0 0 1 ${cx + Math.cos(a) * wr},${cy + Math.sin(a) * wr} Z` : '';
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1920} height={1080}>
      {wedge && <path d={wedge} fill={PAL.coral} opacity={0.9} />}
      <polyline points={pts.join(' ')} fill="none" stroke={PAL.teal} strokeWidth={10} strokeLinecap="round" />
      {[0, 1, 2, 3].map((q) => {
        const qa = -Math.PI / 2 + (q * Math.PI) / 2;
        return <line key={q} x1={cx + Math.cos(qa) * r * 0.78} y1={cy + Math.sin(qa) * r * 0.78} x2={cx + Math.cos(qa) * r * 0.95} y2={cy + Math.sin(qa) * r * 0.95} stroke={PAL.teal} strokeWidth={8} strokeLinecap="round" />;
      })}
      <line x1={cx} y1={cy} x2={cx + Math.cos(a) * r * 0.82} y2={cy + Math.sin(a) * r * 0.82} stroke={PAL.cream} strokeWidth={9} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={12} fill={PAL.cream} />
    </svg>
  );
};

/** The wordmark, fully built; the wedge shows `sweep` of a quarter hour. */
const Wordmark: React.FC<{sweep: number}> = ({sweep}) => {
  return (
    <>
      <Clock cx={440} cy={540} r={250} sweep={sweep} />
      <div style={{position: 'absolute', left: 240, top: 390, width: 400, textAlign: 'center', fontFamily: FONT.display, fontSize: 250, lineHeight: 1,
        color: PAL.cream, textShadow: '0 6px 24px rgba(0,0,0,0.7)'}}>15</div>
      <Highlight text="MINUTE" x={760} y={350} size={128} at={-20} seed={7} />
      <div style={{position: 'absolute', left: 770, top: 520, fontFamily: FONT.display, fontSize: 196, lineHeight: 1, color: PAL.teal, textShadow: '0 6px 26px rgba(0,0,0,0.7)'}}>HISTORY</div>
      <div style={{position: 'absolute', left: 780, top: 760, width: 820, height: 8, background: PAL.orange}} />
    </>
  );
};

/** Lay this over the end of one chapter and the start of the next (see BreakDemo for the overlap). */
export const LogoBreak: React.FC = () => {
  const f = useCurrentFrame();
  // Fade to black, fade the logo up, tick the wedge round a quarter hour, fade out, fade up the next chapter.
  const black = interpolate(f, [0, FADE, BREAK_FRAMES - FADE, BREAK_FRAMES], [0, 1, 1, 0], clamp);
  const logo = interpolate(f, [FADE - 2, FADE + 8, BREAK_FRAMES - FADE - 8, BREAK_FRAMES - FADE], [0, 1, 1, 0], clamp);
  // Three soft ticks, a third of a quarter hour each, the hand settling over 2 frames per tick.
  const sweep = TICKS.reduce((acc, t) => acc + interpolate(f, [t, t + 2], [0, 1 / TICKS.length], clamp), 0);
  return (
    <AbsoluteFill style={{background: '#000', opacity: black}}>
      <AbsoluteFill style={{opacity: logo, transform: 'scale(0.62)', transformOrigin: '945px 540px'}}>
        <Wordmark sweep={sweep} />
      </AbsoluteFill>
      {TICKS.map((t) => <Sfx key={t} at={t} src="sfx/tick_soft.wav" volume={0.18} />)}
    </AbsoluteFill>
  );
};
