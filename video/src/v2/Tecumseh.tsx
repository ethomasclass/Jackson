import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cue, Sfx} from '../components/Scene';
import {clamp} from '../lib/anim';
import {F, P} from '../lib/theme';
import {makeTimeline, Narration} from '../lib/timing';
import {Flames, Picture, VocabTicket} from '../theater/Props';
import {NameCard, Puppet, SourceTag} from '../theater/Puppet';
import {SCENE_CARD_SECONDS, TheaterScene} from '../theater/Scene';
import {HangingSign, Puff, Small, Wood} from '../theater/Signs';
import {Backcloth, DropCurtain, Flash, Theater, Wash} from '../theater/Stage';
import narration from '../../public/audio/v2_s4_tecumseh.words.json';

const N = narration as Narration;
const TAIL = 24;
export const TECUMSEH_SECONDS = SCENE_CARD_SECONDS + N.duration + TAIL / 30;

/** Scene IV: Tecumseh's confederacy, Prophetstown, Tippecanoe, and the turn to Britain. */
export const Tecumseh: React.FC<{captions: boolean}> = ({captions}) => (
  <TheaterScene narration={N} audio="audio/v2_s4_tecumseh.wav" captions={captions} tail={TAIL} scene={{n: 'IV', title: 'The Man Who Dreamed of One Nation', years: '1805 – 1812'}}>
    <Body />
  </TheaterScene>
);

// Nations whose people joined Tecumseh and Tenskwatawa's movement (not whole nations in every case).
const NATIONS = ['Shawnee', 'Kickapoo', 'Potawatomi', 'Ho-Chunk', 'Wyandot', 'Ottawa', 'Ojibwe', 'Sauk', 'Lenape'];

const TREATIES: [string, string][] = [
  ['Greenville', '1795'],
  ['Fort Wayne', '1803'],
  ['Vincennes', '1804'],
  ['Grouseland', '1805'],
];

