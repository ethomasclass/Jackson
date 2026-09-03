"""Exterior building facades and street props, each saved as its own PNG.

Buildings are drawn as front-on facades with a shallow roof band so a top-down
walker can approach the door. Sizes are multiples of 32 so they sit on the grid.
"""
import json
import os
import random
from common import Canvas, PAL, shade, mix, preview, ASSETS

T = 32
objs = {}


def reg(name, c, door=None, solid=None):
    """door: (x, y, w, h) in pixels of the walkable entrance strip at the base."""
    objs[name] = {"c": c, "door": door, "solid": solid}
    return c


# --- materials -----------------------------------------------------------
def fill_brick(c, x, y, w, h, seed=1, base=None):
    r = random.Random(seed)
    c.rect(x, y, w, h, PAL["mortar"])
    for row in range((h + 3) // 4):
        off = 4 if row % 2 else 0
        for col in range(-1, w // 8 + 2):
            bx = x + col * 8 + off
            b = r.choice([PAL["brick1"], PAL["brick1"], PAL["brick2"], PAL["brick0"]])
            if base:
                b = mix(b, base, 0.5)
            for yy in range(y + row * 4, min(y + h, y + row * 4 + 3)):
                for xx in range(max(x, bx), min(x + w, bx + 7)):
                    c.put(xx, yy, b if yy < y + row * 4 + 2 else shade(b, 0.8))


def fill_clapboard(c, x, y, w, h, base=PAL["white"], seed=2):
    r = random.Random(seed)
    for row in range(h):
        k = row % 5
        col = base if k < 3 else (shade(base, 0.9) if k == 3 else shade(base, 0.72))
        for xx in range(x, x + w):
            v = col
            if r.random() < 0.02:
                v = shade(col, 0.94)
            c.put(xx, y + row, v)


def fill_stone(c, x, y, w, h, base=PAL["marble"], seed=3):
    r = random.Random(seed)
    c.rect(x, y, w, h, shade(base, 0.85))
    for row in range((h + 7) // 8):
        off = 8 if row % 2 else 0
        for col in range(-1, w // 16 + 2):
            bx = x + col * 16 + off
            b = r.choice([base, base, shade(base, 0.96), shade(base, 1.03)])
            for yy in range(y + row * 8, min(y + h, y + row * 8 + 7)):
                for xx in range(max(x, bx), min(x + w, bx + 15)):
                    c.put(xx, yy, b if yy < y + row * 8 + 6 else shade(b, 0.85))


def fill_plaster(c, x, y, w, h, base=PAL["cream"], seed=4):
    c.noise_fill(x, y, w, h, [base, shade(base, 0.96), shade(base, 1.03)], seed=seed)


def roof(c, x, y, w, h, colour=PAL["slate"], seed=5):
    """Shingled roof band with a highlighted ridge and eave shadow."""
    r = random.Random(seed)
    for row in range(h):
        k = row % 4
        for xx in range(x, x + w):
            col = colour
            if k == 0:
                col = shade(colour, 1.2)
            elif k == 3:
                col = shade(colour, 0.7)
            if ((xx + (row // 4) * 3) % 6) == 0 and k in (1, 2):
                col = shade(colour, 0.85)
            if r.random() < 0.02:
                col = shade(colour, 1.1)
            c.put(xx, y + row, col)
    c.hline(x, y, w, shade(colour, 1.4))
    c.hline(x, y + h - 1, w, PAL["ink"])
    c.hline(x, y + h, w, PAL["shadow"])  # eave shadow onto wall


def window(c, x, y, w=12, h=16, shutters=None, sill=True, lit=False, arch=False):
    c.rect(x - 1, y - 1, w + 2, h + 2, PAL["wood3"])
    glass = PAL["candle"] if lit else PAL["glass"]
    c.rect(x, y, w, h, glass)
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            if (xx + yy) % 9 == 0:
                c.put(xx, yy, shade(glass, 1.25))
    c.vline(x + w // 2, y, h, PAL["wood2"])
    c.hline(x, y + h // 2, w, PAL["wood2"])
    if arch:
        c.hline(x, y, w, PAL["wood3"]); c.put(x, y, PAL["wood3"]); c.put(x + w - 1, y, PAL["wood3"])
    if sill:
        c.rect(x - 2, y + h, w + 4, 2, PAL["lstone"]); c.hline(x - 2, y + h + 2, w + 4, PAL["shadow"])
    if shutters:
        c.rect(x - 5, y - 1, 4, h + 2, shutters)
        c.rect(x + w + 1, y - 1, 4, h + 2, shutters)
        for yy in range(y + 1, y + h, 3):
            c.hline(x - 4, yy, 2, shade(shutters, 0.7)); c.hline(x + w + 2, yy, 2, shade(shutters, 0.7))


def door(c, x, y, w=14, h=22, colour=PAL["wood2"], fanlight=False, steps=1):
    c.rect(x - 2, y - 2, w + 4, h + 2, PAL["wood3"])
    c.rect(x, y, w, h, colour)
    c.rect(x + 2, y + 3, w // 2 - 3, h // 2 - 4, shade(colour, 1.15))
    c.rect(x + w // 2 + 1, y + 3, w // 2 - 3, h // 2 - 4, shade(colour, 1.15))
    c.rect(x + 2, y + h // 2 + 2, w // 2 - 3, h // 2 - 4, shade(colour, 1.15))
    c.rect(x + w // 2 + 1, y + h // 2 + 2, w // 2 - 3, h // 2 - 4, shade(colour, 1.15))
    c.put(x + w - 4, y + h // 2, PAL["gold1"])
    if fanlight:
        c.rect(x, y - 6, w, 5, PAL["glass1"])
        for xx in range(x + 2, x + w - 1, 3):
            c.vline(xx, y - 6, 5, PAL["wood3"])
        c.rect(x - 2, y - 8, w + 4, 2, PAL["wood3"])
    for s in range(steps):
        c.rect(x - 4 - s * 2, y + h + s * 3, w + 8 + s * 4, 3, PAL["lstone"] if s % 2 == 0 else PAL["stone"])
        c.hline(x - 4 - s * 2, y + h + s * 3 + 2, w + 8 + s * 4, PAL["shadow"])


def chimney(c, x, y, w=8, h=14):
    fill_brick(c, x, y, w, h, seed=x)
    c.rect(x - 1, y - 2, w + 2, 2, PAL["slate"])
    c.put(x + w // 2, y - 4, PAL["stone"]); c.put(x + w // 2 - 1, y - 6, PAL["lstone"]); c.put(x + w // 2 + 1, y - 7, PAL["lstone"])


def sign(c, x, y, w, text_col=PAL["gold"], board=PAL["wood2"], icon=None):
    c.rect(x, y, w, 10, board); c.outline(x, y, w, 10, PAL["wood3"])
    if icon == "hat":
        c.rect(x + 3, y + 5, 8, 2, PAL["ink"]); c.rect(x + 5, y + 2, 4, 3, PAL["ink"])
        c.hline(x + 13, y + 4, w - 16, text_col); c.hline(x + 13, y + 6, w - 18, text_col)
    elif icon == "tankard":
        c.rect(x + 3, y + 2, 5, 6, PAL["gold"]); c.put(x + 8, y + 4, PAL["gold"])
        c.hline(x + 12, y + 4, w - 15, text_col); c.hline(x + 12, y + 6, w - 17, text_col)
    elif icon == "letter":
        c.rect(x + 3, y + 3, 7, 5, PAL["cream"]); c.put(x + 6, y + 5, PAL["slate"])
        c.hline(x + 13, y + 4, w - 16, text_col); c.hline(x + 13, y + 6, w - 18, text_col)
    elif icon == "press":
        c.rect(x + 3, y + 2, 6, 6, PAL["ink"]); c.rect(x + 4, y + 3, 4, 2, PAL["cream"])
        c.hline(x + 12, y + 4, w - 15, text_col); c.hline(x + 12, y + 6, w - 17, text_col)
    elif icon == "bank":
        c.rect(x + 3, y + 3, 7, 5, PAL["gold"]); c.put(x + 6, y + 5, PAL["ink"])
        c.hline(x + 13, y + 4, w - 16, text_col); c.hline(x + 13, y + 6, w - 18, text_col)
    else:
        c.hline(x + 4, y + 4, w - 8, text_col); c.hline(x + 6, y + 6, w - 12, text_col)


# --- buildings -------------------------------------------------------------
def capitol():
    """The 1835 Capitol: low copper dome between two wings, a colonnade, wide steps."""
    W, H = T * 12, T * 7
    c = Canvas(W, H)
    # wings
    fill_stone(c, 0, 70, 120, 120, seed=11)
    fill_stone(c, W - 120, 70, 120, 120, seed=12)
    for i in range(3):
        window(c, 14 + i * 34, 90, 12, 18, arch=True)
        window(c, 14 + i * 34, 130, 12, 18)
        window(c, W - 106 + i * 34, 90, 12, 18, arch=True)
        window(c, W - 106 + i * 34, 130, 12, 18)
    c.hline(0, 70, 120, PAL["white"]); c.hline(W - 120, 70, 120, PAL["white"])
    c.rect(0, 66, 120, 4, PAL["lstone"]); c.rect(W - 120, 66, 120, 4, PAL["lstone"])
    # centre block
    fill_stone(c, 112, 60, W - 224, 130, seed=13)
    c.rect(112, 56, W - 224, 4, PAL["lstone"])
    # dome
    cx, top = W // 2, 8
    for y in range(top, 58):
        t = (y - top) / 50
        half = int(66 * (t ** 0.5)) if t < 0.85 else 66
        for x in range(cx - half, cx + half):
            nx = (x - cx) / 66
            col = (108, 132, 110)  # weathered copper
            if nx < -0.4:
                col = shade(col, 0.8)
            elif nx > 0.5:
                col = shade(col, 0.9)
            elif -0.1 < nx < 0.2:
                col = shade(col, 1.15)
            if y % 6 == 0:
                col = shade(col, 0.9)
            c.put(x, y, col)
    c.rect(cx - 70, 56, 140, 4, PAL["lstone"])
    c.rect(cx - 6, 2, 12, 8, PAL["marble"]); c.rect(cx - 3, 0, 6, 3, PAL["lstone"])
    # pediment + colonnade
    for y in range(48, 66):
        half = (y - 48) * 5
        c.hline(cx - half, y, half * 2, PAL["marble"])
    c.hline(cx - 90, 66, 180, PAL["lstone"])
    for i in range(8):
        x = cx - 84 + i * 24
        for y in range(68, 160):
            c.put(x, y, PAL["lstone"]); c.put(x + 1, y, PAL["marble"]); c.put(x + 2, y, PAL["marble"])
            c.put(x + 3, y, PAL["white"]); c.put(x + 4, y, PAL["marble"]); c.put(x + 5, y, PAL["stone"])
        c.rect(x - 1, 66, 8, 3, PAL["marble"]); c.rect(x - 1, 158, 8, 3, PAL["marble"])
    # dark recess behind columns + great door
    for i in range(7):
        x = cx - 78 + i * 24
        c.rect(x, 72, 18, 86, (150, 146, 140))
    c.rect(cx - 12, 116, 24, 42, PAL["wood3"]); c.rect(cx - 10, 118, 20, 40, PAL["wood2"])
    # steps
    for s in range(8):
        y = 160 + s * 4
        w = 200 + s * 12
        c.rect(cx - w // 2, y, w, 3, PAL["marble"] if s % 2 == 0 else PAL["lstone"])
        c.hline(cx - w // 2, y + 3, w, PAL["stone"])
    c.rect(0, 190, W, 34, PAL["lstone"])
    for x in range(0, W, 16):
        c.vline(x, 190, 34, PAL["stone"])
    c.hline(0, 190, W, PAL["marble"])
    return reg("capitol", c, door=(cx - 16, H - 34, 32, 34))


def white_house():
    W, H = T * 9, T * 5
    c = Canvas(W, H)
    roof(c, 8, 20, W - 16, 22, colour=(120, 118, 112), seed=21)
    chimney(c, 40, 8); chimney(c, W - 48, 8)
    fill_stone(c, 8, 42, W - 16, 96, base=PAL["white"], seed=22)
    c.rect(8, 42, W - 16, 3, PAL["marble"])
    for i in range(3):
        window(c, 20 + i * 30, 54, 12, 18, shutters=(60, 80, 60))
        window(c, W - 32 - i * 30, 54, 12, 18, shutters=(60, 80, 60))
        window(c, 20 + i * 30, 96, 12, 18, shutters=(60, 80, 60))
        window(c, W - 32 - i * 30, 96, 12, 18, shutters=(60, 80, 60))
    # north portico
    cx = W // 2
    for y in range(44, 62):
        half = (y - 44) * 3
        c.hline(cx - half, y, half * 2, PAL["marble"])
    c.rect(cx - 52, 62, 104, 3, PAL["lstone"])
    for i in range(5):
        x = cx - 46 + i * 22
        c.rect(x, 64, 6, 70, PAL["marble"]); c.vline(x, 64, 70, PAL["lstone"]); c.vline(x + 5, 64, 70, PAL["stone"])
    c.rect(cx - 40, 66, 80, 68, (200, 196, 188))
    for i in range(5):
        x = cx - 46 + i * 22
        c.rect(x, 64, 6, 70, PAL["marble"]); c.vline(x, 64, 70, PAL["lstone"]); c.vline(x + 5, 64, 70, PAL["stone"])
    door(c, cx - 8, 108, 16, 26, colour=PAL["wood3"], fanlight=True, steps=2)
    c.rect(0, 140, W, 20, PAL["lstone"])
    c.hline(0, 140, W, PAL["marble"])
    return reg("white_house", c, door=(cx - 14, H - 20, 28, 20))


def rowhouse(name, w_tiles=4, h_tiles=4, wall="brick", sign_icon=None, sign_text=True,
             door_col=PAL["wood2"], shutter=None, seed=0, roof_col=PAL["slate"], lit=False, sign_w=None):
    W, H = T * w_tiles, T * h_tiles
    c = Canvas(W, H)
    roof(c, 0, 12, W, 20, colour=roof_col, seed=seed)
    chimney(c, W - 24, 0)
    wy, wh = 32, H - 32 - 12
    if wall == "brick":
        fill_brick(c, 0, wy, W, wh, seed=seed + 1)
    elif wall == "clap":
        fill_clapboard(c, 0, wy, W, wh, seed=seed + 1)
    elif wall == "clap_grey":
        fill_clapboard(c, 0, wy, W, wh, base=(196, 192, 184), seed=seed + 1)
    elif wall == "plaster":
        fill_plaster(c, 0, wy, W, wh, seed=seed + 1)
    elif wall == "stone":
        fill_stone(c, 0, wy, W, wh, base=PAL["lstone"], seed=seed + 1)
    c.outline(0, wy, W, wh, PAL["ink"])
    # upper windows
    n = w_tiles
    for i in range(n):
        window(c, 10 + i * 32, 40, 12, 16, shutters=shutter, lit=lit and i % 2 == 0)
    # ground floor: door at centre-left, windows elsewhere
    dx = (W // 2) - 7 if w_tiles % 2 == 0 else 10 + (w_tiles // 2) * 32
    for i in range(n):
        x = 10 + i * 32
        if abs(x - dx) < 20:
            continue
        window(c, x, H - 46, 12, 18, shutters=shutter, lit=lit)
    door(c, dx, H - 46, 14, 24, colour=door_col, fanlight=w_tiles > 3)
    if sign_icon or sign_text:
        sw = sign_w or min(W - 16, 60)
        sign(c, W // 2 - sw // 2, 62 if w_tiles > 2 else 60, sw, icon=sign_icon)
    # ground shadow strip
    c.rect(0, H - 12, W, 12, PAL["shadow"])
    c.noise_fill(0, H - 12, W, 12, [PAL["mud2"], PAL["mud3"]], seed=seed)
    return reg(name, c, door=(dx - 4, H - 12, 22, 12))


def jail():
    W, H = T * 4, T * 4
    c = Canvas(W, H)
    roof(c, 0, 16, W, 16, colour=(70, 68, 72), seed=31)
    fill_stone(c, 0, 32, W, H - 44, base=PAL["stone"], seed=32)
    c.outline(0, 32, W, H - 44, PAL["ink"])
    for x in (14, W - 26):
        c.rect(x, 44, 12, 12, PAL["ink"])
        for k in range(0, 12, 3):
            c.vline(x + k + 1, 44, 12, PAL["slate"])
    c.rect(14, 76, 12, 12, PAL["ink"])
    for k in range(0, 12, 3):
        c.vline(14 + k + 1, 76, 12, PAL["slate"])
    door(c, W // 2 - 7, H - 46, 14, 24, colour=PAL["wood3"])
    c.rect(W // 2 - 8, H - 48, 16, 3, PAL["slate"])
    sign(c, W // 2 - 26, 60, 52, text_col=PAL["cream"], board=PAL["shadow"])
    c.noise_fill(0, H - 12, W, 12, [PAL["mud2"], PAL["mud3"]], seed=33)
    return reg("jail", c, door=(W // 2 - 11, H - 12, 22, 12))


def hotel():
    """Indian Queen Hotel: big brick, painted sign, many windows, two doors."""
    W, H = T * 7, T * 5
    c = Canvas(W, H)
    roof(c, 0, 10, W, 22, colour=(96, 60, 50), seed=41)
    chimney(c, 30, 0); chimney(c, W - 40, 0)
    fill_brick(c, 0, 32, W, H - 44, seed=42)
    c.outline(0, 32, W, H - 44, PAL["ink"])
    for i in range(7):
        window(c, 10 + i * 32, 40, 12, 16, shutters=(80, 40, 30))
        if i not in (3,):
            window(c, 10 + i * 32, 82, 12, 18, shutters=(80, 40, 30))
    door(c, W // 2 - 7, H - 46, 14, 24, colour=PAL["red"], fanlight=True)
    # painted sign: crowned figure
    c.rect(W // 2 - 44, 66, 88, 12, PAL["parchment"]); c.outline(W // 2 - 44, 66, 88, 12, PAL["wood3"])
    c.rect(W // 2 - 40, 68, 6, 8, PAL["red"]); c.rect(W // 2 - 39, 66, 4, 2, PAL["gold"])
    c.hline(W // 2 - 30, 70, 64, PAL["red"]); c.hline(W // 2 - 28, 73, 56, PAL["ink"])
    c.noise_fill(0, H - 12, W, 12, [PAL["mud2"], PAL["mud3"]], seed=43)
    return reg("hotel", c, door=(W // 2 - 11, H - 12, 22, 12))


# --- props -----------------------------------------------------------------
def tree_bare():
    c = Canvas(T * 2, T * 3)
    r = random.Random(5)
    c.rect(29, 60, 6, 32, PAL["wood3"]); c.vline(31, 60, 32, PAL["wood2"])
    c.rect(26, 88, 12, 4, PAL["wood3"])
    branches = [(31, 60, -1, -1, 24), (33, 60, 1, -1, 22), (31, 58, 0, -1, 20), (30, 62, -1, -1, 14), (34, 64, 1, -1, 12)]
    for (x, y, dx, dy, n) in branches:
        for i in range(n):
            x += dx + r.choice([-1, 0, 0, 1]); y += dy
            c.put(x, y, PAL["wood3"]); c.put(x + 1, y, PAL["wood2"])
            if i % 4 == 3:
                for j in range(6):
                    c.put(x + j * (1 if r.random() < 0.5 else -1), y - j, PAL["wood3"])
    for _ in range(120):
        x, y = r.randrange(4, 60), r.randrange(2, 56)
        if c.get(x, y)[3] == 0 and any(c.get(x + a, y + b)[3] for a in (-1, 0, 1) for b in (-1, 0, 1)):
            c.put(x, y, PAL["wood3"])
    return reg("tree_bare", c, solid=(20, 76, 24, 16))


def lamp_post():
    c = Canvas(T, T * 2)
    c.rect(14, 12, 4, 46, PAL["ink"]); c.vline(15, 12, 46, PAL["shadow"])
    c.rect(11, 58, 10, 4, PAL["ink"])
    c.rect(10, 2, 12, 12, PAL["ink"]); c.rect(12, 4, 8, 8, PAL["candle"]); c.put(15, 6, PAL["white"])
    c.rect(13, 0, 6, 2, PAL["ink"])
    return reg("lamp_post", c, solid=(11, 56, 10, 6))


def fence(w_tiles=3):
    c = Canvas(T * w_tiles, T)
    for x in range(2, T * w_tiles, 8):
        c.rect(x, 6, 3, 22, PAL["white"]); c.put(x + 1, 4, PAL["white"]); c.vline(x + 2, 6, 22, PAL["lstone"])
    c.rect(0, 12, T * w_tiles, 2, PAL["white"]); c.rect(0, 22, T * w_tiles, 2, PAL["white"])
    c.hline(0, 13, T * w_tiles, PAL["lstone"]); c.hline(0, 23, T * w_tiles, PAL["lstone"])
    return reg(f"fence{w_tiles}", c, solid=(0, 8, T * w_tiles, 20))


def hitching_post():
    c = Canvas(T, T)
    c.rect(8, 8, 3, 20, PAL["wood2"]); c.rect(21, 8, 3, 20, PAL["wood2"])
    c.rect(6, 10, 20, 3, PAL["wood1"]); c.hline(6, 10, 20, PAL["wood0"])
    return reg("hitching_post", c, solid=(6, 10, 20, 18))


def wagon():
    c = Canvas(T * 3, T * 2)
    c.rect(10, 16, 70, 24, PAL["wood1"]); c.outline(10, 16, 70, 24, PAL["wood3"])
    for x in range(14, 78, 8):
        c.vline(x, 18, 20, PAL["wood2"])
    c.rect(8, 40, 74, 4, PAL["wood3"])
    for x in (20, 66):
        for y in range(36, 60):
            for xx in range(x - 10, x + 10):
                dx, dy = (xx - x) / 10, (y - 48) / 12
                d = dx * dx + dy * dy
                if 0.6 < d <= 1:
                    c.put(xx, y, PAL["wood3"])
                elif d <= 0.15:
                    c.put(xx, y, PAL["wood2"])
        c.vline(x, 38, 20, PAL["wood2"]); c.hline(x - 8, 48, 16, PAL["wood2"])
    c.rect(82, 30, 12, 3, PAL["wood2"])
    c.rect(12, 6, 66, 10, PAL["parchment"]); c.hline(12, 6, 66, PAL["cream"])
    return reg("wagon", c, solid=(8, 30, 86, 30))


def signpost():
    c = Canvas(T, T * 2)
    c.rect(14, 10, 4, 50, PAL["wood2"])
    c.rect(4, 12, 24, 8, PAL["wood1"]); c.hline(7, 15, 18, PAL["cream"])
    c.rect(4, 24, 24, 8, PAL["wood1"]); c.hline(7, 27, 14, PAL["cream"])
    c.rect(12, 60, 8, 2, PAL["wood3"])
    return reg("signpost", c, solid=(12, 56, 8, 6))


def stump_barrels():
    c = Canvas(T * 2, T)
    for x in (4, 34):
        c.rect(x, 6, 16, 22, PAL["wood1"]); c.vline(x, 8, 18, PAL["wood2"]); c.vline(x + 15, 8, 18, PAL["wood2"])
        c.rect(x - 1, 10, 18, 2, PAL["slate"]); c.rect(x - 1, 22, 18, 2, PAL["slate"])
        c.rect(x + 2, 4, 12, 2, PAL["wood2"])
    return reg("barrels2", c, solid=(2, 8, 60, 22))


def well():
    c = Canvas(T * 2, T * 2)
    fill_stone(c, 12, 30, 40, 26, base=PAL["stone"], seed=77)
    c.rect(12, 28, 40, 3, PAL["lstone"])
    c.rect(20, 34, 24, 14, PAL["ink"])
    c.rect(16, 4, 4, 30, PAL["wood2"]); c.rect(44, 4, 4, 30, PAL["wood2"])
    roof(c, 10, 0, 44, 8, colour=PAL["wood3"])
    c.rect(20, 14, 24, 3, PAL["wood2"]); c.rect(30, 17, 3, 12, PAL["wood3"])
    c.rect(26, 26, 10, 6, PAL["slate"])
    return reg("well", c, solid=(12, 30, 40, 26))


def snow_pile():
    c = Canvas(T, T)
    for y in range(14, 30):
        half = int(14 * ((30 - y) / 16) ** 0.5)
        c.hline(16 - half, y, half * 2, PAL["snow"] if y < 24 else PAL["snow1"])
    c.speckle(4, 16, 24, 12, PAL["white"], 0.15, seed=3)
    return reg("snow_pile", c)


def build_all():
    capitol(); white_house(); jail(); hotel()
    rowhouse("post_office", 4, 4, wall="brick", sign_icon="letter", seed=50, shutter=(50, 70, 60))
    rowhouse("tavern", 5, 4, wall="clap", sign_icon="tankard", seed=60, door_col=PAL["red"], lit=True, roof_col=(90, 70, 60), shutter=(70, 50, 40))
    rowhouse("bank_office", 4, 4, wall="stone", sign_icon="bank", seed=70, door_col=PAL["blue3"], roof_col=(80, 84, 92))
    rowhouse("hat_shop", 3, 4, wall="clap_grey", sign_icon="hat", seed=80, door_col=PAL["wood3"], sign_w=56)
    rowhouse("print_shop", 3, 4, wall="brick", sign_icon="press", seed=90, door_col=(60, 60, 70), sign_w=56)
    rowhouse("boarding_house", 4, 4, wall="clap", sign_text=True, seed=95, door_col=(60, 80, 60), shutter=(60, 80, 60), roof_col=(96, 88, 80), lit=True)
    rowhouse("house_a", 3, 3, wall="clap", sign_text=False, seed=100, shutter=(60, 60, 90))
    rowhouse("house_b", 3, 3, wall="plaster", sign_text=False, seed=110, shutter=(80, 50, 40))
    rowhouse("house_c", 4, 3, wall="brick", sign_text=False, seed=120)
    rowhouse("house_d", 2, 3, wall="clap_grey", sign_text=False, seed=130)
    tree_bare(); lamp_post(); fence(3); fence(2); hitching_post(); wagon(); signpost(); stump_barrels(); well(); snow_pile()
    index = {}
    for name, o in objs.items():
        o["c"].save(f"buildings/{name}.png")
        index[name] = {"w": o["c"].w, "h": o["c"].h, "door": o["door"], "solid": o["solid"]}
    with open(os.path.join(ASSETS, "buildings", "index.json"), "w") as f:
        json.dump(index, f)
    return [o["c"] for o in objs.values()]


if __name__ == "__main__":
    cs = build_all()
    print(len(cs), "objects")
    print(preview(cs[:4], "buildings_a.png", scale=2))
    print(preview(cs[4:13], "buildings_b.png", scale=2))
    print(preview(cs[13:], "props.png", scale=3))
