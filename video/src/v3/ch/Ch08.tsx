// Chapter 8 · It Must Be Preserved (the tariff and nullification)
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import words from '../../../public/audio/v3_ch08_federal_union.words.json';
import {clamp} from '../../lib/anim';
import {Highlight, INK, JF, Note, Picture, Tag, Tint, Traced, useGFrame, usePal} from '../Kit';
import {DarkPaper, Sfx, WRITE} from '../common';
import {Stool} from '../figures';
import {MapScene, Pin, PLACES, Region, Route} from '../map';
import {ChapterShell, chapterFrames, CropCard, Definition, fill, hasFile, LEAD, makeTimeline, type Narration, PhotoCard, Quote, Stamp, type TL, useScene} from '../shell';
import {MASKS} from '../masks';

const N = words as Narration;
export const CH08_FRAMES = chapterFrames(N, LEAD);
const GEN: [number, number] = [1200, 896];
const CALHOUN: [number, number] = [1920, 2560];
/** South Carolina, roughly, in map pixels. */
const SC = [[2430, 2700], [2560, 2660], [2700, 2700], [2800, 2790], [2830, 2840], [2760, 2930], [2690, 3010], [2620, 3060], [2520, 2990], [2450, 2860], [2400, 2760]];
const BRITAIN = [4300, 1750];

const Something: React.FC<{t: TL}> = ({t}) => (
  <AbsoluteFill>
    <DarkPaper />
    <CropCard mask={MASKS.king_andrew} src="img/v3/ch01/king_andrew_1833.jpg" size={[1017, 1536]} x={1280} y={120} w={480} h={820} fx={508} fy={700} scale={0.55} rot={3} at={1} bw="grayscale(1) contrast(1.2) brightness(0.6)" />
    <Note text="here's where the People's President" x={120} y={380} size={62} rot={-3} at={1} color="#ffffff" />
    <Note text="starts to look like something else..." x={150} y={490} size={62} rot={-3} at={t.at('starts')} color={usePal().subject} />
  </AbsoluteFill>
);

const System: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard mask={MASKS.clay} src="img/clay_jouett.jpg" size={[1920, 2319]} x={110} y={180} w={400} h={520} fx={960} fy={1000} scale={0.32} rot={-2} at={1} />
      <Note text="Henry Clay's big plan:" x={110} y={60} size={48} rot={-3} at={t.at('big')} />
      {g >= t.at('American System') && <Highlight text="THE AMERICAN SYSTEM" x={640} y={140} size={76} at={t.at('American System')} seed={801} rot={-2} />}
      <Stool x={1160} y={300} show={[t.at('tariffs'), t.at('bank'), t.at('roads')]} scale={0.95} />
      <Definition term="in·ter·nal im·prove·ments" def="federally funded roads and canals" at={t.at('internal')} x={110} y={780} w={760} />
      <Note text="Jackson fought all three." x={140} y={940} size={60} rot={-3} at={t.at('fought')} color={usePal().subject} />
      <Tag text="Matthew Harris Jouett, Henry Clay, c. 1818" />
    </AbsoluteFill>
  );
};

const Trade: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const a = t.at('First');
  const cloth = t.at('cloth');
  const south = t.at('Terrible');
  return (
    <MapScene keys={[{f: a, x: 3050, y: 2300, s: 0.5}, {f: t.at('Abominations'), x: 3050, y: 2300, s: 0.53}]}
      svg={() => (
        <>
          <Route pts={[BRITAIN, [3900, 1720], PLACES.boston]} at={cloth - 4} dur={14} color={pal.box} />
          <Route pts={[PLACES.charleston, [3300, 2700], [3900, 2200], BRITAIN]} at={south + 6} dur={18} color={pal.subject} />
        </>
      )}>
      {(S) => {
        const [bx, by] = S(PLACES.lowell);
        const [cx, cy] = S(PLACES.charleston);
        const [ux, uy] = S(BRITAIN);
        return (
          <>
            {g >= a && <Highlight text="THE TARIFF" x={90} y={70} size={90} at={a} seed={803} rot={-2} />}
            <Definition term="tar·iff" def="a tax on imported goods" at={t.at('tax')} x={100} y={220} w={620} />
            <Note text="to & from Britain →" x={1380} y={110} size={50} rot={-3} at={cloth - 4} color="#ffffff" />
            <Note text="British cloth →" x={1300} y={220} size={50} rot={-3} at={cloth} color={pal.box} />
            <Pin x={bx} y={by} at={t.at('Northern')} />
            <Note text="Northern factories: great!" x={820} y={340} size={50} rot={-3} at={t.at('Northern')} />
            <Pin x={cx} y={cy} at={south} color={pal.subject} />
            <Note text="the South: terrible" x={760} y={640} size={50} rot={-3} at={south} color={pal.subject} />
            <Note text="(bought most of its goods from abroad)" x={760} y={730} size={40} rot={-3} at={t.at('abroad')} color="#ffffff" />
            {g >= t.at('Abominations') && <Highlight text="THE TARIFF OF ABOMINATIONS" x={250} y={880} size={76} at={t.at('Abominations')} seed={805} rot={-2} />}
          </>
        );
      }}
    </MapScene>
  );
};

