// Render review stills at given seconds with one bundle:  node tools/stills.mjs V1-ColdOpen outdir 4.8 10.5 ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const [id, out, ...secs] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = process.env.REMOTION_CHROME || null;
const composition = await selectComposition({serveUrl, id, browserExecutable});
for (const s of secs) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(s) * composition.fps));
  await renderStill({composition, serveUrl, frame, output: path.join(out, `${id}_${s}.jpg`), imageFormat: 'jpeg', browserExecutable});
  console.log('still', s);
}