const Body: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tl = makeTimeline(N, fps);
  const at = tl.at;
  const END = tl.frames;
  const burn = at('burned Prophetstown');
  const cam: [number, number, number, number][] = [
    [0, 0.95, 960, 575],
    [at('For decades'), 1.02, 960, 560],
    [at('A Shawnee'), 1.08, 760, 600],
    [at('dozens'), 1.0, 960, 560],
    [at('With his brother'), 1.05, 1080, 590],
    [at('The governor'), 1.05, 960, 590],
    [at("Tenskwatawa's warriors"), 1.12, 960, 560],
    [burn, 1.06, 960, 620],
    [at('When Tecumseh returned'), 1.15, 960, 620],
    [at('So he turned'), 1.0, 960, 575],
    [END + 20, 0.94, 960, 575],
  ];
  const acres = interpolate(frame, [at('three million'), at('three million') + 24], [0, 3000000], clamp);
  const unite = spring({frame: frame - at('united into'), fps, config: {stiffness: 40, damping: 14}});

  return (
    <>
      <Cue src="music/v2/frontier.mp3" at={0} until={END} level={0.17} fadeIn={30} />
      <Sfx src="broadside" at={at('struck first')} volume={0.35} />
      <Theater cam={cam} shake={[at('struck first') + 3]}>
        <Backcloth src="v2/scenery/wabash_woods.jpg" />

        <HangingSign at={at('Indiana Territory')} out={at('For decades')} x={960} y={320} w={640}>
          <Wood size={84} font="rye">INDIANA TERRITORY</Wood>
          <Small>north of the Ohio River</Small>
        </HangingSign>

        {TREATIES.map(([name, yr], i) => (
          <HangingSign key={name} at={at('signing') + i * 9} out={at('One treaty')} x={520 + i * 300} y={300 + (i % 2) * 70} w={260} sfx={i === 0} rot={i % 2 ? 2 : -2}>
            <div style={{fontFamily: F.slab, fontSize: 24, letterSpacing: 3}}>TREATY OF</div>
            <Wood size={40} font="rye">{name.toUpperCase()}</Wood>
            <div style={{fontFamily: F.sc, fontSize: 30}}>{yr}</div>
          </HangingSign>
        ))}
        <HangingSign at={at('One treaty')} out={at('A Shawnee')} x={960} y={290} w={820}>
          <div style={{fontFamily: F.slab, fontSize: 36, letterSpacing: 4}}>TREATY OF FORT WAYNE, 1809</div>
          <Wood size={130} font="ultra" color={P.vermilion}>{Math.round(acres).toLocaleString('en-US')}</Wood>
          <div style={{fontFamily: F.slab, fontSize: 44, letterSpacing: 6}}>ACRES</div>
        </HangingSign>

        {/* Tecumseh: no likeness made in his lifetime survives, so he appears as a silhouette */}
        <Puppet
          src="v2/props/tecumseh.png"
          x={560}
          y={930}
          w={300}
          in={at('Tecumseh')}
          out={at('The governor')}
          from="left"
          bob={2}
          seed={1}
        >
          <NameCard name="TECUMSEH" sub="Shawnee leader" at={at('Tecumseh') + 4} out={at('With his brother')} y={-40} />
        </Puppet>
        <SourceTag text="no portrait of Tecumseh from his lifetime survives" tag="NOTE" at={at('Tecumseh') + 16} out={at('No single')} x={300} y={890} />

        {/* many nations drawing together into one confederacy */}
        {NATIONS.map((n, i) => {
          const a = (i / NATIONS.length) * Math.PI * 2;
          const r = 520 - 330 * unite;
          const show = interpolate(frame, [at('dozens') + i * 3, at('dozens') + i * 3 + 8], [0, 1], clamp) * interpolate(frame, [at('With his brother') - 8, at('With his brother')], [1, 0], clamp);
          if (show <= 0) return null;
          return (
            <div
              key={n}
              style={{
                position: 'absolute',
                left: 1300 + Math.cos(a) * r * 0.75,
                top: 560 + Math.sin(a) * r * 0.55,
                transform: 'translate(-50%, -50%)',
                opacity: show,
                background: P.card,
                border: `3px solid ${P.ink}`,
                padding: '6px 16px',
                fontFamily: F.slab,
                fontSize: 26,
                letterSpacing: 2,
                boxShadow: '4px 6px 10px rgba(0,0,0,0.35)',
                zIndex: 12,
              }}
            >
              {n.toUpperCase()}
            </div>
          );
        })}
        <HangingSign at={at('confederacy') + 6} out={at('With his brother')} x={1300} y={500} w={420} tone="red" sfx={false}>
          <Wood size={56} font="rye">ONE ALLIANCE</Wood>
        </HangingSign>

        <Puppet src="v2/puppets/tenskwatawa.png" x={1260} y={1000} w={420} in={at('brother')} out={at('The governor')} from="right" bob={2} seed={4}>
          <NameCard name="TENSKWATAWA" sub="“the Prophet,” Tecumseh's brother" at={at('Tenskwatawa') + 4} y={-40} red />
        </Puppet>
        <SourceTag text="Tenskwatawa, painted from life by George Catlin, 1830" at={at('known as') + 6} out={at('The governor')} x={1000} y={890} />
        <HangingSign at={at('Prophetstown')} out={at('The governor')} x={700} y={330} w={520}>
          <Wood size={64} font="rye">PROPHETSTOWN</Wood>
          <Small size={28}>founded 1808, where the Tippecanoe River meets the Wabash</Small>
        </HangingSign>

        <Puppet src="v2/puppets/harrison.png" x={700} y={1000} w={430} in={at('William Henry')} out={at("Tenskwatawa's warriors")} from="left" bob={2} seed={6}>
          <NameCard name="WILLIAM HENRY HARRISON" sub="governor of the Indiana Territory" at={at('Harrison') + 4} y={-40} />
        </Puppet>
        <SourceTag text="William Henry Harrison, portrait by James Lambdin, 1835" at={at('Harrison') + 14} out={at('In November')} x={300} y={890} />
        <HangingSign at={at('threat')} out={at('In November')} x={1260} y={330} w={420} tone="red" sfx={false}>
          <Wood size={70} font="ultra">A THREAT</Wood>
        </HangingSign>
        <HangingSign at={at('November')} out={at("Tenskwatawa's warriors")} x={1250} y={300} w={520}>
          <Wood size={80} font="ultra">NOV. 1811</Wood>
          <Small size={30}>about 1,000 soldiers march on Prophetstown</Small>
        </HangingSign>

        <Picture
          src="img/v2/tippecanoe_kurz.jpg"
          at={at("Tenskwatawa's warriors")}
          out={burn - 6}
          x={960}
          y={250}
          w={940}
          source="Battle of Tippecanoe, a popular print made in 1889"
          tag="LATER PRINT"
          zoom={{to: 1.2, origin: '50% 50%', until: burn}}
        />
        <HangingSign at={at('heavy losses')} out={burn - 6} x={960} y={800} w={640} tone="black" sfx={false}>
          <Wood size={54} font="rye">HEAVY LOSSES ON BOTH SIDES</Wood>
        </HangingSign>

        <Flames at={burn} out={at('When Tecumseh returned') + 6} x={960} y={920} w={1400} n={9} seed={2} />
        <Puff at={burn + 10} x={700} y={520} w={380} i={0} drift={-80} life={110} />
        <Puff at={burn + 26} x={1200} y={480} w={420} i={2} drift={60} life={110} />
        <HangingSign at={burn + 4} out={at('When Tecumseh returned')} x={960} y={300} w={640} tone="red">
          <Wood size={64} font="rye">PROPHETSTOWN BURNED</Wood>
        </HangingSign>

        <Wash
          keys={[
            [0, '#FFFFFF', 0],
            [at("Tenskwatawa's warriors"), '#8FA0D0', 0.35],
            [burn, '#C0502A', 0.45],
            [at('When Tecumseh returned'), '#5A5A66', 0.55],
            [at('So he turned'), '#C9B08A', 0.2],
          ]}
        />
        <Flash at={[at('struck first'), at('struck first') + 9, at('bloody')]} />

        <Puppet src="v2/props/tecumseh.png" x={960} y={930} w={280} in={at('When Tecumseh returned')} out={END} from="fade" bob={1} seed={3} move={[[at('turned to'), 700, 930]]} />
        <HangingSign at={at('ashes')} out={at('So he turned')} x={960} y={320} w={460} tone="black" sfx={false}>
          <Wood size={80} font="ultra">ASHES</Wood>
        </HangingSign>
        <HangingSign at={at('the British')} out={at('Now Britain')} x={1240} y={320} w={560} tone="red">
          <div style={{fontFamily: F.slab, fontSize: 34, letterSpacing: 4}}>TECUMSEH'S CONFEDERACY</div>
          <Wood size={72} font="rye">ALLIES WITH BRITAIN</Wood>
        </HangingSign>
        <HangingSign at={at('to settlers')} out={END} x={1180} y={320} w={680}>
          <div style={{fontFamily: F.slab, fontSize: 34, letterSpacing: 4}}>TO SETTLERS OUT WEST:</div>
          <Wood size={70} font="rye" color={P.vermilion} at={at('the enemy')}>BRITAIN = THE ENEMY</Wood>
        </HangingSign>

        <DropCurtain keys={[[0, 0], [4, 1], [END + 2, 0]]} />
      </Theater>
      <VocabTicket
        term="confederacy"
        say="kun-FED-er-uh-see"
        pos="noun"
        def="an alliance of separate groups that join together for a shared goal"
        at={at('confederacy') + 2}
        out={at('With his brother') - 4}
        tl={tl}
        x={250}
        y={250}
        w={760}
        termSize={80}
      />
    </>
  );
};
