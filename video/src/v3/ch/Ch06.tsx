// Chapter 6 · To the Victors (rotation in office / the spoils system)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import words from '../../../public/audio/v3_ch06_to_the_victor.words.json';
import {clamp} from '../../lib/anim';
import {Highlight, INK, JF, Note, Picture, Tag, useGFrame, usePal} from '../Kit';
import {DarkPaper, Sfx, WRITE} from '../common';
import {ChapterShell, chapterFrames, CropCard, Definition, fill, hasFile, LEAD, makeTimeline, type Narration, Quote, type TL, useScene} from '../shell';

const N = words as Narration;
export const CH06_FRAMES = chapterFrames(N, LEAD);
const GEN: [number, number] = [1200, 896];

const JOBS: [string, string, string][] = [
  ['POSTMASTER', 'held it 16 yrs', ''],
  ['CUSTOMS COLLECTOR', 'held it 20 yrs', ''],
  ['LAND OFFICE', 'held it 12 yrs', ''],
  ['CLERK, TREASURY', 'held it 30 yrs', ''],
  ['POSTMASTER', 'held it 9 yrs', ''],
  ['INDIAN AGENT', 'held it 15 yrs', ''],
  ['CLERK, STATE DEPT.', 'held it 25 yrs', ''],
  ['NAVY AGENT', 'held it 11 yrs', ''],
  ['DISTRICT ATTORNEY', 'held it 8 yrs', ''],
  ['POSTMASTER', 'held it 18 yrs', ''],
];

/** Ten government jobs; one in ten changes hands. */
const Jobs: React.FC<{t: TL; swap: number; dim?: boolean}> = ({t, swap, dim}) => {
  const g = useGFrame();
  const pal = usePal();
  return (
    <>
      {JOBS.map(([job, old], i) => {
        const x = 110 + (i % 5) * 350;
        const y = 330 + Math.floor(i / 5) * 250;
        const flipped = i === 1 && g >= swap;
        const c = interpolate(g, [swap, swap + 6], [0, 1], clamp);
        return g >= 1 + i ? (
          <div key={i} style={{position: 'absolute', left: x, top: y, width: 320, height: 200, background: '#efe6d2', boxShadow: '0 12px 22px rgba(0,0,0,0.55)', transform: `rotate(${(i % 3) - 1}deg)`, opacity: dim ? 0.5 : 1}}>
            <div style={{position: 'absolute', left: 20, top: 18, fontFamily: JF.mono, fontSize: 20, letterSpacing: 2, color: '#3a332a'}}>{job}</div>
            <div style={{position: 'absolute', left: 20, top: 70, fontFamily: JF.display, fontSize: 34, color: INK}}>{flipped ? '' : old}</div>
            {i === 1 && <div style={{position: 'absolute', left: 14, top: 88, height: 7, width: 280 * c, background: pal.subject, transform: 'rotate(-3deg)'}} />}
            {flipped && <div style={{position: 'absolute', left: 20, top: 120, fontFamily: '"Nanum Pen Script", cursive', fontSize: 40, color: '#0e7c6d'}}>a loyal Jackson man</div>}
          </div>
        ) : null;
      })}
    </>
  );
};

const Rotation: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <Note text="once in office: go after the insiders" x={100} y={70} size={52} rot={-3} at={t.at('insiders')} />
      <Quote text="so plain and simple" at={t.at('plain')} x={110} y={180} w={900} size={60} who="Jackson, First Annual Message, 1829" />
      <Jobs t={t} swap={999999} dim={g >= t.at('rotation')} />
      <Note text="any intelligent citizen could do them" x={1000} y={200} size={40} rot={-3} at={t.at('intelligent')} color="#ffffff" />
      {g >= t.at('rotation') && <Highlight text="ROTATION IN OFFICE" x={330} y={520} size={100} at={t.at('rotation')} seed={601} rot={-3} />}
    </AbsoluteFill>
  );
};

