// Chapter 2 · example of a standard chapter: logo-break lead-in, then scenes cut on spoken words.
// Shows the four workhorse scene types: a map with pins, a vocabulary card, a primary-source quote, a two-views split.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import words from '../../public/audio/ch02_example.words.json';
import {Arrow, Highlight, JF, Note, Tag, useGFrame, usePal} from '../kit/Kit';
import {DarkPaper, Sfx, WRITE} from '../kit/common';
import {Person} from '../kit/figures';
import {type Cam, MapScene, Pin, PLACES} from '../kit/map';
import {ChapterShell, chapterFrames, Definition, LEAD, makeTimeline, type Narration, Quote, type TL, useScene} from '../kit/shell';

const N = words as Narration;
export const CH02_FRAMES = chapterFrames(N, LEAD);

/** Map: the camera glides in (smooth, 30 fps); pins, labels and notes step at 12 fps. */
const WestMap: React.FC<{t: TL}> = ({t}) => {
  const keys: Cam[] = [
    {f: 0, x: 2500, y: 2300, s: 0.3},
    {f: t.at('Indiana'), x: 1900, y: 2050, s: 0.55},
  ];
  return (
    <MapScene keys={keys} dim={0.15}>
      {(S) => {
        const [ix, iy] = S(PLACES.indiana);
        const [lx, ly] = S(PLACES.illinois);
        return (
          <>
            <Note text="early 1800s: owners only" x={100} y={90} size={52} rot={-3} at={t.at('owned')} color="#ffffff" />
            <Pin x={ix} y={iy} at={t.at('Indiana')} />
            <Note text="Indiana" x={ix + 20} y={iy - 70} size={40} rot={-3} at={t.at('Indiana')} />
            <Pin x={lx} y={ly} at={t.at('Illinois')} />
            <Note text="Illinois" x={lx - 200} y={ly + 20} size={40} rot={-3} at={t.at('Illinois')} />
            <Note text="any white man" x={1150} y={860} size={60} rot={-3} at={t.at('any')} />
            <Arrow x1={1180} y1={850} x2={ix + 12} y2={iy + 22} bow={-40} at={t.at('any') + 6} />
            <Tag text="Samuel Augustus Mitchell, Map of the United States, 1836 · Library of Congress" />
          </>
        );
      }}
    </MapScene>
  );
};

/** Vocabulary: highlighter title on the word, definition bar under it, simple drawn figures. */
const Suffrage: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  return (
    <AbsoluteFill>
      <DarkPaper />
      {g >= t.at('expanding') && <Highlight text="SUFFRAGE" x={120} y={110} size={120} at={t.at('expanding')} seed={21} rot={-2} />}
      <Definition term="suf·frage" def="the right to vote" at={t.at('right')} x={140} y={290} w={900} />
      {[0, 1, 2, 3, 4, 5].map((i) => <Person key={i} x={1180 + i * 110} y={760} h={190} at={t.at('By') + i} />)}
      <Note text="by 1828: property rule dropped" x={1040} y={830} size={52} rot={-3} at={t.at('dropped')} />
    </AbsoluteFill>
  );
};

/** A primary-source quote: Playfair on the desk, attributed in mono caps. */
const Spoils: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  return (
    <AbsoluteFill>
      <DarkPaper />
      {g >= t.at('jobs') && <Highlight text="THE SPOILS SYSTEM" x={100} y={90} size={100} at={t.at('jobs')} seed={23} rot={-2} />}
      <Quote text="to the victors belong the spoils" at={t.at('victors')} x={120} y={330} w={1500} size={72} who="Senator William Marcy, 1832" />
      <Note text="translation:" x={140} y={700} size={50} rot={-3} at={t.at('Translation:')} color="#ffffff" />
      <Note text="you win, your friends get hired" x={180} y={790} size={64} rot={-3} at={t.at('you')} color={pal.subject} />
    </AbsoluteFill>
  );
};

/** Two views, side by side: the channel's habit of giving both sides. */
const TwoViews: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <div style={{position: 'absolute', left: 958, top: 120, width: 4, height: 840, background: 'rgba(244,239,230,0.35)'}} />
      <div style={{position: 'absolute', left: 160, top: 180, fontFamily: JF.mono, fontSize: 30, letterSpacing: 4, color: pal.mark, opacity: g >= t.at('supporters', 2) ? 1 : 0}}>HIS SUPPORTERS</div>
      {g >= t.at('fresh') && <Highlight text="FRESH BLOOD" x={150} y={300} size={92} at={t.at('fresh')} seed={25} rot={-3} />}
      <div style={{position: 'absolute', left: 1060, top: 180, fontFamily: JF.mono, fontSize: 30, letterSpacing: 4, color: pal.subject, opacity: g >= t.at('critics') ? 1 : 0}}>HIS CRITICS</div>
      <Note text="a government" x={1060} y={320} size={60} rot={-3} at={t.at('building')} color="#ffffff" />
      <Note text="that answered to him" x={1060} y={430} size={70} rot={-3} at={t.at('answered')} color={pal.subject} />
    </AbsoluteFill>
  );
};

const Body: React.FC = () => {
  const t = makeTimeline(N, 30);
  const at = t.at;
  const cuts: [number, React.ReactNode][] = [
    [0, <WestMap t={t} />],
    [at("That's") - 1, <Suffrage t={t} />],
    [at('Once') - 1, <Spoils t={t} />],
    [at('His supporters', 2) - 1, <TwoViews t={t} />],
  ];
  const scene = useScene(cuts);
  return (
    <>
      {scene}
      {cuts.slice(1).map(([f], i) => <Sfx key={i} at={f} src="sfx/whoosh.wav" volume={0.28} />)}
      {['Indiana', 'Illinois'].map((c) => <Sfx key={c} at={at(c)} src="sfx/tick.wav" volume={0.45} />)}
      {['expanding', 'jobs', 'fresh'].map((c) => <Sfx key={c} at={at(c)} src="sfx/stamp.wav" volume={0.27} />)}
      {['owned', 'any', 'dropped', 'Translation:', 'you', 'building', 'answered'].map((c) => <Sfx key={c} at={at(c) - 2} src={WRITE.src} volume={WRITE.volume} />)}
    </>
  );
};

// `quiet` switches a heavy chapter to teal lines only (no coral, no orange boxes). Music: [{src: 'music/x.mp3', volume: 0.13}]
export const Ch02: React.FC = () => (
  <ChapterShell n={N} audio="audio/ch02_example.wav" lead={LEAD} music={[]}>
    <Body />
  </ChapterShell>
);
