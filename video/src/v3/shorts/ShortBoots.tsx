// Short 1 · "He wouldn't bow to a king…": the boots story (ch02, 0–35 s) and its payoff (ch11: "Remember that kid…
// he ended up with the nickname King Andrew."). ~46 s.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import ch02 from '../../../public/audio/v3_ch02_the_boots.words.json';
import ch11 from '../../../public/audio/v3_ch11_king_andrew.words.json';
import {clamp} from '../../lib/anim';
import {Highlight, INK, JF, Loop, Note, Picture, Tint, Traced, useGFrame, usePal} from '../Kit';
import {CropCard, makeTimeline, type Narration, Stamp, type TL, useScene} from '../shell';
import {MASKS, type MaskRef} from '../masks';
import {type Clip, fillV, joinWords, ShortShell, shortFrames, TagV} from './Short';

const CLIPS: Clip[] = [
  {stem: 'v3_ch02_the_boots', words: ch02 as Narration, from: 0.0, to: 35.05},
  {stem: 'v3_ch11_king_andrew', words: ch11 as Narration, from: 62.0, to: 71.3},
];
export const SHORT_BOOTS_FRAMES = shortFrames(CLIPS);

const BOY: [number, number] = [3000, 2303];
const SULLY: [number, number] = [1920, 2288];
const KA: [number, number] = [1017, 1536];

/** A full-bleed picture with a slow push, its subject tinted and traced. `children(S, scale)` draw overlays. */
const Pic: React.FC<{src: string; size: [number, number]; mask: MaskRef; fx: number; fy: number; z0: number; z1: number; a: number; b: number; dim?: number; tag: string;
  children?: (S: (x: number, y: number) => number[], s: number) => React.ReactNode}> = ({src, size, mask, fx, fy, z0, z1, a, b, dim = 1, tag, children}) => {
  const frame = useCurrentFrame();
  const place = fillV(size, fx, fy, interpolate(frame, [a, b], [z0, z1], clamp));
  const S = (x: number, y: number) => [place.left + x * place.scale, place.top + y * place.scale];
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <Picture src={src} place={place} size={size} bw={`grayscale(1) contrast(1.25) brightness(${dim})`} />
      <Tint mask={mask.alpha} place={place} size={size} strength={dim < 1 ? 0.6 : 1} />
      <Traced paths={mask.data.shapes.subject} place={place} at={-100} dur={1} width={6} />
      {children?.(S, place.scale)}
      <TagV text={tag} />
    </AbsoluteFill>
  );
};

const BOY_TAG = 'Currier & Ives, The Brave Boy of the Waxhaws, 1876 · Library of Congress';
const Boy: React.FC<Omit<React.ComponentProps<typeof Pic>, 'src' | 'size' | 'mask' | 'tag'>> = (p) => (
  <Pic src="img/v3/ch02/brave_boy_waxhaws.jpg" size={BOY} mask={MASKS.brave_boy} tag={BOY_TAG} {...p} />
);

const Birth: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  return (
    <Boy fx={1450} fy={900} z0={1.25} z1={1.3} a={0} b={t.at('Then came')}>
      {() => (
        <>
          {g >= t.at('1767') && <Stamp text="1767" x={70} y={1030} at={t.at('1767')} size={150} rot={-3} />}
          <Note text="the Waxhaws, Carolina backcountry" x={70} y={940} size={42} rot={-3} at={t.at('Waxhaws')} />
          <Note text="(not a great start)" x={470} y={1080} size={46} rot={-3} at={t.at('Not')} color="#ffffff" />
        </>
      )}
    </Boy>
  );
};

const Revolution: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  return (
    <Boy fx={1430} fy={900} z0={1.25} z1={1.35} a={t.at('Then came')} b={t.at('Andrew said')}>
      {(S, s) => {
        const [ox, oy] = S(1125, 730);
        const [kx, ky] = S(1150, 1420);
        return (
          <>
            {g >= t.at('13,') && <Stamp text="AGE 13" x={70} y={1060} at={t.at('13,')} size={110} rot={-3} />}
            <Loop cx={ox} cy={oy} rx={130 * s} ry={150 * s} at={t.at('officer') - 2} dur={8} width={6} seed={911} />
            <Loop cx={kx} cy={ky} rx={240 * s} ry={170 * s} tilt={4} at={t.at('boots') - 2} dur={8} width={6} seed={913} />
            <Note text="“clean my boots”" x={360} y={1080} size={54} rot={-3} at={t.at('clean')} color={usePal().subject} />
          </>
        );
      }}
    </Boy>
  );
};

const No: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  return (
    <Boy fx={1760} fy={980} z0={1.85} z1={1.95} a={t.at('Andrew said')} b={t.at('So the officer')}>
      {() => (g >= t.at('no.') ? <Highlight text="NO." x={90} y={930} size={230} at={t.at('no.')} seed={915} rot={-4} /> : null)}
    </Boy>
  );
};

