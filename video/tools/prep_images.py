"""Turn the raw archival scans in public/img/ into the collage pieces the scenes use (public/cut/).

Every piece is a torn scrap of paper: the image sits on a paper backing whose edges are torn with
fractal noise, so the same look repeats across all three videos. Deterministic (seeded).
  python3 tools/prep_images.py
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageEnhance

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public")
IMG, CUT = os.path.join(ROOT, "img"), os.path.join(ROOT, "cut")
PAPER = (236, 226, 202)


def noise1d(n, rough, seed, octaves=5):
    rng = np.random.default_rng(seed)
    out = np.zeros(n)
    for o in range(octaves):
        k = max(2, int(n / (60 / 2 ** o)))
        pts = rng.uniform(-1, 1, k)
        out += np.interp(np.linspace(0, k - 1, n), np.arange(k), pts) * rough / 2 ** o
    return out


def torn_mask(w, h, inset, rough, seed):
    """Polygon mask whose four edges wander by `rough` px around a rectangle inset by `inset`."""
    pts = []
    top = noise1d(w, rough, seed); right = noise1d(h, rough, seed + 1)
    bot = noise1d(w, rough, seed + 2); left = noise1d(h, rough, seed + 3)
    step = 3
    pts += [(x, inset + abs(top[x])) for x in range(inset, w - inset, step)]
    pts += [(w - inset - abs(right[y]), y) for y in range(inset, h - inset, step)]
    pts += [(x, h - inset - abs(bot[x])) for x in range(w - inset, inset, -step)]
    pts += [(inset + abs(left[y]), y) for y in range(h - inset, inset, -step)]
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).polygon(pts, fill=255)
    return m.filter(ImageFilter.GaussianBlur(0.7))


def paper_texture(w, h, seed=7, tone=PAPER, fibres=True):
    rng = np.random.default_rng(seed)
    base = np.ones((h, w, 3)) * np.array(tone, float)
    lum = np.zeros((h, w))
    for scale, amp in ((400, 10), (120, 6), (30, 4), (6, 5)):
        sm = rng.normal(0, 1, (h // scale + 2, w // scale + 2))
        im = Image.fromarray(((sm - sm.min()) / (np.ptp(sm) + 1e-9) * 255).astype(np.uint8))
        lum += (np.asarray(im.resize((w, h), Image.BICUBIC), float) / 255 - 0.5) * amp
    base += lum[..., None]
    img = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8))
    if fibres:
        d = ImageDraw.Draw(img, "RGBA")
        for _ in range(int(w * h / 9000)):
            x, y = rng.uniform(0, w), rng.uniform(0, h)
            a = rng.uniform(0, np.pi); L = rng.uniform(4, 22)
            c = int(rng.uniform(150, 200))
            d.line([(x, y), (x + np.cos(a) * L, y + np.sin(a) * L)], fill=(c, c - 10, c - 30, 28), width=1)
    return img


def scrap(img, name, border=30, rough=22, seed=1, max_side=1800):
    """Image on a torn paper backing."""
    img = img.convert("RGB")
    img.thumbnail((max_side, max_side), Image.LANCZOS)
    w, h = img.size
    W, H = w + 2 * border, h + 2 * border
    backing = paper_texture(W, H, seed + 100, tone=(247, 241, 226))
    inner = torn_mask(W, H, border, rough * 0.35, seed + 50)
    outer = torn_mask(W, H, 2, rough, seed)
    canvas = backing.copy()
    canvas.paste(img, (border, border), ImageOps.invert(Image.new("L", (W, H), 0)).crop((0, 0, w, h)))
    # blend image into backing through the inner torn mask so the photo edge is rough too
    photo = backing.copy(); photo.paste(img, (border, border))
    canvas = Image.composite(photo, backing, inner)
    canvas.putalpha(outer)
    canvas.save(os.path.join(CUT, name + ".png"), optimize=True)
    print("cut/", name, canvas.size)


def cutout_on_light_bg(img, tol=26):
    """Remove a light, fairly flat studio background by flood-filling from the border."""
    a = np.asarray(img.convert("RGB")).astype(int)
    h, w, _ = a.shape
    ref = np.median(np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]), axis=0)
    close = (np.abs(a - ref).sum(-1) < tol * 3) | (a.min(-1) > 205)
    # connected component touching the border
    from collections import deque
    bg = np.zeros((h, w), bool); q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if close[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if close[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and close[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True; q.append((ny, nx))
    m = Image.fromarray((~bg * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    out = img.convert("RGBA"); out.putalpha(m)
    return out.crop(m.getbbox())


def main():
    os.makedirs(CUT, exist_ok=True)
    # full-frame paper background
    paper_texture(1920, 1080, 3).save(os.path.join(CUT, "paper_bg.jpg"), quality=92)
    # film-grain tile, scrolled per frame by the Grain overlay
    g = np.random.default_rng(9).normal(128, 40, (512, 512)).clip(0, 255).astype(np.uint8)
    Image.fromarray(g).convert("RGB").save(os.path.join(CUT, "grain.png"))

    j = Image.open(os.path.join(IMG, "jackson_sully_1845.jpg"))
    scrap(j.crop((0, 0, 1920, 2000)), "jackson_sully", border=30, rough=22, seed=11, max_side=2000)

    r = Image.open(os.path.join(IMG, "rachel_earl.jpg"))
    scrap(r.crop((150, 0, 1770, 1500)), "rachel", seed=21, max_side=1200)

    wc = Image.open(os.path.join(IMG, "duel_woodcut_1828.jpg"))
    scrap(wc, "duel_woodcut", seed=31, max_side=1400, rough=12)
    # Dickinson is the top-hatted figure on the left of the 1828 handbill woodcut
    dk = wc.crop((0, 0, 300, 700))
    dk = dk.resize((dk.width * 2, dk.height * 2), Image.LANCZOS)
    scrap(dk, "dickinson_woodcut", seed=41, max_side=1400, rough=10)

    d34 = Image.open(os.path.join(IMG, "duel_1834.jpg"))
    scrap(d34, "duel_1834", seed=51, max_side=1800, rough=14)

    ph = Image.open(os.path.join(IMG, "presidents_house_1835.jpg")).crop((640, 540, 3420, 2440))
    scrap(ph, "presidents_house", seed=61, max_side=1800, rough=14)

    p = Image.open(os.path.join(IMG, "pistols_met.jpg"))
    p.thumbnail((1800, 1800), Image.LANCZOS)
    cutout_on_light_bg(p).save(os.path.join(CUT, "pistols.png"), optimize=True)
    print("cut/ pistols")


if __name__ == "__main__":
    main()
