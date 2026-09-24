import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions} from '../components/Captions';
import {ChestDiagram, LifeLine, YearCounter} from '../components/Diagrams';
import {Grain, InkDefs, Paper} from '../components/Paper';
import {Label, Scrap, Source} from '../components/Scrap';
import {TitleCard} from '../components/TitleCard';
import {DateTag, Em, Rise, Stamp, VocabCard} from '../components/Type';
import {clamp, pop} from '../lib/anim';
import {C, F} from '../lib/theme';
import {makeTimeline, Narration} from '../lib/timing';
import narration from '../../public/audio/v1_cold_open.words.json';

export const TITLE_SECONDS = 5.5;
const N = narration as Narration;

/** Brief white flash + camera shake for a gunshot. */
const Shot: React.FC<{at: number; flash?: boolean; volume?: number}> = ({at, flash = true, volume = 0.9}) => {
  const frame = useCurrentFrame();
  const f = frame - at;
  return (
    <>
      <Sequence from={at - 5} durationInFrames={90} layout="none">
        <Audio src={staticFile('sfx/shot.wav')} volume={volume * 0.75} />
      </Sequence>
      {flash && f >= 0 && f < 6 && (
        <AbsoluteFill style={{background: '#FFF8E8', opacity: interpolate(f, [0, 5], [0.85, 0], clamp)}} />
      )}
    </>
  );
};

const useShake = (hits: number[]) => {
  const frame = useCurrentFrame();
  let dx = 0, dy = 0;
  for (const h of hits) {
    const f = frame - h;
    if (f >= 0 && f < 14) {
      const a = 18 * Math.exp(-f / 4);
      dx += Math.sin(f * 2.3) * a;
      dy += Math.cos(f * 3.1) * a * 0.6;
    }
  }
  return `translate(${dx}px, ${dy}px)`;
};

