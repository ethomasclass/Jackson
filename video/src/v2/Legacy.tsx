import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cue, Sfx} from '../components/Scene';
import {clamp} from '../lib/anim';
import {F, P} from '../lib/theme';
import {makeTimeline, Narration} from '../lib/timing';
import {Picture, VocabTicket} from '../theater/Props';
import {NameCard, Puppet, SourceTag} from '../theater/Puppet';
import {SCENE_CARD_SECONDS, TheaterScene} from '../theater/Scene';
import {Banner15, HangingSign, Rule, Small, Wood} from '../theater/Signs';
import {Backcloth, DropCurtain, Spot, Theater, Wash, WaveRow} from '../theater/Stage';
import narration from '../../public/audio/v2_s10_legacy.words.json';

const N = narration as Narration;
const TAIL = 24;
export const END_BOARD_SECONDS = 4.5;
export const LEGACY_SECONDS = SCENE_CARD_SECONDS + N.duration + TAIL / 30 + END_BOARD_SECONDS;

/** Scene X: what the war changed and what it didn't; ends on THE END. */
export const Legacy: React.FC<{captions: boolean}> = ({captions}) => {
  const {fps} = useVideoConfig();
  const bodyEnd = Math.round((SCENE_CARD_SECONDS + N.duration) * fps) + TAIL;
  return (
    <AbsoluteFill>
      <TheaterScene narration={N} audio="audio/v2_s10_legacy.wav" captions={captions} tail={TAIL} scene={{n: 'X', title: 'Everything and Nothing', years: '1815 – 1820'}}>
        <Body />
      </TheaterScene>
      <Sequence from={bodyEnd}>
        <TheEnd />
      </Sequence>
    </AbsoluteFill>
  );
};

