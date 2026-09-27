// Chapter 11 · Same Man, Two Crowns (the answer)
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, random, Sequence, staticFile} from 'remotion';
import words from '../../../public/audio/v3_ch11_king_andrew.words.json';
import {clamp} from '../../lib/anim';
import {Highlight, JF, Loop, Note, Picture, Tag, Tint, useGFrame, usePal} from '../Kit';
import {DarkPaper, Sfx, WRITE} from '../common';
import {Person, Stool} from '../figures';
import {ChapterShell, chapterFrames, CropCard, DrawnCrown, fill, LEAD, makeTimeline, type Narration, Stamp, type TL, useScene} from '../shell';
import {MASKS} from '../masks';

const N = words as Narration;
export const CH11_FRAMES = chapterFrames(N, LEAD);
const SULLY: [number, number] = [1920, 2288];

const Back: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard mask={MASKS.sully} src="img/jackson_sully_1845.jpg" size={SULLY} x={140} y={300} w={560} h={700} fx={930} fy={1050} scale={0.55} rot={-2} at={1}>
        {(S) => {
          const [x0, y] = S(520, 330);
          const [x1] = S(1340, 330);
          return <DrawnCrown x0={x0} x1={x1} y={y} h={150} at={t.at('king') - 4} dur={12} />;
        }}
      </CropCard>
      <Note text="so, back to the question:" x={860} y={160} size={60} rot={-3} at={1} />
      {g >= t.at("People's") && <Highlight text="THE PEOPLE'S PRESIDENT" x={860} y={320} size={70} at={t.at("People's")} seed={1101} rot={-2} />}
      <Note text="...called a" x={900} y={480} size={62} rot={-3} at={t.at('called')} color="#ffffff" />
      {g >= t.at('king') && <Highlight text="KING?" x={1240} y={460} size={130} at={t.at('king')} seed={1103} rot={-3} />}
    </AbsoluteFill>
  );
};

const VetoStamp: React.FC<{x: number; y: number; at: number; seed: number}> = ({x, y, at, seed}) => {
  const g = useGFrame();
  const pal = usePal();
  if (g < at) return null;
  const k = interpolate(g, [at, at + 3, at + 6], [1.6, 0.9, 1], clamp);
  return <div style={{position: 'absolute', left: x, top: y, padding: '4px 10px', border: `4px solid ${pal.subject}`, color: pal.subject, fontFamily: JF.display, fontSize: 30,
    transform: `scale(${k}) rotate(${(random(`v${seed}`) - 0.5) * 16}deg)`}}>VETO</div>;
};

const Vetoes: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const j = t.at('twelve');
  const p = t.at('ten');
  return (
    <AbsoluteFill>
      <DarkPaper />
      <Note text="look at the vetoes" x={100} y={60} size={60} rot={-3} at={t.at('vetoes')} />
      <div style={{position: 'absolute', left: 110, top: 200, fontFamily: JF.mono, fontSize: 28, letterSpacing: 3, color: '#f4efe6', opacity: g >= j ? 1 : 0}}>JACKSON</div>
      {Array.from({length: 12}).map((_, i) => <VetoStamp key={i} x={110 + i * 128} y={250} at={j + i} seed={i} />)}
      {g >= j + 12 && <Stamp text="12" x={1690} y={220} at={j + 12} size={110} color={pal.subject} />}
      <div style={{position: 'absolute', left: 110, top: 380, fontFamily: JF.mono, fontSize: 28, letterSpacing: 3, color: '#f4efe6', opacity: g >= p ? 1 : 0}}>ALL SIX PRESIDENTS BEFORE HIM, COMBINED</div>
      {Array.from({length: 10}).map((_, i) => <VetoStamp key={i} x={110 + i * 128} y={430} at={p + i} seed={50 + i} />)}
      {g >= p + 10 && <Stamp text="10" x={1690} y={400} at={p + 10} size={110} color="#f4efe6" />}
      <Note text="they mostly vetoed laws that broke the Constitution" x={110} y={600} size={44} rot={-2} at={t.at('broke')} color="#ffffff" />
      <Note text="Jackson: laws he thought were bad ideas" x={110} y={690} size={50} rot={-2} at={t.at('bad')} />
      <Stool x={1620} y={640} show={[0, 0, 0]} knock={[-99, -99, t.at('road')]} scale={0.45} />
      <Note text="a road that ran through Clay's Kentucky" x={110} y={790} size={46} rot={-2} at={t.at('road')} color="#ffffff" />
      {g >= t.at('Andy') && <Highlight text="“ANDY VETO”" x={110} y={890} size={90} at={t.at('Andy')} seed={1105} rot={-3} />}
    </AbsoluteFill>
  );
};

