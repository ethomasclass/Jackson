// Chapter 5 · King Mob (expanding suffrage, the 1828 campaign, Rachel, the inauguration)
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile} from 'remotion';
import words from '../../../public/audio/v3_ch05_the_people.words.json';
import {clamp} from '../../lib/anim';
import {Highlight, INK, JF, Loop, Note, Picture, Tag, useGFrame, usePal} from '../Kit';
import {DarkPaper, Sfx, WRITE} from '../common';
import {Coffin, Person} from '../figures';
import {PLACES} from '../map';
import {Tiles} from '../tiles';
import {chapterFrames, ChapterShell, CropCard, Definition, fill, hasFile, LEAD, makeTimeline, type Narration, Photo, Quote, Stamp, type TL, useScene} from '../shell';
import {MASKS} from '../masks';

const N = words as Narration;
export const CH05_FRAMES = chapterFrames(N, LEAD);
const TEAL = '#2FE0C4';
const CORAL = '#FF6F61';
const ORANGE = '#FF9F1C';
const MAPSIZE: [number, number] = [4986, 4608];
const GEN: [number, number] = [1200, 896];

const People: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  return (
    <AbsoluteFill>
      <DarkPaper />
      {g >= 1 && <Highlight text="“THE PEOPLE”" x={560} y={380} size={150} at={1} seed={501} rot={-3} />}
      <Note text="...were about to get a lot bigger" x={640} y={640} size={64} rot={-3} at={t.at('bigger')} />
    </AbsoluteFill>
  );
};

/** Beat 1: the property gate opens. */
const Gate: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const open = t.at('dropped');
  const move = interpolate(g, [open + 4, open + 30], [0, 1], clamp);
  const cross = interpolate(g, [open, open + 6], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <DarkPaper />
      <Note text="early 1800s: most states" x={90} y={70} size={52} rot={-3} at={1} />
      <Note text="white men who owned property" x={110} y={160} size={52} rot={-3} at={t.at('owned')} color="#ffffff" />
      {/* the gate */}
      <div style={{position: 'absolute', left: 700, top: 360, width: 16, height: 520, background: '#f4efe6'}} />
      <div style={{position: 'absolute', left: 520, top: 300, padding: '10px 22px', background: '#efe6d2', fontFamily: JF.display, fontSize: 40, color: INK, transform: 'rotate(-3deg)', boxShadow: '0 10px 18px rgba(0,0,0,0.5)'}}>
        PROPERTY REQUIRED
        <div style={{position: 'absolute', left: -10, top: 30, height: 8, width: 440 * cross, background: pal.subject, transform: 'rotate(-4deg)'}} />
      </div>
      {Array.from({length: 11}).map((_, i) => {
        const owner = i % 5 === 0;
        const x0 = 140 + i * 50;
        const x = owner ? 820 + (i / 5) * 130 : x0 + move * 760;
        return <Person key={i} x={x} y={900} h={owner ? 200 : 190} at={2 + i} color={owner || move > 0 ? '#f4efe6' : 'rgba(244,239,230,0.45)'} />;
      })}
      {/* map inset: Indiana and Illinois */}
      <CropCard src="img/v3/maps/mitchell_1836.jpg" size={MAPSIZE} x={1400} y={170} w={420} h={380} fx={1840} fy={2030} scale={0.9} rot={2} at={t.at('Indiana') - 2}>
        {(S) => {
          const [ix, iy] = S(PLACES.indiana[0], PLACES.indiana[1]);
          const [lx, ly] = S(PLACES.illinois[0], PLACES.illinois[1]);
          return (
            <>
              <Loop cx={ix} cy={iy} rx={60} ry={110} at={t.at('Indiana')} dur={8} width={6} seed={503} />
              <Loop cx={lx} cy={ly} rx={60} ry={120} at={t.at('Illinois')} dur={8} width={6} seed={505} />
            </>
          );
        }}
      </CropCard>
      <Note text="new western states: any white man" x={1180} y={600} size={44} rot={-3} at={t.at('any')} />
      {g >= t.at('suffrage') && <Highlight text="EXPANDING SUFFRAGE" x={100} y={930} size={70} at={t.at('suffrage')} seed={507} rot={-2} />}
      <Definition term="suf·frage" def="the right to vote" at={t.at('right')} x={880} y={950} w={700} />
    </AbsoluteFill>
  );
};

