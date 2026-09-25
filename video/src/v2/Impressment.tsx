import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cue} from '../components/Scene';
import {clamp} from '../lib/anim';
import {F, P} from '../lib/theme';
import {makeTimeline, Narration} from '../lib/timing';
import {Picture, VocabTicket} from '../theater/Props';
import {Puppet} from '../theater/Puppet';
import {SCENE_CARD_SECONDS, TheaterScene} from '../theater/Scene';
import {HangingSign, Small, Wood} from '../theater/Signs';
import {Backcloth, DropCurtain, Theater, Wash, WaveRow} from '../theater/Stage';
import narration from '../../public/audio/v2_s2_impressment.words.json';

const N = narration as Narration;
const TAIL = 24;
export const IMPRESSMENT_SECONDS = SCENE_CARD_SECONDS + N.duration + TAIL / 30;

/** Scene II: why British officers were taking sailors off American ships. */
export const Impressment: React.FC<{captions: boolean}> = ({captions}) => (
  <TheaterScene narration={N} audio="audio/v2_s2_impressment.wav" captions={captions} tail={TAIL} scene={{n: 'II', title: 'Stolen Off Our Own Ships', years: '1803 – 1812'}}>
    <Body />
  </TheaterScene>
);

const Body: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tl = makeTimeline(N, fps);
  const at = tl.at;
  const END = tl.frames;
  const cam: [number, number, number, number][] = [
    [0, 0.95, 960, 575],
    [at('Life on'), 1.05, 960, 560],
    [at('So thousands'), 1.0, 960, 600],
    [at("Britain's fix"), 1.08, 960, 560],
    [at('This is called'), 1.0, 960, 575],
    [at('By 1812', 2), 1.06, 960, 560],
    [at('To Americans'), 1.0, 960, 575],
    [END + 20, 0.94, 960, 575],
  ];
  const six = interpolate(frame, [at('six thousand'), at('six thousand') + 26], [0, 6000], clamp);

  return (
    <>
      <Cue src="music/v2/aftermath.mp3" at={0} until={END} level={0.15} fadeIn={30} />
      <Theater cam={cam}>
        <Backcloth src="v2/scenery/deck.jpg" />
        <WaveRow y={905} color="#2C57A8" dark="#18306E" phase={2.4} scale={0.9} />

        {/* deserters slipping across to the American side */}
        {[0, 1, 2, 3].map((i) => (
          <Puppet
            key={i}
            src={`v2/props/sailor_${i}.png`}
            x={420 + i * 70}
            y={900}
            w={110}
            in={at('deserted') + i * 5}
            out={at("Britain's fix")}
            from="fade"
            to="fade"
            rod="below"
            bob={3}
            seed={i}
            move={[[at('signed on') + i * 6, 1100 + i * 110, 900]]}
          />
        ))}
        <HangingSign at={at('So thousands')} out={at("Britain's fix")} x={560} y={290} w={380} tone="red" sfx={false}>
          <Wood size={50} font="rye">ROYAL NAVY</Wood>
          <Small size={28}>low pay, harsh discipline</Small>
        </HangingSign>
        <HangingSign at={at('American ships')} out={at("Britain's fix")} x={1360} y={290} w={380} tone="blue" sfx={false}>
          <Wood size={50} font="rye">AMERICAN SHIPS</Wood>
          <Small size={28}>better pay</Small>
        </HangingSign>

        <Picture
          src="img/v2/impressment_1884.jpg"
          at={at('walk on board')}
          out={at('This is called')}
          x={960}
          y={270}
          w={820}
          source="“Impressment of American Seamen,” illustration, 1884"
          zoom={{to: 1.15, origin: '50% 45%', until: at('This is called')}}
        />

        <Picture
          src="img/v2/protection_cert.jpg"
          at={at('American-born')}
          out={at('By 1812', 2)}
          x={1240}
          y={250}
          w={420}
          rot={2}
          source="citizenship certificate of Daniel Martin, 1804; he was taken from the Chesapeake in 1807"
        />
        <HangingSign at={at('American-born') + 12} out={at('By 1812', 2)} x={720} y={330} w={560} sfx={false}>
          <div style={{fontFamily: F.slab, fontSize: 30, letterSpacing: 3}}>SAILORS CARRIED PAPERS</div>
          <Wood size={44} font="rye" color={P.vermilion}>PROVING THEY WERE AMERICAN</Wood>
          <Small size={30}>British officers often ignored them.</Small>
        </HangingSign>

        <HangingSign at={at('six thousand') - 4} out={at('To Americans')} x={960} y={300} w={760}>
          <div style={{fontFamily: F.slab, fontSize: 36, letterSpacing: 4}}>BY 1812, AT LEAST</div>
          <Wood size={170} font="ultra" color={P.vermilion}>
            {Math.round(six).toLocaleString('en-US')}
          </Wood>
          <div style={{fontFamily: F.slab, fontSize: 40, letterSpacing: 4}}>AMERICANS IMPRESSED</div>
        </HangingSign>

        <Wash keys={[[0, '#FFFFFF', 0], [at('To Americans'), '#C9A070', 0.25]]} />

        <HangingSign at={at('Royal Navy') - 2} out={at('Life on')} x={960} y={300} w={760}>
          <div style={{fontFamily: F.slab, fontSize: 36, letterSpacing: 4}}>BRITAIN vs. FRANCE</div>
          <Wood size={110} font="ultra" at={at('twenty')}>
            ~20 YEARS
          </Wood>
          <div style={{fontFamily: F.slab, fontSize: 36, letterSpacing: 4, marginTop: 10}}>OF WAR · 1793 – 1815</div>
          <Wood size={80} font="rye" color={P.vermilion} at={at('Badly')} style={{marginTop: 12}}>
            SAILORS WANTED!
          </Wood>
        </HangingSign>

        <HangingSign at={at('Life on')} out={at('So thousands')} x={960} y={290} w={720} tone="black">
          <div style={{fontFamily: F.slab, fontSize: 34, letterSpacing: 4}}>LIFE ON A BRITISH WARSHIP</div>
          <Wood size={76} font="rye" at={at('low pay')} style={{marginTop: 10}}>LOW PAY</Wood>
          <Wood size={76} font="rye" at={at('harsh')}>HARSH DISCIPLINE</Wood>
          <Wood size={76} font="rye" at={at('years away')}>YEARS FROM HOME</Wood>
        </HangingSign>

        <HangingSign at={at('It was proof')} out={END} x={960} y={330} w={900} tone="red">
          <div style={{fontFamily: F.slab, fontSize: 32, letterSpacing: 3}}>PROOF BRITAIN DIDN'T TREAT THE U.S. AS</div>
          <Wood size={60} font="rye">A REAL, INDEPENDENT COUNTRY</Wood>
        </HangingSign>

        <DropCurtain keys={[[0, 0], [4, 1], [END + 2, 0]]} />
      </Theater>
      <VocabTicket term="impressment" say="im-PRESS-ment" pos="noun" defFrom="forcing men" defWords={7} at={at('impressment') - 2} out={at('The problem')} tl={tl} x={500} y={250} w={920} />
    </>
  );
};
