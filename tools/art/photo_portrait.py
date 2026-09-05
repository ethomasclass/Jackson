"""Turn a period painting into a hi-bit pixel portrait.

Pipeline: crop -> downsample with area averaging -> cluster-smooth (median) so
shading forms flat regions like hand-placed pixels -> quantize to a small
palette (median cut, no dither) -> optional ordered dither on the largest
gradients -> crisp 1px dark rim where the figure meets the background ->
composite into the game's portrait frame.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance, ImageOps
from common import Canvas, PAL, mix, preview, ASSETS
import os

REF = os.path.join(os.path.dirname(__file__), "ref")

# name -> (crop box in source pixels, colours, extra adjustments)
PORTRAITS = {
    "jackson": dict(box=(250, 0, 1400, 1150), colors=24, contrast=1.15, gamma=1.0),
    "biddle": dict(box=(300, 210, 1060, 970), colors=24, contrast=1.15, gamma=1.0, tint=True),
    "clay": dict(box=(0.30, 0.16, 0.74, 0.60), colors=24, contrast=1.15, gamma=1.0),
    "gregory": dict(box=(0.26, 0.05, 0.70, 0.49), colors=22, contrast=1.15, gamma=1.0),
    "calhoun": dict(box=(38, 8, 168, 138), colors=24, contrast=1.2, gamma=1.0, sharpen=1.2),
    "ross": dict(box=(115, 55, 425, 365), colors=26, contrast=1.1, gamma=1.0),
    "key": dict(box=(240, 110, 900, 770), colors=24, contrast=1.15, gamma=1.0),
    "lawrence": dict(box=(0.32, 0.17, 0.66, 0.51), colors=22, contrast=1.2, gamma=1.0),
    "magistrate": dict(box=(0.30, 0.10, 0.72, 0.52), colors=24, contrast=1.2, gamma=1.0),
    "poindexter": dict(box=(0.31, 0.16, 0.61, 0.46), colors=24, contrast=1.25, gamma=0.68),
}
SIZE = 128


def bayer(n=4):
    m = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], dtype=np.float32) / 16.0
    return m


def make(name, size=SIZE, colors=None, dither=0.0):
    spec = PORTRAITS[name]
    im = Image.open(os.path.join(REF, name + ".jpg")).convert("RGB")
    box = spec["box"]
    if all(v <= 1 for v in box):   # fractional box
        W, H = im.size
        box = (int(box[0] * W), int(box[1] * H), int(box[2] * W), int(box[3] * H))
    im = im.crop(box)
    if spec.get("tint"):   # monochrome photograph of a painting: warm duotone so it sits with the colour portraits
        g = ImageOps.autocontrast(im.convert("L"), cutoff=1)
        im = ImageOps.colorize(g, black=(26, 18, 16), mid=(150, 104, 78), white=(244, 220, 190), midpoint=140)
    # gentle pre-clean at high res, then area-average down
    if spec.get("sharpen"):   # low-res sources: recover edges before we downsample
        im = im.resize((size * 2, size * 2), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=3, percent=int(80 * spec["sharpen"]), threshold=2))
    im = ImageEnhance.Contrast(im).enhance(spec.get("contrast", 1.0))
    if spec.get("gamma", 1.0) != 1.0:
        g = spec["gamma"]
        im = im.point(lambda v: int(255 * ((v / 255) ** g)))
    im = im.resize((size * 2, size * 2), Image.LANCZOS)
    im = im.filter(ImageFilter.MedianFilter(5))
    im = im.resize((size, size), Image.BOX)
    im = im.filter(ImageFilter.MedianFilter(3))
    # ordered dither: nudge values by a bayer pattern before quantising so smooth
    # gradients break into pixel-art dither instead of banding
    if dither:
        a = np.asarray(im).astype(np.float32)
        b = np.tile(bayer(), (size // 4 + 1, size // 4 + 1))[:size, :size]
        a += (b[..., None] - 0.5) * dither * 255
        im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    q = im.quantize(colors=colors or spec["colors"], method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    im = q.convert("RGB")
    # crisp rim: darken pixels whose neighbour is much brighter/darker (edge emphasis, pixel-art style)
    a = np.asarray(im).astype(np.float32)
    lum = a.mean(-1)
    gy = np.abs(np.diff(lum, axis=0, prepend=lum[:1]))
    gx = np.abs(np.diff(lum, axis=1, prepend=lum[:, :1]))
    edge = np.clip((gx + gy) / 140.0, 0, 1)
    a *= (1 - 0.35 * edge)[..., None]
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    # frame
    c = Canvas(size, size)
    c.img.paste(im, (0, 0))
    c.px = c.img.load()
    c.outline(0, 0, size, size, PAL["ink"])
    c.outline(1, 1, size - 2, size - 2, (92, 76, 52))
    return c


if __name__ == "__main__":
    names = sys.argv[1:] or list(PORTRAITS)
    outs = []
    for n in names:
        c = make(n)
        c.save(f"portraits/{n}.png")
        outs.append(c)
    print(preview(outs, "photo_portraits.png", scale=2))
