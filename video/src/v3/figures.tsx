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

/**
 * Clay's American System as three index cards with teal line drawings: TARIFFS (a crate of imported goods),
 * A NATIONAL BANK (the Greek-columned bank), ROADS & CANALS (a winding road). Card i draws on at show[i];
 * at knock[i] a coral X is slashed across it and it dims.
 */
export const SystemCards: React.FC<{x: number; y: number; show: number[]; knock?: number[]; scale?: number}> = ({x, y, show, knock = [1e7, 1e7, 1e7], scale = 1}) => {
  const g = useGFrame();
  const T = '#2FE0C4';
  const C = '#FF6F61';
  const icons = [
    // crate with cross-bracing, a "TAX" tag and a bolt of cloth on top
    'M 60 120 L 240 120 L 240 240 L 60 240 Z M 60 120 L 240 240 M 240 120 L 60 240 M 90 120 L 90 100 Q 150 70 210 100 L 210 120 M 110 100 Q 150 85 190 100',
    // pediment, entablature, six columns, steps
    'M 50 110 L 150 60 L 250 110 Z M 45 110 L 255 110 L 255 124 L 45 124 Z M 70 124 L 70 220 M 102 124 L 102 220 M 134 124 L 134 220 M 166 124 L 166 220 M 198 124 L 198 220 M 230 124 L 230 220 M 40 220 L 260 220 L 260 234 L 40 234 Z M 30 234 L 270 234 L 270 248 L 30 248 Z',
    // road winding to the horizon, with a dashed centre line and a milestone
    'M 30 250 C 120 210 60 170 150 140 C 210 120 190 100 240 80 M 110 250 C 180 215 140 175 205 145 C 245 128 238 106 262 88 M 70 250 C 150 212 100 172 178 142 M 40 90 L 270 90 M 60 175 L 60 205 L 80 205 L 80 175 Z',
  ];
  const labels = ['TARIFFS', 'A NATIONAL BANK', 'ROADS & CANALS'];
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `scale(${scale})`, transformOrigin: 'top left'}}>
      {labels.map((label, i) => {
        if (g < show[i]) return null;
        const draw = interpolate(g, [show[i], show[i] + 10], [0, 1], clamp);
        const pop = interpolate(g, [show[i], show[i] + 3, show[i] + 6], [0.6, 1.08, 1], clamp);
        const k = interpolate(g, [knock[i], knock[i] + 6], [0, 1], clamp);
        return (
          <div key={label} style={{position: 'absolute', left: i * 340, top: 0, width: 300, height: 360, transform: `scale(${pop}) rotate(${(i - 1) * 2 + k * 6}deg)`, opacity: 1 - k * 0.35}}>
            <div style={{position: 'absolute', inset: 0, background: '#1d1a15', border: '3px solid rgba(244,239,230,0.55)', boxShadow: '0 16px 30px rgba(0,0,0,0.6)',
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '100% 30px'}} />
            <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={300} height={300}>
              <path d={icons[i]} fill="none" stroke={T} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
              {k > 0 && (
                <>
                  <line x1={20} y1={20} x2={20 + 260 * Math.min(1, k * 2)} y2={20 + 300 * Math.min(1, k * 2)} stroke={C} strokeWidth={16} strokeLinecap="round" />
                  {k > 0.5 && <line x1={280} y1={20} x2={280 - 260 * (k * 2 - 1)} y2={20 + 300 * (k * 2 - 1)} stroke={C} strokeWidth={16} strokeLinecap="round" />}
                </>
              )}
            </svg>
            <div style={{position: 'absolute', left: 0, right: 0, top: 285, textAlign: 'center', fontFamily: '"Abril Fatface", serif', fontSize: 26, color: '#111', lineHeight: 1, whiteSpace: 'nowrap'}}>
              <span style={{background: '#FF9F1C', padding: '6px 12px', boxDecorationBreak: 'clone'}}>{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
