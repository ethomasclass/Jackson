"""Proof of concept: what a runtime lighting pass would add. Post-processes an
existing screenshot: cold night grade, warm light pools from windows and lamps,
contact shadows under buildings, snow sparkle. This is the look the engine
could produce live with a light-map canvas composited over the scene."""
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
import sys

src = Image.open(sys.argv[1]).convert('RGB')
W, H = src.size
a = np.asarray(src).astype(np.float32) / 255.0

# 1. find warm windows (lit) and lamps by colour: yellow-ish bright pixels
r, g, b = a[..., 0], a[..., 1], a[..., 2]
lit = ((r > 0.85) & (g > 0.7) & (b < 0.6)).astype(np.float32)
# 2. base night grade: cool shadows, slightly desaturated
lum = 0.3 * r + 0.59 * g + 0.11 * b
cool = np.stack([lum * 0.62 + 0.02, lum * 0.66 + 0.04, lum * 0.82 + 0.10], -1)
graded = a * 0.45 + cool * 0.55
# 3. light pools: blur the lit mask heavily, tint warm, add
pool = Image.fromarray((lit * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(28))
pool = np.asarray(pool).astype(np.float32) / 255.0
pool2 = np.asarray(Image.fromarray((lit * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(9))).astype(np.float32) / 255.0
warm = np.stack([pool * 1.6 + pool2 * 0.8, pool * 1.1 + pool2 * 0.55, pool * 0.45 + pool2 * 0.2], -1)
out = graded + a * warm * 1.4          # light reveals the underlying colour
# 4. contact shadow: dark pixels (building bases / roof lines) cast a soft drop below
dark = (lum < 0.18).astype(np.float32)
sh = np.roll(dark, 6, axis=0)
sh = np.asarray(Image.fromarray((sh * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(5))).astype(np.float32) / 255.0
out *= (1 - 0.35 * sh[..., None])
# 5. vignette
yy, xx = np.mgrid[0:H, 0:W]
d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
out *= (1 - 0.35 * np.clip(d - 0.55, 0, 1) ** 1.5)[..., None]
out = np.clip(out, 0, 1)
im = Image.fromarray((out * 255).astype(np.uint8))
# side by side
sheet = Image.new('RGB', (W * 2 + 8, H), (20, 16, 20))
sheet.paste(src, (0, 0)); sheet.paste(im, (W + 8, 0))
sheet.save(sys.argv[2])
print(sys.argv[2])
