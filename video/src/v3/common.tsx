// Pieces shared by the chapters.
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, random, Sequence, staticFile} from 'remotion';
import {clamp} from '../lib/anim';
import {useGFrame, usePal} from './Kit';

export const MAP = {w: 4986, h: 4608};

/** The sound under every handwritten note (one place to change it) and its level. */
export const WRITE = {src: 'sfx/marker_tick.wav', volume: 0.2};

export const Sfx: React.FC<{at: number; src: string; volume?: number}> = ({at, src, volume = 0.5}) => (
  <Sequence from={Math.max(0, at)} durationInFrames={90} layout="none"><Audio src={staticFile(src)} volume={volume} /></Sequence>
);

/** Mitchell's 1836 map, rotated; camera given in map pixels; children are SVG in map pixels. */
export const MapView: React.FC<{cx: number; cy: number; s: number; rot?: number; children?: React.ReactNode; dim?: number}> = ({cx, cy, s, rot = 0, children, dim = 0}) => (
  <div style={{position: 'absolute', left: 960 - cx * s, top: 540 - cy * s, width: MAP.w * s, height: MAP.h * s, transform: `rotate(${rot}deg)`, transformOrigin: `${cx * s}px ${cy * s}px`}}>
    <Img src={staticFile('img/v3/maps/mitchell_1836.jpg')} style={{width: '100%', height: '100%', filter: `grayscale(1) sepia(0.25) contrast(1.2) brightness(${0.8 - dim})`, boxShadow: '0 30px 80px rgba(0,0,0,0.8)'}} />
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={MAP.w * s} height={MAP.h * s} viewBox={`0 0 ${MAP.w} ${MAP.h}`}>{children}</svg>
  </div>
);

/** Screen position of a map point for a MapView camera. */
export const mapToScreen = (cx: number, cy: number, s: number, rot = 0) => ([x, y]: number[]) => {
  const a = (rot * Math.PI) / 180;
  const dx = (x - cx) * s;
  const dy = (y - cy) * s;
  return [960 + dx * Math.cos(a) - dy * Math.sin(a), 540 + dx * Math.sin(a) + dy * Math.cos(a)];
};

/** Dark notebook-paper backdrop for diagrams. */
export const DarkPaper: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 45% 40%, #2a2620 0%, #16140f 70%, #0d0c09 100%)'}}>
    <AbsoluteFill style={{opacity: 0.12, backgroundImage: 'linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)', backgroundSize: '100% 64px'}} />
  </AbsoluteFill>
);

/** A soft glowing coral ember with drifting sparks (the "spark" motif). */
export const Ember: React.FC<{x: number; y: number; at: number; size?: number; flare?: number}> = ({x, y, at, size = 1, flare = 0}) => {
  const g = useGFrame();
  const pal = usePal();
  if (g < at) return null;
  const k = interpolate(g, [at, at + 10], [0, 1], clamp);
  const pulse = 1 + 0.08 * Math.sin((g - at) / 4);
  const r = 26 * size * k * pulse * (1 + flare);
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: x - r * 6, top: y - r * 6, width: r * 12, height: r * 12, borderRadius: '50%',
        background: `radial-gradient(circle, ${pal.subject}cc 0%, ${pal.subject}55 18%, rgba(255,159,28,0.18) 40%, transparent 70%)`}} />
      <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: '#fff3e0', boxShadow: `0 0 ${r * 1.5}px ${r * 0.6}px ${pal.subject}`}} />
      {Array.from({length: Math.round(10 + 30 * flare)}).map((_, i) => {
        const life = 40 + random(`el${i}`) * 50;
        const t = ((g - at + random(`eo${i}`) * life) % life) / life;
        const px = x + (random(`ex${i}`) - 0.5) * 90 * size * (1 + flare) + Math.sin((g + i * 17) / 9) * 10;
        const py = y - t * 220 * size * (1 + flare);
        const sz = 3 + random(`es${i}`) * 4;
        return <div key={i} style={{position: 'absolute', left: px, top: py, width: sz, height: sz, borderRadius: '50%', background: '#ffd7b0',
          boxShadow: `0 0 ${sz * 3}px ${sz}px ${pal.subject}`, opacity: Math.sin(t * Math.PI) * k}} />;
      })}
    </AbsoluteFill>
  );
};

/** A photo on white card stock that pops onto the desk. */
export const Card: React.FC<{src: string; x: number; y: number; w: number; h?: number; rot?: number; at: number; filter?: string; fit?: 'cover' | 'contain'}> = ({
  src, x, y, w, h, rot = 0, at, filter = 'grayscale(1) contrast(1.2)', fit = 'cover',
}) => {
  const g = useGFrame();
  if (g < at) return null;
  const k = interpolate(g, [at, at + 5], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) * (1 - 2.2 * t * (1 - t))});
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `scale(${0.6 + 0.4 * k}) rotate(${rot}deg)`, opacity: Math.min(1, k * 2)}}>
      <div style={{background: '#f4efe6', padding: Math.max(8, w * 0.025), boxShadow: '0 18px 34px rgba(0,0,0,0.6)'}}>
        <Img src={staticFile(src)} style={{width: '100%', height: h, objectFit: fit, display: 'block', filter}} />
      </div>
    </div>
  );
};
