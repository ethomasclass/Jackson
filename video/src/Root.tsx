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
import {Impressment, IMPRESSMENT_SECONDS} from './v2/Impressment';
import {WarHawks, WAR_HAWKS_SECONDS} from './v2/WarHawks';
import {Tecumseh, TECUMSEH_SECONDS} from './v2/Tecumseh';
import {Ironsides, IRONSIDES_SECONDS} from './v2/Ironsides';
import {WashingtonBurns, WASHINGTON_BURNS_SECONDS} from './v2/WashingtonBurns';
import {FortMcHenry, FORT_MCHENRY_SECONDS} from './v2/FortMcHenry';
import {NewOrleans, NEW_ORLEANS_SECONDS} from './v2/NewOrleans';
import {Lowell, LOWELL_SECONDS} from './v2/Lowell';
import {Legacy, LEGACY_SECONDS} from './v2/Legacy';

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
const V2_SCENES: Scene[] = [
  {id: 'V2-ColdOpen', component: V2ColdOpen, seconds: v2ColdOpen.duration + V2_TITLE_SECONDS},
  {id: 'V2-Impressment', component: Impressment, seconds: IMPRESSMENT_SECONDS},
  {id: 'V2-WarHawks', component: WarHawks, seconds: WAR_HAWKS_SECONDS},
  {id: 'V2-Tecumseh', component: Tecumseh, seconds: TECUMSEH_SECONDS},
  {id: 'V2-Ironsides', component: Ironsides, seconds: IRONSIDES_SECONDS},
  {id: 'V2-WashingtonBurns', component: WashingtonBurns, seconds: WASHINGTON_BURNS_SECONDS},
  {id: 'V2-FortMcHenry', component: FortMcHenry, seconds: FORT_MCHENRY_SECONDS},
  {id: 'V2-NewOrleans', component: NewOrleans, seconds: NEW_ORLEANS_SECONDS},
  {id: 'V2-Lowell', component: Lowell, seconds: LOWELL_SECONDS},
  {id: 'V2-Legacy', component: Legacy, seconds: LEGACY_SECONDS},
];

const frames = (s: Scene) => Math.ceil(s.seconds * FPS);

const playlist = (scenes: Scene[]): React.FC<{captions: boolean}> => ({captions}) => {
  let from = 0;
  return (
    <AbsoluteFill>
      {scenes.map((s) => {
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

const Video1 = playlist(V1_SCENES);
const Video2 = playlist(V2_SCENES);

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
    <Composition
      id="V2"
      component={Video2}
      width={W}
      height={H}
      fps={FPS}
      durationInFrames={V2_SCENES.reduce((n, s) => n + frames(s), 0)}
      defaultProps={{captions: true}}
    />
    {[...V1_SCENES, ...V2_SCENES].map((s) => (
      <Composition key={s.id} id={s.id} component={s.component} width={W} height={H} fps={FPS} durationInFrames={frames(s)} defaultProps={{captions: true}} />
    ))}
  </>
);
