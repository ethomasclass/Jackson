// Chapter 9 · The Monster (the Bank War)
import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import words from '../../../public/audio/v3_ch09_the_monster.words.json';
import {clamp} from '../../lib/anim';
import {Highlight, INK, JF, Note, Picture, Tag, useGFrame, usePal} from '../Kit';
import {DarkPaper, Sfx, WRITE} from '../common';
import {SystemCards} from '../figures';
import {ChapterShell, chapterFrames, CropCard, Definition, DrawnCrown, fill, hasFile, LEAD, makeTimeline, type Narration, Photo, PhotoCard, Quote, Stamp, type TL, useScene} from '../shell';
import {MASKS} from '../masks';

const N = words as Narration;
export const CH09_FRAMES = chapterFrames(N, LEAD);
const GEN: [number, number] = [1200, 896];

const Bank: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const bld = hasFile('img/v3/ch09/second_bank.jpg');
  const biddle = hasFile('img/v3/ch09/biddle.jpg');
  return (
    <AbsoluteFill>
      <DarkPaper />
      <SystemCards x={1400} y={70} show={[0, 0, 0]} knock={[-99, t.at("Next") + 10, 1e7]} scale={0.45} />
      <Note text="next target:" x={100} y={70} size={56} rot={-3} at={1} />
      {g >= t.at('Bank') && <Highlight text="THE BANK" x={480} y={60} size={100} at={t.at('Bank')} seed={901} rot={-2} />}
      {bld && <PhotoCard src="img/v3/ch09/second_bank.jpg" x={110} y={250} w={640} h={430} rot={-2} at={t.at('Second') - 1} />}
      <Note text="the Second Bank of the United States" x={bld ? 820 : 110} y={260} size={50} rot={-3} at={t.at('Second')} color="#ffffff" />
      <Note text="held the government's money" x={bld ? 840 : 130} y={360} size={48} rot={-3} at={t.at('held')} />
      <Note text="made borrowing easier or harder for everyone" x={bld ? 820 : 130} y={450} size={40} rot={-3} at={t.at('easier')} />
      <Note text="mostly privately owned" x={bld ? 840 : 130} y={560} size={48} rot={-3} at={t.at('privately')} color="#ffffff" />
      {biddle && <PhotoCard src="img/v3/ch09/biddle.jpg" x={1380} y={560} w={330} h={420} rot={3} at={t.at('Nicholas') - 1} />}
      {g >= t.at('Nicholas') && <Highlight text="NICHOLAS BIDDLE" x={110} y={720} size={76} at={t.at('Nicholas')} seed={903} rot={-2} />}
      <Note text="whom nobody elected" x={140} y={870} size={60} rot={-3} at={t.at('nobody')} color={usePal().subject} />
    </AbsoluteFill>
  );
};

const Monster: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const a = t.at('Jackson called');
  return (
    <Photo src="img/v3/ch09/hydra_1836.jpg" size={[3000, 2489]} fx={1500} fy={1150} a={a} b={t.at('In 1832')} z0={1.02} z1={1.14} vignette={0.75}>
      {() => (
        <>
          {g >= t.at('monster') && <Highlight text="“THE MONSTER”" x={100} y={80} size={110} at={t.at('monster')} seed={905} rot={-3} />}
          <Note text="partly personal:" x={110} y={260} size={52} rot={-3} at={t.at('personal')} color="#ffffff" />
          <Note text="nearly went broke on paper IOUs" x={110} y={350} size={52} rot={-3} at={t.at('IOUs')} />
          {g >= t.at('hard money') && <Highlight text="HARD MONEY" x={110} y={800} size={80} at={t.at('hard money')} seed={907} rot={-2} />}
          <Definition term="hard mon·ey" def="gold and silver coins, not paper" at={t.at('hard money') + 8} x={120} y={940} w={760} />
          <Tag text="H. R. Robinson, General Jackson Slaying the Many Headed Monster, 1836 · Library of Congress" />
        </>
      )}
    </Photo>
  );
};

