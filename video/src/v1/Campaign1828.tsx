import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Coffins, IllustrationTag, PoolTable} from '../components/Drawn';
import {Figure, Pictograph} from '../components/Props';
import {CHAPTER_SECONDS, Cue, SceneShell, Sfx} from '../components/Scene';
import {Label, Scrap, Source} from '../components/Scrap';
import {DateTag, Em, Rise, Stamp, VocabCard} from '../components/Type';
import {clamp, pop, prog} from '../lib/anim';
import {C, F} from '../lib/theme';
import {makeTimeline, Narration, Timeline} from '../lib/timing';
import narration from '../../public/audio/v1_s4_campaign_1828.words.json';

const N = narration as Narration;
export const CAMPAIGN_1828_SECONDS = CHAPTER_SECONDS + N.duration + 0.5;

/** Chapter 3: More Voters, Meaner Campaign (1828). */
export const Campaign1828: React.FC<{captions: boolean}> = ({captions}) => {
  const {fps} = useVideoConfig();
  const tl = makeTimeline(N, fps);
  const lead = Math.round(CHAPTER_SECONDS * fps);
  const rematch = lead + tl.at('rematch');
  // calm bed while the rules are explained, handing off to the campaign march at "rematch"
  const musicVolume = (f: number) => interpolate(f, [0, 10, rematch - 20, rematch + 10], [0, 0.13, 0.13, 0], clamp);
  return (
    <SceneShell
      narration={N}
      audio="audio/v1_s4_campaign_1828.wav"
      music="music/good_feelings.mp3"
      musicVolume={musicVolume}
      captions={captions}
      chapter={{number: 'Three', title: 'More Voters, Meaner Campaign', year: '1828'}}
    >
      <Body tl={tl} />
    </SceneShell>
  );
};

