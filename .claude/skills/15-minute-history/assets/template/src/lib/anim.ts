import {Easing, interpolate, spring} from 'remotion';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0 -> 1 spring starting at `at`. */
export const pop = (frame: number, at: number, fps: number, stiffness = 170, damping = 15) =>
  spring({frame: frame - at, fps, config: {stiffness, damping, mass: 0.8}});

/** Opacity for something that fades in at `from` and out at `to`. */
export const life = (frame: number, from: number, to = Infinity, fin = 8, fout = 10) =>
  to === Infinity
    ? interpolate(frame, [from, from + fin], [0, 1], clamp)
    : interpolate(frame, [from, from + fin, to - fout, to], [0, 1, 1, 0], clamp);

/** Eased 0 -> 1 progress between two frames. */
export const prog = (frame: number, from: number, to: number, ease = Easing.inOut(Easing.cubic)) =>
  interpolate(frame, [from, to], [0, 1], {...clamp, easing: ease});