/** Beat 2: who picks the electors. */
const LEG = ['DE', 'GA', 'LA', 'NY', 'SC', 'VT'];
const Electors: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const flip = t.at('By 1828', 2);
  return (
    <AbsoluteFill>
      <DarkPaper />
      <Note text="who picks each state's electors?" x={90} y={70} size={52} rot={-3} at={t.at('what')} />
      <Tiles x={-190} y={200} size={92} gap={10} appear={0} state={(c) => {
        const leg = LEG.includes(c);
        const stays = c === 'DE' || c === 'SC';
        if (!leg) return {fill: 'rgba(47,224,196,0.55)', label: 'PEOPLE', at: -999};
        if (g < flip || stays) return {fill: ORANGE, label: 'LEGISLATURE', at: t.at('legislatures')};
        return {fill: TEAL, label: 'PEOPLE', at: flip + LEG.indexOf(c) * 4};
      }} />
      {g >= t.at('In 1824') && <Stamp text="1824: 6" x={1100} y={260} at={t.at('In 1824')} size={120} color={ORANGE} />}
      <Note text="state legislatures picked" x={1110} y={400} size={48} rot={-3} at={t.at('legislatures')} color="#ffffff" />
      {g >= flip && <Stamp text="1828: 2" x={1100} y={540} at={flip} size={120} color={ORANGE} />}
      <Note text="almost everywhere else:" x={1110} y={720} size={48} rot={-3} at={t.at('Almost')} color="#ffffff" />
      {g >= t.at('chose') && <Highlight text="THE PEOPLE CHOSE" x={1110} y={800} size={70} at={t.at('chose')} seed={509} rot={-2} />}
    </AbsoluteFill>
  );
};

/** Beat 3: the new voters. */
const Voters: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const gen = hasFile('img/gen/v3_ch05_new_voters.png');
  const labels: [string, string, number][] = [['small farmers', 'farmers', 200], ['frontier settlers', 'Frontier', 720], ['city workers', 'Workers', 1380]];
  return (
    <AbsoluteFill style={{background: INK}}>
      {gen ? <Picture src="img/gen/v3_ch05_new_voters.png" place={fill(GEN, 600, 448, 1.0)} size={GEN} bw="grayscale(1) contrast(1.2)" />
        : <Picture src="img/county_election_bingham.jpg" place={fill([1920, 1382], 960, 700, 1.05)} size={[1920, 1382]} bw="grayscale(1) contrast(1.2) brightness(0.8)" />}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)'}} />
      <Note text="so who were the new voters?" x={100} y={80} size={56} rot={-3} at={t.at('So who')} />
      {labels.map(([txt, cue, x]) => g >= t.at(cue) ? <Highlight key={txt} text={txt.toUpperCase()} x={x - 100} y={880} size={52} at={t.at(cue)} seed={511 + x} rot={-2} /> : null)}
      <Tag text={gen ? 'Illustration · new voters, 1828' : 'George Caleb Bingham, The County Election, 1852 · Saint Louis Art Museum'} />
    </AbsoluteFill>
  );
};

const OneOfThem: React.FC<{t: TL}> = ({t}) => {
  const pal = usePal();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard mask={MASKS.sully} src="img/jackson_sully_1845.jpg" size={[1920, 2288]} x={140} y={170} w={540} h={720} fx={960} fy={1000} scale={0.5} rot={-2} at={t.at('And here') - 1} />
      <Note text="a candidate who seemed like one of them:" x={760} y={140} size={46} rot={-3} at={t.at('seemed')} />
      <Note text="✓ no college" x={820} y={280} size={60} rot={-2} at={t.at('college')} color="#ffffff" />
      <Note text="✓ no rich family" x={820} y={380} size={60} rot={-2} at={t.at('rich')} color="#ffffff" />
      <Note text="✓ a backwoods orphan" x={820} y={480} size={60} rot={-2} at={t.at('orphan')} color="#ffffff" />
      <Note text="✓ made it on his own" x={820} y={580} size={60} rot={-2} at={t.at('own')} color="#ffffff" />
      <Note text="(at least, that's how his campaign told it)" x={740} y={760} size={44} rot={-3} at={t.at('At least')} color={pal.subject} />
      <Tag text="Thomas Sully, Andrew Jackson, 1845 · National Gallery of Art" />
    </AbsoluteFill>
  );
};

