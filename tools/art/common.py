"""Shared helpers for generating the game's pixel art with Pillow.

Every asset in assets/ is produced by a script in this directory. Art is
authored either as pixel-string grids (one character per pixel, mapped to
a palette) or procedurally (textures, shading passes) — usually both.
"""
import os
import random
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ASSETS = os.path.join(ROOT, "assets")

# ---------------------------------------------------------------------------
# Palette: a restrained 1830s winter-Washington set. Mud, brick, whitewash,
# slate, candlelight. Everything is drawn from these plus per-character skin
# and cloth ramps so the world reads as one place.
# ---------------------------------------------------------------------------
PAL = {
    # neutrals
    "black": (18, 14, 16),
    "ink": (36, 30, 34),
    "shadow": (58, 50, 54),
    "slate": (86, 84, 92),
    "stone": (128, 126, 128),
    "lstone": (170, 168, 166),
    "marble": (214, 210, 202),
    "white": (242, 238, 228),
    "cream": (232, 220, 196),
    "parchment": (218, 200, 160),
    # earth
    "mud3": (58, 42, 30),
    "mud2": (86, 62, 42),
    "mud1": (118, 88, 58),
    "mud0": (146, 112, 74),
    "sand": (176, 148, 104),
    # wood
    "wood3": (62, 38, 24),
    "wood2": (96, 60, 36),
    "wood1": (134, 88, 52),
    "wood0": (170, 120, 74),
    # brick
    "brick3": (92, 40, 32),
    "brick2": (128, 58, 42),
    "brick1": (160, 82, 58),
    "brick0": (188, 110, 80),
    "mortar": (196, 180, 156),
    # plant / winter grass
    "grass2": (72, 84, 44),
    "grass1": (104, 116, 58),
    "grass0": (138, 146, 76),
    "snow": (226, 228, 232),
    "snow1": (196, 200, 210),
    # sky / glass
    "sky": (156, 176, 196),
    "glass": (120, 150, 172),
    "glass1": (168, 196, 212),
    # accents
    "gold": (208, 164, 72),
    "gold1": (236, 204, 120),
    "red": (150, 36, 40),
    "red1": (196, 64, 60),
    "blue3": (30, 38, 66),
    "blue2": (44, 58, 100),
    "blue1": (70, 92, 140),
    "green2": (40, 72, 56),
    "green1": (66, 108, 78),
    "candle": (250, 214, 130),
    "flame": (255, 160, 60),
}


def rgba(c, a=255):
    return (c[0], c[1], c[2], a)


def shade(c, k):
    """Multiply a colour by k (k<1 darkens, k>1 lightens)."""
    return tuple(max(0, min(255, int(v * k))) for v in c[:3])


def mix(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def ramp(base, n=4, dark=0.55, light=1.25):
    """Return n colours from dark to light around base."""
    out = []
    for i in range(n):
        t = i / max(1, n - 1)
        k = dark + (light - dark) * t
        out.append(shade(base, k))
    return out


class Canvas:
    """Thin wrapper over an RGBA image with pixel-art-friendly helpers."""

    def __init__(self, w, h, bg=(0, 0, 0, 0)):
        self.w, self.h = w, h
        self.img = Image.new("RGBA", (w, h), bg)
        self.px = self.img.load()
        self.d = ImageDraw.Draw(self.img)

    # -- basic pixels -----------------------------------------------------
    def put(self, x, y, c, a=255):
        if 0 <= x < self.w and 0 <= y < self.h:
            if len(c) == 4:
                self.px[x, y] = c
            else:
                self.px[x, y] = (c[0], c[1], c[2], a)

    def get(self, x, y):
        if 0 <= x < self.w and 0 <= y < self.h:
            return self.px[x, y]
        return (0, 0, 0, 0)

    def rect(self, x, y, w, h, c):
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                self.put(xx, yy, c)

    def hline(self, x, y, w, c):
        for xx in range(x, x + w):
            self.put(xx, y, c)

    def vline(self, x, y, h, c):
        for yy in range(y, y + h):
            self.put(x, yy, c)

    def outline(self, x, y, w, h, c):
        self.hline(x, y, w, c)
        self.hline(x, y + h - 1, w, c)
        self.vline(x, y, h, c)
        self.vline(x + w - 1, y, h, c)

    # -- textures ---------------------------------------------------------
    def noise_fill(self, x, y, w, h, colours, seed=0, weights=None):
        """Fill a rect with randomly chosen colours (for mud, grass, stone)."""
        r = random.Random(seed)
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                self.put(xx, yy, r.choices(colours, weights=weights)[0])

    def speckle(self, x, y, w, h, c, density, seed=0):
        r = random.Random(seed)
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                if r.random() < density:
                    self.put(xx, yy, c)

    def grid(self, text, key, ox=0, oy=0):
        """Draw a pixel-string grid. '.' and ' ' are transparent."""
        rows = [ln for ln in text.strip("\n").split("\n")]
        for j, row in enumerate(rows):
            for i, ch in enumerate(row):
                if ch in ". ":
                    continue
                c = key.get(ch)
                if c is None:
                    raise KeyError(f"no palette entry for {ch!r}")
                self.put(ox + i, oy + j, c)

    def blit(self, other, x, y):
        self.img.alpha_composite(other.img, (x, y))

    def flip_h(self):
        c = Canvas(self.w, self.h)
        c.img = self.img.transpose(Image.FLIP_LEFT_RIGHT)
        c.px = c.img.load()
        c.d = ImageDraw.Draw(c.img)
        return c

    def scaled(self, k):
        return self.img.resize((self.w * k, self.h * k), Image.NEAREST)

    def save(self, rel, scale=1):
        path = os.path.join(ASSETS, rel)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        (self.scaled(scale) if scale > 1 else self.img).save(path)
        return path


def sheet(frames, cols=None):
    """Pack same-size canvases into one horizontal (or grid) sheet."""
    fw, fh = frames[0].w, frames[0].h
    n = len(frames)
    cols = cols or n
    rows = (n + cols - 1) // cols
    c = Canvas(fw * cols, fh * rows)
    for i, f in enumerate(frames):
        c.blit(f, (i % cols) * fw, (i // cols) * fh)
    return c


def preview(canvases, rel, scale=4, pad=4, bg=(40, 36, 40, 255)):
    """Write a scaled contact sheet for eyeballing during development."""
    if not isinstance(canvases, list):
        canvases = [canvases]
    w = sum(c.w for c in canvases) + pad * (len(canvases) + 1)
    h = max(c.h for c in canvases) + pad * 2
    out = Canvas(w, h, bg)
    x = pad
    for c in canvases:
        out.blit(c, x, pad)
        x += c.w + pad
    path = os.path.join(ROOT, "tools", "art", "preview", rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    out.scaled(scale).save(path)
    return path
