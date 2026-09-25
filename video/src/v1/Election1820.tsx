import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Arrow, Counter, Figure, Handwriting, Newspaper} from '../components/Props';
import {CHAPTER_SECONDS, SceneShell, Sfx} from '../components/Scene';
import {Label, Scrap, Source} from '../components/Scrap';
import {DateTag, Rise, Stamp, VocabCard} from '../components/Type';
import {clamp, pop} from '../lib/anim';
import {C, F} from '../lib/theme';
import {makeTimeline, Narration} from '../lib/timing';
import narration from '../../public/audio/v1_s2_election_1820.words.json';

const N = narration as Narration;
export const ELECTION_1820_SECONDS = CHAPTER_SECONDS + N.duration + 0.5;

/** Chapter 1: The Election Nobody Lost (1820). */
export const Election1820: React.FC<{captions: boolean}> = ({captions}) => {
  const {fps} = useVideoConfig();
  const tl = makeTimeline(N, fps);
  const lead = Math.round(CHAPTER_SECONDS * fps);
  const at = tl.at;
  // music: warm bed under everything; cuts out for the crickets gag, then comes back
  const crick = at('nobody else signs up');
  const musicVolume = (f: number) =>
    interpolate(f - lead, [-lead, -lead + 10, crick - 6, crick, at('He won every') - 4, at('He won every') + 6], [0, 0.2, 0.2, 0, 0, 0.2], clamp) * 0.8;
  return (
    <SceneShell
      narration={N}
      audio="audio/v1_s2_election_1820.wav"
      music="music/good_feelings.mp3"
      musicVolume={musicVolume}
      captions={captions}
      chapter={{number: 'One', title: 'The Election Nobody Lost', year: '1820'}}
    >
      <Body />
    </SceneShell>
  );
};