/** Who "the people" left out: drawn as dashed outlines. */
export const LeftOut: React.FC<{t: TL; cue: {women: number; enslaved: number; free: number}; title?: number}> = ({t, cue, title}) => (
  <AbsoluteFill>
    <DarkPaper />
    <Note text="but notice who “the people” means here" x={100} y={80} size={54} rot={-3} at={title ?? 1} />
    {Array.from({length: 5}).map((_, i) => <Person key={i} x={220 + i * 90} y={760} h={220} at={2 + i} />)}
    <Note text="white men" x={260} y={800} size={48} rot={-2} at={4} color="#ffffff" />
    {[0, 1].map((i) => <Person key={`w${i}`} x={760 + i * 90} y={760} h={210} at={cue.women + i} dashed dress />)}
    <Note text="women" x={740} y={800} size={42} rot={-2} at={cue.women} />
    {[0, 1].map((i) => <Person key={`e${i}`} x={1080 + i * 90} y={760} h={220} at={cue.enslaved + i} dashed hat={false} />)}
    <Note text="enslaved people" x={960} y={800} size={42} rot={-2} at={cue.enslaved} />
    {[0, 1].map((i) => <Person key={`f${i}`} x={1470 + i * 90} y={760} h={220} at={cue.free + i} dashed />)}
    <Note text="free Black men" x={1380} y={800} size={42} rot={-2} at={cue.free} />
    <Note text="(in most states)" x={1410} y={870} size={38} rot={-2} at={cue.free + 4} color="#ffffff" />
  </AbsoluteFill>
);

const Party: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard src="img/van_buren_inman.jpg" size={[1920, 2313]} x={150} y={170} w={500} h={660} fx={960} fy={950} scale={0.45} rot={-2} at={t.at("Jackson's supporters") - 1} />
      {g >= t.at('Van') && <Highlight text="MARTIN VAN BUREN" x={740} y={140} size={76} at={t.at('Van')} seed={515} rot={-2} />}
      <Note text="a sharp New York politician" x={760} y={270} size={50} rot={-3} at={t.at('sharp')} color="#ffffff" />
      {g >= t.at('Democratic') && <Highlight text="THE DEMOCRATIC PARTY" x={740} y={420} size={80} at={t.at('Democratic')} seed={517} rot={-2} />}
      <Note text="same name as today's Democrats..." x={760} y={570} size={50} rot={-3} at={t.at('Same')} color="#ffffff" />
      <Note text="...a very different party," x={780} y={660} size={50} rot={-3} at={t.at('different')} color={pal.subject} />
      <Note text="with very different ideas" x={800} y={750} size={50} rot={-3} at={t.at('different', 2)} color={pal.subject} />
      <Tag text="Henry Inman, Martin Van Buren, c. 1835 · Wikimedia Commons" />
    </AbsoluteFill>
  );
};

const Mud: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const c0 = t.at('coffins');
  return (
    <AbsoluteFill>
      <DarkPaper />
      {g >= t.at('The 1828') && <Highlight text="1828: THE REMATCH" x={90} y={70} size={80} at={t.at('The 1828')} seed={519} rot={-2} />}
      {g >= t.at('mudslinging') && <Highlight text="MUDSLINGING" x={90} y={210} size={80} at={t.at('mudslinging')} seed={521} rot={-2} />}
      <Definition term="mud·sling·ing" def="attacking the person instead of debating the issues" at={t.at('attacking')} x={90} y={360} w={760} />
      <CropCard src="img/coffin_handbill_1828.jpg" size={[1920, 2527]} x={1060} y={70} w={700} h={920} fx={960} fy={1100} scale={0.42} rot={2} at={t.at('Coffin') - 1} />
      {Array.from({length: 6}).map((_, i) => <Coffin key={i} x={110 + i * 150} y={640} w={100} at={c0 + i * 3} rot={(i % 2 ? 3 : -3)} />)}
      <Note text="one for each militiaman executed for desertion" x={100} y={920} size={44} rot={-2} at={t.at('militiaman')} color="#ffffff" />
      <Tag text="The “Coffin Handbill,” John Binns, 1828 · Library of Congress" />
    </AbsoluteFill>
  );
};

const Bigamist: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard mask={MASKS.rachel} src="img/rachel_earl.jpg" size={[1920, 2286]} x={180} y={150} w={520} h={700} fx={960} fy={1000} scale={0.5} rot={-2} at={t.at('And they') - 1} />
      <Note text="that old marriage paperwork..." x={820} y={180} size={54} rot={-3} at={t.at('And they')} color="#ffffff" />
      {g >= t.at('bigamist') && <Highlight text="“BIGAMIST”" x={820} y={330} size={120} at={t.at('bigamist')} seed={523} rot={-4} />}
      <Definition term="big·a·mist" def="someone married to two people at once" at={t.at('married')} x={820} y={560} w={880} />
      <Tag text="Ralph E. W. Earl, Rachel Jackson, c. 1827 · The Hermitage" />
    </AbsoluteFill>
  );
};

