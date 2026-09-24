import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, pop} from '../lib/anim';
import {C, F} from '../lib/theme';
import {Grain, InkDefs, Paper} from './Paper';

/** Series title as an 1830s broadside: double rules, fat-face title, red part banner. */
export const TitleCard: React.FC<{part: string; title: string}> = ({part, title}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = pop(frame, 2, fps, 260, 18);
  const b = pop(frame, 14, fps, 160, 16);
  const c = pop(frame, 26, fps, 120, 18);
  const rule = interpolate(frame, [0, 20], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <InkDefs />
      <Audio src={staticFile('sfx/boom.wav')} volume={0.8} />
      <Paper />
      <AbsoluteFill style={{padding: 60}}>
        <div style={{position: 'absolute', inset: 60, border: `6px solid ${C.ink}`, opacity: rule}} />
        <div style={{position: 'absolute', inset: 76, border: `2px solid ${C.ink}`, opacity: rule}} />
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', filter: 'url(#ink)'}}>
        <div style={{fontFamily: F.sc, fontSize: 52, letterSpacing: 18, color: C.inkSoft, opacity: a}}>THE</div>
        <div
          style={{
            fontFamily: F.fat,
            fontSize: 210,
            lineHeight: 0.95,
            color: C.ink,
            transform: `scale(${1 + 0.6 * (1 - a)})`,
            opacity: Math.min(1, a * 2),
          }}
        >
          Age of Jackson
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 30, margin: '26px 0 22px', opacity: b}}>
          <div style={{width: 260 * b, height: 4, background: C.ink}} />
          <div
            style={{
              background: C.red,
              color: C.paperLight,
              fontFamily: F.slab,
              fontSize: 44,
              letterSpacing: 10,
              padding: '10px 36px',
              transform: `rotate(-1.5deg) scale(${0.7 + 0.3 * b})`,
            }}
          >
            {part.toUpperCase()}
          </div>
          <div style={{width: 260 * b, height: 4, background: C.ink}} />
        </div>
        <div
          style={{
            fontFamily: F.italic,
            fontStyle: 'italic',
            fontSize: 86,
            color: C.ink,
            opacity: c,
            transform: `translateY(${(1 - c) * 30}px)`,
          }}
        >
          {title}
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};
