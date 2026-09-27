// Chapter 10 · Let Him Enforce It (Indian Removal). Heavy chapter: teal lines only, plain titles, no jokes,
// no stamps, no coral.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import words from '../../../public/audio/v3_ch10_let_him_enforce_it.words.json';
import {clamp} from '../../lib/anim';
import {INK, JF, Note, Picture, Tag, useGFrame, usePal} from '../Kit';
import {DarkPaper, Sfx, WRITE} from '../common';
import {MapScene, Pin, PLACES, Region, Route} from '../map';
import {ChapterShell, chapterFrames, CropCard, Definition, fill, hasFile, LEAD, makeTimeline, type Narration, PhotoCard, Quote, type TL, useScene} from '../shell';

const N = words as Narration;
export const CH10_FRAMES = chapterFrames(N, LEAD);
const GEN: [number, number] = [1376, 768];

const NATIONS: {name: string; cue: string; pts: number[][]; label: number[]}[] = [
  {name: 'Cherokee', cue: 'Cherokee', pts: [[2020, 2640], [2150, 2600], [2280, 2640], [2260, 2760], [2150, 2800], [2050, 2760]], label: [2180, 2560]},
  {name: 'Creek', cue: 'Creek', pts: [[1930, 2850], [2060, 2820], [2150, 2900], [2120, 3000], [1990, 3010], [1920, 2940]], label: [2120, 3060]},
  {name: 'Choctaw', cue: 'Choctaw', pts: [[1620, 2780], [1760, 2770], [1800, 2900], [1750, 3000], [1620, 2980], [1590, 2880]], label: [1560, 3050]},
  {name: 'Chickasaw', cue: 'Chickasaw', pts: [[1680, 2620], [1830, 2610], [1860, 2720], [1760, 2760], [1670, 2720]], label: [1640, 2560]},
  {name: 'Seminole', cue: 'Seminole', pts: [[2440, 3260], [2600, 3250], [2640, 3420], [2540, 3520], [2440, 3420]], label: [2560, 3560]},
];
const WEST = PLACES.indianTerritory;

/** Plain cream title with no highlighter box (heavy chapters). */
const Title: React.FC<{text: string; x: number; y: number; at: number; size?: number}> = ({text, x, y, at, size = 84}) => {
  const g = useGFrame();
  if (g < at) return null;
  return <div style={{position: 'absolute', left: x, top: y, fontFamily: JF.display, fontSize: size, lineHeight: 1.05, color: '#f4efe6', whiteSpace: 'nowrap', textShadow: '0 6px 24px rgba(0,0,0,0.8)',
    opacity: interpolate(g, [at, at + 6], [0, 1], clamp)}}>{text}</div>;
};

const Opening: React.FC<{t: TL}> = ({t}) => (
  <AbsoluteFill>
    <DarkPaper />
    <Note text="the hardest part of Jackson's presidency" x={300} y={380} size={66} rot={-2} at={1} color="#ffffff" />
    <Note text="is also the part that cost the most lives." x={330} y={500} size={66} rot={-2} at={t.at('cost')} />
  </AbsoluteFill>
);

const Nations: React.FC<{t: TL}> = ({t}) => {
  const a = t.at('In 1830');
  return (
    <MapScene keys={[{f: a, x: 1950, y: 2850, s: 0.9}, {f: t.at('nations'), x: 1950, y: 2870, s: 0.95}]} dim={0.25}
      svg={() => <>{NATIONS.map((n) => <Region key={n.name} pts={n.pts} at={t.at(n.cue) - 2} width={9} />)}</>}>
      {(S) => (
        <>
          <Title text="1830" x={90} y={70} at={a} size={96} />
          <Note text="tens of thousands of Native Americans in the Southeast" x={100} y={200} size={46} rot={-2} at={t.at('tens')} color="#ffffff" />
          {NATIONS.map((n) => {
            const [x, y] = S(n.label);
            return <Note key={n.name} text={n.name} x={x - 90} y={y - 40} size={50} rot={-3} at={t.at(n.cue)} />;
          })}
          <Tag text="Mitchell's Map of the United States, 1836 · Library of Congress · nation boundaries approximate" />
        </>
      )}
    </MapScene>
  );
};

