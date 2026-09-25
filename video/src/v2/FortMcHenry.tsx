import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cue, Sfx} from '../components/Scene';
import {clamp} from '../lib/anim';
import {F, P} from '../lib/theme';
import {makeTimeline, Narration} from '../lib/timing';
import {Picture, Rockets} from '../theater/Props';
import {NameCard, Puppet, SourceTag} from '../theater/Puppet';
import {SCENE_CARD_SECONDS, TheaterScene} from '../theater/Scene';
import {Banner15, HangingSign, Small, Wood} from '../theater/Signs';
import {Backcloth, DropCurtain, Flash, Spot, Theater, Wash, WaveRow} from '../theater/Stage';
import narration from '../../public/audio/v2_s7_fort_mchenry.words.json';

const N = narration as Narration;
const TAIL = 24;
export const FORT_MCHENRY_SECONDS = SCENE_CARD_SECONDS + N.duration + TAIL / 30;

/** Scene VII: the bombardment of Fort McHenry and "The Star-Spangled Banner". */
export const FortMcHenry: React.FC<{captions: boolean}> = ({captions}) => (
  <TheaterScene narration={N} audio="audio/v2_s7_fort_mchenry.wav" captions={captions} tail={TAIL} scene={{n: 'VII', title: 'A Flag Still There', years: 'September 1814'}}>
    <Body />
  </TheaterScene>
);

