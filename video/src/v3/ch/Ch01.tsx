// Chapter 1 · King Andrew the First (cold open), then the channel intro and the title card.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import words from '../../../public/audio/v3_ch01_cold_open.words.json';
import {clamp} from '../../lib/anim';
import {Finish, Highlight, INK, JF, Loop, Note, PALETTES, PaletteCtx, Picture, StepCtx, Tag, Tint, Traced, useGFrame, usePal} from '../Kit';
import {DarkPaper, MapView, Sfx, WRITE} from '../common';
import {ChannelIntro, INTRO_FRAMES} from '../Intro';
import {CropCard, DrawnCrown, fill, makeTimeline, type Narration, type TL} from '../shell';
import {MASKS} from '../masks';

const N = words as Narration;
const TITLE = 150;
const END = Math.ceil(N.duration * 30) + 20;
export const CH01_FRAMES = END + INTRO_FRAMES + TITLE;

const KA: [number, number] = [1017, 1536];
const SULLY: [number, number] = [1920, 2288];

/** The 1833 cartoon on the desk, each prop circled as it is named. */
const Cartoon: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard mask={MASKS.king_andrew} traceAt={t.at('man') - 2} src="img/v3/ch01/king_andrew_1833.jpg" size={KA} x={170} y={40} w={660} h={1000} fx={508} fy={768} scale={0.65} rot={-1.5}>
        {(S) => {
          const [cx, cy] = S(530, 225);
          const [sx, sy] = S(420, 330);
          const [vx, vy] = S(835, 650);
          const [kx, ky] = S(450, 1270);
          const [tx, ty] = S(480, 1492);
          return (
            <>
              <Loop cx={cx} cy={cy} rx={95} ry={60} at={t.at('crown') - 2} dur={8} width={6} seed={11} />
              <Loop cx={sx} cy={sy} rx={45} ry={170} tilt={-28} at={t.at('scepter') - 2} dur={8} width={6} seed={12} />
              <Loop cx={vx} cy={vy} rx={55} ry={90} tilt={-12} at={t.at('veto') - 2} dur={8} width={6} seed={13} />
              <Loop cx={kx} cy={ky} rx={140} ry={70} tilt={8} at={t.at('Constitution') - 2} dur={8} width={6} seed={14} />
              <Loop cx={tx} cy={ty} rx={260} ry={34} at={t.at('caption') - 2} dur={8} width={6} seed={15} />
            </>
          );
        }}
      </CropCard>
      <Note text="a cartoon from 1833" x={940} y={110} size={54} rot={-3} at={t.at('cartoon')} />
      <Note text="royal robes" x={980} y={240} size={50} rot={-2} at={t.at('royal')} color="#ffffff" />
      <Note text="a crown" x={980} y={320} size={50} rot={-2} at={t.at('crown')} color="#ffffff" />
      <Note text="a scepter" x={980} y={400} size={50} rot={-2} at={t.at('scepter')} color="#ffffff" />
      <Note text="a VETO" x={980} y={480} size={50} rot={-2} at={t.at('veto')} />
      <Note text="the Constitution, torn up" x={980} y={560} size={50} rot={-2} at={t.at('torn-up')} />
      {g >= t.at('King Andrew') && <Highlight text="KING ANDREW THE FIRST" x={900} y={740} size={78} at={t.at('King Andrew')} seed={17} rot={-2} />}
      <Tag text="King Andrew the First, c. 1833 · Library of Congress" />
    </AbsoluteFill>
  );
};

/** That's the president: Sully's portrait, colour creeping in. */
const President: React.FC<{t: TL}> = ({t}) => {
  const frame = useCurrentFrame();
  const g = useGFrame();
  const a = t.at("That's");
  const place = fill(SULLY, 980, 860, interpolate(frame, [a, t.at('Just')], [1.02, 1.1], clamp));
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <Picture src="img/jackson_sully_1845.jpg" place={place} size={SULLY} />
      <Tint mask={MASKS.sully.alpha} place={place} size={SULLY} />
      <Traced paths={MASKS.sully.data.shapes.subject} place={place} at={a + 4} dur={12} width={5} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(0,0,0,0.7) 100%)'}} />
      <Note text="the president of the United States" x={100} y={120} size={52} rot={-3} at={t.at('president')} />
      {g >= t.at('Andrew Jackson') && <Highlight text="ANDREW JACKSON" x={100} y={820} size={110} at={t.at('Andrew Jackson')} seed={19} rot={-2} />}
      <Tag text="Thomas Sully, Andrew Jackson, 1845 · National Gallery of Art" />
    </AbsoluteFill>
  );
};

