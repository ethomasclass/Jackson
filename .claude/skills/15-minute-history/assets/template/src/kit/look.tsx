// The "15 Minute History" field-notebook look (ported from the Fix Everything kit, src/jh/Kit.tsx there):
// B&W archival pictures on dark desk paper, teal lines, orange torn-highlighter titles, coral subject,
// Nanum Pen Script notes, IBM Plex Mono tags, graphics stepped at ~12 fps, film grain.
import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';

export const PAL = {
  teal: '#2FE0C4',
  orange: '#FF9F1C',
  coral: '#FF6F61',
  cream: '#f4efe6',
  bone: '#EDE7DC',
  ink: '#111111',
  night: '#0d0c09',
};

export const FONT = {
  display: '"Abril Fatface", serif',
  hand: '"Nanum Pen Script", cursive',
  mono: '"IBM Plex Mono", monospace',
  sans: '"Inter", sans-serif',
};

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Graphics step (frames). 2.5 = 12 fps over a 30 fps camera, as in the chapters. */
export const StepCtx = React.createContext<number>(2.5);
export const useGFrame = () => {
  const f = useCurrentFrame();
  const step = React.useContext(StepCtx);
  return step ? Math.floor(f / step) * step : f;
};

/** Dark notebook-paper backdrop. */
export const DarkPaper: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 45% 40%, #2a2620 0%, #16140f 70%, #0d0c09 100%)'}}>
    <AbsoluteFill style={{opacity: 0.12, backgroundImage: 'linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)', backgroundSize: '100% 64px'}} />
  </AbsoluteFill>
);

/** Torn-edged highlighter box behind Abril type; wipes on from the left over 8 frames. `box: null` = plain type. */
export const Highlight: React.FC<{text: string; x: number; y: number; size?: number; at?: number; seed?: number; rot?: number; box?: string | null; color?: string}> = ({
  text, x, y, size = 96, at = 0, seed = 3, rot = -2, box = PAL.orange, color = PAL.ink,
}) => {
  const frame = useGFrame();
  const wipe = interpolate(frame, [at, at + 8], [0, 1], clamp);
  const pts: string[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) pts.push(`${(i / steps) * 100}% ${random(`t${seed}${i}`) * 9}%`);
  for (let i = steps; i >= 0; i--) pts.push(`${(i / steps) * 100}% ${100 - random(`b${seed}${i}`) * 9}%`);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)`, transformOrigin: 'left center'}}>
      <div style={{position: 'relative', padding: `${size * 0.1}px ${size * 0.22}px ${size * 0.06}px`}}>
        {box && <div style={{position: 'absolute', inset: 0, background: box, clipPath: `polygon(${pts.join(',')})`, transformOrigin: 'left', transform: `scaleX(${wipe})`}} />}
        <div style={{position: 'relative', fontFamily: FONT.display, fontSize: size, lineHeight: 1.05, color, whiteSpace: 'nowrap',
          textShadow: box ? undefined : '0 6px 24px rgba(0,0,0,0.7)', opacity: interpolate(frame, [at + 3, at + 7], [0, 1], clamp)}}>{text}</div>
      </div>
    </div>
  );
};

/** Handwritten note, written on left to right from `at` over `dur` frames. */
export const Note: React.FC<{text: string; x: number; y: number; size?: number; rot?: number; color?: string; at?: number; dur?: number}> = ({
  text, x, y, size = 46, rot = -4, color = PAL.teal, at = 0, dur = 10,
}) => {
  const frame = useGFrame();
  if (frame < at) return null;
  const p = interpolate(frame, [at, at + dur], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: x, top: y, fontFamily: FONT.hand, fontSize: size * 1.55, color, transform: `rotate(${rot}deg)`, whiteSpace: 'nowrap',
      textShadow: '0 0 2px #111, 0 0 4px #111, 2px 2px 0 #111, -2px 2px 0 #111, 2px -2px 0 #111, -2px -2px 0 #111, 0 3px 12px rgba(0,0,0,0.7)',
      clipPath: `inset(-20% ${(1 - p) * 100}% -20% -5%)`}}>{text}</div>
  );
};

/** Source tag, bottom left. */
export const Tag: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', left: 44, top: 1030, fontFamily: FONT.mono, fontSize: 18, letterSpacing: 1, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase',
    textShadow: '0 1px 6px rgba(0,0,0,0.9)'}}>{text}</div>
);

/** Vignette plus film grain re-seeded every 2 frames. */
export const Finish: React.FC<{vignette?: number}> = ({vignette = 0.3}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 40;
  return (
    <>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,${vignette}) 100%)`}} />
      <AbsoluteFill style={{opacity: 0.13, mixBlendMode: 'overlay'}}>
        <svg width="100%" height="100%">
          <filter id={`g3${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter={`url(#g3${seed})`} />
        </svg>
      </AbsoluteFill>
    </>
  );
};
