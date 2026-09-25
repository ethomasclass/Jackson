import React from 'react';
import {Sequence, useVideoConfig} from 'remotion';
import {Cue, Sfx} from '../components/Scene';
import {F, P} from '../lib/theme';
import {makeTimeline, Narration} from '../lib/timing';
import {Picture, VocabTicket} from '../theater/Props';
import {NameCard, Puppet, SourceTag} from '../theater/Puppet';
import {SCENE_CARD_SECONDS, TheaterScene} from '../theater/Scene';
import {HangingSign, Puff, Small, Wood} from '../theater/Signs';
import {Backcloth, DropCurtain, Flash, Theater, Wash, WaveRow} from '../theater/Stage';
import narration from '../../public/audio/v2_s8_new_orleans.words.json';

const N = narration as Narration;
const TAIL = 24;
export const NEW_ORLEANS_SECONDS = SCENE_CARD_SECONDS + N.duration + TAIL / 30;

/** Scene VIII: Jackson, Lafitte, January 8, 1815 - and a treaty already signed. */
export const NewOrleans: React.FC<{captions: boolean}> = ({captions}) => (
  <TheaterScene narration={N} audio="audio/v2_s8_new_orleans.wav" captions={captions} tail={TAIL} scene={{n: 'VIII', title: 'The General, the Pirate, and a War Already Over', years: '1814 – 1815'}}>
    <Body />
  </TheaterScene>
);

