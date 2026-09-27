// Kit for the "field notebook" documentary look (ported from Fix Everything, src/jh/Kit.tsx): black-and-white archival images with one subject
// in colour, loose yellow outlines traced around subjects, torn yellow highlighter titles, grids,
// halos, route lines and handwritten notes.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, getInputProps, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from '../lib/anim';
import '../lib/theme'; // loads the vendored fonts

export const Y = '#FFE11A'; // highlighter yellow
export const ORANGE = '#F28C28';
export const INK = '#111111';

/** Signature colours: `mark` = outlines, highlighter, notes; `ink` = type on the highlighter; `subject` = the one figure in colour. */
export type Palette = {name: string; mark: string; ink: string; subject: string; box?: string; accent?: string};
/** Highlighter box colour (defaults to mark) and accent for notes, arrows and pins (defaults to mark). */
export const boxOf = (p: Palette) => p.box ?? p.mark;
export const accentOf = (p: Palette) => p.accent ?? p.mark;
export const PALETTES: Record<string, Palette> = {
  harris: {name: 'Highlighter yellow + orange', mark: Y, ink: INK, subject: ORANGE},
  locked: {name: 'Locked · teal outlines, orange titles, coral subject', mark: '#2FE0C4', ink: INK, subject: '#FF6F61', box: '#FF9F1C', accent: '#2FE0C4'},
  /** Heavy chapters (Dix, Oneida, abolition): teal lines only; titles on bone paper, no coral subject. */
  quiet: {name: 'Quiet · teal lines, bone titles', mark: '#2FE0C4', ink: INK, subject: '#EDE7DC', box: '#EDE7DC', accent: '#2FE0C4'},
  ember: {name: 'Ember orange + crimson', mark: '#FF6A1F', ink: INK, subject: '#D92B3A'},
  liberty: {name: 'Signal red + blue', mark: '#E8392B', ink: '#FFFFFF', subject: '#2F74FF'},
  teal: {name: 'Teal + coral', mark: '#2FE0C4', ink: '#0B1F1C', subject: '#FF6A55'},
  electric: {name: 'Electric blue + amber', mark: '#4D8CFF', ink: '#FFFFFF', subject: '#FFB300'},
  pink: {name: 'Hot pink + gold', mark: '#FF4FA0', ink: INK, subject: '#FFC21A'},
  // teal + coral + orange: three ways to split the jobs
  tcoA: {name: 'A · teal outlines, orange titles, coral subject', mark: '#2FE0C4', ink: INK, subject: '#FF6F61', box: '#FF9F1C', accent: '#2FE0C4'},
  tcoB: {name: 'B · teal outlines, coral titles, orange subject', mark: '#2FE0C4', ink: INK, subject: '#FF9F1C', box: '#FF6F61', accent: '#2FE0C4'},
  tcoC: {name: 'C · teal outlines + titles, coral subject, orange notes', mark: '#2FE0C4', ink: '#0B1F1C', subject: '#FF6F61', accent: '#FF9F1C'},
};
export const PaletteCtx = React.createContext<Palette>(PALETTES.harris);

/** Graphics step at ~12 fps over smooth camera moves (set to 0 for smooth graphics). */
export const StepCtx = React.createContext<number>(0);
export const useGFrame = () => {
  const f = useCurrentFrame();
  const step = React.useContext(StepCtx);
  return step ? Math.floor(f / step) * step : f;
};
export const usePal = () => React.useContext(PaletteCtx);

export const JF = {
  display: '"Abril Fatface", serif',
  heavy: '"Playfair Display", serif',
  hand: '"Permanent Marker", cursive',
  sans: '"Inter", sans-serif',
  mono: '"IBM Plex Mono", monospace',
};

const FACES = ['400 20px "Abril Fatface"', '400 20px "Nanum Pen Script"', '900 20px "Playfair Display"', '600 20px Inter', '800 20px Inter', '400 20px "IBM Plex Mono"'];

