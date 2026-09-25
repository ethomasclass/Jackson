import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cue, Sfx} from '../components/Scene';
import {clamp} from '../lib/anim';
import {F, P} from '../lib/theme';
import {makeTimeline, Narration} from '../lib/timing';
import {NameCard, Puppet, SourceTag} from '../theater/Puppet';
import {Banner15, Calendar, HangingSign, Playbill, Puff, Rule, Scroll, Small, TicketCaptions, Wood} from '../theater/Signs';
import {Backcloth, DropCurtain, Flash, Spot, Theater, WashKey, Wash, WaveRow} from '../theater/Stage';
import narration from '../../public/audio/v2_cold_open.words.json';

const N = narration as Narration;
export const V2_TITLE_SECONDS = 7.5;

/** Act One, scene one: the Chesapeake-Leopard affair, 22 June 1807. */
export const ColdOpen: React.FC<{captions: boolean}> = ({captions}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tl = makeTimeline(N, fps);
  const at = tl.at;
  const END = tl.frames;

  const fire = at('opens fire') + 8;
  const shots = [fire, fire + 11, fire + 24];
  const seize = at('drag off');
  const sailAway = at('sail away');
  const lightsOut = at('hanged');
  const stop = at("Here's");

  // ---- camera: [frame, zoom, stage x, stage y] ----
  const cam: [number, number, number, number][] = [
    [0, 0.93, 960, 575],
    [40, 0.97, 960, 575],
    [at('American'), 1.0, 960, 580],
    [at('Nobody'), 1.14, 760, 610],
    [at('British warship'), 1.03, 960, 590],
    [at('demands'), 1.12, 1080, 560],
    [at('American captain'), 1.12, 720, 620],
    [at('So the Leopard'), 1.06, 1000, 590],
    [at('Three'), 1.0, 960, 575],
    [at('board anyway'), 1.1, 1000, 610],
    [at('One of them'), 1.22, 960, 620],
    [stop, 1.0, 960, 575],
    [at('So what'), 1.04, 960, 590],
    [at('change how'), 0.98, 960, 570],
    [END, 0.93, 960, 575],
  ];

  // ---- light cues ----
  const wash: WashKey[] = [
    [0, '#FFFFFF', 0],
    [at('British warship'), '#C9D2F0', 0.25],
    [at('So the Leopard'), '#6070B8', 0.45],
    [fire + 40, '#8C4A3A', 0.35],
    [at('Three'), '#5D6AA8', 0.4],
    [at('One of them'), '#0B1030', 0.75],
    [stop, '#E8E4DA', 0.12],
    [at('So what'), '#FFFFFF', 0],
    [at('change how'), '#F0C070', 0.28],
  ];

  const wavesStorm = frame >= at('So the Leopard') && frame < stop;
  const waveSpeed = wavesStorm ? 1.9 : 1;
  const waveAmp = wavesStorm ? 1.7 : 1;

  const deckC: [number, number][] = [[585, 792], [625, 794], [665, 792], [705, 790]];
  const deckL: [number, number][] = [[1215, 812], [1255, 814], [1295, 812], [1335, 810]];

  return (
    <AbsoluteFill style={{background: '#140D09'}}>
      <Audio src={staticFile('audio/v2_cold_open.wav')} />
      <Cue src="music/v2/calm_sea.mp3" at={0} until={at('opens fire')} level={0.2} fadeOut={10} />
      <Cue src="music/v2/aftermath.mp3" at={at('Three') - 10} until={END} level={0.2} fadeIn={40} fadeOut={20} />
      <Sequence durationInFrames={stop + 40} layout="none">
        <Audio src={staticFile('sfx/sea_ambience.wav')} loop volume={(f) => interpolate(f, [0, 20, stop, stop + 40], [0, 0.22, 0.22, 0], clamp)} />
      </Sequence>
      <Sfx src="curtain" at={6} volume={0.5} />
      <Sfx src="broadside" at={fire - 3} volume={0.85} />
      <Sfx src="toll" at={lightsOut} volume={0.5} frames={150} />
      <Sfx src="curtain" at={at('Start') + 4} volume={0.45} />

      <Theater cam={cam} shake={[...shots, at('fighting') + 4]}>
        {/* ---------------- scenery ---------------- */}
        <Backcloth src="v2/scenery/sea_backcloth.jpg" />
        <Backcloth src="v2/scenery/sea_backcloth_storm.jpg" at={at('So the Leopard')} />
        <Backcloth src="v2/scenery/sea_backcloth.jpg" at={stop} />
        <WaveRow y={742} color="#2F63B8" dark={P.royal} phase={0} amp={waveAmp} speed={waveSpeed} scale={0.8} />

        {/* ---------------- the ships ---------------- */}
        <Puppet
          src="v2/puppets/chesapeake.png"
          x={650}
          y={830}
          w={520}
          in={at('American')}
          out={at('One of them')}
          from="left"
          rock={2.2}
          seed={1}
          hit={shots.map((s, i) => [s + 2, -4 + i, 10])}
          silhouette={(f) => interpolate(f, [at('So the Leopard'), at('So the Leopard') + 20, at('Three'), at('Three') + 30], [0, 0.25, 0.25, 0.1], clamp)}
        >
          <NameCard name="U.S.S. CHESAPEAKE" sub="an American warship" at={at('Chesapeake') + 4} out={at('British warship')} y={-40} />
        </Puppet>
        <Puppet
          src="v2/puppets/leopard.png"
          x={1300}
          y={846}
          w={560}
          in={at('British warship')}
          out={sailAway}
          from="right"
          rock={1.6}
          seed={4}
          silhouette={(f) => interpolate(f, [at('So the Leopard'), at('So the Leopard') + 20], [0, 0.3], clamp)}
        >
          <NameCard name="H.M.S. LEOPARD" sub="a British warship" at={at('Leopard') + 4} out={at('demands')} x="36%" y={90} red />
        </Puppet>
        <SourceTag text="U.S.S. Chesapeake, painting by F. Muller" at={at('Chesapeake') + 10} out={at('British warship')} x={300} y={250} />
        <SourceTag text="stand-in: a British 50-gun ship, engraving, 1860" tag="PERIOD ENGRAVING" at={at('Leopard') + 10} out={at('demands')} x={980} y={250} />

        {/* the four seized sailors: lifted off the Chesapeake, set down on the Leopard, carried away */}
        {deckC.map(([cx, cy], i) => (
          <Puppet
            key={i}
            src={`v2/props/sailor_${i}.png`}
            x={cx}
            y={cy}
            w={62}
            in={seize + i * 3}
            out={sailAway}
            from="fade"
            to="right"
            rod="above"
            bob={2}
            seed={i * 3}
            move={[[at('four') + i * 6, deckL[i][0], deckL[i][1]]]}
          />
        ))}

        <WaveRow y={818} color="#2A7F63" dark={P.emerald} phase={1.3} amp={waveAmp} speed={waveSpeed} />
        {shots.map((s, i) => (
          <React.Fragment key={s}>
            <Puff at={s} x={1130 - i * 30} y={700 - i * 30} w={300 + i * 40} i={i} drift={-260} life={90} />
            <Puff at={s + 4} x={1030 - i * 50} y={640 - i * 20} w={240} i={i + 1} drift={-320} life={80} />
          </React.Fragment>
        ))}
        <WaveRow y={892} color="#2C57A8" dark="#18306E" phase={2.4} amp={waveAmp} speed={waveSpeed} scale={1.15} />

        {/* ---------------- Commodore Barron through the trap ---------------- */}
        <Puppet src="v2/puppets/barron.png" x={430} y={980} w={430} in={at('American captain') - 4} out={at('So the Leopard')} from="trap" bob={3} seed={2}>
          <NameCard name="JAMES BARRON" sub="commodore, commanding the Chesapeake" at={at('captain') + 2} x="78%" y={-40} rot={2} />
        </Puppet>
        <SourceTag text="James Barron, portrait by John Neagle, 1829" at={at('captain') + 10} out={at('So the Leopard')} x={250} y={236} />

        {/* ---------------- the deserter ---------------- */}
        <Puppet src="v2/props/sailor_1.png" x={960} y={760} w={120} in={at('One of them')} out={lightsOut + 4} from="fly" to="fade" rod="above" bob={2} seed={7}>
          <NameCard name="A BRITISH DESERTER" at={at('deserter')} y={-50} />
        </Puppet>

        {/* ---------------- paragraph two: King and President ---------------- */}
        <Puppet src="v2/puppets/george3.png" x={560} y={930} w={250} in={at('two countries')} out={at('And how')} from="left" bob={2} seed={3} move={[[at('fighting'), 790, 930]]} hit={[[at('fighting') + 4, 5, 0]]}>
          <NameCard name="KING GEORGE III" sub="Britain" at={at('countries') + 6} out={at('fighting')} y={-50} />
        </Puppet>
        <Puppet src="v2/puppets/jefferson.png" x={1350} y={1000} w={420} in={at('countries')} out={at('And how')} from="right" bob={2} seed={5} move={[[at('fighting'), 1130, 1000]]} hit={[[at('fighting') + 4, -5, 0]]}>
          <NameCard name="THOMAS JEFFERSON" sub="U.S. president in 1807" at={at('countries') + 14} out={at('fighting')} y={-50} />
        </Puppet>
        <Puff at={at('fighting') + 4} x={965} y={520} w={320} i={2} drift={0} life={50} />

        {/* ---------------- lights ---------------- */}
        <Wash keys={wash} />
        <Flash at={shots} />
        <Spot x={960} y={600} r={270} from={at('One of them')} to={lightsOut + 3} />
        <Blackout from={lightsOut + 3} to={stop} />

        {/* ---------------- signs from the flies ---------------- */}
        <HangingSign at={at('June')} out={at('American')} x={960} y={340} w={640}>
          <Wood size={120} font="ultra">JUNE 1807</Wood>
          <Rule color={P.vermilion} />
          <Small>off the coast of Virginia</Small>
        </HangingSign>

        <Scroll at={at('demands')} out={at('American captain') - 2} x={900} y={300} w={640} rot={-3}>
          <div style={{fontFamily: F.slab, fontSize: 30, color: P.vermilion, letterSpacing: 4}}>THE LEOPARD DEMANDS</div>
          <Wood size={56} font="rye">
            SEARCH THE SHIP FOR
            <br />
            RUNAWAY BRITISH SAILORS
          </Wood>
        </Scroll>
        <HangingSign at={at('refuses') - 2} out={at('So the Leopard')} x={1150} y={330} w={420} tone="red" sfx={false}>
          <Wood size={96} font="ultra" at={at('refuses')}>
            REFUSED.
          </Wood>
        </HangingSign>

        <HangingSign at={at('Three') - 3} out={at('board anyway') - 4} x={960} y={300} w={760}>
          <div style={{display: 'flex', justifyContent: 'center', gap: 60, alignItems: 'baseline'}}>
            <div>
              <Wood size={150} font="ultra" at={at('Three')}>
                3
              </Wood>
              <div style={{fontFamily: F.slab, fontSize: 40, letterSpacing: 4}}>KILLED</div>
            </div>
            <div>
              <Wood size={150} font="ultra" color={P.vermilion} at={at('eighteen')}>
                18
              </Wood>
              <div style={{fontFamily: F.slab, fontSize: 40, letterSpacing: 4, color: P.vermilion}}>WOUNDED</div>
            </div>
          </div>
        </HangingSign>

        <HangingSign at={at('four sailors')} out={sailAway + 10} x={960} y={270} w={600} tone="blue" sfx={false}>
          <Wood size={70} font="rye">4 SAILORS SEIZED</Wood>
        </HangingSign>

        <HangingSign at={at('yardarm')} out={stop} x={960} y={330} w={820} tone="black" sfx={false}>
          <Wood size={64} font="rye">JENKIN RATFORD</Wood>
          <Small size={32}>a British-born deserter from the Royal Navy, hanged at Halifax, Nova Scotia, August 1807</Small>
        </HangingSign>

        <HangingSign at={at('United States')} out={at("That wouldn't")} x={960} y={300} w={820}>
          <div style={{fontFamily: F.slab, fontSize: 44, letterSpacing: 4}}>IN 1807, THE U.S. AND BRITAIN WERE</div>
          <Wood size={130} font="ultra" color={P.vermilion} at={at("weren't")} style={{marginTop: 12}}>
            NOT AT WAR
          </Wood>
        </HangingSign>

        <Calendar
          at={at("That wouldn't")}
          out={at('But moments')}
          flipFrom={at('another')}
          flipTo={at('years') + 4}
          years={[1807, 1808, 1809, 1810, 1811, 1812]}
          x={960}
          y={330}
          last={<WarStamp at={at('years') + 6} />}
        />

        <HangingSign at={at('But moments')} out={at('So what')} x={960} y={300} w={860}>
          <Wood size={110} font="ultra" at={at('second')}>
            A SECOND WAR
          </Wood>
          <div style={{fontFamily: F.slab, fontSize: 46, letterSpacing: 4, marginTop: 6}}>AGAINST BRITAIN</div>
          <Small>(the first was the American Revolution)</Small>
          <Wood size={84} font="rye" color={P.vermilion} at={at('unavoidable')} style={{marginTop: 14}}>
            UNAVOIDABLE?
          </Wood>
        </HangingSign>

        <HangingSign at={at('practically')} out={at('fighting')} x={960} y={400} w={460} sfx={false}>
          <div style={{fontFamily: F.slab, fontSize: 36, letterSpacing: 2}}>SAME LANGUAGE · SAME LAWS</div>
          <Wood size={54} font="rye" color={P.vermilion} style={{marginTop: 8}}>
            SAME KING, UNTIL 1776
          </Wood>
        </HangingSign>

        <HangingSign at={at('And how')} out={at('change how')} x={960} y={330} w={820}>
          <div style={{fontFamily: F.slab, fontSize: 50, letterSpacing: 6}}>ON PAPER</div>
          <Wood size={96} font="ultra" at={at('almost nothing')}>
            ALMOST NOTHING
          </Wood>
          <Wood size={96} font="ultra" at={at('almost nothing') + 8}>
            CHANGED
          </Wood>
        </HangingSign>

        <Banner15 at={at('change how')} x={960} y={250} w={780} />
        <HangingSign at={at('saw themselves') - 4} out={at('Start')} x={960} y={600} w={1000} tone="red">
          <div style={{fontFamily: F.slab, fontSize: 40, letterSpacing: 4}}>BUT IT CHANGED</div>
          <Wood size={70} font="rye">HOW AMERICANS SAW THEMSELVES</Wood>
        </HangingSign>

        <DropCurtain keys={[[0, 0], [8, 1], [at('Start') + 4, 0]]} />
      </Theater>

      {captions && (
        <Sequence durationInFrames={END}>
          <TicketCaptions words={N.words} />
        </Sequence>
      )}

      <Sequence from={END}>
        <TitlePlaybill />
      </Sequence>
    </AbsoluteFill>
  );
};

