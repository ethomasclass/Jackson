// Chapter 3 · Old Hickory
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import words from '../../../public/audio/v3_ch03_old_hickory.words.json';
import {clamp} from '../../lib/anim';
import {Highlight, INK, Note, Picture, Tag, useGFrame, usePal} from '../Kit';
import {DarkPaper, Sfx, WRITE} from '../common';
import {MapScene, Pin, PLACES, Region} from '../map';
import {ChapterShell, chapterFrames, CropCard, fill, LEAD, makeTimeline, type Narration, type TL, useScene} from '../shell';
import {MASKS} from '../masks';

const N = words as Narration;
export const CH03_FRAMES = chapterFrames(N, LEAD);

/** Roughly the land the Creek Nation was forced to give up in 1814 (central/southern Alabama and southern Georgia). */
export const CREEK_CESSION = [[1880, 2950], [1990, 2960], [2080, 3000], [2250, 3040], [2420, 3110], [2440, 3200], [2150, 3205], [1980, 3190], [1880, 3120], [1850, 3030]];

const Hickory: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const P: [number, number] = [1924, 3364];
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard mask={MASKS.parton} src="img/jackson_parton_1860_plate.jpg" size={P} x={180} y={120} w={560} h={800} fx={960} fy={1450} scale={0.62} rot={-2} at={1} />
      {g >= t.at('War') && <Highlight text="THE WAR OF 1812" x={860} y={130} size={84} at={t.at('War')} seed={301} rot={-2} />}
      <Note text="the thing he was best at" x={880} y={270} size={52} rot={-3} at={t.at('best')} color="#ffffff" />
      <Note text="“tough as hickory wood”" x={880} y={440} size={56} rot={-3} at={t.at('tough')} />
      {g >= t.at('Old Hickory') && <Highlight text="OLD HICKORY" x={870} y={560} size={130} at={t.at('Old Hickory')} seed={303} rot={-3} />}
      <Tag text="Andrew Jackson, engraving from James Parton, Life of Andrew Jackson, 1860 · Internet Archive" />
    </AbsoluteFill>
  );
};

const Creek: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const H = PLACES.horseshoeBend;
  const a = t.at('In 1814');
  const f = t.at('Then Jackson');
  return (
    <MapScene keys={[{f: a, x: 2150, y: 2900, s: 0.8}, {f: t.at('Horseshoe'), x: H[0] + 250, y: H[1] - 100, s: 1.3}, {f, x: H[0] + 250, y: H[1] - 100, s: 1.3}, {f: f + 30, x: 2240, y: 3020, s: 0.95}]}
      svg={() => <Region pts={CREEK_CESSION} at={t.at('give up')} color={pal.subject} width={9} />}>
      {(S) => {
        const [hx, hy] = S(H);
        return (
          <>
            <Pin x={hx} y={hy} at={t.at('Horseshoe') - 1} />
            {g >= a && <Highlight text="1814" x={100} y={90} size={100} at={a} seed={305} rot={-2} />}
            <Note text="Horseshoe Bend, Alabama" x={100} y={230} size={54} rot={-3} at={t.at('Horseshoe')} />
            <Note text="the Red Sticks: Creek warriors fighting American expansion" x={100} y={320} size={44} rot={-2} at={t.at('Red')} color="#ffffff" />
            {g >= t.at('23') && <Highlight text="~23 MILLION ACRES" x={1080} y={760} size={76} at={t.at('23')} seed={307} rot={-2} />}
            <Note text="including land of Creeks who fought on his side" x={620} y={890} size={44} rot={-2} at={t.at('including')} color="#ffffff" />
            <Note text="hold that thought." x={1180} y={120} size={64} rot={-4} at={t.at('Hold')} color={pal.subject} />
          </>
        );
      }}
    </MapScene>
  );
};

const NewOrleans: React.FC<{t: TL}> = ({t}) => {
  const frame = useCurrentFrame();
  const g = useGFrame();
  const size: [number, number] = [1920, 1547];
  const a = t.at('In January');
  const place = fill(size, 960, 800, interpolate(frame, [a, a + 240], [1.02, 1.14], clamp));
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <Picture src="img/new_orleans_laclotte.jpg" place={place} size={size} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 100%)'}} />
      {g >= t.at('January') && <Highlight text="JANUARY 1815" x={100} y={90} size={90} at={t.at('January')} seed={309} rot={-2} />}
      {g >= t.at('Battle') && <Highlight text="THE BATTLE OF NEW ORLEANS" x={100} y={230} size={76} at={t.at('Battle')} seed={311} rot={-2} />}
      <Note text="a lopsided victory" x={120} y={380} size={56} rot={-3} at={t.at('lopsided')} color="#ffffff" />
      <Note text="the most famous man in America" x={700} y={900} size={62} rot={-3} at={t.at('famous')} color={usePal().subject} />
      <Tag text="Jean Hyacinthe de Laclotte, Battle of New Orleans, 1815 · New Orleans Museum of Art" />
    </AbsoluteFill>
  );
};

const Body: React.FC = () => {
  const t = makeTimeline(N, 30);
  const at = t.at;
  const cuts: [number, React.ReactNode][] = [
    [0, <Hickory t={t} />],
    [at('In 1814') - 1, <Creek t={t} />],
    [at('In January') - 1, <NewOrleans t={t} />],
  ];
  const scene = useScene(cuts);
  return (
    <>
      {scene}
      {cuts.slice(1).map(([f], i) => <Sfx key={i} at={f} src="sfx/whoosh.wav" volume={0.28} />)}
      {['War', 'Old Hickory', 'In 1814', '23', 'January', 'Battle'].map((c) => <Sfx key={c} at={at(c)} src="sfx/stamp.wav" volume={0.27} />)}
      <Sfx at={at('Horseshoe') - 1} src="sfx/tick.wav" volume={0.45} />
      {['best', 'tough', 'Horseshoe', 'Red', 'including', 'Hold', 'lopsided', 'famous'].map((c) => <Sfx key={c} at={at(c) - 2} src={WRITE.src} volume={WRITE.volume} />)}
    </>
  );
};

export const Ch03: React.FC = () => (
  <ChapterShell n={N} audio="audio/v3_ch03_old_hickory.wav" lead={LEAD} music={[{src: 'music/v3/w_sea_battle.mp3', volume: 0.13}]}>
    <Body />
  </ChapterShell>
);
