// Chapter 7 · The Petticoat Affair (and the Kitchen Cabinet)
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import words from '../../../public/audio/v3_ch07_petticoat_affair.words.json';
import {clamp} from '../../lib/anim';
import {Highlight, INK, JF, Note, Picture, Tag, useGFrame, usePal} from '../Kit';
import {DarkPaper, Sfx, WRITE} from '../common';
import {ChapterShell, chapterFrames, CropCard, Definition, DrawnCrown, fill, hasFile, LEAD, makeTimeline, type Narration, Photo, PhotoCard, Quote, type TL, useScene} from '../shell';

const N = words as Narration;
export const CH07_FRAMES = chapterFrames(N, LEAD);
const GEN: [number, number] = [1376, 768];
const SULLY: [number, number] = [1920, 2288];
const PEGGY: [number, number] = [1920, 2661];

const Widower: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard src="img/jackson_sully_1845.jpg" size={SULLY} x={180} y={160} w={540} h={720} fx={960} fy={1000} scale={0.5} rot={-2} at={1} />
      {g >= t.at('scandal') && <Highlight text="A SCANDAL" x={840} y={180} size={110} at={t.at('scandal')} seed={701} rot={-3} />}
      <Note text="...and this one tells you a lot" x={840} y={360} size={48} rot={-3} at={t.at('tells')} color="#ffffff" />
      <Note text="about Jackson the man" x={870} y={440} size={48} rot={-3} at={t.at('man')} color="#ffffff" />
      <Note text="arrived in Washington a grieving widower" x={840} y={590} size={46} rot={-3} at={t.at('grieving')} />
      <Tag text="Thomas Sully, Andrew Jackson, 1845 · National Gallery of Art" />
    </AbsoluteFill>
  );
};

const Eatons: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard src="img/john_eaton.jpg" size={[871, 1157]} x={140} y={220} w={420} h={560} fx={435} fy={520} scale={0.62} rot={-3} at={t.at('John') - 1} />
      <CropCard src="img/peggy_eaton_brady.jpg" size={PEGGY} x={1340} y={200} w={440} h={600} fx={960} fy={1150} scale={0.42} rot={3} at={t.at('Peggy') - 1} />
      <Note text="John Eaton" x={160} y={820} size={50} rot={-2} at={t.at('John')} color="#ffffff" />
      <Note text="Secretary of War, old friend" x={140} y={900} size={42} rot={-2} at={t.at('Secretary')} />
      {g >= t.at('married') && <Highlight text="JUST MARRIED" x={660} y={330} size={80} at={t.at('married')} seed={703} rot={-3} />}
      <Note text="Peggy Timberlake" x={1360} y={840} size={50} rot={-2} at={t.at('Peggy')} color="#ffffff" />
      <Note text="a tavern keeper's daughter" x={620} y={520} size={48} rot={-3} at={t.at('tavern')} />
      <Note text="...with a reputation" x={700} y={610} size={52} rot={-3} at={t.at('reputation')} color={usePal().subject} />
      <Tag text="John Eaton, portrait · Margaret (Peggy) Eaton, later photograph, Brady studio · Library of Congress" />
    </AbsoluteFill>
  );
};

const Snub: React.FC<{t: TL}> = ({t}) => {
  const frame = useCurrentFrame();
  const g = useGFrame();
  const pal = usePal();
  const gen = hasFile('img/gen/v3_ch07_snub.png');
  const a = t.at("Washington's society");
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      {gen ? (
        <>
          <Picture src="img/gen/v3_ch07_snub.png" place={fill(GEN, 688, 384, interpolate(frame, [a, a + 360], [1.02, 1.1], clamp))} size={GEN} bw="grayscale(1) contrast(1.2) brightness(0.75)" />
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 100%)'}} />
        </>
      ) : (
        <>
          <DarkPaper />
          <CropCard src="img/floride_calhoun.jpg" size={[200, 296]} x={1380} y={160} w={360} h={480} fx={100} fy={150} scale={1.9} rot={2} at={t.at('Floride') - 1} />
        </>
      )}
      <Note text="Washington's society wives:" x={100} y={70} size={52} rot={-3} at={a} color="#ffffff" />
      <Note text="led by Floride Calhoun, the vice president's wife" x={100} y={160} size={46} rot={-3} at={t.at('Floride')} />
      <Note text="nothing to do with her." x={120} y={250} size={52} rot={-3} at={t.at('anything')} color={pal.subject} />
      {g >= t.at('Petticoat') && <Highlight text="THE PETTICOAT AFFAIR" x={100} y={620} size={100} at={t.at('Petticoat')} seed={705} rot={-3} />}
      <Definition term="pet·ti·coat" def="a skirt worn under a dress" at={t.at('skirt')} x={110} y={790} w={900} />
      <Note text="(so, basically: the skirt scandal)" x={120} y={900} size={50} rot={-3} at={t.at('skirt scandal')} color={pal.subject} />
      <Tag text={gen ? 'Illustration · a Washington parlor, 1829' : 'Floride Calhoun, portrait · Wikimedia Commons'} />
    </AbsoluteFill>
  );
};

