"""Masks and hand-traced-looking outlines for the "selective colour + yellow trace" look.

Two ways to get a mask:
  paint  Gemini returns the image with chosen figures filled flat magenta / green (pixel-aligned);
         the fills become masks.  python3 tools/trace.py paint <image> "<what to fill>" <name>
  alpha  a cut-out PNG (rembg) supplies the mask.            python3 tools/trace.py alpha <png> <name>

Writes public/img/jh/masks/<name>_<colour>.png (white = subject, same size as the source) and
public/img/jh/masks/<name>.json: {"size": [w, h], "shapes": {"magenta": [svg path, ...], ...},
"boxes": {"magenta": [x0, y0, x1, y1], ...}}.
Paths are the mask outline pushed outward a few pixels and smoothed, so the stroke sits just outside the figure.
"""
import base64, io, json, os, sys, urllib.request

import cv2
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from voice import env  # noqa: E402

OUT = os.path.join(HERE, "..", "public", "img", "jh", "masks")
COLOURS = {"magenta": lambda r, g, b: (r > 190) & (g < 90) & (b > 190),
           "green": lambda r, g, b: (g > 190) & (r < 130) & (b < 130)}


def gemini_paint(src, what):
    im = Image.open(src).convert("RGB")
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=92)
    w, h = im.size
    ar = min(["16:9", "4:3", "1:1", "3:4", "9:16", "3:2", "2:3"],
             key=lambda a: abs(eval(a.replace(":", "/")) - w / h))
    prompt = ("Return this exact same image, pixel-aligned, with no other change at all, except: " + what +
              " Keep each fill tight to the outline. Do not move, crop, recompose or redraw anything else.")
    body = {"contents": [{"parts": [{"inline_data": {"mime_type": "image/jpeg", "data": base64.b64encode(buf.getvalue()).decode()}},
                                    {"text": prompt}]}],
            "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": ar, "imageSize": "2K"}}}
    req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image:generateContent",
                                 data=json.dumps(body).encode(),
                                 headers={"x-goog-api-key": os.environ["GEMINI_API_KEY"], "Content-Type": "application/json"})
    r = json.loads(urllib.request.urlopen(req, timeout=300).read())
    for p in r["candidates"][0]["content"]["parts"]:
        if "inlineData" in p:
            return Image.open(io.BytesIO(base64.b64decode(p["inlineData"]["data"]))).convert("RGB").resize((w, h), Image.LANCZOS)
    sys.exit("no image returned")


def clean(mask, close=5, min_area=400):
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (close, close))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, k)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, k)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(mask)
    out = np.zeros_like(mask)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] >= min_area:
            out[lab == i] = 255
    return out


def chaikin(pts, rounds=2):
    for _ in range(rounds):
        q = []
        for i in range(len(pts)):
            a, b = pts[i], pts[(i + 1) % len(pts)]
            q += [0.75 * a + 0.25 * b, 0.25 * a + 0.75 * b]
        pts = np.array(q)
    return pts


def outlines(mask, push=7, min_area=900):
    """Outer contours of the mask, pushed outward by `push` px and smoothed, as SVG path strings."""
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * push + 1, 2 * push + 1))
    grown = cv2.dilate(mask, k)
    grown = cv2.GaussianBlur(grown, (0, 0), push * 0.6)
    grown = (grown > 127).astype(np.uint8) * 255
    cs, _ = cv2.findContours(grown, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    paths = []
    for c in cs:
        if cv2.contourArea(c) < min_area:
            continue
        c = cv2.approxPolyDP(c, 2.5, True)[:, 0, :].astype(float)
        c = chaikin(c)
        paths.append("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in c) + " Z")
    return paths


def save(name, size, masks):
    os.makedirs(OUT, exist_ok=True)
    shapes, boxes = {}, {}
    for col, m in masks.items():
        ys, xs = np.nonzero(m)
        boxes[col] = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
        Image.fromarray(m).save(os.path.join(OUT, f"{name}_{col}.png"))
        a = np.zeros(m.shape + (4,), np.uint8); a[..., :3] = 255; a[..., 3] = cv2.GaussianBlur(m, (0, 0), 1.2)
        Image.fromarray(a).save(os.path.join(OUT, f"{name}_{col}_a.png"))   # alpha version for CSS masks
        shapes[col] = outlines(m)
        print(f"  {col}: {len(shapes[col])} outline(s), {int((m > 0).sum())} px")
    json.dump({"size": list(size), "shapes": shapes, "boxes": boxes}, open(os.path.join(OUT, name + ".json"), "w"))


def main():
    env()
    mode = sys.argv[1]
    if mode == "paint":
        src, what, name = sys.argv[2], sys.argv[3], sys.argv[4]
        painted = gemini_paint(src, what)
        painted.save(os.path.join(HERE, "..", "out", f"paint_{name}.png"))
        a = np.asarray(painted).astype(int)
        r, g, b = a[..., 0], a[..., 1], a[..., 2]
        masks = {col: clean(f(r, g, b).astype(np.uint8) * 255) for col, f in COLOURS.items()}
        masks = {c: m for c, m in masks.items() if m.any()}
        save(name, painted.size, masks)
    elif mode == "fromfile":          # an already painted image: tools/trace.py fromfile <painted.png> <source> <name>
        painted = Image.open(sys.argv[2]).convert("RGB")
        size = Image.open(sys.argv[3]).size
        a = np.asarray(painted.resize(size, Image.LANCZOS)).astype(int)
        r, g, b = a[..., 0], a[..., 1], a[..., 2]
        masks = {col: clean(f(r, g, b).astype(np.uint8) * 255) for col, f in COLOURS.items()}
        save(sys.argv[4], size, {c: m for c, m in masks.items() if m.any()})
    elif mode == "alpha":
        im = Image.open(sys.argv[2]).convert("RGBA")
        m = clean(((np.asarray(im)[..., 3] > 128).astype(np.uint8) * 255), min_area=5000)
        save(sys.argv[3], im.size, {"subject": m})


if __name__ == "__main__":
    main()
