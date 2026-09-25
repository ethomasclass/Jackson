"""Prepare Gemini backcloths (public/img/v2/gen/*.png) for the stage: find the painted area inside
the cream card border, crop to 16:9 and save public/v2/scenery/<name>.jpg at 2400 px.

  python3 tools/scenery.py                 # every backcloth
  python3 tools/scenery.py deck catskills
"""
import os, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HERE, "..", "public", "img", "v2", "gen")
OUT = os.path.join(HERE, "..", "public", "v2", "scenery")
BACKCLOTHS = ["sea_backcloth", "sea_backcloth_storm", "deck", "wabash_woods", "dc_night", "dining_room", "harbor_night",
              "harbor_dawn", "new_orleans_plain", "mill_interior", "waltham_mill", "catskills"]


# fraction of width / height to trim on each side (the printed card margin and its ink rule);
# a few sheets were painted nearly full-bleed
# (left, top, right, bottom)
MARGIN = {"dining_room": (0.035, 0.05, 0.035, 0.05), "mill_interior": (0.035, 0.05, 0.035, 0.05),
          "harbor_dawn": (0.215, 0.265, 0.225, 0.19), "catskills": (0.065, 0.11, 0.09, 0.1)}
DEFAULT = (0.058, 0.085, 0.058, 0.085)


def painted_box(name, im):
    l, t, r, b = MARGIN.get(name, DEFAULT)
    w, h = im.size
    return int(w * l), int(h * t), int(w * (1 - r)), int(h * (1 - b))


def prep(name):
    im = Image.open(os.path.join(GEN, name + ".png")).convert("RGB")
    x0, y0, x1, y1 = painted_box(name, im)
    bw, bh = x1 - x0, y1 - y0
    # centre-crop the painted area to 16:9
    if bw / bh > 16 / 9:
        nw = int(bh * 16 / 9); x0 += (bw - nw) // 2; x1 = x0 + nw
    else:
        nh = int(bw * 9 / 16); y0 += (bh - nh) // 2; y1 = y0 + nh
    os.makedirs(OUT, exist_ok=True)
    im.crop((x0, y0, x1, y1)).resize((2400, 1350), Image.LANCZOS).save(os.path.join(OUT, name + ".jpg"), quality=90)
    print(f"v2/scenery/{name}.jpg  from box {x0},{y0}-{x1},{y1} of {im.size}")


if __name__ == "__main__":
    for n in sys.argv[1:] or BACKCLOTHS:
        prep(n)