const Spoils: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const seekers = hasFile('img/gen/v3_ch06_office_seekers.png');
  return (
    <AbsoluteFill style={{background: INK}}>
      {seekers ? <Picture src="img/gen/v3_ch06_office_seekers.png" place={fill(GEN, 600, 448, 1.04)} size={GEN} bw="grayscale(1) contrast(1.2) brightness(0.55)" /> : <DarkPaper />}
      {!seekers && <CropCard src="img/marcy_waldo.jpg" size={[1920, 2466]} x={1380} y={140} w={400} h={520} fx={960} fy={1000} scale={0.3} rot={2} at={t.at("senator's") - 1} />}
      <Note text="his critics called it..." x={100} y={70} size={54} rot={-3} at={t.at('critics')} />
      {g >= t.at('spoils') && <Highlight text="THE SPOILS SYSTEM" x={100} y={170} size={110} at={t.at('spoils')} seed={603} rot={-2} />}
      <Quote text="to the victors belong the spoils" at={t.at('victors')} x={120} y={410} w={1200} size={70} who="Senator William Marcy, 1832" />
      <Definition term="spoils sys·tem" def="giving government jobs to the people who helped you win" at={t.at('In other')} x={120} y={680} w={1100} />
      <Tag text={seekers ? 'Illustration · office seekers at the President\'s House, 1829' : 'William L. Marcy · Library of Congress'} />
    </AbsoluteFill>
  );
};

const Fair: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <Note text="to be fair..." x={100} y={70} size={56} rot={-3} at={t.at('To be')} color="#ffffff" />
      {g >= t.at('one in ten') && <Highlight text="ABOUT 1 IN 10" x={560} y={60} size={100} at={t.at('one in ten')} seed={605} rot={-2} />}
      <Jobs t={t} swap={t.at('one in ten') + 4} />
      <Note text="first year and a half" x={1300} y={200} size={46} rot={-3} at={t.at('year')} color="#ffffff" />
      <Note text="...usually loyal Jackson men" x={120} y={860} size={52} rot={-3} at={t.at('loyal')} />
      <Note text="next 50 years: a major source of corruption" x={120} y={930} size={52} rot={-3} at={t.at('corruption')} color={pal.subject} />
    </AbsoluteFill>
  );
};

const TwoViews: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <div style={{position: 'absolute', left: 958, top: 120, width: 4, height: 840, background: 'rgba(244,239,230,0.35)'}} />
      <div style={{position: 'absolute', left: 160, top: 180, fontFamily: JF.mono, fontSize: 30, letterSpacing: 4, color: pal.mark, opacity: g >= t.at('supporters') ? 1 : 0}}>HIS SUPPORTERS</div>
      {g >= t.at('fresh') && <Highlight text="FRESH BLOOD" x={150} y={300} size={110} at={t.at('fresh')} seed={607} rot={-3} />}
      <div style={{position: 'absolute', left: 1060, top: 180, fontFamily: JF.mono, fontSize: 30, letterSpacing: 4, color: pal.subject, opacity: g >= t.at('critics', 2) ? 1 : 0}}>HIS CRITICS</div>
      <Note text="a president building" x={1040} y={300} size={56} rot={-3} at={t.at('building')} color="#ffffff" />
      <Note text="a government" x={1060} y={390} size={56} rot={-3} at={t.at('government', 3)} color="#ffffff" />
      <Note text="that answered to him" x={1060} y={500} size={70} rot={-3} at={t.at('answered')} color={pal.subject} />
    </AbsoluteFill>
  );
};

const Body: React.FC = () => {
  const t = makeTimeline(N, 30);
  const at = t.at;
  const cuts: [number, React.ReactNode][] = [
    [0, <Rotation t={t} />],
    [at('His critics') - 1, <Spoils t={t} />],
    [at('To be') - 1, <Fair t={t} />],
    [at('His supporters') - 1, <TwoViews t={t} />],
  ];
  const scene = useScene(cuts);
  return (
    <>
      {scene}
      {cuts.slice(1).map(([f], i) => <Sfx key={i} at={f} src="sfx/whoosh.wav" volume={0.28} />)}
      {['rotation', 'spoils', 'one in ten', 'fresh'].map((c) => <Sfx key={c} at={at(c)} src="sfx/stamp.wav" volume={0.27} />)}
      {['insiders', 'intelligent', 'critics', 'To be', 'year', 'loyal', 'corruption', 'building', 'answered'].map((c) => <Sfx key={c} at={at(c) - 2} src={WRITE.src} volume={WRITE.volume} />)}
    </>
  );
};

export const Ch06: React.FC = () => (
  <ChapterShell n={N} audio="audio/v3_ch06_to_the_victor.wav" lead={LEAD} music={[{src: 'music/good_feelings.mp3', volume: 0.13}]}>
    <Body />
  </ChapterShell>
);
