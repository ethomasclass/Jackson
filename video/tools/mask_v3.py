"""Masks for the coral-tint + teal-trace look, made locally with rembg (no Gemini needed).

  python3 tools/mask_v3.py [name ...]     # all, or just the named ones

Each job cuts the subject out of a crop of the source image (x0, y0, x1, y1 in source pixels), pastes the
cut-out's alpha back at full size, and writes public/img/v3/masks/<name>_subject(_a).png + <name>.json
(outlines for Traced) via tools/trace.py.
"""
import os, sys
import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from trace import clean, save  # noqa: E402

PUB = os.path.join(HERE, "..", "public")
JOBS = {
    # name: (source, crop box or None, rembg model)
    "sully": ("img/jackson_sully_1845.jpg", None, "isnet-general-use"),
    "parton": ("img/jackson_parton_1860_plate.jpg", (300, 700, 1650, 2250), "isnet-general-use"),
    "king_andrew": ("img/v3/ch01/king_andrew_1833.jpg", (300, 100, 820, 1190), "isnet-general-use"),
    "brave_boy": ("img/v3/ch02/brave_boy_waxhaws.jpg", (1420, 620, 1960, 1880), "isnet-general-use"),
    "rachel": ("img/rachel_earl.jpg", None, "isnet-general-use"),
    "clay": ("img/clay_jouett.jpg", None, "isnet-general-use"),
    "jqa": ("img/jqa_stuart_1818.jpg", None, "isnet-general-use"),
    "calhoun": ("img/calhoun_healy.jpg", None, "isnet-general-use"),
    "van_buren": ("img/van_buren_inman.jpg", None, "isnet-general-use"),
    "peggy": ("img/peggy_eaton_brady.jpg", None, "isnet-general-use"),
    "story": ("img/v3/ch05/story_joseph.jpg", None, "isnet-general-use"),
    "sequoyah": ("img/v3/ch10/sequoyah.jpg", None, "isnet-general-use"),
    "ross": ("img/v3/ch10/john_ross.jpg", None, "isnet-general-use"),
}


def run(name, src, box, model, sessions={}):
    im = Image.open(os.path.join(PUB, src)).convert("RGB")
    crop = im.crop(box) if box else im
    small = crop.copy()
    small.thumbnail((1600, 1600))
    if model not in sessions:
        sessions[model] = new_session(model)
    a = np.asarray(remove(small, session=sessions[model]).split()[-1].resize(crop.size, Image.LANCZOS))
    full = np.zeros((im.height, im.width), np.uint8)
    x0, y0 = (box[0], box[1]) if box else (0, 0)
    full[y0:y0 + crop.height, x0:x0 + crop.width] = (a > 128).astype(np.uint8) * 255
    m = clean(full, close=9, min_area=20000)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
    if n > 2:                        # keep only the biggest piece (the subject)
        big = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        m = ((lab == big) * 255).astype(np.uint8)
    save(name, im.size, {"subject": m})


if __name__ == "__main__":
    names = sys.argv[1:] or list(JOBS)
    for n in names:
        print(n)
        run(n, *JOBS[n])