/** Four years earlier: all creation going to the White House. */
const Crowd: React.FC<{t: TL}> = ({t}) => {
  const frame = useCurrentFrame();
  const g = useGFrame();
  const size: [number, number] = [2289, 1413];
  const place = fill(size, 1150, 700, interpolate(frame, [t.at('Just'), t.at('Four years', 2)], [1.0, 1.12], clamp));
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <Picture src="img/presidents_levee_1841.jpg" place={place} size={size} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.7) 100%)'}} />
      {g >= t.at('earlier') && <Highlight text="1829" x={100} y={90} size={100} at={t.at('earlier')} seed={21} rot={-2} />}
      <Note text="champion of the common man" x={110} y={240} size={54} rot={-3} at={t.at('champion')} />
      <Note text="an orphan from the backwoods" x={110} y={330} size={54} rot={-3} at={t.at('orphan')} color="#ffffff" />
      <Note text="thousands crammed into the White House" x={620} y={890} size={52} rot={-2} at={t.at('crammed')} />
      {g >= t.at("People's President") && <Highlight text="THE PEOPLE'S PRESIDENT" x={180} y={520} size={100} at={t.at("People's President")} seed={23} rot={-2} />}
      <Tag text="Robert Cruikshank, The President's Levee, or All Creation Going to the White House, 1841 · Library of Congress" />
    </AbsoluteFill>
  );
};

/** Four years later, a crown. */
const Later: React.FC<{t: TL}> = ({t}) => {
  const frame = useCurrentFrame();
  const a = t.at('Four years', 2);
  const z = interpolate(frame, [a, t.at("So here's")], [1.2, 1.35], clamp);
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard mask={MASKS.king_andrew} src="img/v3/ch01/king_andrew_1833.jpg" size={KA} x={260} y={120} w={620} h={840} fx={530} fy={420} scale={z} rot={1.5}>
        {(S) => {
          const [cx, cy] = S(530, 225);
          return <Loop cx={cx} cy={cy} rx={120 * z} ry={80 * z} at={t.at('crown', 2) - 2} dur={8} width={7} seed={25} />;
        }}
      </CropCard>
      <Note text="four years later..." x={1020} y={300} size={62} rot={-3} at={a} />
      <Note text="his enemies drew him" x={1020} y={430} size={62} rot={-3} at={t.at('enemies')} color="#ffffff" />
      <Note text="in a crown." x={1060} y={530} size={70} rot={-3} at={t.at('crown', 2)} color={usePal().subject} />
      <Tag text="King Andrew the First, c. 1833 · Library of Congress" />
    </AbsoluteFill>
  );
};

/** The question, with a crown drawn onto the portrait. */
const Question: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const q = t.at('question');
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard mask={MASKS.sully} src="img/jackson_sully_1845.jpg" size={SULLY} x={140} y={300} w={560} h={700} fx={930} fy={1050} scale={0.55} rot={-2} at={t.at("So here's") - 1}>
        {(S) => {
          const [x0, y] = S(520, 330);
          const [x1] = S(1340, 330);
          return <DrawnCrown x0={x0} x1={x1} y={y} h={150} at={t.at('king') - 4} dur={12} />;
        }}
      </CropCard>
      <Note text="so here's the question:" x={860} y={140} size={60} rot={-3} at={q} />
      {g >= t.at("People's President") && <Highlight text="THE PEOPLE'S PRESIDENT" x={860} y={290} size={70} at={t.at("People's President")} seed={27} rot={-2} />}
      <Note text="...called a" x={900} y={450} size={62} rot={-3} at={t.at('called')} color="#ffffff" />
      {g >= t.at('king') && <Highlight text="KING?" x={1240} y={430} size={130} at={t.at('king')} seed={29} rot={-3} />}
      <Note text="historians still argue about this one" x={880} y={700} size={48} rot={-2} at={t.at('Historians')} color="#ffffff" />
      <Note text="so: the evidence." x={920} y={790} size={56} rot={-2} at={t.at('evidence')} />
      <Tag text="Thomas Sully, Andrew Jackson, 1845 · National Gallery of Art" />
    </AbsoluteFill>
  );
};