/** Handwriting faces for notes; `scale` evens out their different sizes. */
export type Hand = {name: string; family: string; scale: number; weight: number};
export const HANDS: Record<string, Hand> = {
  marker: {name: 'Permanent Marker', family: '"Permanent Marker", cursive', scale: 1, weight: 400},
  caveat: {name: 'Caveat Brush', family: '"Caveat Brush", cursive', scale: 1.25, weight: 400},
  gochi: {name: 'Gochi Hand', family: '"Gochi Hand", cursive', scale: 1.15, weight: 400},
  kalam: {name: 'Kalam Bold', family: 'Kalam, cursive', scale: 1.1, weight: 700},
  rocksalt: {name: 'Rock Salt', family: '"Rock Salt", cursive', scale: 0.8, weight: 400},
  shadows: {name: 'Shadows Into Light Two', family: '"Shadows Into Light Two", cursive', scale: 1.2, weight: 400},
  nanum: {name: 'Nanum Pen Script (locked)', family: '"Nanum Pen Script", cursive', scale: 1.55, weight: 400},
  grace: {name: 'Covered By Your Grace', family: '"Covered By Your Grace", cursive', scale: 1.3, weight: 400},
  sedgwick: {name: 'Sedgwick Ave', family: '"Sedgwick Ave", cursive', scale: 1.15, weight: 400},
};
export const HandCtx = React.createContext<Hand>(HANDS.nanum);
export const useHand = () => React.useContext(HandCtx);

export const JFonts: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [h] = useState(() => delayRender('jh-fonts'));
  useEffect(() => {
    Promise.all(FACES.map((f) => document.fonts.load(f))).then(() => continueRender(h));
  }, [h]);
  return <>{children}{getInputProps().probe ? <TextProbe /> : null}</>;
};

/** Render-time check (tools/probe_text.mjs): logs every piece of text whose box crosses the frame edge. */
const TextProbe: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  useEffect(() => {
    const h = delayRender('text-probe');
    document.fonts.ready.then(() => requestAnimationFrame(() => {
      const out: string[] = [];
      let n = 0;
      document.querySelectorAll('body *').forEach((el) => {
        const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3 && n.textContent!.trim()).map((n) => n.textContent!.trim()).join(' ');
        if (!own) return;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        n++;
        const over = Math.max(-r.left, -r.top, r.right - width, r.bottom - height);
        if (over > 0) out.push(JSON.stringify({f: frame, over: Math.round(over), l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), text: own.slice(0, 70)}));
      });
      out.forEach((o) => console.log('PROBE ' + o));
      console.log('PROBECOUNT ' + n);
      continueRender(h);
    }));
  }, [frame, width, height]);
  return null;
};

export type MaskData = {size: [number, number]; shapes: Record<string, string[]>; boxes: Record<string, [number, number, number, number]>};

/** A picture placed in frame: source pixel (sx, sy) -> screen (left + sx * scale, top + sy * scale). */
export type Place = {left: number; top: number; scale: number};

/** The picture in black and white, plus optional colour layers limited by masks. */
export const Picture: React.FC<{src: string; place: Place; size: [number, number]; bw?: string; style?: React.CSSProperties}> = ({src, place, size, bw = 'grayscale(1) contrast(1.2) brightness(0.97)', style}) => (
  <Img src={staticFile(src)} style={{position: 'absolute', left: place.left, top: place.top, width: size[0] * place.scale, height: size[1] * place.scale, filter: bw, ...style}} />
);

/** Colour the masked subject: a flat colour laid over the black-and-white picture in 'color' blend keeps the engraving's shading. */
export const Tint: React.FC<{mask: string; place: Place; size: [number, number]; color?: string; strength?: number}> = ({mask, place, size, color, strength = 1}) => {
  color = color ?? usePal().subject;
  const m: React.CSSProperties = {
    position: 'absolute', left: place.left, top: place.top, width: size[0] * place.scale, height: size[1] * place.scale,
    WebkitMaskImage: `url(${staticFile(mask)})`, WebkitMaskSize: '100% 100%', maskImage: `url(${staticFile(mask)})`, maskSize: '100% 100%',
  } as React.CSSProperties;
  return (
    <>
      <div style={{...m, background: color, mixBlendMode: 'color', opacity: strength}} />
      <div style={{...m, background: color, mixBlendMode: 'multiply', opacity: 0.3 * strength}} />
      <div style={{...m, background: color, mixBlendMode: 'screen', opacity: 0.28 * strength}} />
    </>
  );
};