/** Whose face ended up on the $20 bill. */
const Twenty: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const a = t.at('Which');
  const k = interpolate(g, [a, a + 6], [0.6, 1], clamp);
  return (
    <AbsoluteFill>
      <DarkPaper />
      <div style={{position: 'absolute', left: 360, top: 250, width: 1200, height: 510, background: '#dfe3d2', border: '10px double #3c4a3a', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', transform: `scale(${k}) rotate(-3deg)`, opacity: Math.min(1, (k - 0.6) * 4)}}>
        {['20', '20', '20', '20'].map((n, i) => <div key={i} style={{position: 'absolute', left: i % 2 ? 1060 : 30, top: i < 2 ? 20 : 400, fontFamily: JF.display, fontSize: 70, color: '#3c4a3a'}}>{n}</div>)}
        <div style={{position: 'absolute', left: 430, top: 60, width: 320, height: 380, borderRadius: '50%', overflow: 'hidden', border: '6px solid #3c4a3a'}}>
          <Img src={staticFile('img/jackson_sully_1845.jpg')} style={{position: 'absolute', left: -150, top: -120, width: 620, filter: 'grayscale(1) contrast(1.3) sepia(0.3) hue-rotate(40deg)'}} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 455, textAlign: 'center', fontFamily: JF.mono, fontSize: 26, letterSpacing: 6, color: '#3c4a3a'}}>TWENTY DOLLARS · PAPER MONEY</div>
      </div>
      <Note text="pretty funny, considering..." x={120} y={80} size={60} rot={-3} at={t.at('funny')} color="#ffffff" />
      <Note text="(he did not trust paper money)" x={620} y={880} size={60} rot={-3} at={t.at('twenty-dollar')} color={pal.subject} />
    </AbsoluteFill>
  );
};

const Recharter: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const web = hasFile('img/v3/ch09/webster.jpg');
  return (
    <AbsoluteFill>
      <DarkPaper />
      {g >= t.at('In 1832') && <Highlight text="1832" x={100} y={70} size={100} at={t.at('In 1832')} seed={909} rot={-2} />}
      <Note text="four years early" x={430} y={100} size={56} rot={-3} at={t.at('four')} color="#ffffff" />
      <CropCard mask={MASKS.clay} tint={null} src="img/clay_jouett.jpg" size={[1920, 2319]} x={130} y={280} w={330} h={430} fx={960} fy={1000} scale={0.27} rot={-3} at={t.at('Clay') - 1} />
      {web ? <PhotoCard src="img/v3/ch09/webster.jpg" x={510} y={300} w={330} h={430} rot={2} at={t.at('Webster') - 1} /> : null}
      <Note text="Clay" x={200} y={750} size={48} rot={-2} at={t.at('Clay')} color="#ffffff" />
      {web && <Note text="Webster" x={580} y={770} size={48} rot={-2} at={t.at('Webster')} color="#ffffff" />}
      {g >= t.at('renew') && <Highlight text="RENEW THE CHARTER" x={960} y={300} size={70} at={t.at('renew')} seed={911} rot={-3} />}
      <Definition term="char·ter" def="the government's permission for the Bank to exist" at={t.at('charter')} x={960} y={440} w={820} />
      <Note text="an election year..." x={980} y={640} size={52} rot={-3} at={t.at('election')} />
      <Note text="he wouldn't dare veto it" x={1000} y={730} size={58} rot={-3} at={t.at('dare')} color={usePal().subject} />
    </AbsoluteFill>
  );
};

const KillIt: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard mask={MASKS.sully} src="img/jackson_sully_1845.jpg" size={[1920, 2288]} x={130} y={200} w={430} h={580} fx={960} fy={1000} scale={0.38} rot={-2} at={1} />
      <Note text="Jackson to Van Buren:" x={660} y={140} size={52} rot={-3} at={t.at('told')} color="#ffffff" />
      <Quote text="The Bank is trying to kill me, but I will kill it!" at={t.at('trying')} x={660} y={250} w={1150} size={70} />
      {g >= t.at('vetoed') && <Stamp text="VETO" x={1250} y={560} at={t.at('vetoed')} size={170} color={pal.subject} rot={-10} />}
      <Quote text="make the rich richer and the potent more powerful." at={t.at('rich')} x={660} y={770} w={1150} size={48} who="Bank Veto Message, July 1832" />
    </AbsoluteFill>
  );
};

