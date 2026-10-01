import {continueRender, delayRender, staticFile} from 'remotion';

// Fonts are vendored in public/fonts (SIL Open Font License, from Google Fonts) so renders work offline.
// Abril Fatface = titles, Nanum Pen Script = handwriting, IBM Plex Mono = source tags,
// Inter = definition bars, Playfair Display 900 = primary-source quotes.
const FACES: [string, string, string, string][] = [
  ['Abril Fatface', 'AbrilFatface', '400', 'normal'],
  ['Nanum Pen Script', 'NanumPenScript', '400', 'normal'],
  ['IBM Plex Mono', 'IBMPlexMono', '400', 'normal'],
  ['Inter', 'Inter-600', '600', 'normal'],
  ['Inter', 'Inter-800', '800', 'normal'],
  ['Playfair Display', 'PlayfairDisplay-900', '900', 'normal'],
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

export const W = 1920;
export const H = 1080;
export const FPS = 30;
