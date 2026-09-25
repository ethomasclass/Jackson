import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cue, Sfx} from '../components/Scene';
import {clamp} from '../lib/anim';
import {F, P} from '../lib/theme';
import {makeTimeline, Narration} from '../lib/timing';
import {Picture, VocabTicket} from '../theater/Props';
import {SCENE_CARD_SECONDS, TheaterScene} from '../theater/Scene';
import {HangingSign, Small, Wood} from '../theater/Signs';
import {Backcloth, DropCurtain, Theater, Wash} from '../theater/Stage';
import narration from '../../public/audio/v2_s9_lowell.words.json';

const N = narration as Narration;
const TAIL = 24;
export const LOWELL_SECONDS = SCENE_CARD_SECONDS + N.duration + TAIL / 30;

/** Scene IX: Francis Cabot Lowell memorizes the power loom; Waltham; the tariff. */
export const Lowell: React.FC<{captions: boolean}> = ({captions}) => (
  <TheaterScene narration={N} audio="audio/v2_s9_lowell.wav" captions={captions} tail={TAIL} scene={{n: 'IX', title: 'The Spy Who Built a Mill', years: '1810 – 1816'}}>
    <Body />
  </TheaterScene>
);

/** A painted cog. */
const Gear: React.FC<{x: number; y: number; r: number; spin: number; color: string}> = ({x, y, r, spin, color}) => {
  const teeth = 10;
  const pts = Array.from({length: teeth * 2}, (_, i) => {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const rr = i % 2 ? r * 0.78 : r;
    return `${Math.cos(a) * rr},${Math.sin(a) * rr}`;
  }).join(' ');
  return (
    <g transform={`translate(${x} ${y}) rotate(${spin})`}>
      <polygon points={pts} fill={color} stroke={P.ink} strokeWidth={4} strokeLinejoin="round" />
      <circle r={r * 0.3} fill={P.cream} stroke={P.ink} strokeWidth={4} />
    </g>
  );
};

/** Gears and measurements floating off the looms and into Lowell's head. */
const Memorize: React.FC<{at: number; into: number; out: number; hx: number; hy: number}> = ({at, into, out, hx, hy}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > out) return null;
  const items = [
    {x: 520, y: 700, r: 44, c: P.mustard},
    {x: 760, y: 640, r: 60, c: P.vermilion},
    {x: 1000, y: 720, r: 36, c: P.emerald},
    {x: 1180, y: 650, r: 52, c: P.royal},
    {x: 1380, y: 720, r: 40, c: P.mustard},
  ];
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, zIndex: 19}}>
      {items.map((g, i) => {
        const s = spring({frame: frame - at - i * 5, fps, config: {stiffness: 120, damping: 12}});
        const m = spring({frame: frame - into - i * 4, fps, config: {stiffness: 60, damping: 15}});
        const x = g.x + (hx - g.x) * m;
        const y = g.y - 60 * s + (hy - (g.y - 60)) * m;
        const o = interpolate(m, [0.85, 1], [1, 0], clamp);
        return (
          <g key={i} opacity={o} transform={`translate(${x} ${y}) scale(${s * (1 - 0.7 * m)}) translate(${-x} ${-y})`}>
            <Gear x={x} y={y} r={g.r} spin={frame * (i % 2 ? 3 : -3)} color={g.c} />
          </g>
        );
      })}
      <text x={hx} y={hy - 120} textAnchor="middle" fontFamily={F.slab} fontSize={36} fill={P.ink} opacity={interpolate(frame, [into, into + 10], [0, 1], clamp)}>
        EVERY GEAR · EVERY MEASUREMENT
      </text>
    </svg>
  );
};