const Sequoyah: React.FC<{t: TL}> = ({t}) => (
  <AbsoluteFill>
    <DarkPaper />
    <CropCard src="img/v3/ch10/cherokee_phoenix.jpg" size={[2396, 3000]} x={1260} y={70} w={560} h={900} fx={1198} fy={1100} scale={0.35} rot={2} at={t.at('newspaper') - 1} />
    <CropCard src="img/v3/ch10/sequoyah.jpg" size={[2142, 3000]} x={130} y={180} w={420} h={560} fx={1071} fy={1250} scale={0.25} rot={-2} at={t.at('Sequoyah') - 3} />
    <Note text="the Cherokee had..." x={600} y={100} size={50} rot={-3} at={t.at('The Cherokee', 2)} color="#ffffff" />
    <Note text="a written constitution" x={620} y={200} size={48} rot={-3} at={t.at('constitution')} />
    <Note text="their own newspaper" x={620} y={290} size={48} rot={-3} at={t.at('newspaper')} />
    <Note text="in a writing system" x={620} y={380} size={48} rot={-3} at={t.at('writing')} />
    <Note text="created by Sequoyah" x={150} y={790} size={54} rot={-2} at={t.at('Sequoyah')} color="#ffffff" />
    <Tag text="Sequoyah, McKenney & Hall lithograph · the Cherokee Phoenix, 1828" />
  </AbsoluteFill>
);

const Land: React.FC<{t: TL}> = ({t}) => {
  const frame = useCurrentFrame();
  const gen = hasFile('img/gen/v3_ch10_homestead.png');
  const a = t.at('But white');
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      {gen ? <Picture src="img/gen/v3_ch10_homestead.png" place={fill(GEN, 688, 384, interpolate(frame, [a, a + 240], [1.02, 1.08], clamp))} size={GEN} bw="grayscale(1) contrast(1.15) brightness(0.8)" />
        : <DarkPaper />}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)'}} />
      <Note text="white settlers wanted the land" x={100} y={100} size={60} rot={-2} at={t.at('settlers')} color="#ffffff" />
      <Note text="especially after gold was found in Georgia" x={120} y={200} size={52} rot={-2} at={t.at('gold')} />
      {gen && <Tag text="Illustration · a Cherokee farmstead in north Georgia" />}
    </AbsoluteFill>
  );
};

const Act: React.FC<{t: TL}> = ({t}) => (
  <AbsoluteFill>
    <DarkPaper />
    <Title text="THE INDIAN REMOVAL ACT, 1830" x={100} y={80} at={t.at('Indian')} size={80} />
    <Definition term="In·di·an Re·mov·al Act" def="let the president trade land in the West for Native land in the East" at={t.at('trade')} x={110} y={230} w={1300} />
    <Note text="Jackson said:" x={110} y={400} size={52} rot={-2} at={t.at('said')} color="#ffffff" />
    <Quote text="…a dense and civilized population… [on land] now occupied by a few savage hunters" at={t.at('dense')} x={110} y={480} w={1650} size={52} who="Andrew Jackson, Second Annual Message, December 1830" />
    <Note text="...and that moving west would protect them from the settlers" x={110} y={850} size={46} rot={-2} at={t.at('protect')} />
  </AbsoluteFill>
);

const Court: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const marshall = hasFile('img/v3/ch10/marshall.jpg');
  const s = t.at('probably');
  const k = interpolate(g, [s, s + 8], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <DarkPaper />
      {marshall && <PhotoCard src="img/v3/ch10/marshall.jpg" x={1450} y={120} w={360} h={470} rot={2} at={t.at('Supreme') - 1} />}
      <Title text="WORCESTER v. GEORGIA, 1832" x={100} y={70} at={t.at('Worcester')} size={76} />
      <Note text="the Supreme Court: Georgia's laws had no force" x={110} y={200} size={48} rot={-2} at={t.at('ruled')} color="#ffffff" />
      <Note text="inside the Cherokee Nation" x={130} y={290} size={48} rot={-2} at={t.at('inside')} color="#ffffff" />
      <Note text="Georgia ignored it. Jackson let it." x={110} y={400} size={56} rot={-2} at={t.at('ignored')} />
      {g >= t.at('John Marshall') && (
        <div style={{position: 'absolute', left: 110, top: 520, width: 1300}}>
          <Quote text="John Marshall has made his decision; now let him enforce it." at={t.at('John Marshall')} x={0} y={0} w={1300} size={54} who="attributed to Jackson, first printed 1864" />
          {k > 0 && <div style={{position: 'absolute', left: -10, top: 60, height: 8, width: 1250 * k, background: pal.mark, transform: 'rotate(-3deg)'}} />}
        </div>
      )}
      <Note text="probably never said" x={1100} y={500} size={52} rot={-4} at={s} />
      <Quote text="fell still born" at={t.at('fell')} x={110} y={820} w={900} size={60} who="Jackson, letter to John Coffee, April 1832" />
      {marshall && <Tag text="John Marshall, Chief Justice · portrait" />}
    </AbsoluteFill>
  );
};