const AllIn: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard src="img/rachel_earl.jpg" size={[1920, 2286]} x={130} y={150} w={380} h={500} fx={960} fy={1000} scale={0.36} rot={-3} at={t.at('To Jackson') - 1} />
      <CropCard src="img/peggy_eaton_brady.jpg" size={PEGGY} x={560} y={200} w={380} h={500} fx={960} fy={1150} scale={0.34} rot={2} at={t.at('To Jackson') + 2} />
      <Note text="Rachel all over again" x={160} y={740} size={60} rot={-3} at={t.at('Rachel')} color={pal.subject} />
      <Note text="torn apart by gossip" x={200} y={840} size={52} rot={-3} at={t.at('gossip')} color="#ffffff" />
      {g >= t.at('all in') && <Highlight text="SO HE WENT ALL IN" x={1030} y={150} size={70} at={t.at('all in')} seed={707} rot={-3} />}
      <Note text="a cabinet meeting, to declare Peggy..." x={1040} y={300} size={44} rot={-3} at={t.at('cabinet meeting')} color="#ffffff" />
      <Quote text="as chaste as a virgin." at={t.at('chaste')} x={1040} y={400} w={820} size={70} />
      <Note text="(not normally what cabinet meetings are for)" x={1000} y={640} size={42} rot={-3} at={t.at('Which')} color={pal.subject} />
      <Tag text="Earl, Rachel Jackson, c. 1827 · Peggy Eaton, Brady studio · Library of Congress" />
    </AbsoluteFill>
  );
};

const Niece: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const has = hasFile('img/v3/ch07/emily_donelson.jpg');
  return (
    <AbsoluteFill>
      <DarkPaper />
      {has && <PhotoCard src="img/v3/ch07/emily_donelson.jpg" x={160} y={170} w={440} h={580} rot={-2} at={t.at('niece') - 1} />}
      <Note text="his own niece, Emily Donelson" x={has ? 720 : 160} y={170} size={54} rot={-3} at={t.at('niece')} color="#ffffff" />
      <Note text="ran the White House for him" x={has ? 740 : 180} y={270} size={48} rot={-3} at={t.at('ran')} />
      <Note text="refused to visit Peggy" x={has ? 740 : 180} y={360} size={48} rot={-3} at={t.at('refused', 2)} />
      {g >= t.at('Tennessee') && <Highlight text="SENT HOME TO TENNESSEE" x={has ? 700 : 160} y={500} size={76} at={t.at('Tennessee')} seed={709} rot={-3} />}
      {g >= t.at('Loyal') && <Highlight text="LOYAL? ABSOLUTELY." x={has ? 700 : 160} y={680} size={70} at={t.at('Loyal')} seed={711} rot={-2} />}
      {g >= t.at('Stubborn') && <Highlight text="STUBBORN? ALSO ABSOLUTELY." x={has ? 700 : 160} y={820} size={60} at={t.at('Stubborn')} seed={713} rot={-2} />}
      {has && <Tag text="Ralph E. W. Earl, Emily Donelson · The Hermitage" />}
    </AbsoluteFill>
  );
};