export const ColdOpen: React.FC<{captions: boolean}> = ({captions}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tl = makeTimeline(N, fps);
  const at = tl.at;

  // ---- beat boundaries (all anchored to narration) ----
  const A = 0;                                   // In 1806 ... insulted Andrew Jackson's wife.
  const B = at('So Jackson challenged');          // the duel defined
  const Cb = at('Dickinson was known');           // best shot, fired first
  const D = at('The bullet hit');                 // an inch from his heart
  const E = at('Jackson pressed');                // stayed standing, aimed
  const Fb = at('The bullet stayed');             // rest of his life
  const G = at('Twenty-three years later');       // 1806 -> 1829, seventh president
  const Hb = at('He was stubborn');               // character traits
  const I = at('So how did');                     // the question
  const J = at('To answer that');                 // calm, almost boring
  const END = tl.frames;
  const shots = [at('fired first'), at('killed Dickinson')];
  const shake = useShake([shots[0]]);

  // slow global camera drift so nothing is ever perfectly static
  const drift = 1 + 0.012 * Math.sin(frame / 90);

  // music bed: under the narration, pulled down for the shot, gone for "boring", back for the title
  const bedVol = (f: number) =>
    interpolate(f, [0, 20, shots[0] - 4, shots[0] + 2, shots[0] + 40, at('so calm'), at('boring'), END, END + 10], [0, 0.16, 0.16, 0.03, 0.16, 0.16, 0, 0, 0], clamp);

  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden'}}>
      <InkDefs />
      <Audio src={staticFile('audio/v1_cold_open.wav')} />
      <Audio src={staticFile('sfx/bed.wav')} volume={bedVol} />

      <AbsoluteFill style={{transform: `${shake} scale(${drift})`}}>
        <Paper />

        {/* ================= A: 1806, Dickinson insults Rachel ================= */}
        <Stamp text="1806" at={at('1806')} out={at('Charles') - 2} x={960} y={420} size={420} font={F.fat} rot={-3} />
        <Rise at={at('1806') + 8} out={at('Charles') - 2} x={960} y={660} align="center" size={44} font={F.sc} color={C.inkSoft}>
          ~ a quarrel of honor in Tennessee ~
        </Rise>
        <Scrap src="cut/dickinson_woodcut.png" x={250} y={120} w={300} rot={-4} in={at('Charles')} out={B} from="left">
          <Label name="CHARLES DICKINSON" sub="lawyer & famous marksman" at={at('Dickinson') + 4} y="102%" />
        </Scrap>
        <Scrap src="cut/rachel.png" x={1140} y={150} w={560} rot={3} in={at('insulted') + 6} out={B} from="right">
          <Label name="RACHEL JACKSON" sub="Andrew Jackson's wife" at={at('wife') - 2} y="102%" red />
          <Source text="Ralph E. W. Earl, c. 1830" at={at('wife')} />
        </Scrap>
        <InsultArrow at={at('insulted')} out={B} />

        {/* ================= B: challenge + vocabulary: duel ================= */}
        <Scrap src="cut/duel_woodcut.png" x={130} y={150} w={700} rot={-2.5} in={B + 4} out={Cb} from="drop" to="left">
          <Source text="1828 Coffin Handbill woodcut" at={B + 16} />
        </Scrap>
        <VocabCard
          term="duel"
          say="DOO-uhl"
          pos="noun"
          defFrom="a fight with pistols"
          defWords={13}
          at={at('duel') - 3}
          out={Cb}
          tl={tl}
          x={980}
          y={140}
          w={800}
        />
        <Scrap src="cut/pistols.png" x={1180} y={600} w={520} rot={7} in={at('pistols')} out={Cb} from="right" to="right" />

        {/* ================= C: best shot, fired first ================= */}
        <Scrap
          src="cut/duel_1834.png"
          x={160}
          y={90}
          w={1600}
          rot={1}
          in={Cb}
          out={D}
          from="right"
          to="top"
          zoom={{to: 1.25, origin: '30% 40%', until: D}}
        >
          <Source text="engraving of the duel, 1834" at={Cb + 10} />
        </Scrap>
        <Ribbon at={at('best shots')} out={D} text="ONE OF THE BEST SHOTS IN TENNESSEE" />
        <Stamp text="HE FIRED FIRST." at={at('fired first')} out={D - 4} x={960} y={640} size={120} color={C.paperLight} rot={-4} sfx={false}
          style={{background: C.red, padding: '18px 48px 24px', boxShadow: '6px 10px 18px rgba(0,0,0,0.4)'}} />
        <Shot at={at('fired first')} />

        {/* ================= D + E: an inch from his heart; stayed standing ================= */}
        <ChestDiagram
          at={D}
          bulletAt={at('in the chest')}
          heartAt={at('heart')}
          inchAt={at('an inch')}
          x={150}
          y={60}
          scale={1.2}
          out={Fb - 6}
        />
        <Rise at={at('about an inch')} out={E - 2} x={900} y={200} size={60} font={F.italic} color={C.inkSoft}>
          <i>about</i>
        </Rise>
        <Stamp text="AN INCH" at={at('an inch')} out={E - 2} x={900} y={360} size={170} align="left" rot={-2} />
        <Rise at={at('from his heart')} out={E - 2} x={910} y={470} size={84} font={F.fat}>
          from his <span style={{color: C.red}}>heart.</span>
        </Rise>

        <Rise at={at('Jackson pressed')} out={Fb - 6} x={900} y={170} size={54} font={F.body}>
          Pressed his hand to the wound.
        </Rise>
        <Stamp text="STAYED STANDING." at={at('stayed standing')} out={Fb - 6} x={900} y={330} size={84} align="left" color={C.red} rot={-1.5} />
        <Stamp text="AIMED." at={at('aimed')} out={Fb - 6} x={900} y={450} size={84} align="left" rot={1} />
        <Rise at={at('killed')} out={Fb - 6} x={900} y={540} size={54} font={F.body} color={C.inkSoft}>
          Dickinson died of his wound.
        </Rise>
        <Shot at={at('killed')} flash={false} volume={0.5} />

        {/* ================= F: the bullet stays for life ================= */}
        <Rise at={Fb} out={G - 4} x={960} y={230} align="center" size={64} font={F.body}>
          The bullet stayed in his chest
        </Rise>
        <Stamp text="FOR THE REST OF HIS LIFE" at={at('for the rest')} out={G - 4} x={960} y={390} size={96} color={C.red} rot={-1.5} />
        <LifeLine at={Fb} rideFrom={at('stayed in')} rideTo={tl.end('life')} out={G - 4} />

        {/* ================= G: 23 years later, seventh president ================= */}
        <YearCounter from={1806} to={1829} at={G} until={at('later')} out={at('that man')} />
        <Rise at={at('later')} out={at('that man')} x={960} y={620} align="center" size={48} font={F.sc} color={C.inkSoft} style={{whiteSpace: 'nowrap'}}>
          ~ twenty-three years later ~
        </Rise>
        <Scrap
          src="cut/jackson_sully.png"
          x={150}
          y={70}
          w={760}
          rot={-2}
          in={at('that man')}
          from="bottom"
          move={[[I, 90, 150, 600]]}
          out={J}
          to="left"
          zoom={{to: 1.18, origin: '42% 20%', until: I}}
        >
          <Source text="Thomas Sully, 1845" at={at('that man') + 12} until={at('seventh')} y={-46} />
        </Scrap>
        <Stamp text="7th" at={at('seventh')} out={Hb} x={1020} y={250} size={260} font={F.fat} color={C.red} align="left" rot={-4} />
        <Stamp text="PRESIDENT" at={at('president', 1)} out={Hb} x={1030} y={420} size={130} align="left" rot={-2} sfx={false} />
        <Rise at={at('of the United States')} out={Hb} x={1036} y={500} size={52} font={F.italic} color={C.inkSoft}>
          <i>of the United States</i>
        </Rise>

        {/* ================= H: character traits ================= */}
        <Trait word="STUBBORN" at={at('stubborn')} out={I} y={150} rot={-3} />
        <Trait word="FEARLESS" at={at('fearless')} out={I} y={290} rot={2} />
        <Trait word="LOYAL" note="to his friends" at={at('loyal')} out={I} y={430} rot={-2} />
        <Trait word="UNFORGIVING" note="to his enemies" at={at('unforgiving')} out={I} y={610} rot={1.5} red />

        {/* ================= I: the question ================= */}
        <Scrap src="cut/presidents_house.png" x={780} y={330} w={1020} rot={2} in={I + 2} out={J} from="right">
          <Source text="The President's House, 1830s print" at={I + 14} />
        </Scrap>
        <Rise at={I} out={J} x={760} y={80} size={66} font={F.body}>
          How did a man like <i>that</i>
          <br />
          end up in the <Em>White House?</Em>
        </Rise>

        {/* ================= J: a calm, boring time ================= */}
        <Rise at={J + 3} out={END} x={960} y={200} align="center" size={60} font={F.body} color={C.inkSoft} style={{whiteSpace: 'nowrap'}}>
          To answer that, start with a time
          <br />
          when American politics was…
        </Rise>
        <CalmBoring calmAt={at('so calm')} boringAt={at('boring')} out={END} />

        <DateTag years={[[at('Charles'), '1806'], [at('later'), '1829']]} out={J} />
        <Grain />
      </AbsoluteFill>

      {captions && (
        <Sequence durationInFrames={END}>
          <Captions words={N.words} />
        </Sequence>
      )}

      <Sequence from={END}>
        <TitleCard part="Part One" title="The Common Man Gets a Vote" />
      </Sequence>
    </AbsoluteFill>
  );
};

