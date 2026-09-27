// The King Andrew chapters, in order. Each renders on its own (tools/render_v3.sh joins them).
import React from 'react';
import {Ch01, CH01_FRAMES} from './ch/Ch01';
import {Ch02, CH02_FRAMES} from './ch/Ch02';
import {Ch03, CH03_FRAMES} from './ch/Ch03';
import {Ch04, CH04_FRAMES} from './ch/Ch04';
import {Ch05, CH05_FRAMES} from './ch/Ch05';
import {Ch06, CH06_FRAMES} from './ch/Ch06';
import {Ch07, CH07_FRAMES} from './ch/Ch07';
import {Ch08, CH08_FRAMES} from './ch/Ch08';
import {Ch09, CH09_FRAMES} from './ch/Ch09';
import {Ch10, CH10_FRAMES} from './ch/Ch10';
import {Ch11, CH11_FRAMES} from './ch/Ch11';

export const V3_CHAPTERS: {id: string; C: React.FC; frames: number}[] = [
  {id: 'V3-Ch01', C: Ch01, frames: CH01_FRAMES},
  {id: 'V3-Ch02', C: Ch02, frames: CH02_FRAMES},
  {id: 'V3-Ch03', C: Ch03, frames: CH03_FRAMES},
  {id: 'V3-Ch04', C: Ch04, frames: CH04_FRAMES},
  {id: 'V3-Ch05', C: Ch05, frames: CH05_FRAMES},
  {id: 'V3-Ch06', C: Ch06, frames: CH06_FRAMES},
  {id: 'V3-Ch07', C: Ch07, frames: CH07_FRAMES},
  {id: 'V3-Ch08', C: Ch08, frames: CH08_FRAMES},
  {id: 'V3-Ch09', C: Ch09, frames: CH09_FRAMES},
  {id: 'V3-Ch10', C: Ch10, frames: CH10_FRAMES},
  {id: 'V3-Ch11', C: Ch11, frames: CH11_FRAMES},
];
