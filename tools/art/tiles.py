"""32x32 world tiles + furniture objects, packed into an atlas with a JSON index.

Ground and walls are procedural textures with hand-placed detail; furniture
and props are hand-drawn grids on top of shaded primitives.
"""
import json
import os
import random
from common import Canvas, PAL, shade, mix, preview, ASSETS

T = 32
tiles = {}   # name -> Canvas (any multiple of 32 in size)


def reg(name, c):
    tiles[name] = c
    return c


# ---------------------------------------------------------------------------
# ground
# ---------------------------------------------------------------------------
def mud(seed, ruts=False, puddle=False):
    c = Canvas(T, T)
    c.noise_fill(0, 0, T, T, [PAL["mud1"], PAL["mud1"], PAL["mud0"], PAL["mud2"]], seed=seed,
                 weights=[5, 4, 2, 2])
    r = random.Random(seed)
    for _ in range(10):  # clods
        x, y = r.randrange(T), r.randrange(T)
        c.put(x, y, PAL["mud2"]); c.put(x + 1, y, PAL["mud2"]); c.put(x, y + 1, PAL["mud3"])
    for _ in range(6):
        x, y = r.randrange(T), r.randrange(T)
        c.put(x, y, PAL["sand"])
    if ruts:
        for y in range(T):
            wob = (y // 6) % 2
            c.put(9 + wob, y, PAL["mud3"]); c.put(10 + wob, y, PAL["mud2"])
            c.put(21 - wob, y, PAL["mud3"]); c.put(22 - wob, y, PAL["mud2"])
    if puddle:
        for y in range(10, 22):
            w = 10 - abs(y - 16)
            for x in range(16 - w, 16 + w):
                c.put(x, y, PAL["slate"] if (x + y) % 5 else PAL["glass"])
        c.hline(9, 22, 14, PAL["mud3"])
    return c


for i in range(4):
    reg(f"mud{i}", mud(100 + i))
reg("mud_ruts", mud(200, ruts=True))
reg("mud_puddle", mud(300, puddle=True))


def grass(seed, snowy=0.0):
    c = Canvas(T, T)
    c.noise_fill(0, 0, T, T, [PAL["grass1"], PAL["grass1"], PAL["grass0"], PAL["grass2"], PAL["mud1"]],
                 seed=seed, weights=[5, 3, 2, 2, 1])
    r = random.Random(seed)
    for _ in range(14):  # dead tufts
        x, y = r.randrange(T), r.randrange(1, T)
        c.put(x, y, PAL["sand"]); c.put(x, y - 1, PAL["grass0"])
    if snowy:
        for _ in range(int(60 * snowy)):
            x, y = r.randrange(T), r.randrange(T)
            c.put(x, y, PAL["snow"]); c.put(x + 1, y, PAL["snow1"])
    return c


for i in range(3):
    reg(f"grass{i}", grass(400 + i))
reg("grass_snow0", grass(500, snowy=0.5))
reg("grass_snow1", grass(501, snowy=0.9))


def cobble(seed):
    c = Canvas(T, T)
    c.rect(0, 0, T, T, PAL["shadow"])
    r = random.Random(seed)
    for row in range(4):
        off = 4 if row % 2 else 0
        for col in range(-1, 5):
            x0 = col * 8 + off + 1
            y0 = row * 8 + 1
            base = r.choice([PAL["stone"], PAL["stone"], PAL["lstone"], PAL["slate"]])
            for y in range(y0, y0 + 6):
                for x in range(x0, x0 + 6):
                    col_ = base
                    if y == y0 or x == x0:
                        col_ = shade(base, 1.15)
                    if y == y0 + 5 or x == x0 + 5:
                        col_ = shade(base, 0.8)
                    c.put(x, y, col_)
    return c


for i in range(2):
    reg(f"cobble{i}", cobble(600 + i))


def flag(seed, light=False):
    """Marble paving for Capitol grounds."""
    c = Canvas(T, T)
    base = PAL["marble"] if light else PAL["lstone"]
    c.noise_fill(0, 0, T, T, [base, shade(base, 0.96), shade(base, 1.03)], seed=seed)
    c.hline(0, 15, T, shade(base, 0.8)); c.vline(15, 0, 16, shade(base, 0.8))
    c.vline(7, 16, 16, shade(base, 0.8))
    c.hline(0, 0, T, shade(base, 1.08)); c.vline(0, 0, T, shade(base, 1.08))
    return c


reg("flag0", flag(700)); reg("flag1", flag(701, light=True))

# ---------------------------------------------------------------------------
# interiors
# ---------------------------------------------------------------------------
def planks(seed, tone=PAL["wood1"], vertical=False):
    c = Canvas(T, T)
    r = random.Random(seed)
    for i in range(4):
        base = mix(tone, r.choice([PAL["wood0"], PAL["wood2"], tone]), 0.3)
        for k in range(8):
            for j in range(T):
                v = base
                if k == 0:
                    v = shade(base, 0.7)
                elif k == 7:
                    v = shade(base, 1.1)
                if r.random() < 0.04:
                    v = shade(base, 0.85)
                if vertical:
                    c.put(i * 8 + k, j, v)
                else:
                    c.put(j, i * 8 + k, v)
        # plank end seam
        sx = r.randrange(4, 28)
        for k in range(1, 7):
            if vertical:
                c.put(i * 8 + k, sx, shade(base, 0.7))
            else:
                c.put(sx, i * 8 + k, shade(base, 0.7))
    return c


for i in range(3):
    reg(f"floor_wood{i}", planks(800 + i))
reg("floor_wood_dark", planks(810, tone=PAL["wood2"]))
reg("floor_wood_pale", planks(811, tone=(190, 150, 100)))


def stone_floor(seed, tone=PAL["stone"]):
    c = Canvas(T, T)
    r = random.Random(seed)
    for row in range(2):
        for col in range(2):
            base = mix(tone, r.choice([PAL["lstone"], PAL["slate"], tone]), 0.35)
            x0, y0 = col * 16, row * 16
            for y in range(y0, y0 + 16):
                for x in range(x0, x0 + 16):
                    v = base
                    if x == x0 or y == y0:
                        v = shade(base, 0.72)
                    elif x == x0 + 1 or y == y0 + 1:
                        v = shade(base, 1.1)
                    c.put(x, y, v)
            for _ in range(4):
                c.put(x0 + r.randrange(2, 16), y0 + r.randrange(2, 16), shade(base, 0.9))
    return c


reg("floor_stone0", stone_floor(900)); reg("floor_stone1", stone_floor(901))
reg("floor_marble", stone_floor(902, tone=PAL["marble"]))


def rug(colour=PAL["red"], border=PAL["gold"], part="c"):
    """Rug tiles: part in {tl,t,tr,l,c,r,bl,b,br}."""
    c = Canvas(T, T)
    c.noise_fill(0, 0, T, T, [colour, shade(colour, 0.92), shade(colour, 1.06)], seed=7)
    # pattern
    for y in range(0, T, 8):
        for x in range(0, T, 8):
            c.put(x + 3, y + 3, shade(colour, 1.3)); c.put(x + 4, y + 4, shade(colour, 1.3))
            c.put(x + 4, y + 3, shade(colour, 0.8)); c.put(x + 3, y + 4, shade(colour, 0.8))
    if "t" in part:
        c.hline(0, 0, T, shade(border, 0.7)); c.hline(0, 1, T, border); c.hline(0, 2, T, border)
        for x in range(0, T, 4): c.put(x, 1, shade(border, 0.7))
    if "b" in part:
        c.hline(0, T - 1, T, shade(border, 0.7)); c.hline(0, T - 2, T, border); c.hline(0, T - 3, T, border)
        for x in range(0, T, 4): c.put(x, T - 2, shade(border, 0.7))
    if "l" in part:
        c.vline(0, 0, T, shade(border, 0.7)); c.vline(1, 0, T, border); c.vline(2, 0, T, border)
        for y in range(0, T, 4): c.put(1, y, shade(border, 0.7))
    if "r" in part:
        c.vline(T - 1, 0, T, shade(border, 0.7)); c.vline(T - 2, 0, T, border); c.vline(T - 3, 0, T, border)
        for y in range(0, T, 4): c.put(T - 2, y, shade(border, 0.7))
    return c


for part in ["tl", "t", "tr", "l", "c", "r", "bl", "b", "br"]:
    reg(f"rug_red_{part}", rug(part=part))
    reg(f"rug_green_{part}", rug(colour=PAL["green2"], border=PAL["cream"], part=part))
    reg(f"rug_blue_{part}", rug(colour=PAL["blue2"], border=PAL["gold"], part=part))


def wall(kind="plaster", seed=0, base=None):
    """Interior wall seen from the front (top-down games show walls as a band)."""
    c = Canvas(T, T)
    r = random.Random(seed)
    if kind == "plaster":
        base = base or PAL["cream"]
        c.noise_fill(0, 0, T, T, [base, shade(base, 0.97), shade(base, 1.02)], seed=seed)
        # picture rail + wainscot
        c.hline(0, 4, T, shade(base, 0.8))
        c.rect(0, 20, T, 12, PAL["wood2"])
        c.hline(0, 20, T, PAL["wood0"]); c.hline(0, 21, T, PAL["wood3"])
        for x in range(0, T, 8):
            c.vline(x, 22, 10, PAL["wood3"])
            c.rect(x + 2, 24, 4, 6, PAL["wood1"])
        c.hline(0, 31, T, PAL["wood3"])
    elif kind == "brick":
        c.rect(0, 0, T, T, PAL["mortar"])
        for row in range(8):
            off = 4 if row % 2 else 0
            for col in range(-1, 5):
                x0 = col * 8 + off
                b = r.choice([PAL["brick1"], PAL["brick1"], PAL["brick2"], PAL["brick0"]])
                c.rect(x0, row * 4, 7, 3, b)
                c.hline(x0, row * 4 + 2, 7, shade(b, 0.8))
    elif kind == "stone":
        c.rect(0, 0, T, T, PAL["shadow"])
        for row in range(4):
            off = 6 if row % 2 else 0
            for col in range(-1, 4):
                x0 = col * 12 + off
                b = r.choice([PAL["stone"], PAL["slate"], PAL["stone"]])
                c.rect(x0 + 1, row * 8 + 1, 10, 6, b)
                c.hline(x0 + 1, row * 8 + 1, 10, shade(b, 1.15))
                c.hline(x0 + 1, row * 8 + 6, 10, shade(b, 0.75))
    elif kind == "log":
        for row in range(4):
            b = mix(PAL["wood1"], PAL["wood0"], (row % 2) * 0.3)
            c.rect(0, row * 8, T, 8, b)
            c.hline(0, row * 8, T, shade(b, 1.2)); c.hline(0, row * 8 + 7, T, PAL["wood3"])
            c.hline(0, row * 8 + 6, T, shade(b, 0.7))
            for x in range(r.randrange(0, 8), T, 11):
                c.put(x, row * 8 + 3, shade(b, 0.8))
    elif kind == "panel":
        base = base or PAL["wood1"]
        c.rect(0, 0, T, T, base)
        c.outline(2, 2, 28, 28, PAL["wood3"]); c.outline(3, 3, 26, 26, PAL["wood0"])
        c.rect(6, 6, 20, 20, shade(base, 1.08))
    elif kind == "paper":
        base = base or (196, 176, 140)
        c.noise_fill(0, 0, T, T, [base, shade(base, 0.96)], seed=seed)
        for y in range(2, T, 8):
            for x in range(2, T, 8):
                c.put(x, y, PAL["green2"]); c.put(x + 1, y, PAL["green1"])
                c.put(x + 4, y + 4, PAL["red"])
        c.rect(0, 20, T, 12, PAL["wood2"]); c.hline(0, 20, T, PAL["wood0"]); c.hline(0, 31, T, PAL["wood3"])
    return c


reg("wall_plaster", wall("plaster", 1))
reg("wall_plaster_b", wall("plaster", 2, base=(212, 206, 190)))
reg("wall_brick", wall("brick", 3))
reg("wall_stone", wall("stone", 4))
reg("wall_log", wall("log", 5))
reg("wall_panel", wall("panel", 6))
reg("wall_paper", wall("paper", 8))
reg("wall_marble", wall("plaster", 9, base=PAL["marble"]))


def wall_top(base=PAL["wood3"]):
    """The dark band above walls (ceiling edge)."""
    c = Canvas(T, T)
    c.rect(0, 0, T, T, PAL["ink"])
    c.hline(0, T - 2, T, base); c.hline(0, T - 1, T, shade(base, 1.2))
    return c


reg("wall_top", wall_top())


def window_in_wall(wallname, night=False):
    c = Canvas(T, T)
    c.blit(tiles[wallname], 0, 0)
    c.rect(6, 2, 20, 18, PAL["wood3"])
    glass = PAL["blue3"] if night else PAL["glass1"]
    c.rect(8, 4, 16, 14, glass)
    for y in range(4, 18):
        for x in range(8, 24):
            if (x + y) % 7 == 0:
                c.put(x, y, shade(glass, 1.2))
    c.vline(15, 4, 14, PAL["wood2"]); c.vline(16, 4, 14, PAL["wood3"])
    c.hline(8, 10, 16, PAL["wood2"]); c.hline(8, 11, 16, PAL["wood3"])
    c.rect(5, 19, 22, 2, PAL["wood1"])
    return c


for wn in ["wall_plaster", "wall_plaster_b", "wall_paper", "wall_panel", "wall_log", "wall_marble", "wall_brick"]:
    reg(wn + "_win", window_in_wall(wn))
reg("wall_stone_win", window_in_wall("wall_stone"))


def door_in_wall(wallname):
    c = Canvas(T, T)
    c.blit(tiles[wallname], 0, 0)
    c.rect(5, 0, 22, T, PAL["wood3"])
    c.rect(7, 0, 18, T, PAL["wood2"])
    c.rect(9, 3, 6, 10, PAL["wood1"]); c.rect(17, 3, 6, 10, PAL["wood1"])
    c.rect(9, 16, 6, 13, PAL["wood1"]); c.rect(17, 16, 6, 13, PAL["wood1"])
    c.put(15, 18, PAL["gold"]); c.put(15, 19, PAL["gold1"])
    return c


for wn in ["wall_plaster", "wall_plaster_b", "wall_paper", "wall_panel", "wall_log", "wall_marble", "wall_stone", "wall_brick"]:
    reg(wn + "_door", door_in_wall(wn))


def exit_mat():
    """Floor tile marking a way out (drawn over floor)."""
    c = Canvas(T, T)
    c.rect(2, 26, 28, 6, PAL["wood3"])
    c.rect(3, 27, 26, 4, (150, 120, 80))
    for x in range(4, 28, 3):
        c.put(x, 28, PAL["wood2"])
    return c


reg("exit_mat", exit_mat())

# ---------------------------------------------------------------------------
# furniture & props (may be larger than one tile)
# ---------------------------------------------------------------------------
def desk(w=2, papers=True, ink=True):
    c = Canvas(T * w, T)
    c.rect(0, 6, T * w, 16, PAL["wood1"])
    c.hline(0, 6, T * w, PAL["wood0"]); c.hline(0, 7, T * w, shade(PAL["wood0"], 1.1))
    c.rect(0, 22, T * w, 6, PAL["wood2"])
    c.hline(0, 22, T * w, PAL["wood3"])
    for k in range(w):
        c.rect(k * T + 3, 23, 12, 4, PAL["wood1"]); c.put(k * T + 9, 25, PAL["gold"])
        c.rect(k * T + 17, 23, 12, 4, PAL["wood1"]); c.put(k * T + 23, 25, PAL["gold"])
    c.rect(1, 28, 3, 4, PAL["wood3"]); c.rect(T * w - 4, 28, 3, 4, PAL["wood3"])
    if papers:
        c.rect(4, 9, 10, 8, PAL["cream"]); c.rect(5, 10, 9, 8, PAL["white"])
        for y in range(11, 17, 2):
            c.hline(6, y, 6, PAL["slate"])
    if ink:
        c.rect(T * w - 10, 10, 5, 6, PAL["ink"]); c.hline(T * w - 10, 10, 5, PAL["slate"])
        c.put(T * w - 8, 8, PAL["white"]); c.put(T * w - 7, 7, PAL["white"]); c.put(T * w - 6, 6, PAL["lstone"])
    return c


reg("desk2", desk(2)); reg("desk3", desk(3)); reg("desk1", desk(1, papers=False, ink=False))


def table(w=2):
    c = Canvas(T * w, T)
    c.rect(1, 8, T * w - 2, 14, PAL["wood0"])
    c.hline(1, 8, T * w - 2, shade(PAL["wood0"], 1.15))
    c.rect(1, 20, T * w - 2, 3, PAL["wood2"])
    for x in (2, T * w - 5):
        c.rect(x, 23, 3, 9, PAL["wood3"])
    for k in range(w):
        for x in range(k * T + 4, k * T + 30, 5):
            c.put(x, 12, shade(PAL["wood0"], 0.85))
    return c


reg("table2", table(2)); reg("table1", table(1))


def chair(facing="down"):
    c = Canvas(T, T)
    if facing == "down":
        c.rect(9, 4, 14, 12, PAL["wood2"]); c.rect(11, 6, 10, 8, PAL["wood1"])
        c.vline(13, 6, 8, PAL["wood2"]); c.vline(18, 6, 8, PAL["wood2"])
        c.rect(8, 16, 16, 8, PAL["wood1"]); c.hline(8, 16, 16, PAL["wood0"])
        c.rect(8, 24, 2, 6, PAL["wood3"]); c.rect(22, 24, 2, 6, PAL["wood3"])
    else:  # up (back toward viewer)
        c.rect(8, 8, 16, 8, PAL["wood1"])
        c.rect(8, 14, 16, 12, PAL["wood2"]); c.rect(10, 16, 12, 8, PAL["wood1"])
        c.vline(13, 16, 8, PAL["wood2"]); c.vline(18, 16, 8, PAL["wood2"])
        c.rect(8, 26, 2, 4, PAL["wood3"]); c.rect(22, 26, 2, 4, PAL["wood3"])
    return c


reg("chair_down", chair("down")); reg("chair_up", chair("up"))


def armchair():
    c = Canvas(T, T)
    c.rect(4, 4, 24, 20, PAL["red"]); c.rect(6, 6, 20, 10, shade(PAL["red"], 1.15))
    c.rect(2, 12, 5, 14, shade(PAL["red"], 0.85)); c.rect(25, 12, 5, 14, shade(PAL["red"], 0.85))
    c.rect(7, 16, 18, 8, shade(PAL["red"], 1.05))
    c.rect(4, 26, 24, 3, PAL["wood3"])
    for x in range(8, 26, 5):
        c.put(x, 9, PAL["gold"])
    return c


reg("armchair", armchair())


def bookshelf(w=2):
    c = Canvas(T * w, T)
    c.rect(0, 0, T * w, T, PAL["wood2"])
    c.outline(0, 0, T * w, T, PAL["wood3"])
    r = random.Random(w * 31)
    for shelf in range(3):
        y0 = 3 + shelf * 10
        c.hline(1, y0 + 8, T * w - 2, PAL["wood3"]); c.hline(1, y0 + 9, T * w - 2, PAL["wood1"])
        x = 2
        while x < T * w - 3:
            bw = r.choice([2, 3, 3, 4])
            col = r.choice([PAL["red"], PAL["blue2"], PAL["green2"], PAL["mud2"], PAL["parchment"], PAL["gold"], PAL["brick2"]])
            h = r.choice([6, 7, 8])
            c.rect(x, y0 + 8 - h, bw, h, col)
            c.put(x, y0 + 8 - h + 1, shade(col, 1.3))
            x += bw + r.choice([0, 0, 1])
    return c


reg("bookshelf2", bookshelf(2)); reg("bookshelf1", bookshelf(1))


def fireplace():
    c = Canvas(T * 2, T)
    c.rect(0, 0, T * 2, T, PAL["brick2"])
    for y in range(0, T, 4):
        for x in range((y // 4 % 2) * 4, T * 2, 8):
            c.hline(x, y + 3, 7, PAL["brick3"]); c.put(x + 7, y, PAL["brick3"])
    c.rect(8, 0, 48, 4, PAL["stone"]); c.hline(8, 0, 48, PAL["lstone"])
    c.rect(12, 6, 40, 24, PAL["ink"])
    c.rect(14, 8, 36, 20, PAL["black"])
    # logs + fire
    c.rect(18, 24, 28, 4, PAL["wood3"]); c.rect(20, 22, 22, 3, PAL["wood2"])
    for (x, y, col) in [(24, 20, PAL["flame"]), (30, 14, PAL["flame"]), (36, 18, PAL["flame"]), (28, 18, PAL["candle"]),
                        (33, 22, PAL["candle"]), (26, 16, PAL["red1"]), (38, 22, PAL["red1"]), (31, 10, PAL["red1"]),
                        (22, 23, PAL["red1"]), (40, 20, PAL["flame"])]:
        c.put(x, y, col); c.put(x, y + 1, col); c.put(x + 1, y + 1, col)
    c.rect(8, 30, 48, 2, PAL["stone"])
    return c


reg("fireplace", fireplace())


def bed():
    c = Canvas(T, T * 2)
    c.rect(2, 0, 28, 6, PAL["wood2"]); c.hline(2, 0, 28, PAL["wood1"])
    c.rect(3, 6, 26, 52, PAL["cream"])
    c.rect(5, 8, 22, 8, PAL["white"]); c.hline(5, 15, 22, PAL["lstone"])
    c.rect(3, 18, 26, 40, PAL["blue2"])
    for y in range(20, 56, 6):
        c.hline(3, y, 26, PAL["blue1"])
    c.hline(3, 18, 26, PAL["cream"]); c.hline(3, 19, 26, PAL["white"])
    c.rect(2, 58, 28, 4, PAL["wood2"]); c.hline(2, 61, 28, PAL["wood3"])
    return c


reg("bed", bed())


def cot():
    c = Canvas(T, T * 2)
    c.rect(4, 2, 24, 58, PAL["wood2"])
    c.rect(6, 4, 20, 54, (150, 140, 120))
    for y in range(8, 56, 5):
        c.hline(6, y, 20, (130, 120, 100))
    c.rect(7, 6, 18, 8, (176, 166, 146))
    return c


reg("cot", cot())


def bar_counter(w=3):
    c = Canvas(T * w, T)
    c.rect(0, 4, T * w, 12, PAL["wood0"]); c.hline(0, 4, T * w, shade(PAL["wood0"], 1.2))
    c.rect(0, 16, T * w, 14, PAL["wood2"])
    for x in range(0, T * w, 8):
        c.vline(x, 16, 14, PAL["wood3"])
    c.hline(0, 16, T * w, PAL["wood3"]); c.hline(0, 30, T * w, PAL["wood3"])
    # tankards + bottle
    c.rect(6, 7, 4, 6, PAL["stone"]); c.put(10, 9, PAL["stone"])
    c.rect(T * w - 12, 6, 3, 8, PAL["green2"]); c.put(T * w - 11, 4, PAL["green2"])
    if w > 2:
        c.rect(T + 10, 8, 5, 5, PAL["gold"]); c.hline(T + 10, 8, 5, PAL["gold1"])
    return c


reg("bar3", bar_counter(3))


def barrel():
    c = Canvas(T, T)
    c.rect(8, 4, 16, 24, PAL["wood1"])
    c.vline(8, 6, 20, PAL["wood2"]); c.vline(23, 6, 20, PAL["wood2"])
    c.rect(10, 2, 12, 2, PAL["wood2"])
    c.rect(7, 8, 18, 2, PAL["slate"]); c.rect(7, 22, 18, 2, PAL["slate"])
    c.hline(7, 8, 18, PAL["stone"]); c.hline(7, 22, 18, PAL["stone"])
    for x in range(10, 22, 3):
        c.vline(x, 10, 12, PAL["wood2"])
    c.rect(10, 28, 12, 2, PAL["wood3"])
    return c


reg("barrel", barrel())


def crate():
    c = Canvas(T, T)
    c.rect(4, 8, 24, 20, PAL["wood1"])
    c.outline(4, 8, 24, 20, PAL["wood3"])
    c.hline(4, 18, 24, PAL["wood3"]); c.vline(16, 8, 20, PAL["wood3"])
    c.hline(5, 9, 22, PAL["wood0"])
    return c


reg("crate", crate())


def jail_bars(w=1):
    c = Canvas(T * w, T)
    for x in range(2, T * w, 6):
        c.vline(x, 0, T, PAL["slate"]); c.vline(x + 1, 0, T, PAL["stone"])
    c.rect(0, 6, T * w, 2, PAL["slate"]); c.rect(0, 22, T * w, 2, PAL["slate"])
    return c


reg("bars", jail_bars())


def bars_door():
    c = jail_bars()
    c.rect(12, 12, 4, 6, PAL["gold"]); c.put(13, 14, PAL["ink"])
    return c


reg("bars_door", bars_door())


def printing_press():
    c = Canvas(T * 2, T * 2)
    c.rect(8, 40, 48, 20, PAL["wood2"]); c.hline(8, 40, 48, PAL["wood1"])
    c.rect(20, 4, 24, 40, PAL["slate"]); c.rect(22, 6, 20, 36, PAL["stone"])
    c.rect(16, 2, 32, 6, PAL["ink"])
    c.rect(28, 8, 8, 20, PAL["slate"])
    c.rect(24, 28, 16, 8, PAL["ink"])
    c.rect(10, 34, 44, 6, PAL["wood1"])
    c.rect(2, 44, 12, 4, PAL["slate"])  # lever
    c.rect(44, 44, 16, 10, PAL["cream"]); c.rect(46, 46, 12, 6, PAL["white"])
    c.hline(48, 48, 8, PAL["slate"]); c.hline(48, 50, 8, PAL["slate"])
    return c


reg("press", printing_press())


def hat_rack():
    c = Canvas(T, T)
    c.vline(15, 4, 26, PAL["wood2"]); c.vline(16, 4, 26, PAL["wood1"])
    c.rect(10, 28, 12, 3, PAL["wood3"])
    for (x, y) in [(6, 8), (22, 8), (8, 16), (20, 16)]:
        c.rect(x, y, 6, 4, PAL["ink"]); c.rect(x + 1, y - 3, 4, 3, PAL["shadow"])
        c.hline(x + 1, y - 3, 4, PAL["slate"])
    return c


reg("hat_rack", hat_rack())


def hat_counter():
    c = Canvas(T * 2, T)
    c.rect(0, 10, T * 2, 12, PAL["wood1"]); c.hline(0, 10, T * 2, PAL["wood0"])
    c.rect(0, 22, T * 2, 8, PAL["wood2"]); c.hline(0, 29, T * 2, PAL["wood3"])
    for i, col in enumerate([PAL["ink"], PAL["mud2"], PAL["ink"], PAL["slate"]]):
        x = 4 + i * 15
        c.rect(x, 6, 10, 4, col); c.rect(x + 2, 1, 6, 5, shade(col, 1.3) if col != PAL["ink"] else PAL["shadow"])
        c.hline(x + 2, 1, 6, shade(col, 1.6) if col != PAL["ink"] else PAL["slate"])
    return c


reg("hat_counter", hat_counter())


def strongbox():
    c = Canvas(T, T)
    c.rect(6, 8, 20, 20, PAL["blue3"]); c.outline(6, 8, 20, 20, PAL["ink"])
    c.hline(7, 9, 18, PAL["blue1"])
    c.rect(8, 12, 16, 2, PAL["slate"]); c.rect(8, 22, 16, 2, PAL["slate"])
    c.rect(14, 16, 4, 4, PAL["gold"]); c.put(15, 17, PAL["ink"])
    c.rect(6, 28, 20, 2, PAL["ink"])
    return c


reg("strongbox", strongbox())


def wall_portrait(colour=PAL["red"]):
    c = Canvas(T, T)
    c.rect(6, 2, 20, 24, PAL["gold"]); c.outline(6, 2, 20, 24, shade(PAL["gold"], 0.7))
    c.rect(9, 5, 14, 18, colour)
    c.rect(13, 9, 6, 6, PAL["parchment"]); c.rect(12, 15, 8, 8, PAL["ink"])
    c.rect(14, 6, 4, 3, PAL["mud3"])
    return c


reg("portrait_red", wall_portrait()); reg("portrait_blue", wall_portrait(PAL["blue2"]))


def wall_map():
    c = Canvas(T * 2, T)
    c.rect(2, 2, 60, 26, PAL["parchment"]); c.outline(2, 2, 60, 26, PAL["wood3"])
    r = random.Random(3)
    # a rough coastline + rivers
    for y in range(4, 27):
        x = 30 + int(8 * (((y - 4) / 23) ** 2)) + r.randrange(-1, 2)
        c.rect(x, y, 62 - x, 1, PAL["glass1"])
    for i in range(6):
        x, y = r.randrange(6, 28), r.randrange(6, 24)
        c.put(x, y, PAL["ink"])
    c.hline(6, 8, 16, PAL["mud1"]); c.vline(14, 8, 10, PAL["mud1"])
    return c


reg("wall_map", wall_map())


def candle_table():
    c = Canvas(T, T)
    c.rect(10, 14, 12, 8, PAL["wood1"]); c.hline(10, 14, 12, PAL["wood0"])
    c.rect(11, 22, 2, 8, PAL["wood3"]); c.rect(19, 22, 2, 8, PAL["wood3"])
    c.rect(14, 8, 4, 6, PAL["cream"]); c.put(15, 6, PAL["candle"]); c.put(15, 5, PAL["flame"]); c.put(16, 6, PAL["candle"])
    return c


reg("candle_table", candle_table())


def stove():
    c = Canvas(T, T)
    c.rect(8, 6, 16, 22, PAL["ink"]); c.outline(8, 6, 16, 22, PAL["shadow"])
    c.rect(14, 0, 4, 6, PAL["ink"])
    c.rect(11, 12, 10, 6, PAL["shadow"]); c.rect(13, 14, 6, 3, PAL["flame"]); c.put(15, 15, PAL["candle"])
    c.rect(6, 28, 20, 2, PAL["shadow"])
    return c


reg("stove", stove())


def pigeonholes():
    """Post office sorting rack."""
    c = Canvas(T * 2, T)
    c.rect(0, 0, T * 2, T, PAL["wood2"])
    r = random.Random(9)
    for row in range(3):
        for col in range(6):
            x, y = 2 + col * 10, 2 + row * 10
            c.rect(x, y, 9, 9, PAL["wood3"])
            if r.random() < 0.6:
                c.rect(x + 1, y + 3, 7, 5, PAL["cream"]); c.hline(x + 2, y + 5, 4, PAL["slate"])
    return c


reg("pigeonholes", pigeonholes())


def counter(w=2):
    c = Canvas(T * w, T)
    c.rect(0, 8, T * w, 10, PAL["wood0"]); c.hline(0, 8, T * w, shade(PAL["wood0"], 1.2))
    c.rect(0, 18, T * w, 12, PAL["wood2"])
    c.hline(0, 18, T * w, PAL["wood3"]); c.hline(0, 29, T * w, PAL["wood3"])
    for x in range(4, T * w, 12):
        c.outline(x, 20, 8, 8, PAL["wood3"])
    return c


reg("counter2", counter(2)); reg("counter3", counter(3))


def wall_sign(text_colour=PAL["gold"]):
    c = Canvas(T, T)
    c.rect(2, 4, 28, 14, PAL["wood2"]); c.outline(2, 4, 28, 14, PAL["wood3"])
    c.hline(5, 9, 22, text_colour); c.hline(7, 12, 18, text_colour)
    return c


reg("wall_sign", wall_sign())


def notice_board():
    c = Canvas(T, T)
    c.rect(2, 2, 28, 24, PAL["wood2"]); c.outline(2, 2, 28, 24, PAL["wood3"])
    for (x, y, w, h, col) in [(4, 4, 10, 9, PAL["cream"]), (16, 5, 12, 8, PAL["parchment"]), (6, 15, 9, 9, PAL["white"]), (18, 14, 9, 10, PAL["cream"])]:
        c.rect(x, y, w, h, col)
        for yy in range(y + 2, y + h - 1, 2):
            c.hline(x + 1, yy, w - 3, PAL["slate"])
    return c


reg("notice_board", notice_board())


def pillar():
    c = Canvas(T, T * 2)
    for y in range(T * 2):
        for x in range(8, 24):
            nx = (x - 16) / 8
            v = PAL["marble"] if abs(nx) < 0.5 else PAL["lstone"]
            if nx < -0.7:
                v = PAL["stone"]
            c.put(x, y, v)
    c.rect(6, 0, 20, 3, PAL["lstone"]); c.rect(6, 61, 20, 3, PAL["lstone"])
    return c


reg("pillar", pillar())


def sofa():
    c = Canvas(T * 2, T)
    c.rect(2, 6, 60, 18, PAL["green2"]); c.rect(4, 8, 56, 8, PAL["green1"])
    c.rect(0, 12, 5, 12, shade(PAL["green2"], 0.8)); c.rect(59, 12, 5, 12, shade(PAL["green2"], 0.8))
    c.rect(5, 16, 54, 8, shade(PAL["green1"], 0.9))
    c.vline(32, 16, 8, PAL["green2"])
    c.rect(4, 24, 56, 3, PAL["wood3"])
    return c


reg("sofa", sofa())


def globe():
    c = Canvas(T, T)
    c.vline(15, 18, 12, PAL["wood2"]); c.rect(11, 28, 10, 2, PAL["wood3"])
    for y in range(4, 20):
        for x in range(8, 24):
            dx, dy = (x - 15.5) / 8, (y - 11.5) / 8
            if dx * dx + dy * dy <= 1:
                c.put(x, y, PAL["glass"] if (x * 3 + y * 7) % 11 > 3 else PAL["grass1"])
    c.put(10, 6, PAL["glass1"]); c.put(11, 5, PAL["glass1"])
    return c


reg("globe", globe())


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
    atlas_h = y + row_h
    atlas = Canvas(atlas_w, atlas_h)
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
