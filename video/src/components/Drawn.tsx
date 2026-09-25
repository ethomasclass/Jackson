import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, pop, prog} from '../lib/anim';
import {C, F} from '../lib/theme';

/**
 * Objects drawn in an engraved line style to fill gaps the archives cannot (a pool table, a pile
 * of coins, a lunch table). Everything here is tagged ILLUSTRATION on screen, never PRIMARY SOURCE.
 */

export const IllustrationTag: React.FC<{x: number; y: number; at: number; out?: number; text?: string}> = ({x, y, at, out = Infinity, text = 'drawn for this video'}) => {
  const frame = useCurrentFrame();
  if (frame > out + 10) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: interpolate(frame, [at, at + 10], [0, 1], clamp) * (out === Infinity ? 1 : interpolate(frame, [out, out + 8], [1, 0], clamp)), fontFamily: F.sc, fontSize: 22, color: C.inkSoft, whiteSpace: 'nowrap'}}>
      <span style={{background: C.inkSoft, color: C.paperLight, padding: '2px 10px', marginRight: 10, fontSize: 19}}>ILLUSTRATION</span>
      {text}
    </div>
  );
};

/** Hatched shading lines clipped to a shape — the engraving look. */
const Hatch: React.FC<{id: string; angle?: number; gap?: number; w?: number}> = ({id, angle = 45, gap = 7, w = 1.6}) => (
  <pattern id={id} width={gap} height={gap} patternUnits="userSpaceOnUse" patternTransform={`rotate(${angle})`}>
    <line x1={0} y1={0} x2={0} y2={gap} stroke={C.ink} strokeWidth={w} />
  </pattern>
);

/** Thirty silver coins tumbling into a pile, counting up as they land. */
export const SilverCoins: React.FC<{at: number; out?: number; x: number; y: number}> = ({at, out = Infinity, x, y}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > out + 12) return null;
  const o = out === Infinity ? 1 : interpolate(frame, [out, out + 10], [1, 0], clamp);
  // a pile of 30: rows of 8, 7, 6, 5, 4 from the bottom up
  const coins: {cx: number; cy: number; t: number; tilt: number}[] = [];
  [8, 7, 6, 5, 4].forEach((n, r) => {
    for (let k = 0; k < n; k++) {
      const i = coins.length;
      coins.push({cx: (k - (n - 1) / 2) * 50 + ((i * 37) % 11) - 5, cy: -r * 20 + ((i * 17) % 7), t: at + i * 1.1, tilt: ((i * 29) % 24) - 12});
    }
  });
  const landed = coins.filter((c) => frame >= c.t + 6).length;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: o}}>
      <svg width={600} height={300} viewBox="-300 -200 600 300" style={{overflow: 'visible', filter: 'url(#ink)'}}>
        <defs>
          <Hatch id="coinHatch" angle={-35} gap={6} w={1.2} />
        </defs>
        {coins.map((c, i) => {
          if (frame < c.t) return null;
          const p = pop(frame, c.t, fps, 300, 14);
          return (
            <g key={i} transform={`translate(${c.cx} ${c.cy - (1 - p) * 260}) rotate(${c.tilt})`}>
              <ellipse cx={0} cy={5} rx={27} ry={12} fill={C.inkSoft} />
              <ellipse cx={0} cy={0} rx={27} ry={12} fill="#D9D6CC" stroke={C.ink} strokeWidth={2.5} />
              <ellipse cx={0} cy={0} rx={18} ry={7} fill="url(#coinHatch)" stroke={C.ink} strokeWidth={1.2} />
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', left: 300, top: 300, transform: 'translateX(-50%)', textAlign: 'center', whiteSpace: 'nowrap'}}>
        <span style={{fontFamily: F.fat, fontSize: 110, color: C.ink}}>{landed}</span>
        <span style={{fontFamily: F.slab, fontSize: 44, color: C.inkSoft, marginLeft: 16, letterSpacing: 3}}>PIECES OF SILVER</span>
      </div>
    </div>
  );
};

/** A billiard table in three-quarter view, engraved. */
export const PoolTable: React.FC<{at: number; out?: number; x: number; y: number; w?: number}> = ({at, out = Infinity, x, y, w = 640}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, at + 26);
  if (frame < at || frame > out + 12) return null;
  const o = out === Infinity ? 1 : interpolate(frame, [out, out + 10], [1, 0], clamp);
  const line = (d: string, i: number, sw = 4) => (
    <path key={i} d={d} fill="none" stroke={C.ink} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
  );
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: o}}>
      <svg width={w} height={w * 0.62} viewBox="0 0 640 400" style={{overflow: 'visible', filter: 'url(#ink)'}}>
        <defs>
          <Hatch id="feltHatch" angle={20} gap={9} w={1.4} />
          <Hatch id="woodHatch" angle={80} gap={5} w={1.6} />
        </defs>
        <path d="M120,90 L520,90 L600,230 L40,230 Z" fill="url(#feltHatch)" opacity={p} />
        {[
          'M120,90 L520,90 L600,230 L40,230 Z',
          'M100,78 L540,78 L628,240 L12,240 Z',
          'M12,240 L12,268 L628,268 L628,240',
          'M60,268 L70,380 L100,380 L104,268',
          'M536,268 L540,380 L570,380 L580,268',
          'M300,268 L306,340 L334,340 L340,268',
        ].map((d, i) => line(d, i))}
        <path d="M12,240 L628,240 L628,268 L12,268 Z" fill="url(#woodHatch)" opacity={p * 0.8} />
        {[
          [110, 84], [320, 82], [530, 84], [30, 236], [320, 238], [610, 236],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={11} fill={C.ink} opacity={p} />
        ))}
        {[
          [260, 150, C.paperLight], [300, 170, C.red], [350, 140, C.paperLight],
        ].map(([cx, cy, fill], i) => (
          <circle key={`b${i}`} cx={cx as number} cy={cy as number} r={12} fill={fill as string} stroke={C.ink} strokeWidth={2.5} opacity={p} />
        ))}
        {line('M420,200 L600,120', 9, 6)}
      </svg>
    </div>
  );
};

