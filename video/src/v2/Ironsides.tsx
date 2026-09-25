import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Cue, Sfx} from '../components/Scene';
import {F, P} from '../lib/theme';
import {makeTimeline, Narration} from '../lib/timing';
import {Picture} from '../theater/Props';
import {NameCard, Puppet, SourceTag} from '../theater/Puppet';
import {SCENE_CARD_SECONDS, TheaterScene} from '../theater/Scene';
import {HangingSign, Puff, Small, Wood} from '../theater/Signs';
import {Backcloth, DropCurtain, Flash, Theater, Wash, WaveRow} from '../theater/Stage';
import narration from '../../public/audio/v2_s5_ironsides.words.json';

const N = narration as Narration;
const TAIL = 24;
export const IRONSIDES_SECONDS = SCENE_CARD_SECONDS + N.duration + TAIL / 30;

/** Scene V: war declared, Detroit lost, and the USS Constitution becomes "Old Ironsides". */
export const Ironsides: React.FC<{captions: boolean}> = ({captions}) => (
  <TheaterScene narration={N} audio="audio/v2_s5_ironsides.wav" captions={captions} tail={TAIL} scene={{n: 'V', title: 'Old Ironsides', years: '1812'}}>
    <Body />
  </TheaterScene>
);

/** Black cannonballs arcing in from the right and bouncing off a hull at (hx, hy). */
const Bounces: React.FC<{from: number; n: number; hx: number; hy: number}> = ({from, n, hx, hy}) => {
  const frame = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, zIndex: 17}}>
      {Array.from({length: n}, (_, i) => {
        const k = frame - (from + i * 11);
        if (k < 0 || k > 40) return null;
        const y0 = hy - 20 + (i % 3) * 30;
        let x: number, y: number;
        if (k < 14) {
          const t = k / 14;
          x = 1250 + (hx - 1250) * t;
          y = y0 - 60 * Math.sin(Math.PI * t);
        } else {
          const t = (k - 14) / 26;
          x = hx + 260 * t;
          y = y0 - 180 * t + 420 * t * t;
        }
        return <circle key={i} cx={x} cy={y} r={11} fill={P.ink} stroke="#555" strokeWidth={2} />;
      })}
    </svg>
  );
};

