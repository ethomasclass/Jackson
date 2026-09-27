// Mitchell's 1836 map: places (in map pixels, read off the scan), a moving camera, pins, routes, regions.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp} from '../lib/anim';
import {INK, useGFrame, usePal} from './Kit';
import {MapView, mapToScreen} from './common';

export const PLACES = {
  waxhaws: [2600, 2672],
  charlotte: [2570, 2640],
  charleston: [2695, 3000],
  columbia: [2645, 2790],
  nashville: [2030, 2550],
  horseshoeBend: [1985, 2960],
  newOrleans: [1560, 3330],
  newEchota: [2106, 2733],
  washington: [3020, 2170],
  philadelphia: [3162, 1970],
  indiana: [1930, 2000],
  illinois: [1750, 1990],
  kentucky: [2000, 2345],
  southCarolina: [2700, 2830],
  georgia: [2262, 3019],
  indianTerritory: [1150, 2650],
  cherokee: [2150, 2700],
  creek: [2020, 2900],
  choctaw: [1700, 2860],
  chickasaw: [1760, 2680],
  seminole: [2300, 3360],
  boston: [3489, 1660],
  lowell: [3470, 1600],
  atlantic: [3600, 2700],
} as const;
export type Pt = readonly [number, number] | number[];

/** A camera path: keyframes of {f, x, y, s}; zoom interpolates in log space so it feels even. */
export type Cam = {f: number; x: number; y: number; s: number};
export const camAt = (keys: Cam[], frame: number): Cam => {
  if (frame <= keys[0].f) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (frame <= b.f) {
      const t = Easing.inOut(Easing.cubic)((frame - a.f) / Math.max(1, b.f - a.f));
      return {f: frame, x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, s: Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * t)};
    }
  }
  return keys[keys.length - 1];
};

/** Full-frame map with a moving camera. `children(S, cam)` draws screen-space overlays. */
export const MapScene: React.FC<{keys: Cam[]; dim?: number; svg?: (cam: Cam) => React.ReactNode; children?: (S: (p: Pt) => number[], cam: Cam) => React.ReactNode}> = ({keys, dim = 0.15, svg, children}) => {
  const frame = useCurrentFrame();
  const cam = camAt(keys, frame);
  const S = mapToScreen(cam.x, cam.y, cam.s);
  return (
    <AbsoluteFill style={{background: '#15130f', overflow: 'hidden'}}>
      <MapView cx={cam.x} cy={cam.y} s={cam.s} dim={dim}>{svg?.(cam)}</MapView>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(8,6,4,0.8) 100%)'}} />
      {children?.((p) => S([p[0], p[1]]), cam)}
    </AbsoluteFill>
  );
};

/** Teal pin that pops 0 -> 1.35 -> 1 over 6 frames. Screen coordinates. */
export const Pin: React.FC<{x: number; y: number; at: number; r?: number; color?: string}> = ({x, y, at, r = 13, color}) => {
  const g = useGFrame();
  const pal = usePal();
  if (g < at) return null;
  const k = interpolate(g, [at, at + 3, at + 6], [0, 1.35, 1], clamp);
  return <div style={{position: 'absolute', left: x - r * k, top: y - r * k, width: 2 * r * k, height: 2 * r * k, borderRadius: '50%', background: color ?? pal.mark, border: `4px solid ${INK}`,
    boxShadow: `0 0 0 4px rgba(47,224,196,0.35)`, boxSizing: 'border-box'}} />;
};

/** A route in map pixels drawn on from `at` over `dur` frames (inside the map's SVG). */
export const Route: React.FC<{pts: Pt[]; at: number; dur?: number; width?: number; color?: string; dashed?: boolean; frameOverride?: number}> = ({pts, at, dur = 24, width = 14, color, dashed}) => {
  const g = useGFrame();
  const pal = usePal();
  const p = interpolate(g, [at, at + dur], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  if (p <= 0) return null;
  const d = smooth(pts);
  return (
    <>
      <path d={d} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={width * 1.4} strokeLinecap="round" strokeLinejoin="round" transform="translate(6 9)" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      <path d={d} fill="none" stroke={color ?? pal.mark} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" pathLength={1}
        strokeDasharray={dashed ? undefined : 1} strokeDashoffset={dashed ? undefined : 1 - p} style={dashed ? {clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`} : undefined} />
    </>
  );
};

/** Catmull-Rom through the points, as an SVG path. */
export const smooth = (pts: Pt[]) => {
  if (pts.length < 3) return `M${pts[0][0]},${pts[0][1]} L${pts[pts.length - 1][0]},${pts[pts.length - 1][1]}`;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
};

/** A shaded region (map pixels), fading in over 14 frames. */
export const Region: React.FC<{pts: Pt[]; at: number; color?: string; fill?: string; width?: number}> = ({pts, at, color, fill, width = 10}) => {
  const g = useGFrame();
  const pal = usePal();
  if (g < at) return null;
  const k = interpolate(g, [at, at + 14], [0, 1], clamp);
  return <path d={smooth([...pts, pts[0]]) + ' Z'} fill={fill ?? `${color ?? pal.mark}33`} stroke={color ?? pal.mark} strokeWidth={width} opacity={k} strokeLinejoin="round" />;
};