const Echota: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const n0 = t.at('15,000');
  const n = Math.round(interpolate(g, [n0, n0 + 20], [0, 15000], clamp));
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard src="img/v3/ch10/john_ross.jpg" size={[2499, 3000]} x={1370} y={150} w={420} h={560} fx={1250} fy={1200} scale={0.26} rot={2} at={t.at('Principal') - 1} />
      <Title text="THE TREATY OF NEW ECHOTA, 1835" x={100} y={70} at={t.at('Treaty')} size={72} />
      <Note text="a small group of Cherokee," x={110} y={190} size={46} rot={-2} at={t.at('small')} color="#ffffff" />
    <Note text="without their government's approval" x={130} y={270} size={46} rot={-2} at={t.at('without')} color="#ffffff" />
      <Note text="signed away their homeland" x={130} y={350} size={50} rot={-2} at={t.at('homeland')} />
      <Note text="Principal Chief John Ross" x={1370} y={760} size={48} rot={-2} at={t.at('Principal')} color="#ffffff" />
      {g >= n0 && <div style={{position: 'absolute', left: 120, top: 440, fontFamily: JF.display, fontSize: 150, color: '#f4efe6', textShadow: '0 6px 22px #000'}}>{n.toLocaleString('en-US')}</div>}
      <Note text="signatures against it" x={140} y={630} size={56} rot={-2} at={n0} />
      <Note text="the Senate approved it anyway: by one vote" x={120} y={800} size={52} rot={-2} at={t.at('anyway')} color="#ffffff" />
      <Tag text="John Ross, McKenney & Hall lithograph" />
    </AbsoluteFill>
  );
};

const Choctaw: React.FC<{t: TL}> = ({t}) => {
  const frame = useCurrentFrame();
  const gen = hasFile('img/gen/v3_ch10_river.png');
  const toc = hasFile('img/v3/ch10/tocqueville.jpg');
  const a = t.at('The Choctaw');
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      {gen ? <Picture src="img/gen/v3_ch10_river.png" place={fill(GEN, 688, 384, interpolate(frame, [a, a + 360], [1.02, 1.08], clamp))} size={GEN} bw="grayscale(1) contrast(1.1) brightness(0.65)" /> : <DarkPaper />}
      {!gen && toc && <PhotoCard src="img/v3/ch10/tocqueville.jpg" x={1400} y={140} w={380} h={500} rot={2} at={t.at('Tocqueville') - 1} />}
      <Note text="the Choctaw: sent west from 1831" x={100} y={90} size={54} rot={-2} at={t.at('Choctaw', 2)} color="#ffffff" />
      <Note text="Alexis de Tocqueville watched them cross the Mississippi" x={110} y={190} size={46} rot={-2} at={t.at('Tocqueville')} />
      <Quote text="They had neither tents nor wagons." at={t.at('neither')} x={110} y={440} w={1300} size={70} who="Alexis de Tocqueville, Democracy in America (1835)" />
      <Note text="the Creek, Chickasaw and Seminole followed" x={110} y={820} size={50} rot={-2} at={t.at('followed')} color="#ffffff" />
      <Tag text={gen ? 'Illustration · the Mississippi near Memphis, winter 1831' : toc ? 'Théodore Chassériau, Alexis de Tocqueville, 1850' : ''} />
    </AbsoluteFill>
  );
};

const Trail: React.FC<{t: TL}> = ({t}) => {
  const a = t.at('In 1838');
  return (
    <MapScene keys={[{f: a, x: 1800, y: 2780, s: 0.8}, {f: t.at('Thousands', 2), x: 1700, y: 2760, s: 0.72}]} dim={0.3}
      svg={() => (
        <>
          {NATIONS.map((n) => <Region key={n.name} pts={n.pts} at={-999} width={7} />)}
          <Route pts={[NATIONS[0].label, [1900, 2560], [1600, 2560], [1350, 2600], WEST]} at={t.at('marched') - 4} dur={60} width={12} />
          <Route pts={[[1700, 2880], [1450, 2800], WEST]} at={t.at('marched') + 10} dur={50} width={8} />
          <Route pts={[[2000, 2930], [1700, 2700], [1400, 2680], WEST]} at={t.at('marched') + 16} dur={50} width={8} />
          <Route pts={[[1750, 2690], [1500, 2660], WEST]} at={t.at('marched') + 22} dur={50} width={8} />
        </>
      )}>
      {(S) => {
        const [wx, wy] = S(WEST);
        return (
          <>
            <Title text="1838" x={90} y={70} at={a} size={96} />
            <Note text="after Jackson had left office" x={100} y={200} size={46} rot={-2} at={t.at('after', 2)} color="#ffffff" />
            <Note text="the U.S. Army forced about 16,000 Cherokee west" x={100} y={290} size={46} rot={-2} at={t.at('Army')} />
            <Pin x={wx} y={wy} at={t.at('west', 4)} />
            <Note text="Indian Territory" x={wx - 150} y={wy + 40} size={46} rot={-3} at={t.at('west', 4)} color="#ffffff" />
            <Note text="thousands died: disease, cold, hunger" x={100} y={820} size={50} rot={-2} at={t.at('Thousands', 2)} color="#ffffff" />
            <Note text="perhaps as many as 1 in 4" x={100} y={910} size={54} rot={-2} at={t.at('one in four')} />
          </>
        );
      }}
    </MapScene>
  );
};