const Body: React.FC = () => {
  const {fps} = useVideoConfig();
  const tl = makeTimeline(N, fps);
  const at = tl.at;
  const B = at('Then after');
  const Cb = at('Federalists fell');
  const D = at('That left');
  const E = at('Americans dont vote');
  const Fb = at('In 1820');
  const G = at('He won every');
  const H = at('A New Hampshire');
  const I = at('For years people said');
  const J = at('What Plumer actually');
  const K = at('But one party');

  return (
    <>
      {/* ============ A: two parties ============ */}
      <Stamp text="TWO POLITICAL PARTIES" at={at('two political parties')} out={B} x={960} y={96} size={64} rot={-1} />
      <Scrap src="cut/hamilton.png" x={230} y={190} w={420} rot={-2.5} in={at('Federalists')} out={B} from="left">
        <Label name="FEDERALISTS" sub="Alexander Hamilton's party" at={at('Federalists') + 4} y="101%" />
      </Scrap>
      <Rise at={at('and the Democratic-Republicans')} out={B} x={960} y={430} align="center" size={96} font={F.italic} color={C.inkSoft}>
        <i>vs.</i>
      </Rise>
      <Scrap src="cut/jefferson.png" x={1270} y={190} w={460} rot={2.5} in={at('Democratic-Republicans')} out={B} from="right">
        <Label name="DEMOCRATIC-REPUBLICANS" sub="Thomas Jefferson's party" at={at('Democratic-Republicans') + 6} y="101%" size={36} />
      </Scrap>

      {/* ============ B: the War of 1812 ============ */}
      <Scrap src="cut/new_orleans.png" x={80} y={120} w={900} rot={-1.5} in={B + 2} out={Cb} from="left">
        <Source text="Battle of New Orleans, 1815 — painted by a soldier who was there" at={B + 14} />
        <Label name="BATTLE OF NEW ORLEANS" sub="Andrew Jackson's big win, 1815" at={at('second war') + 4} y="100%" size={34} />
      </Scrap>
      <VocabCard
        term="War of 1812"
        say="1812–1815"
        pos="war"
        label="KEY EVENT"
        defFrom="America's second war against Britain"
        defWords={5}
        at={at('War of 1812') - 3}
        out={Cb}
        tl={tl}
        x={1060}
        y={170}
        w={780}
        termSize={112}
      />

      {/* ============ C: the Federalists fall apart ============ */}
      <FallingWord word="FEDERALISTS" at={Cb} breakAt={tl.end('fell apart') + 2} />
      <Scrap src="cut/hartford.png" x={140} y={170} w={960} rot={-1.5} in={at('They had opposed')} out={D} from="bottom">
        <Source text="1814 cartoon mocking Federalists who opposed the war" at={at('They had opposed') + 10} />
      </Scrap>
      <Rise at={at('They had opposed')} out={D} x={1180} y={200} size={58}>
        They <b>opposed</b> the war.
      </Rise>
      <Stamp text="“WE WON!”" at={at('felt like')} out={D} x={1480} y={410} size={120} color={C.red} rot={-5} />
      <Sfx src="crowd_cheer" at={at('felt like')} volume={0.35} />
      <Stamp
        text="ROOTED AGAINST IT"
        at={at('rooted against')}
        out={D}
        x={1480}
        y={620}
        size={58}
        color={C.paperLight}
        rot={3}
        style={{background: C.ink, padding: '14px 30px 18px'}}
      />

      {/* ============ D: one party, Monroe, the Era of Good Feelings ============ */}
      <Stamp text="ONE PARTY" at={at('one party')} out={E} x={470} y={120} size={104} rot={-2} />
      <Scrap src="cut/monroe.png" x={200} y={220} w={540} rot={-2} in={at('very popular')} out={E} from="bottom">
        <Label name="JAMES MONROE" sub="5th president, 1817–1825" at={at('James Monroe')} y="100%" />
      </Scrap>
      <PaperPiece at={at('Newspapers called')} out={E} x={900} y={170}>
        <Source
          text="the phrase ran in Boston's Columbian Centinel, July 1817"
          tag="RECREATION"
          at={at('Newspapers called') + 10}
          y={-46}
        />
        <Newspaper masthead="Columbian Centinel." dateline="July 12, 1817" headline="ERA OF GOOD FEELINGS" headAt={at('Era of Good Feelings')} width={880} />
      </PaperPiece>

      {/* ============ E: electors and the Electoral College ============ */}
      <ElectorDiagram tl={tl} out={Fb} />
      <VocabCard
        term="elector"
        say="ih-LEK-ter"
        pos="noun"
        defFrom="people who cast the official votes"
        defWords={6}
        at={at('electors') - 3}
        out={at('Electoral College') - 8}
        tl={tl}
        x={1230}
        y={150}
        w={650}
        termSize={120}
      />
      <VocabCard
        term="Electoral College"
        say="ih-LEK-ter-ul KOL-ij"
        pos="noun"
        def="all the electors together — the group that officially chooses the president."
        at={at('Electoral College') - 4}
        out={Fb}
        tl={tl}
        x={1230}
        y={150}
        w={650}
        termSize={84}
      />

      {/* ============ F: no opponent; the sign-up sheet ============ */}
      <DateTag years={[[Fb, '1820']]} out={K} />
      <PaperPiece at={Fb + 2} out={G} x={130} y={150} rot={-2}>
        <Ballot noOpponentAt={at('no real opponent')} />
      </PaperPiece>
      <PaperPiece at={at('Imagine running')} out={G} x={1010} y={170} rot={2.5} from="right">
        <SignUp at={at('Imagine running') + 6} />
      </PaperPiece>
      <Sfx src="crickets" at={at('nobody else signs up') + 18} volume={0.45} />

      {/* ============ G: 231 to 1 ============ */}
      <Tally at={G} oneAt={at('but one')} out={H} />

      {/* ============ H: Plumer's vote ============ */}
      <Scrap src="cut/plumer.png" x={130} y={180} w={500} rot={-3} in={H} out={K} from="left">
        <Source text="Charles Saint-Mémin, 1806" at={H + 10} />
        <Label name="WILLIAM PLUMER" sub="an elector from New Hampshire" at={at('William Plumer')} y="100%" />
      </Scrap>
      <PaperPiece at={at('voted for')} out={I} x={680} y={300} rot={-1}>
        <div style={{width: 660, background: C.paperLight, padding: '26px 36px 34px', boxShadow: '8px 14px 24px rgba(45,28,10,0.4)', border: `2px solid ${C.ink}`}}>
          <div style={{fontFamily: F.sc, fontSize: 30, color: C.inkSoft, letterSpacing: 3}}>Elector's vote · 1820</div>
          <div style={{fontFamily: F.italic, fontStyle: 'italic', fontSize: 36, color: C.ink, margin: '14px 0 4px'}}>For President:</div>
          <div style={{borderBottom: `2px solid ${C.ink}`, height: 96}}>
            <Handwriting text="John Quincy Adams" at={at('someone else')} dur={30} size={70} />
          </div>
        </div>
      </PaperPiece>
      <Sfx src="quill" at={at('someone else')} volume={0.7} />
      <Scrap src="cut/jqa.png" x={1360} y={170} w={440} rot={3} in={at('John Quincy Adams')} out={I} from="right">
        <Label name="JOHN QUINCY ADAMS" sub="Monroe's own Secretary of State" at={at('John Quincy Adams') + 6} y="100%" size={34} />
      </Scrap>

      {/* ============ I: the legend ============ */}
      <Stamp text="THE LEGEND" at={I} out={K} x={990} y={120} size={80} color={C.inkSoft} rot={-2} />
      <LegendStrike at={J} out={K} />
      <Scrap src="cut/washington.png" x={770} y={250} w={400} rot={2} in={at('George Washington')} out={J} from="top">
        <Source text="Gilbert Stuart, 1803" at={at('George Washington') + 8} />
        <Label name="GEORGE WASHINGTON" sub="elected with every vote, twice" at={at('George Washington') + 8} y="100%" size={32} />
      </Scrap>
      <VocabCard
        term="unanimous"
        say="yoo-NAN-uh-mus"
        pos="adj."
        def="everyone agrees — not a single vote against."
        at={at('unanimously') - 2}
        out={J}
        tl={tl}
        x={1275}
        y={230}
        w={600}
        termSize={96}
      />

      {/* ============ J: what Plumer actually said ============ */}
      <Stamp text="WHAT HE ACTUALLY SAID" at={J} out={K} x={1350} y={300} size={54} rot={-1.5} />
      <Rise at={at('he thought Monroe')} out={K} x={900} y={400} size={62} font={F.body}>
        He thought Monroe was doing a
      </Rise>
      <Stamp text="BAD JOB." at={at('bad job')} out={K} x={1350} y={580} size={150} color={C.red} rot={-4} />

      {/* ============ K: the good feelings end ============ */}
      <PaperPiece at={K} x={520} y={150} from="drop">
        <Newspaper
          masthead="Columbian Centinel."
          dateline="July 12, 1817"
          headline="ERA OF GOOD FEELINGS"
          headAt={K - 30}
          width={880}
          tearAt={at('ended fast') + 4}
        />
      </PaperPiece>
      <Sfx src="whoosh" at={at('ended fast') + 4} volume={0.6} />
      <Rival src="cut/jackson_sully.png" name="JACKSON" x={70} y={110} rot={-4} at={at('everyone in that')} />
      <Rival src="cut/jqa.png" name="ADAMS" x={1540} y={110} rot={4} at={at('everyone in that') + 6} />
      <Rival src="cut/crawford.png" name="CRAWFORD" x={90} y={520} rot={3} at={at('that one party') + 2} />
      <Rival src="cut/clay.png" name="CLAY" x={1550} y={520} rot={-3} at={at('that one party') + 8} />
      <Stamp text="WANTED HIS JOB" at={at('wanted his job')} x={960} y={800} size={70} color={C.paperLight} rot={-2}
        style={{background: C.red, padding: '12px 30px 16px'}} />
    </>
  );
};

