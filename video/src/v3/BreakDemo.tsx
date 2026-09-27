// Demo reel for the chapter break: stand-in scenes (archival stills with a slow push) joined by breaks,
// so the logo transition can be judged in motion before any chapter is built.
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {BREAK_FRAMES, LogoBreak, WIPE} from './LogoBreak';
import {DarkPaper, Finish, Highlight, Note, PAL, Tag} from './look';

type Still = {src: string; title?: string; note?: string; tag: string; card?: boolean; quiet?: boolean};

/** A stand-in scene: B&W picture, slow push, a title and a note. */
const StillScene: React.FC<{s: Still}> = ({s}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, 120], [1.04, 1.1]);
  return (
    <AbsoluteFill style={{background: PAL.ink}}>
      {s.card ? (
        <>
          <DarkPaper />
          <div style={{position: 'absolute', left: 130, top: 60, width: 560, transform: `rotate(-3deg) scale(${z - 0.04})`, transformOrigin: 'center',
            background: PAL.cream, padding: 16, boxShadow: '0 18px 34px rgba(0,0,0,0.6)', outline: `5px solid ${PAL.teal}`, outlineOffset: 10}}>
            <Img src={staticFile(`img/${s.src}`)} style={{width: '100%', height: 930, objectFit: 'cover', objectPosition: '50% 38%', display: 'block', filter: 'grayscale(1) contrast(1.2)'}} />
          </div>
        </>
      ) : (
        <AbsoluteFill style={{transform: `scale(${z})`}}>
          <Img src={staticFile(`img/${s.src}`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.2) brightness(0.9)'}} />
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)'}} />
        </AbsoluteFill>
      )}
      {s.title && <Highlight text={s.title} x={s.card ? 820 : 120} y={s.card ? 330 : 120} size={96} at={8} box={s.quiet ? null : PAL.orange} color={s.quiet ? PAL.cream : PAL.ink} />}
      {s.note && <Note text={s.note} x={s.card ? 860 : 160} y={s.card ? 500 : 260} at={18} size={46} />}
      <Tag text={s.tag} />
      <Finish />
    </AbsoluteFill>
  );
};


const SCENES: Still[] = [
  {src: 'jackson_sully_1845.jpg', title: "THE PEOPLE'S PRESIDENT", note: '…or a king?', tag: 'Thomas Sully, 1845 · National Gallery of Art'},
  {src: 'jackson_parton_1860_plate.jpg', card: true, title: 'DIRTY BOOTS', note: 'the Waxhaws, 1767', tag: 'James Parton, Life of Andrew Jackson, 1860 · Internet Archive'},
  {src: 'new_orleans_laclotte.jpg', title: 'OLD HICKORY', note: 'New Orleans, January 1815', tag: 'Jean Hyacinthe de Laclotte · Battle of New Orleans'},
  {src: 'presidents_house_1835.jpg', title: 'LET HIM ENFORCE IT', note: 'Washington, 1830', quiet: true, tag: "President's House, 1835 · NYPL"},
];

const SCENE = 90;
/** Each scene runs SCENE frames on its own; a break covers its last WIPE frames and the next scene's first WIPE. */
const STEP = SCENE + BREAK_FRAMES - 2 * WIPE;

export const BREAK_DEMO_FRAMES = SCENES.length * SCENE + (SCENES.length - 1) * (BREAK_FRAMES - 2 * WIPE);

export const BreakDemo: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {SCENES.map((s, i) => (
      <Sequence key={s.src} from={i * STEP} durationInFrames={SCENE}>
        <StillScene s={s} />
      </Sequence>
    ))}
    {SCENES.slice(1).map((s, i) => (
      <Sequence key={`b${i}`} from={i * STEP + SCENE - WIPE} durationInFrames={BREAK_FRAMES}>
        <LogoBreak />
      </Sequence>
    ))}
    <Audio src={staticFile('music/good_feelings.mp3')} volume={(f) => interpolate(f, [0, 15, BREAK_DEMO_FRAMES - 20, BREAK_DEMO_FRAMES], [0, 0.15, 0.15, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
  </AbsoluteFill>
);
