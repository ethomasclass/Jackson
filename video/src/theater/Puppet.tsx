import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from '../lib/anim';
import {F, P} from '../lib/theme';

type Way = 'left' | 'right' | 'trap' | 'fly' | 'fade';

/** [frame, x, y] moves, each travelled like a slide pushed along its groove. */
export type Move = [number, number, number];

export type PuppetProps = {
  src: string;
  /** centre x and baseline y (bottom edge of the card) in stage coordinates */
  x: number;
  y: number;
  w: number;
  in: number;
  out?: number;
  from?: Way;
  to?: Way;
  move?: Move[];
  /** where the operator's wire comes from */
  rod?: 'below' | 'left' | 'right' | 'above' | 'none';
  /** ships roll, people bob */
  rock?: number;
  bob?: number;
  flip?: boolean;
  /** extra rotation (deg) at a frame, e.g. a hit: [frame, degrees, sink px] */
  hit?: [number, number, number][];
  /** 0..1 silhouette (lights out / backlit) */
  silhouette?: (f: number) => number;
  seed?: number;
  z?: number;
  children?: React.ReactNode;
};

const OFF = 1300;

/**
 * A flat paper cut-out on a wire, the way toy-theater figures were worked from the wings.
 * Cream card edge, a sliver of card thickness, a shadow thrown up onto the backcloth by the
 * footlights, and the small jerks of a hand pushing it along its groove.
 */
export const Puppet: React.FC<PuppetProps> = (p) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < p.in - 1 || (p.out !== undefined && frame > p.out + 40)) return null;
  const from = p.from ?? 'left';
  const to = p.to ?? (from === 'left' ? 'left' : from === 'right' ? 'right' : from);
  const sIn = spring({frame: frame - p.in, fps, config: {stiffness: 70, damping: 16, mass: 1}});
  const sOut = p.out === undefined ? 0 : spring({frame: frame - p.out, fps, config: {stiffness: 70, damping: 18, mass: 1}});
  let x = p.x, y = p.y;
  for (const [f, mx, my] of p.move ?? []) {
    const m = spring({frame: frame - f, fps, config: {stiffness: 55, damping: 16, mass: 1}});
    x += (mx - x) * m;
    y += (my - y) * m;
  }
  const off = (way: Way): [number, number] =>
    way === 'left' ? [-OFF - p.w / 2, 0] : way === 'right' ? [OFF + p.w / 2, 0] : way === 'trap' ? [0, 700] : way === 'fly' ? [0, -900] : [0, 0];
  const [ix, iy] = off(from);
  const [ox, oy] = off(to);
  const dx = ix * (1 - sIn) + ox * sOut;
  const dy = iy * (1 - sIn) + oy * sOut;
  const moving = Math.abs(1 - sIn) + sOut > 0.02 && sOut < 0.98;
  const seed = p.seed ?? 0;
  // the hand on the wire: small judders while travelling, a gentle rock or bob at rest
  const judder = moving ? Math.sin(frame * 1.9 + seed) * 3 : 0;
  const rock = (p.rock ?? 0) * Math.sin(frame / 22 + seed);
  const bob = (p.bob ?? 0) * Math.sin(frame / 15 + seed * 2);
  let hitRot = 0, sink = 0;
  for (const [f, deg, s] of p.hit ?? []) {
    const k = frame - f;
    if (k >= 0) {
      const e = Math.exp(-k / 16);
      hitRot += deg * e * Math.cos(k / 3.2);
      sink += s * (k < 6 ? k / 6 : Math.exp(-(k - 6) / 40));
    }
  }
  const lean = (1 - sIn) * (from === 'left' ? 6 : from === 'right' ? -6 : 0) + sOut * (to === 'left' ? -6 : to === 'right' ? 6 : 0);
  const fade = from === 'fade' ? sIn : 1;
  const fadeOut = to === 'fade' ? 1 - sOut : 1;
  const sil = p.silhouette ? p.silhouette(frame) : 0;
  const rod = p.rod ?? (from === 'trap' ? 'below' : from === 'fly' ? 'above' : from === 'right' ? 'right' : 'left');
  return (
    <div
      style={{
        position: 'absolute',
        left: x - p.w / 2,
        top: 0,
        width: p.w,
        height: y,
        zIndex: p.z,
        transform: `translate(${dx}px, ${dy + judder * 0.4 + bob + sink}px) rotate(${rock + hitRot + lean + judder * 0.15}deg)`,
        transformOrigin: '50% 100%',
        opacity: fade * fadeOut,
      }}
    >
      <div style={{position: 'absolute', left: 0, bottom: 0, width: p.w}}>
        <Wire rod={rod} w={p.w} />
        {/* card thickness */}
        <Img
          src={staticFile(p.src)}
          style={{position: 'absolute', left: 3, bottom: -3, width: '100%', filter: 'brightness(0.35) sepia(0.6)', transform: p.flip ? 'scaleX(-1)' : undefined}}
        />
        <Img
          src={staticFile(p.src)}
          style={{
            position: 'relative',
            display: 'block',
            width: '100%',
            transform: p.flip ? 'scaleX(-1)' : undefined,
            filter: `drop-shadow(14px -18px 14px rgba(10,6,20,0.45)) brightness(${1 - sil}) contrast(${1 + sil * 0.5})`,
          }}
        />
        {p.children}
      </div>
    </div>
  );
};

