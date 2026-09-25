import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, pop} from '../lib/anim';
import {C, F} from '../lib/theme';
import type {Narration} from '../lib/timing';
import {Captions} from './Captions';
import {Grain, InkDefs, Paper} from './Paper';

export const CHAPTER_SECONDS = 3.2;

/**
 * Everything a scene shares: paper, ink filters, narration, a music cue, captions, grain.
 * `lead` frames of chapter card come first; the scene body and narration start after it.
 */
export const SceneShell: React.FC<{
  narration: Narration;
  audio: string;
  music?: string;
  /** music volume at a frame of the whole shell (chapter card included) */
  musicVolume?: (f: number) => number;
  captions: boolean;
  chapter?: {number: string; title: string; year: string};
  children: React.ReactNode;
}> = ({narration, audio, music, musicVolume, captions, chapter, children}) => {
  const {fps} = useVideoConfig();
  const lead = chapter ? Math.round(CHAPTER_SECONDS * fps) : 0;
  const body = Math.ceil(narration.duration * fps);
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden'}}>
      <InkDefs />
      {music && <Audio src={staticFile(music)} volume={musicVolume ?? 0.15} />}
      {chapter && (
        <Sequence durationInFrames={lead + 8}>
          <ChapterCard {...chapter} out={lead} />
        </Sequence>
      )}
      <Sequence from={lead} durationInFrames={body}>
        <Audio src={staticFile(audio)} />
        <AbsoluteFill>
          <Paper />
          {children}
          <Grain />
        </AbsoluteFill>
        {captions && <Captions words={narration.words} />}
      </Sequence>
    </AbsoluteFill>
  );
};

/** Chapter opener in the broadside style, with a page turn. */
export const ChapterCard: React.FC<{number: string; title: string; year: string; out: number}> = ({number, title, year, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = pop(frame, 2, fps, 200, 18);
  const b = pop(frame, 10, fps, 160, 16);
  const o = interpolate(frame, [out - 6, out + 4], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Audio src={staticFile('sfx/page_turn.wav')} volume={0.6} />
      <Paper />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', filter: 'url(#ink)'}}>
        <div
          style={{
            background: C.red,
            color: C.paperLight,
            fontFamily: F.slab,
            fontSize: 40,
            letterSpacing: 12,
            padding: '10px 34px',
            transform: `rotate(-1.5deg) scale(${0.7 + 0.3 * a})`,
            opacity: a,
          }}
        >
          CHAPTER {number.toUpperCase()}
        </div>
        <div style={{fontFamily: F.fat, fontSize: Math.min(150, Math.floor(3500 / title.length)), color: C.ink, marginTop: 26, whiteSpace: 'nowrap', opacity: b, transform: `translateY(${(1 - b) * 30}px)`}}>
          {title}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 28, marginTop: 14, opacity: b}}>
          <div style={{width: 200 * b, height: 3, background: C.ink}} />
          <div style={{fontFamily: F.sc, fontSize: 56, color: C.inkSoft, letterSpacing: 6}}>{year}</div>
          <div style={{width: 200 * b, height: 3, background: C.ink}} />
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

/** One-shot sound effect at a frame. */
export const Sfx: React.FC<{src: string; at: number; volume?: number; frames?: number}> = ({src, at, volume = 0.6, frames = 150}) => (
  <Sequence from={at} durationInFrames={frames} layout="none">
    <Audio src={staticFile(`sfx/${src}.wav`)} volume={volume} />
  </Sequence>
);

/**
 * A music cue that starts at `at` (scene frames), fades in and out, and can be ducked.
 * `level` is the steady volume under narration.
 */
export const Cue: React.FC<{src: string; at: number; until: number; level?: number; fadeIn?: number; fadeOut?: number}> = ({
  src,
  at,
  until,
  level = 0.15,
  fadeIn = 20,
  fadeOut = 30,
}) => (
  <Sequence from={at} durationInFrames={until - at + fadeOut} layout="none">
    <Audio
      src={staticFile(src)}
      volume={(f) => interpolate(f, [0, fadeIn, until - at, until - at + fadeOut], [0, level, level, 0], clamp)}
    />
  </Sequence>
);