const Won: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const a = t.at('three');
  const p = interpolate(g, [a, a + 14], [0, 1], clamp);
  const s = t.at('56');
  return (
    <AbsoluteFill>
      <DarkPaper />
      {g >= t.at('Jackson won') && <Highlight text="JACKSON WINS" x={90} y={70} size={90} at={t.at('Jackson won')} seed={525} rot={-2} />}
      <div style={{position: 'absolute', left: 120, top: 260, fontFamily: JF.mono, fontSize: 28, letterSpacing: 3, color: '#f4efe6'}}>VOTES CAST FOR PRESIDENT</div>
      {[['1824', 365, 1], ['1828', 1150, p]].map(([yr, v, k], i) => (
        <React.Fragment key={yr as string}>
          <div style={{position: 'absolute', left: 120, top: 330 + i * 130, fontFamily: JF.display, fontSize: 56, color: '#f4efe6'}}>{yr}</div>
          <div style={{position: 'absolute', left: 300, top: 330 + i * 130, height: 80, width: (v as number) * 0.9 * (k as number), background: i ? TEAL : 'rgba(244,239,230,0.6)'}} />
          <div style={{position: 'absolute', left: 320 + (v as number) * 0.9 * (k as number), top: 340 + i * 130, fontFamily: JF.mono, fontSize: 30, color: '#f4efe6'}}>{i ? '~1.15 million' : '~365,000'}</div>
        </React.Fragment>
      ))}
      {g >= a + 10 && <Stamp text="×3" x={1500} y={300} at={a + 10} size={170} color={TEAL} />}
      {Array.from({length: 25}).map((_, i) => <Person key={i} x={170 + i * 62} y={900} h={130} at={s - 12 + Math.floor(i / 3)} color={g >= s && i < 14 ? CORAL : '#f4efe6'} />)}
      {g >= s && <Highlight text="56% → JACKSON" x={1080} y={560} size={80} at={s} seed={527} rot={-3} />}
    </AbsoluteFill>
  );
};

const Grief: React.FC<{t: TL}> = ({t}) => {
  const pal = usePal();
  return (
    <Photo mask={MASKS.rachel} tint={null} src="img/rachel_earl.jpg" size={[1920, 2286]} fx={960} fy={900} a={t.at('But weeks')} b={t.at('On inauguration')} z0={1.0} z1={1.08} bw="grayscale(1) contrast(1.15) brightness(0.8)" vignette={0.85}>
      {() => (
        <>
          <Note text="December 1828: Rachel dies" x={100} y={90} size={56} rot={-3} at={t.at('Rachel', 2)} color="#ffffff" />
          <Note text="Jackson was sure the attacks killed her" x={100} y={190} size={48} rot={-3} at={t.at('sure')} />
          <Quote text="May God Almighty forgive her murderers, as I know she forgave them. I never can." at={t.at('May')} x={100} y={560} w={1500} size={58} who="Andrew Jackson, at Rachel's funeral (reported)" />
          <Note text="hold onto that. it's about to cause a scandal." x={500} y={920} size={50} rot={-2} at={t.at('Hold onto', 2)} color={pal.subject} />
          <Tag text="Ralph E. W. Earl, Rachel Jackson, c. 1827 · The Hermitage" />
        </>
      )}
    </Photo>
  );
};

const Inauguration: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  return (
    <Photo src="img/presidents_levee_1841.jpg" size={[2289, 1413]} fx={1150} fy={700} a={t.at('On inauguration')} b={t.at('Supreme')} z0={1.02} z1={1.15}>
      {() => (
        <>
          {g >= t.at('March') && <Highlight text="MARCH 1829" x={100} y={80} size={96} at={t.at('March')} seed={529} rot={-2} />}
          <Note text="thousands of fans, into the White House" x={110} y={220} size={50} rot={-3} at={t.at('thousands')} />
          <Note text="muddy boots on the furniture" x={110} y={860} size={54} rot={-3} at={t.at('furniture')} color="#ffffff" />
          <Note text="(lured outside with the punch)" x={140} y={950} size={50} rot={-3} at={t.at('punch')} />
          <Tag text="Robert Cruikshank, All Creation Going to the White House, 1841 · Library of Congress" />
        </>
      )}
    </Photo>
  );
};