const Opposite: React.FC<{t: TL}> = ({t}) => {
  const pal = usePal();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard mask={MASKS.sully} src="img/jackson_sully_1845.jpg" size={SULLY} x={140} y={170} w={500} h={660} fx={960} fy={1000} scale={0.48} rot={-2} at={1} />
      <Note text="but Jackson thought he was" x={740} y={100} size={48} rot={-3} at={t.at('never')} color="#ffffff" />
      <Note text="doing the opposite" x={760} y={180} size={48} rot={-3} at={t.at('opposite')} color="#ffffff" />
      <Note text="the one official chosen by the whole country" x={760} y={270} size={44} rot={-3} at={t.at('chosen')} />
      <Note text="✓ overruled Congress" x={800} y={360} size={56} rot={-2} at={t.at('overruled')} color="#ffffff" />
      <Note text="✓ destroyed the Bank" x={800} y={450} size={56} rot={-2} at={t.at('destroyed')} color="#ffffff" />
      <Note text="✓ shrugged at the Court" x={800} y={540} size={56} rot={-2} at={t.at('shrugged')} color="#ffffff" />
      <Note text="= protecting the people from the insiders" x={760} y={690} size={52} rot={-3} at={t.at('protecting')} color={pal.mark} />
      <Tag text="Thomas Sully, Andrew Jackson, 1845 · National Gallery of Art" />
    </AbsoluteFill>
  );
};

/** The subject tint (as Kit's Tint) limited to the left or right half of the screen. The clip sits on the
 *  blended layer itself, so the colour still blends with the picture underneath. */
const HalfTint: React.FC<{place: {left: number; top: number; scale: number}; color: string; side: 'left' | 'right'}> = ({place, color, side}) => {
  const w = SULLY[0] * place.scale;
  const mid = 960 - place.left;
  const m: React.CSSProperties = {
    position: 'absolute', left: place.left, top: place.top, width: w, height: SULLY[1] * place.scale,
    WebkitMaskImage: `url(${staticFile(MASKS.sully.alpha)})`, WebkitMaskSize: '100% 100%', maskImage: `url(${staticFile(MASKS.sully.alpha)})`, maskSize: '100% 100%',
    clipPath: side === 'left' ? `inset(0 ${w - mid}px 0 0)` : `inset(0 0 0 ${mid}px)`,
  } as React.CSSProperties;
  return (
    <>
      <div style={{...m, background: color, mixBlendMode: 'color'}} />
      <div style={{...m, background: color, mixBlendMode: 'multiply', opacity: 0.3}} />
      <div style={{...m, background: color, mixBlendMode: 'screen', opacity: 0.28}} />
    </>
  );
};