const Body: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tl = makeTimeline(N, fps);
  const at = tl.at;
  const END = tl.frames;
  const bomb = at('For twenty-five');
  const dawn = at('At dawn');
  const hours = interpolate(frame, [bomb, at('hours') + 8], [0, 25], clamp);
  const cam: [number, number, number, number][] = [
    [0, 0.95, 960, 575],
    [at('Standing'), 1.1, 1200, 560],
    [at('A lawyer'), 1.04, 820, 590],
    [bomb, 1.0, 960, 560],
    [at('Key had no'), 1.14, 700, 620],
    [dawn, 1.0, 960, 560],
    [at('Key was so'), 1.04, 960, 575],
    [at('A capital'), 1.0, 960, 575],
    [END + 20, 0.94, 960, 575],
  ];
  return (
    <>
      <Cue src="music/v2/dawn.mp3" at={0} until={END} level={0.17} fadeIn={20} />
      <Sfx src="broadside" at={bomb} volume={0.55} />
      <Sfx src="broadside" at={bomb + 45} volume={0.4} />
      <Theater cam={cam} shake={[bomb + 2, bomb + 47]}>
        <Backcloth src="v2/scenery/harbor_night.jpg" />
        <Backcloth src="v2/scenery/harbor_dawn.jpg" at={dawn} />
        <WaveRow y={880} color="#243F7A" dark="#101E45" scale={0.7} amp={0.6} />

        <HangingSign at={at('Baltimore')} out={at('A lawyer')} x={760} y={300} w={600}>
          <Wood size={84} font="rye">BALTIMORE</Wood>
          <Small>September 1814</Small>
        </HangingSign>
        <HangingSign at={at('Fort McHenry')} out={at('A lawyer')} x={1300} y={330} w={440} tone="blue" sfx={false}>
          <Wood size={50} font="rye">FORT McHENRY</Wood>
          <Small size={26}>guarding the harbor</Small>
        </HangingSign>

        <Puppet src="v2/puppets/key.png" x={560} y={1000} w={400} in={at('Francis Scott Key')} out={dawn} from="left" bob={2} seed={1} silhouette={(f) => interpolate(f, [bomb, bomb + 20], [0, 0.35], clamp)}>
          <NameCard name="FRANCIS SCOTT KEY" sub="a lawyer, age 35" at={at('Key') + 4} out={bomb} y={-30} />
        </Puppet>
        <SourceTag text="Francis Scott Key, portrait attributed to Joseph Wood, c. 1825" at={at('Key') + 14} out={at('So he watched')} x={290} y={890} />
        <HangingSign at={at('wouldn\'t let')} out={at('For twenty-five')} x={1200} y={300} w={560} sfx={false}>
          <div style={{fontFamily: F.slab, fontSize: 30, letterSpacing: 3}}>KEY WAS HELD ON A SHIP</div>
          <Wood size={50} font="rye" color={P.vermilion}>UNTIL THE ATTACK WAS OVER</Wood>
        </HangingSign>

        <Rockets from={bomb} to={dawn - 20} every={16} />
        <Flash at={Array.from({length: 12}, (_, i) => bomb + i * 26)} color="#FFB060" />
        <HangingSign at={bomb + 4} out={at('Key had no')} x={960} y={290} w={520} tone="black" sfx={false}>
          <Wood size={140} font="ultra" color={P.mustard}>{Math.round(hours)}</Wood>
          <div style={{fontFamily: F.slab, fontSize: 40, letterSpacing: 6}}>HOURS OF BOMBARDMENT</div>
        </HangingSign>
        <Picture
          src="img/v2/mchenry_bower.jpg"
          at={at('bombarded')}
          out={at('Key had no')}
          x={1320}
          y={470}
          w={500}
          rot={2}
          source="the bombardment, print by John Bower, c. 1816"
        />

        <Wash keys={[[0, '#2A3470', 0.35], [bomb, '#1A2050', 0.5], [dawn, '#F0C070', 0.12], [at('A capital'), '#E8C890', 0.15]]} />
        <Spot x={700} y={620} r={300} from={at('Key had no')} to={dawn} strength={0.75} />
        <HangingSign at={at('wait for')} out={dawn} x={1150} y={330} w={500} tone="black" sfx={false}>
          <Wood size={60} font="rye">WAITING FOR MORNING</Wood>
        </HangingSign>

        <Banner15 at={at('the American flag')} out={at('That poem')} x={1080} y={250} w={560} />
        <HangingSign at={at('still flying')} out={at('Key was so')} x={1080} y={660} w={560} tone="blue" sfx={false}>
          <Wood size={70} font="rye">STILL FLYING</Wood>
        </HangingSign>

        <Picture src="img/v2/ssb_manuscript.jpg" at={at('writing a poem')} out={at('A capital')} x={600} y={230} w={420} rot={-2} source="Key's handwritten draft, 1814" />
        <HangingSign at={at('bombs bursting')} out={at('A capital')} x={1250} y={300} w={620} sfx={false}>
          <div style={{fontFamily: F.italic, fontStyle: 'italic', fontSize: 40, lineHeight: 1.3}}>
            “…the bombs bursting in air,
            <br />
            gave proof through the night
            <br />
            that our flag was still there.”
          </div>
          <Wood size={50} font="rye" color={P.vermilion} at={at('Star-Spangled')} style={{marginTop: 14}}>
            THE STAR-SPANGLED BANNER
          </Wood>
          <Small size={26}>made the national anthem in 1931</Small>
        </HangingSign>

        <HangingSign at={at('A capital')} out={END} x={960} y={290} w={880}>
          <div style={{display: 'flex', gap: 40, justifyContent: 'center', alignItems: 'center'}}>
            <div>
              <div style={{fontFamily: F.sc, fontSize: 34}}>Aug. 24</div>
              <Wood size={58} font="rye" color={P.vermilion}>CAPITAL IN ASHES</Wood>
            </div>
            <Wood size={60} font="ultra">→</Wood>
            <div>
              <div style={{fontFamily: F.sc, fontSize: 34}}>Sept. 14</div>
              <Wood size={58} font="rye" color={P.royal} at={at('three weeks')}>A FUTURE ANTHEM</Wood>
            </div>
          </div>
        </HangingSign>

        <DropCurtain keys={[[0, 0], [4, 1], [END + 2, 0]]} />
      </Theater>
    </>
  );
};
