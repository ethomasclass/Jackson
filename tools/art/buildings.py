"""Exterior buildings and street props for 1835 Washington, drawn in a 3/4 view.

Each building: pitched roof seen from above-front (shingle courses foreshortened
toward the ridge), a shaded side wall on the right, a front wall in a period
material (Flemish-bond brick, clapboard with corner boards, ashlar with quoins),
6-over-6 sash windows set into reveals with lintels and sills, panelled doors
with fanlights, dormers on taller houses, a stone foundation course, chimneys,
and a cast shadow on the ground. Winter: snow on ridge, sills and eaves.

References: Gadsby's Tavern (Alexandria), Brown's Indian Queen Hotel lithograph,
George Cooke's 1833 views of the Capitol, Federal rowhouses of Georgetown.
"""
import json
import os
import random
from common import Canvas, PAL, shade, mix, preview, ASSETS

T = 32
objs = {}

SNOW = (232, 236, 244)
SNOW_SH = (196, 204, 220)


def reg(name, c, door=None, solid=None, lights=None, smoke=None):
    objs[name] = {"c": c, "door": door, "solid": solid, "lights": lights or [], "smoke": smoke or []}
    return c


# ---------------------------------------------------------------------------
# materials
# ---------------------------------------------------------------------------
def brick(c, x, y, w, h, seed=1, base=None, glazed=True):
    """Flemish bond: alternating stretcher (8) and header (4) in each course."""
    r = random.Random(seed)
    tones = [PAL["brick1"], PAL["brick1"], PAL["brick2"], PAL["brick0"], (150, 74, 54)]
    if base:
        tones = [mix(t, base, 0.5) for t in tones]
    mortar = (198, 184, 160)
    c.rect(x, y, w, h, mortar)
    course = 0
    yy = y
    while yy < y + h:
        xx = x - (r.randrange(0, 12) if course == 0 else 0) - (6 if course % 2 else 0)
        hdr = course % 2 == 1
        while xx < x + w:
            bw = 4 if hdr else 8
            col = r.choice(tones)
            if hdr and glazed and r.random() < 0.35:
                col = (72, 56, 60)          # glazed header, very Federal-period
            x0, x1 = max(x, xx), min(x + w, xx + bw - 1)
            if x1 > x0:
                for by in range(yy, min(y + h, yy + 3)):
                    for bx in range(x0, x1):
                        c.put(bx, by, col if by < yy + 2 else shade(col, 0.82))
            xx += bw
            hdr = not hdr
        yy += 4
        course += 1


def clapboard(c, x, y, w, h, base=PAL["white"], seed=2):
    r = random.Random(seed)
    for row in range(h):
        k = row % 5
        col = base if k < 2 else (shade(base, 0.96) if k == 2 else (shade(base, 0.88) if k == 3 else shade(base, 0.7)))
        for xx in range(x, x + w):
            v = col
            if r.random() < 0.015:
                v = shade(col, 0.93)
            c.put(xx, y + row, v)
    # corner boards
    c.rect(x, y, 3, h, shade(base, 1.02)); c.vline(x + 3, y, h, shade(base, 0.75))
    c.rect(x + w - 3, y, 3, h, shade(base, 0.94)); c.vline(x + w - 4, y, h, shade(base, 0.75))


def ashlar(c, x, y, w, h, base=PAL["marble"], seed=3, quoins=True):
    r = random.Random(seed)
    c.rect(x, y, w, h, shade(base, 0.82))
    row = 0
    yy = y
    while yy < y + h:
        off = 8 if row % 2 else 0
        xx = x - off
        while xx < x + w:
            b = r.choice([base, base, shade(base, 0.96), shade(base, 1.03)])
            x0, x1 = max(x, xx), min(x + w, xx + 15)
            for by in range(yy, min(y + h, yy + 7)):
                for bx in range(x0, x1):
                    c.put(bx, by, b if by < yy + 6 else shade(b, 0.85))
            xx += 16
        yy += 8
        row += 1
    if quoins:
        for i, qy in enumerate(range(y, y + h, 8)):
            qw = 10 if i % 2 else 6
            c.rect(x, qy, qw, 7, shade(base, 1.08)); c.hline(x, qy + 7, qw, shade(base, 0.7))
            c.rect(x + w - qw, qy, qw, 7, shade(base, 1.04)); c.hline(x + w - qw, qy + 7, qw, shade(base, 0.7))