/** Any element that slides or drops onto the page like a scrap. */
const PaperPiece: React.FC<{at: number; out?: number; x: number; y: number; rot?: number; from?: 'left' | 'right' | 'drop'; children: React.ReactNode}> = ({
  at,
  out,
  x,
  y,
  rot = 0,
  from = 'drop',
  children,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at - 1 || (out !== undefined && frame > out + 25)) return null;
  const s = pop(frame, at, fps, 120, 17);
  const o = out === undefined ? 0 : pop(frame, out, fps, 140, 20);
  const dx = from === 'left' ? -1500 * (1 - s) : from === 'right' ? 1500 * (1 - s) : 0;
  const sc = from === 'drop' ? 1 + 0.2 * (1 - s) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${dx}px, ${o * 1200}px) rotate(${rot}deg) scale(${sc})`,
        opacity: Math.min(1, s * 1.8),
      }}
    >
      {children}
    </div>
  );
};

/** A word stamped on the page that cracks in two and falls off the bottom. */
const FallingWord: React.FC<{word: string; at: number; breakAt: number}> = ({word, at, breakAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > breakAt + 50) return null;
  const s = pop(frame, at, fps, 420, 20);
  const t = Math.max(0, frame - breakAt);
  const g = (t * t) / 2.2;
  const style: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: 380,
    fontFamily: F.slab,
    fontSize: 190,
    color: C.ink,
    whiteSpace: 'nowrap',
    filter: 'url(#ink)',
  };
  const half = (side: 'l' | 'r') => (
    <div
      style={{
        ...style,
        clipPath: side === 'l' ? 'polygon(0 0, 49% 0, 53% 45%, 47% 100%, 0 100%)' : 'polygon(49% 0, 100% 0, 100% 100%, 47% 100%, 53% 45%)',
        transform: `translate(-50%, -50%) translate(${side === 'l' ? -t * 4 : t * 4}px, ${g}px) rotate(${side === 'l' ? -t * 1.4 : t * 1.8}deg) scale(${1 + 1.3 * (1 - s)})`,
        opacity: Math.min(1, s * 3),
      }}
    >
      {word}
    </div>
  );
  return (
    <>
      <Sfx src="stamp" at={at} volume={0.5} frames={20} />
      {half('l')}
      {half('r')}
    </>
  );
};

/** Voters -> electors -> president, with the "not directly" shortcut struck out. */
const ElectorDiagram: React.FC<{tl: ReturnType<typeof makeTimeline>; out: number}> = ({tl, out}) => {
  const frame = useCurrentFrame();
  const at = tl.at;
  const start = at('Americans dont vote');
  if (frame < start || frame > out + 12) return null;
  const o = interpolate(frame, [out, out + 10], [1, 0], clamp);
  const eAt = at('electors');
  const cAt = at('Electoral College');
  const direct = at('directly');
  const box = interpolate(frame, [cAt, cAt + 12], [0, 1], clamp);
  const voters = Array.from({length: 9}, (_, i) => 330 + i * 80);
  const electors = [490, 640, 790];
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <svg width={1920} height={1080} style={{position: 'absolute', filter: 'url(#ink)'}}>
        {voters.map((x, i) => (
          <Figure key={x} x={x} y={250} s={0.9} at={start + i * 2} color={C.inkSoft} />
        ))}
        {/* the shortcut that does not exist */}
        <Arrow x1={1080} y1={220} x2={1080} y2={690} at={start + 20} color={C.red} w={6} />
        {frame >= direct && (
          <g transform={`translate(1080 450) scale(${Math.min(1, (frame - direct) / 6)})`}>
            <line x1={-45} y1={-45} x2={45} y2={45} stroke={C.red} strokeWidth={14} strokeLinecap="round" />
            <line x1={45} y1={-45} x2={-45} y2={45} stroke={C.red} strokeWidth={14} strokeLinecap="round" />
          </g>
        )}
        {electors.map((x, i) => (
          <Figure key={x} x={x} y={520} s={1.05} at={eAt + i * 3} ballot />
        ))}
        {electors.map((x, i) => (
          <Arrow key={`a${x}`} x1={x} y1={330} x2={x} y2={410} at={eAt + 6 + i * 3} w={5} />
        ))}
        {electors.map((x, i) => (
          <Arrow key={`b${x}`} x1={x} y1={590} x2={640 + (x - 640) * 0.2} y2={680} at={cAt + 8 + i * 3} w={5} />
        ))}
        <rect x={410} y={395} width={460} height={210} rx={24} fill="none" stroke={C.red} strokeWidth={6} strokeDasharray="14 10" opacity={box} />
      </svg>
      <DiagramLabel text="VOTERS" x={80} y={150} at={start} />
      <DiagramLabel text="ELECTORS" x={80} y={455} at={eAt} />
      <DiagramLabel text="(the Electoral College)" x={80} y={625} at={cAt} red italic />
      <PresidentBox at={cAt + 18} />
      <Rise at={direct} x={1080} y={510} align="center" size={40} font={F.italic} color={C.red} style={{whiteSpace: 'nowrap'}}>
        <i>not directly</i>
      </Rise>
    </div>
  );
};

const DiagramLabel: React.FC<{text: string; x: number; y: number; at: number; red?: boolean; italic?: boolean}> = ({text, x, y, at, red, italic}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity: interpolate(frame, [at, at + 8], [0, 1], clamp),
        fontFamily: italic ? F.italic : F.slab,
        fontStyle: italic ? 'italic' : 'normal',
        fontSize: italic ? 44 : 40,
        letterSpacing: italic ? 0 : 4,
        color: red ? C.red : C.ink,
      }}
    >
      {text}
    </div>
  );
};

const PresidentBox: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const s = pop(frame, at, fps, 260, 14);
  return (
    <div
      style={{
        position: 'absolute',
        left: 640,
        top: 740,
        transform: `translate(-50%, -50%) scale(${s})`,
        background: C.ink,
        color: C.paperLight,
        fontFamily: F.slab,
        fontSize: 48,
        letterSpacing: 6,
        padding: '12px 34px 16px',
      }}
    >
      ★ PRESIDENT ★
    </div>
  );
};

/** 1820 candidate list with one name and an empty line. */
const Ballot: React.FC<{noOpponentAt: number}> = ({noOpponentAt}) => (
  <div style={{position: 'relative', width: 760, background: C.paperLight, padding: '30px 44px 44px', boxShadow: '8px 14px 24px rgba(45,28,10,0.4)', border: `3px solid ${C.ink}`}}>
    <div style={{fontFamily: F.sc, fontSize: 30, letterSpacing: 4, color: C.inkSoft, textAlign: 'center'}}>Election of 1820</div>
    <div style={{fontFamily: F.fat, fontSize: 56, textAlign: 'center', color: C.ink, margin: '6px 0 26px', whiteSpace: 'nowrap'}}>Candidates for President</div>
    <div style={{display: 'flex', alignItems: 'center', borderBottom: `2px solid ${C.ink}`, height: 110}}>
      <span style={{fontFamily: F.slab, fontSize: 44, width: 60}}>1.</span>
      <span style={{fontFamily: F.hand, fontSize: 80}}>James Monroe</span>
    </div>
    <div style={{display: 'flex', alignItems: 'center', borderBottom: `2px solid ${C.ink}`, height: 110}}>
      <span style={{fontFamily: F.slab, fontSize: 44, width: 60}}>2.</span>
      <span style={{fontFamily: F.body, fontSize: 40, color: C.fade}}>(nobody)</span>
    </div>
    <Stamp text="NO REAL OPPONENT" at={noOpponentAt} x={420} y={345} size={62} color={C.paperLight} rot={-7} style={{background: C.red, padding: '12px 28px 16px'}} />
  </div>
);

/** A modern school sign-up sheet — the "class president" comparison. */
const SignUp: React.FC<{at: number}> = ({at}) => (
  <div
    style={{
      width: 760,
      height: 690,
      background: '#FBFAF4',
      boxShadow: '8px 14px 24px rgba(45,28,10,0.4)',
      backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 69px, #9CB6D6 69px, #9CB6D6 71px)',
      backgroundPosition: '0 150px',
      position: 'relative',
      padding: '34px 40px 0 110px',
    }}
  >
    <div style={{position: 'absolute', left: 88, top: 0, bottom: 0, width: 3, background: '#D98C8C'}} />
    <div style={{fontFamily: F.slab, fontSize: 46, color: C.ink, letterSpacing: 2}}>CLASS PRESIDENT</div>
    <div style={{fontFamily: F.body, fontSize: 32, color: C.inkSoft, marginBottom: 44}}>Sign up here!</div>
    <div style={{height: 70, display: 'flex', alignItems: 'flex-end'}}>
      <Handwriting text="James Monroe" at={at} dur={22} size={66} color="#2B3E73" />
    </div>
  </div>
);

/** Electoral vote tally: 231 to 1. */
const Tally: React.FC<{at: number; oneAt: number; out: number}> = ({at, oneAt, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > out + 12) return null;
  const s = pop(frame, at, fps, 140, 18);
  const one = pop(frame, oneAt, fps, 380, 12);
  const o = interpolate(frame, [out, out + 10], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: '50%', top: 440, transform: `translate(-50%, -50%) scale(${0.8 + 0.2 * s})`, opacity: Math.min(1, s * 2) * o}}>
      <Sfx src="stamp" at={oneAt} volume={0.5} frames={20} />
      <div style={{fontFamily: F.sc, fontSize: 40, letterSpacing: 6, color: C.inkSoft, textAlign: 'center'}}>Electoral votes · 1820</div>
      <div style={{display: 'flex', gap: 60, marginTop: 16}}>
        <div style={{width: 480, background: C.paperLight, border: `4px solid ${C.ink}`, padding: '20px 0 30px', textAlign: 'center', boxShadow: '8px 14px 24px rgba(45,28,10,0.35)'}}>
          <div style={{fontFamily: F.slab, fontSize: 46, letterSpacing: 4}}>MONROE</div>
          <div style={{fontFamily: F.fat, fontSize: 250, lineHeight: 1, color: C.ink}}>
            <Counter to={231} at={at + 4} dur={32} />
          </div>
        </div>
        <div
          style={{
            background: C.paperLight,
            border: `4px solid ${C.red}`,
            width: 480,
            padding: '20px 0 30px',
            textAlign: 'center',
            boxShadow: '8px 14px 24px rgba(45,28,10,0.35)',
            transform: `scale(${frame >= oneAt ? 0.9 + 0.1 * one : 0.9})`,
          }}
        >
          <div style={{fontFamily: F.slab, fontSize: 46, letterSpacing: 4, color: C.red}}>ANYONE ELSE</div>
          <div style={{fontFamily: F.fat, fontSize: 250, lineHeight: 1, color: C.red, opacity: frame >= oneAt ? 1 : 0.15}}>{frame >= oneAt ? 1 : 0}</div>
        </div>
      </div>
    </div>
  );
};

/** "THE LEGEND" gets a red strike when the real reason arrives. */
const LegendStrike: React.FC<{at: number; out: number}> = ({at, out}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = interpolate(frame, [at, at + 10], [0, 1], clamp);
  const o = interpolate(frame, [out, out + 8], [1, 0], clamp);
  return <div style={{position: 'absolute', left: 990 - 260, top: 116, width: 520 * p, height: 12, background: C.red, transform: 'rotate(-4deg)', opacity: o}} />;
};

/** A 1824 rival crowding in around the headline, jostling for Monroe's job. */
const Rival: React.FC<{src: string; name: string; x: number; y: number; rot: number; at: number}> = ({src, name, x, y, rot, at}) => {
  const frame = useCurrentFrame();
  const jostle = frame > at + 10 ? Math.sin((frame - at) / 3.2) * 3 : 0;
  return (
    <Scrap src={src} x={x} y={y} w={300} rot={rot + jostle} in={at} from="drop">
      <Label name={name} at={at + 4} y="100%" size={34} />
    </Scrap>
  );
};