/** And it starts with a teenager, a British officer, and a pair of dirty boots. */
const Boots: React.FC<{t: TL}> = ({t}) => {
  const frame = useCurrentFrame();
  const size: [number, number] = [3000, 2303];
  const a = t.at('And it');
  const place = fill(size, 1520, 1080, interpolate(frame, [a, a + 150], [1.25, 1.36], clamp));
  const S = (x: number, y: number) => [place.left + x * place.scale, place.top + y * place.scale];
  const [bx, by] = S(1720, 1250);
  const [ox, oy] = S(1125, 730);
  const [kx, ky] = S(1150, 1420);
  const s = place.scale;
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <Picture src="img/v3/ch02/brave_boy_waxhaws.jpg" place={place} size={size} bw="grayscale(1) contrast(1.25)" />
      <Tint mask={MASKS.brave_boy.alpha} place={place} size={size} />
      <Traced paths={MASKS.brave_boy.data.shapes.subject} place={place} at={t.at('teenager') - 2} dur={10} width={5} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)'}} />
      <Loop cx={bx} cy={by} rx={210 * s} ry={580 * s} tilt={-6} at={t.at('teenager') - 2} dur={8} width={6} seed={31} />
      <Loop cx={ox} cy={oy} rx={120 * s} ry={140 * s} at={t.at('officer') - 2} dur={8} width={6} seed={33} />
      <Loop cx={kx} cy={ky} rx={230 * s} ry={170 * s} tilt={4} at={t.at('boots') - 2} dur={8} width={6} seed={35} />
      <Note text="a teenager" x={1380} y={120} size={56} rot={-3} at={t.at('teenager')} />
      <Note text="a British officer" x={120} y={120} size={56} rot={-3} at={t.at('officer')} />
      <Note text="dirty boots" x={560} y={900} size={64} rot={-3} at={t.at('boots')} color={usePal().subject} />
      <Tag text="Currier & Ives, The Brave Boy of the Waxhaws, 1876 · Library of Congress" />
    </AbsoluteFill>
  );
};

/** Title card after the channel intro. */
const Title: React.FC = () => {
  const g = useGFrame();
  const pal = usePal();
  return (
    <AbsoluteFill style={{background: '#15130f'}}>
      <MapView cx={2600} cy={2320} s={0.26 + g * 0.0003} rot={0} dim={0.5} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(8,6,4,0.2) 30%, rgba(8,6,4,0.85) 100%)'}} />
      <Highlight text="KING ANDREW" x={330} y={360} size={180} at={4} seed={61} rot={-2} />
      {g >= 14 && <div style={{position: 'absolute', left: 380, top: 640, fontFamily: JF.display, fontSize: 64, color: pal.mark, textShadow: '0 3px 16px rgba(0,0,0,0.8)', opacity: interpolate(g, [14, 20], [0, 1], clamp)}}>How the People's President Got a Crown</div>}
      <Note text="1767 – 1845" x={1340} y={760} size={52} rot={-5} at={24} />
    </AbsoluteFill>
  );
};

const Body: React.FC = () => {
  const frame = useCurrentFrame();
  const t = makeTimeline(N, 30);
  const at = t.at;
  const cuts: [number, React.ReactNode][] = [
    [0, <Cartoon t={t} />],
    [at("That's") - 1, <President t={t} />],
    [at('Just') - 1, <Crowd t={t} />],
    [at('Four years', 2) - 1, <Later t={t} />],
    [at("So here's") - 1, <Question t={t} />],
    [at('And it') - 1, <Boots t={t} />],
  ];
  let scene = cuts.reduce((acc, [f, node]) => (frame >= f ? node : acc), cuts[0][1]);
  if (frame >= END + INTRO_FRAMES) scene = <Sequence from={END + INTRO_FRAMES} layout="none"><Title /></Sequence>;
  else if (frame >= END) scene = <Sequence from={END} layout="none"><ChannelIntro /></Sequence>;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {scene}
      {frame < END && <Finish vignette={0.3} />}
      <Audio src={staticFile('audio/v3_ch01_cold_open.wav')} />
      <Audio src={staticFile('music/v3/r_cold_open.mp3')} volume={(f) => interpolate(f, [0, 15, END - 30, END], [0, 0.17, 0.17, 0.0], clamp)} />
      {cuts.slice(1).map(([f], i) => <Sfx key={i} at={f} src="sfx/whoosh.wav" volume={0.35} />)}
      {['King Andrew', 'Andrew Jackson', 'earlier', "People's President", 'king'].map((c) => <Sfx key={c} at={at(c)} src="sfx/stamp.wav" volume={0.3} />)}
      {['cartoon', 'royal', 'crown', 'scepter', 'veto', 'torn-up', 'president', 'champion', 'orphan', 'crammed', 'enemies', 'question', 'called', 'Historians', 'evidence', 'teenager', 'officer', 'boots'].map((c) => (
        <Sfx key={c} at={at(c) - 2} src={WRITE.src} volume={WRITE.volume} />
      ))}
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