def rubble(c, x, y, w, h, seed=4):
    r = random.Random(seed)
    c.rect(x, y, w, h, (74, 70, 72))
    for _ in range(w * h // 18):
        sx, sy = r.randrange(x, x + w), r.randrange(y, y + h)
        sw, sh = r.randrange(5, 12), r.randrange(4, 7)
        col = r.choice([PAL["stone"], PAL["slate"], (110, 106, 104), PAL["lstone"]])
        for yy in range(sy, min(y + h, sy + sh)):
            for xx in range(sx, min(x + w, sx + sw)):
                c.put(xx, yy, col if yy < sy + sh - 1 and xx < sx + sw - 1 else shade(col, 0.72))


def plaster(c, x, y, w, h, base=PAL["cream"], seed=5):
    c.noise_fill(x, y, w, h, [base, shade(base, 0.96), shade(base, 1.03)], seed=seed)
    c.speckle(x, y + h - 10, w, 10, shade(base, 0.85), 0.12, seed=seed)   # weather stain at the base


# ---------------------------------------------------------------------------
# elements
# ---------------------------------------------------------------------------
def sash_window(c, x, y, w=12, h=18, lit=False, shutters=None, lintel="stone", panes=(3, 2)):
    """6-over-6 sash in a reveal, with lintel, sill and optional panelled shutters."""
    if lintel == "stone":
        c.rect(x - 2, y - 3, w + 4, 3, PAL["lstone"]); c.hline(x - 2, y - 3, w + 4, PAL["marble"]); c.hline(x - 2, y - 1, w + 4, PAL["stone"])
    elif lintel == "brick":   # jack arch: slightly lighter angled bricks
        for i in range(w + 4):
            c.put(x - 2 + i, y - 3, (176, 96, 70) if i % 3 else (150, 74, 54))
            c.put(x - 2 + i, y - 2, (168, 90, 64) if (i + 1) % 3 else (150, 74, 54))
        c.hline(x - 2, y - 1, w + 4, (120, 60, 44))
    # reveal
    c.rect(x - 1, y - 1, w + 2, h + 2, (40, 32, 30))
    c.vline(x - 1, y - 1, h + 2, (26, 20, 20)); c.hline(x - 1, y - 1, w + 2, (26, 20, 20))
    for yy in range(h):
        for xx in range(w):
            t = yy / h
            if lit:
                col = mix((255, 214, 140), (196, 130, 60), t)
                if (xx + yy) % 7 == 0:
                    col = mix(col, (255, 240, 200), 0.5)
            else:
                col = mix((146, 176, 198), (74, 96, 122), t)
                if (xx - yy) % 9 in (0, 1) and xx > w // 2:
                    col = mix(col, (220, 230, 240), 0.35)
            c.put(x + xx, y + yy, col)
    bar = (222, 216, 200)
    for i in range(1, panes[0]):
        c.vline(x + i * w // panes[0], y, h, bar)
    c.hline(x, y + h // 2, w, shade(bar, 0.8)); c.hline(x, y + h // 2 - 1, w, bar)
    for i in range(1, panes[1] + 1):
        yy = y + i * (h // 2) // panes[1]
        if yy < y + h // 2 - 1:
            c.hline(x, yy, w, bar)
        yy2 = y + h // 2 + i * (h // 2) // panes[1]
        if yy2 < y + h:
            c.hline(x, yy2, w, bar)
    c.vline(x + w, y, h, (236, 230, 216)); c.hline(x, y + h, w + 1, (236, 230, 216))
    # sill with snow
    c.rect(x - 2, y + h + 1, w + 4, 2, PAL["lstone"]); c.hline(x - 2, y + h + 3, w + 4, PAL["shadow"])
    c.hline(x - 2, y + h + 1, w + 4, SNOW)
    if shutters:
        for sx in (x - 6, x + w + 2):
            c.rect(sx, y - 1, 4, h + 2, shutters)
            c.vline(sx, y - 1, h + 2, shade(shutters, 1.25)); c.vline(sx + 3, y - 1, h + 2, shade(shutters, 0.6))
            for yy in range(y + 2, y + h - 1, 2):
                c.hline(sx + 1, yy, 2, shade(shutters, 0.72))
            c.hline(sx, y + h // 2, 4, shade(shutters, 1.2))


def panel_door(c, x, y, w=14, h=24, colour=PAL["wood2"], fanlight=True, pilasters=True, steps=2, lamp=False):
    top = 10 if fanlight else 4
    if pilasters:
        c.rect(x - 4, y - top, w + 8, h + top, (222, 214, 196))
        c.vline(x - 4, y - top, h + top, (236, 230, 216))
        c.vline(x + w + 3, y - top, h + top, (170, 160, 140))
        c.rect(x - 6, y - top - 3, w + 12, 3, (226, 218, 200)); c.hline(x - 6, y - top - 1, w + 12, (150, 140, 120))
        c.hline(x - 6, y - top - 3, w + 12, SNOW)
    c.rect(x - 1, y - 1, w + 2, h + 1, (30, 24, 22))
    c.rect(x, y, w, h, colour)
    pw, ph = (w - 6) // 2, (h - 8) // 3
    for row in range(3):
        for col in range(2):
            px, py = x + 2 + col * (pw + 2), y + 2 + row * (ph + 2)
            c.rect(px, py, pw, ph, shade(colour, 0.8))
            c.rect(px + 1, py + 1, pw - 2, ph - 2, shade(colour, 1.12))
            c.hline(px + 1, py + 1, pw - 2, shade(colour, 1.3)); c.vline(px + 1, py + 1, ph - 2, shade(colour, 1.3))
    c.put(x + w - 4, y + h // 2, PAL["gold1"]); c.put(x + w - 4, y + h // 2 + 1, PAL["gold"])
    if fanlight:
        cx, base = x + w // 2, y - 1
        for yy in range(0, 8):
            half = int(((w + 2) / 2) * (1 - (yy / 8) ** 2) ** 0.5)
            for xx in range(cx - half, cx + half + 1):
                col = mix((156, 186, 206), (90, 120, 150), yy / 8)
                if abs(xx - cx) % 4 == 0 or yy == 7:
                    col = (222, 216, 200)
                c.put(xx, base - 8 + yy, col)
        c.hline(cx - (w + 2) // 2, base - 9, w + 3, (40, 32, 30))
    for s in range(steps):
        sw = w + 8 + s * 4
        sx = x + w // 2 - sw // 2
        c.rect(sx, y + h + s * 3, sw, 3, PAL["lstone"] if s % 2 == 0 else PAL["stone"])
        c.hline(sx, y + h + s * 3, sw, PAL["marble"])
        c.hline(sx, y + h + s * 3 + 2, sw, PAL["shadow"])
        c.vline(sx, y + h + s * 3, 3, PAL["marble"]); c.vline(sx + sw - 1, y + h + s * 3, 3, PAL["shadow"])
    c.rect(x + w + 8, y + h + 1, 4, 2, PAL["ink"])   # boot scraper
    if lamp:
        bx = x - 12
        c.vline(bx + 5, y - 6, 6, PAL["ink"]); c.hline(bx + 5, y - 6, 5, PAL["ink"])
        c.rect(bx, y - 4, 7, 8, PAL["ink"]); c.rect(bx + 1, y - 3, 5, 6, PAL["candle"]); c.put(bx + 3, y - 1, PAL["white"])
        c.rect(bx + 1, y - 6, 5, 2, (120, 90, 60))


def dormer(c, x, y, colour):
    """Small gabled dormer on a roof; x,y = top-left of a 14x17 box."""
    c.rect(x + 2, y + 6, 10, 10, (222, 214, 196))
    c.vline(x + 11, y + 6, 10, (170, 160, 140))
    for i in range(7):
        c.hline(x + 7 - i, y + i, i * 2 + 1, shade(colour, 0.6) if i < 6 else (222, 214, 196))
        c.put(x + 7 - i, y + i, SNOW); c.put(x + 7 + i, y + i, SNOW)
    c.rect(x + 4, y + 8, 6, 7, (86, 110, 136))
    c.vline(x + 7, y + 8, 7, (222, 216, 200)); c.hline(x + 4, y + 11, 6, (222, 216, 200))
    c.put(x + 5, y + 9, (170, 196, 214))
    c.rect(x + 1, y + 16, 12, 1, shade(colour, 0.5))


def pitched_roof(c, x, y, w, h, colour, seed=5, side=8):
    """Roof band from ridge (top) to eave (bottom), foreshortened toward the ridge,
    with the gable end drawn on the right side strip."""
    r = random.Random(seed)
    inset_top = 10
    for row in range(h):
        t = row / max(1, h - 1)
        left = x + int(inset_top * (1 - t))
        right = x + w - side - int((inset_top - 3) * (1 - t))
        course = (row * 10 // max(1, h)) % 3
        base = shade(colour, 0.78 + 0.32 * t)
        xx = left
        while xx < right:
            sw = r.choice([4, 5, 6])
            col = base
            if r.random() < 0.25:
                col = shade(base, r.choice([0.9, 1.08]))
            if course == 0:
                col = shade(col, 0.8)
            for px in range(xx, min(right, xx + sw - 1)):
                c.put(px, y + row, col)
            c.put(min(right, xx + sw - 1), y + row, shade(col, 0.7))
            xx += sw
    ridge_w = w - side - inset_top - (inset_top - 3)
    c.hline(x + inset_top, y, ridge_w, shade(colour, 0.6))
    for xx in range(x + inset_top - 1, x + inset_top + ridge_w + 1):
        c.put(xx, y, SNOW)
        if r.random() < 0.5:
            c.put(xx, y + 1, SNOW)
    c.hline(x - 2, y + h - 1, w - side + 4, (60, 48, 40))
    c.hline(x - 2, y + h, w - side + 4, (36, 28, 26))
    for xx in range(x - 2, x + w - side + 2):
        c.put(xx, y + h - 2, SNOW)
        if r.random() < 0.18:
            c.put(xx, y + h + 1, SNOW_SH)
            if r.random() < 0.4:
                c.put(xx, y + h + 2, SNOW_SH)
    for row in range(h):
        t = row / max(1, h - 1)
        gx0 = x + w - side - int((inset_top - 3) * (1 - t))
        for px in range(gx0, x + w - int(2 * (1 - t))):
            c.put(px, y + row, shade(colour, 0.45))


def side_wall(c, x, y, w, h, colour):
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            c.put(xx, yy, shade(colour, 0.5 if xx < x + w - 2 else 0.38))


def chimney(c, x, y, w=8, h=16, seed=9):
    brick(c, x, y, w, h, seed=seed, glazed=False)
    c.rect(x - 1, y - 2, w + 2, 2, PAL["slate"]); c.hline(x - 1, y - 2, w + 2, SNOW)
    c.rect(x + w - 2, y, 2, h, (90, 40, 32))
    c.put(x + w // 2 - 1, y - 4, PAL["stone"]); c.put(x + w // 2, y - 4, PAL["stone"])


def ground_shadow(c, x, y, w, h, side=8):
    for yy in range(y, y + h):
        t = (yy - y) / max(1, h)
        for xx in range(x, x + w):
            a = 0.55 * (1 - t) if xx < x + w - side else 0.75
            r, g, b, al = c.get(xx, yy)
            if al:
                c.put(xx, yy, (int(r * (1 - a)), int(g * (1 - a)), int(b * (1 - a) + 4)))


def hanging_sign(c, x, y, icon, board=PAL["wood2"]):
    c.hline(x, y, 12, PAL["ink"]); c.vline(x + 11, y, 3, PAL["ink"]); c.put(x + 1, y + 1, PAL["ink"])
    bx, by = x + 4, y + 3
    c.rect(bx, by, 16, 12, board); c.outline(bx, by, 16, 12, PAL["wood3"])
    c.hline(bx + 1, by + 1, 14, shade(board, 1.2))
    if icon == "hat":
        c.rect(bx + 4, by + 8, 8, 2, PAL["ink"]); c.rect(bx + 6, by + 3, 4, 5, PAL["ink"]); c.hline(bx + 6, by + 3, 4, PAL["shadow"])
    elif icon == "tankard":
        c.rect(bx + 5, by + 3, 5, 7, PAL["gold"]); c.put(bx + 10, by + 5, PAL["gold"]); c.put(bx + 10, by + 6, PAL["gold"]); c.hline(bx + 5, by + 3, 5, PAL["gold1"])
    elif icon == "letter":
        c.rect(bx + 4, by + 3, 8, 6, PAL["cream"]); c.put(bx + 7, by + 5, PAL["slate"]); c.put(bx + 8, by + 5, PAL["slate"]); c.hline(bx + 4, by + 3, 8, PAL["white"])
    elif icon == "press":
        c.rect(bx + 4, by + 3, 8, 7, PAL["ink"]); c.rect(bx + 5, by + 4, 6, 3, PAL["cream"]); c.hline(bx + 6, by + 5, 4, PAL["slate"])
    elif icon == "bank":
        c.rect(bx + 4, by + 4, 8, 5, PAL["gold"]); c.put(bx + 7, by + 6, PAL["ink"]); c.put(bx + 8, by + 6, PAL["ink"])
        c.hline(bx + 3, by + 3, 10, PAL["gold1"])
    elif icon == "key":
        c.rect(bx + 4, by + 5, 4, 4, PAL["gold"]); c.hline(bx + 8, by + 6, 5, PAL["gold"]); c.put(bx + 11, by + 7, PAL["gold"])


def painted_band(c, x, y, w, text_col=PAL["cream"], board=(90, 40, 34)):
    c.rect(x, y, w, 10, board); c.outline(x, y, w, 10, shade(board, 0.6))
    r = random.Random(w)
    xx = x + 5
    while xx < x + w - 6:
        lw = r.choice([2, 3, 3, 4])
        c.rect(xx, y + 3, lw, 4, text_col)
        if r.random() < 0.4:
            c.put(xx, y + 2, text_col)
        xx += lw + r.choice([1, 2, 2, 4])


# ---------------------------------------------------------------------------
# generic house / shop
# ---------------------------------------------------------------------------
def house(name, w_tiles=4, stories=2, wall="brick", roof_col=PAL["slate"], door_col=PAL["wood2"],
          shutter=None, sign=None, sign_band=None, lit=False, dormers=0, seed=0, fanlight=True, pilasters=True,
          wall_base=None, lamp=False, chimneys=2, door_pos=None, steps=2):
    side = 8
    W = T * w_tiles
    story_h = 30
    roof_h = 22 if stories < 3 else 26
    ground = 12
    wall_h = stories * story_h + 6
    H_body = roof_h + wall_h + ground
    H = ((H_body + 16 + 31) // 32) * 32
    c = Canvas(W, H)
    y_roof = H - ground - wall_h - roof_h
    y_wall = H - ground - wall_h
    bw = W - side
    lights, smoke = [], []
    if wall == "brick":
        brick(c, 0, y_wall, bw, wall_h, seed=seed + 1, base=wall_base); base_col = wall_base or PAL["brick1"]
    elif wall == "clap":
        clapboard(c, 0, y_wall, bw, wall_h, base=wall_base or PAL["white"], seed=seed + 1); base_col = wall_base or PAL["white"]
    elif wall == "stone":
        ashlar(c, 0, y_wall, bw, wall_h, base=wall_base or PAL["lstone"], seed=seed + 1); base_col = wall_base or PAL["lstone"]
    elif wall == "rubble":
        rubble(c, 0, y_wall, bw, wall_h, seed=seed + 1); base_col = PAL["stone"]
    else:
        plaster(c, 0, y_wall, bw, wall_h, base=wall_base or PAL["cream"], seed=seed + 1); base_col = wall_base or PAL["cream"]
    c.rect(0, H - ground - 5, bw, 5, PAL["stone"]); c.hline(0, H - ground - 5, bw, PAL["lstone"]); c.hline(0, H - ground - 1, bw, PAL["shadow"])
    c.rect(0, y_wall, bw, 3, shade(base_col, 0.5)); c.hline(0, y_wall + 3, bw, shade(base_col, 0.7))
    side_wall(c, bw, y_wall, side, wall_h, base_col)
    pitched_roof(c, 0, y_roof, W, roof_h, roof_col, seed=seed + 2, side=side)
    cxs = [W - side - 14] if chimneys == 1 else [6, W - side - 14]
    for i, cx in enumerate(cxs[:chimneys]):
        chimney(c, cx, y_roof - 12, seed=seed + 3 + i)
        smoke.append((cx + 4, y_roof - 16))
    for i in range(dormers):
        dx = 12 + i * ((bw - 26) // max(1, dormers - 1)) if dormers > 1 else bw // 2 - 7
        dormer(c, dx, y_roof + 2, roof_col)
    bays = w_tiles
    dx = door_pos if door_pos is not None else (bw // 2 - 7 if bays % 2 == 0 else 10 + (bays // 2) * 32)
    lintel = "brick" if wall == "brick" else "stone"
    for s in range(stories):
        wy = y_wall + 8 + s * story_h
        last = s == stories - 1
        for i in range(bays):
            wx = 10 + i * 32
            if last and abs(wx - dx) < 20:
                continue
            h = 18 if last else 16
            is_lit = lit and ((i + s) % 2 == 0 or last)
            sash_window(c, wx, wy, 12, h, lit=is_lit, shutters=shutter, lintel=lintel)
            if is_lit:
                lights.append((wx + 6, wy + h + 8, 36 if last else 30, "window"))
    dy = y_wall + 8 + (stories - 1) * story_h - 2
    panel_door(c, dx, dy, 14, 24, colour=door_col, fanlight=fanlight, pilasters=pilasters, steps=steps, lamp=lamp)
    if lamp:
        lights.append((dx - 9, dy, 46, "lamp"))
    if sign:
        hanging_sign(c, dx + 20 if dx + 40 < bw else dx - 24, dy - 10, sign)
    if sign_band:
        painted_band(c, 6, y_wall + 6 + (stories - 1) * story_h - 14, bw - 12, board=sign_band)
    c.noise_fill(0, H - ground, W, ground, [PAL["mud2"], PAL["mud3"], PAL["mud1"]], seed=seed)
    ground_shadow(c, 0, H - ground, W, ground, side=side)
    return reg(name, c, door=(dx - 5, H - ground, 24, ground), lights=lights, smoke=smoke)


# ---------------------------------------------------------------------------
# the Capitol (1835: Bulfinch's tall copper dome, east portico, two wings)
# ---------------------------------------------------------------------------
def capitol():
    W, H = T * 14, T * 8
    c = Canvas(W, H)
    ground = 40
    base = (214, 208, 196)
    for wx in (0, W - 140):
        ashlar(c, wx, 96, 140, H - ground - 96, base=base, seed=11 + wx, quoins=True)
        c.rect(wx, 92, 140, 4, PAL["marble"]); c.hline(wx, 96, 140, PAL["stone"])
        c.rect(wx, H - ground - 30, 140, 30, shade(base, 0.9))
        for yy in range(H - ground - 30, H - ground, 6):
            c.hline(wx, yy, 140, shade(base, 0.7))
        for i in range(3):
            sash_window(c, wx + 18 + i * 42, 108, 14, 22, lintel="stone", panes=(3, 3))
            sash_window(c, wx + 18 + i * 42, 148, 14, 18, lintel="stone")
        c.hline(wx, 92, 140, SNOW)
    ashlar(c, 130, 78, W - 260, H - ground - 78, base=base, seed=13, quoins=False)
    c.rect(130, 74, W - 260, 4, PAL["marble"]); c.hline(130, 74, W - 260, SNOW)
    cx = W // 2
    drum_y = 46
    c.rect(cx - 48, drum_y, 96, 30, shade(base, 0.95))
    for i in range(6):
        c.rect(cx - 42 + i * 15, drum_y + 6, 6, 16, (84, 104, 130)); c.vline(cx - 42 + i * 15 + 6, drum_y + 6, 16, PAL["marble"])
    c.hline(cx - 50, drum_y, 100, PAL["marble"]); c.hline(cx - 50, drum_y + 29, 100, PAL["stone"])
    copper = (112, 138, 116)
    for y in range(4, drum_y + 1):
        t = (y - 4) / (drum_y - 4)
        half = int(60 * (t ** 0.45)) if t < 0.9 else 60
        for x in range(cx - half, cx + half):
            nx = (x - cx) / 60
            col = copper
            if nx < -0.45:
                col = shade(copper, 0.78)
            elif -0.15 < nx < 0.15:
                col = shade(copper, 1.16)
            elif nx > 0.6:
                col = shade(copper, 0.88)
            if (y // 3) % 2 == 0 and abs(nx) > 0.2:
                col = shade(col, 0.94)
            c.put(x, y, col)
        if y < 12:
            c.put(cx - half, y, SNOW); c.put(cx + half - 1, y, SNOW)
    c.rect(cx - 5, 0, 10, 6, PAL["marble"]); c.rect(cx - 3, 0, 6, 2, PAL["lstone"]); c.hline(cx - 5, 0, 10, SNOW)
    c.hline(cx - 60, drum_y - 1, 120, SNOW)
    for y in range(58, 78):
        half = (y - 58) * 6
        c.hline(cx - half, y, half * 2, (230, 226, 214))
    c.hline(cx - 120, 78, 240, PAL["lstone"])
    c.rect(cx - 24, 66, 48, 10, (190, 184, 172))
    c.rect(cx - 118, 78, 236, 6, PAL["marble"]); c.hline(cx - 118, 83, 236, PAL["stone"])
    c.rect(cx - 110, 84, 220, 96, (176, 170, 160))
    for i in (0, 3):
        sash_window(c, cx - 96 + i * 62, 100, 14, 26, lintel="stone", panes=(3, 3))
    c.rect(cx - 16, 130, 32, 50, PAL["wood3"]); c.rect(cx - 14, 132, 28, 48, PAL["wood2"])
    c.rect(cx - 12, 134, 10, 20, shade(PAL["wood2"], 1.15)); c.rect(cx + 2, 134, 10, 20, shade(PAL["wood2"], 1.15))
    c.rect(cx - 12, 156, 10, 22, shade(PAL["wood2"], 1.15)); c.rect(cx + 2, 156, 10, 22, shade(PAL["wood2"], 1.15))
    for i in range(8):
        x = cx - 112 + i * 30
        for y in range(84, 182):
            c.put(x, y, PAL["stone"]); c.put(x + 1, y, PAL["lstone"]); c.put(x + 2, y, PAL["marble"])
            c.put(x + 3, y, PAL["white"]); c.put(x + 4, y, PAL["marble"]); c.put(x + 5, y, PAL["lstone"]); c.put(x + 6, y, PAL["stone"])
        c.rect(x - 2, 84, 11, 5, PAL["marble"]); c.rect(x - 1, 86, 9, 3, PAL["lstone"])
        c.rect(x - 2, 180, 11, 4, PAL["marble"])
    for s in range(9):
        y = 184 + s * 4
        w = 240 + s * 14
        c.rect(cx - w // 2, y, w, 3, PAL["marble"] if s % 2 == 0 else PAL["lstone"])
        c.hline(cx - w // 2, y + 3, w, PAL["stone"])
        if s % 3 == 0:
            c.hline(cx - w // 2, y, w, SNOW)
    c.rect(0, H - ground, W, ground, PAL["lstone"])
    for x in range(0, W, 16):
        c.vline(x, H - ground, ground, PAL["stone"])
    for y in range(H - ground, H, 10):
        c.hline(0, y, W, PAL["stone"])
    c.hline(0, H - ground, W, PAL["marble"])
    return reg("capitol", c, door=(cx - 20, H - ground, 40, ground), lights=[(cx, 150, 60, "window")], smoke=[])


# ---------------------------------------------------------------------------
# the President's House (north front with the 1830 portico)
# ---------------------------------------------------------------------------
def white_house():
    W, H = T * 10, T * 6
    c = Canvas(W, H)
    ground = 22
    base = (240, 236, 226)
    y_wall, wall_h = 44, H - ground - 44
    ashlar(c, 8, y_wall, W - 16, wall_h, base=base, seed=22, quoins=False)
    for x in range(10, W - 10, 5):
        c.rect(x, 34, 3, 8, PAL["marble"]); c.vline(x + 2, 34, 8, PAL["lstone"])
    c.rect(8, 32, W - 16, 3, PAL["marble"]); c.rect(8, 42, W - 16, 2, PAL["lstone"]); c.hline(8, 32, W - 16, SNOW)
    for y in range(22, 32):
        c.hline(8 + (32 - y), y, W - 16 - 2 * (32 - y), (120, 118, 112))
    c.hline(18, 22, W - 36, SNOW)
    chimney(c, 40, 8, seed=31); chimney(c, W - 48, 8, seed=32)
    for i in range(3):
        for wx in (24 + i * 30, W - 36 - i * 30):
            sash_window(c, wx, 56, 12, 18, shutters=(60, 80, 60), lintel="stone")
            sash_window(c, wx, 100, 12, 20, shutters=(60, 80, 60), lintel="stone")
    c.hline(8, 90, W - 16, PAL["lstone"]); c.hline(8, 91, W - 16, PAL["stone"])
    cx = W // 2
    c.rect(cx - 58, 46, 116, 8, PAL["marble"]); c.hline(cx - 58, 53, 116, PAL["stone"]); c.hline(cx - 58, 46, 116, SNOW)
    c.rect(cx - 52, 54, 104, 82, (214, 208, 196))
    panel_door(c, cx - 8, 104, 16, 26, colour=PAL["wood3"], fanlight=True, pilasters=True, steps=2, lamp=True)
    sash_window(c, cx - 36, 62, 12, 18, lintel="stone"); sash_window(c, cx + 24, 62, 12, 18, lintel="stone")
    for i in range(4):
        x = cx - 50 + i * 30
        for y in range(54, 138):
            c.put(x, y, PAL["lstone"]); c.put(x + 1, y, PAL["marble"]); c.put(x + 2, y, PAL["white"]); c.put(x + 3, y, PAL["white"])
            c.put(x + 4, y, PAL["marble"]); c.put(x + 5, y, PAL["stone"])
        c.rect(x - 2, 54, 10, 4, PAL["marble"]); c.put(x - 2, 56, PAL["lstone"]); c.put(x + 7, 56, PAL["lstone"])
        c.rect(x - 1, 136, 8, 3, PAL["marble"])
    c.noise_fill(0, H - ground, W, ground, [PAL["lstone"], PAL["stone"], (186, 180, 168)], seed=23)
    c.hline(0, H - ground, W, PAL["marble"])
    ground_shadow(c, 0, H - ground, W, ground, side=0)
    return reg("white_house", c, door=(cx - 14, H - ground, 28, ground), smoke=[(44, 4), (W - 44, 4)],
               lights=[(cx, 122, 50, "window"), (cx - 18, 108, 40, "lamp")])


# ---------------------------------------------------------------------------
# props
# ---------------------------------------------------------------------------
def tree_bare():
    c = Canvas(T * 2, T * 3)
    r = random.Random(5)
    for y in range(52, 94):
        w = 8 - (y - 52) // 14
        for x in range(32 - w // 2, 32 + w // 2 + 1):
            col = PAL["wood3"] if x < 32 else PAL["wood2"]
            if (x + y) % 5 == 0:
                col = shade(col, 0.8)
            c.put(x, y, col)
    c.rect(26, 92, 13, 3, PAL["wood3"]); c.hline(24, 94, 17, (40, 30, 24))
    branches = [(32, 54, -1.2, -1, 26), (33, 54, 1.1, -1, 24), (32, 50, 0.1, -1, 22), (30, 58, -0.8, -1, 16), (35, 60, 0.9, -1, 14), (31, 46, -0.5, -1, 12), (34, 46, 0.6, -1, 12)]
    for (x, y, dx, dy, n) in branches:
        fx, fy = float(x), float(y)
        for i in range(n):
            fx += dx + r.uniform(-0.6, 0.6); fy += dy
            px, py = int(fx), int(fy)
            thick = 2 if i < n // 2 else 1
            for k in range(thick):
                c.put(px + k, py, PAL["wood3"] if i < n * 0.7 else (70, 46, 30))
            if i % 4 == 3:
                sx, sy = fx, fy
                for j in range(5):
                    sx += r.choice([-1, 1]) * 0.9; sy -= 1
                    c.put(int(sx), int(sy), (70, 46, 30))
    for x in range(8, 56):
        for y in range(4, 52):
            if c.get(x, y)[3] and not c.get(x, y - 1)[3] and r.random() < 0.5:
                c.put(x, y - 1, SNOW)
    return reg("tree_bare", c, solid=(24, 80, 16, 14))


def lamp_post():
    c = Canvas(T, T * 2)
    c.rect(14, 14, 4, 46, (34, 30, 34)); c.vline(15, 14, 46, (70, 64, 70))
    c.rect(11, 58, 10, 5, (34, 30, 34)); c.hline(11, 58, 10, (70, 64, 70))
    c.rect(13, 50, 6, 2, (34, 30, 34))
    c.rect(9, 2, 14, 13, (34, 30, 34))
    c.rect(11, 4, 10, 9, (250, 214, 130)); c.rect(13, 6, 6, 5, (255, 240, 200)); c.put(15, 8, PAL["white"])
    c.vline(15, 4, 9, (60, 50, 40))
    c.rect(11, 0, 10, 2, (120, 90, 60)); c.hline(9, 2, 14, (150, 110, 70))
    c.hline(11, 0, 10, SNOW)
    return reg("lamp_post", c, solid=(11, 56, 10, 6), lights=[(16, 8, 76, "lamp")])


def fence(w_tiles=3):
    c = Canvas(T * w_tiles, T)
    for x in range(2, T * w_tiles, 7):
        c.rect(x, 6, 3, 22, PAL["white"]); c.put(x + 1, 4, PAL["white"]); c.vline(x + 2, 6, 22, PAL["lstone"]); c.put(x + 1, 4, SNOW)
    c.rect(0, 12, T * w_tiles, 2, PAL["white"]); c.rect(0, 22, T * w_tiles, 2, PAL["white"])
    c.hline(0, 13, T * w_tiles, PAL["lstone"]); c.hline(0, 23, T * w_tiles, PAL["lstone"])
    c.hline(0, 12, T * w_tiles, SNOW)
    return reg(f"fence{w_tiles}", c, solid=(0, 8, T * w_tiles, 20))


def hitching_post():
    c = Canvas(T, T)
    c.rect(8, 6, 3, 22, PAL["wood2"]); c.rect(21, 6, 3, 22, PAL["wood2"])
    c.rect(6, 9, 20, 3, PAL["wood1"]); c.hline(6, 9, 20, SNOW)
    c.put(9, 6, SNOW); c.put(22, 6, SNOW)
    return reg("hitching_post", c, solid=(6, 10, 20, 18))


def wagon():
    c = Canvas(T * 3, T * 2)
    c.rect(10, 16, 70, 24, PAL["wood1"]); c.outline(10, 16, 70, 24, PAL["wood3"])
    for x in range(14, 78, 8):
        c.vline(x, 18, 20, PAL["wood2"])
    c.rect(8, 40, 74, 4, PAL["wood3"]); c.hline(10, 16, 70, SNOW)
    for x in (20, 66):
        for y in range(36, 60):
            for xx in range(x - 10, x + 10):
                dx, dy = (xx - x) / 10, (y - 48) / 12
                d = dx * dx + dy * dy
                if 0.6 < d <= 1:
                    c.put(xx, y, PAL["wood3"] if (xx + y) % 3 else (34, 28, 26))
                elif d <= 0.15:
                    c.put(xx, y, PAL["wood2"])
        c.vline(x, 38, 20, PAL["wood2"]); c.hline(x - 8, 48, 16, PAL["wood2"])
    c.rect(82, 30, 12, 3, PAL["wood2"])
    c.rect(12, 6, 66, 10, PAL["parchment"]); c.hline(12, 6, 66, SNOW); c.hline(12, 15, 66, shade(PAL["parchment"], 0.7))
    return reg("wagon", c, solid=(8, 30, 86, 30))


def coach():
    c = Canvas(T * 3, T * 2)
    body = (110, 40, 34)
    c.rect(14, 10, 62, 30, body); c.outline(14, 10, 62, 30, shade(body, 0.5))
    c.hline(15, 11, 60, shade(body, 1.3)); c.rect(14, 4, 62, 5, (60, 48, 42)); c.hline(14, 4, 62, SNOW); c.hline(14, 9, 62, (40, 32, 30))
    for wx in (20, 44):
        c.rect(wx, 15, 12, 12, (60, 78, 100)); c.outline(wx, 15, 12, 12, (40, 32, 30)); c.put(wx + 2, 17, (150, 176, 200))
    c.rect(60, 15, 12, 20, shade(body, 0.85)); c.outline(60, 15, 12, 20, shade(body, 0.5)); c.put(69, 26, PAL["gold1"])
    c.rect(28, 30, 20, 5, PAL["gold"]); c.hline(30, 32, 16, PAL["gold1"])
    c.rect(2, 26, 12, 6, PAL["wood2"])
    for x, rr in ((26, 9), (66, 11)):
        for y in range(40 - rr, 40 + rr + 1):
            for xx in range(x - rr, x + rr + 1):
                d = ((xx - x) / rr) ** 2 + ((y - 40) / rr) ** 2
                if 0.62 < d <= 1:
                    c.put(xx, y, (34, 28, 26) if (xx + y) % 2 else PAL["gold"])
                elif d <= 0.12:
                    c.put(xx, y, PAL["gold"])
        c.vline(x, 40 - rr + 2, rr * 2 - 3, PAL["gold"]); c.hline(x - rr + 2, 40, rr * 2 - 3, PAL["gold"])
    c.rect(10, 50, 74, 4, (30, 26, 28))
    return reg("coach", c, solid=(6, 30, 84, 28))


def signpost():
    c = Canvas(T, T * 2)
    c.rect(14, 10, 4, 50, PAL["wood2"]); c.vline(15, 10, 50, PAL["wood1"])
    c.rect(4, 12, 24, 8, PAL["wood1"]); c.hline(7, 15, 18, PAL["cream"]); c.put(27, 15, PAL["cream"]); c.hline(4, 12, 24, SNOW)
    c.rect(4, 24, 24, 8, PAL["wood1"]); c.hline(7, 27, 14, PAL["cream"]); c.put(4, 27, PAL["cream"])
    c.rect(12, 60, 8, 2, PAL["wood3"])
    return reg("signpost", c, solid=(12, 56, 8, 6))


def barrels():
    c = Canvas(T * 2, T)
    for x in (4, 34):
        for yy in range(6, 28):
            t = abs(yy - 17) / 11
            w = 16 - int(2 * t * t)
            for xx in range(x + 8 - w // 2, x + 8 + w // 2):
                col = PAL["wood1"] if xx < x + 6 else PAL["wood0"]
                if xx > x + 12:
                    col = PAL["wood2"]
                if (xx - x) % 4 == 0:
                    col = shade(col, 0.8)
                c.put(xx, yy, col)
        c.rect(x - 1, 10, 18, 2, PAL["slate"]); c.rect(x - 1, 22, 18, 2, PAL["slate"]); c.hline(x - 1, 10, 18, PAL["stone"])
        c.hline(x + 1, 6, 14, SNOW)
    return reg("barrels2", c, solid=(2, 8, 60, 22))


def well():
    c = Canvas(T * 2, T * 2)
    rubble(c, 12, 30, 40, 26, seed=77)
    c.rect(12, 28, 40, 3, PAL["lstone"]); c.hline(12, 28, 40, SNOW)
    c.rect(20, 34, 24, 14, PAL["ink"])
    c.rect(16, 4, 4, 30, PAL["wood2"]); c.rect(44, 4, 4, 30, PAL["wood2"])
    for row in range(8):
        c.hline(10 + row // 2, row, 44 - row, shade(PAL["wood3"], 0.9 + row * 0.03))
    c.hline(10, 0, 44, SNOW); c.hline(10, 1, 44, SNOW)
    c.rect(20, 14, 24, 3, PAL["wood2"]); c.rect(30, 17, 3, 12, PAL["wood3"])
    c.rect(26, 26, 10, 6, PAL["slate"]); c.hline(26, 26, 10, PAL["stone"])
    return reg("well", c, solid=(12, 30, 40, 26))


def trough():
    c = Canvas(T * 2, T)
    c.rect(4, 10, 56, 16, PAL["wood2"]); c.outline(4, 10, 56, 16, PAL["wood3"])
    c.rect(6, 12, 52, 8, (96, 120, 140)); c.hline(6, 12, 52, (150, 176, 196))
    c.rect(6, 20, 52, 1, SNOW_SH)
    c.rect(6, 26, 4, 4, PAL["wood3"]); c.rect(54, 26, 4, 4, PAL["wood3"])
    return reg("trough", c, solid=(4, 12, 56, 16))


def snow_pile():
    c = Canvas(T, T)
    for y in range(14, 30):
        half = int(14 * ((30 - y) / 16) ** 0.5)
        c.hline(16 - half, y, half * 2, SNOW if y < 24 else SNOW_SH)
    c.speckle(4, 16, 24, 12, PAL["white"], 0.15, seed=3)
    return reg("snow_pile", c)


def build_all():
    capitol(); white_house()
    house("jail", 4, 2, wall="rubble", roof_col=(70, 68, 72), door_col=PAL["wood3"], sign="key", fanlight=False, pilasters=False, seed=30, chimneys=1, steps=1)
    house("tavern", 5, 3, wall="brick", roof_col=(84, 78, 82), door_col=(226, 220, 206), sign="tankard", lit=True, dormers=3, seed=60, lamp=True)
    house("hat_shop", 3, 2, wall="clap", wall_base=(212, 206, 196), roof_col=(96, 88, 84), door_col=PAL["wood3"], sign="hat", seed=80, chimneys=1, steps=1)
    house("boarding_house", 4, 2, wall="clap", roof_col=(100, 92, 84), door_col=(60, 80, 60), shutter=(60, 80, 60), lit=True, dormers=2, seed=95)
    house("post_office", 4, 2, wall="brick", roof_col=PAL["slate"], door_col=(50, 70, 60), sign="letter", shutter=(50, 70, 60), seed=50)
    house("bank_office", 4, 2, wall="stone", roof_col=(80, 84, 92), door_col=PAL["blue3"], sign="bank", seed=70)
    house("print_shop", 3, 2, wall="brick", roof_col=(70, 60, 60), door_col=(60, 60, 70), sign="press", seed=90, chimneys=1, steps=1, pilasters=False)
    house("hotel", 7, 3, wall="brick", roof_col=(96, 60, 50), door_col=PAL["red"], shutter=(80, 40, 30), lit=True, dormers=5, seed=40, sign_band=(90, 40, 34), lamp=True)
    house("house_a", 3, 2, wall="clap", roof_col=(84, 80, 84), shutter=(60, 60, 90), seed=100, chimneys=1, steps=1, pilasters=False)
    house("house_b", 3, 2, wall="plaster", roof_col=(90, 70, 60), shutter=(80, 50, 40), seed=110, chimneys=1, steps=1, pilasters=False)
    house("house_c", 4, 2, wall="brick", roof_col=PAL["slate"], seed=120)
    house("house_d", 2, 2, wall="clap", wall_base=(196, 192, 184), roof_col=(70, 66, 70), seed=130, chimneys=1, steps=1, pilasters=False, fanlight=False)
    tree_bare(); lamp_post(); fence(3); fence(2); hitching_post(); wagon(); coach(); signpost(); barrels(); well(); trough(); snow_pile()
    index = {}
    for name, o in objs.items():
        o["c"].save(f"buildings/{name}.png")
        index[name] = {"w": o["c"].w, "h": o["c"].h, "door": o["door"], "solid": o["solid"], "lights": o["lights"], "smoke": o["smoke"]}
    with open(os.path.join(ASSETS, "buildings", "index.json"), "w") as f:
        json.dump(index, f)
    return objs


if __name__ == "__main__":
    o = build_all()
    cs = [v["c"] for v in o.values()]
    print(len(cs), "objects")
    preview(cs[:2], "buildings_a.png", scale=2)
    preview(cs[2:8], "buildings_b.png", scale=2)
    preview(cs[8:14], "buildings_c.png", scale=2)
    preview(cs[14:], "props.png", scale=3)
