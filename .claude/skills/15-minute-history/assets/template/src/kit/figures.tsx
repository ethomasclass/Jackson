// Simple drawn figures: a standing person (voters, crowds, the people left out).
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

