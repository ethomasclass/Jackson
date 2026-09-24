import React from 'react';
import {Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, pop, prog} from '../lib/anim';
import {C, F} from '../lib/theme';

/** Stroke that draws itself on between two frames (pathLength trick). */
const Draw: React.FC<{d: string; from: number; to: number; w?: number; color?: string}> = ({d, from, to, w = 5, color = C.ink}) => {
  const frame = useCurrentFrame();
  return (
    <path
      d={d}
      pathLength={1}
      fill="none"
      stroke={color}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="1 1"
      strokeDashoffset={1 - prog(frame, from, to)}
    />
  );
};

const TORSO = [
  'M255,30 C255,85 250,118 232,140', // neck
  'M345,30 C345,85 350,118 368,140',
  'M232,140 C172,158 112,170 84,212 C64,244 64,300 76,364', // shoulders + arms
  'M368,140 C428,158 488,170 516,212 C536,244 536,300 524,364',
  'M118,296 C124,420 132,520 150,650', // sides
  'M482,296 C476,420 468,520 450,650',
  'M244,172 C204,186 166,186 132,198', // collarbones
  'M356,172 C396,186 434,186 468,198',
  'M300,196 L300,410', // sternum
];
const RIBS = [
  'M296,236 C258,244 206,246 162,272',
  'M304,236 C342,244 394,246 438,272',
  'M296,280 C256,290 206,294 158,322',
  'M304,280 C344,290 394,294 442,322',
  'M296,324 C258,336 210,344 160,372',
  'M304,324 C342,336 390,344 440,372',
  'M296,368 C262,382 218,394 172,420',
  'M304,368 C338,382 382,394 428,420',
];
const HEART = 'M352,300 C352,282 374,272 386,288 C398,272 420,282 420,300 C420,322 398,338 386,352 C374,338 352,322 352,300 Z';

/**
 * Anatomical-plate style chest: outline draws on, the bullet lands, the heart appears, and a
 * measuring bracket shows how close it was.
 */
export const ChestDiagram: React.FC<{
  at: number;
  bulletAt: number;
  heartAt: number;
  inchAt: number;
  x: number;
  y: number;
  scale?: number;
  out?: number;
}> = ({at, bulletAt, heartAt, inchAt, x, y, scale = 1, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const o = out === undefined ? 1 : interpolate(frame, [out, out + 10], [1, 0], clamp);
  const b = pop(frame, bulletAt, fps, 400, 12);
  const h = pop(frame, heartAt, fps, 200, 9);
  const beat = 1 + 0.06 * Math.max(0, Math.sin((frame - heartAt) / 5)) * (frame > heartAt ? 1 : 0);
  const inch = prog(frame, inchAt, inchAt + 14);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `scale(${scale})`, transformOrigin: 'top left', opacity: o}}>
      <svg width={600} height={680} viewBox="0 0 600 680" style={{filter: 'url(#ink)', overflow: 'visible'}}>
        {TORSO.map((d, i) => (
          <Draw key={i} d={d} from={at + i * 2} to={at + 22 + i * 2} />
        ))}
        {RIBS.map((d, i) => (
          <Draw key={i} d={d} from={at + 10 + i * 2} to={at + 30 + i * 2} w={3} color={C.inkSoft} />
        ))}
        {/* heart, drawn in red and gently beating */}
        <g
          transform={`translate(386 312) scale(${h * beat}) translate(-386 -312)`}
          opacity={Math.min(1, h * 2)}
        >
          <path d={HEART} fill={C.red} stroke={C.redDark} strokeWidth={3} />
        </g>
        {/* bullet: lodged beside the heart */}
        <g opacity={frame >= bulletAt ? 1 : 0}>
          <circle cx={318} cy={274} r={40 * (1 - b) + 10} fill="none" stroke={C.ink} strokeWidth={3} opacity={1 - b} />
          <circle cx={318} cy={274} r={11} fill={C.ink} />
        </g>
        {/* measuring bracket bullet -> heart */}
        <g opacity={inch}>
          <line x1={318} y1={274} x2={318 + (362 - 318) * inch} y2={274 + (292 - 274) * inch} stroke={C.red} strokeWidth={4} strokeDasharray="6 6" />
        </g>
        <text x={120} y={690} fontFamily={F.sc} fontSize={26} fill={C.inkSoft} opacity={prog(frame, at + 20, at + 35)}>
          diagram for illustration
        </text>
      </svg>
      {frame >= bulletAt && (
        <Sequence from={bulletAt} durationInFrames={20} layout="none">
          <Audio src={staticFile('sfx/stamp.wav')} volume={0.35} />
        </Sequence>
      )}
      {/* callouts */}
      <Callout text="bullet" x={160} y={200} at={bulletAt + 4} />
      <Callout text="heart" x={440} y={250} at={heartAt + 2} red />
    </div>
  );
};

