import React from 'react';
import {AbsoluteFill, Composition, Sequence} from 'remotion';
import {FPS, H, W} from './lib/theme';
import {ColdOpen, TITLE_SECONDS} from './v1/ColdOpen';
import {Election1820, ELECTION_1820_SECONDS} from './v1/Election1820';
import coldOpen from '../public/audio/v1_cold_open.words.json';

const COLD_OPEN_SECONDS = coldOpen.duration + TITLE_SECONDS;

/** Video 1 so far: every scene back to back. */
const Video1: React.FC<{captions: boolean}> = ({captions}) => {
  const s1 = Math.ceil(COLD_OPEN_SECONDS * FPS);
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={s1}>
        <ColdOpen captions={captions} />
      </Sequence>
      <Sequence from={s1} durationInFrames={Math.ceil(ELECTION_1820_SECONDS * FPS)}>
        <Election1820 captions={captions} />
      </Sequence>
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
      durationInFrames={Math.ceil(COLD_OPEN_SECONDS * FPS) + Math.ceil(ELECTION_1820_SECONDS * FPS)}
      defaultProps={{captions: true}}
    />
    <Composition
      id="V1-ColdOpen"
      component={ColdOpen}
      width={W}
      height={H}
      fps={FPS}
      durationInFrames={Math.ceil(COLD_OPEN_SECONDS * FPS)}
      defaultProps={{captions: true}}
    />
    <Composition
      id="V1-Election1820"
      component={Election1820}
      width={W}
      height={H}
      fps={FPS}
      durationInFrames={Math.ceil(ELECTION_1820_SECONDS * FPS)}
      defaultProps={{captions: true}}
    />
  </>
);
