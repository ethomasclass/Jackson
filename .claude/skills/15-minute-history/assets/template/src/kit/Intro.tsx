// Channel intro: "15 Minute History". Archival cards flip past, a hand-drawn clock fills a quarter
// hour, and the wordmark stamps in. Graphics step at 12 fps like the rest of the video.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from '../lib/anim';
import {boxOf, Finish, Highlight, INK, JF, PALETTES, PaletteCtx, StepCtx, useGFrame, usePal} from './Kit';
import {DarkPaper, Sfx} from './common';
import {INTRO_CARDS} from '../project';

export const INTRO_FRAMES = 132;

const CARDS = INTRO_CARDS;

const Clock: React.FC<{cx: number; cy: number; r: number; at: number}> = ({cx, cy, r, at}) => {
  const g = useGFrame();
  const pal = usePal();
  if (g < at) return null;
  const ring = interpolate(g, [at, at + 8], [0, 1], clamp);
  const sweep = interpolate(g, [at + 6, at + 22], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const a = -Math.PI / 2 + sweep * (Math.PI / 2);
  const hx = cx + Math.cos(a) * r * 0.82;
  const hy = cy + Math.sin(a) * r * 0.82;
  // hand-drawn ring
  const pts: string[] = [];
  for (let i = 0; i <= 74; i++) {
    const t = (i / 70) * Math.PI * 2 - Math.PI / 2 - 0.2;
    const w = 1 + (random(`ck${i}`) - 0.5) * 0.02 + (i / 70) * 0.025;
    pts.push(`${(cx + Math.cos(t) * r * w).toFixed(1)},${(cy + Math.sin(t) * r * w).toFixed(1)}`);
  }
  const wedge = sweep > 0 ? `M${cx},${cy} L${cx},${cy - r * 0.92} A${r * 0.92},${r * 0.92} 0 0 1 ${cx + Math.cos(a) * r * 0.92},${cy + Math.sin(a) * r * 0.92} Z` : '';
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1920} height={1080}>
      {wedge && <path d={wedge} fill={pal.subject} opacity={0.9} />}
      <polyline points={pts.join(' ')} fill="none" stroke={pal.mark} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} />
      {[0, 1, 2, 3].map((q) => {
        const qa = -Math.PI / 2 + (q * Math.PI) / 2;
        return ring >= 1 ? <line key={q} x1={cx + Math.cos(qa) * r * 0.78} y1={cy + Math.sin(qa) * r * 0.78} x2={cx + Math.cos(qa) * r * 0.95} y2={cy + Math.sin(qa) * r * 0.95} stroke={pal.mark} strokeWidth={8} strokeLinecap="round" /> : null;
      })}
      {ring >= 1 && <line x1={cx} y1={cy} x2={hx} y2={hy} stroke="#f4efe6" strokeWidth={9} strokeLinecap="round" />}
      {ring >= 1 && <circle cx={cx} cy={cy} r={12} fill="#f4efe6" />}
    </svg>
  );
};

/** The "15 Minute History" wordmark, animating in from the given frames (also used, fully drawn, on the thumbnail). */
export const Wordmark: React.FC<{clockAt: number; numAt: number; minAt: number; hisAt: number}> = ({clockAt, numAt, minAt, hisAt}) => {
  const g = useGFrame();
  const pal = usePal();
  return (
    <>
      <Clock cx={440} cy={540} r={250} at={clockAt} />
      {g >= numAt && (
        <div style={{position: 'absolute', left: 440 - 200, top: 540 - 150, width: 400, textAlign: 'center', fontFamily: JF.display, fontSize: 250, lineHeight: 1,
          color: '#f4efe6', textShadow: '0 6px 24px rgba(0,0,0,0.7)', transform: `scale(${interpolate(g, [numAt, numAt + 3, numAt + 6], [1.35, 0.95, 1], clamp)})`}}>15</div>
      )}
      {g >= minAt && <Highlight text="MINUTE" x={760} y={350} size={128} at={minAt} seed={7} rot={-2} />}
      {g >= hisAt && (
        <div style={{position: 'absolute', left: 770, top: 520, fontFamily: JF.display, fontSize: 196, lineHeight: 1, color: pal.mark, textShadow: '0 6px 26px rgba(0,0,0,0.7)',
          transform: `scale(${interpolate(g, [hisAt, hisAt + 3, hisAt + 6], [1.3, 0.97, 1], clamp)})`, transformOrigin: 'left center'}}>HISTORY</div>
      )}
      {g >= hisAt + 6 && <div style={{position: 'absolute', left: 780, top: 760, width: interpolate(g, [hisAt + 6, hisAt + 16], [0, 820], clamp), height: 8, background: boxOf(pal)}} />}
    </>
  );
};

const Body: React.FC = () => {
  const frame = useCurrentFrame();
  const g = useGFrame();
  const pal = usePal();
  const clearAt = 32;
  const clockAt = 34;
  const numAt = 58;
  const minAt = 64;
  const hisAt = 71;
  const push = interpolate(frame, [numAt, INTRO_FRAMES], [1, 1.04], clamp);
  const fade = interpolate(frame, [INTRO_FRAMES - 8, INTRO_FRAMES], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#0d0c09', opacity: fade}}>
      <DarkPaper />
      {/* flip through the past */}
      {g < clearAt && CARDS.map((src, i) => {
        const st = i * 6;
        if (g < st) return null;
        const r = (random(`cr${i}`) - 0.5) * 14;
        const dx = (random(`cx${i}`) - 0.5) * 260;
        const dy = (random(`cy${i}`) - 0.5) * 140;
        return (
          <div key={i} style={{position: 'absolute', left: 960 - 330 + dx, top: 540 - 230 + dy, width: 660, transform: `rotate(${r}deg)`}}>
            <div style={{background: '#f4efe6', padding: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.7)', outline: `5px solid ${pal.mark}`, outlineOffset: 10}}>
              <Img src={staticFile(src)} style={{width: 636, height: 430, objectFit: 'cover', display: 'block', filter: 'grayscale(1) contrast(1.25)'}} />
            </div>
          </div>
        );
      })}
      {/* the wordmark */}
      <AbsoluteFill style={{transform: `scale(${push})`}}>
        <Wordmark clockAt={clockAt} numAt={numAt} minAt={minAt} hisAt={hisAt} />
      </AbsoluteFill>
      <Finish vignette={0.45} />
      {CARDS.map((_, i) => <Sfx key={i} at={i * 6} src="sfx/tick.wav" volume={0.45} />)}
      <Sfx at={clearAt} src="sfx/whoosh.wav" volume={0.5} />
      <Sfx at={clockAt + 8} src="sfx/tick.wav" volume={0.5} />
      <Sfx at={clockAt + 14} src="sfx/tick.wav" volume={0.5} />
      <Sfx at={clockAt + 20} src="sfx/tick.wav" volume={0.5} />
      <Sfx at={minAt} src="sfx/stamp.wav" volume={0.45} />
      <Sfx at={hisAt} src="sfx/boom.wav" volume={0.5} />
      <Sequence from={numAt - 4} layout="none"><Audio src={staticFile('music/title_sting.mp3')} volume={(f) => interpolate(f, [0, 3, 50, 74], [0, 0.45, 0.45, 0], clamp)} /></Sequence>
    </AbsoluteFill>
  );
};

export const ChannelIntro: React.FC = () => (
  <PaletteCtx.Provider value={PALETTES.locked}>
    <StepCtx.Provider value={2.5}>
      <Body />
    </StepCtx.Provider>
  </PaletteCtx.Provider>
);