const Rise: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const up = t.at('favorite');
  const down = t.at('did not');
  const arrow = (x: number, y0: number, y1: number, at: number, color: string) => {
    const p = interpolate(g, [at, at + 8], [0, 1], clamp);
    return g >= at ? (
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
        <line x1={x} y1={y0} x2={x} y2={y0 + (y1 - y0) * p} stroke={color} strokeWidth={14} strokeLinecap="round" />
        {p >= 1 && <path d={`M ${x - 36} ${y1 + (y1 < y0 ? 40 : -40)} L ${x} ${y1} L ${x + 36} ${y1 + (y1 < y0 ? 40 : -40)}`} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    ) : null;
  };
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard src="img/van_buren_inman.jpg" size={[1920, 2313]} x={200} y={260} w={420} h={560} fx={960} fy={950} scale={0.38} rot={-2} at={t.at('Martin') - 1} />
      <CropCard src="img/calhoun_healy.jpg" size={[1920, 2560]} x={1100} y={260} w={420} h={560} fx={960} fy={1000} scale={0.36} rot={2} at={t.at('Calhoun', 2) - 1} />
      {arrow(720, 780, 300, up, pal.mark)}
      {arrow(1620, 300, 780, down, pal.subject)}
      <Note text="Van Buren: nice to the Eatons" x={160} y={120} size={48} rot={-3} at={t.at('nice')} color="#ffffff" />
      <Note text="→ Jackson's favorite" x={200} y={870} size={56} rot={-3} at={up} />
      <Note text="Calhoun: whose wife started it" x={1060} y={120} size={48} rot={-3} at={t.at('Calhoun', 2)} color="#ffffff" />
      <Note text="→ did not" x={1120} y={870} size={60} rot={-3} at={down} color={pal.subject} />
      <Tag text="Henry Inman, Martin Van Buren · G. P. A. Healy, John C. Calhoun" />
    </AbsoluteFill>
  );
};

const Rats: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const size: [number, number] = [2224, 3000];
  const a = t.at('By 1831');
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard src="img/rats_leaving_1831.jpg" size={size} x={1080} y={60} w={720} h={960} fx={1112} fy={1500} scale={0.33} rot={2} at={a - 1} />
      {g >= a && <Highlight text="1831" x={110} y={100} size={110} at={a} seed={715} rot={-2} />}
      <Note text="the feud wrecked the cabinet" x={120} y={290} size={56} rot={-3} at={t.at('wrecked')} color="#ffffff" />
      <Note text="Jackson pushed out nearly all of it" x={120} y={390} size={56} rot={-3} at={t.at('pushed')} />
      <Note text="(a cartoonist drew them as rats" x={140} y={600} size={44} rot={-3} at={t.at('pushed') + 20} color="#ffffff" />
      <Note text="fleeing a falling house)" x={160} y={670} size={44} rot={-3} at={t.at('pushed') + 26} color="#ffffff" />
      <Tag text="Edward W. Clay, The Rats Leaving a Falling House, 1831 · Library of Congress" />
    </AbsoluteFill>
  );
};

const Kitchen: React.FC<{t: TL}> = ({t}) => {
  const frame = useCurrentFrame();
  const g = useGFrame();
  const pal = usePal();
  const gen = hasFile('img/gen/v3_ch07_kitchen_door.png');
  const blair = hasFile('img/v3/ch07/francis_blair.jpg');
  const a = t.at('After that');
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      {gen ? (
        <>
          <Picture src="img/gen/v3_ch07_kitchen_door.png" place={fill(GEN, 688, 384, interpolate(frame, [a, a + 400], [1.02, 1.1], clamp))} size={GEN} bw="grayscale(1) contrast(1.2) brightness(0.8)" />
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 100%)'}} />
        </>
      ) : (
        <>
          <DarkPaper />
          <PhotoCard src="img/v3/ch07/amos_kendall.jpg" x={1080} y={200} w={330} h={430} rot={-3} at={t.at('editors') - 1} />
          {blair && <PhotoCard src="img/v3/ch07/francis_blair.jpg" x={1470} y={240} w={330} h={430} rot={3} at={t.at('editors') + 3} />}
          <Note text="Amos Kendall" x={1100} y={680} size={42} rot={-2} at={t.at('editors')} color="#ffffff" />
          {blair && <Note text="Francis Blair" x={1490} y={720} size={42} rot={-2} at={t.at('editors') + 3} color="#ffffff" />}
        </>
      )}
      <Note text="unofficial advisers:" x={100} y={80} size={54} rot={-3} at={t.at('unofficial')} />
      <Note text="newspaper editors, old friends, political allies" x={120} y={170} size={44} rot={-3} at={t.at('editors')} color="#ffffff" />
      {g >= t.at('Kitchen') && <Highlight text="THE KITCHEN CABINET" x={100} y={500} size={96} at={t.at('Kitchen')} seed={717} rot={-3} />}
      <Definition term="Kitch·en Cab·i·net" def="a president's unofficial advisers, outside the official cabinet" at={t.at('back door')} x={110} y={680} w={880} />
      <Note text="(as if they came in through the back door)" x={120} y={860} size={46} rot={-3} at={t.at('back door')} color={pal.subject} />
      <Tag text={gen ? 'Illustration · the President\'s House kitchen, 1831' : 'Amos Kendall, Francis P. Blair · Library of Congress'} />
    </AbsoluteFill>
  );
};

