import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setConcurrency(null); // let Remotion pick from available CPUs
// Use a preinstalled headless Chromium when one is present (cloud sessions); otherwise Remotion
// downloads its own.
if (process.env.REMOTION_CHROME) Config.setBrowserExecutable(process.env.REMOTION_CHROME);