/** Red hand-drawn arrow from Dickinson to Rachel labelled "insulted". */
const InsultArrow: React.FC<{at: number; out: number}> = ({at, out}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = interpolate(frame, [at, at + 14], [0, 1], clamp);
  const o = interpolate(frame, [out - 6, out], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <svg width={1920} height={1080} style={{position: 'absolute', filter: 'url(#ink)'}}>
        <path
          d="M590,420 C760,330 920,330 1100,420"
          pathLength={1}
          fill="none"
          stroke={C.red}
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray="1 1"
          strokeDashoffset={1 - p}
        />
        <path d="M1062,380 L1104,424 L1046,436" fill="none" stroke={C.red} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" opacity={p >= 1 ? 1 : 0} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 845,
          top: 262,
          transform: 'translateX(-50%) rotate(-3deg)',
          fontFamily: F.slab,
          fontSize: 64,
          color: C.red,
          opacity: p,
          filter: 'url(#ink)',
        }}
      >
        INSULTED
      </div>
    </div>
  );
};

/** Red banner that unrolls across the top of the engraving. */
const Ribbon: React.FC<{at: number; out: number; text: string}> = ({at, out, text}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const s = pop(frame, at, fps, 160, 18);
  const o = interpolate(frame, [out - 8, out], [1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 110,
        transform: `translateX(-50%) rotate(-1.5deg)`,
        clipPath: `inset(0 ${(1 - s) * 50}% 0 ${(1 - s) * 50}%)`,
        background: C.red,
        color: C.paperLight,
        fontFamily: F.slab,
        fontSize: 58,
        letterSpacing: 3,
        padding: '14px 60px',
        boxShadow: '4px 8px 14px rgba(0,0,0,0.35)',
        whiteSpace: 'nowrap',
        opacity: o,
      }}
    >
      {text}
    </div>
  );
};

const Trait: React.FC<{word: string; note?: string; at: number; out: number; y: number; rot: number; red?: boolean}> = ({
  word,
  note,
  at,
  out,
  y,
  rot,
  red,
}) => (
  <>
    <Stamp text={word} at={at} out={out} x={1010} y={y} size={96} align="left" rot={rot} color={red ? C.red : C.ink} />
    {note && (
      <Rise at={at + 6} out={out} x={1020} y={y + 44} size={40} font={F.italic} color={C.inkSoft}>
        <i>{note}</i>
      </Rise>
    )}
  </>
);

/** "SO CALM" floats gently; "boring." sags off its baseline — the video's first joke. */
const CalmBoring: React.FC<{calmAt: number; boringAt: number; out: number}> = ({calmAt, boringAt, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const calm = pop(frame, calmAt, fps, 60, 20);
  const bor = pop(frame, boringAt, fps, 80, 10);
  const sag = interpolate(frame, [boringAt + 10, boringAt + 40], [0, 1], clamp);
  const o = interpolate(frame, [out - 6, out], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      {frame >= calmAt && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 400,
            transform: `translate(-50%, ${-10 * Math.sin(frame / 20)}px)`,
            fontFamily: F.fat,
            fontSize: 200,
            color: '#5E7A86',
            opacity: calm,
            letterSpacing: 10 + 20 * calm,
            whiteSpace: 'nowrap',
          }}
        >
          so calm
        </div>
      )}
      {frame >= boringAt && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 640,
            transform: `translate(-50%, ${sag * 30}px) rotate(${sag * 7}deg)`,
            transformOrigin: 'left center',
            fontFamily: F.italic,
            fontStyle: 'italic',
            fontSize: 110,
            color: C.fade,
            opacity: bor,
          }}
        >
          …almost boring.
        </div>
      )}
    </div>
  );
};
