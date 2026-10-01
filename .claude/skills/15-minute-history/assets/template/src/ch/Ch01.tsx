// Chapter 1 · the cold open (driving question), then the channel intro and the title card.
// Chapter 1 has no logo break in front; it ends on the intro + title instead. Replace the scenes, keep the shape.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import words from '../../public/audio/ch01_cold_open.words.json';
import {clamp} from '../lib/anim';
import {Finish, Highlight, JF, Loop, Note, PALETTES, PaletteCtx, StepCtx, Tag, useGFrame, usePal} from '../kit/Kit';
import {DarkPaper, MapView, Sfx, WRITE} from '../kit/common';
import {ChannelIntro, INTRO_FRAMES} from '../kit/Intro';
import {CropCard, DrawnCrown, makeTimeline, type Narration, Photo, type TL, useScene} from '../kit/shell';
import {MASKS} from '../masks';
import {DATES, SUBTITLE, TITLE} from '../project';

const N = words as Narration;
/** Title card length (frames) after the channel intro. */
const TITLE_FRAMES = 150;
/** Narration ends; the channel intro starts 20 frames later. */
const END = Math.ceil(N.duration * 30) + 20;
export const CH01_FRAMES = END + INTRO_FRAMES + TITLE_FRAMES;

const SULLY: [number, number] = [1920, 2288];

/** Full-bleed portrait: B&W, coral subject, teal trace, slow push-in, a title on the year. */
const Portrait: React.FC<{t: TL}> = ({t}) => (
  <Photo src="img/demo/sully_jackson_1845.jpg" size={SULLY} fx={960} fy={900} z0={1.02} z1={1.12} a={0} b={t.at("That's")} mask={MASKS.sully} traceAt={t.at('old')}>
    {() => (
      <>
        <Highlight text="1845" x={110} y={100} size={110} at={t.at('1845.')} seed={11} rot={-2} />
        <Note text="wild white hair" x={1250} y={260} size={56} rot={-4} at={t.at('wild')} />
        <Note text="(he fought a few)" x={1250} y={820} size={50} rot={-3} at={t.at('fought')} color="#ffffff" />
        <Tag text="Thomas Sully, Andrew Jackson, 1845 · National Gallery of Art" />
      </>
    )}
  </Photo>
);

/** Same face, two names: a cropped card on the desk with a crown drawn on for the enemies' name. */
const TwoNames: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard mask={MASKS.sully} tint={null} src="img/demo/sully_jackson_1845.jpg" size={SULLY} x={140} y={150} w={560} h={760} fx={960} fy={1000} scale={0.5} rot={-2} at={1} traceAt={6}>
        {(S) => {
          // Source pixels -> screen: the crown rests on the hair (see references/thumbnail-and-youtube.md for the geometry)
          const [x0, y] = S(660, 275);
          const [x1] = S(1200, 275);
          return <DrawnCrown x0={x0} x1={x1} y={y} h={90} at={t.at('King')} />;
        }}
      </CropCard>
      <Note text="his fans:" x={860} y={200} size={50} rot={-3} at={t.at('fans')} color="#ffffff" />
      {g >= t.at("People's") && <Highlight text="THE PEOPLE'S PRESIDENT" x={860} y={290} size={70} at={t.at("People's")} seed={13} rot={-2} />}
      <Note text="his enemies:" x={860} y={520} size={50} rot={-3} at={t.at('enemies')} color="#ffffff" />
      {g >= t.at('King') && <Highlight text="KING ANDREW" x={860} y={610} size={100} at={t.at('King')} seed={15} rot={-3} />}
    </AbsoluteFill>
  );
};

/** The driving question, written on the desk. */
const Question: React.FC<{t: TL}> = ({t}) => {
  const pal = usePal();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <Note text="the question:" x={200} y={220} size={60} rot={-3} at={t.at('question')} color="#ffffff" />
      <Note text="how did one man" x={260} y={360} size={88} rot={-3} at={t.at('How')} />
      <Note text="earn both names?" x={300} y={500} size={88} rot={-3} at={t.at('both')} color={pal.subject} />
      <Loop cx={1460} cy={620} rx={220} ry={120} at={t.at('evidence')} seed={17} tilt={-6} />
      <Note text="the evidence" x={1300} y={590} size={60} rot={-3} at={t.at('evidence')} />
    </AbsoluteFill>
  );
};

/** Title card after the channel intro: the map dimmed, the title on orange, the subtitle in teal. */
const Title: React.FC = () => {
  const g = useGFrame();
  const pal = usePal();
  return (
    <AbsoluteFill style={{background: '#15130f'}}>
      <MapView cx={2600} cy={2320} s={0.26 + g * 0.0003} rot={0} dim={0.5} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(8,6,4,0.2) 30%, rgba(8,6,4,0.85) 100%)'}} />
      <Highlight text={TITLE} x={330} y={360} size={180} at={4} seed={61} rot={-2} />
      {g >= 14 && <div style={{position: 'absolute', left: 380, top: 640, fontFamily: JF.display, fontSize: 64, color: pal.mark, textShadow: '0 3px 16px rgba(0,0,0,0.8)', opacity: interpolate(g, [14, 20], [0, 1], clamp)}}>{SUBTITLE}</div>}
      <Note text={DATES} x={1340} y={760} size={52} rot={-5} at={24} />
    </AbsoluteFill>
  );
};

const Body: React.FC = () => {
  const frame = useCurrentFrame();
  const t = makeTimeline(N, 30);
  const at = t.at;
  // [cut frame, scene]: cut 1 frame before the word that starts the new idea
  const cuts: [number, React.ReactNode][] = [
    [0, <Portrait t={t} />],
    [at("That's") - 1, <TwoNames t={t} />],
    [at("So here's") - 1, <Question t={t} />],
  ];
  let scene = useScene(cuts);
  if (frame >= END + INTRO_FRAMES) scene = <Sequence from={END + INTRO_FRAMES} layout="none"><Title /></Sequence>;
  else if (frame >= END) scene = <Sequence from={END} layout="none"><ChannelIntro /></Sequence>;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {scene}
      {frame < END && <Finish vignette={0.3} />}
      <Audio src={staticFile('audio/ch01_cold_open.wav')} />
      {/* cold-open music bed, e.g. <Audio src={staticFile('music/cold_open.mp3')} volume={(f) => interpolate(f, [0, 15, END - 30, END], [0, 0.17, 0.17, 0], clamp)} /> */}
      {cuts.slice(1).map(([f], i) => <Sfx key={i} at={f} src="sfx/whoosh.wav" volume={0.35} />)}
      {['1845.', "People's", 'King'].map((c) => <Sfx key={c} at={at(c)} src="sfx/stamp.wav" volume={0.3} />)}
      {['wild', 'fought', 'fans', 'enemies', 'question', 'How', 'both', 'evidence'].map((c) => <Sfx key={c} at={at(c) - 2} src={WRITE.src} volume={WRITE.volume} />)}
      <Sfx at={END + INTRO_FRAMES + 4} src="sfx/stamp.wav" volume={0.4} />
    </AbsoluteFill>
  );
};

export const Ch01: React.FC = () => (
  <PaletteCtx.Provider value={PALETTES.locked}>
    <StepCtx.Provider value={2.5}>
      <Body />
    </StepCtx.Provider>
  </PaletteCtx.Provider>
);
