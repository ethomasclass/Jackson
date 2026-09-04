"""Evidence card icons, 64x64.

Documents and objects with a good public-domain photograph are derived from the
reference (cropped, cluster-smoothed, quantised) so the King Andrew cartoon is
the real 1833 cartoon and the campaign handbill is the real 1828 Coffin
Handbill. The rest are hand-drawn at the same scale.
"""
import glob
import json
import os
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance, ImageOps
from common import Canvas, PAL, shade, mix, preview, ASSETS

S = 64
REF = os.path.join(os.path.dirname(__file__), "ref")
items = {}
PAPER = (232, 220, 196)


def card(name, draw):
    c = Canvas(S, S)
    draw(c)
    items[name] = c
    return c


def from_photo(path_glob, box, colors=20, bg=None, contrast=1.15, pad=4, white_key=None):
    """Crop a reference (fractional box), fit it into the card with padding,
    quantise. white_key: treat near-white background as transparent."""
    path = sorted(glob.glob(os.path.join(REF, path_glob)))[0]
    im = Image.open(path).convert("RGB")
    W, H = im.size
    im = im.crop((int(box[0] * W), int(box[1] * H), int(box[2] * W), int(box[3] * H)))
    im = ImageEnhance.Contrast(im).enhance(contrast)
    inner = S - pad * 2
    im.thumbnail((inner * 2, inner * 2), Image.LANCZOS)
    im = im.filter(ImageFilter.MedianFilter(3))
    im.thumbnail((inner, inner), Image.BOX)
    q = im.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")
    c = Canvas(S, S)
    ox, oy = (S - q.width) // 2, (S - q.height) // 2
    a = np.asarray(q)
    for y in range(q.height):
        for x in range(q.width):
            r, g, b = [int(v) for v in a[y, x]]
            if white_key is not None and r > white_key and g > white_key and b > white_key:
                continue
            c.put(ox + x, oy + y, (r, g, b))
    return c


# ---- photo-derived ---------------------------------------------------------
def cartoon():
    return from_photo("cartoon/00_*", (0.08, 0.04, 0.92, 0.96), colors=12, contrast=1.3, pad=3)


def poster():   # the 1828 Coffin Handbill
    return from_photo("broadside/00_*", (0.05, 0.03, 0.95, 0.75), colors=10, contrast=1.35, pad=3)


def bank_note():
    return from_photo("banknote/00_*", (0.0, 0.0, 1.0, 1.0), colors=14, contrast=1.25, pad=2)


def pipe():
    return from_photo("pipe/00_*", (0.05, 0.05, 0.95, 0.5), colors=12, contrast=1.2, pad=2, white_key=200)


def whiskey():
    return from_photo("whiskey/00_*", (0.28, 0.02, 0.72, 0.98), colors=16, contrast=1.2, pad=2, white_key=210)


# ---- hand-drawn ---------------------------------------------------------------
def hat(c):
    """Beaver-felt top hat of the 1830s: tall tapered crown, curled brim."""
    ink, sh, hi = (26, 22, 24), (48, 42, 46), (84, 76, 82)
    for y in range(10, 42):
        t = (y - 10) / 32
        half = int(14 + 3 * t)
        for x in range(32 - half, 32 + half):
            col = ink
            if x < 32 - half + 4:
                col = sh
            if 32 - half + 5 <= x <= 32 - half + 8:
                col = hi
            if x > 32 + half - 3:
                col = (14, 12, 14)
            c.put(x, y, col)
    c.hline(18, 10, 28, sh); c.hline(19, 11, 26, hi)
    # brim, curled at the sides
    for x in range(8, 56):
        dy = 0 if 14 < x < 50 else (1 if x in (12, 13, 14, 50, 51, 52) else 2)
        c.put(x, 44 - dy, ink); c.put(x, 45 - dy, ink); c.put(x, 46 - dy, sh)
        c.put(x, 43 - dy, hi if 20 < x < 44 else sh)
    c.hline(16, 41, 32, (60, 44, 34)); c.hline(16, 42, 32, (110, 80, 50))   # silk band
    # inside lining showing at the brim: leather sweatband with the stag mark
    c.rect(22, 47, 20, 5, (150, 110, 70)); c.hline(22, 47, 20, (190, 150, 100))
    c.put(31, 49, PAL["gold1"]); c.put(32, 49, PAL["gold1"]); c.put(33, 48, PAL["gold"]); c.put(30, 50, PAL["gold"])
    c.rect(10, 54, 44, 3, (40, 36, 40))


def playing_cards(c):
    for k, (x, y) in enumerate([(8, 16), (20, 12), (32, 8)]):
        c.rect(x, y, 20, 30, (246, 242, 232)); c.outline(x, y, 20, 30, (150, 140, 120))
        c.hline(x + 1, y + 1, 18, (255, 255, 255))
    # face card (knave of spades) on top
    c.rect(34, 12, 16, 22, (236, 226, 200))
    c.rect(38, 14, 8, 8, (220, 170, 140)); c.rect(38, 13, 8, 2, (60, 40, 30)); c.rect(37, 22, 10, 10, (150, 40, 40)); c.rect(40, 24, 4, 6, (60, 60, 120))
    c.put(35, 10, (20, 20, 24)); c.put(36, 11, (20, 20, 24)); c.put(35, 12, (20, 20, 24))
    c.rect(22, 14, 3, 4, (150, 30, 30)); c.put(23, 18, (150, 30, 30))
    c.put(10, 18, (20, 20, 24)); c.put(11, 18, (20, 20, 24)); c.put(10, 19, (20, 20, 24)); c.put(11, 19, (20, 20, 24)); c.put(11, 20, (20, 20, 24))
    # fingernail marks on the back of the bottom card
    c.put(14, 40, (180, 170, 150)); c.put(15, 41, (180, 170, 150))
    c.rect(6, 48, 52, 8, (44, 74, 56)); c.hline(6, 48, 52, (66, 108, 78))


