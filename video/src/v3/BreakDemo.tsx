// Demo reel for the chapter break: stand-in scenes (archival stills with a slow push) joined by breaks,
// so the transition can be judged in motion before any chapter is built.
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {BREAK_FRAMES, BreakInfo, ChapterCard, PageTurn, TURN} from './ChapterBreak';
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

const SCENE = 84;

type Item = {dur: number; node: React.ReactNode};

const ITEMS: Item[] = [
  {dur: SCENE, node: <StillScene s={{src: 'jackson_sully_1845.jpg', title: "THE PEOPLE'S PRESIDENT", note: '…or a king?', tag: 'Thomas Sully, 1845 · National Gallery of Art'}} />},
  {dur: BREAK_FRAMES - TURN, node: <ChapterCard info={{n: 2, title: 'Dirty Boots', dates: '1767 – 1806', fromMin: 0, toMin: 1.22}} />},
  {dur: SCENE, node: <StillScene s={{src: 'jackson_parton_1860_plate.jpg', card: true, title: 'THE WAXHAWS', note: 'both Carolinas claim him', tag: 'James Parton, Life of Andrew Jackson, 1860 · Internet Archive'}} />},
  {dur: BREAK_FRAMES - TURN, node: <ChapterCard info={{n: 3, title: 'Old Hickory', dates: '1812 – 1815', fromMin: 1.22, toMin: 2.73}} />},
  {dur: SCENE, node: <StillScene s={{src: 'new_orleans_laclotte.jpg', title: 'NEW ORLEANS', note: 'January 1815', tag: 'Jean Hyacinthe de Laclotte · Battle of New Orleans'}} />},
  {dur: BREAK_FRAMES - TURN, node: <ChapterCard info={{n: 9, title: 'Let Him Enforce It', dates: '1830 – 1839', fromMin: 8.25, toMin: 10.12, quiet: true}} />},
  {dur: SCENE, node: <StillScene s={{src: 'presidents_house_1835.jpg', title: 'WASHINGTON, 1830', note: 'the Indian Removal Act', quiet: true, tag: "President's House, 1835 · NYPL"}} />},
];

export const BREAK_DEMO_FRAMES = ITEMS.reduce((a, i) => a + i.dur, 0);

export const BreakDemo: React.FC = () => {
  const starts: number[] = [];
  ITEMS.reduce((a, i) => (starts.push(a), a + i.dur), 0);
  // Later items sit underneath; each item stays on top for TURN extra frames while it turns away.
  const layers = ITEMS.map((it, i) => {
    const last = i === ITEMS.length - 1;
    return (
      <Sequence key={i} from={starts[i]} durationInFrames={it.dur + (last ? 0 : TURN)}>
        {last ? it.node : <PageTurn at={it.dur}>{it.node}</PageTurn>}
      </Sequence>
    );
  }).reverse();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {layers}
      <Audio src={staticFile('music/good_feelings.mp3')} volume={(f) => interpolate(f, [0, 15, BREAK_DEMO_FRAMES - 20, BREAK_DEMO_FRAMES], [0, 0.15, 0.15, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
    </AbsoluteFill>
  );
};