const Tears: React.FC<{t: TL}> = ({t}) => (
  <AbsoluteFill>
    <DarkPaper />
    <Note text="in Cherokee, it is remembered as" x={300} y={260} size={56} rot={-2} at={t.at('In Cherokee')} color="#ffffff" />
    <Quote text="the trail where they cried." at={t.at('trail')} x={320} y={360} w={1400} size={84} />
    <Title text="THE TRAIL OF TEARS" x={320} y={620} at={t.at('Trail', 2)} size={110} />
  </AbsoluteFill>
);

const Judgment: React.FC<{t: TL}> = ({t}) => {
  const pal = usePal();
  return (
    <AbsoluteFill>
      <DarkPaper />
      <div style={{position: 'absolute', left: 958, top: 100, width: 4, height: 560, background: 'rgba(244,239,230,0.35)'}} />
      <div style={{position: 'absolute', left: 120, top: 140, fontFamily: JF.mono, fontSize: 28, letterSpacing: 4, color: pal.mark}}>SOME HISTORIANS</div>
      <Note text="Jackson believed removal" x={110} y={240} size={42} rot={-2} at={t.at('believed')} color="#ffffff" />
      <Note text="was the only way to keep Native" x={120} y={320} size={42} rot={-2} at={t.at('only')} color="#ffffff" />
      <Note text="nations from being destroyed" x={130} y={400} size={42} rot={-2} at={t.at('destroyed')} color="#ffffff" />
      <div style={{position: 'absolute', left: 1040, top: 140, fontFamily: JF.mono, fontSize: 28, letterSpacing: 4, color: pal.mark}}>OTHERS</div>
      <Title text="“ETHNIC CLEANSING”" x={1030} y={240} at={t.at('ethnic')} size={72} />
      <Note text="either way:" x={140} y={740} size={56} rot={-2} at={t.at('Either')} />
      <Note text="a president watched a state defy the Supreme Court," x={160} y={830} size={50} rot={-2} at={t.at('watched', 2)} color="#ffffff" />
      <Note text="and chose not to stop it." x={180} y={920} size={56} rot={-2} at={t.at('chose')} />
    </AbsoluteFill>
  );
};

const Body: React.FC = () => {
  const t = makeTimeline(N, 30);
  const at = t.at;
  const cuts: [number, React.ReactNode][] = [
    [0, <Opening t={t} />],
    [at('In 1830') - 1, <Nations t={t} />],
    [at('The Cherokee', 2) - 1, <Sequoyah t={t} />],
    [at('But white') - 1, <Land t={t} />],
    [at('In 1830', 2) - 1, <Act t={t} />],
    [at('The Cherokee fought') - 1, <Court t={t} />],
    [at('In 1835') - 1, <Echota t={t} />],
    [at('The Choctaw') - 1, <Choctaw t={t} />],
    [at('In 1838') - 1, <Trail t={t} />],
    [at('In Cherokee') - 1, <Tears t={t} />],
    [at('Some historians') - 1, <Judgment t={t} />],
  ];
  const scene = useScene(cuts);
  const m2 = at('In 1838');
  const end = Math.ceil(N.duration * 30);
  return (
    <>
      {scene}
      <Audio src={staticFile('music/v3/w_frontier.mp3')} volume={(f) => interpolate(f, [0, 30, m2 - 30, m2], [0, 0.12, 0.12, 0], clamp)} />
      <Sequence from={m2 - 10} layout="none">
        <Audio src={staticFile('music/v3/w_aftermath.mp3')} volume={(f) => interpolate(f, [0, 30, end - m2, end - m2 + 40], [0, 0.13, 0.13, 0], clamp)} />
      </Sequence>
      {cuts.slice(1).map(([f], i) => <Sfx key={i} at={f} src="sfx/whoosh.wav" volume={0.14} />)}
      {['tens', 'constitution', 'newspaper', 'writing', 'settlers', 'gold', 'said', 'protect', 'ruled', 'ignored', 'probably', 'small', 'homeland', 'anyway', 'Tocqueville', 'followed', 'Army', 'believed', 'Either', 'chose'].map((c) => (
        <Sfx key={c} at={at(c) - 2} src={WRITE.src} volume={0.14} />
      ))}
    </>
  );
};

export const Ch10: React.FC = () => (
  <ChapterShell n={N} audio="audio/v3_ch10_let_him_enforce_it.wav" lead={LEAD} quiet>
    <Body />
  </ChapterShell>
);