const Body: React.FC = () => {
  const {fps} = useVideoConfig();
  const tl = makeTimeline(N, fps);
  const at = tl.at;
  const END = tl.frames;
  const fight = at('During the fight');
  const shots = [fight, fight + 13, fight + 30, at('iron.') - 6];
  const cam: [number, number, number, number][] = [
    [0, 0.95, 960, 575],
    [at('On land'), 1.02, 960, 560],
    [at('But at sea'), 1.0, 960, 590],
    [fight, 1.1, 820, 600],
    [at('The Constitution won'), 1.04, 960, 600],
    [at('By the time'), 1.0, 960, 575],
    [END + 20, 0.94, 960, 575],
  ];
  return (
    <>
      <Cue src="music/v2/sea_battle.mp3" at={0} until={END} level={0.15} fadeIn={20} />
      <Sfx src="broadside" at={fight - 3} volume={0.7} />
      <Sfx src="broadside" at={fight + 27} volume={0.5} />
      <Sfx src="crowd_cheer" at={at('cheering')} volume={0.5} frames={120} />
      <Theater cam={cam} shake={shots}>
        <Backcloth src="v2/scenery/sea_backcloth.jpg" />
        <Backcloth src="v2/scenery/sea_backcloth_storm.jpg" at={fight - 8} />
        <Backcloth src="v2/scenery/sea_backcloth.jpg" at={at('By the time')} />

        <HangingSign at={at('declared war')} out={at('On land')} x={960} y={300} w={760} tone="red">
          <div style={{fontFamily: F.slab, fontSize: 40, letterSpacing: 6}}>CONGRESS DECLARES</div>
          <Wood size={130} font="ultra">WAR!</Wood>
          <div style={{fontFamily: F.sc, fontSize: 40, letterSpacing: 4}}>June 18, 1812</div>
        </HangingSign>

        <Picture src="img/v2/kensett_map.jpg" at={at('The invasion')} out={at('But at sea')} x={760} y={250} w={760} source="a map of Canada printed in 1812" />
        <HangingSign at={at('fell apart')} out={at('But at sea')} x={1320} y={310} w={500} tone="black" sfx={false}>
          <div style={{fontFamily: F.slab, fontSize: 30, letterSpacing: 3}}>INVASION OF CANADA</div>
          <Wood size={70} font="ultra" color={P.vermilion}>FAILED</Wood>
        </HangingSign>
        <HangingSign at={at('surrendered Detroit')} out={at('But at sea')} x={1320} y={600} w={500} sfx={false}>
          <div style={{fontFamily: F.sc, fontSize: 34}}>August 16, 1812</div>
          <Wood size={52} font="rye">DETROIT SURRENDERED</Wood>
          <Small size={26}>(Calhoun had said four weeks.)</Small>
        </HangingSign>

        <WaveRow y={742} color="#2F63B8" dark={P.royal} scale={0.8} amp={1.3} speed={1.4} />
        <Puppet
          src="v2/puppets/constitution.png"
          x={660}
          y={836}
          w={560}
          in={at('USS Constitution')}
          out={END}
          from="left"
          rock={2}
          seed={2}
          hit={shots.map((s) => [s + 14, 1.5, 0])}
        >
          <NameCard name="U.S.S. CONSTITUTION" at={at('Constitution') + 4} out={at('During the fight')} y={-30} />
        </Puppet>
        <Puppet
          src="v2/puppets/leopard.png"
          x={1280}
          y={846}
          w={540}
          in={at('Guerriere')}
          out={at('The Constitution won') + 10}
          from="right"
          to="trap"
          rock={1.6}
          seed={5}
          hit={[[at('The Constitution won'), -10, 30]]}
          silhouette={() => 0.15}
        >
          <NameCard name="H.M.S. GUERRIERE" sub="known for impressing American sailors" at={at('Guerriere') + 4} out={at('During the fight')} x="40%" y={160} red />
        </Puppet>
        <SourceTag text="stand-in: engraving of a British warship, 1860" tag="PERIOD ENGRAVING" at={at('Guerriere') + 14} out={at('During the fight')} x={1000} y={890} />
        <SourceTag text="U.S.S. Constitution, detail of a painting by Thomas Chambers, c. 1845" at={at('Constitution') + 14} out={at('Guerriere')} x={290} y={890} />
        <WaveRow y={818} color="#2A7F63" dark={P.emerald} phase={1.3} amp={1.3} speed={1.4} />
        {shots.map((s, i) => (
          <Puff key={s} at={s} x={1140 - i * 20} y={640} w={280} i={i} drift={-240} life={80} />
        ))}
        <Bounces from={at('bounce') - 6} n={5} hx={880} hy={700} />
        <WaveRow y={892} color="#2C57A8" dark="#18306E" phase={2.4} scale={1.15} amp={1.3} speed={1.4} />

        <Wash keys={[[0, '#FFFFFF', 0], [fight - 8, '#6070B8', 0.35], [at('The Constitution won'), '#FFFFFF', 0], [at('By the time'), '#F0C070', 0.2]]} />
        <Flash at={shots} />

        <HangingSign at={at('iron.') - 4} out={at('The Constitution won')} x={960} y={300} w={760}>
          <Wood size={70} font="rye">“HER SIDES ARE MADE OF IRON!”</Wood>
          <Small size={28}>a sailor aboard the Constitution, as the story goes</Small>
        </HangingSign>
        <HangingSign at={at('won.')} out={at('By the time')} x={960} y={320} w={520} tone="blue" sfx={false}>
          <Wood size={90} font="ultra">VICTORY</Wood>
          <div style={{fontFamily: F.sc, fontSize: 34}}>August 19, 1812</div>
        </HangingSign>

        <Picture
          src="img/v2/constitution_chambers.jpg"
          at={at('By the time')}
          out={END}
          x={960}
          y={240}
          w={820}
          source="The Constitution and the Guerriere, Thomas Chambers, c. 1845"
          tag="PAINTING"
        />
        <HangingSign at={at('Old Ironsides')} out={END} x={960} y={740} w={720} tone="red">
          <Wood size={100} font="rye">★ OLD IRONSIDES ★</Wood>
        </HangingSign>

        <DropCurtain keys={[[0, 0], [4, 1], [END + 2, 0]]} />
      </Theater>
    </>
  );
};
