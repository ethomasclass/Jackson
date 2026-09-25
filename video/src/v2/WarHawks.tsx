import React from 'react';
import {useVideoConfig} from 'remotion';
import {Cue} from '../components/Scene';
import {F, P} from '../lib/theme';
import {makeTimeline, Narration} from '../lib/timing';
import {Picture, VocabTicket} from '../theater/Props';
import {NameCard, Puppet, SourceTag} from '../theater/Puppet';
import {SCENE_CARD_SECONDS, TheaterScene} from '../theater/Scene';
import {HangingSign, Scroll, Small, Wood} from '../theater/Signs';
import {Backcloth, DropCurtain, Theater, Wash} from '../theater/Stage';
import narration from '../../public/audio/v2_s3_war_hawks.words.json';

const N = narration as Narration;
const TAIL = 24;
export const WAR_HAWKS_SECONDS = SCENE_CARD_SECONDS + N.duration + TAIL / 30;

/** Scene III: the War Hawks, Henry Clay, and Calhoun's four-week boast. */
export const WarHawks: React.FC<{captions: boolean}> = ({captions}) => (
  <TheaterScene narration={N} audio="audio/v2_s3_war_hawks.wav" captions={captions} tail={TAIL} scene={{n: 'III', title: 'The Four-Week Boast', years: '1811 – 1812'}}>
    <Body />
  </TheaterScene>
);

const Body: React.FC = () => {
  const {fps} = useVideoConfig();
  const tl = makeTimeline(N, fps);
  const at = tl.at;
  const END = tl.frames;
  const cam: [number, number, number, number][] = [
    [0, 0.95, 960, 575],
    [at('Newspapers'), 1.02, 960, 575],
    [at('Their leader'), 1.08, 820, 590],
    [at('They wanted'), 1.0, 960, 560],
    [at('One of'), 1.08, 1100, 590],
    [at('Four weeks.', 2), 1.0, 960, 575],
    [END + 20, 0.94, 960, 575],
  ];
  return (
    <>
      <Cue src="music/campaign.mp3" at={0} until={END} level={0.12} fadeIn={20} />
      <Theater cam={cam}>
        <Backcloth src="img/house_morse_1822.jpg" />
        <SourceTag text="the House of Representatives, painted by Samuel Morse, 1822" at={20} out={at('Their leader')} x={280} y={880} />
        <Wash keys={[[0, '#FFFFFF', 0], [at('They wanted'), '#D8C9A8', 0.2], [at('One of'), '#FFFFFF', 0]]} />

        <HangingSign at={at('young')} out={at('Newspapers')} x={960} y={300} w={760}>
          <div style={{fontFamily: F.slab, fontSize: 36, letterSpacing: 4}}>NEW IN CONGRESS, 1811</div>
          <Wood size={84} font="rye" at={at('young')}>YOUNG · LOUD</Wood>
          <Wood size={60} font="ultra" color={P.vermilion} at={at('South and')}>FROM THE SOUTH &amp; WEST</Wood>
        </HangingSign>

        <Puppet src="v2/puppets/clay.png" x={640} y={1000} w={480} in={at('Their leader')} out={at('They wanted')} from="trap" bob={3} seed={2}>
          <NameCard name="HENRY CLAY" sub="Kentucky · age 34" at={at('Henry Clay') + 6} x="50%" y={-30} />
        </Puppet>
        <SourceTag text="Henry Clay, portrait by Matthew Jouett, 1818" at={at('Henry Clay') + 14} out={at('They wanted')} x={300} y={890} />
        <HangingSign at={at('Speaker')} out={at('They wanted')} x={1240} y={320} w={560} tone="red" sfx={false}>
          <Wood size={64} font="rye">SPEAKER OF THE HOUSE</Wood>
          <Small size={30}>the most powerful job in Congress</Small>
        </HangingSign>

        <Picture src="img/v2/kensett_map.jpg" at={at('wanted Canada')} out={at('One of')} x={960} y={250} w={880} source="a map of Canada printed in 1812" zoom={{to: 1.25, origin: '55% 55%', until: at('One of')}} />
        <HangingSign at={at('why not')} out={at('One of')} x={960} y={760} w={760} tone="red" sfx={false}>
          <Wood size={60} font="rye">WHY NOT TAKE BRITAIN'S LAND TOO?</Wood>
        </HangingSign>

        <Puppet src="v2/puppets/calhoun.png" x={1300} y={1000} w={470} in={at('One of')} out={at('Remember')} from="right" bob={3} seed={5}>
          <NameCard name="JOHN C. CALHOUN" sub="South Carolina" at={at('Calhoun') - 4} x="50%" y={-30} red />
        </Puppet>
        <SourceTag text="John C. Calhoun, portrait by G.P.A. Healy, 1845 (painted years later)" at={at('Calhoun') + 10} out={at('Four weeks.', 2)} x={1000} y={890} />
        <Scroll at={at('told Congress')} out={at('Four weeks.', 2)} x={330} y={330} w={640} rot={-2}>
          <div style={{fontFamily: F.italic, fontStyle: 'italic', fontSize: 34, lineHeight: 1.35, color: P.ink, maxWidth: 640, whiteSpace: 'normal'}}>
            “I believe that in <span style={{fontFamily: F.rye, fontStyle: 'normal', fontSize: 46, color: P.vermilion}}>four weeks</span> from the time a declaration of war is heard on our frontier, the whole of Upper Canada and a part of Lower Canada will be in our power.”
          </div>
          <div style={{fontFamily: F.sc, fontSize: 24, marginTop: 10}}>— John C. Calhoun, speaking in Congress</div>
        </Scroll>

        <HangingSign at={at('Four weeks.', 2)} out={END} x={960} y={300} w={640}>
          <Wood size={190} font="ultra" color={P.vermilion}>4 WEEKS</Wood>
          <Wood size={50} font="rye" at={at('Remember')} style={{marginTop: 10}}>REMEMBER THAT NUMBER.</Wood>
        </HangingSign>

        <DropCurtain keys={[[0, 0], [4, 1], [END + 2, 0]]} />
      </Theater>
      <VocabTicket
        term="War Hawks"
        pos="noun"
        def="young congressmen who pushed hard for war with Britain in 1811–1812"
        at={at('War Hawks') - 2}
        out={at('Their leader')}
        tl={tl}
        x={500}
        y={260}
        w={920}
      />
    </>
  );
};
