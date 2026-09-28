// YouTube thumbnail concepts for King Andrew, drawn at 1920x1080 with the video's own kit and exported at
// 1280x720. Render the last frame so every write-on is finished (tools/thumbs_v3.mjs uses frame 140).
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {Wordmark} from './Intro';
import {DrawnCrown, fill} from './shell';
import {Finish, Highlight, INK, Note, PALETTES, PaletteCtx, Picture, Place, Tint, Traced} from './Kit';
import {MASKS} from './masks';

export const THUMB_FRAMES = 150;
const TEAL = '#2FE0C4';
const CORAL = '#FF6F61';
const SULLY: [number, number] = [1920, 2288];

/** Channel logo, top-left (YouTube covers the bottom-right with the running time). */
const Logo: React.FC<{right?: boolean}> = ({right}) => {
  const s = 0.27;
  return (
    <div style={{position: 'absolute', left: right ? 1920 - 36 - 1440 * s : 36, top: 30, width: 1440 * s, height: 530 * s, overflow: 'hidden', borderRadius: 14, background: 'rgba(13,12,9,0.78)', boxShadow: '0 8px 24px rgba(0,0,0,0.6)'}}>
      <div style={{position: 'absolute', left: -170 * s, top: -275 * s, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: '0 0'}}>
        <Wordmark clockAt={0} numAt={0} minAt={0} hisAt={0} />
      </div>
    </div>
  );
};

/** The subject tint limited to one side of a vertical line at screen x = `mid`. */
const SideTint: React.FC<{place: Place; color: string; mid: number; side: 'left' | 'right'}> = ({place, color, mid, side}) => {
  const w = SULLY[0] * place.scale;
  const m0 = mid - place.left;
  const m: React.CSSProperties = {
    position: 'absolute', left: place.left, top: place.top, width: w, height: SULLY[1] * place.scale,
    WebkitMaskImage: `url(${staticFile(MASKS.sully.alpha)})`, WebkitMaskSize: '100% 100%', maskImage: `url(${staticFile(MASKS.sully.alpha)})`, maskSize: '100% 100%',
    clipPath: side === 'left' ? `inset(0 ${w - m0}px 0 0)` : `inset(0 0 0 ${m0}px)`,
  } as React.CSSProperties;
  return (
    <>
      <div style={{...m, background: color, mixBlendMode: 'color'}} />
      <div style={{...m, background: color, mixBlendMode: 'multiply', opacity: 0.3}} />
      <div style={{...m, background: color, mixBlendMode: 'screen', opacity: 0.28}} />
    </>
  );
};

/** A · Same face, two answers: teal People's President, coral King Andrew with a drawn crown. */
const ThumbA: React.FC = () => {
  const place = fill(SULLY, 960, 820, 1.02);
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <Picture src="img/jackson_sully_1845.jpg" place={place} size={SULLY} bw="grayscale(1) contrast(1.25) brightness(0.85)" />
      <SideTint place={place} color={TEAL} mid={960} side="left" />
      <SideTint place={place} color={CORAL} mid={960} side="right" />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(0,0,0,0.7) 100%)'}} />
      <div style={{position: 'absolute', left: 956, top: 0, width: 8, height: 1080, background: '#f4efe6'}} />
      <DrawnCrown x0={1060} x1={1500} y={300} h={150} at={0} dur={1} width={14} color={CORAL} />
      <Highlight text="HERO" x={70} y={800} size={170} at={0} seed={71} rot={-3} />
      <Highlight text="OR KING?" x={1000} y={800} size={170} at={0} seed={73} rot={-2} />
      <Logo />
      <Finish vignette={0.3} />
    </AbsoluteFill>
  );
};

/** B · The 1833 cartoon, Jackson in coral, and the title. */
const ThumbB: React.FC = () => {
  const size: [number, number] = [1017, 1536];
  const place: Place = {left: 1060, top: -60, scale: 0.8};
  return (
    <AbsoluteFill style={{background: '#15130f', overflow: 'hidden'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 45% 40%, #2a2620 0%, #16140f 70%, #0d0c09 100%)'}} />
      <Picture src="img/v3/ch01/king_andrew_1833.jpg" place={place} size={size} bw="grayscale(1) contrast(1.3)" />
      <Tint mask={MASKS.king_andrew.alpha} place={place} size={size} />
      <Traced paths={MASKS.king_andrew.data.shapes.subject} place={place} at={0} dur={1} width={8} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(8,7,5,0.95) 0%, rgba(8,7,5,0.85) 45%, rgba(8,7,5,0) 60%)'}} />
      <Note text="the People's President..." x={90} y={330} size={70} rot={-3} color={TEAL} />
      <Highlight text="KING" x={80} y={440} size={230} at={0} seed={75} rot={-3} />
      <Highlight text="ANDREW?" x={120} y={700} size={170} at={0} seed={77} rot={-2} />
      <Logo />
      <Finish vignette={0.3} />
    </AbsoluteFill>
  );
};

/** C · Jackson in coral with a crown drawn on, and the question from the cold open. */
const ThumbC: React.FC = () => {
  const place = fill(SULLY, 700, 900, 1.0);
  const S = (x: number, y: number) => [place.left + x * place.scale, place.top + y * place.scale];
  const [x0, y] = S(560, 640);
  const [x1] = S(1300, 640);
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <Picture src="img/jackson_sully_1845.jpg" place={place} size={SULLY} bw="grayscale(1) contrast(1.25) brightness(0.9)" />
      <Tint mask={MASKS.sully.alpha} place={place} size={SULLY} />
      <Traced paths={MASKS.sully.data.shapes.subject} place={place} at={0} dur={1} width={8} />
      <DrawnCrown x0={x0} x1={x1} y={y} h={170} at={0} dur={1} width={14} color={TEAL} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(8,7,5,0) 45%, rgba(8,7,5,0.85) 68%, rgba(8,7,5,0.95) 100%)'}} />
      <Note text="how did the People's" x={1080} y={260} size={60} rot={-3} color="#f4efe6" />
      <Note text="President become a..." x={1100} y={350} size={60} rot={-3} color="#f4efe6" />
      <Highlight text="KING?" x={1090} y={500} size={220} at={0} seed={79} rot={-4} />
      <Logo />
      <Finish vignette={0.3} />
    </AbsoluteFill>
  );
};

const wrap = (C: React.FC) => () => (
  <PaletteCtx.Provider value={PALETTES.locked}>
    <C />
  </PaletteCtx.Provider>
);
export const V3ThumbA = wrap(ThumbA);
export const V3ThumbB = wrap(ThumbB);
export const V3ThumbC = wrap(ThumbC);