const Sword: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const sw = t.at('swung');
  const p = interpolate(g, [sw, sw + 5], [0, 1], clamp);
  return (
    <Boy fx={1450} fy={950} z0={1.45} z1={1.55} a={t.at('So the officer')} b={t.at('By the end')}>
      {() => (
        <>
          {g >= sw && (
            <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
              <path d="M 120 560 Q 520 760 980 1080" fill="none" stroke={pal.subject} strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={0.9} />
            </svg>
          )}
          {g >= t.at('scars') && <Highlight text="SCARS FOR LIFE" x={70} y={1060} size={84} at={t.at('scars')} seed={917} rot={-3} />}
          <Note text="(the grudge too)" x={120} y={960} size={54} rot={-3} at={t.at('grudge')} color={pal.subject} />
        </>
      )}
    </Boy>
  );
};

const Family: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  const pal = usePal();
  const rows: [string, string, number][] = [
    ['Hugh, his brother', 'died 1779', t.at('brothers')],
    ['Robert, his brother', 'died 1781', t.at('brothers') + 8],
    ['Elizabeth, his mother', 'died 1781', t.at('mother')],
  ];
  return (
    <Boy fx={1740} fy={1150} z0={1.25} z1={1.32} a={t.at('By the end')} b={t.at('Remember')} dim={0.35}>
      {() => (
        <>
          {rows.map(([who, when, cross], i) => {
            const y = 560 + i * 140;
            const c = interpolate(g, [cross, cross + 6], [0, 1], clamp);
            return g >= t.at('By the end') + i * 3 ? (
              <div key={who} style={{position: 'absolute', left: 90, top: y}}>
                <div style={{fontFamily: JF.display, fontSize: 64, color: '#f4efe6', whiteSpace: 'nowrap', textShadow: '0 3px 12px #000'}}>{who}</div>
                <div style={{fontFamily: JF.mono, fontSize: 26, letterSpacing: 2, color: 'rgba(244,239,230,0.8)', textTransform: 'uppercase'}}>{when}</div>
                <div style={{position: 'absolute', left: -10, top: 40, height: 9, width: (who.length * 31 + 20) * c, background: pal.subject, transform: 'rotate(-2deg)'}} />
              </div>
            ) : null;
          })}
          {g >= t.at('no family') && <Highlight text="NO FAMILY LEFT" x={70} y={1010} size={88} at={t.at('no family')} seed={919} rot={-2} />}
        </>
      )}
    </Boy>
  );
};

const Kid: React.FC<{t: TL}> = ({t}) => (
  <Boy fx={1740} fy={950} z0={1.3} z1={1.4} a={t.at('Remember')} b={t.at('He spent')}>
    {(S, s) => {
      const [bx, by] = S(1740, 1200);
      return <Loop cx={bx} cy={by} rx={240 * s} ry={470 * s} tilt={-5} at={t.at('kid') - 2} dur={10} width={7} seed={921} />;
    }}
  </Boy>
);

const Life: React.FC<{t: TL}> = ({t}) => (
  <Pic src="img/jackson_sully_1845.jpg" size={SULLY} mask={MASKS.sully} fx={960} fy={1050} z0={1.0} z1={1.07} a={t.at('He spent')} b={t.at('And he ended')}
    tag="Thomas Sully, Andrew Jackson, 1845 · National Gallery of Art" />
);

/** The payoff: the 1833 cartoon on a card in the middle band, so the crowned head isn't under the headline. */
const Crown: React.FC<{t: TL}> = ({t}) => {
  const g = useGFrame();
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <Picture src="img/v3/ch01/king_andrew_1833.jpg" place={fillV(KA, 508, 900, 1.15)} size={KA} bw="grayscale(1) contrast(1.2) brightness(0.3) blur(6px)" />
      <CropCard mask={MASKS.king_andrew} traceAt={-100} src="img/v3/ch01/king_andrew_1833.jpg" size={KA} x={150} y={500} w={760} h={700} fx={508} fy={560} scale={0.78} rot={-2} at={-100} />
      {g >= t.at('King Andrew') && <Highlight text="KING ANDREW" x={70} y={1050} size={120} at={t.at('King Andrew')} seed={923} rot={-3} />}
      <TagV text="King Andrew the First, 1833 · Library of Congress" />
    </AbsoluteFill>
  );
};

const Body: React.FC<{t: TL}> = ({t}) => {
  const at = t.at;
  const cuts: [number, React.ReactNode][] = [
    [0, <Birth t={t} />],
    [at('Then came') - 1, <Revolution t={t} />],
    [at('Andrew said') - 1, <No t={t} />],
    [at('So the officer') - 1, <Sword t={t} />],
    [at('By the end') - 1, <Family t={t} />],
    [at('Remember') - 1, <Kid t={t} />],
    [at('He spent') - 1, <Life t={t} />],
    [at('And he ended') - 1, <Crown t={t} />],
  ];
  return <>{useScene(cuts)}</>;
};

const N = joinWords(CLIPS);
const T = makeTimeline(N, 30);
const CUTS = ['Then came', 'Andrew said', 'So the officer', 'By the end', 'Remember', 'He spent', 'And he ended'].map((p) => T.at(p) - 1);

export const ShortBoots: React.FC = () => (
  <ShortShell clips={CLIPS} headline={["HE WOULDN'T BOW", 'TO A KING…']} music={{src: 'music/cold_open.mp3', volume: 0.14}} cuts={CUTS}>
    <Body t={T} />
  </ShortShell>
);