const Court: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <div style={{position: 'absolute', left: 958, top: 120, width: 4, height: 840, background: 'rgba(244,239,230,0.35)'}} />
      <div style={{position: 'absolute', left: 160, top: 180, fontFamily: JF.mono, fontSize: 30, letterSpacing: 4, color: pal.mark}}>TO JACKSON</div>
      <Note text="people he could trust" x={150} y={300} size={80} rot={-3} at={t.at('trust')} />
      <div style={{position: 'absolute', left: 1060, top: 180, fontFamily: JF.mono, fontSize: 30, letterSpacing: 4, color: pal.subject, opacity: g >= t.at('To his') ? 1 : 0}}>TO HIS CRITICS</div>
      <DrawnCrown x0={1250} x1={1570} y={470} h={110} at={t.at('king')} color={pal.subject} />
      <Note text="a king listening" x={1040} y={520} size={58} rot={-3} at={t.at('king')} color="#ffffff" />
      <Note text="to his court" x={1060} y={610} size={58} rot={-3} at={t.at('court')} color="#ffffff" />
      <Note text="instead of his government" x={1060} y={720} size={54} rot={-3} at={t.at('government')} color={pal.subject} />
    </AbsoluteFill>
  );
};

const Body: React.FC = () => {
  const t = makeTimeline(N, 30);
  const at = t.at;
  const cuts: [number, React.ReactNode][] = [
    [0, <Widower t={t} />],
    [at('His old') - 1, <Eatons t={t} />],
    [at("Washington's society") - 1, <Snub t={t} />],
    [at('To Jackson') - 1, <AllIn t={t} />],
    [at('When his') - 1, <Niece t={t} />],
    [at('Martin') - 1, <Rise t={t} />],
    [at('By 1831') - 1, <Rats t={t} />],
    [at('After that') - 1, <Kitchen t={t} />],
    [at('To Jackson', 2) - 1, <Court t={t} />],
  ];
  const scene = useScene(cuts);
  return (
    <>
      {scene}
      {cuts.slice(1).map(([f], i) => <Sfx key={i} at={f} src="sfx/whoosh.wav" volume={0.28} />)}
      {['scandal', 'married', 'Petticoat', 'all in', 'Tennessee', 'Loyal', 'Stubborn', 'By 1831', 'Kitchen'].map((c) => <Sfx key={c} at={at(c)} src="sfx/stamp.wav" volume={0.27} />)}
      {['tells', 'grieving', 'tavern', 'reputation', 'anything', 'skirt scandal', 'Rachel', 'gossip', 'Which', 'niece', 'nice', 'favorite', 'did not', 'wrecked', 'pushed', 'unofficial', 'editors', 'trust', 'king', 'government'].map((c) => (
        <Sfx key={c} at={at(c) - 2} src={WRITE.src} volume={WRITE.volume} />
      ))}
    </>
  );
};

export const Ch07: React.FC = () => (
  <ChapterShell n={N} audio="audio/v3_ch07_petticoat_affair.wav" lead={LEAD} music={[{src: 'music/gossip.mp3', volume: 0.13}]}>
    <Body />
  </ChapterShell>
);