const TheEnd: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = Math.round(END_BOARD_SECONDS * fps);
  const drop = interpolate(frame, [0, 14], [-700, 0], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
  const o = interpolate(frame, [out - 20, out], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: o, background: '#140D09'}}>
      <Audio src={staticFile('music/v2/title_fanfare.mp3')} volume={(f) => interpolate(f, [0, 4, out - 25, out], [0, 0.45, 0.45, 0], clamp)} />
      <Theater cam={[[0, 0.93, 960, 575], [out, 0.95, 960, 575]]}>
        <DropCurtain keys={[[0, 0]]} />
      </Theater>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{transform: `translateY(${drop}px)`, minWidth: 700, padding: '30px 60px', background: `radial-gradient(ellipse at 50% 40%, #FBF3DD 0%, ${P.card} 60%, #E6D2A6 100%)`, border: `6px double ${P.ink}`, boxShadow: '14px 22px 40px rgba(0,0,0,0.6)', textAlign: 'center'}}>
          <Wood size={140} font="rye">THE END</Wood>
          <Rule color={P.vermilion} />
          <div style={{fontFamily: F.sc, fontSize: 40, letterSpacing: 4}}>The War of 1812</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Body: React.FC = () => {
  const {fps} = useVideoConfig();
  const tl = makeTimeline(N, fps);
  const at = tl.at;
  const END = tl.frames;
  const why = at('So why');
  const books = at('That pride');
  const sad = at('Not everyone');
  const fin = at("The war didn't");
  const cam: [number, number, number, number][] = [
    [0, 0.95, 960, 575],
    [at('Open up'), 1.04, 960, 560],
    [at('No territory'), 1.0, 960, 575],
    [why, 1.02, 960, 580],
    [at('The years after'), 1.04, 960, 570],
    [books, 1.0, 960, 575],
    [at('It\'s about'), 1.06, 960, 580],
    [sad, 1.12, 960, 620],
    [at('At the peace'), 1.0, 960, 575],
    [fin, 0.98, 960, 570],
    [END + 20, 0.94, 960, 575],
  ];
  return (
    <>
      <Cue src="music/v2/aftermath.mp3" at={0} until={why} level={0.13} fadeIn={20} fadeOut={30} />
      <Cue src="music/good_feelings.mp3" at={why} until={sad} level={0.14} fadeIn={30} fadeOut={30} />
      <Cue src="music/grief.mp3" at={sad} until={fin} level={0.16} fadeIn={30} fadeOut={40} />
      <Cue src="music/v2/dawn.mp3" at={fin - 10} until={END + 20} level={0.16} fadeIn={30} fadeOut={20} />
      <Sfx src="stamp" at={at('Not once')} volume={0.4} />
      <Theater cam={cam}>
        <Backcloth src="v2/scenery/harbor_dawn.jpg" />
        <Backcloth src="v2/scenery/catskills.jpg" at={books} />
        <Backcloth src="v2/scenery/wabash_woods.jpg" at={sad} />
        <Backcloth src="v2/scenery/sea_backcloth.jpg" at={fin} />

        {/* ---- the treaty: almost nothing ---- */}
        <Picture src="img/v2/ghent_forestier.jpg" at={at('Treaty of Ghent')} out={at('It restored')} x={960} y={240} w={820} source="The Signing of the Treaty of Ghent, Amédée Forestier, 1914" tag="LATER PAINTING" />
        <HangingSign at={at('almost nothing')} out={at('It restored')} x={960} y={740} w={640} tone="red" sfx={false}>
          <Wood size={70} font="ultra">ALMOST NOTHING</Wood>
        </HangingSign>
        <HangingSign at={at('No territory')} out={why} x={960} y={250} w={880}>
          <div style={{display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch', textAlign: 'left'}}>
            <Row label="TERRITORY GAINED" value="NONE" at={at('No territory')} />
            <Row label="CANADA CONQUERED" value="NOT AN INCH" at={at('never took')} sub="(Calhoun had said four weeks.)" />
            <Row label="IMPRESSMENT IN THE TREATY" value="NOT ONCE" at={at("doesn't mention")} />
          </div>
        </HangingSign>
        <Puppet src="v2/puppets/calhoun.png" x={470} y={1000} w={300} in={at("Calhoun's")} out={at('And impressment')} from="trap" bob={2} seed={2} />
        <Puppet src="v2/props/sailor_2.png" x={1560} y={940} w={110} in={at('And impressment')} out={why} from="right" bob={2} seed={4} />

        {/* ---- why it felt like victory ---- */}
        <HangingSign at={why} out={at('And because')} x={960} y={300} w={760}>
          <Wood size={64} font="rye">SO WHY DID IT FEEL</Wood>
          <Wood size={64} font="rye">LIKE A VICTORY?</Wood>
          <Wood size={50} font="ultra" color={P.vermilion} at={at('survived')} style={{marginTop: 12}}>
            THE U.S. SURVIVED
          </Wood>
          <Small size={28}>against the most powerful navy on Earth</Small>
        </HangingSign>
        <WaveRow y={900} color="#2C57A8" dark="#18306E" phase={2.4} scale={0.9} />
        <Puppet src="v2/puppets/constitution.png" x={1450} y={900} w={380} in={at('toe-to-toe')} out={at('And because')} from="right" to="left" rock={2} seed={1} />
        <HangingSign at={at('And because')} out={at('The years after')} x={960} y={300} w={820}>
          <div style={{fontFamily: F.slab, fontSize: 34, letterSpacing: 4}}>BUILDING AN AMERICAN ECONOMY</div>
          <Wood size={64} font="rye" at={at('national bank')} style={{marginTop: 10}}>A NEW NATIONAL BANK</Wood>
          <Small size={28}>chartered 1816</Small>
          <Wood size={64} font="rye" at={at('tariffs')}>TARIFFS</Wood>
          <Small size={28}>to protect American factories</Small>
        </HangingSign>
        <Puppet src="v2/puppets/monroe.png" x={1320} y={1000} w={420} in={at('Era of')} out={books} from="right" bob={2} seed={5}>
          <NameCard name="JAMES MONROE" sub="president, 1817–1825" at={at('Era of') + 8} y={-30} />
        </Puppet>
        <Banner15 at={at('one nation')} out={books} x={620} y={560} w={420} />

        {/* ---- books ---- */}
        <Puppet src="v2/puppets/irving.png" x={560} y={1000} w={420} in={at('Washington Irving')} out={at("It's about")} from="left" bob={2} seed={3}>
          <NameCard name="WASHINGTON IRVING" sub="New York writer" at={at('Irving') + 4} y={-30} />
        </Puppet>
        <SourceTag text="Washington Irving, portrait by John Wesley Jarvis, 1809" at={at('Irving') + 14} out={at("It's about")} x={290} y={890} />
        <HangingSign at={at('books')} out={at('Then a New York')} x={960} y={300} w={640}>
          <Wood size={100} font="ultra">BOOKS</Wood>
          <Small size={30}>British critics: “cheap imitations”</Small>
        </HangingSign>
        <HangingSign at={at('Rip Van')} out={at("It's about")} x={1200} y={300} w={560} tone="red">
          <Wood size={64} font="rye">“RIP VAN WINKLE”</Wood>
          <div style={{fontFamily: F.sc, fontSize: 34}}>1819</div>
        </HangingSign>
        <Picture src="img/v2/rip_darley.jpg" at={at("It's about")} out={at('The story was')} x={960} y={240} w={720} source="Rip Van Winkle, etching by F.O.C. Darley, 1848" tag="LATER ILLUSTRATION" />
        <HangingSign at={at('dozed off')} out={at('The story was')} x={960} y={720} w={900} sfx={false}>
          <div style={{display: 'flex', gap: 30, alignItems: 'center', justifyContent: 'center'}}>
            <div>
              <div style={{fontFamily: F.slab, fontSize: 26, letterSpacing: 3}}>FELL ASLEEP A</div>
              <Wood size={44} font="rye" color={P.vermilion}>SUBJECT OF THE KING</Wood>
            </div>
            <Wood size={50} font="ultra">→</Wood>
            <div>
              <div style={{fontFamily: F.slab, fontSize: 26, letterSpacing: 3}}>WOKE UP A</div>
              <Wood size={44} font="rye" color={P.royal} at={at('citizen')}>CITIZEN OF THE U.S.</Wood>
            </div>
          </div>
        </HangingSign>
        <HangingSign at={at('The story was')} out={sad} x={960} y={300} w={760} tone="blue">
          <Wood size={56} font="rye">FAMOUS ON BOTH SIDES</Wood>
          <Wood size={56} font="rye">OF THE ATLANTIC</Wood>
        </HangingSign>

        {/* ---- Tecumseh ---- */}
        <Puppet src="v2/props/tecumseh.png" x={960} y={930} w={280} in={at('Remember Tecumseh')} out={at('At the peace')} from="fade" to="fade" bob={1} seed={3}>
          <NameCard name="TECUMSEH" at={at('Remember Tecumseh') + 6} out={at('He was killed')} y={-40} />
        </Puppet>
        <Picture src="img/v2/thames_death.jpg" at={at('He was killed')} out={at('At the peace')} x={960} y={240} w={760} source="Battle of the Thames, engraving after Alonzo Chappel, 1857" tag="LATER ENGRAVING" />
        <HangingSign at={at('killed in')} out={at('At the peace')} x={960} y={760} w={700} tone="black" sfx={false}>
          <Wood size={50} font="rye">KILLED · OCTOBER 5, 1813</Wood>
          <Small size={28}>the Battle of the Thames, in Upper Canada</Small>
        </HangingSign>
        <HangingSign at={at('At the peace')} out={at('The same war')} x={960} y={290} w={820}>
          <div style={{fontFamily: F.slab, fontSize: 32, letterSpacing: 3}}>AT THE PEACE TALKS, BRITAIN FIRST DEMANDED</div>
          <Wood size={60} font="rye">A NATIVE HOMELAND</Wood>
          <Small size={28}>a buffer between the U.S. and Canada</Small>
          <Wood size={80} font="ultra" color={P.vermilion} at={at('dropped it')} style={{marginTop: 10}}>
            DROPPED.
          </Wood>
        </HangingSign>
        <HangingSign at={at('The same war')} out={fin} x={960} y={330} w={820} tone="black">
          <div style={{fontFamily: F.slab, fontSize: 32, letterSpacing: 3}}>FOR TECUMSEH'S CONFEDERACY</div>
          <Wood size={70} font="rye" color={P.mustard} at={at('end of')}>THE END OF THE LINE</Wood>
        </HangingSign>

        {/* ---- finale ---- */}
        <Banner15 at={at('saw themselves')} x={960} y={250} w={700} />
        <HangingSign at={fin} out={at('saw themselves') - 4} x={960} y={330} w={700}>
          <div style={{fontFamily: F.slab, fontSize: 40, letterSpacing: 4}}>THE MAP</div>
          <Wood size={90} font="ultra">UNCHANGED</Wood>
        </HangingSign>
        <HangingSign at={at('saw themselves') - 2} x={960} y={660} w={960} tone="red">
          <div style={{fontFamily: F.slab, fontSize: 36, letterSpacing: 4}}>WHAT CHANGED</div>
          <Wood size={64} font="rye">HOW AMERICANS SAW THEMSELVES</Wood>
        </HangingSign>

        <Wash keys={[[0, '#FFFFFF', 0], [sad, '#6A6A78', 0.45], [fin, '#F0C070', 0.2]]} />
        <Spot x={960} y={640} r={300} from={at('Remember Tecumseh')} to={at('He was killed')} strength={0.7} />
        <DropCurtain keys={[[0, 0], [4, 1], [END + 2, 0]]} />
      </Theater>
      <VocabTicket
        term="status quo ante bellum"
        say="STAT-us kwoh AN-tee BEL-um"
        pos="Latin"
        defFrom="the way things"
        defWords={7}
        at={at('status quo') - 2}
        out={at('No territory') - 2}
        tl={tl}
        x={320}
        y={260}
        w={1000}
        termSize={70}
      />
      <VocabTicket
        term="Era of Good Feelings"
        label="KEY TERM"
        pos="noun"
        def="the years after the War of 1812, when one party ruled and national pride ran high"
        at={at('Era of') - 2}
        out={at('That pride')}
        tl={tl}
        x={200}
        y={260}
        w={860}
        termSize={70}
      />
    </>
  );
};

const Row: React.FC<{label: string; value: string; at: number; sub?: string}> = ({label, value, at, sub}) => {
  const frame = useCurrentFrame();
  if (frame < at) return <div style={{height: 70}} />;
  return (
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 40, borderBottom: `2px dashed ${P.ink}`, paddingBottom: 6}}>
      <div>
        <div style={{fontFamily: F.slab, fontSize: 32, letterSpacing: 2}}>{label}</div>
        {sub && <div style={{fontFamily: F.italic, fontStyle: 'italic', fontSize: 24}}>{sub}</div>}
      </div>
      <Wood size={56} font="ultra" color={P.vermilion} at={at}>
        {value}
      </Wood>
    </div>
  );
};
