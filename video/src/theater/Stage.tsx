import React from 'react';
import {AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from '../lib/anim';
import {P} from '../lib/theme';

// The toy theater. Everything on stage is laid out in the 1920x1080 frame of the printed
// proscenium (public/v2/scenery/proscenium.png), whose stage opening is this rectangle:
export const OPEN = {l: 242, t: 222, r: 1676, b: 940};
export const STAGE_CX = (OPEN.l + OPEN.r) / 2;

/** Camera keyframes: [frame, zoom, x, y] where (x, y) is the stage point kept centred. */
export type CamKey = [number, number, number, number];

const lerpKeys = (frame: number, keys: CamKey[]) => {
  if (frame <= keys[0][0]) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    const [f1] = keys[i];
    const [f0] = keys[i - 1];
    if (frame <= f1) {
      const t = interpolate(frame, [f0, f1], [0, 1], clamp);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      return keys[i - 1].map((v, j) => (j === 0 ? frame : v + (keys[i][j] - v) * e)) as CamKey;
    }
  }
  return keys[keys.length - 1];
};

/** Shake: decaying jolts at the given frames (cannon, impacts). */
const shakeAt = (frame: number, hits: number[], amp = 14) => {
  let dx = 0, dy = 0, r = 0;
  for (const h of hits) {
    const f = frame - h;
    if (f >= 0 && f < 18) {
      const a = amp * Math.exp(-f / 4.5);
      dx += Math.sin(f * 2.1 + h) * a;
      dy += Math.cos(f * 2.9 + h) * a * 0.6;
      r += Math.sin(f * 1.7) * a * 0.02;
    }
  }
  return {dx, dy, r};
};

/**
 * The room and the camera. Children are the stage layers (backcloths, waves, puppets, lights);
 * the printed proscenium and footlights are drawn over them, then `front` (curtain, signs that
 * hang in front of the proscenium) on top of that.
 */
export const Theater: React.FC<{
  cam: CamKey[];
  shake?: number[];
  children: React.ReactNode;
  front?: React.ReactNode;
  footlights?: number;
}> = ({cam, shake = [], children, front, footlights = 1}) => {
  const frame = useCurrentFrame();
  const [, z, x, y] = lerpKeys(frame, cam);
  const s = shakeAt(frame, shake);
  // a hand-held breath so the stage is never frozen
  const bx = Math.sin(frame / 71) * 3, by = Math.cos(frame / 93) * 2;
  const tx = 960 - x * z + bx + s.dx;
  const ty = 540 - y * z + by + s.dy;
  return (
    <AbsoluteFill style={{background: '#140D09', overflow: 'hidden'}}>
      {/* the dark room around the little theater, warm spill from the footlights */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 88%, rgba(160,90,30,0.35) 0%, rgba(20,13,9,0) 60%)'}} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          transformOrigin: '0 0',
          transform: `translate(${tx}px, ${ty}px) scale(${z}) rotate(${s.r}deg)`,
        }}
      >
        <div style={{position: 'absolute', left: OPEN.l - 20, top: OPEN.t - 30, width: OPEN.r - OPEN.l + 40, height: OPEN.b - OPEN.t + 50, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: -(OPEN.l - 20), top: -(OPEN.t - 30), width: 1920, height: 1080}}>{children}</div>
        </div>
        <Img src={staticFile('v2/scenery/proscenium.png')} style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080}} />
        <Footlights level={footlights} />
        {front}
      </div>
      <Vignette />
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none'}} />
);

/** Warm flickering glow above the painted footlight shells. */
const Footlights: React.FC<{level: number}> = ({level}) => {
  const frame = useCurrentFrame();
  const xs = [300, 440, 580, 720, 860, 1000, 1140, 1280, 1420, 1560];
  return (
    <>
      {xs.map((x, i) => {
        const fl = 0.85 + 0.15 * random(`fl${i}-${Math.floor(frame / 3)}`);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - 90,
              top: 880,
              width: 180,
              height: 110,
              background: 'radial-gradient(ellipse at 50% 70%, rgba(255,214,140,0.55) 0%, rgba(255,170,60,0.18) 40%, rgba(255,150,40,0) 70%)',
              opacity: level * fl,
              mixBlendMode: 'screen',
            }}
          />
        );
      })}
    </>
  );
};

/**
 * A painted backcloth. It drops from the flies at `at` (bouncing on its ropes), covering the
 * cloth behind it: the toy-theater scene change.
 */
export const Backcloth: React.FC<{src: string; at?: number; horizon?: number}> = ({src, at = -100}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {stiffness: 120, damping: 11, mass: 1}});
  const w = OPEN.r - OPEN.l + 60;
  const h = (w * 9) / 16;
  const top = OPEN.t - 40 - (1 - s) * (h + 40);
  return (
    <div style={{position: 'absolute', left: OPEN.l - 30, top, width: w, height: h, filter: 'blur(0.6px) saturate(1.05)'}}>
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      {/* batten at the bottom of the cloth */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: -6, height: 10, background: P.wood, opacity: s < 0.99 ? 1 : 0}} />
    </div>
  );
};

