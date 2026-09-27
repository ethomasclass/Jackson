// Chapter break: just the channel logo. A clock-hand sweep wipes the "15 Minute History" wordmark in over
// the last shot, the coral quarter-hour wedge ticks round, and a second sweep uncovers the next chapter.
// The wordmark is the one from the channel intro (Fix Everything, src/ch/Intro.tsx), same layout.
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp, DarkPaper, Finish, FONT, Highlight, PAL, useGFrame} from './look';

/** Frames the sweep takes to cover the old shot, and to uncover the new one. */
export const WIPE = 10;
/** Whole break. The next chapter starts underneath at BREAK_FRAMES - WIPE. */
export const BREAK_FRAMES = 44;

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

/** The wordmark, fully built except for the wedge, which sweeps from `sweepAt`. */
const Wordmark: React.FC<{sweepAt: number}> = ({sweepAt}) => {
  const g = useGFrame();
  const sweep = interpolate(g, [sweepAt, sweepAt + 14], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
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

/** Centre of the logo's clock on screen (the wordmark is scaled about 945,540); the sweeps pivot here. */
const PIVOT = {x: 945 + (440 - 945) * 0.86, y: 540};

/** Clockwise reveal from 12 o'clock around the clock: `deg` of the circle shown (0-360). */
const sweepMask = (deg: number, invert = false): React.CSSProperties => {
  const g = invert
    ? `conic-gradient(from 0deg at ${PIVOT.x}px ${PIVOT.y}px, transparent 0deg ${deg}deg, #000 ${deg}deg 360deg)`
    : `conic-gradient(from 0deg at ${PIVOT.x}px ${PIVOT.y}px, #000 0deg ${deg}deg, transparent ${deg}deg 360deg)`;
  return {WebkitMaskImage: g, maskImage: g};
};

/** The clock hand riding the leading edge of a sweep. */
const Hand: React.FC<{deg: number}> = ({deg}) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
      <line x1={PIVOT.x} y1={PIVOT.y} x2={PIVOT.x + Math.cos(a) * 2000} y2={PIVOT.y + Math.sin(a) * 2000} stroke={PAL.cream} strokeWidth={9} strokeLinecap="round" />
    </svg>
  );
};

/** Lay this over the end of one chapter and the start of the next (see BreakDemo for the overlap). */
export const LogoBreak: React.FC = () => {
  const f = useCurrentFrame();
  const inDeg = interpolate(f, [0, WIPE], [0, 360], {...clamp, easing: Easing.inOut(Easing.quad)});
  const outStart = BREAK_FRAMES - WIPE;
  const outDeg = interpolate(f, [outStart, BREAK_FRAMES], [0, 360], {...clamp, easing: Easing.inOut(Easing.quad)});
  const mask = f < outStart ? (inDeg < 360 ? sweepMask(inDeg) : {}) : sweepMask(outDeg, true);
  const push = 0.86;
  const edge = f < WIPE ? inDeg : f >= outStart ? outDeg : null;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: PAL.night, ...mask}}>
        <DarkPaper />
        <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '945px 540px'}}>
          <Wordmark sweepAt={WIPE - 2} />
        </AbsoluteFill>
        <Finish vignette={0.45} />
      </AbsoluteFill>
      {edge !== null && edge > 0 && edge < 360 && <Hand deg={edge} />}
      <Sfx at={0} src="sfx/whoosh.wav" volume={0.35} />
      <Sfx at={WIPE} src="sfx/tick.wav" volume={0.45} />
      <Sfx at={WIPE + 6} src="sfx/tick.wav" volume={0.45} />
      <Sfx at={WIPE + 12} src="sfx/tick.wav" volume={0.45} />
      <Sfx at={outStart} src="sfx/whoosh.wav" volume={0.35} />
    </AbsoluteFill>
  );
};
