import React from 'react';
import {Audio, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from '../lib/anim';
import {F, P} from '../lib/theme';
import type {Timeline} from '../lib/timing';

/**
 * Vocabulary as a theater ticket: ADMIT ONE stub, the word in wood type, and the definition
 * printing word by word as the narrator reads it (defFrom/defWords) or all at once (def).
 */
export const VocabTicket: React.FC<{
  term: string;
  say?: string;
  pos?: string;
  defFrom?: string;
  defWords?: number;
  def?: string;
  label?: string;
  at: number;
  out?: number;
  tl: Timeline;
  x: number;
  y: number;
  w?: number;
  termSize?: number;
}> = ({term, say, pos, defFrom, defWords = 0, def, label = 'VOCABULARY', at, out, tl, x, y, w = 900, termSize = 96}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at - 1 || (out !== undefined && frame > out + 30)) return null;
  const s = spring({frame: frame - at, fps, config: {stiffness: 110, damping: 15}});
  const sOut = out === undefined ? 0 : spring({frame: frame - out, fps, config: {stiffness: 140, damping: 20}});
  const defs = defFrom ? tl.words.slice(tl.idx(defFrom), tl.idx(defFrom) + defWords) : [];
  const notch = 'radial-gradient(circle at 0 50%, transparent 22px, black 23px), radial-gradient(circle at 100% 50%, transparent 22px, black 23px)';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        zIndex: 30,
        transform: `translate(${(1 - s) * 1400 + sOut * 1400}px, 0) rotate(${-2 + (1 - s) * 10}deg)`,
        filter: 'drop-shadow(10px 16px 20px rgba(0,0,0,0.5))',
      }}
    >
      <Sequence from={at} durationInFrames={25} layout="none">
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.4} />
      </Sequence>
      <div style={{display: 'flex', background: P.card, maskImage: notch, maskComposite: 'intersect', WebkitMaskComposite: 'source-in'}}>
        {/* stub */}
        <div
          style={{
            width: 110,
            background: P.royal,
            color: P.cream,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: `4px dashed ${P.card}`,
          }}
        >
          <div style={{transform: 'rotate(-90deg)', whiteSpace: 'nowrap', fontFamily: F.slab, fontSize: 30, letterSpacing: 6}}>ADMIT ONE</div>
        </div>
        <div style={{flex: 1, padding: '22px 44px 30px 36px', border: `4px solid ${P.ink}`, borderLeft: 'none'}}>
          <div style={{fontFamily: F.slab, fontSize: 28, letterSpacing: 8, color: P.vermilion}}>{label}</div>
          <div style={{fontFamily: F.rye, fontSize: termSize, lineHeight: 1.05, color: P.ink, marginTop: 6}}>{term}</div>
          {(say || pos) && (
            <div style={{fontFamily: F.italic, fontStyle: 'italic', fontSize: 32, color: '#5a4a3a', marginTop: 4}}>
              {say}
              {say && pos ? ' · ' : ''}
              {pos}
            </div>
          )}
          <div style={{height: 3, background: P.vermilion, margin: '16px 0 14px', width: 200}} />
          <div style={{fontFamily: F.body, fontSize: 42, lineHeight: 1.28, color: P.ink}}>
            {def ? (
              <span style={{opacity: interpolate(frame, [at + 10, at + 22], [0, 1], clamp)}}>{def}</span>
            ) : (
              defs.map((d, i) => {
                const f = Math.round(d.s * fps);
                const o = interpolate(frame, [f - 2, f + 4], [0, 1], clamp);
                return (
                  <span key={i} style={{opacity: o}}>
                    {d.w.replace(/[.,;:]$/, (m) => (i === defs.length - 1 ? '' : m))}{' '}
                  </span>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * An archival picture in a gilt frame, lowered from the flies (or carried on from a wing)
 * with a PRIMARY SOURCE tag pinned under it.
 */
export const Picture: React.FC<{
  src: string;
  at: number;
  out?: number;
  x: number;
  y: number;
  w: number;
  source?: string;
  tag?: string;
  rot?: number;
  zoom?: {to: number; origin: string; until: number};
  children?: React.ReactNode;
}> = ({src, at, out, x, y, w, source, tag = 'PRIMARY SOURCE', rot = 0, zoom, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at - 1 || (out !== undefined && frame > out + 30)) return null;
  const s = spring({frame: frame - at, fps, config: {stiffness: 100, damping: 11}});
  const up = out === undefined ? 0 : spring({frame: frame - out, fps, config: {stiffness: 90, damping: 16}});
  const swing = Math.sin((frame - at) / 7) * 3 * Math.exp(-(frame - at) / 30);
  const z = zoom ? interpolate(frame, [at, zoom.until], [1, zoom.to], clamp) : 1;
  const dy = -(1 - s) * (y + 900) - up * (y + 1000);
  const tagO = interpolate(frame, [at + 12, at + 22], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, transform: `translateY(${dy}px) rotate(${rot + swing}deg)`, transformOrigin: '50% -600px', zIndex: 18}}>
      <Sequence from={at} durationInFrames={50} layout="none">
        <Audio src={staticFile('sfx/pulley.wav')} volume={0.3} />
      </Sequence>
      {[0.2, 0.8].map((k) => (
        <div key={k} style={{position: 'absolute', left: `${k * 100}%`, top: -1200, width: 3, height: 1200, background: '#6b4a2b'}} />
      ))}
      <div
        style={{
          padding: 14,
          background: `linear-gradient(135deg, #f3d27a, ${P.mustard} 30%, #8a6512 55%, #e7c064 80%, #a57a1c)`,
          boxShadow: '10px 18px 30px rgba(0,0,0,0.55), inset 0 0 0 3px #5a3f0c',
        }}
      >
        <div style={{overflow: 'hidden', border: '3px solid #3c2a08', position: 'relative'}}>
          <Img src={staticFile(src)} style={{width: '100%', display: 'block', transform: `scale(${z})`, transformOrigin: zoom?.origin ?? 'center'}} />
        </div>
      </div>
      {children}
      {source && (
        <div style={{position: 'absolute', left: 0, top: '100%', marginTop: 10, opacity: tagO, fontFamily: F.sc, fontSize: 22, color: P.cream, whiteSpace: 'nowrap', textShadow: '0 2px 4px rgba(0,0,0,0.9)'}}>
          <span style={{background: tag === 'PRIMARY SOURCE' ? P.vermilion : P.royal, color: P.cream, padding: '2px 10px', marginRight: 10, fontSize: 18, textShadow: 'none'}}>{tag}</span>
          {source}
        </div>
      )}
    </div>
  );
};

/** A row of painted cut-out flames that rise at `at`, flicker, and throw an orange glow. */
export const Flames: React.FC<{at: number; out?: number; x: number; y: number; w: number; n?: number; seed?: number; glow?: boolean}> = ({
  at,
  out,
  x,
  y,
  w,
  n = 5,
  seed = 0,
  glow = true,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const o = out === undefined ? 1 : interpolate(frame, [out, out + 20], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: 0, width: w, height: y, opacity: o, zIndex: 16}}>
      {glow && (
        <div
          style={{
            position: 'absolute',
            left: -w * 0.4,
            right: -w * 0.4,
            bottom: -80,
            height: 700,
            background: 'radial-gradient(ellipse at 50% 90%, rgba(255,140,40,0.55) 0%, rgba(255,90,20,0.2) 40%, rgba(0,0,0,0) 70%)',
            mixBlendMode: 'screen',
            opacity: 0.8 + 0.2 * random(`g${seed}${Math.floor(frame / 2)}`),
          }}
        />
      )}
      {Array.from({length: n}, (_, i) => {
        const s = spring({frame: frame - at - i * 4, fps, config: {stiffness: 90, damping: 10}});
        const fl = 1 + 0.12 * Math.sin(frame / 2.3 + i * 1.7 + seed) + 0.06 * Math.sin(frame / 1.1 + i);
        const sk = 6 * Math.sin(frame / 5 + i + seed);
        const fw = (w / n) * 1.6;
        return (
          <Img
            key={i}
            src={staticFile(`v2/props/flame_${(i + seed) % 5}.png`)}
            style={{
              position: 'absolute',
              left: (i + 0.5) * (w / n) - fw / 2,
              bottom: 0,
              width: fw,
              transformOrigin: '50% 100%',
              transform: `scale(${s * (0.8 + 0.25 * ((i * 7 + seed) % 3) / 2)}, ${s * fl}) skewX(${sk}deg)`,
            }}
          />
        );
      })}
    </div>
  );
};

/** Muzzle flashes and arcing rockets for a night bombardment. */
export const Rockets: React.FC<{from: number; to: number; every?: number; seed?: number}> = ({from, to, every = 14, seed = 0}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to + 60) return null;
  const shots = [];
  for (let f = from; f < to; f += every) shots.push(f);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, zIndex: 14}}>
      {shots.map((f, i) => {
        const k = frame - f;
        if (k < 0 || k > 50) return null;
        const x0 = 380 + random(`rx${seed}${i}`) * 300;
        const x1 = 1200 + random(`rx1${seed}${i}`) * 350;
        const peak = 300 + random(`ry${seed}${i}`) * 120;
        const t = Math.min(1, k / 34);
        const pts = Array.from({length: 20}, (_, j) => {
          const u = (j / 19) * t;
          const px = x0 + (x1 - x0) * u;
          const py = 760 - 4 * (760 - peak) * u * (1 - u);
          return `${px},${py}`;
        }).join(' ');
        const burst = k >= 34 && k < 46;
        const bx = x1, by = 760 - 4 * (760 - peak) * 1 * 0;
        return (
          <g key={f} opacity={interpolate(k, [0, 4, 40, 50], [0, 1, 1, 0], clamp)}>
            <polyline points={pts} fill="none" stroke="#FF6A2A" strokeWidth={4} strokeDasharray="10 8" />
            {burst && <circle cx={bx} cy={by + 700} r={(k - 34) * 9} fill="#FFD27A" opacity={1 - (k - 34) / 12} />}
          </g>
        );
      })}
    </svg>
  );
};
