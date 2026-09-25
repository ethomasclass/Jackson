import React from 'react';
import {useVideoConfig} from 'remotion';
import {Cue, Sfx} from '../components/Scene';
import {F, P} from '../lib/theme';
import {makeTimeline, Narration} from '../lib/timing';
import {Flames, Picture} from '../theater/Props';
import {NameCard, Puppet, SourceTag} from '../theater/Puppet';
import {SCENE_CARD_SECONDS, TheaterScene} from '../theater/Scene';
import {HangingSign, Puff, Small, Wood} from '../theater/Signs';
import {Backcloth, DropCurtain, Spot, Theater, Wash} from '../theater/Stage';
import narration from '../../public/audio/v2_s6_washington_burns.words.json';

const N = narration as Narration;
const TAIL = 24;
export const WASHINGTON_BURNS_SECONDS = SCENE_CARD_SECONDS + N.duration + TAIL / 30;

/** Scene VI: August 24, 1814 - Dolley Madison, the Washington portrait, and the fire. */
export const WashingtonBurns: React.FC<{captions: boolean}> = ({captions}) => (
  <TheaterScene narration={N} audio="audio/v2_s6_washington_burns.wav" captions={captions} tail={TAIL} scene={{n: 'VI', title: 'The Night They Burned the White House', years: 'August 1814'}}>
    <Body />
  </TheaterScene>
);

