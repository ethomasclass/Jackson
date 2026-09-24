import React from 'react';
import {Composition} from 'remotion';
import {FPS, H, W} from './lib/theme';
import {ColdOpen, TITLE_SECONDS} from './v1/ColdOpen';
import narration from '../public/audio/v1_cold_open.words.json';

export const Root: React.FC = () => (
  <>
    <Composition
      id="V1-ColdOpen"
      component={ColdOpen}
      width={W}
      height={H}
      fps={FPS}
      durationInFrames={Math.ceil((narration.duration + TITLE_SECONDS) * FPS)}
      defaultProps={{captions: true}}
    />
  </>
);