/** One row of painted cut-out waves, rocking on its slot. */
export const WaveRow: React.FC<{y: number; color: string; dark: string; phase?: number; amp?: number; speed?: number; scale?: number}> = ({
  y,
  color,
  dark,
  phase = 0,
  amp = 1,
  speed = 1,
  scale = 1,
}) => {
  const frame = useCurrentFrame();
  const t = (frame / 30) * speed + phase;
  const dx = Math.sin(t * 1.1) * 26 * amp;
  const dy = Math.sin(t * 1.7 + 1) * 6 * amp;
  const rot = Math.sin(t * 0.9 + 2) * 0.8 * amp;
  const W = 1700, n = 11, wl = W / n, hh = 60 * scale;
  let d = `M -60 ${hh}`;
  for (let i = 0; i < n + 1; i++) {
    const x0 = -60 + i * wl;
    // a curling crest: steep front, long back
    d += ` C ${x0 + wl * 0.35} ${hh - 70 * scale}, ${x0 + wl * 0.75} ${hh - 60 * scale}, ${x0 + wl * 0.72} ${hh - 20 * scale}`;
    d += ` C ${x0 + wl * 0.7} ${hh}, ${x0 + wl * 0.9} ${hh + 4}, ${x0 + wl} ${hh}`;
  }
  d += ` L ${W + 100} 400 L -60 400 Z`;
  return (
    <svg
      width={W + 200}
      height={400}
      style={{position: 'absolute', left: OPEN.l - 120, top: y - hh, transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, filter: 'drop-shadow(0 -6px 8px rgba(0,0,0,0.35))'}}
    >
      <defs>
        <linearGradient id={`wg${y}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} />
          <stop offset="0.5" stopColor={dark} />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#wg${y})`} stroke={P.ink} strokeWidth={4} />
      {/* cream crest highlights, like the painted foam on the backcloth */}
      {Array.from({length: n + 1}, (_, i) => {
        const x0 = -60 + i * wl;
        return <path key={i} d={`M ${x0 + wl * 0.3} ${hh - 42 * scale} Q ${x0 + wl * 0.58} ${hh - 66 * scale}, ${x0 + wl * 0.7} ${hh - 30 * scale}`} fill="none" stroke={P.cream} strokeWidth={6} strokeLinecap="round" />;
      })}
      {Array.from({length: 18}, (_, i) => (
        <path key={`h${i}`} d={`M ${i * 100 + 20} ${hh + 30 + (i % 3) * 14} q 30 -10 60 0`} fill="none" stroke={P.ink} strokeOpacity={0.45} strokeWidth={3} />
      ))}
    </svg>
  );
};

export type WashKey = [number, string, number];

/**
 * Stage lighting: a colour wash multiplied over the stage, keyed [frame, colour, strength].
 * Sits inside the stage (under the proscenium) so the theater front stays lit by the house.
 */
export const Wash: React.FC<{keys: WashKey[]}> = ({keys}) => {
  const frame = useCurrentFrame();
  let a = keys[0], b = keys[0];
  for (let i = 0; i < keys.length; i++) {
    if (keys[i][0] <= frame) a = keys[i];
    if (keys[i][0] >= frame) {
      b = keys[i];
      break;
    }
    b = keys[i];
  }
  const t = a[0] === b[0] ? 1 : interpolate(frame, [a[0], b[0]], [0, 1], clamp);
  return (
    <>
      <AbsoluteFill style={{background: a[1], opacity: a[2] * (1 - t), mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: b[1], opacity: b[2] * t, mixBlendMode: 'multiply'}} />
    </>
  );
};

/** A follow-spot: everything outside a soft circle goes dark. */
export const Spot: React.FC<{x: number; y: number; r: number; from: number; to: number; strength?: number; tint?: string}> = ({
  x,
  y,
  r,
  from,
  to,
  strength = 0.85,
  tint = 'rgba(255,236,190,0.18)',
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [from, from + 10, to - 8, to], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  const rr = r * (1 + 0.02 * Math.sin(frame / 7));
  return (
    <>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${x}px ${y}px, rgba(0,0,0,0) ${rr * 0.7}px, rgba(5,6,18,${strength}) ${rr}px)`,
          opacity: o,
        }}
      />
      <AbsoluteFill style={{background: `radial-gradient(circle at ${x}px ${y}px, ${tint} 0px, rgba(0,0,0,0) ${rr}px)`, opacity: o, mixBlendMode: 'screen'}} />
    </>
  );
};

/** Muzzle flash lighting the whole stage for a few frames. */
export const Flash: React.FC<{at: number[]; color?: string}> = ({at, color = '#FFE2A0'}) => {
  const frame = useCurrentFrame();
  let o = 0;
  for (const a of at) {
    const f = frame - a;
    if (f >= 0 && f < 10) o = Math.max(o, interpolate(f, [0, 2, 10], [0.2, 0.5, 0], clamp));
  }
  if (o <= 0) return null;
  return <AbsoluteFill style={{background: color, opacity: o, mixBlendMode: 'screen'}} />;
};

/** The painted drop curtain. open(frame) 0 = down, 1 = flown out. */
export const DropCurtain: React.FC<{keys: [number, number][]}> = ({keys}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f, target] = keys[i];
    const prev = keys[i - 1][1];
    const s = spring({frame: frame - f, fps, config: {stiffness: 60, damping: 14, mass: 1.2}});
    if (frame >= f) v = prev + (target - prev) * s;
  }
  const h = OPEN.b - OPEN.t + 60;
  return (
    <div style={{position: 'absolute', left: OPEN.l - 30, top: OPEN.t - 40 - v * (h + 20), width: OPEN.r - OPEN.l + 60, height: h, boxShadow: '0 16px 30px rgba(0,0,0,0.5)'}}>
      <Img src={staticFile('v2/scenery/drop_curtain.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
  );
};