const KingMob: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard mask={MASKS.story} src="img/v3/ch05/story_joseph.jpg" size={[3840, 4642]} x={150} y={170} w={480} h={640} fx={1920} fy={1900} scale={0.24} rot={-2} at={t.at('Supreme') - 1} />
      <Note text="Justice Joseph Story" x={170} y={860} size={42} rot={-2} at={t.at('Joseph')} color="#ffffff" />
      <Quote text="the reign of KING MOB seemed triumphant." at={t.at('reign')} x={760} y={170} w={1050} size={70} who="Joseph Story, letter, March 1829" />
      {g >= t.at('King Mob', 2) && <Highlight text="KING MOB" x={780} y={530} size={140} at={t.at('King Mob', 2)} seed={531} rot={-3} />}
      <Note text="the first king in this story" x={800} y={740} size={54} rot={-3} at={t.at('first king')} />
      <Note text="Jackson's fans called it: democracy" x={860} y={870} size={54} rot={-3} at={t.at('democracy')} color={pal.mark} />
      <Tag text="Joseph Story, portrait · Library of Congress" />
    </AbsoluteFill>
  );
};

const Body: React.FC = () => {
  const t = makeTimeline(N, 30);
  const at = t.at;
  const cuts: [number, React.ReactNode][] = [
    [0, <People t={t} />],
    [at('In the early') - 1, <Gate t={t} />],
    [at("And it wasn't") - 1, <Electors t={t} />],
    [at('So who') - 1, <Voters t={t} />],
    [at('And here') - 1, <OneOfThem t={t} />],
    [at('But notice') - 1, <LeftOut t={t} cue={{women: at('Women'), enslaved: at('Enslaved'), free: at('free')}} title={at('But notice')} />],
    [at("Jackson's supporters") - 1, <Party t={t} />],
    [at('The 1828') - 1, <Mud t={t} />],
    [at('And they') - 1, <Bigamist t={t} />],
    [at('Jackson won') - 1, <Won t={t} />],
    [at('But weeks') - 1, <Grief t={t} />],
    [at('On inauguration') - 1, <Inauguration t={t} />],
    [at('Supreme') - 1, <KingMob t={t} />],
  ];
  const scene = useScene(cuts);
  const grief = at('But weeks');
  const inaug = at('On inauguration');
  const end = Math.ceil(N.duration * 30);
  return (
    <>
      {scene}
      <Audio src={staticFile('music/campaign.mp3')} volume={(f) => interpolate(f, [0, 20, grief - 20, grief], [0, 0.12, 0.12, 0], clamp)} />
      <Sequence from={grief - 10} durationInFrames={inaug - grief + 20} layout="none">
        <Audio src={staticFile('music/grief.mp3')} volume={(f) => interpolate(f, [0, 20, inaug - grief, inaug - grief + 20], [0, 0.16, 0.16, 0], clamp)} />
      </Sequence>
      <Sequence from={inaug} layout="none">
        <Audio src={staticFile('music/campaign.mp3')} startFrom={600} volume={(f) => interpolate(f, [0, 20, end - inaug, end - inaug + 40], [0, 0.12, 0.12, 0], clamp)} />
      </Sequence>
      {cuts.slice(1).map(([f], i) => <Sfx key={i} at={f} src="sfx/whoosh.wav" volume={0.26} />)}
      {['suffrage', 'In 1824', 'By 1828', 'chose', 'farmers', 'Frontier', 'Workers', 'Van', 'Democratic', 'The 1828', 'mudslinging', 'bigamist', 'Jackson won', '56', 'March'].map((c) => <Sfx key={c} at={c === 'By 1828' ? at(c, 2) : at(c)} src="sfx/stamp.wav" volume={0.26} />)}
      <Sfx at={at('King Mob', 2)} src="sfx/stamp.wav" volume={0.3} />
      {Array.from({length: 6}).map((_, i) => <Sfx key={`c${i}`} at={at('coffins') + i * 3} src="sfx/tick.wav" volume={0.3} />)}
      {['dropped', 'Indiana', 'Illinois', 'legislatures', 'seemed', 'college', 'rich', 'orphan', 'own', 'At least', 'Women', 'Enslaved', 'free', 'sharp', 'Same', 'different', 'militiaman', 'sure', 'thousands', 'furniture', 'punch', 'first king', 'democracy'].map((c) => (
        <Sfx key={c} at={at(c) - 2} src={WRITE.src} volume={WRITE.volume} />
      ))}
    </>
  );
};

export const Ch05: React.FC = () => (
  <ChapterShell n={N} audio="audio/v3_ch05_the_people.wav" lead={LEAD}>
    <Body />
  </ChapterShell>
);
