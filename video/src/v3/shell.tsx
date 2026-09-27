// Shared pieces for the King Andrew chapters: the chapter shell (logo break, narration, music, fades),
// scene switching, full-bleed photos, definition bars and quote cards.
import React from 'react';
import {AbsoluteFill, Audio, getStaticFiles, Img, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from '../lib/anim';
import {makeTimeline, type Narration} from '../lib/timing';
import {Finish, INK, JF, PALETTES, PaletteCtx, Picture, Place, StepCtx, useGFrame, usePal} from './Kit';
import {LogoBreak} from './LogoBreak';

export type TL = ReturnType<typeof makeTimeline>;
export {makeTimeline};
export type {Narration};

/** Frames of black-with-logo at the start of chapters 2-11 before the chapter fades up. */
export const LEAD = 44;
/** Frames the chapter picture takes to fade up from black / down to black. */
export const FADE = 10;
/** Frames after the last word before the chapter fades out. */
export const TAIL = 24;

/** A chapter's total length: optional logo lead, the narration, a tail and the fade to black. */
export const chapterFrames = (n: Narration, lead: number) => lead + Math.ceil(n.duration * 30) + TAIL + FADE;

/** Full-bleed placement that always fills the frame, centred on (fx, fy) in source pixels at zoom z. */
export const fill = (size: [number, number], fx: number, fy: number, z: number): Place => {
  const sc = Math.max(1920 / size[0], 1080 / size[1]) * z;
  return {left: Math.min(0, Math.max(1920 - size[0] * sc, 960 - fx * sc)), top: Math.min(0, Math.max(1080 - size[1] * sc, 540 - fy * sc)), scale: sc};
};

/** Pick the scene for the current frame from a list of [startFrame, node]. */
export const useScene = (cuts: [number, React.ReactNode][]) => {
  const frame = useCurrentFrame();
  return cuts.reduce((acc, [f, node]) => (frame >= f ? node : acc), cuts[0][1]);
};

/** Full-bleed B&W archival picture with a slow push from z0 to z1 between frames a and b. */
export const Photo: React.FC<{src: string; size: [number, number]; fx: number; fy: number; z0?: number; z1?: number; a: number; b: number; bw?: string; vignette?: number; children?: (p: Place) => React.ReactNode}> = ({
  src, size, fx, fy, z0 = 1.02, z1 = 1.1, a, b, bw = 'grayscale(1) contrast(1.2)', vignette = 0.65, children,
}) => {
  const frame = useCurrentFrame();
  const place = fill(size, fx, fy, interpolate(frame, [a, b], [z0, z1], clamp));
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <Picture src={src} place={place} size={size} bw={bw} />
      {children?.(place)}
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,${vignette}) 100%)`}} />
    </AbsoluteFill>
  );
};

/** Screen position of a source pixel for a placement. */
export const onScreen = (p: Place) => (x: number, y: number) => [p.left + x * p.scale, p.top + y * p.scale];

/** Vocabulary bar: term in teal with syllable dots, then a plain-language definition. */
export const Definition: React.FC<{term: string; def: string; at: number; x?: number; y?: number; w?: number}> = ({term, def, at, x = 120, y = 600, w = 1200}) => {
  const g = useGFrame();
  if (g < at) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, maxWidth: w, fontFamily: JF.sans, fontWeight: 600, fontSize: 38, lineHeight: 1.35, color: '#fff', background: 'rgba(10,10,10,0.8)', padding: '16px 26px',
      opacity: interpolate(g, [at, at + 6], [0, 1], clamp)}}>
      <span style={{color: usePal().mark}}>{term}</span> · {def}
    </div>
  );
};

/** A primary-source quote set large in Playfair, revealed phrase by phrase is overkill: it fades in whole. */
export const Quote: React.FC<{text: string; at: number; x?: number; y?: number; w?: number; size?: number; who?: string}> = ({text, at, x = 160, y = 300, w = 1600, size = 64, who}) => {
  const g = useGFrame();
  if (g < at) return null;
  const o = interpolate(g, [at, at + 6], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, opacity: o}}>
      <div style={{fontFamily: JF.heavy, fontWeight: 900, fontSize: size, lineHeight: 1.3, color: '#f4efe6', textShadow: '0 3px 14px #000'}}>“{text}”</div>
      {who && <div style={{marginTop: 24, fontFamily: JF.mono, fontSize: 24, letterSpacing: 2, color: 'rgba(244,239,230,0.8)', textTransform: 'uppercase'}}>{who}</div>}
    </div>
  );
};

/** An archival picture on white card stock that pops onto the desk, with an optional teal outline. */
export const PhotoCard: React.FC<{src: string; x: number; y: number; w: number; h?: number; rot?: number; at: number; out?: number; fit?: 'cover' | 'contain'; pos?: string; outline?: boolean; filter?: string}> = ({
  src, x, y, w, h, rot = 0, at, out = Infinity, fit = 'cover', pos = '50% 30%', outline = false, filter = 'grayscale(1) contrast(1.2)',
}) => {
  const g = useGFrame();
  const pal = usePal();
  if (g < at || g >= out) return null;
  const k = interpolate(g, [at, at + 5], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) * (1 - 2.2 * t * (1 - t))});
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `scale(${0.6 + 0.4 * k}) rotate(${rot}deg)`, opacity: Math.min(1, k * 2)}}>
      <div style={{background: '#f4efe6', padding: Math.max(8, w * 0.025), boxShadow: '0 18px 34px rgba(0,0,0,0.6)', outline: outline ? `5px solid ${pal.mark}` : undefined, outlineOffset: 10}}>
        <Img src={staticFile(src)} style={{width: '100%', height: h, objectFit: fit, objectPosition: pos, display: 'block', filter}} />
      </div>
    </div>
  );
};

/** Big display number or word with a stamp-in. */
export const Stamp: React.FC<{text: string; x: number; y: number; at: number; size?: number; color?: string; rot?: number}> = ({text, x, y, at, size = 200, color = '#f4efe6', rot = 0}) => {
  const g = useGFrame();
  if (g < at) return null;
  const k = interpolate(g, [at, at + 3, at + 6], [1.35, 0.95, 1], clamp);
  return (
    <div style={{position: 'absolute', left: x, top: y, fontFamily: JF.display, fontSize: size, lineHeight: 1, color, whiteSpace: 'nowrap', textShadow: '0 6px 22px rgba(0,0,0,0.8)',
      transform: `scale(${k}) rotate(${rot}deg)`, transformOrigin: 'left center'}}>{text}</div>
  );
};

/**
 * Chapter wrapper. With `lead` > 0 the chapter opens on the channel-logo break, then fades up.
 * Narration starts at `lead`; `body` is rendered in narration time (frame 0 = first sample of narration).
 */
export const ChapterShell: React.FC<{n: Narration; audio: string; lead: number; quiet?: boolean;
  music?: {src: string; volume?: number; startFrom?: number; from?: number}[]; children: React.ReactNode}> = ({n, audio, lead, quiet, music = [], children}) => {
  const frame = useCurrentFrame();
  const total = chapterFrames(n, lead);
  const up = interpolate(frame, [lead, lead + FADE], [lead ? 0 : 1, 1], clamp);
  const down = interpolate(frame, [total - FADE, total], [1, 0], clamp);
  return (
    <PaletteCtx.Provider value={quiet ? PALETTES.quiet : PALETTES.locked}>
      <StepCtx.Provider value={2.5}>
        <AbsoluteFill style={{background: '#000'}}>
          <Sequence from={lead} layout="none">
            <AbsoluteFill style={{opacity: Math.min(up, down)}}>
              {children}
              <Finish vignette={0.3} />
            </AbsoluteFill>
            <Audio src={staticFile(audio)} />
            {music.map((m, i) => (
              <Sequence key={i} from={m.from ?? 0} layout="none">
                <Audio src={staticFile(m.src)} startFrom={m.startFrom ?? 0}
                  volume={(f) => interpolate(f, [0, 20, total - lead - (m.from ?? 0) - 40, total - lead - (m.from ?? 0)], [0, m.volume ?? 0.15, m.volume ?? 0.15, 0], clamp)} />
              </Sequence>
            ))}
          </Sequence>
          {lead > 0 && <LogoLead />}
        </AbsoluteFill>
      </StepCtx.Provider>
    </PaletteCtx.Provider>
  );
};

/** The logo break as a chapter lead-in: black, logo fades up, ticks, fades out. */
const LogoLead: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame >= LEAD) return null;
  return <Sequence from={-16} layout="none"><LogoBreak /></Sequence>;
};

/**
 * A B&W picture on a cream card, cropped to a window: shows the source around (fx, fy) at `scale`
 * inside a w x h window at (x, y). `children(S)` get a source->screen mapper for overlays.
 */
export const CropCard: React.FC<{src: string; size: [number, number]; x: number; y: number; w: number; h: number; fx: number; fy: number; scale: number; rot?: number; at?: number;
  bw?: string; outline?: boolean; children?: (S: (sx: number, sy: number) => number[]) => React.ReactNode}> = ({
  src, size, x, y, w, h, fx, fy, scale, rot = 0, at = -999, bw = 'grayscale(1) contrast(1.2)', outline = false, children,
}) => {
  const g = useGFrame();
  const pal = usePal();
  if (g < at) return null;
  const k = interpolate(g, [at, at + 5], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) * (1 - 2.2 * t * (1 - t))});
  const left = w / 2 - fx * scale;
  const top = h / 2 - fy * scale;
  const S = (sx: number, sy: number) => [x + left + sx * scale, y + top + sy * scale];
  return (
    <>
      <div style={{position: 'absolute', left: x - 14, top: y - 14, width: w + 28, height: h + 28, background: '#f4efe6', boxShadow: '0 18px 34px rgba(0,0,0,0.6)',
        transform: `scale(${0.6 + 0.4 * k}) rotate(${rot}deg)`, opacity: Math.min(1, k * 2), outline: outline ? `5px solid ${pal.mark}` : undefined, outlineOffset: 10}}>
        <div style={{position: 'absolute', left: 14, top: 14, width: w, height: h, overflow: 'hidden'}}>
          <Img src={staticFile(src)} style={{position: 'absolute', left, top, width: size[0] * scale, height: size[1] * scale, filter: bw}} />
        </div>
      </div>
      {k >= 1 && children?.(S)}
    </>
  );
};

/** A hand-drawn crown in teal, drawn on over `dur` frames; base from (x0, y) to (x1, y), points rise by h. */
export const DrawnCrown: React.FC<{x0: number; x1: number; y: number; h: number; at: number; dur?: number; width?: number; color?: string}> = ({x0, x1, y, h, at, dur = 12, width = 7, color}) => {
  const g = useGFrame();
  const pal = usePal();
  if (g < at) return null;
  const p = interpolate(g, [at, at + dur], [0, 1], clamp);
  const wd = x1 - x0;
  const pts = [[x0, y], [x0 - wd * 0.04, y - h], [x0 + wd * 0.25, y - h * 0.45], [x0 + wd * 0.5, y - h * 1.12], [x0 + wd * 0.75, y - h * 0.45], [x1 + wd * 0.04, y - h], [x1, y], [x0, y]];
  const d = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1920} height={1080}>
      <path d={d} fill="none" stroke={color ?? pal.mark} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      {p >= 1 && [[x0 - wd * 0.04, y - h], [x0 + wd * 0.5, y - h * 1.12], [x1 + wd * 0.04, y - h]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy - 10} r={9} fill={color ?? pal.mark} />)}
    </svg>
  );
};

/** True if a file exists in public/ (so scenes can use a Gemini painting once it has been dropped in). */
export const hasFile = (p: string) => getStaticFiles().some((f) => f.name === p);
