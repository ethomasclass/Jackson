import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {IllustrationTag, SilverCoins} from '../components/Drawn';
import {Arrow, Figure, Handwriting} from '../components/Props';
import {CHAPTER_SECONDS, SceneShell, Sfx} from '../components/Scene';
import {Label, Scrap, Source} from '../components/Scrap';
import {DateTag, Rise, Stamp, VocabCard} from '../components/Type';
import {clamp, pop, prog} from '../lib/anim';
import {C, F} from '../lib/theme';
import {makeTimeline, Narration, Timeline} from '../lib/timing';
import narration from '../../public/audio/v1_s3_judas_1824.words.json';

const N = narration as Narration;
export const JUDAS_1824_SECONDS = CHAPTER_SECONDS + N.duration + 0.5;

/** Chapter 2: The Judas of the West (1824). */
export const Judas1824: React.FC<{captions: boolean}> = ({captions}) => {
  const {fps} = useVideoConfig();
  const tl = makeTimeline(N, fps);
  const lead = Math.round(CHAPTER_SECONDS * fps);
  const ex = tl.at('Jackson exploded');
  const musicVolume = (f: number) =>
    interpolate(f - lead, [-lead, -lead + 10, ex - 4, ex + 2, ex + 30, tl.frames - 30, tl.frames + 20], [0, 0.18, 0.18, 0.26, 0.18, 0.18, 0], clamp) * 0.85;
  return (
    <SceneShell
      narration={N}
      audio="audio/v1_s3_judas_1824.wav"
      music="music/intrigue.mp3"
      musicVolume={musicVolume}
      captions={captions}
      chapter={{number: 'Two', title: 'The Judas of the West', year: '1824'}}
    >
      <Body tl={tl} />
    </SceneShell>
  );
};

const RESULTS: [string, number][] = [
  ['JACKSON', 99],
  ['ADAMS', 84],
  ['CRAWFORD', 41],
  ['CLAY', 37],
];