const Body: React.FC<{tl: Timeline}> = ({tl}) => {
  const at = tl.at;
  const A2 = at('The idea was');
  const A3 = at('Historians call this');
  const A4 = at('Most Americans still');
  const B = at('States also started');
  const B2 = at('About 365,000');
  const Cb = at('It was a rematch');
  const C2 = at("Jackson's side called");
  const C3 = at("Adams's side printed");
  const C4 = at('Then they went');
  const D = at('Jackson won in');
  const D2 = at('His style of politics');
  const E = at('But in December');
  const E2 = at('So he arrived');

  return (
    <>
      <Cue src="music/campaign.mp3" at={Cb - 10} until={E - 10} level={0.15} />
      <Cue src="music/grief.mp3" at={E - 6} until={tl.frames} level={0.16} fadeIn={40} />

      {/* ============ A: who could vote ============ */}
      <Scrap src="cut/county_election.png" x={90} y={110} w={1100} rot={-1.5} in={0} out={A2} from="drop" zoom={{to: 1.08, origin: '60% 40%', until: A2}}>
        <Source text="George Caleb Bingham, The County Election, 1852" at={8} />
      </Scrap>
      <Stamp text="WHITE MEN" at={at('white men')} out={A2} x={1540} y={300} size={96} rot={-3} />
      <Stamp text="WHO OWNED PROPERTY" at={at('owned property')} out={A2} x={1540} y={420} size={48} color={C.paperLight} rot={2}
        style={{background: C.red, padding: '10px 22px 14px'}} />
      <VocabCard term="suffrage" say="SUF-rij" pos="noun" def="the right to vote." at={at('The right to vote')} out={A2} tl={tl} x={1230} y={520} w={640} termSize={104} />

      <Rise at={A2} out={A3} x={140} y={130} size={52} w={1600}>
        The idea: owning land proved you <b>cared about your community.</b>
      </Rise>
      <RuleChange tl={tl} out={A3} />

      <VocabCard
        term="universal white male suffrage"
        say="yoo-nuh-VUR-sul"
        pos="noun"
        def="voting rights for all adult white men, whether or not they owned land."
        at={A3}
        out={A4}
        tl={tl}
        x={420}
        y={170}
        w={1080}
        termSize={80}
      />
      <Circle word="WHITE" at={at('white', 3)} out={A4} x={640} y={720} w={300} />
      <Circle word="MALE" at={at('male', 2)} out={A4} x={1040} y={720} w={240} />
      <WhoCouldVote at={A4} out={B} />

      {/* ============ B: the numbers explode ============ */}
      <Rise at={B} out={B2} x={960} y={200} align="center" size={48} font={F.sc} color={C.inkSoft} style={{whiteSpace: 'nowrap'}}>
        Who chose a state's electors?
      </Rise>
      <PickElectors tl={tl} out={B2} />
      <VoterGrowth tl={tl} at={B2} out={Cb} />

      {/* ============ C: the nastiest campaign ============ */}
      <Scrap src="cut/jackson_sully.png" x={160} y={150} w={460} rot={-3} in={Cb} out={C2} from="left">
        <Label name="JACKSON" at={Cb + 4} y="100%" />
      </Scrap>
      <Scrap src="cut/jqa.png" x={1300} y={150} w={460} rot={3} in={Cb + 3} out={C3} from="right">
        <Label name="ADAMS" at={Cb + 7} y="100%" />
      </Scrap>
      <Stamp text="REMATCH" at={at('rematch')} out={C2} x={960} y={380} size={130} color={C.red} rot={-4} />
      <Stamp text="NASTIEST CAMPAIGN" at={at('nastiest campaigns')} out={C2} x={960} y={560} size={56} color={C.paperLight} rot={2}
        style={{background: C.ink, padding: '10px 24px 14px'}} />
      <Stamp text="“SPOILED RICH SNOB”" at={at('spoiled rich snob')} out={C3} x={700} y={260} size={58} color={C.red} rot={-4} />
      <Rise at={at('gambling device')} out={C3} x={180} y={360} size={52} font={F.italic}>
        <i>“a gambling device”</i>
      </Rise>
      <PoolTable at={at('gambling device') + 4} out={C3} x={200} y={460} w={620} />
      <IllustrationTag x={220} y={430} at={at('gambling device') + 4} out={C3} text="pool table drawn for this video" />
      <Stamp text="IT WAS A POOL TABLE" at={at('pool table')} out={C3} x={700} y={860} size={48} color={C.paperLight} rot={-2}
        style={{background: C.ink, padding: '10px 22px 14px'}} />
      <Stamp text="HE PAID FOR IT HIMSELF" at={at('paid for it himself')} out={C3} x={1520} y={760} size={44} color={C.red} rot={3} />

      <Scrap src="cut/coffin_handbill.png" x={140} y={90} w={640} rot={-2} in={C3} out={C4} from="left" zoom={{to: 1.25, origin: '50% 30%', until: C4}}>
        <Source text="The Coffin Handbill, 1828" at={C3 + 10} />
      </Scrap>
      <Coffins at={at('black coffins')} out={C4} x={880} y={250} />
      <Sfx src="gavel" at={at('black coffins')} volume={0.25} />
      <Rise at={at('one for each soldier')} out={C4} x={880} y={500} w={920} size={48}>
        One coffin for each militiaman Jackson had ordered <Em>executed for deserting</Em> in the War of 1812.
      </Rise>

      <Scrap src="cut/rachel.png" x={150} y={150} w={520} rot={-2} in={C4} out={D} from="bottom">
        <Label name="RACHEL JACKSON" at={C4 + 6} y="100%" red />
      </Scrap>
      <MarriageTimeline at={at('Years earlier')} out={at('Adams supporters called')} />
      <VocabCard
        term="bigamist"
        say="BIG-uh-mist"
        pos="noun"
        defFrom="someone married to two people at once"
        defWords={7}
        at={at('bigamist') - 2}
        out={D}
        tl={tl}
        x={880}
        y={220}
        w={780}
        termSize={120}
      />

      {/* ============ D: landslide; the Democratic Party; Jacksonian Democracy ============ */}
      <Landslide tl={tl} at={D} out={D2} />
      <Scrap src="cut/stump_speaking.png" x={80} y={110} w={1080} rot={-1.5} in={D2} out={E} from="left">
        <Source text="George Caleb Bingham, Stump Speaking, 1853–54" at={D2 + 10} />
      </Scrap>
      <Rise at={at('rallies')} out={E} x={1230} y={170} size={60} font={F.slab}>RALLIES</Rise>
      <Rise at={at('parades')} out={E} x={1230} y={250} size={60} font={F.slab}>PARADES</Rise>
      <Rise at={at("I'm one of you")} out={E} x={1230} y={330} size={60} font={F.italic} color={C.red}>
        <i>“I'm one of you.”</i>
      </Rise>
      <VocabCard
        term="Jacksonian Democracy"
        say="jak-SOH-nee-un"
        pos="noun"
        def="Jackson's style of politics: rallies, parades and a candidate who says he is one of the ordinary voters."
        at={at('Jacksonian Democracy') - 4}
        out={E}
        tl={tl}
        x={1180}
        y={440}
        w={700}
        termSize={70}
      />

      {/* ============ E: Rachel dies ============ */}
      <Mourning tl={tl} at={E} out={E2} />
      <Stamp text="GRIEVING" at={at('grieving')} x={960} y={300} size={110} color={C.inkSoft} rot={-2} />
      <Stamp text="ANGRY" at={at('angry')} x={960} y={470} size={130} color={C.red} rot={2} />
      <Stamp text="READY TO SHAKE THINGS UP" at={at('ready to shake')} x={960} y={640} size={70} rot={-1.5} />
      <DateTag years={[[Cb, '1828']]} out={E} />
    </>
  );
};