const Body: React.FC = () => {
  const {fps} = useVideoConfig();
  const tl = makeTimeline(N, fps);
  const at = tl.at;
  const END = tl.frames;
  const fire = at('on fire');
  const cam: [number, number, number, number][] = [
    [0, 0.95, 960, 575],
    [at('First Lady'), 1.05, 820, 590],
    [at('On the wall'), 1.06, 960, 560],
    [at("But there's"), 1.04, 960, 575],
    [at('Hours later'), 1.02, 960, 580],
    [fire, 1.08, 960, 600],
    [at('For Americans'), 1.0, 960, 575],
    [END + 20, 0.94, 960, 575],
  ];
  return (
    <>
      <Cue src="music/v2/fire.mp3" at={0} until={END} level={0.16} fadeIn={20} />
      <Sfx src="toll" at={at('empty house')} volume={0.3} frames={120} />
      <Theater cam={cam}>
        <Backcloth src="v2/scenery/dc_night.jpg" />
        <Backcloth src="v2/scenery/dining_room.jpg" at={at('Hours later')} />
        <Backcloth src="v2/scenery/dc_night.jpg" at={at('and then set')} />

        <HangingSign at={at('summer of')} out={at('Then, in')} x={960} y={300} w={660}>
          <Wood size={100} font="ultra">1814</Wood>
          <Small>two years of war, nothing decided</Small>
        </HangingSign>
        <Picture
          src="img/v2/capture_washington.jpg"
          at={at('British army')}
          out={at('First Lady')}
          x={960}
          y={240}
          w={880}
          source="“Capture of the City of Washington,” British engraving, 1814"
        />

        <Puppet src="v2/puppets/dolley.png" x={560} y={1000} w={400} in={at('First Lady')} out={at("But there's")} from="left" bob={2} seed={1}>
          <NameCard name="DOLLEY MADISON" sub="First Lady" at={at('Dolley') + 4} y={-30} red />
        </Puppet>
        <SourceTag text="Dolley Madison, portrait by Gilbert Stuart, 1804" at={at('Dolley') + 14} out={at('On the wall')} x={290} y={890} />
        <Puppet src="v2/puppets/madison.png" x={1280} y={1000} w={420} in={at('President James')} out={at('On the wall')} from="right" to="right" bob={2} seed={2}>
          <NameCard name="JAMES MADISON" sub="the president" at={at('James Madison') + 4} y={-30} />
        </Puppet>
        <HangingSign at={at('gather')} out={at('On the wall')} x={1250} y={300} w={520} tone="black" sfx={false}>
          <Wood size={46} font="rye">GATHER THE PAPERS.</Wood>
          <Wood size={46} font="rye" color={P.mustard}>BE READY TO RUN.</Wood>
        </HangingSign>

        <Picture src="img/v2/lansdowne.jpg" at={at('On the wall')} out={at('Either way') + 30} x={1400} y={240} w={340} source="George Washington, Gilbert Stuart, 1796" />

        <HangingSign at={at('In a letter')} out={at("But there's")} x={940} y={240} w={620}>
          <div style={{background: P.royal, color: P.cream, fontFamily: F.slab, fontSize: 28, letterSpacing: 6, padding: '4px 0'}}>SOURCE 1 · DOLLEY'S LETTER, 1814</div>
          <Wood size={44} font="rye" at={at('refused')} style={{marginTop: 14}}>SHE REFUSED TO LEAVE</Wood>
          <Wood size={44} font="rye" at={at('frame broken')}>ORDERED THE FRAME BROKEN</Wood>
          <Wood size={44} font="rye" at={at('canvas')}>THE CANVAS TAKEN OUT</Wood>
        </HangingSign>

        <Picture src="img/v2/paul_jennings.jpg" at={at('Paul Jennings')} out={at('Either way')} x={400} y={300} w={280} rot={-2} source="Paul Jennings, photograph taken later in his life">
          <NameCard name="PAUL JENNINGS" sub="enslaved, age 15 in 1814" at={at('Jennings') + 4} y="88%" />
        </Picture>
        <HangingSign at={at('Years later')} out={at('Either way')} x={880} y={250} w={560}>
          <div style={{background: P.vermilion, color: P.cream, fontFamily: F.slab, fontSize: 28, letterSpacing: 6, padding: '4px 0'}}>SOURCE 2 · JENNINGS' MEMOIR, 1865</div>
          <Wood size={44} font="rye" at={at('no time')} style={{marginTop: 14}}>“SHE HAD NO TIME”</Wood>
          <Small size={30}>the doorkeeper and the gardener took it down</Small>
        </HangingSign>
        <Puppet src="v2/props/sioussat.png" x={830} y={930} w={200} in={at('doorkeeper')} out={at('Either way') + 30} from="left" to="right" bob={2} seed={4} move={[[at('Either way'), 1250, 930]]}>
          <NameCard name="JEAN-PIERRE SIOUSSAT" sub="doorkeeper" at={at('Sioussat') - 4} out={at('Either way')} y={-10} />
        </Puppet>
        <Puppet src="v2/props/mcgraw.png" x={1060} y={930} w={200} in={at('gardener')} out={at('Either way') + 30} from="left" to="right" bob={2} seed={5} move={[[at('Either way'), 1450, 930]]}>
          <NameCard name="THOMAS McGRAW" sub="gardener" at={at('McGraw') - 4} out={at('Either way')} y={-10} />
        </Puppet>
        <SourceTag text="no portraits of Sioussat or McGraw are known; shown in silhouette" tag="NOTE" at={at('McGraw') + 6} out={at('Either way')} x={760} y={870} />
        <HangingSign at={at('still hangs')} out={at('Hours later')} x={760} y={320} w={620} tone="blue">
          <Wood size={60} font="rye">SAVED</Wood>
          <Small size={30}>It still hangs in the White House today.</Small>
        </HangingSign>

        <HangingSign at={at('ate the food')} out={at('and then set')} x={960} y={300} w={760} tone="black" sfx={false}>
          <Wood size={56} font="rye">THE BRITISH ATE</Wood>
          <Wood size={56} font="rye" color={P.mustard}>THE PRESIDENT'S DINNER</Wood>
        </HangingSign>

        <Flames at={fire} x={960} y={930} w={1400} n={9} seed={1} />
        <Puff at={fire + 12} x={760} y={430} w={420} i={1} drift={-60} life={140} />
        <Puff at={fire + 40} x={1180} y={400} w={440} i={3} drift={80} life={140} />
        <Wash
          keys={[
            [0, '#3A4A90', 0.25],
            [at('Hours later'), '#E0B070', 0.2],
            [fire, '#C04020', 0.35],
            [at('For Americans'), '#A03018', 0.4],
          ]}
        />
        <Spot x={1400} y={520} r={320} from={at('On the wall')} to={at('In a letter')} strength={0.6} />
        <HangingSign at={at('Capitol too')} out={at('For Americans')} x={960} y={300} w={560} tone="red" sfx={false}>
          <Wood size={70} font="rye">THE CAPITOL, TOO</Wood>
        </HangingSign>
        <HangingSign at={at('humiliating')} out={END} x={960} y={300} w={700}>
          <Wood size={84} font="ultra" color={P.vermilion}>HUMILIATING</Wood>
          <Wood size={50} font="rye" at={at('backfire')} style={{marginTop: 10}}>…BUT IT WOULD BACKFIRE</Wood>
        </HangingSign>

        <DropCurtain keys={[[0, 0], [4, 1], [END + 2, 0]]} />
      </Theater>
    </>
  );
};
