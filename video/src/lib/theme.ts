import {continueRender, delayRender, staticFile} from 'remotion';

// Broadside palette: printer's ink, one vermilion, aged paper.
export const C = {
  paper: '#ECE2CA',
  paperLight: '#F7F1E2',
  ink: '#1E1A16',
  inkSoft: '#4A4038',
  red: '#A8322A',
  redDark: '#7E221C',
  gold: '#C8963E',
  fade: '#8C8272',
};

// Fonts are vendored in public/fonts (SIL Open Font License, from Google Fonts) so renders work
// offline. Fat face = 1820s display type; slab = wood type; Caslon for reading; Fell small caps.
const FACES: [string, string, string, string][] = [
  ['Abril Fatface', 'AbrilFatface', '400', 'normal'],
  ['Alfa Slab One', 'AlfaSlabOne', '400', 'normal'],
  ['Libre Caslon Text', 'LibreCaslon-Regular', '400', 'normal'],
  ['Libre Caslon Text', 'LibreCaslon-Bold', '700', 'normal'],
  ['Libre Caslon Text', 'LibreCaslon-Italic', '400', 'italic'],
  ['IM Fell English SC', 'IMFellEnglishSC', '400', 'normal'],
];

if (typeof document !== 'undefined') {
  const handle = delayRender('fonts');
  Promise.all(
    FACES.map(([family, file, weight, style]) => {
      const face = new FontFace(family, `url(${staticFile(`fonts/${file}.woff2`)}) format('woff2')`, {weight, style});
      document.fonts.add(face);
      return face.load();
    }),
  ).then(() => continueRender(handle));
}

export const F = {
  fat: "'Abril Fatface', serif",
  slab: "'Alfa Slab One', serif",
  body: "'Libre Caslon Text', serif",
  italic: "'Libre Caslon Text', serif",
  sc: "'IM Fell English SC', serif",
};

export const W = 1920;
export const H = 1080;
export const FPS = 30;