def check(c):
    c.rect(4, 16, 56, 30, (236, 228, 208)); c.outline(4, 16, 56, 30, (170, 150, 120))
    c.hline(5, 17, 54, (250, 246, 236))
    # engraved vignette left, lines of script
    c.rect(8, 20, 12, 10, (196, 184, 160)); c.rect(10, 22, 8, 6, (120, 110, 90)); c.put(13, 24, (60, 50, 40))
    c.hline(24, 22, 26, (60, 50, 44)); c.hline(24, 26, 32, (90, 80, 70)); c.hline(24, 30, 22, (90, 80, 70))
    c.hline(10, 36, 40, (90, 80, 70)); c.hline(10, 40, 30, (60, 50, 44))
    c.rect(44, 34, 12, 8, (250, 246, 236)); c.hline(45, 38, 10, (40, 50, 110))   # signature block
    c.rect(48, 18, 8, 5, (150, 40, 40)); c.hline(49, 20, 6, (220, 120, 120))       # stamp
    c.hline(6, 45, 52, (200, 190, 170))


def address_card(c):
    c.rect(8, 18, 48, 28, (246, 240, 226)); c.outline(8, 18, 48, 28, (190, 176, 150))
    c.hline(9, 19, 46, (255, 255, 250))
    c.hline(14, 26, 26, (30, 26, 28)); c.hline(14, 27, 26, (30, 26, 28))          # 420 CHESTNUT STREET
    c.hline(14, 32, 34, (90, 80, 70)); c.hline(14, 37, 18, (90, 80, 70))
    c.rect(44, 33, 8, 8, (150, 40, 40)); c.put(47, 36, PAL["gold1"]); c.put(48, 36, PAL["gold1"])   # wax seal
    c.rect(6, 48, 52, 3, (60, 50, 44))


def resolutions(c):
    for k in range(3):
        c.rect(12 + k * 3, 6 + k * 3, 34, 44, PAPER if k < 2 else (240, 230, 208))
        c.outline(12 + k * 3, 6 + k * 3, 34, 44, (170, 150, 120))
    x0, y0 = 18, 12
    c.hline(x0 + 4, y0 + 2, 18, (40, 34, 30)); c.hline(x0 + 8, y0 + 5, 10, (40, 34, 30))     # title
    for i, yy in enumerate(range(y0 + 10, y0 + 40, 3)):
        c.hline(x0 + 2, yy, 22 if i % 3 else 16, (90, 80, 70))
    c.hline(x0 + 2, y0 + 16, 22, (150, 40, 40)); c.hline(x0 + 2, y0 + 25, 20, (150, 40, 40))   # heavy underlining in Calhoun's hand
    c.hline(x0 + 2, y0 + 17, 22, (150, 40, 40))


def build_all():
    items["cartoon"] = cartoon()
    items["poster"] = poster()
    items["bank_note"] = bank_note()
    items["pipe"] = pipe()
    items["whiskey"] = whiskey()
    card("hat", hat); card("playing_cards", playing_cards); card("check", check); card("address_card", address_card); card("resolutions", resolutions)
    for n, c in items.items():
        c.save(f"evidence/{n}.png")
    with open(os.path.join(ASSETS, "evidence", "index.json"), "w") as f:
        json.dump(list(items), f)
    return list(items.values())


def ui():
    bang = Canvas(16, 16)
    bang.grid("""
.....oooooo.....
....oyyyyyyo....
....oyyyyyyo....
....oyyyyyyo....
....oyyyyyyo....
.....oyyyyo.....
.....oyyyyo.....
.....oyyyyo.....
......oyyo......
......oyyo......
.......oo.......
......oooo......
.....oyyyyo.....
.....oyyyyo.....
......oooo......
................
""", {"o": PAL["ink"], "y": PAL["gold1"]})
    bang.save("ui/bang.png")
    arrow = Canvas(16, 16)
    arrow.grid("""
................
................
....oooooooo....
....owwwwwwo....
.....owwwwo.....
.....owwwwo.....
......owwo......
......owwo......
.......oo.......
................
""", {"o": PAL["ink"], "w": PAL["white"]})
    arrow.save("ui/arrow.png")
    spark = Canvas(16, 16)
    spark.grid("""
.......y........
.......y........
......yyy.......
..y..yyyyy..y...
...yyyyyyyyy....
....yyyyyyy.....
...yyyyyyyyy....
..y..yyyyy..y...
......yyy.......
.......y........
.......y........
""", {"y": PAL["candle"]})
    spark.save("ui/spark.png")
    return [bang, arrow, spark]


if __name__ == "__main__":
    cs = build_all()
    ui()
    print(len(cs), "evidence cards")
    print(preview(cs, "evidence.png", scale=3))