/** Big tubs of punch, sloshing — carried out to the lawn. */
export const PunchTub: React.FC<{at: number; out?: number; x: number; y: number; s?: number; tilt?: number; walk?: number}> = ({at, out = Infinity, x, y, s = 1, tilt = 0, walk}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > out + 12) return null;
  // `walk`: frame at which the tub is carried off to the right
  const dx = walk === undefined ? 0 : Math.max(0, frame - walk) ** 1.6 * 2.2;
  const p = pop(frame, at, fps, 200, 14);
  const slosh = Math.sin((frame - at) / 4) * 6;
  return (
    <div style={{position: 'absolute', left: x + dx, top: y, transform: `scale(${s * p}) rotate(${tilt + slosh * 0.3}deg)`, transformOrigin: 'bottom center', opacity: out === Infinity ? 1 : interpolate(frame, [out, out + 10], [1, 0], clamp)}}>
      <svg width={320} height={220} viewBox="0 0 320 220" style={{overflow: 'visible', filter: 'url(#ink)'}}>
        <defs>
          <Hatch id="tubHatch" angle={90} gap={8} w={1.6} />
        </defs>
        <path d={`M30,70 Q160,${58 + slosh} 290,70 L270,200 L50,200 Z`} fill="url(#tubHatch)" stroke={C.ink} strokeWidth={5} />
        <ellipse cx={160} cy={70} rx={130} ry={24} fill="#B5443A" stroke={C.ink} strokeWidth={5} />
        <path d={`M60,${66 + slosh / 2} Q120,${60 - slosh} 180,${68 + slosh / 2}`} stroke={C.paperLight} strokeWidth={4} fill="none" opacity={0.6} />
        <rect x={40} y={110} width={240} height={10} fill={C.ink} />
        <rect x={50} y={165} width={220} height={10} fill={C.ink} />
        <path d="M10,90 q-20,15 0,30 M310,90 q20,15 0,30" stroke={C.ink} strokeWidth={6} fill="none" />
      </svg>
    </div>
  );
};

