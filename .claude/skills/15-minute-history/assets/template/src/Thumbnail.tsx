// YouTube thumbnail concepts, drawn at 1920x1080 with the video's own kit and exported at 1280x720
// (tools/thumbs.mjs renders frame 140 so every write-on has finished).
//   A · the split: one cut-out portrait, teal half / coral half, a gold crown resting on the head, two words under the chin.
//   B · title-led: a portrait card on the desk, a big highlighter word, a handwritten setup line.
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {Wordmark} from './kit/Intro';
import {DrawnCrown} from './kit/shell';
import {Finish, Highlight, Note, PALETTES, PaletteCtx, Picture, type Place, Tint, Traced} from './kit/Kit';
import {DarkPaper} from './kit/common';
import {MASKS} from './masks';
import {THUMB_PORTRAIT as P, THUMB_WORDS, TITLE} from './project';

export const THUMB_FRAMES = 150;
const TEAL = '#2FE0C4';
const CORAL = '#FF6F61';
const GOLD = '#FF9F1C';
const MASK = MASKS.sully; // the mask that matches THUMB_PORTRAIT.src

/** Channel logo, top-left (YouTube covers the bottom-right with the running time). */
const Logo: React.FC = () => {
  const s = 0.27;
  return (
    <div style={{position: 'absolute', left: 36, top: 30, width: 1440 * s, height: 530 * s, overflow: 'hidden', borderRadius: 14, background: 'rgba(13,12,9,0.78)', boxShadow: '0 8px 24px rgba(0,0,0,0.6)'}}>
      <div style={{position: 'absolute', left: -170 * s, top: -275 * s, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: '0 0'}}>
        <Wordmark clockAt={0} numAt={0} minAt={0} hisAt={0} />
      </div>
    </div>
  );
};

const cut = (alpha: string): React.CSSProperties =>
  ({WebkitMaskImage: `url(${staticFile(alpha)})`, WebkitMaskSize: '100% 100%', maskImage: `url(${staticFile(alpha)})`, maskSize: '100% 100%'}) as React.CSSProperties;

/**
 * The subject tint on one side of the line x = `mid`. The clip sits on each blended layer itself: a clip-path on a
 * wrapper would isolate the blend and the tint would come out flat.
 */
const SideTint: React.FC<{place: Place; color: string; mid: number; side: 'left' | 'right'}> = ({place, color, mid, side}) => {
  const w = P.size[0] * place.scale;
  const m0 = mid - place.left;
  const m: React.CSSProperties = {
    position: 'absolute', left: place.left, top: place.top, width: w, height: P.size[1] * place.scale, ...cut(MASK.alpha),
    clipPath: side === 'left' ? `inset(0 ${w - m0}px 0 0)` : `inset(0 0 0 ${m0}px)`,
  };
  return (
    <>
      <div style={{...m, background: color, mixBlendMode: 'color'}} />
      <div style={{...m, background: color, mixBlendMode: 'multiply', opacity: 0.3}} />
      <div style={{...m, background: color, mixBlendMode: 'screen', opacity: 0.28}} />
    </>
  );
};

export const ThumbA: React.FC = () => {
  const place: Place = {left: 960 - P.faceX * P.scale, top: P.top, scale: P.scale};
  const S = (x: number, y: number) => [place.left + x * place.scale, place.top + y * place.scale];
  const [x0, y] = S(P.crownLeft, P.crownY);
  const [x1] = S(P.crownRight, P.crownY);
  return (
    <PaletteCtx.Provider value={PALETTES.locked}>
      <AbsoluteFill style={{background: '#15130f', overflow: 'hidden'}}>
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2a2620 0%, #16140f 70%, #0d0c09 100%)'}} />
        <div style={{position: 'absolute', left: place.left, top: place.top, width: P.size[0] * place.scale, height: P.size[1] * place.scale, ...cut(MASK.alpha), filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.6))'}}>
          <Picture src={P.src} place={{left: 0, top: 0, scale: place.scale}} size={P.size} bw="grayscale(1) contrast(1.25) brightness(0.9)" />
        </div>
        <SideTint place={place} color={TEAL} mid={960} side="left" />
        <SideTint place={place} color={CORAL} mid={960} side="right" />
        <Traced paths={MASK.data.shapes.subject} place={place} at={0} dur={1} width={7} color="#f4efe6" />
        <div style={{position: 'absolute', left: 956, top: 0, width: 8, height: 1080, background: '#f4efe6'}} />
        <AbsoluteFill style={{filter: 'drop-shadow(0 0 3px #0d0c09) drop-shadow(0 6px 10px rgba(0,0,0,0.8))'}}>
          <DrawnCrown x0={x0} x1={x1} y={y} h={125} at={0} dur={1} width={15} color={GOLD} />
        </AbsoluteFill>
        <Highlight text={THUMB_WORDS.left} x={170} y={855} size={150} at={0} seed={71} rot={-3} />
        <Highlight text={THUMB_WORDS.right} x={1010} y={855} size={150} at={0} seed={73} rot={-2} />
        <Logo />
        <Finish vignette={0.3} />
      </AbsoluteFill>
    </PaletteCtx.Provider>
  );
};

export const ThumbB: React.FC = () => {
  const place: Place = {left: 1080, top: 60, scale: 0.42};
  return (
    <PaletteCtx.Provider value={PALETTES.locked}>
      <AbsoluteFill style={{background: '#15130f', overflow: 'hidden'}}>
        <DarkPaper />
        <Picture src={P.src} place={place} size={P.size} bw="grayscale(1) contrast(1.3)" />
        <Tint mask={MASK.alpha} place={place} size={P.size} />
        <Traced paths={MASK.data.shapes.subject} place={place} at={0} dur={1} width={8} />
        <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(8,7,5,0.95) 0%, rgba(8,7,5,0.85) 45%, rgba(8,7,5,0) 62%)'}} />
        <Note text="the People's President..." x={90} y={330} size={70} rot={-3} color={TEAL} />
        <Highlight text={TITLE.split(' ')[0]} x={80} y={440} size={230} at={0} seed={75} rot={-3} />
        <Highlight text={`${TITLE.split(' ').slice(1).join(' ')}?`} x={120} y={700} size={170} at={0} seed={77} rot={-2} />
        <Logo />
        <Finish vignette={0.3} />
      </AbsoluteFill>
    </PaletteCtx.Provider>
  );
};