const Nullify: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard mask={MASKS.calhoun} src="img/calhoun_healy.jpg" size={CALHOUN} x={120} y={170} w={460} h={610} fx={960} fy={1000} scale={0.38} rot={-2} at={t.at('Leading') - 1} />
      <Note text="Jackson's own vice president" x={130} y={830} size={46} rot={-2} at={t.at('vice')} color="#ffffff" />
      {g >= t.at('John C') && <Highlight text="JOHN C. CALHOUN" x={690} y={90} size={84} at={t.at('John C')} seed={807} rot={-2} />}
      <Note text="of South Carolina" x={720} y={220} size={50} rot={-3} at={t.at('South Carolina')} />
      {g >= t.at('nullify') && <Highlight text="NULLIFICATION" x={690} y={340} size={100} at={t.at('nullify')} seed={809} rot={-3} />}
      <Definition term="nul·li·fy" def="to cancel; here, a state declaring a federal law void inside its borders" at={t.at('cancel')} x={700} y={520} w={1100} />
      <Note text="from the Virginia & Kentucky Resolutions, 1798" x={710} y={680} size={44} rot={-2} at={t.at('Virginia')} color="#ffffff" />
      <Note text="...made anonymously" x={730} y={780} size={52} rot={-3} at={t.at('anonymously')} />
      <Note text="(basically a burner account)" x={760} y={870} size={56} rot={-3} at={t.at('burner')} color={pal.subject} />
      <Tag text="G. P. A. Healy, John C. Calhoun, 1845 · Wikimedia Commons" />
    </AbsoluteFill>
  );
};

const Toast: React.FC<{t: TL}> = ({t}) => {
  const frame = useCurrentFrame();
  const g = useGFrame();
  const gen = hasFile('img/gen/v3_ch08_toast.png');
  const a = t.at('In 1830');
  const tp = fill(GEN, 600, 448, interpolate(frame, [a, a + 400], [1.02, 1.12], clamp));
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      {gen ? (
        <>
          <Picture src="img/gen/v3_ch08_toast.png" place={tp} size={GEN} bw="grayscale(1) contrast(1.2) brightness(0.6)" />
          <Tint mask={MASKS.toast.alpha} place={tp} size={GEN} />
          <Traced paths={MASKS.toast.data.shapes.subject} place={tp} at={t.at('glass') - 2} dur={12} width={5} />
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)'}} />
        </>
      ) : (
        <>
          <DarkPaper />
          <CropCard src="img/jackson_sully_1845.jpg" size={[1920, 2288]} x={120} y={560} w={330} h={420} fx={960} fy={1000} scale={0.3} rot={-3} at={t.at('glass') - 1} />
          <CropCard src="img/calhoun_healy.jpg" size={CALHOUN} x={1470} y={560} w={330} h={420} fx={960} fy={1000} scale={0.27} rot={3} at={t.at('answered') - 1} />
        </>
      )}
      {g >= a && <Highlight text="APRIL 1830" x={90} y={60} size={80} at={a} seed={811} rot={-2} />}
      <Note text="a dinner for Jefferson's birthday" x={600} y={90} size={50} rot={-3} at={t.at('dinner')} color="#ffffff" />
      <Quote text="Our Federal Union: it must be preserved." at={t.at('Our')} x={120} y={210} w={1700} size={70} who="Jackson" />
      <Quote text="The Union, next to our liberty, most dear." at={t.at('The Union')} x={500} y={440} w={1300} size={60} who="Calhoun" />
      <Tag text={gen ? 'Illustration · the Jefferson Day dinner, 1830' : 'Sully, Andrew Jackson · Healy, John C. Calhoun'} />
    </AbsoluteFill>
  );
};

const Void: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const a = t.at('In 1832');
  return (
    <MapScene keys={[{f: a, x: 2640, y: 2850, s: 0.75}, {f: a + 60, x: 2700, y: 2860, s: 1.0}]} svg={() => <Region pts={SC} at={a + 2} color={pal.subject} width={9} />}>
      {() => (
        <>
          {g >= a && <Highlight text="1832" x={90} y={70} size={100} at={a} seed={813} rot={-2} />}
          <Note text="South Carolina: the tariffs are void here" x={100} y={220} size={50} rot={-3} at={t.at('void')} color="#ffffff" />
          {g >= t.at('void') && <Stamp text="VOID" x={1250} y={400} at={t.at('void')} size={180} color={pal.subject} rot={-12} />}
          <Note text="...and threatened to leave the Union" x={100} y={320} size={50} rot={-3} at={t.at('threatened')} />
          <Note text="Calhoun resigned" x={100} y={820} size={60} rot={-3} at={t.at('resigned')} color="#ffffff" />
          <Note text="(the first vice president ever to quit)" x={120} y={910} size={46} rot={-3} at={t.at('quit')} />
        </>
      )}
    </MapScene>
  );
};