/** One portrait, two labels. */
const Split: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const place = fill(SULLY, 960, 900, 1.05);
  const S = (x: number, y: number) => [place.left + x * place.scale, place.top + y * place.scale];
  const [x0, y] = S(470, 560);
  const [x1] = S(1380, 560);
  const mid = t.at('same');
  const reveal = interpolate(g, [mid, mid + 8], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#111', overflow: 'hidden'}}>
      <Picture src="img/jackson_sully_1845.jpg" place={place} size={SULLY} bw="grayscale(1) contrast(1.2) brightness(0.8)" />
      {g >= t.at("People's", 2) && <HalfTint place={place} color={pal.mark} side="left" />}
      {g >= t.at('King Andrew') && <HalfTint place={place} color={pal.subject} side="right" />}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.75) 100%)'}} />
      <div style={{position: 'absolute', left: 958, top: 0, width: 5, height: 1080 * reveal, background: '#f4efe6'}} />
      <AbsoluteFill style={{clipPath: 'inset(0 0 0 50%)'}}>
        <DrawnCrown x0={x0} x1={x1} y={y} h={140} at={t.at('King Andrew') - 2} dur={12} width={9} color={pal.subject} />
      </AbsoluteFill>
      {g >= t.at("People's", 2) && <Highlight text="THE PEOPLE'S PRESIDENT" x={40} y={880} size={62} at={t.at("People's", 2)} seed={1107} rot={-2} />}
      {g >= t.at('King Andrew') && <Highlight text="KING ANDREW" x={1160} y={880} size={80} at={t.at('King Andrew')} seed={1109} rot={-2} />}
      <Note text="same man, same things" x={640} y={60} size={60} rot={-3} at={mid} color="#ffffff" />
      <Note text="it depended on where you stood" x={560} y={160} size={52} rot={-3} at={t.at('depended')} />
      <Note text="agree: the people are finally winning" x={40} y={770} size={42} rot={-3} at={t.at('agreed')} color={pal.mark} />
      <Note text="disagree: one man decided he WAS the people" x={990} y={770} size={40} rot={-3} at={t.at("didn't")} color={pal.subject} />
      <Tag text="Thomas Sully, Andrew Jackson, 1845 · National Gallery of Art" />
    </AbsoluteFill>
  );
};

const LeftOut: React.FC<{t: TL}> = ({t}) => (
  <AbsoluteFill>
    <DarkPaper />
    <Note text="and remember who “the people” didn't include:" x={100} y={100} size={56} rot={-3} at={t.at('remember')} />
    {[0, 1].map((i) => <Person key={`n${i}`} x={300 + i * 90} y={700} h={220} at={t.at('Native') + i} dashed hat={false} />)}
    <Note text="Native nations" x={230} y={740} size={46} rot={-2} at={t.at('Native')} color="#ffffff" />
    {[0, 1].map((i) => <Person key={`e${i}`} x={880 + i * 90} y={700} h={220} at={t.at('enslaved') + i} dashed hat={false} />)}
    <Note text="enslaved people" x={800} y={740} size={46} rot={-2} at={t.at('enslaved')} color="#ffffff" />
    {[0, 1].map((i) => <Person key={`w${i}`} x={1460 + i * 90} y={700} h={210} at={t.at('women') + i} dashed dress />)}
    <Note text="women" x={1450} y={740} size={46} rot={-2} at={t.at('women')} color="#ffffff" />
    <Note text="never got a share of that power" x={500} y={900} size={58} rot={-3} at={t.at('share')} />
  </AbsoluteFill>
);

const Kid: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard mask={MASKS.brave_boy} src="img/v3/ch02/brave_boy_waxhaws.jpg" size={[3000, 2303]} x={120} y={170} w={700} h={620} fx={1500} fy={1050} scale={0.5} rot={-2} at={1}>
        {(S) => {
          const [bx, by] = S(1740, 1150);
          return <Loop cx={bx} cy={by} rx={100} ry={260} at={t.at('kid') - 2} dur={8} width={6} seed={1111} />;
        }}
      </CropCard>
      <CropCard mask={MASKS.king_andrew} src="img/v3/ch01/king_andrew_1833.jpg" size={[1017, 1536]} x={1180} y={140} w={560} h={800} fx={508} fy={700} scale={0.55} rot={2} at={t.at('nickname') - 1} />
      <Note text="remember that kid?" x={140} y={860} size={62} rot={-3} at={t.at('Remember', 2)} color={pal.subject} />
      <Note text="spent his life fighting anyone who acted like a king" x={120} y={60} size={44} rot={-2} at={t.at('fighting')} color="#ffffff" />
      {g >= t.at('King Andrew', 2) && <Highlight text="KING ANDREW" x={1100} y={900} size={80} at={t.at('King Andrew', 2)} seed={1113} rot={-3} />}
    </AbsoluteFill>
  );
};

const Question: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  return (
    <AbsoluteFill>
      <DarkPaper />
      {g >= t.at('champion') && <Highlight text="A CHAMPION OF DEMOCRACY?" x={160} y={260} size={86} at={t.at('champion')} seed={1115} rot={-2} />}
      <Note text="or" x={880} y={440} size={70} rot={-3} at={t.at('or', 2)} color="#ffffff" />
      {g >= t.at('danger') && <Highlight text="A DANGER TO IT?" x={560} y={560} size={96} at={t.at('danger')} seed={1117} rot={-3} />}
      <Note text="historians are still arguing." x={560} y={800} size={60} rot={-3} at={t.at('Historians')} color={pal.mark} />
    </AbsoluteFill>
  );
};