const Wire: React.FC<{rod: string; w: number}> = ({rod, w}) => {
  if (rod === 'none') return null;
  const base: React.CSSProperties = {position: 'absolute', background: 'linear-gradient(90deg, #6b6b70, #c9c9cf 45%, #55555a)'};
  if (rod === 'below') return <div style={{...base, left: w / 2 - 3, bottom: -700, width: 6, height: 740}} />;
  if (rod === 'above') return <div style={{...base, left: w / 2 - 2, bottom: '60%', width: 4, height: 1600}} />;
  // side slide: a stiff wire running off into the wings at the puppet's foot
  const left = rod === 'left';
  return (
    <div
      style={{
        ...base,
        background: 'linear-gradient(180deg, #6b6b70, #c9c9cf 45%, #55555a)',
        bottom: 18,
        height: 5,
        width: 1600,
        left: left ? -1600 + w * 0.3 : w * 0.7,
      }}
    />
  );
};

/** A small hanging name card tied to a puppet: NAME + one italic line, on a string. */
export const NameCard: React.FC<{name: string; sub?: string; at: number; out?: number; x?: number | string; y?: number | string; rot?: number; red?: boolean}> = ({
  name,
  sub,
  at,
  out,
  x = '50%',
  y = -60,
  rot = -2,
  red,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const s = spring({frame: frame - at, fps, config: {stiffness: 160, damping: 9}});
  const o = out === undefined ? 1 : interpolate(frame, [out, out + 8], [1, 0], clamp);
  const swing = Math.sin((frame - at) / 6) * 6 * Math.exp(-(frame - at) / 25);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, ${(1 - s) * -60}px) rotate(${rot + swing}deg)`,
        transformOrigin: '50% -80px',
        opacity: Math.min(1, s * 2) * o,
        zIndex: 5,
      }}
    >
      <div style={{position: 'absolute', left: '50%', top: -80, width: 2, height: 80, background: P.ink, opacity: 0.7}} />
      <div
        style={{
          background: red ? P.vermilion : P.card,
          color: red ? P.cream : P.ink,
          border: `3px solid ${P.ink}`,
          outline: `2px solid ${red ? P.cream : P.vermilion}`,
          outlineOffset: -9,
          padding: '12px 26px 12px',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          boxShadow: '5px 8px 14px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{fontFamily: F.rye, fontSize: 38, letterSpacing: 2, lineHeight: 1.05}}>{name}</div>
        {sub && <div style={{fontFamily: F.italic, fontStyle: 'italic', fontSize: 22, marginTop: 4}}>{sub}</div>}
      </div>
    </div>
  );
};

/** "What you're looking at" tag for archival art on stage (period painting, stand-in, etc). */
export const SourceTag: React.FC<{text: string; at: number; out?: number; x: number; y: number; tag?: string}> = ({text, at, out, x, y, tag = 'PRIMARY SOURCE'}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 10], [0, 1], clamp) * (out === undefined ? 1 : interpolate(frame, [out, out + 8], [1, 0], clamp));
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: o, fontFamily: F.sc, fontSize: 22, color: P.cream, whiteSpace: 'nowrap', textShadow: '0 2px 4px rgba(0,0,0,0.8)'}}>
      <span style={{background: tag === 'PRIMARY SOURCE' ? P.vermilion : P.royal, color: P.cream, padding: '2px 10px', marginRight: 10, fontSize: 18, textShadow: 'none'}}>{tag}</span>
      {text}
    </div>
  );
};