const Treason: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const proc = hasFile('img/v3/ch08/proclamation_1832.jpg');
  return (
    <AbsoluteFill>
      <DarkPaper />
      {proc && <PhotoCard src="img/v3/ch08/proclamation_1832.jpg" x={1340} y={90} w={460} h={640} rot={3} at={t.at('In an') - 1} fit="cover" pos="50% 10%" />}
      <Note text="Jackson's official proclamation:" x={110} y={80} size={52} rot={-3} at={t.at('proclamation')} />
      <Quote text="Disunion by armed force is treason." at={t.at('Disunion')} x={110} y={190} w={1150} size={84} who="Proclamation to the People of South Carolina, December 1832" />
      {g >= t.at('Force Bill') && <Highlight text="THE FORCE BILL" x={110} y={560} size={90} at={t.at('Force Bill')} seed={815} rot={-2} />}
      <Definition term="Force Bill" def="permission to use the army to collect the tax" at={t.at('permission')} x={120} y={720} w={820} />
      <Note text="meanwhile, Clay (of all people): a compromise" x={110} y={870} size={46} rot={-3} at={t.at('Meanwhile')} color="#ffffff" />
      <Note text="→ South Carolina backed down" x={1040} y={960} size={50} rot={-3} at={t.at('backed')} color={pal.mark} />
      {proc && <Tag text="Jackson's Proclamation, 1832 · Library of Congress" />}
    </AbsoluteFill>
  );
};

const TwoViews: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <div style={{position: 'absolute', left: 958, top: 120, width: 4, height: 620, background: 'rgba(244,239,230,0.35)'}} />
      <div style={{position: 'absolute', left: 140, top: 160, fontFamily: JF.mono, fontSize: 30, letterSpacing: 4, color: pal.mark}}>JACKSON'S SUPPORTERS</div>
      {g >= t.at('saved') && <Highlight text="HE SAVED THE UNION" x={120} y={260} size={70} at={t.at('saved')} seed={817} rot={-3} />}
      <div style={{position: 'absolute', left: 1040, top: 160, fontFamily: JF.mono, fontSize: 30, letterSpacing: 4, color: pal.subject, opacity: g >= t.at('To South') ? 1 : 0}}>SOUTH CAROLINA</div>
      {g >= t.at('tyrant') && <Highlight text="A TYRANT" x={1040} y={260} size={100} at={t.at('tyrant')} seed={819} rot={-3} />}
      <Note text="threatening his own people" x={1030} y={440} size={44} rot={-3} at={t.at('threatening')} color="#ffffff" />
      <Note text="with an army, over a tax" x={1050} y={520} size={44} rot={-3} at={t.at('army', 2)} color="#ffffff" />
      <Note text="can a state just say no to the Union?" x={120} y={820} size={54} rot={-3} at={t.at('question')} />
      {g >= t.at('thirty') && <Stamp text="1860" x={1380} y={690} at={t.at('thirty')} size={110} color={pal.subject} />}
      <Note text="the answer: the Civil War" x={1250} y={860} size={54} rot={-3} at={t.at('Civil')} color={pal.subject} />
    </AbsoluteFill>
  );
};

const Body: React.FC = () => {
  const t = makeTimeline(N, 30);
  const at = t.at;
  const cuts: [number, React.ReactNode][] = [
    [0, <Something t={t} />],
    [at('Henry Clay') - 1, <System t={t} />],
    [at('First') - 1, <Trade t={t} />],
    [at('Leading') - 1, <Nullify t={t} />],
    [at('In 1830') - 1, <Toast t={t} />],
    [at('In 1832') - 1, <Void t={t} />],
    [at('In an') - 1, <Treason t={t} />],
    [at("To Jackson's") - 1, <TwoViews t={t} />],
  ];
  const scene = useScene(cuts);
  return (
    <>
      {scene}
      {cuts.slice(1).map(([f], i) => <Sfx key={i} at={f} src="sfx/whoosh.wav" volume={0.28} />)}
      {['American System', 'First', 'Abominations', 'John C', 'nullify', 'In 1830', 'In 1832', 'void', 'Force Bill', 'saved', 'tyrant', 'thirty'].map((c) => <Sfx key={c} at={at(c)} src="sfx/stamp.wav" volume={0.27} />)}
      {['tariffs', 'bank', 'roads'].map((c) => <Sfx key={c} at={at(c)} src="sfx/tick.wav" volume={0.4} />)}
      {['starts', 'big', 'fought', 'cloth', 'Northern', 'Terrible', 'abroad', 'vice', 'Virginia', 'anonymously', 'burner', 'dinner', 'threatened', 'resigned', 'proclamation', 'Meanwhile', 'backed', 'threatening', 'question', 'Civil'].map((c) => (
        <Sfx key={c} at={at(c) - 2} src={WRITE.src} volume={WRITE.volume} />
      ))}
    </>
  );
};

export const Ch08: React.FC = () => (
  <ChapterShell n={N} audio="audio/v3_ch08_federal_union.wav" lead={LEAD} music={[{src: 'music/v3/r_abolition_b.mp3', volume: 0.12}]}>
    <Body />
  </ChapterShell>
);