const Body: React.FC<{tl: Timeline}> = ({tl}) => {
  const at = tl.at;
  const A2 = at('There was Andrew');
  const B = at('Jackson won the most');
  const B2 = at('When that happens');
  const Cb = at('Clay backed Adams');
  const C2 = at('Back then');
  const D = at('Jackson exploded');
  const D2 = at('In the Bible');
  const D3 = at('Jackson wrote');
  const E = at("There's no proof");
  const E2 = at('Jackson went home');
  const speaker = at('Speaker of the House');

  return (
    <>

      {/* ============ A: four candidates ============ */}
      <Scrap src="cut/foot_race.png" x={170} y={110} w={1580} rot={-1} in={0} out={A2} from="drop" to="top" zoom={{to: 1.1, origin: '50% 45%', until: A2}}>
        <Source text="“A Foot-Race,” 1824 cartoon of the candidates racing for the presidency" at={8} />
      </Scrap>
      <Stamp text="FOUR MEN" at={at('four men')} out={A2} x={960} y={850} size={96} color={C.paperLight} rot={-2}
        style={{background: C.red, padding: '10px 36px 16px'}} />
      <Candidate src="cut/jackson_sully.png" name="ANDREW JACKSON" sub="war hero · Tennessee" x={70} rot={-2} at={A2} dimAt={speaker} out={B} />
      <Candidate src="cut/jqa.png" name="JOHN QUINCY ADAMS" sub="son of President John Adams" x={520} rot={1.5} at={at('John Quincy Adams')} dimAt={speaker} out={B} />
      <Scrap src="cut/john_adams.png" x={820} y={120} w={160} rot={8} in={at('former president John')} out={speaker} from="drop">
        <Label name="DAD" at={at('former president John') + 4} y="100%" size={24} />
      </Scrap>
      <Candidate src="cut/crawford.png" name="WILLIAM CRAWFORD" sub="Georgia · had a stroke" x={970} rot={-1} at={at('William Crawford')} dimAt={speaker} out={B} />
      <Candidate src="cut/clay.png" name="HENRY CLAY" sub="Kentucky · Speaker of the House" x={1420} rot={2} at={at('Henry Clay')} out={B} />
      <VocabCard
        term="Speaker of the House"
        say="the House's leader"
        pos="noun"
        defFrom="the leader of the House of Representatives"
        defWords={6}
        at={speaker - 2}
        out={B}
        tl={tl}
        x={140}
        y={180}
        w={900}
        termSize={78}
      />

      {/* ============ B: nobody gets a majority ============ */}
      <VoteChart tl={tl} at={B} fourthAt={at('Clay finished fourth')} out={B2} />
      <VocabCard
        term="majority"
        say="muh-JOR-ih-tee"
        pos="noun"
        defFrom="more than half"
        defWords={3}
        at={at('majority') - 2}
        out={B2}
        tl={tl}
        x={1230}
        y={170}
        w={630}
        termSize={104}
      />
      <Scrap src="cut/house_morse.png" x={80} y={120} w={1150} rot={-1} in={B2} out={Cb} from="left" zoom={{to: 1.08, origin: '50% 60%', until: Cb}}>
        <Source text="Samuel Morse, The House of Representatives, 1822" at={B2 + 10} />
        <ClayDrop at={at('ran the room')} />
      </Scrap>
      <TopThree at={at('top three')} outAt={at('Clay finished fourth')} out={Cb} />
      <Stamp text="HE RAN THE ROOM" at={at('ran the room')} out={Cb} x={1540} y={740} size={56} color={C.paperLight} rot={-3}
        style={{background: C.ink, padding: '12px 26px 16px'}} />

      {/* ============ C: the deal? ============ */}
      <Scrap src="cut/clay.png" x={130} y={150} w={400} rot={-2} in={Cb} out={C2} from="left">
        <Label name="CLAY" at={Cb + 4} y="100%" />
      </Scrap>
      <Scrap src="cut/jqa.png" x={1390} y={150} w={400} rot={2} in={Cb + 4} out={C2} from="right">
        <Label name="ADAMS" at={Cb + 8} y="100%" />
      </Scrap>
      <DealArrows tl={tl} out={C2} />
      <Stamp text="PRESIDENT" at={at('chose Adams')} out={C2} x={1590} y={120} size={60} color={C.paperLight} rot={4}
        style={{background: C.red, padding: '8px 22px 12px'}} />
      <VocabCard
        term="Secretary of State"
        say="SEK-ruh-tair-ee"
        pos="noun"
        defFrom="the country's top diplomat"
        defWords={4}
        at={at('Secretary of State') - 2}
        out={C2}
        tl={tl}
        x={600}
        y={480}
        w={720}
        termSize={80}
      />
      <SteppingStones tl={tl} at={C2} out={D} />

      {/* ============ D: the corrupt bargain, the Judas of the West ============ */}
      <Scrap src="cut/jackson_sully.png" x={140} y={130} w={560} rot={-3} in={D} out={D2} from="drop">
        <Label name="JACKSON" sub="furious" at={D + 4} y="100%" red />
      </Scrap>
      <Sfx src="boom" at={D} volume={0.35} />
      <VocabCard
        term="corrupt bargain"
        say="kuh-RUPT BAR-gin"
        pos="noun"
        def="Jackson's name for the deal he believed Adams and Clay made: the presidency for Adams, a top job for Clay."
        at={at('corrupt bargain') - 2}
        out={at('And he gave')}
        tl={tl}
        x={860}
        y={170}
        w={880}
        termSize={96}
      />
      <Scrap src="cut/clay.png" x={1120} y={170} w={440} rot={3} in={at('And he gave')} out={D2} from="right">
        <Label name="HENRY CLAY" at={at('And he gave') + 4} y="100%" />
      </Scrap>
      <Stamp text="“THE JUDAS OF THE WEST”" at={at('Judas of the West')} out={D2} x={1340} y={800} size={60} color={C.paperLight} rot={-4}
        style={{background: C.red, padding: '12px 28px 18px'}} />
      <Scrap src="cut/kiss_of_judas.png" x={170} y={140} w={520} rot={-2} in={D2} out={E} from="left">
        <Source text="Ludovico Carracci (attributed), The Kiss of Judas" at={D2 + 8} />
        <Label name="JUDAS" sub="betrayed Jesus" at={at('betrayed Jesus')} y="100%" />
      </Scrap>
      <SilverCoins at={at('thirty pieces')} out={D3} x={960} y={300} />
      <IllustrationTag x={1000} y={170} at={at('thirty pieces')} out={D3} text="coins drawn for this video" />
      <JacksonLetter at={D3} out={E} />

      {/* ============ E: no proof, but belief wins ============ */}
      <Stamp text="NO PROOF" at={at('no proof')} out={E2} x={960} y={150} size={120} rot={-2} />
      <Rise at={at('Clay said')} out={E2} x={200} y={290} size={40} font={F.sc} color={C.inkSoft}>
        Clay's reasons:
      </Rise>
      <Rise at={at('agreed on policy')} out={E2} x={200} y={350} w={980} size={50}>
        • he and Adams <b>agreed on policy</b>
      </Rise>
      <Rise at={at('hotheaded soldier')} out={E2} x={200} y={430} w={980} size={50}>
        • he thought Jackson was a <b>hotheaded soldier</b>
      </Rise>
      <BeliefScale at={at('what people believed')} out={E2} />
      <Scrap src="cut/hermitage.png" x={120} y={130} w={1000} rot={-1.5} in={E2} from="left" out={at('And by the time')}>
        <Source text="The Hermitage, Jackson's home near Nashville (print, c. 1856)" at={E2 + 10} />
      </Scrap>
      <Stamp text="RUNNING AGAIN" at={at('almost immediately')} out={at('And by the time')} x={1500} y={420} size={80} color={C.red} rot={-5} />
      <Rise at={at('almost immediately')} out={at('And by the time')} x={1500} y={520} align="center" size={46} font={F.italic} color={C.inkSoft}>
        <i>for 1828</i>
      </Rise>
      <Crowd at={at('millions of new people')} />
      <DateTag years={[[0, '1824']]} out={at('A few days later')} />
      <DateTag years={[[at('A few days later'), '1825']]} />
    </>
  );
};