/** Western states and city workers break the property rule. */
const RuleChange: React.FC<{tl: Timeline; out: number}> = ({tl, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = tl.at('But new western');
  if (frame < start || frame > out + 12) return null;
  const o = interpolate(frame, [out, out + 10], [1, 0], clamp);
  const strike = prog(frame, tl.at('dropped the property'), tl.at('dropped the property') + 12);
  const sign = pop(frame, start, fps, 160, 16);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <div style={{position: 'absolute', left: 1180, top: 300, transform: `rotate(-3deg) scale(${sign})`, background: C.paperLight, border: `5px solid ${C.ink}`, padding: '26px 40px', boxShadow: '8px 14px 24px rgba(45,28,10,0.35)', textAlign: 'center'}}>
        <div style={{fontFamily: F.sc, fontSize: 32, color: C.inkSoft}}>To vote, you must own</div>
        <div style={{fontFamily: F.fat, fontSize: 96, color: C.ink, position: 'relative'}}>
          PROPERTY
          <div style={{position: 'absolute', left: -20, top: '50%', width: `${strike * 110}%`, height: 14, background: C.red, transform: 'rotate(-6deg)'}} />
        </div>
      </div>
      <Rise at={start} x={140} y={300} size={46} w={950}>
        • New <b>western states</b> needed settlers: <Em>no land required.</Em>
      </Rise>
      <Rise at={tl.at('City workers')} x={140} y={420} size={46} w={950}>
        • <b>City workers</b> paid taxes and fought in wars. <Em>Why not us?</Em>
      </Rise>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, filter: 'url(#ink)'}}>
        {Array.from({length: 7}, (_, i) => (
          <Figure key={i} x={200 + i * 110} y={700} s={1} at={tl.at('City workers') + i * 2} color={C.ink} />
        ))}
      </svg>
    </div>
  );
};

/** A word stamped on the page with a red ring drawn round it. */
const Circle: React.FC<{word: string; at: number; out: number; x: number; y: number; w: number}> = ({word, at, out, x, y, w}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > out + 10) return null;
  const p = prog(frame, at + 6, at + 18);
  const o = interpolate(frame, [out, out + 8], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: 130, opacity: o}}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.slab, fontSize: 84, color: C.ink, opacity: Math.min(1, (frame - at) / 4)}}>{word}</div>
      <svg width={w + 60} height={170} style={{position: 'absolute', left: -30, top: -20, overflow: 'visible', filter: 'url(#ink)'}}>
        <ellipse cx={(w + 60) / 2} cy={85} rx={w / 2 + 24} ry={68} fill="none" stroke={C.red} strokeWidth={8} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} transform={`rotate(-4 ${(w + 60) / 2} 85)`} />
      </svg>
    </div>
  );
};