const WarStamp: React.FC<{at: number}> = ({at}) => (
  <div style={{position: 'absolute', left: '50%', top: '105%', transform: 'translateX(-50%) rotate(-6deg)'}}>
    <Wood size={90} font="ultra" color={P.vermilion} at={at} style={{background: P.card, border: `5px solid ${P.vermilion}`, padding: '4px 28px'}}>
      WAR!
    </Wood>
  </div>
);

const Blackout: React.FC<{from: number; to: number}> = ({from, to}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [from, from + 2, to - 6, to], [0, 0.9, 0.9, 0], clamp);
  if (o <= 0) return null;
  return <AbsoluteFill style={{background: '#05060F', opacity: o}} />;
};

/** The title, pasted up as a playbill in front of the closed curtain while the band plays. */
const TitlePlaybill: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = Math.round(V2_TITLE_SECONDS * fps);
  const o = interpolate(frame, [out - 12, out], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Audio src={staticFile('music/v2/title_fanfare.mp3')} volume={(f) => interpolate(f, [0, 4, out - 20, out], [0, 0.5, 0.5, 0], clamp)} />
      <Theater cam={[[0, 0.93, 960, 575], [out, 0.96, 960, 575]]}>
        <DropCurtain keys={[[0, 0]]} />
      </Theater>
      <Playbill
        at={4}
        lines={[
          {at: 10, node: <div style={{fontFamily: F.slab, fontSize: 26, letterSpacing: 8, color: P.vermilion, whiteSpace: 'nowrap'}}>THE CLASSROOM THEATRE PRESENTS</div>},
          {at: 20, node: <Wood size={150} font="rye" at={20}>THE WAR</Wood>},
          {at: 30, node: <Wood size={112} font="ultra" color={P.vermilion} at={30}>NOBODY WON</Wood>},
          {at: 48, node: <Rule color={P.vermilion} />},
          {at: 48, node: <Small size={34} style={{whiteSpace: 'nowrap'}}>or, the Causes &amp; Consequences of the War of 1812</Small>},
          {at: 70, node: <div style={{fontFamily: F.sc, fontSize: 34, marginTop: 14, letterSpacing: 3}}>~ a drama in ten scenes ~</div>},
          {
            at: 92,
            node: <div style={{fontFamily: F.slab, fontSize: 25, marginTop: 18, color: P.royal, letterSpacing: 1, whiteSpace: 'nowrap'}}>SHIPS! · CANNON! · A BURNING CAPITAL! · A PIRATE!</div>,
          },
        ]}
      />
    </AbsoluteFill>
  );
};
