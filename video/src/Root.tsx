import React from 'react';
import {AbsoluteFill, Composition, Sequence} from 'remotion';
import {FPS, H, W} from './lib/theme';
import {ColdOpen, TITLE_SECONDS} from './v1/ColdOpen';
import {Election1820, ELECTION_1820_SECONDS} from './v1/Election1820';
import {Judas1824, JUDAS_1824_SECONDS} from './v1/Judas1824';
import {Campaign1828, CAMPAIGN_1828_SECONDS} from './v1/Campaign1828';
import {PunchBowl, PUNCH_BOWL_SECONDS} from './v1/PunchBowl';
import {EndCard, END_CARD_SECONDS, Petticoat, PETTICOAT_SECONDS} from './v1/Petticoat';
import coldOpen from '../public/audio/v1_cold_open.words.json';
import {ColdOpen as V2ColdOpen, V2_TITLE_SECONDS} from './v2/ColdOpen';
import v2ColdOpen from '../public/audio/v2_cold_open.words.json';

type Scene = {id: string; component: React.FC<{captions: boolean}>; seconds: number};

/** Video 1 in order. Each scene is also its own composition for quick previews. */
const V1_SCENES: Scene[] = [
  {id: 'V1-ColdOpen', component: ColdOpen, seconds: coldOpen.duration + TITLE_SECONDS},
  {id: 'V1-Election1820', component: Election1820, seconds: ELECTION_1820_SECONDS},
  {id: 'V1-Judas1824', component: Judas1824, seconds: JUDAS_1824_SECONDS},
  {id: 'V1-Campaign1828', component: Campaign1828, seconds: CAMPAIGN_1828_SECONDS},
  {id: 'V1-PunchBowl', component: PunchBowl, seconds: PUNCH_BOWL_SECONDS},
  {id: 'V1-Petticoat', component: Petticoat, seconds: PETTICOAT_SECONDS},
  {id: 'V1-End', component: EndCard, seconds: END_CARD_SECONDS},
];

/** Video 2, "The War Nobody Won" (toy theater). */
const V2_SCENES: Scene[] = [{id: 'V2-ColdOpen', component: V2ColdOpen, seconds: v2ColdOpen.duration + V2_TITLE_SECONDS}];

const frames = (s: Scene) => Math.ceil(s.seconds * FPS);

const Video1: React.FC<{captions: boolean}> = ({captions}) => {
  let from = 0;
  return (
    <AbsoluteFill>
      {V1_SCENES.map((s) => {
        const seq = (
          <Sequence key={s.id} from={from} durationInFrames={frames(s)}>
            <s.component captions={captions} />
          </Sequence>
        );
        from += frames(s);
        return seq;
      })}
    </AbsoluteFill>
  );
};

export const Root: React.FC = () => (
  <>
    <Composition
      id="V1"
      component={Video1}
      width={W}
      height={H}
      fps={FPS}
      durationInFrames={V1_SCENES.reduce((n, s) => n + frames(s), 0)}
      defaultProps={{captions: true}}
    />
    {[...V1_SCENES, ...V2_SCENES].map((s) => (
      <Composition key={s.id} id={s.id} component={s.component} width={W} height={H} fps={FPS} durationInFrames={frames(s)} defaultProps={{captions: true}} />
    ))}
  </>
);
