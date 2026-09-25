import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from '../lib/anim';
import {F, P} from '../lib/theme';
import type {Narration} from '../lib/timing';
import {Rule, TicketCaptions, Wood} from './Signs';
import {DropCurtain, Theater} from './Stage';

export const SCENE_CARD_SECONDS = 3.6;

/**
 * One scene of Video 2: the curtain is down while a scene board is lowered ("SCENE III ·
 * The Four-Week Boast · 1811"), then the scene body plays with its narration and ticket captions.
 * The body's frame 0 is the first frame after the card; the body raises the curtain itself.
 */
export const TheaterScene: React.FC<{
  narration: Narration;
  audio: string;
  captions: boolean;
  scene: {n: string; title: string; years: string};
  tail?: number;
  children: React.ReactNode;
}> = ({narration, audio, captions, scene, tail = 0, children}) => {
  const {fps} = useVideoConfig();
  const lead = Math.round(SCENE_CARD_SECONDS * fps);
  const body = Math.ceil(narration.duration * fps) + tail;
  return (
    <AbsoluteFill style={{background: '#140D09'}}>
      <Sequence durationInFrames={lead}>
        <SceneBoard {...scene} out={lead} />
      </Sequence>
      <Sequence from={lead} durationInFrames={body}>
        <Audio src={staticFile(audio)} />
        {children}
        {captions && <TicketCaptions words={narration.words} />}
      </Sequence>
    </AbsoluteFill>
  );
};

const SceneBoard: React.FC<{n: string; title: string; years: string; out: number}> = ({n, title, years, out}) => {
  const frame = useCurrentFrame();
  const drop = interpolate(frame, [0, 14], [-700, 0], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
  const bounce = Math.sin(frame / 4) * 10 * Math.exp(-frame / 10) * (frame > 14 ? 1 : 0);
  const lift = interpolate(frame, [out - 12, out], [0, -800], clamp);
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={40} layout="none">
        <Audio src={staticFile('sfx/pulley.wav')} volume={0.4} />
      </Sequence>
      <Theater cam={[[0, 0.93, 960, 575], [out, 0.95, 960, 575]]}>
        <DropCurtain keys={[[0, 0]]} />
      </Theater>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{transform: `translateY(${drop + bounce + lift}px)`, position: 'relative'}}>
          {[0.15, 0.85].map((k) => (
            <div key={k} style={{position: 'absolute', left: `${k * 100}%`, top: -1200, width: 4, height: 1200, background: 'repeating-linear-gradient(0deg, #8a6a44 0 6px, #5b4128 6px 12px)'}} />
          ))}
          <div
            style={{
              minWidth: 900,
              padding: '26px 60px 30px',
              background: `radial-gradient(ellipse at 50% 40%, #FBF3DD 0%, ${P.card} 60%, #E6D2A6 100%)`,
              border: `6px double ${P.ink}`,
              boxShadow: '14px 22px 40px rgba(0,0,0,0.6)',
              textAlign: 'center',
              color: P.ink,
            }}
          >
            <div style={{display: 'inline-block', background: P.vermilion, color: P.cream, fontFamily: F.slab, fontSize: 36, letterSpacing: 12, padding: '6px 30px'}}>SCENE {n}</div>
            <Wood size={Math.min(110, Math.floor(2600 / title.length))} font="rye" style={{marginTop: 18}}>
              {title}
            </Wood>
            <Rule color={P.vermilion} />
            <div style={{fontFamily: F.sc, fontSize: 44, letterSpacing: 6}}>{years}</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
