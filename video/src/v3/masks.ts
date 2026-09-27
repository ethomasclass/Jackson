// Subject masks made by tools/mask_v3.py: alpha PNG for the coral tint + outline paths for the teal trace.
import type {MaskData} from './Kit';
import sully from '../../public/img/v3/masks/sully.json';
import parton from '../../public/img/v3/masks/parton.json';
import king_andrew from '../../public/img/v3/masks/king_andrew.json';
import brave_boy from '../../public/img/v3/masks/brave_boy.json';
import rachel from '../../public/img/v3/masks/rachel.json';
import clay from '../../public/img/v3/masks/clay.json';
import jqa from '../../public/img/v3/masks/jqa.json';
import calhoun from '../../public/img/v3/masks/calhoun.json';
import peggy from '../../public/img/v3/masks/peggy.json';
import story from '../../public/img/v3/masks/story.json';
import sequoyah from '../../public/img/v3/masks/sequoyah.json';
import ross from '../../public/img/v3/masks/ross.json';
import toast from '../../public/img/v3/masks/toast.json';
import voters_a from '../../public/img/v3/masks/voters_a.json';
import voters_b from '../../public/img/v3/masks/voters_b.json';
import voters_c from '../../public/img/v3/masks/voters_c.json';
import snub from '../../public/img/v3/masks/snub.json';
import kitchen from '../../public/img/v3/masks/kitchen.json';

export type MaskRef = {alpha: string; data: MaskData};
const ref = (name: string, d: unknown): MaskRef => ({alpha: `img/v3/masks/${name}_subject_a.png`, data: d as MaskData});
export const MASKS = {
  sully: ref('sully', sully),
  parton: ref('parton', parton),
  king_andrew: ref('king_andrew', king_andrew),
  brave_boy: ref('brave_boy', brave_boy),
  rachel: ref('rachel', rachel),
  clay: ref('clay', clay),
  jqa: ref('jqa', jqa),
  calhoun: ref('calhoun', calhoun),
  peggy: ref('peggy', peggy),
  story: ref('story', story),
  sequoyah: ref('sequoyah', sequoyah),
  ross: ref('ross', ross),
  voters_a: ref('voters_a', voters_a),
  voters_b: ref('voters_b', voters_b),
  voters_c: ref('voters_c', voters_c),
  snub: ref('snub', snub),
  kitchen: ref('kitchen', kitchen),
  /** Gemini mask pass (magenta) of the banquet painting: the man raising the glass. */
  toast: {alpha: 'img/v3/masks/toast_magenta_a.png', data: {...(toast as unknown as MaskData), shapes: {subject: (toast as unknown as MaskData).shapes.magenta}}} as MaskRef,
};