/** The original colours of the picture, revealed by a soft gradient (e.g. colour creeping in from the right). */
export const ColourReveal: React.FC<{src: string; place: Place; size: [number, number]; from?: number; to?: number; filter?: string}> = ({src, place, size, from = 0.55, to = 0.85, filter}) => (
  <Img src={staticFile(src)} style={{position: 'absolute', left: place.left, top: place.top, width: size[0] * place.scale, height: size[1] * place.scale, filter,
    WebkitMaskImage: `linear-gradient(90deg, transparent ${from * 100}%, #000 ${to * 100}%)`, maskImage: `linear-gradient(90deg, transparent ${from * 100}%, #000 ${to * 100}%)`}} />
);

/** Yellow outlines traced around masked subjects, drawn on from `at` over `dur` frames. `part` < 1 leaves the loop open. */
export const Traced: React.FC<{paths: string[]; place: Place; at?: number; dur?: number; part?: number; width?: number; color?: string; jitter?: number}> = ({
  paths, place, at = 0, dur = 14, part = 1, width = 5, color, jitter = 0,
}) => {
  color = color ?? usePal().mark;
  const frame = useGFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], clamp) * part;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}} width={1920} height={1080}>
      <g transform={`translate(${place.left + jitter} ${place.top}) scale(${place.scale})`}>
        {paths.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={color} strokeWidth={width / place.scale} strokeLinejoin="round" strokeLinecap="round"
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
        ))}
      </g>
    </svg>
  );
};

/** A loose hand-drawn ellipse (halo, circle-this). */
export const Loop: React.FC<{cx: number; cy: number; rx: number; ry: number; at?: number; dur?: number; width?: number; color?: string; seed?: number; tilt?: number}> = ({
  cx, cy, rx, ry, at = 0, dur = 12, width = 5, color, seed = 1, tilt = 0,
}) => {
  color = color ?? usePal().mark;
  const frame = useGFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], clamp);
  const pts: string[] = [];
  const n = 70;
  for (let i = 0; i <= n + 6; i++) {
    const a = (i / n) * Math.PI * 2 + 0.6;
    const w = 1 + (random(`${seed}-${i}`) - 0.5) * 0.02 + (i / n) * 0.03;
    pts.push(`${(cx + Math.cos(a) * rx * w).toFixed(1)},${(cy + Math.sin(a) * ry * w).toFixed(1)}`);
  }
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1920} height={1080}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} transform={`rotate(${tilt} ${cx} ${cy})`} />
    </svg>
  );
};

/** Torn-edged highlighter box behind heavy serif type. `after` is extra text set in yellow outside the box. */
export const Highlight: React.FC<{text: string; after?: string; x: number; y: number; size?: number; at?: number; seed?: number; rot?: number}> = ({
  text, after, x, y, size = 96, at = 0, seed = 3, rot = 0,
}) => {
  const frame = useGFrame();
  const pal = usePal();
  const wipe = interpolate(frame, [at, at + 8], [0, 1], clamp);
  const pts: string[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) pts.push(`${(i / steps) * 100}% ${random(`t${seed}${i}`) * 9}%`);
  for (let i = steps; i >= 0; i--) pts.push(`${(i / steps) * 100}% ${100 - random(`b${seed}${i}`) * 9}%`);
  return (
    <div style={{position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: size * 0.28, transform: `rotate(${rot}deg)`}}>
      <div style={{position: 'relative', padding: `${size * 0.1}px ${size * 0.22}px ${size * 0.06}px`}}>
        <div style={{position: 'absolute', inset: 0, background: boxOf(pal), clipPath: `polygon(${pts.join(',')})`, transformOrigin: 'left', transform: `scaleX(${wipe})`}} />
        <div style={{position: 'relative', fontFamily: JF.display, fontSize: size, lineHeight: 1.05, color: pal.ink, whiteSpace: 'nowrap', opacity: interpolate(frame, [at + 3, at + 7], [0, 1], clamp)}}>{text}</div>
      </div>
      {after && <div style={{fontFamily: JF.display, fontSize: size, lineHeight: 1.05, color: boxOf(pal), whiteSpace: 'nowrap', textShadow: '0 3px 14px rgba(0,0,0,0.55)', opacity: interpolate(frame, [at + 6, at + 10], [0, 1], clamp)}}>{after}</div>}
    </div>
  );
};