const EverSince: React.FC<{t: TL}> = ({t}) => {
  const pal = usePal();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard mask={MASKS.king_andrew} tint={null} src="img/v3/ch01/king_andrew_1833.jpg" size={[1017, 1536]} x={1380} y={120} w={460} h={820} fx={530} fy={500} scale={1.0} rot={2} at={1} bw="grayscale(1) contrast(1.2) brightness(0.7)" />
      <Note text="ever since Jackson," x={120} y={260} size={62} rot={-3} at={t.at('ever')} color="#ffffff" />
      <Note text="presidents have claimed to speak for the people" x={140} y={360} size={46} rot={-3} at={t.at('claimed')} />
      <Note text="and ever since Jackson," x={120} y={560} size={62} rot={-3} at={t.at('ever', 2)} color="#ffffff" />
      <Note text="their opponents have had a word ready for that." x={140} y={660} size={46} rot={-3} at={t.at('opponents')} color={pal.subject} />
      <Tag text="King Andrew the First, c. 1833 · Library of Congress" />
    </AbsoluteFill>
  );
};

/** The last word, on black. */
const Last: React.FC<{at: number}> = ({at}) => {
  const g = useGFrame();
  const k = interpolate(g, [at, at + 3, at + 6], [1.3, 0.96, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: JF.display, fontSize: 220, color: '#f4efe6', transform: `scale(${k})`}}>KING.</div>
    </AbsoluteFill>
  );
};

const Body: React.FC = () => {
  const t = makeTimeline(N, 30);
  const at = t.at;
  const last = t.wordAt(N.words.length - 1);
  const cuts: [number, React.ReactNode][] = [
    [0, <Back t={t} />],
    [at('Look') - 1, <Vetoes t={t} />],
    [at('But Jackson') - 1, <Opposite t={t} />],
    [at("And that's") - 1, <Split t={t} />],
    [at('And remember') - 1, <LeftOut t={t} />],
    [at('Remember that') - 1, <Kid t={t} />],
    [at('So was') - 1, <Question t={t} />],
    [at('But ever') - 1, <EverSince t={t} />],
    [last - 1, <Last at={last} />],
  ];
  const scene = useScene(cuts);
  const end = Math.ceil(N.duration * 30);
  const m = end - 61 * 30 + 20;
  return (
    <>
      {scene}
      <Sequence from={m} layout="none">
        <Audio src={staticFile('music/v3/r_ending.mp3')} volume={(f) => interpolate(f, [0, 40, end - m, end - m + 30], [0, 0.15, 0.15, 0], clamp)} />
      </Sequence>
      {cuts.slice(1, -1).map(([f], i) => <Sfx key={i} at={f} src="sfx/whoosh.wav" volume={0.26} />)}
      {Array.from({length: 12}).map((_, i) => <Sfx key={`j${i}`} at={at('twelve') + i} src="sfx/stamp.wav" volume={0.12} />)}
      {Array.from({length: 10}).map((_, i) => <Sfx key={`p${i}`} at={at('ten') + i} src="sfx/stamp.wav" volume={0.12} />)}
      {["People's", 'king', 'Andy', 'champion', 'danger'].map((c) => <Sfx key={c} at={at(c)} src="sfx/stamp.wav" volume={0.26} />)}
      <Sfx at={last} src="sfx/boom.wav" volume={0.35} />
      {['vetoes', 'broke', 'bad', 'road', 'never', 'chosen', 'overruled', 'destroyed', 'shrugged', 'protecting', 'same', 'depended', 'agreed', 'remember', 'Native', 'share', 'fighting', 'Historians', 'claimed', 'opponents'].map((c) => (
        <Sfx key={c} at={at(c) - 2} src={WRITE.src} volume={WRITE.volume} />
      ))}
    </>
  );
};

export const Ch11: React.FC = () => (
  <ChapterShell n={N} audio="audio/v3_ch11_king_andrew.wav" lead={LEAD}>
    <Body />
  </ChapterShell>
);
