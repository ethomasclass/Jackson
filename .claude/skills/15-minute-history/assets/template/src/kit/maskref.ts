// A subject mask made by tools/mask.py (or tools/trace.py): an alpha PNG for the coral tint and outline
// paths for the teal trace. Project masks are listed in src/masks.ts.
import type {MaskData} from './Kit';

export type MaskRef = {alpha: string; data: MaskData};

/** `name` is the file stem tools/mask.py wrote: public/img/masks/<name>_subject_a.png + <name>.json. */
export const maskRef = (name: string, d: unknown): MaskRef => ({alpha: `img/masks/${name}_subject_a.png`, data: d as MaskData});