/** Faint drafting grid over part of the frame, fading out at the edges of `box`. */
export const Grid: React.FC<{x: number; y: number; w: number; h: number; cell?: number; opacity?: number}> = ({x, y, w, h, cell = 88, opacity = 0.5}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity,
    backgroundImage: `linear-gradient(rgba(255,255,255,0.55) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(255,255,255,0.55) 1.5px, transparent 1.5px)`,
    backgroundSize: `${cell}px ${cell}px`,
    WebkitMaskImage: 'radial-gradient(ellipse at 60% 45%, #000 30%, transparent 75%)', maskImage: 'radial-gradient(ellipse at 60% 45%, #000 30%, transparent 75%)'}} />
);

/** Handwritten note, written on left to right from `at` over `dur` frames. */
export const Note: React.FC<{text: string; x: number; y: number; size?: number; rot?: number; color?: string; at?: number; dur?: number; out?: number}> = ({text, x, y, size = 46, rot = -4, color, at = -999, dur = 10, out = Infinity}) => {
  const frame = useGFrame();
  const accent = accentOf(usePal());
  const hand = useHand();
  if (frame < at || frame >= out) return null;
  const p = interpolate(frame, [at, at + dur], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: x, top: y, fontFamily: hand.family, fontWeight: hand.weight, fontSize: size * hand.scale, color: color ?? accent, transform: `rotate(${rot}deg)`, whiteSpace: 'nowrap',
      textShadow: '0 0 2px #111, 0 0 4px #111, 2px 2px 0 #111, -2px 2px 0 #111, 2px -2px 0 #111, -2px -2px 0 #111, 0 3px 12px rgba(0,0,0,0.7)', clipPath: `inset(-20% ${(1 - p) * 100}% -20% -5%)`}}>{text}</div>
  );
};

/** A hand-drawn arrow from (x1,y1) to (x2,y2) with a slight bow. */
export const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; bow?: number; color?: string; width?: number; at?: number; dur?: number; out?: number}> = ({x1, y1, x2, y2, bow = 40, color, width = 5, at = -999, dur = 8, out = Infinity}) => {
  const pal = usePal();
  color = color ?? accentOf(pal);
  const frame = useGFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], clamp);
  if (frame < at || frame >= out) return null;
  const mx = (x1 + x2) / 2 - ((y2 - y1) / Math.hypot(x2 - x1, y2 - y1)) * bow;
  const my = (y1 + y2) / 2 + ((x2 - x1) / Math.hypot(x2 - x1, y2 - y1)) * bow;
  const ang = Math.atan2(y2 - my, x2 - mx);
  const h = 26;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1920} height={1080}>
      <path d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      {p >= 1 && <path d={`M${x2 - h * Math.cos(ang - 0.45)},${y2 - h * Math.sin(ang - 0.45)} L${x2},${y2} L${x2 - h * Math.cos(ang + 0.45)},${y2 - h * Math.sin(ang + 0.45)}`}
        fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
};

export const Tag: React.FC<{text: string; x?: number; y?: number}> = ({text, x = 44, y = 1030}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: JF.mono, fontSize: 18, letterSpacing: 1, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase',
    textShadow: '0 1px 6px rgba(0,0,0,0.9)'}}>{text}</div>
);

/** Paper/film texture and a soft vignette over everything. */
export const Finish: React.FC<{vignette?: number}> = ({vignette = 0.55}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 40;
  return (
    <>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,${vignette}) 100%)`}} />
      <AbsoluteFill style={{opacity: 0.13, mixBlendMode: 'overlay'}}>
        <svg width="100%" height="100%">
          <filter id={`jg${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter={`url(#jg${seed})`} />
        </svg>
      </AbsoluteFill>
    </>
  );
};
