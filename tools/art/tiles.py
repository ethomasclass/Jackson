"""32x32 interior tiles and furniture for 1835 Washington, packed into an atlas.

Drawn against period references: Windsor bow-back chairs, Duncan Phyfe scroll-arm
sofas, Franklin stoves, Argand oil lamps, a Columbian iron hand press with its
eagle counterweight, a caged tavern bar, post-office pigeonholes, a bank counter
with a brass grille, ingrain carpets, raised-panel wainscot and sprigged wallpaper.
"""
import glob
import json
import os
import random
from PIL import Image
from common import Canvas, PAL, shade, mix, preview, ASSETS

T = 32
tiles = {}
REF = os.path.join(os.path.dirname(__file__), "ref")


def reg(name, c):
    tiles[name] = c
    return c



# ---------------------------------------------------------------------------
# outdoor ground
# ---------------------------------------------------------------------------
def mud(seed, ruts=False, puddle=False):
    c = Canvas(T, T)
    r = random.Random(seed)
    c.noise_fill(0, 0, T, T, [PAL["mud1"], PAL["mud1"], PAL["mud0"], PAL["mud2"], (100, 76, 52)], seed=seed, weights=[5, 4, 2, 2, 2])
    for _ in range(12):   # clods with a lit top and a shadow
        x, y = r.randrange(T), r.randrange(T)
        c.put(x, y, PAL["mud0"]); c.put(x + 1, y, PAL["mud2"]); c.put(x, y + 1, PAL["mud3"]); c.put(x + 1, y + 1, PAL["mud3"])
    for _ in range(5):    # straw and grit
        x, y = r.randrange(T), r.randrange(T)
        c.put(x, y, PAL["sand"]); c.put(x + 1, y, (196, 170, 120))
    for _ in range(6):    # hoof marks
        x, y = r.randrange(2, 30), r.randrange(2, 30)
        c.put(x, y, PAL["mud3"]); c.put(x + 1, y + 1, PAL["mud3"])
    if ruts:   # wheel ruts run along the avenue (east-west), with the lit lip on top and water in the trough
        for x in range(T):
            wob = (x // 6) % 2
            for base in (9, 21):
                c.put(x, base + wob, (90, 66, 44)); c.put(x, base + 1 + wob, PAL["mud3"]); c.put(x, base + 2 + wob, (70, 60, 60) if (x + base) % 3 else (92, 104, 128))
                c.put(x, base - 1 + wob, PAL["mud0"])
    if puddle:
        for y in range(9, 23):
            w = 11 - abs(y - 16)
            for x in range(16 - w, 16 + w):
                col = (92, 104, 128) if (x + y) % 5 else (150, 168, 190)
                if y < 12:
                    col = (120, 136, 160)
                c.put(x, y, col)
        c.hline(8, 23, 16, PAL["mud3"]); c.hline(6, 9, 4, PAL["mud3"])
        c.hline(14, 12, 6, (200, 214, 228))   # sky reflection
    return c


for i in range(4):
    reg(f"mud{i}", mud(100 + i))
reg("mud_ruts", mud(200, ruts=True))
reg("mud_puddle", mud(300, puddle=True))


def grass(seed, snowy=0.0):
    c = Canvas(T, T)
    r = random.Random(seed)
    c.noise_fill(0, 0, T, T, [PAL["grass1"], PAL["grass1"], PAL["grass0"], PAL["grass2"], PAL["mud1"], (120, 124, 70)], seed=seed, weights=[5, 3, 2, 2, 1, 2])
    for _ in range(16):   # dead winter tufts
        x, y = r.randrange(T), r.randrange(2, T)
        c.put(x, y, PAL["sand"]); c.put(x, y - 1, (170, 150, 90)); c.put(x + 1, y - 2, PAL["grass0"]) if r.random() < 0.5 else None
    if snowy:
        for _ in range(int(70 * snowy)):
            x, y = r.randrange(T), r.randrange(T)
            c.put(x, y, (232, 236, 244)); c.put(x + 1, y, (200, 208, 222))
            if r.random() < 0.4:
                c.put(x, y + 1, (200, 208, 222))
    return c


for i in range(3):
    reg(f"grass{i}", grass(400 + i))
reg("grass_snow0", grass(500, snowy=0.5))
reg("grass_snow1", grass(501, snowy=0.9))


def cobble(seed):
    c = Canvas(T, T)
    c.rect(0, 0, T, T, (58, 50, 54))
    r = random.Random(seed)
    for row in range(4):
        off = 4 if row % 2 else 0
        for col in range(-1, 5):
            x0, y0 = col * 8 + off + 1, row * 8 + 1
            base = r.choice([PAL["stone"], PAL["stone"], PAL["lstone"], PAL["slate"], (120, 112, 104)])
            for y in range(y0, y0 + 6):
                for x in range(x0, x0 + 6):
                    v = base
                    if y == y0 or x == x0:
                        v = shade(base, 1.18)
                    if y == y0 + 5 or x == x0 + 5:
                        v = shade(base, 0.72)
                    c.put(x, y, v)
            if r.random() < 0.3:
                c.put(x0 + 2, y0 + 1, (232, 236, 244))   # snow in the joints
    return c


for i in range(2):
    reg(f"cobble{i}", cobble(600 + i))


def flag(seed, light=False):
    c = Canvas(T, T)
    base = PAL["marble"] if light else PAL["lstone"]
    c.noise_fill(0, 0, T, T, [base, shade(base, 0.96), shade(base, 1.03)], seed=seed)
    c.hline(0, 15, T, shade(base, 0.72)); c.vline(15, 0, 16, shade(base, 0.72)); c.vline(7, 16, 16, shade(base, 0.72))
    c.hline(0, 0, T, shade(base, 1.08)); c.vline(0, 0, T, shade(base, 1.08))
    c.hline(0, 16, T, shade(base, 1.06)); c.vline(16, 0, 16, shade(base, 1.06)); c.vline(8, 16, 16, shade(base, 1.06))
    r = random.Random(seed)
    for _ in range(5):
        c.put(r.randrange(T), r.randrange(T), shade(base, 0.9))
    return c


reg("flag0", flag(700)); reg("flag1", flag(701, light=True))

# ---------------------------------------------------------------------------
# floors
# ---------------------------------------------------------------------------
def planks(seed, tone=PAL["wood1"], worn=0.0):
    c = Canvas(T, T)
    r = random.Random(seed)
    for i in range(4):
        base = mix(tone, r.choice([PAL["wood0"], PAL["wood2"], tone, tone]), 0.28)
        seam = r.randrange(3, 29)
        for k in range(8):
            for j in range(T):
                v = base
                if k == 0:
                    v = shade(base, 0.62)          # gap between boards
                elif k == 1:
                    v = shade(base, 1.12)          # lit edge
                elif k == 7:
                    v = shade(base, 0.86)
                if r.random() < 0.05:
                    v = shade(base, r.choice([0.9, 1.06]))
                if worn and 10 < j < 22 and 2 < k < 6 and r.random() < worn:
                    v = shade(base, 1.08)          # foot-polished centre
                c.put(j, i * 8 + k, v)
        for k in range(1, 8):
            c.put(seam, i * 8 + k, shade(base, 0.62))
        # nail heads at the seam
        c.put(seam - 2, i * 8 + 3, shade(base, 0.55)); c.put(seam + 2, i * 8 + 3, shade(base, 0.55))
        if r.random() < 0.35:   # knot
            kx, ky = r.randrange(4, 28), i * 8 + 4
            c.put(kx, ky, shade(base, 0.7)); c.put(kx + 1, ky, shade(base, 0.6)); c.put(kx, ky + 1, shade(base, 0.75))
    return c


for i in range(3):
    reg(f"floor_wood{i}", planks(800 + i, worn=0.3))
reg("floor_wood_dark", planks(810, tone=PAL["wood2"], worn=0.2))
reg("floor_wood_pale", planks(811, tone=(190, 150, 100), worn=0.3))


def flagstones(seed, tone=PAL["stone"]):
    c = Canvas(T, T)
    r = random.Random(seed)
    c.rect(0, 0, T, T, shade(tone, 0.6))
    cells = [(0, 0, 18, 14), (18, 0, 14, 10), (18, 10, 14, 12), (0, 14, 10, 18), (10, 14, 22, 18)]
    for (x, y, w, h) in cells:
        base = mix(tone, r.choice([PAL["lstone"], PAL["slate"], tone]), 0.35)
        for yy in range(y + 1, y + h - 1):
            for xx in range(x + 1, x + w - 1):
                v = base
                if xx == x + 1 or yy == y + 1:
                    v = shade(base, 1.1)
                if xx == x + w - 2 or yy == y + h - 2:
                    v = shade(base, 0.8)
                if r.random() < 0.06:
                    v = shade(base, 0.92)
                c.put(xx, yy, v)
    return c


reg("floor_stone0", flagstones(900)); reg("floor_stone1", flagstones(901))


def checker():
    """Black and white marble, the Bank's floor."""
    c = Canvas(T, T)
    r = random.Random(3)
    for cy in range(2):
        for cx in range(2):
            black = (cx + cy) % 2 == 1
            base = (54, 52, 58) if black else PAL["marble"]
            for yy in range(cy * 16, cy * 16 + 16):
                for xx in range(cx * 16, cx * 16 + 16):
                    v = base
                    if r.random() < 0.08:
                        v = shade(base, 1.15 if black else 0.94)
                    if xx == cx * 16 or yy == cy * 16:
                        v = shade(base, 0.75)
                    c.put(xx, yy, v)
            # a vein
            vx = cx * 16 + r.randrange(2, 12)
            for k in range(6):
                c.put(vx + k, cy * 16 + 4 + k, shade(base, 1.25 if black else 0.88))
    return c


reg("floor_marble", checker())


def rug(colour, border, part="c", motif=True):
    c = Canvas(T, T)
    c.noise_fill(0, 0, T, T, [colour, shade(colour, 0.94), shade(colour, 1.05)], seed=7)
    if motif:   # ingrain carpet: repeating diamond with a sprig
        for y in range(0, T, 16):
            for x in range(0, T, 16):
                for k in range(-4, 5):
                    c.put(x + 8 + k, y + 8 - abs(k) + 4, shade(colour, 1.35))
                    c.put(x + 8 + k, y + 8 + abs(k) - 4 + 8, shade(colour, 1.35)) if abs(k) < 5 else None
                c.put(x + 8, y + 8, shade(colour, 0.7)); c.put(x + 7, y + 8, shade(colour, 0.7)); c.put(x + 9, y + 8, shade(colour, 0.7))
                c.put(x + 8, y + 7, PAL["gold"]); c.put(x + 8, y + 9, PAL["gold"])
    edge = shade(border, 0.7)
    if "t" in part:
        c.hline(0, 0, T, edge); c.rect(0, 1, T, 3, border)
        for x in range(1, T, 3): c.put(x, 2, edge)
    if "b" in part:
        c.hline(0, T - 1, T, edge); c.rect(0, T - 4, T, 3, border)
        for x in range(1, T, 3): c.put(x, T - 3, edge)
        for x in range(0, T, 2): c.put(x, T - 1, shade(border, 1.2))   # fringe
    if "l" in part:
        c.vline(0, 0, T, edge); c.rect(1, 0, 3, T, border)
        for y in range(1, T, 3): c.put(2, y, edge)
    if "r" in part:
        c.vline(T - 1, 0, T, edge); c.rect(T - 4, 0, 3, T, border)
        for y in range(1, T, 3): c.put(T - 3, y, edge)
    return c


for part in ["tl", "t", "tr", "l", "c", "r", "bl", "b", "br"]:
    reg(f"rug_red_{part}", rug((124, 40, 40), PAL["gold"], part))
    reg(f"rug_green_{part}", rug((48, 78, 60), (200, 176, 120), part))
    reg(f"rug_blue_{part}", rug((46, 58, 100), PAL["gold"], part))


# ---------------------------------------------------------------------------
# walls (a band seen from the front: picture rail, field, chair rail, wainscot)
# ---------------------------------------------------------------------------
def wainscot(c, y=20, tone=PAL["wood2"]):
    c.rect(0, y, T, T - y, tone)
    c.hline(0, y, T, shade(tone, 1.4)); c.hline(0, y + 1, T, shade(tone, 0.6))     # chair rail
    for x in range(0, T, 16):
        c.outline(x + 2, y + 3, 12, 8, shade(tone, 0.6)); c.rect(x + 3, y + 4, 10, 6, shade(tone, 1.12))
        c.hline(x + 3, y + 4, 10, shade(tone, 1.3)); c.vline(x + 3, y + 4, 6, shade(tone, 1.3))
    c.hline(0, T - 1, T, shade(tone, 0.5))


def wall(kind, seed=0, base=None):
    c = Canvas(T, T)
    r = random.Random(seed)
    if kind == "plaster":
        base = base or PAL["cream"]
        c.noise_fill(0, 0, T, T, [base, shade(base, 0.97), shade(base, 1.02)], seed=seed)
        c.hline(0, 3, T, shade(base, 0.8)); c.hline(0, 4, T, shade(base, 1.1))
    elif kind == "paper":
        base = base or (206, 190, 156)
        c.noise_fill(0, 0, T, T, [base, shade(base, 0.97)], seed=seed)
        for x in (4, 20):   # stripes
            c.vline(x, 0, T, shade(base, 0.9)); c.vline(x + 1, 0, T, shade(base, 0.9))
        for y in range(4, T, 10):
            for x in (10, 26):
                c.put(x, y, (86, 110, 70)); c.put(x + 1, y + 1, (86, 110, 70)); c.put(x - 1, y + 1, (86, 110, 70))
                c.put(x, y + 2, (150, 60, 60)); c.put(x, y + 3, (86, 110, 70))
        c.hline(0, 3, T, shade(base, 0.8))
    elif kind == "panel":
        base = base or PAL["wood1"]
        c.rect(0, 0, T, T, base)
        c.outline(2, 2, 28, 16, shade(base, 0.55)); c.rect(3, 3, 26, 14, shade(base, 1.08))
        c.hline(3, 3, 26, shade(base, 1.3)); c.vline(3, 3, 14, shade(base, 1.3))
        c.hline(3, 16, 26, shade(base, 0.8)); c.vline(28, 3, 14, shade(base, 0.8))
        c.outline(2, 20, 28, 10, shade(base, 0.55)); c.rect(3, 21, 26, 8, shade(base, 1.08)); c.hline(3, 21, 26, shade(base, 1.3))
    elif kind == "brick":
        c.rect(0, 0, T, T, (196, 182, 160))
        for row in range(8):
            off = 4 if row % 2 else 0
            for col in range(-1, 5):
                x0 = col * 8 + off
                b = r.choice([PAL["brick1"], PAL["brick1"], PAL["brick2"], PAL["brick0"]])
                c.rect(x0, row * 4, 7, 3, b)
                c.hline(x0, row * 4 + 2, 7, shade(b, 0.8))
        c.speckle(0, 0, T, 6, (120, 110, 100), 0.2, seed=seed)   # soot near the ceiling
    elif kind == "stone":
        c.rect(0, 0, T, T, (58, 54, 56))
        for _ in range(26):
            sx, sy = r.randrange(-3, T), r.randrange(-3, T)
            sw, sh = r.randrange(5, 11), r.randrange(4, 7)
            b = r.choice([PAL["stone"], PAL["slate"], (104, 100, 98)])
            for yy in range(max(0, sy), min(T, sy + sh)):
                for xx in range(max(0, sx), min(T, sx + sw)):
                    c.put(xx, yy, b if (yy < sy + sh - 1 and xx < sx + sw - 1) else shade(b, 0.7))
        c.speckle(0, 22, T, 10, (70, 80, 70), 0.12, seed=seed)   # damp
    elif kind == "log":
        for row in range(4):
            b = mix(PAL["wood1"], PAL["wood0"], (row % 2) * 0.25)
            c.rect(0, row * 8, T, 8, b)
            c.hline(0, row * 8, T, shade(b, 1.25)); c.hline(0, row * 8 + 1, T, shade(b, 1.1))
            c.rect(0, row * 8 + 6, T, 2, (200, 190, 170))   # chinking
            for x in range(r.randrange(0, 8), T, 9):
                c.put(x, row * 8 + 3, shade(b, 0.8)); c.put(x + 1, row * 8 + 4, shade(b, 0.8))
    elif kind == "marble":
        base = base or PAL["marble"]
        c.rect(0, 0, T, T, shade(base, 0.85))
        for row in range(4):
            off = 8 if row % 2 else 0
            for col in range(-1, 3):
                x0 = col * 16 + off
                b = r.choice([base, shade(base, 0.97), shade(base, 1.02)])
                c.rect(x0 + 1, row * 8 + 1, 14, 6, b); c.hline(x0 + 1, row * 8 + 1, 14, shade(b, 1.08))
    return c


reg("wall_plaster", wall("plaster", 1))
reg("wall_plaster_b", wall("plaster", 2, base=(216, 208, 190)))
reg("wall_brick", wall("brick", 3))
reg("wall_stone", wall("stone", 4))
reg("wall_log", wall("log", 5))
reg("wall_panel", wall("panel", 6))
reg("wall_paper", wall("paper", 8))
reg("wall_marble", wall("marble", 9))


def wall_top():
    c = Canvas(T, T)
    c.rect(0, 0, T, T, (22, 18, 20))
    c.rect(0, T - 4, T, 4, PAL["wood3"]); c.hline(0, T - 4, T, PAL["wood1"]); c.hline(0, T - 1, T, (30, 22, 18))
    for x in range(0, T, 8):
        c.put(x, T - 2, PAL["wood1"])   # dentil hints on the cornice
    return c


reg("wall_top", wall_top())


def wall_lower(kind, seed=0, base=None):
    """The lower band of a two-tile wall: wainscot, dado or continued masonry."""
    c = Canvas(T, T)
    r = random.Random(seed + 77)
    if kind in ("plaster", "paper", "panel", "marble"):
        tone = {"plaster": PAL["wood2"], "paper": (110, 80, 50), "panel": base or PAL["wood1"], "marble": PAL["lstone"]}[kind]
        if kind == "marble":
            c.rect(0, 0, T, T, PAL["lstone"]); c.hline(0, 0, T, PAL["marble"]); c.hline(0, 1, T, PAL["stone"])
            for x in range(0, T, 16):
                c.outline(x + 2, 6, 12, 20, PAL["stone"]); c.rect(x + 3, 7, 10, 18, shade(PAL["lstone"], 1.05))
            c.hline(0, T - 2, T, PAL["stone"]); c.hline(0, T - 1, T, PAL["shadow"])
        else:
            c.rect(0, 0, T, T, tone)
            c.hline(0, 0, T, shade(tone, 1.45)); c.hline(0, 1, T, shade(tone, 0.6))     # chair rail
            for x in range(0, T, 16):
                c.outline(x + 2, 5, 12, 20, shade(tone, 0.55)); c.rect(x + 3, 6, 10, 18, shade(tone, 1.12))
                c.hline(x + 3, 6, 10, shade(tone, 1.3)); c.vline(x + 3, 6, 18, shade(tone, 1.3))
            c.hline(0, T - 3, T, shade(tone, 1.2)); c.rect(0, T - 2, T, 2, shade(tone, 0.5))   # baseboard
    else:
        c.blit(wall(kind, seed + 1), 0, 0)
        c.rect(0, T - 2, T, 2, (30, 26, 28))
    return c


for k, nm in [("plaster", "wall_plaster"), ("plaster", "wall_plaster_b"), ("brick", "wall_brick"), ("stone", "wall_stone"), ("log", "wall_log"), ("panel", "wall_panel"), ("paper", "wall_paper"), ("marble", "wall_marble")]:
    reg(nm + "_lower", wall_lower(k, seed=len(nm), base=(216, 208, 190) if nm == "wall_plaster_b" else None))


def tall_window(wallname, part, curtains=False):
    """A two-tile sash window: part 'upper' (head, upper sash) or 'lower' (lower sash, sill)."""
    c = Canvas(T, T)
    c.blit(tiles[wallname if part == "upper" else wallname + "_lower"], 0, 0)
    y0 = 6 if part == "upper" else -26          # window spans y 6..46 across the two tiles
    c.rect(5, max(0, y0 - 1), 22, T, (40, 32, 30)) if part == "upper" else c.rect(5, 0, 22, 21, (40, 32, 30))
    for yy in range(0, 40):
        gy = y0 + yy
        if 0 <= gy < T:
            for xx in range(6, 26):
                t = yy / 40
                # cold winter sky fading to snowy ground, a bare tree silhouette
                col = mix((176, 196, 214), (128, 150, 176), t) if t < 0.62 else mix((214, 220, 230), (196, 204, 216), (t - 0.62) / 0.38)
                if 0.3 < t < 0.62 and abs(xx - 14 - int(3 * (t - 0.3) * 4)) < 2 and (xx + yy) % 3:
                    col = (70, 56, 48)
                if (xx + yy) % 11 == 0 and t < 0.5:
                    col = mix(col, (240, 246, 250), 0.5)
                c.put(xx, gy, col)
    bar = (226, 220, 206)
    for gy in range(y0, y0 + 40):
        if 0 <= gy < T:
            c.put(12, gy, bar); c.put(19, gy, bar)
    for k in (8, 14, 20, 26, 32):   # horizontal glazing bars, meeting rail at 20
        gy = y0 + k
        if 0 <= gy < T:
            c.hline(6, gy, 20, shade(bar, 0.8) if k == 20 else bar)
            if k == 20:
                c.hline(6, gy - 1, 20, bar)
    if part == "upper":
        c.rect(4, 4, 24, 2, (222, 214, 196)); c.hline(4, 6, 24, (150, 140, 120))     # head casing
        c.vline(5, 6, 26, (236, 230, 216)); c.vline(26, 6, 26, (236, 230, 216))
    else:
        c.vline(5, 0, 20, (236, 230, 216)); c.vline(26, 0, 20, (236, 230, 216))
        c.rect(3, 20, 26, 3, (222, 214, 196)); c.hline(3, 23, 26, (150, 140, 120)); c.hline(3, 20, 26, (240, 236, 224))   # sill
    if curtains:
        for x0 in (2, 26):
            for yy in range(0, T):
                gy = yy + (0 if part == "upper" else 32)
                if gy < 46:
                    w = 4 if gy < 30 else 3
                    for k in range(w):
                        c.put(x0 + k if x0 < 16 else x0 + 3 - k, yy, (150, 50, 50) if (k + yy) % 3 else (176, 66, 60))
        if part == "upper":
            c.rect(1, 1, 30, 3, (110, 80, 50)); c.hline(1, 1, 30, PAL["gold"]); c.put(0, 2, PAL["gold1"]); c.put(31, 2, PAL["gold1"])
        else:
            c.rect(1, 12, 5, 2, PAL["gold"]); c.rect(26, 12, 5, 2, PAL["gold"])   # tie-backs
    return c


for wn in ["wall_plaster", "wall_plaster_b", "wall_paper", "wall_panel", "wall_log", "wall_marble", "wall_brick", "wall_stone"]:
    cur = wn in ("wall_paper", "wall_plaster")
    reg(wn + "_win", tall_window(wn, "upper", curtains=cur))
    reg(wn + "_win_lower", tall_window(wn, "lower", curtains=cur))


def tall_door(wallname, part):
    c = Canvas(T, T)
    c.blit(tiles[wallname if part == "upper" else wallname + "_lower"], 0, 0)
    col = PAL["wood2"]
    if part == "upper":
        c.rect(3, 8, 26, 24, (222, 214, 196)); c.vline(3, 8, 24, (236, 230, 216)); c.vline(28, 8, 24, (150, 140, 120))
        c.rect(1, 5, 30, 3, (226, 218, 200)); c.hline(1, 7, 30, (150, 140, 120))
        c.rect(6, 12, 20, 20, col); c.rect(6, 11, 20, 1, (30, 24, 22))
        for (px, py, pw, ph) in [(8, 14, 7, 8), (17, 14, 7, 8), (8, 24, 7, 8), (17, 24, 7, 8)]:
            c.rect(px, py, pw, ph, shade(col, 0.8)); c.rect(px + 1, py + 1, pw - 2, ph - 2, shade(col, 1.15)); c.hline(px + 1, py + 1, pw - 2, shade(col, 1.3))
    else:
        c.rect(3, 0, 26, 28, (222, 214, 196)); c.vline(3, 0, 28, (236, 230, 216)); c.vline(28, 0, 28, (150, 140, 120))
        c.rect(6, 0, 20, 26, col)
        for (px, py, pw, ph) in [(8, 2, 7, 10), (17, 2, 7, 10), (8, 14, 7, 10), (17, 14, 7, 10)]:
            c.rect(px, py, pw, ph, shade(col, 0.8)); c.rect(px + 1, py + 1, pw - 2, ph - 2, shade(col, 1.15)); c.hline(px + 1, py + 1, pw - 2, shade(col, 1.3))
        c.put(23, 4, PAL["gold1"]); c.put(23, 5, PAL["gold"])
        c.rect(4, 26, 24, 3, PAL["stone"]); c.hline(4, 26, 24, PAL["lstone"])   # threshold
    return c


for wn in ["wall_plaster", "wall_plaster_b", "wall_paper", "wall_panel", "wall_log", "wall_marble", "wall_stone", "wall_brick"]:
    reg(wn + "_door", tall_door(wn, "upper"))
    reg(wn + "_door_lower", tall_door(wn, "lower"))


def wall_side(kind="dark"):
    """Room side wall seen edge-on: a dark band with a lit inner edge."""
    c = Canvas(T, T)
    c.rect(0, 0, T, T, (26, 22, 24))
    c.noise_fill(0, 0, T, T, [(26, 22, 24), (32, 26, 28), (22, 18, 20)], seed=3)
    return c


reg("wall_side", wall_side())


def wall_bottom():
    c = Canvas(T, T)
    c.rect(0, 0, T, T, (26, 22, 24))
    c.noise_fill(0, 4, T, T - 4, [(26, 22, 24), (32, 26, 28), (22, 18, 20)], seed=5)
    c.hline(0, 0, T, (60, 48, 40)); c.hline(0, 1, T, (44, 36, 32)); c.hline(0, 2, T, (34, 28, 26))   # wall top lip, lit
    return c


reg("wall_bottom", wall_bottom())


def void_tile():
    c = Canvas(T, T)
    c.noise_fill(0, 0, T, T, [(18, 16, 18), (22, 18, 20), (16, 14, 16)], seed=9)
    return c


reg("void", void_tile())






def exit_mat():
    c = Canvas(T, T)
    c.rect(2, 25, 28, 6, (60, 44, 30)); c.rect(3, 26, 26, 4, (140, 110, 70))
    for x in range(4, 28, 2):
        c.put(x, 27, (110, 84, 50)); c.put(x + 1, 28, (110, 84, 50))
    return c


reg("exit_mat", exit_mat())

# ---------------------------------------------------------------------------
# furniture
# ---------------------------------------------------------------------------
W0, W1, W2, W3 = PAL["wood0"], PAL["wood1"], PAL["wood2"], PAL["wood3"]


def leg(c, x, y, h, tone=W2):
    c.vline(x, y, h, tone); c.vline(x + 1, y, h, shade(tone, 0.7))
    c.put(x, y + h - 1, shade(tone, 0.5)); c.put(x + 1, y + h - 1, shade(tone, 0.5))


def turned_leg(c, x, y, h, tone=W2):
    for k in range(h):
        w = 2 if k % 4 else 3
        c.rect(x - (w - 2), y + k, w, 1, tone if k % 4 != 2 else shade(tone, 0.75))
    c.put(x, y + h - 1, shade(tone, 0.5))


def desk(w=2, papers=True, ink=True):
    """Clerk's slant-top desk with ledger, inkwell and quill."""
    c = Canvas(T * w, T)
    c.rect(1, 8, T * w - 2, 14, W1); c.hline(1, 8, T * w - 2, shade(W0, 1.15)); c.hline(1, 9, T * w - 2, W0)
    c.rect(1, 20, T * w - 2, 6, W2); c.hline(1, 21, T * w - 2, W3)
    for k in range(w):
        c.outline(k * T + 4, 22, 10, 3, W3); c.put(k * T + 8, 23, PAL["gold"])
        c.outline(k * T + 18, 22, 10, 3, W3); c.put(k * T + 22, 23, PAL["gold"])
    turned_leg(c, 3, 26, 6); turned_leg(c, T * w - 4, 26, 6)
    if papers:
        c.rect(4, 10, 12, 9, (230, 222, 200)); c.rect(5, 11, 12, 9, (246, 240, 226)); c.hline(5, 11, 12, (255, 255, 250))
        for y in range(13, 19, 2):
            c.hline(7, y, 8, (90, 80, 70))
        c.rect(6, 12, 3, 1, (150, 40, 40))
    if ink:
        x = T * w - 12
        c.rect(x, 12, 6, 6, (30, 28, 34)); c.hline(x, 12, 6, (80, 78, 90)); c.put(x + 1, 13, (120, 118, 130))
        for k in range(7):   # quill
            c.put(x + 3 + k // 2, 11 - k, (236, 232, 220) if k > 2 else (60, 50, 44))
        c.rect(x - 6, 15, 4, 4, PAL["candle"]); c.put(x - 5, 13, PAL["flame"]); c.put(x - 5, 14, PAL["candle"])
    return c


reg("desk2", desk(2)); reg("desk3", desk(3)); reg("desk1", desk(1, papers=False, ink=False))


def table(w=2, cloth=False):
    c = Canvas(T * w, T)
    c.rect(1, 9, T * w - 2, 12, W0); c.hline(1, 9, T * w - 2, shade(W0, 1.2))
    for x in range(3, T * w - 3, 6):
        c.vline(x, 10, 10, shade(W0, 0.88))
    c.rect(1, 19, T * w - 2, 3, W2); c.hline(1, 21, T * w - 2, W3)
    turned_leg(c, 3, 22, 10); turned_leg(c, T * w - 4, 22, 10)
    if w > 1:
        turned_leg(c, T, 22, 10)
    return c


reg("table2", table(2)); reg("table1", table(1))


def windsor(facing="down"):
    """Bow-back Windsor chair: spindles, saddle seat, splayed turned legs."""
    c = Canvas(T, T)
    if facing == "down":
        for k in range(3):
            c.hline(10 + k, 4 + k, 12 - 2 * k, W2)       # bow
        c.hline(9, 6, 14, W2)
        for x in range(10, 22, 2):
            c.vline(x, 7, 9, W1)                         # spindles
        c.rect(8, 16, 16, 6, W0); c.hline(8, 16, 16, shade(W0, 1.2)); c.hline(8, 21, 16, W2)
        c.hline(10, 18, 12, shade(W0, 0.9))              # saddle
        leg(c, 8, 22, 8); leg(c, 22, 22, 8); leg(c, 11, 23, 5, W3); leg(c, 19, 23, 5, W3)
        c.hline(10, 26, 12, W3)                          # stretcher
    else:
        c.rect(8, 8, 16, 6, W0); c.hline(8, 8, 16, shade(W0, 1.2))
        c.rect(8, 13, 16, 12, W2)
        for x in range(10, 22, 2):
            c.vline(x, 14, 10, W1)
        c.rect(8, 12, 16, 2, W3)
        leg(c, 8, 25, 5); leg(c, 22, 25, 5)
    return c


reg("chair_down", windsor("down")); reg("chair_up", windsor("up"))


def armchair(colour=(120, 40, 40)):
    """Wing chair, upholstered, brass nail heads."""
    c = Canvas(T, T)
    c.rect(6, 3, 20, 20, colour); c.rect(8, 5, 16, 9, shade(colour, 1.15))
    c.rect(3, 8, 5, 16, shade(colour, 0.85)); c.rect(24, 8, 5, 16, shade(colour, 0.8))
    c.rect(4, 6, 4, 4, shade(colour, 0.95)); c.rect(24, 6, 4, 4, shade(colour, 0.9))   # wings
    c.rect(8, 15, 16, 8, shade(colour, 1.05)); c.hline(8, 15, 16, shade(colour, 1.25))
    for x in range(7, 26, 3):
        c.put(x, 22, PAL["gold1"])
    c.rect(4, 24, 24, 2, W3); leg(c, 5, 26, 4, W3); leg(c, 25, 26, 4, W3)
    return c


reg("armchair", armchair())


def bookshelf(w=2):
    c = Canvas(T * w, T)
    c.rect(0, 0, T * w, T, W2); c.outline(0, 0, T * w, T, W3); c.hline(1, 1, T * w - 2, W1)
    r = random.Random(w * 31)
    for shelf in range(3):
        y0 = 2 + shelf * 10
        c.hline(1, y0 + 8, T * w - 2, W3); c.hline(1, y0 + 9, T * w - 2, W1)
        x = 2
        while x < T * w - 3:
            bw = r.choice([2, 3, 3, 4])
            col = r.choice([(120, 40, 40), (40, 50, 90), (60, 80, 60), (100, 70, 40), (170, 140, 90), (60, 40, 30), (150, 110, 60)])
            h = r.choice([6, 7, 8])
            c.rect(x, y0 + 8 - h, bw, h, col)
            c.put(x, y0 + 8 - h + 1, shade(col, 1.3))
            if bw > 2:
                c.put(x + 1, y0 + 8 - h + 3, PAL["gold"])    # gilt title band
            x += bw + r.choice([0, 0, 1])
    return c


reg("bookshelf2", bookshelf(2)); reg("bookshelf1", bookshelf(1))


def fireplace():
    """Brick fireplace with a wooden mantel, andirons and a fire."""
    c = Canvas(T * 2, T)
    c.rect(0, 0, T * 2, T, PAL["brick2"])
    for y in range(0, T, 4):
        for x in range((y // 4 % 2) * 4, T * 2, 8):
            c.hline(x, y + 3, 7, PAL["brick3"]); c.put(x + 7, y, PAL["brick3"])
    c.rect(6, 0, 52, 5, W2); c.hline(6, 0, 52, W0); c.hline(6, 4, 52, W3)    # mantel shelf
    c.rect(8, 5, 4, 24, W2); c.rect(52, 5, 4, 24, W2)                          # mantel legs
    c.rect(12, 6, 40, 24, (20, 16, 16)); c.rect(14, 8, 36, 20, (10, 8, 8))
    c.rect(18, 24, 28, 4, W3); c.rect(20, 22, 22, 3, W2); c.rect(24, 20, 16, 3, shade(W3, 0.8))
    for (x, y, col) in [(24, 18, PAL["flame"]), (30, 12, PAL["flame"]), (36, 16, PAL["flame"]), (28, 16, PAL["candle"]),
                        (33, 20, PAL["candle"]), (26, 14, PAL["red1"]), (38, 20, PAL["red1"]), (31, 9, PAL["red1"]),
                        (22, 21, PAL["red1"]), (40, 18, PAL["flame"]), (32, 14, (255, 236, 180))]:
        c.put(x, y, col); c.put(x, y + 1, col); c.put(x + 1, y + 1, col)
    for x in (17, 45):   # andirons
        c.vline(x, 18, 10, (40, 36, 40)); c.put(x, 17, PAL["gold"]); c.put(x, 16, PAL["gold1"])
    c.rect(6, 30, 52, 2, PAL["stone"]); c.hline(6, 30, 52, PAL["lstone"])   # hearth
    c.put(20, 2, PAL["gold"]); c.rect(30, 1, 6, 3, (40, 36, 40)); c.put(33, 2, PAL["gold1"])   # candlestick and clock on the mantel
    return c


reg("fireplace", fireplace())


def bed():
    """Four-poster with a patterned coverlet."""
    c = Canvas(T, T * 2)
    for x in (2, 28):
        c.vline(x, 0, 62, W2); c.vline(x + 1, 0, 62, W3); c.put(x, 0, W1); c.put(x + 1, 0, W1)
    c.rect(4, 2, 24, 6, W2); c.hline(4, 2, 24, W1); c.rect(5, 3, 22, 3, W1)
    c.rect(4, 8, 24, 50, PAL["cream"])
    c.rect(6, 10, 20, 8, (246, 240, 226)); c.hline(6, 17, 20, PAL["lstone"]); c.hline(6, 10, 20, (255, 255, 250))
    cov = (80, 60, 110)
    c.rect(4, 20, 24, 36, cov)
    for y in range(22, 56, 6):
        for x in range(6, 26, 6):
            c.put(x, y, shade(cov, 1.5)); c.put(x + 1, y + 1, shade(cov, 1.5)); c.put(x + 3, y + 3, PAL["gold"])
    c.hline(4, 20, 24, PAL["cream"]); c.hline(4, 21, 24, (246, 240, 226))
    c.rect(3, 56, 26, 4, W2); c.hline(3, 59, 26, W3)
    return c


reg("bed", bed())


def cot():
    c = Canvas(T, T * 2)
    c.rect(3, 2, 26, 58, W2); c.outline(3, 2, 26, 58, W3)
    c.rect(5, 4, 22, 54, (156, 140, 108))
    for y in range(8, 56, 4):
        c.hline(5, y, 22, (134, 120, 92))
    for x in range(7, 27, 5):
        c.put(x, 30, (196, 180, 140))   # straw poking out
    c.rect(6, 6, 20, 8, (176, 166, 146)); c.rect(5, 34, 22, 20, (90, 96, 80)); c.hline(5, 34, 22, (120, 126, 110))
    return c


reg("cot", cot())


def bar_counter(w=3):
    """Tavern bar: polished counter with a brass rail, tankards, a cask on a stand."""
    c = Canvas(T * w, T)
    c.rect(0, 6, T * w, 10, shade(W0, 1.05)); c.hline(0, 6, T * w, shade(W0, 1.3)); c.hline(0, 7, T * w, shade(W0, 1.15))
    c.rect(0, 16, T * w, 14, W2)
    for x in range(0, T * w, 10):
        c.outline(x + 2, 18, 6, 10, W3); c.rect(x + 3, 19, 4, 8, shade(W2, 1.1))
    c.hline(0, 16, T * w, W3); c.hline(0, 29, T * w, PAL["gold"]); c.hline(0, 30, T * w, W3)
    # tankards
    for x in (5, 14):
        c.rect(x, 9, 5, 6, (176, 170, 160)); c.hline(x, 9, 5, (210, 206, 196)); c.put(x + 5, 11, (176, 170, 160)); c.put(x + 5, 12, (176, 170, 160))
    # bottles
    for x, col in ((T + 6, (40, 70, 50)), (T + 11, (90, 60, 30)), (T + 16, (40, 70, 50))):
        c.rect(x, 9, 3, 7, col); c.rect(x + 1, 7, 1, 2, col); c.put(x, 10, shade(col, 1.5))
    if w > 2:
        x = T * 2 + 6
        c.rect(x, 7, 14, 9, W1); c.rect(x - 1, 9, 16, 2, PAL["slate"]); c.rect(x - 1, 13, 16, 2, PAL["slate"]); c.put(x + 13, 11, PAL["gold"])
        c.rect(x + 2, 4, 10, 3, W2)
    return c


reg("bar3", bar_counter(3))


def cage_shelf():
    """Bottle shelves behind a lattice — the caged bar of a period taproom. Goes on the wall row."""
    c = Canvas(T * 2, T)
    c.rect(0, 0, T * 2, T, shade(W2, 0.8))
    for y in (10, 21):
        c.hline(1, y, T * 2 - 2, W3); c.hline(1, y + 1, T * 2 - 2, W1)
    r = random.Random(4)
    for y0 in (2, 12):
        x = 3
        while x < T * 2 - 4:
            col = r.choice([(40, 70, 50), (90, 60, 30), (60, 80, 100), (150, 140, 120)])
            c.rect(x, y0 + 2, 3, 7, col); c.put(x + 1, y0, col); c.put(x + 1, y0 + 1, col); c.put(x, y0 + 3, shade(col, 1.5))
            x += r.choice([4, 5, 6])
    for x in (4, 16, 28, 40, 52):
        c.rect(x, 24, 5, 6, (176, 170, 160)); c.put(x + 5, 26, (176, 170, 160))
    # lattice
    for k in range(-T, T * 2, 8):
        for i in range(T):
            xx = k + i
            if 0 <= xx < T * 2:
                c.put(xx, i, PAL["wood3"]); c.put(T * 2 - 1 - xx, i, PAL["wood3"])
    c.outline(0, 0, T * 2, T, W3)
    return c


reg("cage_shelf", cage_shelf())


def barrel():
    c = Canvas(T, T)
    for yy in range(4, 30):
        t = abs(yy - 17) / 13
        w = 18 - int(3 * t * t)
        for xx in range(16 - w // 2, 16 + w // 2):
            col = W1
            if xx < 16 - w // 2 + 3:
                col = W2
            if xx > 16 + w // 2 - 4:
                col = W3
            if (xx - 16) % 4 == 0:
                col = shade(col, 0.82)
            c.put(xx, yy, col)
    c.rect(7, 9, 18, 2, PAL["slate"]); c.rect(7, 23, 18, 2, PAL["slate"]); c.hline(7, 9, 18, PAL["stone"]); c.hline(7, 23, 18, PAL["stone"])
    c.rect(9, 2, 14, 3, W2); c.hline(9, 2, 14, W1)
    return c


reg("barrel", barrel())


def crate():
    c = Canvas(T, T)
    c.rect(4, 8, 24, 20, W1); c.outline(4, 8, 24, 20, W3); c.hline(5, 9, 22, W0)
    c.hline(4, 18, 24, W3); c.vline(16, 8, 20, W3)
    for x in (6, 14, 18, 26):
        c.put(x, 10, W3); c.put(x, 26, W3)
    c.hline(8, 13, 6, (60, 50, 40)); c.hline(8, 15, 4, (60, 50, 40))    # stencil
    return c


reg("crate", crate())


def jail_bars(door=False):
    c = Canvas(T, T)
    for x in range(2, T, 6):
        c.vline(x, 0, T, (70, 68, 76)); c.vline(x + 1, 0, T, (110, 108, 116)); c.put(x + 1, 3, (150, 148, 156))
    for y in (6, 22):
        c.rect(0, y, T, 3, (70, 68, 76)); c.hline(0, y, T, (110, 108, 116))
        for x in range(3, T, 6):
            c.put(x, y + 1, (40, 38, 42))   # rivets
    if door:
        c.rect(11, 12, 8, 8, (60, 58, 64)); c.outline(11, 12, 8, 8, (30, 28, 32)); c.put(14, 15, PAL["gold"]); c.put(14, 16, (30, 28, 32))
    return c


reg("bars", jail_bars()); reg("bars_door", jail_bars(door=True))


def printing_press():
    """Columbian iron hand press: pillars, eagle counterweight, platen, bed and lever."""
    c = Canvas(T * 2, T * 2)
    iron, iron_l, iron_d = (52, 50, 58), (96, 94, 104), (28, 26, 32)
    c.rect(6, 44, 52, 16, W2); c.hline(6, 44, 52, W1); c.rect(8, 60, 48, 3, W3)          # base
    c.rect(16, 6, 6, 40, iron); c.rect(42, 6, 6, 40, iron)                                 # pillars
    c.vline(17, 6, 40, iron_l); c.vline(43, 6, 40, iron_l)
    c.rect(14, 4, 36, 5, iron); c.hline(14, 4, 36, iron_l)                                 # cap
    c.rect(24, 12, 16, 10, iron); c.hline(24, 12, 16, iron_l)                              # head/platen block
    c.rect(22, 30, 20, 4, iron_d); c.rect(20, 34, 24, 3, iron)                             # platen
    c.rect(12, 38, 40, 6, iron); c.hline(12, 38, 40, iron_l)                               # bed
    c.rect(26, 40, 14, 3, (236, 230, 216)); c.hline(27, 41, 12, (80, 76, 70))              # sheet on the tympan
    # eagle counterweight
    c.rect(29, 0, 6, 3, PAL["gold"]); c.put(28, 1, PAL["gold"]); c.put(35, 1, PAL["gold"]); c.put(31, 3, PAL["gold1"]); c.put(32, 3, PAL["gold1"]); c.put(27, 0, PAL["gold"]); c.put(36, 0, PAL["gold"])
    c.put(32, -1, PAL["gold1"])
    # lever
    c.rect(48, 24, 14, 3, iron); c.rect(60, 22, 3, 7, W1)
    c.rect(2, 26, 10, 3, iron)
    # rollers and ink slab
    c.rect(4, 46, 20, 6, (30, 28, 34)); c.hline(4, 46, 20, (70, 68, 80)); c.rect(40, 48, 14, 6, (24, 22, 26))
    return c


reg("press", printing_press())


def type_case():
    """Printer's type case on a slanted stand."""
    c = Canvas(T, T)
    c.rect(2, 6, 28, 16, W2); c.outline(2, 6, 28, 16, W3)
    for y in range(8, 21, 4):
        for x in range(4, 29, 4):
            c.rect(x, y, 3, 3, (40, 36, 40)); c.put(x + 1, y + 1, (140, 136, 130))
    leg(c, 4, 22, 8); leg(c, 26, 22, 8)
    return c


reg("type_case", type_case())


def hat_rack():
    c = Canvas(T, T)
    c.vline(15, 4, 26, W2); c.vline(16, 4, 26, W1); c.rect(10, 28, 12, 3, W3)
    for (x, y) in [(5, 6), (21, 6), (7, 15), (19, 15)]:
        c.rect(x, y + 3, 7, 2, (30, 26, 28)); c.rect(x + 1, y - 2, 5, 5, (48, 42, 46)); c.hline(x + 1, y - 2, 5, (84, 76, 82)); c.hline(x + 1, y + 1, 5, (110, 80, 50))
    return c


reg("hat_rack", hat_rack())


def hat_counter():
    """Glass-topped counter with hats on stands and a stack of hat boxes."""
    c = Canvas(T * 2, T)
    c.rect(0, 12, T * 2, 8, (150, 176, 196)); c.hline(0, 12, T * 2, (210, 226, 236)); c.hline(0, 19, T * 2, (90, 120, 150))
    c.rect(0, 20, T * 2, 10, W2); c.hline(0, 20, T * 2, W3)
    for x in range(2, T * 2, 12):
        c.outline(x, 22, 8, 6, W3)
    for i, (col, tall) in enumerate([((30, 26, 28), 6), ((100, 70, 40), 5), ((30, 26, 28), 7), ((60, 60, 70), 5)]):
        x = 4 + i * 15
        c.rect(x, 9, 10, 2, col); c.rect(x + 2, 9 - tall, 6, tall, shade(col, 1.3) if col != (30, 26, 28) else (48, 42, 46))
        c.hline(x + 2, 9 - tall, 6, shade(col, 1.6) if col != (30, 26, 28) else (84, 76, 82)); c.hline(x + 2, 7, 6, (110, 80, 50))
        c.vline(x + 5, 11, 1, W3)
    c.rect(50, 2, 12, 7, (200, 180, 140)); c.outline(50, 2, 12, 7, (150, 120, 80)); c.hline(52, 5, 8, (150, 40, 40))   # hat box
    return c


reg("hat_counter", hat_counter())


def strongbox():
    c = Canvas(T, T)
    c.rect(5, 8, 22, 20, (44, 50, 62)); c.outline(5, 8, 22, 20, (24, 26, 32)); c.hline(6, 9, 20, (70, 78, 92))
    for y in (11, 18, 25):
        c.rect(5, y, 22, 2, (90, 92, 100)); c.hline(5, y, 22, (130, 132, 140))
    c.rect(13, 14, 6, 6, PAL["gold"]); c.put(15, 16, (24, 26, 32)); c.put(16, 17, (24, 26, 32))
    c.rect(5, 28, 22, 2, (24, 26, 32))
    return c


reg("strongbox", strongbox())


def framed_portrait(src=None, colour=(120, 40, 40), oval=True):
    """Gilt-framed portrait on the wall; src = a portrait PNG to miniaturise."""
    c = Canvas(T, T)
    c.rect(5, 1, 22, 26, PAL["gold"]); c.outline(5, 1, 22, 26, shade(PAL["gold"], 0.6)); c.hline(6, 2, 20, PAL["gold1"])
    if src and os.path.exists(src):
        im = Image.open(src).convert("RGB").resize((16, 20), Image.LANCZOS).quantize(12).convert("RGB")
        px = im.load()
        for y in range(20):
            for x in range(16):
                if oval and ((x - 7.5) / 8) ** 2 + ((y - 9.5) / 10) ** 2 > 1:
                    c.put(8 + x, 4 + y, PAL["gold"])
                else:
                    c.put(8 + x, 4 + y, px[x, y])
    else:
        c.rect(8, 4, 16, 20, colour)
        c.rect(13, 9, 6, 6, PAL["parchment"]); c.rect(12, 15, 8, 8, (30, 26, 28)); c.rect(14, 6, 4, 3, (60, 44, 30))
    c.put(16, 27, PAL["gold"])   # hanging point shadow
    return c


reg("portrait_red", framed_portrait(colour=(120, 40, 40)))
reg("portrait_blue", framed_portrait(colour=(40, 50, 90)))
reg("portrait_jackson", framed_portrait(src=os.path.join(ASSETS, "portraits", "jackson.png")))
reg("portrait_washington", framed_portrait(src=os.path.join(ASSETS, "portraits", "key.png"), colour=(60, 50, 44)))


def wall_map():
    """A period map on the wall — derived from an 1830s atlas sheet if one was fetched."""
    c = Canvas(T * 2, T)
    c.rect(1, 1, 62, 28, PAL["parchment"]); c.outline(1, 1, 62, 28, W3)
    refs = sorted(glob.glob(os.path.join(REF, "post_office", "*American_atlas*")))
    if refs:
        im = Image.open(refs[0]).convert("RGB")
        im.thumbnail((58, 24), Image.LANCZOS)
        im = im.quantize(10).convert("RGB")
        px = im.load()
        for y in range(im.height):
            for x in range(im.width):
                c.put(3 + x, 3 + y, px[x, y])
    else:
        c.rect(30, 4, 30, 22, PAL["glass1"])
    c.rect(0, 29, 64, 2, W2)
    return c


reg("wall_map", wall_map())


def candle_table():
    """Candlestand with a brass candlestick — a light source."""
    c = Canvas(T, T)
    c.rect(9, 15, 14, 3, W1); c.hline(9, 15, 14, W0); turned_leg(c, 16, 18, 10); c.rect(11, 27, 10, 2, W3)
    c.rect(14, 10, 4, 5, PAL["gold"]); c.hline(13, 14, 6, PAL["gold1"]); c.rect(15, 5, 2, 5, PAL["cream"])
    c.put(15, 4, PAL["flame"]); c.put(16, 3, PAL["candle"]); c.put(15, 3, PAL["candle"])
    return c


reg("candle_table", candle_table())


def argand_lamp():
    """Argand oil lamp on a stand: brass reservoir, glass chimney, warm flame."""
    c = Canvas(T, T)
    c.rect(11, 22, 10, 2, PAL["gold"]); c.rect(14, 16, 4, 6, PAL["gold"]); c.hline(11, 22, 10, PAL["gold1"])
    c.rect(12, 12, 8, 5, PAL["gold"]); c.hline(12, 12, 8, PAL["gold1"]); c.put(13, 13, PAL["gold1"])
    c.rect(13, 3, 6, 9, (226, 236, 240)); c.vline(13, 3, 9, (190, 210, 220)); c.vline(18, 3, 9, (150, 176, 196))
    c.put(15, 6, PAL["flame"]); c.put(16, 6, PAL["candle"]); c.put(15, 7, PAL["candle"]); c.put(16, 5, (255, 240, 200))
    c.rect(10, 24, 12, 8, W1); c.hline(10, 24, 12, W0); c.hline(10, 31, 12, W3)
    return c


reg("argand_lamp", argand_lamp())


def sconce():
    """Wall candle sconce with a reflector; goes on the wall row."""
    c = Canvas(T, T)
    c.rect(12, 6, 8, 12, (176, 170, 160)); c.hline(12, 6, 8, (210, 206, 196)); c.vline(12, 6, 12, (210, 206, 196))
    c.rect(13, 18, 6, 3, PAL["gold"]); c.rect(15, 12, 2, 6, PAL["cream"]); c.put(15, 11, PAL["flame"]); c.put(16, 10, PAL["candle"])
    return c


reg("sconce", sconce())


def stove():
    """Franklin stove: cast iron, open front, stovepipe up the wall."""
    c = Canvas(T, T)
    iron = (38, 36, 42)
    c.rect(13, 0, 6, 8, iron); c.vline(14, 0, 8, (70, 68, 76))
    c.rect(6, 8, 20, 20, iron); c.outline(6, 8, 20, 20, (24, 22, 26)); c.hline(7, 9, 18, (70, 68, 76))
    c.rect(4, 7, 24, 3, iron); c.hline(4, 7, 24, (90, 88, 96))
    c.rect(10, 14, 12, 8, (14, 12, 12)); c.rect(12, 17, 8, 4, PAL["flame"]); c.put(14, 16, PAL["candle"]); c.put(17, 18, (255, 240, 200))
    for x in (8, 22):
        c.vline(x, 28, 3, iron)
    c.rect(4, 30, 24, 2, (60, 56, 60))
    return c


reg("stove", stove())


def pigeonholes():
    c = Canvas(T * 2, T)
    c.rect(0, 0, T * 2, T, W2); c.outline(0, 0, T * 2, T, W3)
    r = random.Random(9)
    for row in range(3):
        for col in range(6):
            x, y = 2 + col * 10, 2 + row * 10
            c.rect(x, y, 9, 9, (40, 30, 24)); c.hline(x, y + 8, 9, W1); c.vline(x + 8, y, 9, W1)
            if r.random() < 0.65:
                n = r.choice([1, 2, 3])
                for k in range(n):
                    c.rect(x + 1 + k, y + 3 - k, 6, 5, (236, 228, 208)); c.hline(x + 2 + k, y + 5 - k, 3, (90, 80, 70))
            c.put(x + 4, y + 8, (200, 180, 140))   # label
    return c


reg("pigeonholes", pigeonholes())


def counter(w=2, grille=False):
    c = Canvas(T * w, T)
    c.rect(0, 10, T * w, 8, shade(W0, 1.05)); c.hline(0, 10, T * w, shade(W0, 1.3)); c.hline(0, 11, T * w, shade(W0, 1.15))
    c.rect(0, 18, T * w, 12, W2); c.hline(0, 18, T * w, W3); c.hline(0, 29, T * w, W3)
    for x in range(3, T * w, 12):
        c.outline(x, 20, 8, 8, W3); c.rect(x + 1, 21, 6, 6, shade(W2, 1.1))
    if grille:
        for x in range(2, T * w, 4):
            c.vline(x, 0, 10, PAL["gold"]); c.put(x, 0, PAL["gold1"])
        c.hline(0, 0, T * w, PAL["gold"]); c.hline(0, 5, T * w, PAL["gold"])
        c.rect(T * w // 2 - 6, 2, 12, 7, (40, 36, 40)); c.hline(T * w // 2 - 5, 5, 10, PAL["gold1"])   # teller's window
    else:
        c.rect(4, 4, 10, 6, (236, 228, 208)); c.hline(6, 6, 6, (90, 80, 70)); c.hline(6, 8, 4, (90, 80, 70))   # ledger
        c.rect(T * w - 12, 5, 5, 5, (30, 28, 34)); c.put(T * w - 10, 3, (236, 232, 220))                     # inkwell + quill
    return c


reg("counter2", counter(2)); reg("counter3", counter(3)); reg("counter_bank", counter(3, grille=True))


def wall_sign():
    c = Canvas(T, T)
    c.rect(2, 4, 28, 14, W2); c.outline(2, 4, 28, 14, W3); c.hline(3, 5, 26, W1)
    r = random.Random(11)
    x = 5
    while x < 27:
        lw = r.choice([2, 3])
        c.rect(x, 8, lw, 4, PAL["gold"]); x += lw + 1
    c.hline(8, 14, 16, PAL["gold"])
    return c


reg("wall_sign", wall_sign())


def notice_board():
    c = Canvas(T, T)
    c.rect(2, 2, 28, 24, W2); c.outline(2, 2, 28, 24, W3)
    r = random.Random(5)
    for (x, y, w, h, col) in [(4, 4, 10, 9, (236, 228, 208)), (16, 5, 12, 8, PAL["parchment"]), (6, 15, 9, 9, (246, 240, 226)), (18, 14, 9, 10, (236, 228, 208))]:
        c.rect(x, y, w, h, col); c.hline(x, y, w, (255, 255, 250))
        c.hline(x + 1, y + 2, w - 3, (40, 34, 30))
        for yy in range(y + 4, y + h - 1, 2):
            c.hline(x + 1, yy, w - 2 - r.randrange(0, 3), (120, 110, 100))
        c.put(x + w // 2, y, (150, 40, 40))   # pin
    return c


reg("notice_board", notice_board())


def pillar():
    """Fluted column, two tiles tall."""
    c = Canvas(T, T * 2)
    for y in range(4, 60):
        for x in range(8, 24):
            nx = (x - 16) / 8
            v = PAL["marble"] if abs(nx) < 0.55 else PAL["lstone"]
            if nx < -0.75:
                v = PAL["stone"]
            if (x - 8) % 4 == 0:
                v = shade(v, 0.86)   # flutes
            c.put(x, y, v)
    c.rect(6, 0, 20, 4, PAL["lstone"]); c.hline(6, 0, 20, PAL["marble"]); c.rect(7, 4, 18, 1, PAL["stone"])
    c.rect(6, 60, 20, 4, PAL["lstone"]); c.hline(6, 60, 20, PAL["marble"])
    return c


reg("pillar", pillar())


def sofa():
    """Empire scroll-arm sofa in green horsehair, gilt brass mounts."""
    c = Canvas(T * 2, T)
    g = (52, 82, 62)
    c.rect(4, 6, 56, 18, g); c.rect(6, 8, 52, 7, shade(g, 1.15)); c.hline(6, 8, 52, shade(g, 1.3))
    for x0 in (0, 58):   # scrolled arms
        c.rect(x0, 8, 6, 16, shade(g, 0.85)); c.rect(x0 + 1, 8, 4, 4, shade(g, 1.2)); c.put(x0 + 2, 10, shade(g, 0.7))
    c.rect(6, 16, 52, 8, shade(g, 1.05)); c.vline(32, 16, 8, shade(g, 0.8))
    c.rect(4, 24, 56, 3, W3); c.hline(4, 24, 56, W1)
    for x in (8, 56):
        c.put(x, 22, PAL["gold1"]); c.put(x, 26, PAL["gold"])
    c.rect(6, 27, 3, 4, W3); c.rect(55, 27, 3, 4, W3)   # sabre legs
    return c


reg("sofa", sofa())


def globe():
    c = Canvas(T, T)
    turned_leg(c, 16, 18, 10, W2); c.rect(10, 28, 12, 3, W3)
    for y in range(3, 20):
        for x in range(7, 25):
            dx, dy = (x - 15.5) / 9, (y - 11) / 8.5
            d = dx * dx + dy * dy
            if d <= 1:
                land = (x * 3 + y * 7) % 11 > 4
                col = (96, 128, 90) if land else (110, 150, 176)
                if d > 0.75:
                    col = shade(col, 0.72)
                if dx < -0.3 and dy < -0.2:
                    col = shade(col, 1.2)
                c.put(x, y, col)
    c.vline(6, 8, 8, PAL["gold"]); c.vline(25, 8, 8, PAL["gold"]); c.put(15, 2, PAL["gold"]); c.put(16, 20, PAL["gold"])   # meridian ring
    return c


reg("globe", globe())


def tall_clock():
    c = Canvas(T, T * 2)
    c.rect(9, 2, 14, 60, W2); c.outline(9, 2, 14, 60, W3); c.hline(10, 3, 12, W1)
    c.rect(11, 6, 10, 10, (236, 228, 208)); c.outline(11, 6, 10, 10, W3)
    c.put(16, 11, (30, 26, 28)); c.vline(16, 8, 3, (30, 26, 28)); c.hline(16, 11, 3, (30, 26, 28))
    c.rect(12, 20, 8, 30, (60, 44, 30)); c.rect(14, 24, 4, 4, PAL["gold"]); c.vline(16, 28, 20, PAL["gold"]); c.rect(13, 46, 6, 4, PAL["gold"])
    c.rect(8, 60, 16, 3, W3)
    return c


reg("tall_clock", tall_clock())


def coat_stand():
    c = Canvas(T, T)
    c.vline(15, 2, 26, W2); c.vline(16, 2, 26, W1); c.rect(10, 27, 12, 3, W3)
    c.rect(5, 6, 8, 3, (30, 26, 28)); c.rect(7, 2, 4, 4, (48, 42, 46))            # hat
    c.rect(18, 8, 8, 16, (60, 50, 70)); c.rect(19, 9, 6, 3, (90, 80, 100)); c.rect(20, 24, 4, 2, (60, 50, 70))   # cloak
    c.put(15, 4, PAL["gold"]); c.put(12, 6, PAL["gold"]); c.put(19, 6, PAL["gold"])
    return c


reg("coat_stand", coat_stand())


def spittoon():
    c = Canvas(T, T)
    c.rect(11, 20, 10, 8, PAL["gold"]); c.hline(11, 20, 10, PAL["gold1"]); c.rect(12, 17, 8, 3, shade(PAL["gold"], 0.8))
    c.rect(10, 17, 12, 2, PAL["gold1"]); c.rect(13, 18, 6, 1, (60, 50, 30))
    c.hline(11, 28, 10, shade(PAL["gold"], 0.6))
    return c


reg("spittoon", spittoon())


def washstand():
    c = Canvas(T, T)
    c.rect(6, 12, 20, 12, W1); c.hline(6, 12, 20, W0); c.rect(6, 24, 20, 2, W2)
    leg(c, 7, 26, 5); leg(c, 23, 26, 5)
    c.rect(10, 8, 12, 5, (236, 236, 232)); c.hline(10, 8, 12, (255, 255, 255)); c.rect(12, 9, 8, 2, (150, 176, 196))
    c.rect(20, 2, 4, 7, (236, 236, 232)); c.put(24, 4, (236, 236, 232)); c.hline(20, 2, 4, (255, 255, 255))   # jug
    return c


reg("washstand", washstand())


def paper_stack():
    c = Canvas(T, T)
    for k in range(5):
        c.rect(6 + (k % 2), 22 - k * 3, 20, 3, (236, 228, 208) if k % 2 else (226, 216, 196))
        c.hline(6 + (k % 2), 22 - k * 3, 20, (250, 246, 236))
    c.rect(10, 8, 12, 2, (200, 60, 60))   # ribbon
    return c


reg("paper_stack", paper_stack())


def mirror():
    c = Canvas(T, T)
    c.rect(7, 2, 18, 24, PAL["gold"]); c.outline(7, 2, 18, 24, shade(PAL["gold"], 0.6)); c.hline(8, 3, 16, PAL["gold1"])
    for y in range(4, 24):
        for x in range(9, 23):
            c.put(x, y, mix((200, 214, 220), (150, 170, 184), (y - 4) / 20) if (x + y) % 9 else (236, 240, 244))
    c.put(15, 0, PAL["gold"]); c.put(16, 1, PAL["gold"])   # eagle finial hint
    return c


reg("mirror", mirror())



def fireplace_big():
    """Chimney breast rising through the wall band, mantel, andirons, a proper fire. 3x2 tiles."""
    c = Canvas(T * 3, T * 2)
    c.rect(0, 0, T * 3, T * 2, PAL["brick2"])
    r = random.Random(2)
    for y in range(0, T * 2, 4):
        for x in range((y // 4 % 2) * 4, T * 3, 8):
            b = r.choice([PAL["brick2"], PAL["brick1"], PAL["brick3"]])
            c.rect(x, y, 7, 3, b); c.hline(x, y + 2, 7, shade(b, 0.8))
    c.speckle(20, 0, 56, 14, (60, 50, 50), 0.3, seed=4)                       # soot above the mantel
    c.rect(8, 24, 80, 6, W2); c.hline(8, 24, 80, W0); c.hline(8, 29, 80, W3)   # mantel shelf
    c.rect(10, 30, 6, 32, W2); c.rect(80, 30, 6, 32, W2)
    c.rect(16, 30, 64, 32, (18, 14, 14)); c.rect(20, 34, 56, 26, (8, 6, 6))
    c.rect(24, 50, 48, 6, W3); c.rect(28, 46, 40, 5, W2); c.rect(34, 42, 28, 4, shade(W3, 0.8))
    for (x, y, col) in [(30, 40, PAL["flame"]), (40, 30, PAL["flame"]), (50, 36, PAL["flame"]), (36, 36, PAL["candle"]), (46, 42, PAL["candle"]),
                        (34, 32, PAL["red1"]), (56, 40, PAL["red1"]), (42, 26, PAL["red1"]), (28, 44, PAL["red1"]), (60, 38, PAL["flame"]),
                        (44, 34, (255, 236, 180)), (38, 44, (255, 236, 180)), (52, 44, PAL["candle"])]:
        c.rect(x, y, 3, 3, col); c.put(x + 1, y - 1, col)
    for x in (24, 70):
        c.vline(x, 40, 16, (40, 36, 40)); c.put(x, 39, PAL["gold"]); c.put(x, 38, PAL["gold1"]); c.put(x + 1, 38, PAL["gold1"])
    c.rect(4, 61, 88, 3, PAL["stone"]); c.hline(4, 61, 88, PAL["lstone"])     # hearth
    c.rect(28, 18, 4, 6, PAL["gold"]); c.put(29, 16, PAL["cream"]); c.put(29, 15, PAL["flame"])    # candlestick
    c.rect(44, 14, 10, 10, (40, 36, 40)); c.rect(46, 16, 6, 6, (236, 228, 208)); c.put(48, 19, (30, 26, 28)); c.put(49, 18, (30, 26, 28))   # mantel clock
    c.rect(64, 18, 8, 6, (60, 80, 60)); c.put(66, 16, (150, 40, 40)); c.put(69, 15, (150, 40, 40))   # vase
    return c


reg("fireplace3", fireplace_big())


def bed_big():
    """Four-poster, 2x3 tiles: turned posts, tester, patterned coverlet, bolster."""
    c = Canvas(T * 2, T * 3)
    for x in (3, 58):
        for k in range(0, 90):
            w = 3 if k % 6 else 4
            c.rect(x, 2 + k, w, 1, W2 if k % 6 != 3 else shade(W2, 0.75))
        c.rect(x - 1, 0, 6, 3, W1)
    c.rect(6, 4, 52, 8, (60, 44, 70)); c.hline(6, 4, 52, (90, 70, 100)); c.hline(6, 11, 52, (40, 30, 48))   # tester valance
    for x in range(8, 58, 6):
        c.put(x, 10, PAL["gold"])
    c.rect(7, 12, 50, 78, PAL["cream"])
    c.rect(10, 16, 44, 14, (246, 240, 226)); c.hline(10, 16, 44, (255, 255, 250)); c.hline(10, 29, 44, PAL["lstone"])   # bolster
    cov = (80, 60, 110)
    c.rect(7, 34, 50, 52, cov); c.hline(7, 34, 50, PAL["cream"]); c.hline(7, 35, 50, (246, 240, 226))
    for y in range(40, 84, 8):
        for x in range(10, 54, 8):
            c.put(x, y, shade(cov, 1.5)); c.put(x + 1, y + 1, shade(cov, 1.5)); c.put(x - 1, y + 1, shade(cov, 1.5)); c.put(x, y + 2, shade(cov, 1.5)); c.put(x + 4, y + 4, PAL["gold"])
    c.rect(5, 86, 54, 6, W2); c.hline(5, 86, 54, W1); c.hline(5, 91, 54, W3)
    return c


reg("bed2", bed_big())


def bar4():
    c = Canvas(T * 4, T)
    c.blit(bar_counter(3), 0, 0)
    d = Canvas(T, T)
    d.rect(0, 6, T, 10, shade(W0, 1.05)); d.hline(0, 6, T, shade(W0, 1.3)); d.hline(0, 7, T, shade(W0, 1.15))
    d.rect(0, 16, T, 14, W2); d.outline(2, 18, 6, 10, W3); d.rect(3, 19, 4, 8, shade(W2, 1.1)); d.outline(12, 18, 6, 10, W3); d.rect(13, 19, 4, 8, shade(W2, 1.1)); d.outline(22, 18, 6, 10, W3); d.rect(23, 19, 4, 8, shade(W2, 1.1))
    d.hline(0, 16, T, W3); d.hline(0, 29, T, PAL["gold"]); d.hline(0, 30, T, W3)
    d.rect(6, 9, 5, 6, (176, 170, 160)); d.hline(6, 9, 5, (210, 206, 196)); d.put(11, 11, (176, 170, 160))
    d.rect(18, 8, 8, 6, (236, 228, 208)); d.hline(19, 10, 6, (90, 80, 70))   # the tally book
    c.blit(d, T * 3, 0)
    return c


reg("bar4", bar4())


def cage4():
    """Two-tile-high caged back bar for the wall band: bottle shelves behind a lattice."""
    c = Canvas(T * 4, T * 2)
    c.rect(0, 0, T * 4, T * 2, shade(W2, 0.8))
    r = random.Random(6)
    for y in (12, 26, 40, 54):
        c.hline(2, y, T * 4 - 4, W3); c.hline(2, y + 1, T * 4 - 4, W1)
        x = 4
        while x < T * 4 - 6:
            col = r.choice([(40, 70, 50), (90, 60, 30), (60, 80, 100), (150, 140, 120), (120, 40, 40)])
            h = r.choice([7, 8, 9])
            c.rect(x, y - h, 3, h, col); c.put(x + 1, y - h - 2, col); c.put(x + 1, y - h - 1, col); c.put(x, y - h + 2, shade(col, 1.5))
            x += r.choice([4, 5, 6, 7])
    for x in (6, 30, 54, 78, 102):
        c.rect(x, 56, 6, 6, (176, 170, 160)); c.put(x + 6, 58, (176, 170, 160))
    for k in range(-T * 2, T * 4, 10):
        for i in range(T * 2):
            xx = k + i
            if 0 <= xx < T * 4:
                c.put(xx, i, PAL["wood3"]); c.put(T * 4 - 1 - xx, i, PAL["wood3"])
    c.outline(0, 0, T * 4, T * 2, W3); c.hline(1, 1, T * 4 - 2, W1)
    c.rect(52, 22, 24, 20, (40, 30, 24)); c.outline(52, 22, 24, 20, W3)   # the serving hatch
    return c


reg("cage4", cage4())


def beam():
    """Ceiling beam for the cornice row of a taproom or cell."""
    c = Canvas(T, T)
    c.blit(tiles["wall_top"], 0, 0)
    c.rect(0, 12, T, 10, W3); c.hline(0, 12, T, W1); c.hline(0, 21, T, (30, 22, 18))
    for x in range(3, T, 9):
        c.put(x, 16, shade(W3, 0.7))
    return c


reg("beam", beam())

# ---------------------------------------------------------------------------
# packing
# ---------------------------------------------------------------------------
def pack():
    names = sorted(tiles, key=lambda n: (-tiles[n].h, -tiles[n].w, n))
    atlas_w = 512
    x = y = 0
    row_h = 0
    index = {}
    placed = []
    for n in names:
        t = tiles[n]
        if x + t.w > atlas_w:
            x = 0
            y += row_h
            row_h = 0
        index[n] = {"x": x, "y": y, "w": t.w, "h": t.h}
        placed.append((n, x, y))
        x += t.w
        row_h = max(row_h, t.h)
    atlas = Canvas(atlas_w, y + row_h)
    for n, px, py in placed:
        atlas.blit(tiles[n], px, py)
    atlas.save("tiles/atlas.png")
    with open(os.path.join(ASSETS, "tiles", "atlas.json"), "w") as f:
        json.dump(index, f)
    return atlas


if __name__ == "__main__":
    a = pack()
    print(len(tiles), "tiles ->", a.w, "x", a.h)
    print(preview(a, "atlas.png", scale=2))
