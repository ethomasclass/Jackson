// The chapters, in order. Each is its own composition (Ch01, Ch02, ...); tools/render.sh renders them one at a
// time, joins them and masters once. Add a line per chapter as you build it.
import React from 'react';
import {Ch01, CH01_FRAMES} from './ch/Ch01';
import {Ch02, CH02_FRAMES} from './ch/Ch02';

export const CHAPTERS: {id: string; C: React.FC; frames: number}[] = [
  {id: 'Ch01', C: Ch01, frames: CH01_FRAMES},
  {id: 'Ch02', C: Ch02, frames: CH02_FRAMES},
];
