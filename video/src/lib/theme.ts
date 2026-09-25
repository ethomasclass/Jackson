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
// offline. Fat face = 1820s display type; slab = wood type; Caslon for reading; Fell small caps;
// Pinyon Script for copperplate handwriting.
const FACES: [string, string, string, string][] = [
  ['Abril Fatface', 'AbrilFatface', '400', 'normal'],
  ['Alfa Slab One', 'AlfaSlabOne', '400', 'normal'],
  ['Libre Caslon Text', 'LibreCaslon-Regular', '400', 'normal'],
  ['Libre Caslon Text', 'LibreCaslon-Bold', '700', 'normal'],
  ['Libre Caslon Text', 'LibreCaslon-Italic', '400', 'italic'],
  ['IM Fell English SC', 'IMFellEnglishSC', '400', 'normal'],
  ['Pinyon Script', 'PinyonScript', '400', 'normal'],
  // Video 2: circus-playbill wood type
  ['Rye', 'Rye', '400', 'normal'],
  ['Ultra', 'Ultra', '400', 'normal'],
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
  hand: "'Pinyon Script', cursive",
  rye: "'Rye', serif",
  ultra: "'Ultra', serif",
};

// Video 2: a hand-coloured toy-theater sheet.
export const P = {
  cream: '#F4E9CF',
  card: '#F6EEDA',
  ink: '#1A1512',
  vermilion: '#D2381F',
  royal: '#1F3F8F',
  mustard: '#D9A21B',
  emerald: '#1E7A4F',
  night: '#0B1030',
  wood: '#4A2E1C',
};

export const W = 1920;
export const H = 1080;
export const FPS = 30;