const Candidate: React.FC<{src: string; name: string; sub: string; x: number; rot: number; at: number; dimAt?: number; out: number}> = ({
  src,
  name,
  sub,
  x,
  rot,
  at,
  dimAt,
  out,
}) => (
  <Scrap src={src} x={x} y={170} w={400} rot={rot} in={at} out={out} from="bottom" to="top" dim={dimAt ? [dimAt, 0.45] : undefined}>
    <Label name={name} sub={sub} at={at + 4} y="100%" size={26} />
  </Scrap>
);

/** 1824 electoral votes with the 131-vote majority line nobody reaches. */
const VoteChart: React.FC<{tl: Timeline; at: number; fourthAt: number; out: number}> = ({tl, at, fourthAt, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > out + 12) return null;
  const o = interpolate(frame, [out, out + 10], [1, 0], clamp);
  const lineAt = tl.at('majority');
  const nobody = tl.at('nobody got there');
  const scale = 4.2; // px per vote
  const base = 820;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <div style={{position: 'absolute', left: 120, top: 110, fontFamily: F.sc, fontSize: 40, letterSpacing: 4, color: C.inkSoft}}>Electoral votes · 1824</div>
      {RESULTS.map(([name, v], i) => {
        const grow = prog(frame, at + 6 + i * 5, at + 30 + i * 5);
        const h = v * scale * grow;
        const x = 150 + i * 250;
        const out4 = i === 3 && frame >= fourthAt;
        return (
          <div key={name}>
            <div style={{position: 'absolute', left: x, top: base - h, width: 170, height: h, background: i === 0 ? C.red : C.ink, opacity: out4 ? 0.25 : 1, boxShadow: '6px 8px 14px rgba(0,0,0,0.25)'}} />
            <div style={{position: 'absolute', left: x, top: base - h - 76, width: 170, textAlign: 'center', fontFamily: F.fat, fontSize: 64, color: i === 0 ? C.red : C.ink, opacity: grow * (out4 ? 0.35 : 1)}}>
              {Math.round(v * grow)}
            </div>
            <div style={{position: 'absolute', left: x - 20, top: base + 14, width: 210, textAlign: 'center', fontFamily: F.slab, fontSize: 32, color: C.ink}}>{name}</div>
            {out4 && (
              <div style={{position: 'absolute', left: x - 10, top: base - 150, transform: 'rotate(-8deg)', border: `5px solid ${C.red}`, color: C.red, fontFamily: F.slab, fontSize: 40, padding: '2px 14px'}}>
                4TH — OUT
              </div>
            )}
          </div>
        );
      })}
      {frame >= lineAt && (
        <>
          <div style={{position: 'absolute', left: 110, top: base - 131 * scale, width: 1000 * prog(frame, lineAt, lineAt + 16), borderTop: `5px dashed ${C.red}`}} />
          <div style={{position: 'absolute', left: 120, top: base - 131 * scale - 52, fontFamily: F.slab, fontSize: 36, color: C.red, opacity: prog(frame, lineAt + 10, lineAt + 18), whiteSpace: 'nowrap'}}>
            131 NEEDED
          </div>
        </>
      )}
      {frame >= nobody && (
        <Stamp text="NOBODY GOT THERE" at={nobody} x={640} y={280} size={70} color={C.paperLight} rot={-4} style={{background: C.red, padding: '10px 26px 16px'}} />
      )}
    </div>
  );
};

