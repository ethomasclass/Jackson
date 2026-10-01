import React from 'react';
import {Composition} from 'remotion';
import {FPS, H, W} from './lib/theme';
import {CHAPTERS} from './chapters';
import {JFonts} from './kit/Kit';
import {ChannelIntro, INTRO_FRAMES} from './kit/Intro';
import {BREAK_FRAMES, LogoBreak} from './kit/LogoBreak';
import {THUMB_FRAMES, ThumbA, ThumbB} from './Thumbnail';

export const Root: React.FC = () => (
  <>
    {CHAPTERS.map((c) => (
      <Composition key={c.id} id={c.id} width={W} height={H} fps={FPS} durationInFrames={c.frames} component={() => <JFonts><c.C /></JFonts>} />
    ))}
    <Composition id="Thumb-A" width={W} height={H} fps={FPS} durationInFrames={THUMB_FRAMES} component={() => <JFonts><ThumbA /></JFonts>} />
    <Composition id="Thumb-B" width={W} height={H} fps={FPS} durationInFrames={THUMB_FRAMES} component={() => <JFonts><ThumbB /></JFonts>} />
    <Composition id="Intro" width={W} height={H} fps={FPS} durationInFrames={INTRO_FRAMES} component={() => <JFonts><ChannelIntro /></JFonts>} />
    <Composition id="LogoBreak" width={W} height={H} fps={FPS} durationInFrames={BREAK_FRAMES} component={() => <JFonts><LogoBreak /></JFonts>} />
  </>
);