const Body: React.FC = () => {
  const {fps} = useVideoConfig();
  const tl = makeTimeline(N, fps);
  const at = tl.at;
  const END = tl.frames;
  const attack = at('attacked');
  const twist = at("Here's the twist");
  const cam: [number, number, number, number][] = [
    [0, 0.95, 960, 575],
    [at('General Andrew'), 1.06, 760, 600],
    [at('He recruited'), 1.04, 1100, 590],
    [at('On January'), 1.0, 960, 560],
    [at('More than'), 1.04, 960, 575],
    [twist, 1.0, 960, 575],
    [at('Nobody in'), 1.03, 960, 600],
    [END + 20, 0.94, 960, 575],
  ];
  return (
    <>
      <Cue src="music/v2/sea_battle.mp3" at={0} until={twist} level={0.14} fadeIn={20} fadeOut={30} />
      <Cue src="music/gossip.mp3" at={twist} until={END} level={0.12} fadeIn={20} />
      <Sfx src="broadside" at={attack} volume={0.6} />
      <Sfx src="crowd_cheer" at={at('national hero')} volume={0.4} frames={100} />
      <Theater cam={cam} shake={[attack + 3, attack + 20]}>
        <Backcloth src="v2/scenery/new_orleans_plain.jpg" />
        <Backcloth src="v2/scenery/sea_backcloth.jpg" at={at('Nobody in')} />

        <Puppet src="v2/puppets/jackson.png" x={640} y={1000} w={440} in={at('General Andrew')} out={at('He recruited')} from="left" bob={2} seed={1}>
          <NameCard name="GEN. ANDREW JACKSON" sub="commanding at New Orleans" at={at('Jackson') + 4} y={-30} />
        </Puppet>
        <SourceTag text="Andrew Jackson, Thomas Sully, 1845 (painted 30 years later)" at={at('Jackson') + 14} out={at('He recruited')} x={290} y={890} />
        <HangingSign at={at('closing in')} out={at('He recruited')} x={1260} y={310} w={520} tone="red">
          <Wood size={56} font="rye">A BRITISH ARMY</Wood>
          <Wood size={56} font="rye">IS CLOSING IN</Wood>
        </HangingSign>

        <Puppet src="v2/props/lafitte.png" x={1240} y={930} w={250} in={at('Jean Lafitte')} out={at('On January')} from="right" bob={2} seed={4}>
          <NameCard name="JEAN LAFITTE" sub="pirate & smuggler" at={at('Lafitte') + 4} y={-20} red />
        </Puppet>
        <SourceTag text="no confirmed portrait of Lafitte exists; shown in silhouette" tag="NOTE" at={at('pirate') + 6} out={at('On January')} x={960} y={890} />
        <HangingSign at={at('unusual call')} out={at('On January')} x={680} y={320} w={520} sfx={false}>
          <Wood size={56} font="rye">UNUSUAL ALLIES</Wood>
          <Small size={28}>Lafitte's men helped work the American cannons</Small>
        </HangingSign>

        <HangingSign at={at('On January')} out={attack + 10} x={960} y={300} w={560}>
          <Wood size={96} font="ultra">JAN. 8, 1815</Wood>
        </HangingSign>
        <Picture
          src="img/new_orleans_laclotte.jpg"
          at={attack}
          out={at('More than')}
          x={960}
          y={240}
          w={900}
          source="Battle of New Orleans, painted by Hyacinthe Laclotte, an engineer who was there"
          zoom={{to: 1.2, origin: '45% 55%', until: at('More than')}}
        />
        <Flash at={[attack, attack + 17, attack + 40]} />
        <Puff at={attack + 4} x={700} y={640} w={300} i={0} drift={-60} life={90} />
        <Puff at={attack + 22} x={1250} y={620} w={320} i={2} drift={60} life={90} />

        <HangingSign at={at('More than')} out={at('It was the most')} x={960} y={280} w={900}>
          <div style={{display: 'flex', gap: 70, justifyContent: 'center', alignItems: 'flex-end'}}>
            <div>
              <Wood size={130} font="ultra" color={P.vermilion}>2,000+</Wood>
              <div style={{fontFamily: F.slab, fontSize: 32, letterSpacing: 3}}>BRITISH</div>
              <Small size={26}>killed, wounded or captured</Small>
            </div>
            <div>
              <Wood size={130} font="ultra" color={P.royal} at={at('about seventy')}>~70</Wood>
              <div style={{fontFamily: F.slab, fontSize: 32, letterSpacing: 3}}>AMERICAN</div>
              <Small size={26}>losses</Small>
            </div>
          </div>
        </HangingSign>

        <Puppet src="v2/puppets/jackson.png" x={960} y={1000} w={440} in={at('national hero')} out={twist} from="trap" bob={3} seed={2} />
        <HangingSign at={at('national hero')} out={twist} x={960} y={250} w={620} tone="blue" sfx={false}>
          <Wood size={70} font="rye">NATIONAL HERO</Wood>
          <Small size={28} style={{marginTop: 4}}>…and in 1829, the seventh president</Small>
        </HangingSign>

        <Picture
          src="img/v2/ghent_forestier.jpg"
          at={at('Treaty of Ghent')}
          out={at('Nobody in')}
          x={1230}
          y={250}
          w={620}
          source="The Signing of the Treaty of Ghent, Amédée Forestier, 1914"
          tag="LATER PAINTING"
        />
        <HangingSign at={at('in the city') + 8} out={at('Nobody in')} x={560} y={300} w={460} tone="red" sfx={false}>
          <Wood size={50} font="rye">SIGNED DEC. 24, 1814</Wood>
          <Small size={28}>in Ghent, in what's now Belgium</Small>
        </HangingSign>

        <Sequence from={at('Nobody in') - 10} layout="none">
          <WaveRow y={818} color="#2A7F63" dark={P.emerald} phase={1.3} />
        </Sequence>
        <Puppet src="v2/puppets/chesapeake.png" x={1500} y={850} w={320} in={at('Nobody in')} from="fade" rock={2} seed={6} move={[[at('news traveled'), 500, 850]]} />
        <Sequence from={at('Nobody in') - 10} layout="none">
          <WaveRow y={892} color="#2C57A8" dark="#18306E" phase={2.4} scale={1.15} />
        </Sequence>
        <HangingSign at={at('news traveled')} out={at('Andrew Jackson became')} x={960} y={300} w={760}>
          <Wood size={56} font="rye">NEWS TRAVELED BY SHIP</Wood>
          <Small size={30}>Word of the treaty reached Washington on February 14, 1815.</Small>
        </HangingSign>
        <HangingSign at={at('Andrew Jackson became')} out={END} x={960} y={300} w={760} tone="black">
          <div style={{fontFamily: F.slab, fontSize: 34, letterSpacing: 4}}>A LEGEND, FROM A BATTLE IN A WAR THAT WAS</div>
          <Wood size={90} font="ultra" color={P.mustard} at={at('already over')}>ALREADY OVER</Wood>
        </HangingSign>

        <Wash keys={[[0, '#B0B8C8', 0.2], [attack, '#8C5A40', 0.3], [at('national hero'), '#F0C070', 0.15], [twist, '#FFFFFF', 0]]} />
        <DropCurtain keys={[[0, 0], [4, 1], [END + 2, 0]]} />
      </Theater>
      <VocabTicket
        term="Treaty of Ghent"
        label="KEY TERM"
        pos="noun"
        def="the peace treaty that ended the War of 1812"
        at={at('peace treaty') - 2}
        out={at('in the city') + 6}
        tl={tl}
        x={220}
        y={260}
        w={760}
        termSize={72}
      />
    </>
  );
};