/** The House picks from the top three; Clay is struck off. */
const TopThree: React.FC<{at: number; outAt: number; out: number}> = ({at, outAt, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > out + 12) return null;
  const s = pop(frame, at, fps, 140, 18);
  const o = interpolate(frame, [out, out + 10], [1, 0], clamp);
  const strike = prog(frame, outAt, outAt + 10);
  return (
    <div style={{position: 'absolute', left: 1300, top: 150, width: 520, opacity: o * Math.min(1, s * 2), transform: `translateX(${(1 - s) * 400}px)`}}>
      <div style={{background: C.paperLight, border: `3px solid ${C.ink}`, padding: '24px 34px', boxShadow: '8px 14px 24px rgba(45,28,10,0.35)'}}>
        <div style={{fontFamily: F.sc, fontSize: 30, letterSpacing: 3, color: C.inkSoft}}>The House may choose from</div>
        <div style={{fontFamily: F.fat, fontSize: 56, color: C.ink, marginBottom: 10}}>the top three</div>
        {['Jackson', 'Adams', 'Crawford', 'Clay'].map((n, i) => (
          <div key={n} style={{position: 'relative', fontFamily: F.body, fontSize: 46, color: i === 3 ? C.fade : C.ink, lineHeight: 1.35}}>
            {i + 1}. {n}
            {i === 3 && <div style={{position: 'absolute', left: 0, top: '52%', width: `${strike * 60}%`, height: 5, background: C.red}} />}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Speaker Clay drops into the chamber, at the rostrum. */
const ClayDrop: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const s = pop(frame, at, fps, 260, 14);
  return (
    <div style={{position: 'absolute', left: '44%', top: '20%', width: 150, transform: `translateY(${(1 - s) * -300}px) rotate(-4deg)`}}>
      <Img src={staticFile('cut/clay.png')} style={{width: '100%', filter: 'drop-shadow(4px 8px 10px rgba(0,0,0,0.5))'}} />
    </div>
  );
};

/** Clay -> backs -> Adams; then Adams -> Secretary of State -> Clay. */
const DealArrows: React.FC<{tl: Timeline; out: number}> = ({tl, out}) => {
  const frame = useCurrentFrame();
  if (frame < tl.at('Clay backed Adams') || frame > out + 12) return null;
  const o = interpolate(frame, [out, out + 10], [1, 0], clamp);
  const a1 = tl.at('backed Adams');
  const a2 = tl.at('named Clay');
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <svg width={1920} height={1080} style={{position: 'absolute', filter: 'url(#ink)'}}>
        <Arrow x1={570} y1={260} x2={1350} y2={260} at={a1} color={C.ink} w={8} />
        <Arrow x1={1350} y1={400} x2={570} y2={400} at={a2} color={C.red} w={8} />
      </svg>
      <Rise at={a1 + 6} x={960} y={190} align="center" size={46} font={F.slab}>
        CLAY'S SUPPORT
      </Rise>
      <Rise at={a2 + 6} x={960} y={330} align="center" size={46} font={F.slab} color={C.red}>
        A TOP JOB
      </Rise>
    </div>
  );
};

/** Four of the first six presidents climbed from Secretary of State. */
const SteppingStones: React.FC<{tl: Timeline; at: number; out: number}> = ({tl, at, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > out + 12) return null;
  const o = interpolate(frame, [out, out + 10], [1, 0], clamp);
  const four = tl.at('Four of the first');
  const people: [string, string][] = [
    ['cut/jefferson.png', 'JEFFERSON'],
    ['cut/madison.png', 'MADISON'],
    ['cut/monroe.png', 'MONROE'],
    ['cut/jqa.png', 'J. Q. ADAMS'],
  ];
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <Stamp text="STEPPING-STONE TO THE PRESIDENCY" at={tl.at('stepping-stone')} x={960} y={80} size={50} rot={-1} />
      {people.map(([src, name], i) => {
        const s = pop(frame, four + i * 6, fps, 200, 15);
        const x = 200 + i * 400;
        const top = 800 - i * 105;
        return (
          <div key={name}>
            <div style={{position: 'absolute', left: x - 30, top, width: 330, height: 1080 - top, background: C.inkSoft, opacity: 0.85 * prog(frame, at + i * 4, at + 14 + i * 4), boxShadow: 'inset 0 6px 0 rgba(255,255,255,0.15)'}} />
            {frame >= four + i * 6 && (
              <div style={{position: 'absolute', left: x + 20, top: top - 270, width: 220, transform: `translateY(${(1 - s) * -200}px)`, opacity: Math.min(1, s * 2)}}>
                <Img src={staticFile(src)} style={{width: '100%', filter: 'drop-shadow(4px 8px 10px rgba(0,0,0,0.4))'}} />
                <div style={{fontFamily: F.slab, fontSize: 28, textAlign: 'center', color: C.paperLight, background: C.ink, marginTop: -8, padding: '4px 0'}}>{name}</div>
              </div>
            )}
          </div>
        );
      })}
      <Rise at={four} x={960} y={130} align="center" size={40} font={F.sc} color={C.inkSoft} style={{whiteSpace: 'nowrap'}}>
        Secretary of State ➜ President
      </Rise>
    </div>
  );
};

/** Jackson's own words, from his letter of February 14, 1825. */
const JacksonLetter: React.FC<{at: number; out: number}> = ({at, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > out + 12) return null;
  const s = pop(frame, at, fps, 140, 17);
  const o = interpolate(frame, [out, out + 10], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 760, top: 180, width: 1040, opacity: o * Math.min(1, s * 2), transform: `translateY(${(1 - s) * 60}px) rotate(1deg)`}}>
      <div style={{background: '#F3EAD3', padding: '34px 46px 40px', boxShadow: '8px 14px 24px rgba(45,28,10,0.4)', border: `1px solid ${C.inkSoft}`}}>
        <div style={{fontFamily: F.sc, fontSize: 26, color: C.inkSoft, letterSpacing: 2, marginBottom: 12}}>Jackson, in a letter · February 14, 1825</div>
        <div style={{lineHeight: 1.25}}>
          <Handwriting text="“…the Judas of the West has closed" at={at + 6} dur={28} size={58} />
          <br />
          <Handwriting text="the contract and will receive" at={at + 34} dur={24} size={58} />
          <br />
          <Handwriting text="the thirty pieces of silver.”" at={at + 58} dur={24} size={58} color={C.red} />
        </div>
      </div>
      <Sfx src="quill" at={at + 6} volume={0.5} />
    </div>
  );
};