const Body: React.FC = () => {
  const {fps} = useVideoConfig();
  const tl = makeTimeline(N, fps);
  const at = tl.at;
  const END = tl.frames;
  const home = at('Back in');
  const cam: [number, number, number, number][] = [
    [0, 0.95, 960, 575],
    [at('Before the war'), 1.04, 960, 560],
    [at('In 1810'), 1.02, 960, 580],
    [at('But he also'), 1.08, 900, 600],
    [at('He never'), 1.04, 960, 575],
    [home, 1.0, 960, 575],
    [at('Two years'), 1.04, 960, 570],
    [END + 20, 0.94, 960, 575],
  ];
  return (
    <>
      <Cue src="music/intrigue.mp3" at={0} until={home} level={0.13} fadeIn={20} fadeOut={30} />
      <Cue src="music/good_feelings.mp3" at={home} until={END} level={0.14} fadeIn={30} />
      <Sfx src="stamp" at={at('found nothing')} volume={0.4} />
      <Theater cam={cam}>
        <Backcloth src="v2/scenery/mill_interior.jpg" />
        <Backcloth src="v2/scenery/waltham_mill.jpg" at={home} />

        <HangingSign at={at('factories')} out={at('Before the war')} x={960} y={300} w={700}>
          <div style={{fontFamily: F.slab, fontSize: 34, letterSpacing: 4}}>NATIONAL PRIDE, BUILT IN</div>
          <Wood size={100} font="ultra" color={P.vermilion}>FACTORIES</Wood>
        </HangingSign>

        <Picture src="img/v2/power_loom.jpg" at={at('power loom')} out={at('In 1810')} x={1240} y={250} w={640} source="power-loom weaving in an English mill, engraving, 1835" />
        <HangingSign at={at('state secret')} out={at('In 1810')} x={560} y={300} w={460} tone="black" sfx={false}>
          <Wood size={60} font="ultra" color={P.mustard}>BRITISH</Wood>
          <Wood size={60} font="ultra" color={P.mustard}>SECRET</Wood>
        </HangingSign>
        <HangingSign at={at('illegal')} out={at('In 1810')} x={560} y={620} w={460} tone="red" sfx={false}>
          <Wood size={44} font="rye">ILLEGAL TO EXPORT</Wood>
          <Small size={26}>machines, or even drawings of them</Small>
        </HangingSign>

        <Picture src="img/v2/lowell.jpg" at={at('Francis Cabot')} out={home} x={540} y={250} w={380} rot={-2} source="silhouette of Francis Cabot Lowell, made in his lifetime" />
        <HangingSign at={at('Francis Cabot') + 8} out={at('But he also')} x={1200} y={300} w={560}>
          <Wood size={50} font="rye">FRANCIS CABOT LOWELL</Wood>
          <Small size={28}>a Boston merchant · 1810: sails to England</Small>
          <div style={{fontFamily: F.slab, fontSize: 28, letterSpacing: 3, marginTop: 8, color: P.vermilion}}>“FOR HIS HEALTH” · HE REALLY WAS SICK</div>
        </HangingSign>
        <Memorize at={at('mill after')} into={at('memorized')} out={at('He never')} hx={540} hy={520} />

        <HangingSign at={at('customs')} out={at('Back in')} x={1200} y={300} w={620}>
          <div style={{fontFamily: F.slab, fontSize: 30, letterSpacing: 3}}>BRITISH CUSTOMS SEARCH</div>
          <Wood size={70} font="ultra" color={P.vermilion} at={at('found nothing')}>NOTHING FOUND</Wood>
          <Small size={26}>as the story goes</Small>
          <Wood size={40} font="rye" at={at('locked in')} style={{marginTop: 8}}>IT WAS ALL IN HIS HEAD</Wood>
        </HangingSign>

        <HangingSign at={at('Paul Moody')} out={at('In 1814')} x={960} y={300} w={760}>
          <div style={{fontFamily: F.slab, fontSize: 32, letterSpacing: 3}}>REBUILT FROM MEMORY, AND IMPROVED, BY</div>
          <Wood size={60} font="rye">LOWELL &amp; PAUL MOODY</Wood>
          <Small size={28}>Moody was a skilled mechanic</Small>
        </HangingSign>
        <Picture src="img/v2/bmc_smith.jpg" at={at('In 1814')} out={at('Two years')} x={1380} y={260} w={520} rot={2} source="the Boston Manufacturing Company mills at Waltham, 1820s" />
        <HangingSign at={at('raw cotton')} out={at('Two years')} x={640} y={300} w={560}>
          <div style={{fontFamily: F.sc, fontSize: 36}}>Waltham, 1814</div>
          <Wood size={44} font="rye">RAW COTTON → FINISHED CLOTH</Wood>
          <Wood size={60} font="ultra" color={P.vermilion} at={at('one roof')}>UNDER ONE ROOF</Wood>
        </HangingSign>

        <HangingSign at={at('One stolen')} out={END} x={960} y={300} w={820} tone="blue">
          <div style={{fontFamily: F.slab, fontSize: 36, letterSpacing: 4}}>ONE STOLEN IDEA →</div>
          <Wood size={70} font="rye">AN AMERICAN INDUSTRY</Wood>
        </HangingSign>

        <Wash keys={[[0, '#D8C8A8', 0.2], [home, '#FFFFFF', 0]]} />
        <DropCurtain keys={[[0, 0], [4, 1], [END + 2, 0]]} />
      </Theater>
      <VocabTicket term="power loom" pos="noun" defFrom="a machine that" defWords={12} at={at('power loom') - 2} out={at('It was illegal')} tl={tl} x={200} y={300} w={820} termSize={84} />
      <VocabTicket term="tariff" say="TAIR-if" pos="noun" defFrom="a tax on" defWords={5} at={at('tariff') - 2} out={at('One stolen')} tl={tl} x={560} y={280} w={800} termSize={100} />
    </>
  );
};