/** Pet banks: money hops from the Bank to state banks run by allies. */
const PetBanks: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const a = t.at('pulled');
  const box = (x: number, y: number, w: number, h: number, label: string, at: number, big?: boolean) => g >= at ? (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: '#efe6d2', boxShadow: '0 14px 26px rgba(0,0,0,0.55)', border: `4px solid ${INK}`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: -2, height: h * 0.28, background: INK, clipPath: 'polygon(50% 0, 100% 100%, 0 100%)', transform: `translateY(-${h * 0.26}px)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: h * 0.3, textAlign: 'center', fontFamily: big ? JF.display : JF.mono, fontSize: big ? 44 : 22, letterSpacing: big ? 0 : 2, color: INK}}>{label}</div>
    </div>
  ) : null;
  return (
    <AbsoluteFill>
      <DarkPaper />
      <Note text="voters backed him: crushed Clay in 1832" x={100} y={60} size={52} rot={-3} at={t.at('Voters')} color="#ffffff" />
      {box(120, 360, 460, 380, 'THE BANK', 1, true)}
      {[0, 1, 2, 3].map((i) => box(1100 + (i % 2) * 380, 420 + Math.floor(i / 2) * 320, 300, 230, 'STATE BANK', a + 6 + i * 3))}
      {Array.from({length: 12}).map((_, i) => {
        const at = a + 8 + i * 2;
        if (g < at) return null;
        const p = interpolate(g, [at, at + 10], [0, 1], clamp);
        const tx = 1250 + ((i % 4) % 2) * 380;
        const ty = 560 + Math.floor((i % 4) / 2) * 320;
        const x = 350 + (tx - 350) * p;
        const y = 550 + (ty - 550) * p - Math.sin(p * Math.PI) * 220;
        return <div key={i} style={{position: 'absolute', left: x - 26, top: y - 26, width: 52, height: 52, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #fff4c2, #d9a520 60%, #8a6410)', border: '3px solid #2a2a2a'}} />;
      })}
      {g >= t.at('pet') && <Highlight text="“PET BANKS”" x={1180} y={150} size={80} at={t.at('pet')} seed={913} rot={-3} />}
      <Note text="run by his allies" x={1240} y={280} size={46} rot={-3} at={t.at('allies')} />
      <Note text="Treasury Secretary said no → fired" x={100} y={850} size={54} rot={-3} at={t.at('fired')} color={pal.subject} />
    </AbsoluteFill>
  );
};

const Squeeze: React.FC<{t: TL}> = ({t}) => {
  const frame = useCurrentFrame();
  const gen = hasFile('img/gen/v3_ch09_squeeze.png');
  const a = t.at('Biddle hit');
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      {gen ? <Picture src="img/gen/v3_ch09_squeeze.png" place={fill(GEN, 600, 448, interpolate(frame, [a, a + 300], [1.02, 1.1], clamp))} size={GEN} bw="grayscale(1) contrast(1.2) brightness(0.7)" />
        : <Picture src="img/v3/ch09/downfall_mother_bank.jpg" place={fill([3000, 2194], 1500, 1100, interpolate(frame, [a, a + 300], [1.02, 1.1], clamp))} size={[3000, 2194]} bw="grayscale(1) contrast(1.2) brightness(0.75)" />}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)'}} />
      <Note text="Biddle hit back:" x={100} y={80} size={60} rot={-3} at={a} />
      <Note text="made loans harder to get, on purpose" x={110} y={180} size={52} rot={-3} at={t.at('loans')} color="#ffffff" />
      <Note text="a squeeze on the economy..." x={110} y={270} size={52} rot={-3} at={t.at('squeeze')} color="#ffffff" />
      <Note text="...a lot of people blamed Biddle instead" x={500} y={900} size={58} rot={-3} at={t.at('blamed')} color={usePal().subject} />
      <Tag text={gen ? 'Illustration · a Philadelphia bank, 1834' : 'Edward W. Clay, The Downfall of Mother Bank, 1833 · Library of Congress'} />
    </AbsoluteFill>
  );
};

const Censure: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  return (
    <AbsoluteFill>
      <DarkPaper />
      {g >= t.at('But in') && <Highlight text="1834" x={100} y={70} size={100} at={t.at('But in')} seed={915} rot={-2} />}
      <Note text="the Senate did something it had never done before" x={420} y={100} size={46} rot={-3} at={t.at('Senate')} color="#ffffff" />
      {g >= t.at('censured') && <Stamp text="CENSURED" x={200} y={250} at={t.at('censured')} size={190} color={pal.subject} rot={-6} />}
      <Definition term="cen·sure" def="a formal statement condemning someone, here for abusing his power" at={t.at('formally')} x={200} y={500} w={1100} />
      <Quote text="the direct representative of the American people." at={t.at('direct')} x={200} y={650} w={1500} size={60} who="Jackson's reply to the Senate, April 1834" />
      <Note text="translation: I'm the people. You're just Congress." x={220} y={900} size={58} rot={-3} at={t.at('Translation')} color={pal.subject} />
    </AbsoluteFill>
  );
};

const Whigs: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const w = t.at('Whigs');
  const x = interpolate(g, [t.at('kings'), t.at('kings') + 6], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <DarkPaper />
      <Note text="his opponents formed a new party..." x={100} y={80} size={54} rot={-3} at={t.at('opponents')} color="#ffffff" />
      {g >= w && <Highlight text="THE WHIGS" x={120} y={220} size={150} at={w} seed={917} rot={-3} />}
      <Note text="named after the British party that fought" x={120} y={500} size={52} rot={-3} at={t.at('British')} />
      <Note text="to limit the power of kings" x={150} y={590} size={52} rot={-3} at={t.at('limit')} />
      <DrawnCrown x0={1300} x1={1640} y={560} h={150} at={t.at('kings') - 6} color="#f4efe6" />
      {x > 0 && (
        <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
          <line x1={1270} y1={330} x2={1270 + 400 * x} y2={330 + 280 * x} stroke={pal.subject} strokeWidth={16} strokeLinecap="round" />
          <line x1={1670} y1={330} x2={1670 - 400 * x} y2={330 + 280 * x} stroke={pal.subject} strokeWidth={16} strokeLinecap="round" />
        </svg>
      )}
      <Note text="Subtle." x={1360} y={760} size={90} rot={-4} at={t.at('Subtle')} color={pal.subject} />
    </AbsoluteFill>
  );
};

const Cartoon: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard mask={MASKS.king_andrew} src="img/v3/ch01/king_andrew_1833.jpg" size={[1017, 1536]} x={420} y={40} w={600} h={1000} fx={508} fy={768} scale={0.65} rot={-1.5} at={t.at("that's") - 1} />
      <Note text="and that's when" x={80} y={150} size={50} rot={-3} at={t.at('cartoon')} color="#ffffff" />
      <Note text="the cartoon shows up" x={100} y={240} size={50} rot={-3} at={t.at("cartoon")} color="#ffffff" />
      {g >= t.at('King') && <Highlight text="KING ANDREW" x={1120} y={380} size={84} at={t.at('King')} seed={919} rot={-3} />}
      {g >= t.at('First') && <Highlight text="THE FIRST" x={1160} y={520} size={84} at={t.at('First')} seed={921} rot={-2} />}
      <Tag text="King Andrew the First, c. 1833 · Library of Congress" />
    </AbsoluteFill>
  );
};

const Body: React.FC = () => {
  const t = makeTimeline(N, 30);
  const at = t.at;
  const cuts: [number, React.ReactNode][] = [
    [0, <Bank t={t} />],
    [at('Jackson called') - 1, <Monster t={t} />],
    [at('Which') - 1, <Twenty t={t} />],
    [at('In 1832') - 1, <Recharter t={t} />],
    [at('Jackson told') - 1, <KillIt t={t} />],
    [at('Voters') - 1, <PetBanks t={t} />],
    [at('Biddle hit') - 1, <Squeeze t={t} />],
    [at('But in') - 1, <Censure t={t} />],
    [at('His opponents') - 1, <Whigs t={t} />],
    [at("And that's") - 1, <Cartoon t={t} />],
  ];
  const scene = useScene(cuts);
  return (
    <>
      {scene}
      {cuts.slice(1).map(([f], i) => <Sfx key={i} at={f} src="sfx/whoosh.wav" volume={0.28} />)}
      {['Bank', 'Nicholas', 'monster', 'hard money', 'In 1832', 'renew', 'vetoed', 'pet', 'But in', 'censured', 'Whigs', 'King', 'First'].map((c) => <Sfx key={c} at={at(c)} src="sfx/stamp.wav" volume={0.28} />)}
      {Array.from({length: 12}).map((_, i) => <Sfx key={`m${i}`} at={at('pulled') + 8 + i * 2} src="sfx/tick.wav" volume={0.2} />)}
      {['Second', 'held', 'easier', 'privately', 'nobody', 'personal', 'IOUs', 'funny', 'twenty-dollar', 'four', 'election', 'dare', 'told', 'Voters', 'allies', 'fired', 'loans', 'squeeze', 'blamed', 'Senate', 'Translation', 'opponents', 'British', 'limit', 'Subtle', 'cartoon'].map((c) => (
        <Sfx key={c} at={at(c) - 2} src={WRITE.src} volume={WRITE.volume} />
      ))}
    </>
  );
};

export const Ch09: React.FC = () => (
  <ChapterShell n={N} audio="audio/v3_ch09_the_monster.wav" lead={LEAD} music={[{src: 'music/v3/r_nativism.mp3', volume: 0.12, startFrom: 1650}]}>
    <Body />
  </ChapterShell>
);
