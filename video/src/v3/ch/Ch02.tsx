// Chapter 2 · Dirty Boots
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import words from '../../../public/audio/v3_ch02_the_boots.words.json';
import {clamp} from '../../lib/anim';
import {Highlight, INK, JF, Loop, Note, Picture, Tag, Tint, Traced, useGFrame, usePal} from '../Kit';
import {DarkPaper, Sfx, WRITE} from '../common';
import {MapScene, Pin, PLACES, Route} from '../map';
import {ChapterShell, chapterFrames, CropCard, fill, hasFile, LEAD, makeTimeline, type Narration, Stamp, type TL, useScene} from '../shell';
import {MASKS} from '../masks';

const N = words as Narration;
export const CH02_FRAMES = chapterFrames(N, LEAD);
const BOY: [number, number] = [3000, 2303];
const GEN: [number, number] = [1200, 896];

const Birth: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const W = PLACES.waxhaws;
  return (
    <MapScene keys={[{f: 0, x: 2520, y: 2640, s: 0.9}, {f: t.at('border'), x: W[0], y: W[1], s: 1.5}]}>
      {(S) => {
        const [px, py] = S(W);
        return (
          <>
            <Pin x={px} y={py} at={t.at('Waxhaws') - 1} />
            <Note text="the Waxhaws" x={px + 30} y={py - 90} size={50} rot={-3} at={t.at('Waxhaws')} />
            {g >= t.at('1767') && <Highlight text="1767" x={100} y={90} size={110} at={t.at('1767')} seed={201} rot={-2} />}
            <Note text="North Carolina" x={px - 330} y={py - 250} size={42} rot={-4} at={t.at('North')} color="#ffffff" />
            <Note text="South Carolina" x={px - 300} y={py + 130} size={42} rot={-4} at={t.at('South')} color="#ffffff" />
            <Note text="his father died a few weeks before he was born" x={100} y={860} size={48} rot={-2} at={t.at('father')} />
            <Note text="(not a great start)" x={140} y={950} size={44} rot={-2} at={t.at('Not')} color="#ffffff" />
          </>
        );
      }}
    </MapScene>
  );
};

/** Optional Gemini painting of the backcountry cabin, used for "His father died" if it exists. */
const Cabin: React.FC<{t: TL}> = ({t}) => {
  const frame = useCurrentFrame();
  const place = fill(GEN, 600, 448, interpolate(frame, [t.at('His father'), t.at('Then came')], [1.02, 1.1], clamp));
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <Picture src="img/gen/v3_ch02_backcountry.png" place={place} size={GEN} bw="grayscale(1) contrast(1.2)" />
      <Note text="his father died a few weeks before he was born" x={100} y={860} size={48} rot={-2} at={t.at('father')} />
      <Note text="(not a great start)" x={140} y={950} size={44} rot={-2} at={t.at('Not')} color="#ffffff" />
      <Tag text="Illustration · a Carolina backcountry cabin, 1767" />
    </AbsoluteFill>
  );
};

/** The Brave Boy lithograph with a camera that pushes to different details. */
const Boy: React.FC<{t: TL; from: number; to: number; fx: number; fy: number; z0: number; z1: number; children?: (S: (x: number, y: number) => number[], s: number) => React.ReactNode}> = ({t, from, to, fx, fy, z0, z1, children}) => {
  const frame = useCurrentFrame();
  const place = fill(BOY, fx, fy, interpolate(frame, [from, to], [z0, z1], clamp));
  const S = (x: number, y: number) => [place.left + x * place.scale, place.top + y * place.scale];
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <Picture src="img/v3/ch02/brave_boy_waxhaws.jpg" place={place} size={BOY} bw="grayscale(1) contrast(1.25)" />
      <Tint mask={MASKS.brave_boy.alpha} place={place} size={BOY} />
      <Traced paths={MASKS.brave_boy.data.shapes.subject} place={place} at={from + 4} dur={10} width={5} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)'}} />
      {children?.(S, place.scale)}
      <Tag text="Currier & Ives, The Brave Boy of the Waxhaws, 1876 · Library of Congress" />
    </AbsoluteFill>
  );
};

const Revolution: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  return (
    <Boy t={t} from={t.at('Then came')} to={t.at('Andrew said')} fx={1500} fy={1100} z0={1.1} z1={1.25}>
      {(S, s) => {
        const [ox, oy] = S(1125, 730);
        const [kx, ky] = S(1150, 1420);
        return (
          <>
            {g >= t.at('Revolution') && <Highlight text="THE REVOLUTION" x={700} y={70} size={76} at={t.at('Revolution')} seed={203} rot={-2} />}
            <Note text="age 13: a Patriot messenger" x={960} y={200} size={46} rot={-2} at={t.at('messages')} />
            {g >= t.at('1781') && <Highlight text="1781" x={1500} y={330} size={90} at={t.at('1781')} seed={205} rot={-2} />}
            <Loop cx={ox} cy={oy} rx={130 * s} ry={150 * s} at={t.at('officer') - 2} dur={8} width={6} seed={207} />
            <Loop cx={kx} cy={ky} rx={240 * s} ry={180 * s} tilt={4} at={t.at('boots') - 2} dur={8} width={6} seed={209} />
            <Note text="“clean my boots”" x={820} y={930} size={56} rot={-3} at={t.at('clean')} color={usePal().subject} />
          </>
        );
      }}
    </Boy>
  );
};

