// The 24 states of 1824-28 as a tile grid (roughly where they sit on a map), for the 1824 House vote
// and the "who picks the electors" beat of the suffrage graphic.
import React from 'react';
import {interpolate} from 'remotion';
import {clamp} from '../lib/anim';
import {INK, JF, useGFrame} from './Kit';

export const STATES: Record<string, [number, number]> = {
  ME: [10, 0], VT: [8, 1], NH: [9, 1], NY: [8, 2], MA: [9, 2],
  IL: [4, 3], IN: [5, 3], OH: [6, 3], PA: [7, 3], NJ: [8, 3], CT: [9, 3], RI: [10, 3],
  MO: [3, 4], KY: [5, 4], VA: [7, 4], MD: [8, 4], DE: [9, 4],
  TN: [5, 5], NC: [7, 5],
  MS: [4, 6], AL: [5, 6], GA: [6, 6], SC: [7, 6],
  LA: [3, 7],
};

export type TileState = {fill?: string; label?: string; at?: number; ring?: number; dim?: boolean};

/** Draws every state tile; `state(code)` returns how each tile looks and when it changes (a pop when `at` is reached). */
export const Tiles: React.FC<{x: number; y: number; size?: number; gap?: number; appear?: number; state: (code: string) => TileState; ringColor?: string}> = ({x, y, size = 96, gap = 10, appear = 0, state, ringColor = '#2FE0C4'}) => {
  const g = useGFrame();
  return (
    <>
      {Object.entries(STATES).map(([code, [c, r]], i) => {
        const on = appear + i;
        if (g < on) return null;
        const st = state(code);
        const changed = st.at !== undefined && g >= st.at;
        const pop = st.at !== undefined ? interpolate(g, [st.at, st.at + 3, st.at + 6], [1, 1.18, 1], clamp) : 1;
        const bg = changed || st.at === undefined ? st.fill ?? 'rgba(244,239,230,0.12)' : 'rgba(244,239,230,0.12)';
        const light = bg.startsWith('#F') || bg.startsWith('#f') || bg.startsWith('#E') || bg === '#2FE0C4';
        return (
          <div key={code} style={{position: 'absolute', left: x + c * (size + gap), top: y + r * (size + gap), width: size, height: size, background: bg,
            border: '3px solid rgba(244,239,230,0.55)', boxSizing: 'border-box', transform: `scale(${pop})`, opacity: st.dim ? 0.35 : 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.5)'}}>
            <div style={{fontFamily: JF.display, fontSize: size * 0.36, color: light ? INK : '#f4efe6', lineHeight: 1}}>{code}</div>
            {st.label && changed && <div style={{fontFamily: JF.mono, fontSize: size * 0.13, letterSpacing: 1, color: light ? INK : '#f4efe6', marginTop: 4}}>{st.label}</div>}
            {st.ring !== undefined && g >= st.ring && (
              <div style={{position: 'absolute', inset: -14, borderRadius: '50%', border: `6px solid ${ringColor}`, transform: `scale(${interpolate(g, [st.ring, st.ring + 6], [0.4, 1], clamp)})`}} />
            )}
          </div>
        );
      })}
    </>
  );
};
