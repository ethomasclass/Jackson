import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const plan = JSON.parse(process.argv[2]);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = process.env.REMOTION_CHROME || null;
for (const [id, secs] of Object.entries(plan)) {
  const composition = await selectComposition({serveUrl, id, browserExecutable});
  for (const s of secs) {
    const frame = Math.min(composition.durationInFrames - 1, Math.round(s * composition.fps));
    await renderStill({composition, serveUrl, frame, output: path.join('out/stills2', `${id}_${s}.jpg`), imageFormat: 'jpeg', jpegQuality: 70, browserExecutable});
  }
  console.log('done', id);
}