const No: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  return (
    <Boy t={t} from={t.at('Andrew said')} to={t.at('So the officer')} fx={1760} fy={950} z0={1.9} z1={2.05}>
      {() => g >= t.at('no') ? <Highlight text="NO." x={1180} y={640} size={200} at={t.at('no')} seed={211} rot={-4} /> : null}
    </Boy>
  );
};

const Sword: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const sw = t.at('swung');
  const p = interpolate(g, [sw, sw + 5], [0, 1], clamp);
  return (
    <Boy t={t} from={t.at('So the officer')} to={t.at('By the end')} fx={1250} fy={800} z0={1.6} z1={1.75}>
      {() => (
        <>
          {g >= sw && (
            <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
              <path d="M 380 120 Q 900 380 1560 760" fill="none" stroke={pal.subject} strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={0.9} />
            </svg>
          )}
          <Note text="hand + head" x={1260} y={140} size={60} rot={-3} at={t.at('hand')} />
          <Note text="scars for life" x={1290} y={240} size={60} rot={-3} at={t.at('scars')} color="#ffffff" />
          <Note text="(the grudge too)" x={1310} y={340} size={60} rot={-3} at={t.at('grudge')} color={pal.subject} />
        </>
      )}
    </Boy>
  );
};

const Family: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const rows: [string, string, number][] = [
    ['his father', 'died 1767, before he was born', -999],
    ['Hugh, his brother', 'died 1779', t.at('brothers')],
    ['Robert, his brother', 'died 1781', t.at('brothers') + 8],
    ['Elizabeth, his mother', 'died 1781', t.at('mother')],
  ];
  return (
    <AbsoluteFill>
      <DarkPaper />
      <Note text="by the end of the war..." x={120} y={80} size={56} rot={-3} at={t.at('By the end')} />
      {rows.map(([who, when, cross], i) => {
        const y = 220 + i * 130;
        const show = g >= t.at('By the end') + i * 3;
        const c = interpolate(g, [cross, cross + 6], [0, 1], clamp);
        return show ? (
          <div key={who} style={{position: 'absolute', left: 170, top: y}}>
            <div style={{fontFamily: JF.display, fontSize: 60, color: '#f4efe6', whiteSpace: 'nowrap'}}>{who}</div>
            <div style={{fontFamily: JF.mono, fontSize: 24, letterSpacing: 2, color: 'rgba(244,239,230,0.7)', textTransform: 'uppercase'}}>{when}</div>
            <div style={{position: 'absolute', left: -10, top: 38, height: 8, width: (who.length * 30 + 20) * c, background: pal.subject, transform: 'rotate(-2deg)'}} />
          </div>
        ) : null;
      })}
      {g >= t.at('14') && <Stamp text="Andrew, 14" x={1180} y={330} at={t.at('14')} size={110} rot={-3} />}
      {g >= t.at('no family') && <Highlight text="NO FAMILY LEFT" x={1100} y={520} size={80} at={t.at('no family')} seed={213} rot={-2} />}
    </AbsoluteFill>
  );
};

const Remember: React.FC<{t: TL}> = ({t}) => (
  <Boy t={t} from={t.at('Remember')} to={t.at('Jackson grew')} fx={1740} fy={1150} z0={1.5} z1={1.62}>
    {(S, s) => {
      const [bx, by] = S(1740, 1200);
      return (
        <>
          <Loop cx={bx} cy={by} rx={260 * s} ry={600 * s} tilt={-5} at={t.at('kid') - 2} dur={10} width={7} seed={215} />
          <Note text="remember this kid" x={140} y={140} size={70} rot={-3} at={t.at('Remember')} color={usePal().subject} />
          <Note text="(he wouldn't bow" x={160} y={260} size={46} rot={-3} at={t.at('bow')} color="#ffffff" />
          <Note text="to the king's officer)" x={180} y={340} size={46} rot={-3} at={t.at('bow')} color="#ffffff" />
        </>
      );
    }}
  </Boy>
);

