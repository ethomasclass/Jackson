import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, pop, prog} from '../lib/anim';
import {C, F} from '../lib/theme';

/** A top-hatted 1820s figure, for voter/elector diagrams. */
export const Figure: React.FC<{x: number; y: number; s?: number; color?: string; at: number; ballot?: boolean}> = ({
  x,
  y,
  s = 1,
  color = C.ink,
  at,
  ballot,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const p = pop(frame, at, fps, 260, 14);
  return (
    <g transform={`translate(${x} ${y + (1 - p) * 30}) scale(${s * p})`} opacity={Math.min(1, p * 2)}>
      <rect x={-17} y={-92} width={34} height={30} fill={color} />
      <rect x={-26} y={-64} width={52} height={7} rx={2} fill={color} />
      <circle cx={0} cy={-42} r={16} fill={color} />
      <path d="M-30,40 L-24,-18 Q0,-28 24,-18 L30,40 Z" fill={color} />
      {ballot && <rect x={22} y={-14} width={26} height={32} fill={C.paperLight} stroke={color} strokeWidth={3} transform="rotate(12 35 2)" />}
    </g>
  );
};

/** Arrow drawn on between two points. */
export const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; at: number; color?: string; w?: number}> = ({
  x1,
  y1,
  x2,
  y2,
  at,
  color = C.ink,
  w = 7,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, at + 14);
  if (frame < at) return null;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const ex = x1 + (x2 - x1) * p, ey = y1 + (y2 - y1) * p;
  const h = 22;
  return (
    <g>
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={w} strokeLinecap="round" />
      {p >= 1 && (
        <path
          d={`M${x2 - h * Math.cos(ang - 0.5)},${y2 - h * Math.sin(ang - 0.5)} L${x2},${y2} L${x2 - h * Math.cos(ang + 0.5)},${y2 - h * Math.sin(ang + 0.5)}`}
          fill="none"
          stroke={color}
          strokeWidth={w}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </g>
  );
};

/**
 * A newspaper page recreated in period style. The body copy is deliberately unreadable
 * grey lines: only the headline is historical, so nothing invented can be read as a quote.
 */
export const Newspaper: React.FC<{
  masthead: string;
  dateline: string;
  headline: string;
  headAt: number;
  width?: number;
  tearAt?: number;
}> = ({masthead, dateline, headline, headAt, width = 820, tearAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const h = pop(frame, headAt, fps, 380, 18);
  const page = (
    <div style={{width, background: C.paperLight, padding: '28px 34px 34px', boxShadow: '8px 14px 24px rgba(45,28,10,0.4)'}}>
      <div style={{fontFamily: F.fat, fontSize: width * 0.085, textAlign: 'center', color: C.ink, lineHeight: 1}}>{masthead}</div>
      <div style={{borderTop: `3px solid ${C.ink}`, borderBottom: `1px solid ${C.ink}`, margin: '12px 0', padding: '4px 0', display: 'flex', justifyContent: 'space-between', fontFamily: F.sc, fontSize: width * 0.028, color: C.inkSoft}}>
        <span>Boston</span>
        <span>{dateline}</span>
      </div>
      <div
        style={{
          fontFamily: F.slab,
          fontSize: width * 0.066,
          textAlign: 'center',
          color: C.ink,
          margin: '18px 0 20px',
          transform: `scale(${1 + 0.8 * (1 - h)})`,
          opacity: frame >= headAt ? Math.min(1, h * 2) : 0,
          filter: 'url(#ink)',
          whiteSpace: 'nowrap',
        }}
      >
        {headline}
      </div>
      <div style={{display: 'flex', gap: 22}}>
        {[0, 1, 2].map((col) => (
          <div key={col} style={{flex: 1}}>
            {Array.from({length: 9}, (_, i) => (
              <div key={i} style={{height: 9, background: 'rgba(40,30,20,0.22)', margin: '0 0 11px', width: `${86 + ((i * 7 + col * 13) % 14)}%`}} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
  if (tearAt === undefined || frame < tearAt) return page;
  const t = frame - tearAt;
  const g = (t * t) / 5;
  const half = (side: 'l' | 'r') => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        clipPath:
          side === 'l'
            ? 'polygon(0 0, 52% 0, 46% 18%, 54% 36%, 47% 55%, 53% 74%, 48% 100%, 0 100%)'
            : 'polygon(52% 0, 100% 0, 100% 100%, 48% 100%, 53% 74%, 47% 55%, 54% 36%, 46% 18%)',
        transform: `translate(${side === 'l' ? -t * 6 : t * 6}px, ${g}px) rotate(${side === 'l' ? -t * 0.9 : t * 0.9}deg)`,
      }}
    >
      {page}
    </div>
  );
  return (
    <div style={{position: 'relative', width}}>
      <div style={{visibility: 'hidden'}}>{page}</div>
      {half('l')}
      {half('r')}
    </div>
  );
};

/** Handwriting revealed left to right, as if written with a quill. */
export const Handwriting: React.FC<{text: string; at: number; dur?: number; size?: number; color?: string}> = ({
  text,
  at,
  dur = 24,
  size = 80,
  color = C.ink,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, at + dur, (t) => t);
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: F.hand,
        fontSize: size,
        color,
        // padding lets the script's overhanging strokes sit inside the reveal box
        padding: '0 0.35em 0 0.1em',
        clipPath: `inset(-20% ${100 - p * 100}% -40% 0)`,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
};

/** Counter that rolls up to a number. */
export const Counter: React.FC<{to: number; at: number; dur: number}> = ({to, at, dur}) => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame, [at, at + dur], [0, to], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)}));
  return <>{frame < at ? 0 : v}</>;
};

/** Pictograph: one figure per `per` people, figures appear left to right. Partial last figure is cropped. */
export const Pictograph: React.FC<{value: number; per: number; at: number; x: number; y: number; perRow?: number; color?: string; dur?: number}> = ({
  value,
  per,
  at,
  x,
  y,
  perRow = 12,
  color = C.ink,
  dur = 30,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const n = value / per;
  const shown = Math.min(n, (n * (frame - at)) / dur);
  const whole = Math.ceil(shown);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: perRow * 62}}>
      {Array.from({length: whole}, (_, i) => {
        const frac = Math.min(1, shown - i);
        return (
          <svg key={i} width={56} height={110} viewBox="-30 -95 60 140" style={{position: 'absolute', left: (i % perRow) * 62, top: Math.floor(i / perRow) * 118, clipPath: `inset(0 ${(1 - frac) * 100}% 0 0)`}}>
            <rect x={-17} y={-92} width={34} height={30} fill={color} />
            <rect x={-26} y={-64} width={52} height={7} rx={2} fill={color} />
            <circle cx={0} cy={-42} r={16} fill={color} />
            <path d="M-30,40 L-24,-18 Q0,-28 24,-18 L30,40 Z" fill={color} />
          </svg>
        );
      })}
    </div>
  );
};