/** A cafeteria lunch table seen from above, with name cards — and one seat left alone. */
export const LunchTable: React.FC<{at: number; aloneAt: number; out?: number; x: number; y: number; names: string[]; alone: string}> = ({at, aloneAt, out = Infinity, x, y, names, alone}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > out + 12) return null;
  const s = pop(frame, at, fps, 140, 16) * (out === Infinity ? 1 : interpolate(frame, [out, out + 10], [1, 0], clamp));
  const slide = prog(frame, aloneAt, aloneAt + 20);
  const card = (name: string, cx: number, cy: number, red?: boolean, key?: number) => (
    <div
      key={key}
      style={{
        position: 'absolute',
        left: cx,
        top: cy,
        transform: 'translate(-50%, -50%)',
        background: red ? C.red : C.paperLight,
        color: red ? C.paperLight : C.ink,
        border: `2px solid ${C.ink}`,
        fontFamily: F.slab,
        fontSize: 26,
        padding: '6px 16px',
        whiteSpace: 'nowrap',
        boxShadow: '3px 5px 8px rgba(0,0,0,0.25)',
      }}
    >
      {name}
    </div>
  );
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: s, transform: `scale(${0.9 + 0.1 * s})`}}>
      <div style={{position: 'relative', width: 1200, height: 560}}>
        {/* the big table */}
        <div style={{position: 'absolute', left: 0, top: 120, width: 760, height: 280, background: '#C9A77A', border: `5px solid ${C.ink}`, borderRadius: 20, boxShadow: '8px 14px 24px rgba(45,28,10,0.35)', backgroundImage: 'repeating-linear-gradient(90deg, rgba(60,40,20,0.12) 0 3px, transparent 3px 26px)'}} />
        {names.map((n, i) => card(n, 110 + (i % 3) * 270, i < 3 ? 90 : 430, false, i))}
        {/* the small table */}
        <div style={{position: 'absolute', left: 900 + slide * 60, top: 200, width: 240, height: 160, background: '#C9A77A', border: `5px solid ${C.ink}`, borderRadius: 16, boxShadow: '8px 14px 24px rgba(45,28,10,0.35)'}} />
        {card(alone, 1020 + slide * 60, 170, true)}
      </div>
    </div>
  );
};

/** Invitation card with a big red "DECLINED" across it. */
export const Invitation: React.FC<{at: number; declineAt: number; out?: number; x: number; y: number; rot?: number; to: string}> = ({at, declineAt, out = Infinity, x, y, rot = 0, to}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > out + 12) return null;
  const s = pop(frame, at, fps, 160, 16) * (out === Infinity ? 1 : interpolate(frame, [out, out + 10], [1, 0], clamp));
  const d = pop(frame, declineAt, fps, 400, 16);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg) scale(${0.8 + 0.2 * s})`, opacity: Math.min(1, s * 2)}}>
      <div style={{width: 460, background: C.paperLight, border: `2px solid ${C.ink}`, outline: `1px solid ${C.ink}`, outlineOffset: -10, padding: '30px 34px', textAlign: 'center', boxShadow: '6px 10px 18px rgba(45,28,10,0.35)'}}>
        <div style={{fontFamily: F.sc, fontSize: 24, color: C.inkSoft, letterSpacing: 3}}>The pleasure of your company</div>
        <div style={{fontFamily: F.hand, fontSize: 60, color: C.ink, margin: '8px 0'}}>{to}</div>
        <div style={{fontFamily: F.sc, fontSize: 22, color: C.inkSoft}}>is requested at dinner</div>
      </div>
      {frame >= declineAt && (
        <div style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%, -50%) rotate(-12deg) scale(${1 + (1 - d)})`, opacity: Math.min(1, d * 3), border: `6px solid ${C.red}`, color: C.red, fontFamily: F.slab, fontSize: 64, padding: '4px 24px', letterSpacing: 4, filter: 'url(#inkHeavy)'}}>
          DECLINED
        </div>
      )}
    </div>
  );
};

/** A row of plain black coffins stamped one at a time, like the 1828 handbill. */
export const Coffins: React.FC<{at: number; out?: number; x: number; y: number; n?: number; every?: number}> = ({at, out = Infinity, x, y, n = 6, every = 5}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > out + 12) return null;
  const o = out === Infinity ? 1 : interpolate(frame, [out, out + 10], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: x, top: y, display: 'flex', gap: 22, opacity: o, filter: 'url(#ink)'}}>
      {Array.from({length: n}, (_, i) => {
        const s = pop(frame, at + i * every, fps, 400, 18);
        if (frame < at + i * every) return <div key={i} style={{width: 90}} />;
        return (
          <svg key={i} width={90} height={200} viewBox="0 0 90 200" style={{transform: `scale(${1 + 0.6 * (1 - s)})`, opacity: Math.min(1, s * 3)}}>
            <path d="M28,4 L62,4 L86,52 L70,196 L20,196 L4,52 Z" fill={C.ink} />
            <path d="M45,40 L45,110 M25,62 L65,62" stroke={C.paperLight} strokeWidth={6} />
          </svg>
        );
      })}
    </div>
  );
};