/** Who still could not vote. */
const WhoCouldVote: React.FC<{at: number; out: number}> = ({at, out}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > out + 12) return null;
  const o = interpolate(frame, [out, out + 10], [1, 0], clamp);
  const groups: [string, number, string][] = [
    ['white men', 2, C.ink],
    ['women', 4, C.fade],
    ['enslaved people', 2, C.fade],
    ['Native Americans', 1, C.fade],
    ['most free Black men', 1, C.fade],
  ];
  let i = 0;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <Stamp text="MOST AMERICANS STILL COULDN'T VOTE" at={at} x={960} y={130} size={56} rot={-1} />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, filter: 'url(#ink)'}}>
        {groups.flatMap(([, n, color]) =>
          Array.from({length: n}, () => {
            const k = i++;
            return <Figure key={k} x={300 + k * 145} y={450} s={1.3} at={at + 6 + k * 3} color={color} />;
          }),
        )}
      </svg>
      {(() => {
        let k = 0;
        return groups.map(([label, n]) => {
          const x0 = 300 + k * 145 - 60;
          const w = n * 145;
          k += n;
          return (
            <div key={label} style={{position: 'absolute', left: x0, top: 540, width: w, textAlign: 'center', fontFamily: label === 'white men' ? F.slab : F.italic, fontStyle: label === 'white men' ? 'normal' : 'italic', fontSize: 30, color: label === 'white men' ? C.ink : C.inkSoft, opacity: interpolate(frame, [at + 20, at + 30], [0, 1], clamp), borderTop: `3px solid ${label === 'white men' ? C.ink : C.fade}`, paddingTop: 8}}>
              {label}
              {label === 'white men' && <div style={{fontFamily: F.sc, fontSize: 24, color: C.red}}>could vote</div>}
            </div>
          );
        });
      })()}
      <Rise at={at + 30} x={960} y={700} align="center" size={34} font={F.italic} color={C.inkSoft} style={{whiteSpace: 'nowrap'}}>
        <i>(figures show groups, not exact proportions)</i>
      </Rise>
    </div>
  );
};

/** State lawmakers -> regular voters. */
const PickElectors: React.FC<{tl: Timeline; out: number}> = ({tl, out}) => {
  const frame = useCurrentFrame();
  const start = tl.at('regular voters');
  if (frame < start || frame > out + 12) return null;
  const o = interpolate(frame, [out, out + 10], [1, 0], clamp);
  const strike = prog(frame, tl.at('instead of letting'), tl.at('instead of letting') + 12);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <div style={{position: 'absolute', left: 400, top: 330, fontFamily: F.fat, fontSize: 90, color: C.fade}}>
        state lawmakers
        <div style={{position: 'absolute', left: -10, top: '52%', width: `${strike * 105}%`, height: 12, background: C.red}} />
      </div>
      <Rise at={start} x={960} y={520} align="center" size={110} font={F.fat} color={C.ink} style={{whiteSpace: 'nowrap'}}>
        regular voters
      </Rise>
    </div>
  );
};

/** 365,000 voters in 1824 vs 1.1 million in 1828, one figure per 50,000. */
const VoterGrowth: React.FC<{tl: Timeline; at: number; out: number}> = ({tl, at, out}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > out + 12) return null;
  const o = interpolate(frame, [out, out + 10], [1, 0], clamp);
  const b = tl.at('In 1828');
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <Stamp text="THE NUMBERS EXPLODED" at={at} x={960} y={90} size={64} color={C.red} rot={-2} />
      <div style={{position: 'absolute', left: 120, top: 220, fontFamily: F.fat, fontSize: 72, color: C.ink}}>1824</div>
      <div style={{position: 'absolute', left: 120, top: 300, fontFamily: F.slab, fontSize: 44, color: C.inkSoft}}>
        {frame >= tl.at('365,000') ? '365,000' : ''}
      </div>
      <Pictograph value={365000} per={50000} at={tl.at('365,000')} x={420} y={200} perRow={22} color={C.inkSoft} dur={20} />
      <div style={{position: 'absolute', left: 120, top: 460, fontFamily: F.fat, fontSize: 72, color: C.red, opacity: frame >= b ? 1 : 0}}>1828</div>
      <div style={{position: 'absolute', left: 120, top: 540, fontFamily: F.slab, fontSize: 44, color: C.red, opacity: frame >= tl.at('1.1 million') ? 1 : 0}}>1.1 MILLION</div>
      <Pictograph value={1100000} per={50000} at={b + 4} x={420} y={440} perRow={11} color={C.red} dur={40} />
      <div style={{position: 'absolute', right: 110, bottom: 170, fontFamily: F.italic, fontStyle: 'italic', fontSize: 30, color: C.inkSoft}}>
        each figure = 50,000 voters
      </div>
    </div>
  );
};