const West: React.FC<{t: TL}> = ({t}) => {
  const W = PLACES.waxhaws;
  const Nv = PLACES.nashville;
  const a = t.at('Jackson grew');
  return (
    <MapScene keys={[{f: a, x: 2500, y: 2640, s: 1.2}, {f: t.at('Nashville'), x: 2300, y: 2600, s: 0.95}]}
      svg={() => <Route pts={[W, [2450, 2560], [2250, 2530], Nv]} at={t.at('moved') - 2} dur={20} />}>
      {(S) => {
        const [wx, wy] = S(W);
        const [nx, ny] = S(Nv);
        return (
          <>
            <Pin x={wx} y={wy} at={a} />
            <Pin x={nx} y={ny} at={t.at('Nashville')} />
            <Note text="Nashville" x={nx - 120} y={ny - 110} size={54} rot={-3} at={t.at('Nashville')} />
            <Note text="grew up wild" x={100} y={100} size={54} rot={-3} at={t.at('wild')} color="#ffffff" />
            <Note text="became a lawyer" x={100} y={190} size={54} rot={-3} at={t.at('lawyer')} />
            <Note text="...and started climbing" x={1150} y={880} size={54} rot={-3} at={t.at('climbing')} />
          </>
        );
      }}
    </MapScene>
  );
};

const Hermitage: React.FC<{t: TL}> = ({t}) => {
  const frame = useCurrentFrame();
  const g = useGFrame();
  const size: [number, number] = [3000, 2361];
  const place = fill(size, 1500, 1200, interpolate(frame, [t.at('Land'), t.at('And he fell')], [1.02, 1.1], clamp));
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <Picture src="img/hermitage_1856.jpg" place={place} size={size} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 100%)'}} />
      <Note text="land." x={120} y={100} size={70} rot={-3} at={t.at('Land')} />
      <Note text="cotton." x={330} y={100} size={70} rot={-3} at={t.at('Cotton')} />
      {g >= t.at('Hermitage') && <Highlight text="THE HERMITAGE" x={110} y={220} size={96} at={t.at('Hermitage')} seed={217} rot={-2} />}
      <Note text="worked by enslaved people" x={120} y={880} size={60} rot={-2} at={t.at('enslaved')} color="#ffffff" />
      <Tag text="The Hermitage, near Nashville, 1856 engraving" />
    </AbsoluteFill>
  );
};

const Rachel: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const R: [number, number] = [1920, 2286];
  const w = t.at("wasn't");
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard mask={MASKS.rachel} src="img/rachel_earl.jpg" size={R} x={140} y={150} w={520} h={680} fx={960} fy={1000} scale={0.52} rot={-2} at={t.at('And he fell') - 1} />
      {g >= t.at('Rachel') && <Highlight text="RACHEL DONELSON ROBARDS" x={760} y={110} size={64} at={t.at('Rachel')} seed={219} rot={-2} />}
      <Note text="stuck in a miserable marriage" x={780} y={230} size={46} rot={-2} at={t.at('miserable')} color="#ffffff" />
      {g >= t.at('1791') && (
        <div style={{position: 'absolute', left: 820, top: 360, width: 900, height: 470, background: '#efe6d2', boxShadow: '0 18px 34px rgba(0,0,0,0.6)', transform: 'rotate(1.5deg)',
          opacity: interpolate(g, [t.at('1791'), t.at('1791') + 5], [0, 1], clamp)}}>
          <div style={{position: 'absolute', left: 40, top: 30, fontFamily: JF.mono, fontSize: 24, letterSpacing: 3, color: '#3a332a'}}>MARRIAGE RECORD</div>
          <div style={{position: 'absolute', left: 40, top: 90, fontFamily: JF.display, fontSize: 64, color: '#1d1a16'}}>1791 · married</div>
          <div style={{position: 'absolute', left: 40, top: 180, fontFamily: JF.sans, fontWeight: 600, fontSize: 32, color: '#3a332a'}}>Andrew Jackson & Rachel Robards</div>
        </div>
      )}
      <Note text="believing her divorce was final" x={860} y={600} size={44} rot={-2} at={t.at('believing')} color="#333333" />
      {g >= w && <Highlight text="IT WASN'T." x={1200} y={690} size={80} at={w} seed={221} rot={-6} />}
      {g >= t.at('1794') && <Stamp text="1794 · married again" x={840} y={860} at={t.at('1794')} size={70} color={pal.mark} rot={-2} />}
      <Note text="his enemies would never let them forget it" x={760} y={960} size={44} rot={-2} at={t.at('enemies')} color="#ffffff" />
      <Tag text="Ralph E. W. Earl, Rachel Jackson, c. 1827 · The Hermitage" />
    </AbsoluteFill>
  );
};

