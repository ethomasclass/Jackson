import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {chunk} from '../components/Captions';
import {clamp} from '../lib/anim';
import {F, P} from '../lib/theme';
import type {Word} from '../lib/timing';

const useDrop = (at: number, out?: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {stiffness: 110, damping: 10, mass: 1}});
  const up = out === undefined ? 0 : spring({frame: frame - out, fps, config: {stiffness: 90, damping: 16}});
  const swing = Math.sin((frame - at) / 7) * 4 * Math.exp(-(frame - at) / 30);
  return {frame, s, up, swing, visible: frame >= at - 1 && (out === undefined || frame < out + 30)};
};

/** A painted board lowered from the flies on two ropes (with a pulley creak). */
export const HangingSign: React.FC<{
  at: number;
  out?: number;
  x: number;
  y: number;
  w: number;
  children: React.ReactNode;
  tone?: 'card' | 'red' | 'blue' | 'black';
  sfx?: boolean;
  rot?: number;
}> = ({at, out, x, y, w, children, tone = 'card', sfx = true, rot = 0}) => {
  const {s, up, swing, visible} = useDrop(at, out);
  if (!visible) return null;
  const bg = {card: P.card, red: P.vermilion, blue: P.royal, black: P.ink}[tone];
  const fg = tone === 'card' ? P.ink : P.cream;
  const dy = -(1 - s) * (y + 400) - up * (y + 500);
  return (
    <div style={{position: 'absolute', left: x, top: y, minWidth: w, width: 'max-content', transform: `translate(-50%, ${dy}px) rotate(${rot + swing}deg)`, transformOrigin: '50% -600px', zIndex: 20}}>
      {sfx && (
        <Sequence from={at} durationInFrames={50} layout="none">
          <Audio src={staticFile('sfx/pulley.wav')} volume={0.35} />
        </Sequence>
      )}
      {[0.12, 0.88].map((k) => (
        <div key={k} style={{position: 'absolute', left: `${k * 100}%`, top: -1200, width: 4, height: 1200, background: 'repeating-linear-gradient(0deg, #8a6a44 0 6px, #5b4128 6px 12px)'}} />
      ))}
      <div
        style={{
          background: bg,
          color: fg,
          border: `4px solid ${P.ink}`,
          outline: `3px solid ${tone === 'card' ? P.vermilion : P.cream}`,
          outlineOffset: -12,
          padding: '26px 30px 28px',
          textAlign: 'center',
          boxShadow: '8px 14px 24px rgba(0,0,0,0.45)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Big wood-type line for signs. */
export const Wood: React.FC<{children: React.ReactNode; size?: number; color?: string; font?: 'rye' | 'ultra' | 'slab'; at?: number; style?: React.CSSProperties}> = ({
  children,
  size = 80,
  color,
  font = 'rye',
  at,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = at === undefined ? 1 : spring({frame: frame - at, fps, config: {stiffness: 380, damping: 18}});
  if (at !== undefined && frame < at) return <div style={{fontFamily: F[font], fontSize: size, lineHeight: 1.05, visibility: 'hidden'}}>{children}</div>;
  return (
    <div style={{fontFamily: F[font], fontSize: size, lineHeight: 1.05, color, transform: `scale(${1 + 0.8 * (1 - s)})`, opacity: Math.min(1, s * 3), whiteSpace: 'nowrap', ...style}}>
      {at !== undefined && (
        <Sequence from={at} durationInFrames={20} layout="none">
          <Audio src={staticFile('sfx/stamp.wav')} volume={0.4} />
        </Sequence>
      )}
      {children}
    </div>
  );
};

export const Small: React.FC<{children: React.ReactNode; size?: number; style?: React.CSSProperties}> = ({children, size = 30, style}) => (
  <div style={{fontFamily: F.italic, fontStyle: 'italic', fontSize: size, marginTop: 8, ...style}}>{children}</div>
);

/** A paper order unrolling sideways from a point (a demand, a proclamation). */
export const Scroll: React.FC<{at: number; out: number; x: number; y: number; w: number; children: React.ReactNode; rot?: number}> = ({at, out, x, y, w, children, rot = -2}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > out + 12) return null;
  const s = spring({frame: frame - at, fps, config: {stiffness: 90, damping: 15}});
  const o = interpolate(frame, [out, out + 10], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: x, top: y, minWidth: w, width: 'max-content', transform: `rotate(${rot}deg)`, opacity: o, zIndex: 20}}>
      <div
        style={{
          clipPath: `inset(0 ${(1 - s) * 100}% 0 0)`,
          background: `linear-gradient(180deg, ${P.cream}, #E9D9B0)`,
          border: `3px solid ${P.ink}`,
          padding: '20px 40px',
          textAlign: 'center',
          boxShadow: '6px 10px 18px rgba(0,0,0,0.45)',
        }}
      >
        {children}
      </div>
      {/* the rolled end travelling out */}
      <div style={{position: 'absolute', top: -10, bottom: -10, left: `calc(${s * 100}% - 14px)`, width: 28, borderRadius: 14, background: 'linear-gradient(90deg, #cdb98a, #f4e9cf, #b89f6b)', border: `3px solid ${P.ink}`}} />
    </div>
  );
};

/** A painted cannon-smoke cut-out that billows out and drifts. */
export const Puff: React.FC<{at: number; x: number; y: number; w: number; i?: number; drift?: number; life?: number}> = ({at, x, y, w, i = 0, drift = -120, life = 70}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = frame - at;
  if (f < 0 || f > life) return null;
  const s = spring({frame: f, fps, config: {stiffness: 140, damping: 12}});
  const o = interpolate(f, [0, 3, life - 25, life], [0, 1, 1, 0], clamp);
  return (
    <Img
      src={staticFile(`v2/props/smoke_${i % 4}.png`)}
      style={{
        position: 'absolute',
        left: x - w / 2 + (drift * f) / life,
        top: y - (w * 0.5) / 2 - f * 0.6,
        width: w,
        transform: `scale(${0.25 + 0.75 * s}) rotate(${Math.sin(f / 9 + i) * 4}deg)`,
        opacity: o,
        filter: 'drop-shadow(6px 10px 10px rgba(0,0,0,0.35))',
        zIndex: 15,
      }}
    />
  );
};

/** Tear-off calendar that flips through years, one page per `step` frames. */
export const Calendar: React.FC<{at: number; out: number; flipFrom: number; flipTo: number; years: number[]; x: number; y: number; last?: React.ReactNode}> = ({
  at,
  out,
  flipFrom,
  flipTo,
  years,
  x,
  y,
  last,
}) => {
  const frame = useCurrentFrame();
  const {s, up, swing, visible} = useDrop(at, out);
  if (!visible) return null;
  const step = (flipTo - flipFrom) / (years.length - 1);
  const k = Math.max(0, Math.min(years.length - 1, Math.floor((frame - flipFrom) / step) + (frame >= flipFrom ? 1 : 0)));
  const idx = frame < flipFrom ? 0 : Math.min(years.length - 1, k);
  const pageT = frame >= flipFrom && idx < years.length - 1 ? ((frame - flipFrom) % step) / step : 1;
  const dy = -(1 - s) * (y + 400) - up * (y + 500);
  const isLast = idx === years.length - 1;
  return (
    <div style={{position: 'absolute', left: x - 200, top: y, width: 400, transform: `translateY(${dy}px) rotate(${swing}deg)`, transformOrigin: '50% -600px', zIndex: 20}}>
      {years.slice(1).map((yy, j) => (
        <Sequence key={yy} from={Math.round(flipFrom + j * step)} durationInFrames={20} layout="none">
          <Audio src={staticFile('sfx/page_turn.wav')} volume={0.5} />
        </Sequence>
      ))}
      <div style={{position: 'absolute', left: '50%', top: -1200, width: 4, height: 1200, background: '#6b4a2b'}} />
      <div style={{background: P.vermilion, height: 60, border: `4px solid ${P.ink}`, borderBottom: 'none', fontFamily: F.slab, color: P.cream, fontSize: 30, textAlign: 'center', lineHeight: '56px', letterSpacing: 6}}>
        THE YEAR
      </div>
      <div style={{position: 'relative', height: 250, background: P.card, border: `4px solid ${P.ink}`, boxShadow: '8px 14px 24px rgba(0,0,0,0.45)', overflow: 'visible'}}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.ultra, fontSize: 150, color: isLast ? P.vermilion : P.ink}}>
          {years[idx]}
        </div>
        {isLast && last}
        {/* the page being torn off */}
        {pageT < 1 && idx > 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: P.card,
              border: `4px solid ${P.ink}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: F.ultra,
              fontSize: 150,
              transformOrigin: '50% 0',
              transform: `rotateX(${pageT * 100}deg) translateY(${pageT * 120}px) rotate(${pageT * 18}deg)`,
              opacity: 1 - pageT,
            }}
          >
            {years[idx - 1]}
          </div>
        )}
      </div>
    </div>
  );
};

/** The 15-star, 15-stripe flag of 1812-1814 (the Star-Spangled Banner), painted on a cloth that unrolls down. */
export const Banner15: React.FC<{at: number; out?: number; x: number; y: number; w: number}> = ({at, out, x, y, w}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const s = spring({frame: frame - at, fps, config: {stiffness: 50, damping: 14}});
  const o = out === undefined ? 1 : interpolate(frame, [out, out + 12], [1, 0], clamp);
  const h = (w * 10) / 19;
  const stripes = Array.from({length: 15}, (_, i) => i);
  const stars = Array.from({length: 15}, (_, i) => ({cx: 22 + (i % 5) * 36 + (Math.floor(i / 5) % 2) * 18, cy: 22 + Math.floor(i / 5) * 36}));
  const wave = (i: number) => Math.sin(frame / 10 + i / 2.5) * 6;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, height: h * s, overflow: 'hidden', opacity: o, filter: 'drop-shadow(10px 16px 20px rgba(0,0,0,0.5))'}}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {Array.from({length: 24}, (_, i) => {
          const sw = w / 24;
          return (
            <g key={i} transform={`translate(0 ${wave(i)})`}>
              <svg x={i * sw} y={0} width={sw + 1} height={h} viewBox={`${i * sw} 0 ${sw + 1} ${h}`}>
                {stripes.map((k) => (
                  <rect key={k} x={0} y={(k * h) / 15} width={w} height={h / 15 + 0.5} fill={k % 2 ? P.cream : P.vermilion} />
                ))}
                <rect x={0} y={0} width={w * 0.42} height={(h * 8) / 15} fill={P.royal} />
                <g transform={`scale(${(w * 0.42) / 200})`}>
                  {stars.map((st, k) => (
                    <polygon
                      key={k}
                      transform={`translate(${st.cx * 1.05 + 8} ${st.cy * 1.35 + 6})`}
                      points="0,-12 3.5,-4 12,-4 5,1.5 7.5,10 0,5 -7.5,10 -5,1.5 -12,-4 -3.5,-4"
                      fill={P.cream}
                    />
                  ))}
                </g>
                <rect x={0} y={0} width={w} height={h} fill="url(#flagShade)" />
              </svg>
            </g>
          );
        })}
        <defs>
          <linearGradient id="flagShade" x1="0" x2="1">
            {Array.from({length: 7}, (_, i) => (
              <stop key={i} offset={i / 6} stopColor="#000" stopOpacity={0.08 + 0.1 * Math.abs(Math.sin(frame / 10 + i))} />
            ))}
          </linearGradient>
        </defs>
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 14, background: P.wood}} />
    </div>
  );
};

/**
 * Captions printed on a theater-ticket strip across the stage apron. Key ideas in vermilion,
 * vocabulary in royal blue and underlined.
 */
export const TicketCaptions: React.FC<{words: Word[]}> = ({words}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const chunks = useMemo(() => chunk(words), [words]);
  let ci = -1;
  chunks.forEach((c, i) => {
    if (t >= c[0].s - 0.05) ci = i;
  });
  if (ci < 0) return null;
  const c = chunks[ci];
  const last = c[c.length - 1];
  const nextStart = chunks[ci + 1]?.[0].s ?? Infinity;
  if (t > last.e + 0.9 && t < nextStart) return null;
  const fadeIn = interpolate(t, [c[0].s - 0.05, c[0].s + 0.08], [0, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 34,
        transform: 'translateX(-50%)',
        padding: '10px 54px 14px',
        background: P.card,
        border: `3px solid ${P.ink}`,
        outline: `2px dashed ${P.vermilion}`,
        outlineOffset: -10,
        // notched ticket ends
        maskImage: 'radial-gradient(circle at 0 50%, transparent 16px, black 17px), radial-gradient(circle at 100% 50%, transparent 16px, black 17px)',
        maskComposite: 'intersect',
        WebkitMaskComposite: 'source-in',
        boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
        fontFamily: F.body,
        fontSize: 46,
        lineHeight: 1.2,
        color: P.ink,
        whiteSpace: 'nowrap',
        opacity: fadeIn,
      }}
    >
      {c.map((w, i) => {
        const spoken = t >= w.s - 0.03;
        const style: React.CSSProperties = {opacity: spoken ? 1 : 0.4};
        if (w.k === 'key') {
          style.color = P.vermilion;
          style.fontWeight = 700;
        }
        if (w.k === 'vocab') {
          style.color = P.royal;
          style.fontWeight = 700;
          style.textDecoration = 'underline';
          style.textDecorationThickness = 4;
          style.textUnderlineOffset = 8;
        }
        return (
          <span key={i} style={style}>
            {w.w}
            {i < c.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </div>
  );
};

/** The video's title as a circus-style playbill pasted over the closed curtain. */
export const Playbill: React.FC<{lines: {at: number; node: React.ReactNode}[]; at: number}> = ({lines, at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {stiffness: 120, damping: 13}});
  if (frame < at) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          width: 1080,
          padding: '34px 50px 40px',
          background: `radial-gradient(ellipse at 50% 40%, #FBF3DD 0%, ${P.card} 60%, #E6D2A6 100%)`,
          border: `6px double ${P.ink}`,
          boxShadow: '14px 22px 40px rgba(0,0,0,0.6)',
          textAlign: 'center',
          transform: `translateY(${(1 - s) * -900}px) rotate(${-1.2 + (1 - s) * 8}deg)`,
          color: P.ink,
        }}
      >
        {lines.map((l, i) => (
          <div key={i} style={{opacity: frame >= l.at ? 1 : 0}}>
            {l.node}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const Rule: React.FC<{color?: string}> = ({color = P.ink}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 16, margin: '12px 0'}}>
    <div style={{flex: 1, height: 3, background: color}} />
    <div style={{width: 12, height: 12, background: color, transform: 'rotate(45deg)'}} />
    <div style={{flex: 1, height: 3, background: color}} />
  </div>
);
