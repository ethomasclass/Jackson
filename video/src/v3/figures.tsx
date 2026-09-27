// Simple drawn figures for the suffrage graphic and the coffins of the 1828 Coffin Handbill.
import React from 'react';
import {interpolate} from 'remotion';
import {clamp} from '../lib/anim';
import {INK, useGFrame} from './Kit';

/** A standing figure (hat optional). `dashed` draws only a dashed outline (people left out). */
export const Person: React.FC<{x: number; y: number; h?: number; color?: string; at?: number; dashed?: boolean; hat?: boolean; dress?: boolean}> = ({
  x, y, h = 160, color = '#f4efe6', at = -999, dashed = false, hat = true, dress = false,
}) => {
  const g = useGFrame();
  if (g < at) return null;
  const k = interpolate(g, [at, at + 3, at + 6], [0, 1.2, 1], clamp);
  const s = h / 160;
  const body = dress
    ? 'M -20 46 Q 0 38 20 46 L 34 150 L -34 150 Z'
    : 'M -24 46 Q 0 36 24 46 L 30 110 L 18 110 L 16 158 L 3 158 L 0 116 L -3 158 L -16 158 L -18 110 L -30 110 Z';
  const st = dashed ? {fill: 'none', stroke: color, strokeWidth: 3.5 / s, strokeDasharray: `${9 / s} ${7 / s}`} : {fill: color, stroke: INK, strokeWidth: 2 / s};
  return (
    <svg style={{position: 'absolute', left: x - 50 * s, top: y - h, overflow: 'visible', transform: `scale(${k})`, transformOrigin: 'bottom center'}} width={100 * s} height={h}>
      <g transform={`translate(${50 * s} 0) scale(${s})`}>
        <circle cx={0} cy={24} r={17} {...st} />
        {hat && !dress && <path d="M -26 12 L 26 12 L 26 8 L 16 8 L 14 -10 L -14 -10 L -16 8 L -26 8 Z" {...st} />}
        {dress && <path d="M -22 18 Q 0 -8 22 18 Q 0 8 -22 18 Z" {...st} />}
        <path d={body} {...st} />
      </g>
    </svg>
  );
};

/** One black coffin with a cream outline, popping in. */
export const Coffin: React.FC<{x: number; y: number; w?: number; at: number; rot?: number}> = ({x, y, w = 90, at, rot = 0}) => {
  const g = useGFrame();
  if (g < at) return null;
  const k = interpolate(g, [at, at + 3, at + 6], [0, 1.25, 1], clamp);
  const h = w * 2.4;
  return (
    <svg style={{position: 'absolute', left: x, top: y, overflow: 'visible', transform: `scale(${k}) rotate(${rot}deg)`}} width={w} height={h}>
      <path d={`M ${w * 0.3} 0 L ${w * 0.7} 0 L ${w} ${h * 0.25} L ${w * 0.78} ${h} L ${w * 0.22} ${h} L 0 ${h * 0.25} Z`} fill="#0b0a08" stroke="#f4efe6" strokeWidth={4} strokeLinejoin="round" />
      <path d={`M ${w * 0.5} ${h * 0.2} L ${w * 0.5} ${h * 0.55} M ${w * 0.33} ${h * 0.31} L ${w * 0.67} ${h * 0.31}`} stroke="#f4efe6" strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
};

/**
 * Clay's American System as a three-legged stool: TARIFFS, A NATIONAL BANK, ROADS & CANALS.
 * Each leg appears at `show[i]` and can be knocked out (crossed and tilted) at `knock[i]`.
 */
export const Stool: React.FC<{x: number; y: number; show: number[]; knock?: number[]; scale?: number}> = ({x, y, show, knock = [1e7, 1e7, 1e7], scale = 1}) => {
  const g = useGFrame();
  const legs: [string, number, number][] = [['TARIFFS', -200, -18], ['A NATIONAL BANK', 0, 0], ['ROADS & CANALS', 200, 18]];
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `scale(${scale})`, transformOrigin: 'top center'}}>
      <svg style={{position: 'absolute', left: -320, top: -40, overflow: 'visible'}} width={640} height={520}>
        <ellipse cx={320} cy={60} rx={280} ry={46} fill="#8a6a45" stroke="#f4efe6" strokeWidth={5} />
        {legs.map(([, dx, rot], i) => {
          if (g < show[i]) return null;
          const k = interpolate(g, [knock[i], knock[i] + 8], [0, 1], clamp);
          return (
            <g key={i} transform={`translate(${320 + dx} 90) rotate(${rot + k * (i === 1 ? 40 : rot > 0 ? 50 : -50)}) translate(0 ${k * 60})`} opacity={1 - k * 0.35}>
              <rect x={-18} y={0} width={36} height={330} fill="#8a6a45" stroke="#f4efe6" strokeWidth={5} />
            </g>
          );
        })}
      </svg>
      {legs.map(([label, dx], i) => {
        if (g < show[i]) return null;
        const k = interpolate(g, [knock[i], knock[i] + 6], [0, 1], clamp);
        return (
          <div key={label} style={{position: 'absolute', left: dx * 1.6 - 140, top: 420, width: 280, textAlign: 'center', fontFamily: '"Abril Fatface", serif', fontSize: 30, color: '#f4efe6', textShadow: '0 3px 10px #000'}}>
            {label}
            {k > 0 && <div style={{position: 'absolute', left: 20, top: 20, height: 7, width: 260 * k, background: '#FF6F61', transform: 'rotate(-4deg)'}} />}
          </div>
        );
      })}
    </div>
  );
};