const Duel: React.FC<{t: TL}> = ({t}) => {
  const frame = useCurrentFrame();
  const g = useGFrame();
  const size: [number, number] = [1920, 1372];
  const place = fill(size, 960, 686, interpolate(frame, [t.at('He also'), t.at('That bullet')], [1.02, 1.12], clamp));
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <Picture src="img/duel_1834.jpg" place={place} size={size} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 100%)'}} />
      <Note text="a terrifying temper" x={700} y={80} size={56} rot={-3} at={t.at('terrifying')} />
      {g >= t.at('1806') && <Highlight text="1806" x={700} y={190} size={100} at={t.at('1806')} seed={223} rot={-2} />}
      <Note text="an insult to Rachel..." x={720} y={350} size={52} rot={-3} at={t.at('insult')} color="#ffffff" />
      {g >= t.at('duel') && <Highlight text="A DUEL" x={1300} y={820} size={110} at={t.at('duel')} seed={225} rot={-3} />}
      <Note text="took a bullet in the chest" x={120} y={860} size={50} rot={-2} at={t.at('bullet')} />
      <Note text="...and killed the other man" x={140} y={950} size={50} rot={-2} at={t.at('killed')} color={usePal().subject} />
      <Tag text="Duel scene, from a 1834 anti-Jackson pamphlet" />
    </AbsoluteFill>
  );
};

const Bullet: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const SULLY: [number, number] = [1920, 2288];
  const b = t.at('That bullet');
  return (
    <AbsoluteFill>
      <DarkPaper />
      <CropCard src="img/jackson_sully_1845.jpg" size={SULLY} x={560} y={80} w={800} h={920} fx={950} fy={1250} scale={0.62} rot={1} at={b - 1}>
        {(S) => {
          const [x, y] = S(1150, 1620);
          const k = interpolate(g, [b + 4, b + 8], [0, 1], clamp);
          return (
            <>
              <div style={{position: 'absolute', left: x - 14 * k, top: y - 14 * k, width: 28 * k, height: 28 * k, borderRadius: '50%', background: pal.subject, border: `3px solid ${INK}`}} />
              <Loop cx={x} cy={y} rx={60} ry={50} at={b + 6} dur={8} width={6} seed={227} />
              <Note text="still in there" x={x + 90} y={y - 60} size={60} rot={-4} at={t.at('stayed', 2)} />
            </>
          );
        }}
      </CropCard>
      <Note text="for the rest of his life" x={90} y={880} size={52} rot={-3} at={t.at('rest', 2)} color="#ffffff" />
      <Tag text="Thomas Sully, Andrew Jackson, 1845 · National Gallery of Art" />
    </AbsoluteFill>
  );
};

const Body: React.FC = () => {
  const t = makeTimeline(N, 30);
  const at = t.at;
  const cabin = hasFile('img/gen/v3_ch02_backcountry.png');
  const cuts: [number, React.ReactNode][] = [
    [0, <Birth t={t} />],
    ...(cabin ? [[at('His father') - 1, <Cabin t={t} />] as [number, React.ReactNode]] : []),
    [at('Then came') - 1, <Revolution t={t} />],
    [at('Andrew said') - 1, <No t={t} />],
    [at('So the officer') - 1, <Sword t={t} />],
    [at('By the end') - 1, <Family t={t} />],
    [at('Remember') - 1, <Remember t={t} />],
    [at('Jackson grew') - 1, <West t={t} />],
    [at('Land') - 1, <Hermitage t={t} />],
    [at('And he fell') - 1, <Rachel t={t} />],
    [at('He also') - 1, <Duel t={t} />],
    [at('That bullet') - 1, <Bullet t={t} />],
  ];
  const scene = useScene(cuts);
  return (
    <>
      {scene}
      {cuts.slice(1).map(([f], i) => <Sfx key={i} at={f} src="sfx/whoosh.wav" volume={0.28} />)}
      {['1767', 'Revolution', '1781', 'no', 'no family', 'Hermitage', 'Rachel', "wasn't", '1794', '1806', 'duel'].map((c) => <Sfx key={c} at={at(c)} src="sfx/stamp.wav" volume={0.27} />)}
      <Sfx at={at('Waxhaws') - 1} src="sfx/tick.wav" volume={0.45} />
      <Sfx at={at('Nashville')} src="sfx/tick.wav" volume={0.45} />
      <Sfx at={at('swung')} src="sfx/whoosh.wav" volume={0.45} />
      {['father', 'messages', 'clean', 'hand', 'scars', 'grudge', 'Remember', 'bow', 'wild', 'lawyer', 'climbing', 'Land', 'Cotton', 'enslaved', 'miserable', 'believing', 'enemies', 'terrifying', 'insult', 'bullet', 'killed'].map((c) => (
        <Sfx key={c} at={at(c) - 2} src={WRITE.src} volume={WRITE.volume} />
      ))}
    </>
  );
};

export const Ch02: React.FC = () => (
  <ChapterShell n={N} audio="audio/v3_ch02_the_boots.wav" lead={LEAD} music={[{src: 'music/cold_open.mp3', volume: 0.14}]}>
    <Body />
  </ChapterShell>
);
