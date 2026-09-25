import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {clamp, pop} from '../lib/anim';
import {C, F} from '../lib/theme';

type Dir = 'left' | 'right' | 'top' | 'bottom' | 'drop' | 'fade';

const OFF: Record<Dir, [number, number]> = {
  left: [-1500, 60],
  right: [1500, 60],
  top: [0, -1200],
  bottom: [0, 1200],
  drop: [0, 0],
  fade: [0, 0],
};

export type ScrapProps = {
  src: string;
  x: number;
  y: number;
  w: number;
  rot?: number;
  in: number;
  out?: number;
  from?: Dir;
  to?: Dir;
  /** slow camera push on this piece: scale reached at `until` */
  zoom?: {to: number; origin: string; until: number};
  /** move to a new position/size later: [frame, x, y, w] */
  move?: [number, number, number, number][];
  dim?: [number, number];
  children?: React.ReactNode;
};

/** A torn archival scrap that slides or drops onto the page, with an optional Ken Burns push. */
export const Scrap: React.FC<ScrapProps> = (p) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < p.in - 1 || (p.out !== undefined && frame > p.out + 25)) return null;
  const from = p.from ?? 'left';
  const to = p.to ?? from;
  const sIn = pop(frame, p.in, fps, 110, 17);
  const sOut = p.out === undefined ? 0 : pop(frame, p.out, fps, 140, 20);
  const [ix, iy] = OFF[from];
  const [ox, oy] = OFF[to];
  let x = p.x, y = p.y, w = p.w;
  for (const [f, mx, my, mw] of p.move ?? []) {
    const m = pop(frame, f, fps, 90, 18);
    x = x + (mx - x) * m; y = y + (my - y) * m; w = w + (mw - w) * m;
  }
  const dx = ix * (1 - sIn) + ox * sOut;
  const dy = iy * (1 - sIn) + oy * sOut;
  const dropScale = from === 'drop' ? 1 + 0.25 * (1 - sIn) : 1;
  const fadeOp = (from === 'fade' || from === 'drop' ? Math.min(1, sIn * 1.6) : 1) *
    (to === 'fade' || to === 'drop' ? 1 - Math.min(1, sOut * 1.4) : 1);
  const rot = (p.rot ?? 0) + (1 - sIn) * (from === 'right' ? 9 : from === 'left' ? -9 : 0);
  const z = p.zoom
    ? interpolate(frame, [p.in, p.zoom.until], [1, p.zoom.to], {...clamp, easing: Easing.inOut(Easing.sin)})
    : 1;
  const dim = p.dim ? interpolate(frame, [p.dim[0], p.dim[0] + 12], [1, p.dim[1]], clamp) : 1;
  const lift = from === 'drop' ? 30 * (1 - sIn) : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(${dropScale * z})`,
        transformOrigin: p.zoom?.origin ?? 'center',
        opacity: fadeOp,
        filter: `drop-shadow(${6 + lift}px ${12 + lift}px ${16 + lift}px rgba(45,28,10,0.45)) brightness(${dim})`,
      }}
    >
      <Img src={staticFile(p.src)} style={{width: '100%', display: 'block'}} />
      {p.children}
    </div>
  );
};

/** Museum-style label pinned under a scrap: NAME plus a small source line. */
export const Label: React.FC<{
  name: string;
  sub?: string;
  at: number;
  x?: number | string;
  y?: number | string;
  rot?: number;
  red?: boolean;
  size?: number;
}> = ({name, sub, at, x = '50%', y = '100%', rot = -1.5, red, size = 40}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = pop(frame, at, fps, 220, 14);
  if (frame < at) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -40%) rotate(${rot}deg) scale(${0.6 + 0.4 * s})`,
        opacity: Math.min(1, s * 2),
        background: red ? C.red : C.ink,
        color: C.paperLight,
        padding: '10px 26px 12px',
        textAlign: 'center',
        boxShadow: '3px 5px 10px rgba(0,0,0,0.35)',
        whiteSpace: 'nowrap',
      }}
    >
      <div style={{fontFamily: F.slab, fontSize: size, letterSpacing: 2, lineHeight: 1.05}}>{name}</div>
      {sub && (
        <div style={{fontFamily: F.italic, fontStyle: 'italic', fontSize: size * 0.52, opacity: 0.85, marginTop: 4}}>
          {sub}
        </div>
      )}
    </div>
  );
};

/** Small "primary source" credit tag — teaches students what they are looking at. */
export const Source: React.FC<{text: string; at: number; until?: number; x?: number | string; y?: number | string; tag?: string}> = ({
  text,
  at,
  until = Infinity,
  tag = 'PRIMARY SOURCE',
  x = 16,
  y = -44,
}) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [at, at + 10], [0, 1], clamp) * (until === Infinity ? 1 : interpolate(frame, [until, until + 8], [1, 0], clamp));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity: op,
        fontFamily: F.sc,
        fontSize: 24,
        color: C.inkSoft,
        whiteSpace: 'nowrap',
        letterSpacing: 1,
      }}
    >
      <span style={{background: tag === 'PRIMARY SOURCE' ? C.red : C.inkSoft, color: C.paperLight, padding: '2px 10px', marginRight: 10, fontSize: 20}}>
        {tag}
      </span>
      {text}
    </div>
  );
};