/** Married 1791, divorce final 1793, married again 1794. */
const MarriageTimeline: React.FC<{at: number; out: number}> = ({at, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > out + 12) return null;
  const o = interpolate(frame, [out, out + 10], [1, 0], clamp);
  const items: [string, string, boolean][] = [
    ['1791', 'Andrew and Rachel marry', false],
    ['1793', "her first divorce becomes final", true],
    ['1794', 'they marry again, officially', false],
  ];
  return (
    <div style={{position: 'absolute', left: 820, top: 230, opacity: o}}>
      {items.map(([y, t, red], i) => {
        const s = pop(frame, at + i * 12, fps, 180, 16);
        return (
          <div key={y} style={{display: 'flex', alignItems: 'baseline', gap: 26, marginBottom: 26, opacity: Math.min(1, s * 2), transform: `translateX(${(1 - s) * 80}px)`}}>
            <span style={{fontFamily: F.fat, fontSize: 80, color: red ? C.red : C.ink}}>{y}</span>
            <span style={{fontFamily: F.body, fontSize: 44, color: C.ink}}>{t}</span>
          </div>
        );
      })}
    </div>
  );
};

/** 1828 electoral votes: 178 to 83. */
const Landslide: React.FC<{tl: Timeline; at: number; out: number}> = ({tl, at, out}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > out + 12) return null;
  const o = interpolate(frame, [out, out + 10], [1, 0], clamp);
  const bars: [string, number, string][] = [
    ['JACKSON', 178, C.red],
    ['ADAMS', 83, C.ink],
  ];
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <div style={{position: 'absolute', left: 150, top: 130, fontFamily: F.sc, fontSize: 40, letterSpacing: 4, color: C.inkSoft}}>Electoral votes · 1828</div>
      {bars.map(([n, v, color], i) => {
        const g = prog(frame, at + 4 + i * 6, at + 30 + i * 6);
        return (
          <div key={n} style={{position: 'absolute', left: 150, top: 240 + i * 170}}>
            <div style={{fontFamily: F.slab, fontSize: 40, color}}>{n}</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
              <div style={{width: v * 4.4 * g, height: 80, background: color, boxShadow: '6px 8px 14px rgba(0,0,0,0.25)'}} />
              <span style={{fontFamily: F.fat, fontSize: 70, color}}>{Math.round(v * g)}</span>
            </div>
          </div>
        );
      })}
      <Stamp text="LANDSLIDE" at={tl.at('landslide')} x={1530} y={300} size={100} color={C.red} rot={-5} />
      <Stamp text="THE DEMOCRATIC PARTY" at={tl.at('Democratic Party')} x={960} y={720} size={70} rot={-1} />
      <Rise at={tl.at('still exists today')} x={960} y={790} align="center" size={42} font={F.italic} color={C.inkSoft} style={{whiteSpace: 'nowrap'}}>
        <i>the same party that still exists today</i>
      </Rise>
    </div>
  );
};

/** Rachel's portrait, draining to grey, with a mourning border. */
const Mourning: React.FC<{tl: Timeline; at: number; out: number}> = ({tl, at, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > out + 20) return null;
  const s = pop(frame, at, fps, 90, 20);
  const grey = prog(frame, tl.at('Rachel died'), tl.at('Rachel died') + 40);
  const o = interpolate(frame, [out, out + 16], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o * s}}>
      <div style={{position: 'absolute', left: '50%', top: 110, transform: 'translateX(-50%)', padding: 22, background: C.ink, boxShadow: '8px 14px 30px rgba(0,0,0,0.5)'}}>
        <Img src={staticFile('cut/rachel.png')} style={{display: 'block', width: 560, filter: `grayscale(${grey}) brightness(${1 - 0.1 * grey})`}} />
      </div>
      <div style={{position: 'absolute', left: '50%', top: 690, transform: 'translateX(-50%)', textAlign: 'center', whiteSpace: 'nowrap', opacity: prog(frame, tl.at('Rachel died'), tl.at('Rachel died') + 20)}}>
        <div style={{fontFamily: F.fat, fontSize: 64, color: C.ink}}>Rachel Jackson</div>
        <div style={{fontFamily: F.sc, fontSize: 34, color: C.inkSoft, letterSpacing: 3}}>died December 22, 1828</div>
      </div>
      <Rise at={tl.at('Jackson blamed')} x={960} y={850} align="center" size={40} font={F.italic} color={C.red} style={{whiteSpace: 'nowrap'}}>
        <i>He blamed his political enemies for the rest of his life.</i>
      </Rise>
    </div>
  );
};
