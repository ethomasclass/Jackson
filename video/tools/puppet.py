"""Turn archival images into paper toy-theater puppets: public/img/v2/<src> -> public/v2/puppets/<name>.png

The subject is cut out (rembg), the matte is hardened and holes filled so sails and engraved
rigging read as solid card, then a scissor-cut margin of cream card is added around it, the way
toy-theater sheets were cut out by hand. Deterministic apart from the matting model.

  python3 tools/puppet.py              # all puppets in PUPPETS
  python3 tools/puppet.py chesapeake   # one
"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter, ImageChops

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public")
SRC, OUT = os.path.join(ROOT, "img", "v2"), os.path.join(ROOT, "v2", "puppets")
CARD = (246, 238, 218)

# name: (source file, crop box as fractions (l, t, r, b) or None, matte threshold, border px)
PUPPETS = {
    "chesapeake": ("chesapeake_muller.jpg", (0.22, 0.08, 0.83, 0.8), 0.10, 10),
    "leopard": ("frigate_weedon.png", (0.0, 0.04, 0.8, 0.84), 0.35, 10),
    "barron": ("barron_neagle.jpg", None, 0.5, 12),
    "george3": ("george3_gainsborough.jpg", (0.3, 0.1, 0.9, 0.98), 0.5, 12),
    "jefferson": ("../jefferson_peale.jpg", None, 0.5, 12),
    "clay": ("../clay_jouett.jpg", None, 0.5, 12),
    "calhoun": ("../calhoun_healy.jpg", None, 0.5, 12),
    "madison": ("../madison_stuart.jpg", None, 0.5, 12),
    "monroe": ("../monroe_stuart.jpg", None, 0.5, 12),
    "jackson": ("../jackson_sully_1845.jpg", None, 0.5, 12),
    "tenskwatawa": ("tenskwatawa_catlin.jpg", None, 0.5, 12),
    "harrison": ("harrison_lambdin.jpg", None, 0.5, 12),
    "dolley": ("dolley_stuart.jpg", None, 0.5, 12),
    "key": ("key_wood.jpg", None, 0.5, 12),
    "irving": ("irving_jarvis.jpg", None, 0.08, 12),
    "constitution": ("constitution_chambers.jpg", (0.04, 0.1, 0.57, 0.86), 0.55, 10),
}

_session = None


def matte(im):
    global _session
    from rembg import new_session, remove
    _session = _session or new_session("isnet-general-use")
    return remove(im, session=_session, only_mask=True)


def fill_holes(mask):
    """Flood the outside from the border; anything not reached is a hole inside the shape."""
    m = (np.asarray(mask) > 127).astype(np.uint8)
    h, w = m.shape
    outside = np.zeros_like(m)
    stack = [(0, x) for x in range(w)] + [(h - 1, x) for x in range(w)] + [(y, 0) for y in range(h)] + [(y, w - 1) for y in range(h)]
    while stack:
        y, x = stack.pop()
        if 0 <= y < h and 0 <= x < w and not outside[y, x] and not m[y, x]:
            outside[y, x] = 1
            stack += [(y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)]
    return Image.fromarray(((1 - outside) * 255).astype(np.uint8))


def largest(mask, keep=0.02):
    """Drop specks: keep connected blobs larger than `keep` of the biggest one."""
    from scipy import ndimage
    m = np.asarray(mask) > 127
    lab, n = ndimage.label(m)
    if n <= 1:
        return mask
    sizes = ndimage.sum(m, lab, range(1, n + 1))
    ok = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= keep * sizes.max()])
    return Image.fromarray((ok * 255).astype(np.uint8))


def scissor(mask, border, seed):
    """Grow the silhouette by `border` px and simplify it, like a quick scissor cut around the figure."""
    grown = mask.filter(ImageFilter.MaxFilter(2 * (border // 2) + 1))
    grown = grown.filter(ImageFilter.MaxFilter(2 * (border - border // 2) + 1))
    # smooth fiddly edges (rigging, fingers) into scissor-able curves, then re-threshold
    grown = grown.filter(ImageFilter.GaussianBlur(border * 0.9)).point(lambda v: 255 if v > 90 else 0)
    return grown.filter(ImageFilter.GaussianBlur(0.8))


def build(name):
    src, crop, thr, border = PUPPETS[name]
    im = Image.open(os.path.join(SRC, src)).convert("RGB")
    if crop:
        W, H = im.size
        im = im.crop((int(crop[0] * W), int(crop[1] * H), int(crop[2] * W), int(crop[3] * H)))
    im.thumbnail((1400, 1400), Image.LANCZOS)
    pad = border * 3
    m = matte(im).point(lambda v: 255 if v > thr * 255 else 0)
    m = m.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))   # close gaps in rigging
    m = largest(fill_holes(m))
    W, H = im.size[0] + 2 * pad, im.size[1] + 2 * pad
    mask = Image.new("L", (W, H), 0); mask.paste(m, (pad, pad))
    card_mask = scissor(mask, border, 1)
    out = Image.new("RGBA", (W, H), CARD + (0,))
    card = Image.new("RGBA", (W, H), CARD + (255,))
    out.paste(card, (0, 0), card_mask)
    art = Image.new("RGBA", (W, H)); art.paste(im.convert("RGBA"), (pad, pad))
    inner = mask.filter(ImageFilter.GaussianBlur(1.2))
    out.paste(art, (0, 0), inner)
    out.putalpha(ImageChops.lighter(card_mask, inner))
    bbox = out.getbbox()
    out = out.crop(bbox)
    os.makedirs(OUT, exist_ok=True)
    out.save(os.path.join(OUT, name + ".png"))
    print(f"v2/puppets/{name}.png {out.size}")


if __name__ == "__main__":
    for n in sys.argv[1:] or list(PUPPETS):
        build(n)