const Callout: React.FC<{text: string; x: number; y: number; at: number; red?: boolean}> = ({text, x, y, at, red}) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [at, at + 8], [0, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity: op,
        fontFamily: F.italic,
        fontStyle: 'italic',
        fontSize: 40,
        color: red ? C.red : C.ink,
      }}
    >
      {text}
    </div>
  );
};

/** 1806 -> 1845 life line with the bullet riding along inside him. */
export const LifeLine: React.FC<{at: number; rideFrom: number; rideTo: number; out?: number}> = ({at, rideFrom, rideTo, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const o = out === undefined ? 1 : interpolate(frame, [out, out + 10], [1, 0], clamp);
  const line = prog(frame, at, at + 22);
  const ride = prog(frame, rideFrom, rideTo);
  const x0 = 260, x1 = 1660, y = 610;
  const endTag = pop(frame, rideTo - 6, fps, 200, 15);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <svg width={1920} height={1080} style={{position: 'absolute', filter: 'url(#ink)'}}>
        <line x1={x0} y1={y} x2={x0 + (x1 - x0) * line} y2={y} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
        <line x1={x0} y1={y - 30} x2={x0} y2={y + 30} stroke={C.ink} strokeWidth={8} opacity={line > 0 ? 1 : 0} />
        <line x1={x1} y1={y - 30} x2={x1} y2={y + 30} stroke={C.ink} strokeWidth={8} opacity={line >= 1 ? 1 : 0} />
        <line x1={x0} y1={y} x2={x0 + (x1 - x0) * ride} y2={y} stroke={C.red} strokeWidth={8} strokeLinecap="round" />
        <circle cx={x0 + (x1 - x0) * ride} cy={y} r={20} fill={C.ink} stroke={C.paperLight} strokeWidth={5} opacity={frame >= rideFrom ? 1 : 0} />
      </svg>
      <Tag x={x0} y={y + 60} big="1806" small="shot in the duel" op={line} />
      <Tag x={x1} y={y + 60} big="1845" small="dies — bullet still inside" op={endTag} red />
    </div>
  );
};

const Tag: React.FC<{x: number; y: number; big: string; small: string; op: number; red?: boolean}> = ({x, y, big, small, op, red}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: 'translateX(-50%)', textAlign: 'center', opacity: op}}>
    <div style={{fontFamily: F.fat, fontSize: 76, lineHeight: 1, color: red ? C.red : C.ink}}>{big}</div>
    <div style={{fontFamily: F.italic, fontStyle: 'italic', fontSize: 34, color: C.inkSoft, whiteSpace: 'nowrap'}}>{small}</div>
  </div>
);

/** Year counter that ticks from one year to another. */
export const YearCounter: React.FC<{from: number; to: number; at: number; until: number; out?: number}> = ({from, to, at, until, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const p = prog(frame, at, until);
  const year = Math.round(from + (to - from) * p);
  const land = pop(frame, until, fps, 300, 12);
  const o = out === undefined ? 1 : interpolate(frame, [out, out + 10], [1, 0], clamp);
  const ticks = Array.from({length: to - from}, (_, i) => Math.round(at + ((until - at) * (i + 1)) / (to - from)));
  return (
    <>
      {ticks.map((f) => (
        <Sequence key={f} from={f} durationInFrames={4} layout="none">
          <Audio src={staticFile('sfx/tick.wav')} volume={0.25} />
        </Sequence>
      ))}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 420,
          transform: `translate(-50%, -50%) scale(${1 + 0.08 * land * (frame < until + 10 ? 1 : 0)})`,
          fontFamily: F.fat,
          fontSize: 340,
          lineHeight: 1,
          color: frame >= until ? C.red : C.ink,
          opacity: o,
          filter: 'url(#ink)',
        }}
      >
        {year}
      </div>
    </>
  );
};
