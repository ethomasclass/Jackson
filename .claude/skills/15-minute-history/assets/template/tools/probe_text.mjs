// Text-fit check: renders every Nth frame of each composition with the probe on and prints any text
// that crosses the frame edge.   node tools/probe_text.mjs Ch01,Ch02 [everyNth=10]
import {bundle} from '@remotion/bundler';
import {renderFrames, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
const ids = process.argv[2].split(',');
const nth = Number(process.argv[3] || 10);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = process.env.REMOTION_CHROME || null;
const inputProps = {probe: true};
const hits = [];
const counts = {};
const sizes = {};
for (const id of ids) {
  const composition = await selectComposition({serveUrl, id, browserExecutable, inputProps});
  sizes[id] = [composition.width, composition.height];
  const outputDir = path.resolve('out/probe_frames');
  fs.mkdirSync(outputDir, {recursive: true});
  await renderFrames({composition, serveUrl, inputProps, browserExecutable, outputDir, imageFormat: 'none', everyNthFrame: nth, frameRange: process.env.FRAMES ? process.env.FRAMES.split('-').map(Number) : null, concurrency: 2, timeoutInMilliseconds: 180000,
    onStart: () => {}, onFrameUpdate: () => {},
    onBrowserLog: (log) => { if (log.text.startsWith('PROBECOUNT ')) counts[id] = (counts[id] || 0) + Number(log.text.slice(11)); else if (log.text.startsWith('PROBE ')) hits.push({id, ...JSON.parse(log.text.slice(6))}); }});
  console.log('checked', id, Math.ceil(composition.durationInFrames / nth), 'sampled frames,', counts[id] || 0, 'text boxes measured');
}
// Collapse repeats of the same text into one line with its frame range.
// Text wholly outside the frame is never seen (e.g. a map label the camera has panned past); only partial cuts count.
const seen = new Map();
for (const h of hits.filter((h) => h.r > 0 && h.l < sizes[h.id][0] && h.b > 0 && h.t < sizes[h.id][1])) {
  const k = h.id + '|' + h.text;
  const s = seen.get(k);
  if (!s) seen.set(k, {...h, f0: h.f, f1: h.f, maxOver: h.over});
  else { s.f0 = Math.min(s.f0, h.f); s.f1 = Math.max(s.f1, h.f); if (h.over > s.maxOver) Object.assign(s, {maxOver: h.over, l: h.l, t: h.t, r: h.r, b: h.b}); }
}
const rows = [...seen.values()].sort((a, b) => a.id.localeCompare(b.id) || a.f0 - b.f0);
for (const r of rows) console.log(`${r.id}  ${(r.f0 / 30).toFixed(1)}–${(r.f1 / 30).toFixed(1)}s  over ${r.maxOver}px  box ${r.l},${r.t} → ${r.r},${r.b}  "${r.text}"`);
console.log(rows.length ? `${rows.length} overflowing text items` : 'no text crosses the frame edge');
fs.writeFileSync('out/probe_report.json', JSON.stringify(rows, null, 1));
fs.rmSync(serveUrl, {recursive: true, force: true});
