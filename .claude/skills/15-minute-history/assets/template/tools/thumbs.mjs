// Render the thumbnail concepts:  node tools/thumbs.mjs  -> renders/thumbnails/<SLUG>_{A,B}.png (1280x720)
// Bundles into out/thumb_bundle (not /tmp) so a chapter render running at the same time can't delete it.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const slug = fs.readFileSync('src/project.ts', 'utf8').match(/export const SLUG = '(.*)';/)[1];
const outDir = path.resolve('out/thumb_bundle');
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), outDir});
const browserExecutable = process.env.REMOTION_CHROME || null;
fs.mkdirSync('renders/thumbnails', {recursive: true});
for (const k of ['A', 'B']) {
  const composition = await selectComposition({serveUrl, id: `Thumb-${k}`, browserExecutable});
  const big = path.resolve(`out/thumb_${k}.png`);
  await renderStill({composition, serveUrl, frame: 140, output: big, imageFormat: 'png', browserExecutable});
  const small = path.resolve(`renders/thumbnails/${slug}_${k}.png`);
  execFileSync('python3', ['-c', `from PIL import Image; Image.open(${JSON.stringify(big)}).convert('RGB').resize((1280, 720), Image.LANCZOS).save(${JSON.stringify(small)})`]);
  console.log('thumb', small);
}
fs.rmSync(outDir, {recursive: true, force: true});