/** "What people believed" outweighs "what happened". */
const BeliefScale: React.FC<{at: number; out: number}> = ({at, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > out + 12) return null;
  const tip = pop(frame, at + 10, fps, 80, 10);
  const o = interpolate(frame, [out, out + 10], [1, 0], clamp);
  const ang = -14 * tip;
  return (
    <div style={{position: 'absolute', left: 1280, top: 420, width: 520, height: 520, opacity: o}}>
      <svg width={520} height={520} viewBox="0 0 520 520" style={{overflow: 'visible', filter: 'url(#ink)'}}>
        <line x1={260} y1={60} x2={260} y2={460} stroke={C.ink} strokeWidth={10} />
        <path d="M180,470 L340,470 L300,440 L220,440 Z" fill={C.ink} />
        <g transform={`rotate(${ang} 260 80)`}>
          <line x1={40} y1={80} x2={480} y2={80} stroke={C.ink} strokeWidth={9} />
          <path d="M40,80 L0,220 M40,80 L80,220 M480,80 L440,220 M480,80 L520,220" stroke={C.ink} strokeWidth={3} />
          <path d="M-10,220 Q40,250 90,220 Z" fill={C.ink} />
          <path d="M430,220 Q480,250 530,220 Z" fill={C.ink} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 40 - 150, top: 250 + 53 * tip, width: 300, textAlign: 'center', fontFamily: F.slab, fontSize: 32, color: C.red, lineHeight: 1.05}}>
        WHAT PEOPLE BELIEVED
      </div>
      <div style={{position: 'absolute', left: 480 - 150, top: 250 - 53 * tip, width: 300, textAlign: 'center', fontFamily: F.italic, fontStyle: 'italic', fontSize: 30, color: C.inkSoft}}>
        what happened
      </div>
    </div>
  );
};

/** A crowd of new voters pouring onto the page — the hand-off to 1828. */
const Crowd: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const figs = Array.from({length: 60}, (_, i) => ({x: 60 + (i % 20) * 92 + ((i * 37) % 30), y: 560 + Math.floor(i / 20) * 130 + ((i * 13) % 20), t: at + (i % 20) * 1.2 + Math.floor(i / 20) * 4}));
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, filter: 'url(#ink)'}}>
      {figs.map((f, i) => (
        <Figure key={i} x={f.x} y={f.y} s={0.85} at={f.t} color={i % 7 === 0 ? C.red : C.inkSoft} />
      ))}
    </svg>
  );
};
