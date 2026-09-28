// Render the King Andrew thumbnail concepts: node tools/thumbs_v3.mjs  -> renders/thumbnails/King_Andrew_{A,B,C}.png (1280x720)
// Bundles into out/thumb_bundle (not /tmp) so a render running at the same time can't delete it.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('out/thumb_bundle');
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), outDir});
const browserExecutable = process.env.REMOTION_CHROME || null;
fs.mkdirSync('renders/thumbnails', {recursive: true});
for (const k of ['A', 'B', 'C']) {
  const composition = await selectComposition({serveUrl, id: `V3-Thumb-${k}`, browserExecutable});
  await renderStill({composition, serveUrl, frame: 140, output: path.resolve(`out/thumb_${k}.png`), imageFormat: 'png', browserExecutable});
  console.log('thumb', k);
}
fs.rmSync(outDir, {recursive: true, force: true});
