"""Hi-bit dialogue portraits, 64x64, shown at 3x in the dialogue box.

Each portrait is built from a shared bust construction (coat, collar, neck,
head volume with shading) plus per-character hand-drawn overlays for hair,
brows, eyes, nose, mouth and any distinguishing features. Base shapes are
parameterised so every face has its own width, jaw and proportions.
"""
import math
from common import Canvas, PAL, shade, mix, preview

W = H = 64

# Skin ramps: dark -> light
SKIN_PALE = [(122, 82, 66), (172, 122, 96), (214, 164, 132), (236, 196, 166), (248, 222, 198)]
SKIN_RUDDY = [(118, 70, 58), (170, 108, 86), (212, 150, 120), (232, 182, 150), (244, 208, 180)]
SKIN_OLIVE = [(104, 72, 50), (154, 110, 76), (196, 150, 108), (222, 180, 138), (238, 204, 168)]
SKIN_GREY = [(110, 84, 74), (156, 124, 108), (196, 164, 146), (220, 194, 176), (236, 214, 198)]


def ellipse_pts(cx, cy, rx, ry):
    for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
        for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
            dx = (x + 0.5 - cx) / rx
            dy = (y + 0.5 - cy) / ry
            if dx * dx + dy * dy <= 1.0:
                yield x, y


class Portrait:
    def __init__(self, bg=((44, 38, 44), (28, 24, 28))):
        self.c = Canvas(W, H)
        # vignette background: soft radial from bg[0] to bg[1]
        for y in range(H):
            for x in range(W):
                d = math.hypot((x - 32) / 32, (y - 30) / 34)
                t = min(1, d * d)
                self.c.put(x, y, mix(bg[0], bg[1], t))
        # subtle frame
        self.c.outline(0, 0, W, H, PAL["ink"])
        self.c.outline(1, 1, W - 2, H - 2, (92, 76, 52))

    # ---- body ----------------------------------------------------------
    def coat(self, colour=(38, 34, 40), lapel=(24, 22, 26), shoulders=(10, 56), width=60,
             vest=None, cravat=PAL["white"], cravat_style="stock", collar_high=True):
        c = self.c
        top = shoulders[1]
        dark = shade(colour, 0.7)
        light = shade(colour, 1.25)
        # shoulders slope
        for y in range(top - 8, H):
            spread = min(width // 2, 22 + (y - (top - 8)) * 3)
            for x in range(32 - spread, 32 + spread):
                col = colour
                if x < 32 - spread + 3 or x > 32 + spread - 4:
                    col = dark
                if y < top - 5:
                    col = mix(col, light, 0.3)
                c.put(x, y, col)
        # lapels: V opening toward centre
        for y in range(top - 6, H):
            half = max(0, 9 - (y - (top - 6)) // 2)
            for x in range(32 - half - 6, 32 - half):
                c.put(x, y, lapel)
            for x in range(32 + half, 32 + half + 6):
                c.put(x, y, mix(lapel, light, 0.2))
        # vest / shirt in the V
        for y in range(top - 6, H):
            half = max(0, 9 - (y - (top - 6)) // 2)
            for x in range(32 - half, 32 + half):
                col = vest if vest else (PAL["cream"] if y < top + 2 else colour)
                c.put(x, y, col)
        # cravat / stock
        if cravat_style == "stock":
            c.rect(24, top - 10, 16, 7, cravat)
            c.rect(23, top - 9, 18, 5, cravat)
            c.hline(24, top - 4, 16, shade(cravat, 0.8))
            c.rect(29, top - 4, 6, 4, cravat)
            c.hline(29, top - 1, 6, shade(cravat, 0.8))
        elif cravat_style == "bow":
            c.rect(24, top - 10, 16, 6, cravat)
            c.rect(26, top - 5, 4, 4, cravat)
            c.rect(34, top - 5, 4, 4, cravat)
            c.rect(30, top - 5, 4, 3, shade(cravat, 0.8))
        elif cravat_style == "open":
            c.rect(26, top - 10, 12, 8, cravat)
        if collar_high:
            c.rect(22, top - 14, 4, 6, PAL["white"])
            c.rect(38, top - 14, 4, 6, PAL["white"])
            c.put(22, top - 14, PAL["lstone"])
            c.put(41, top - 14, PAL["lstone"])

    def neck(self, skin, cx=32, w=10, top=38, bottom=46):
        for y in range(top, bottom):
            for x in range(cx - w // 2, cx + w // 2 + 1):
                col = skin[2]
                if x < cx - w // 2 + 2:
                    col = skin[1]
                if y < top + 3:
                    col = skin[1]
                self.c.put(x, y, col)

    # ---- head ----------------------------------------------------------
    def head(self, skin, cx=32, cy=26, rx=13, ry=17, jaw=0.85, chin_w=4, light_dir=-1,
             cheek=None, gaunt=0.0):
        """Draw a shaded head volume. jaw<1 narrows the lower face."""
        c = self.c
        top = cy - ry
        for y in range(int(cy - ry), int(cy + ry) + 1):
            t = (y - top) / (2 * ry)  # 0 top -> 1 chin
            # width profile: full at brow/cheek, narrower at chin
            if t < 0.15:
                wf = math.sqrt(max(0, 1 - ((0.15 - t) / 0.15) ** 2)) * 0.92
            elif t < 0.6:
                wf = 1.0
            else:
                u = (t - 0.6) / 0.4
                wf = 1.0 - (1.0 - jaw) * u ** 1.4
                if t > 0.92:
                    wf *= max(0.5, 1 - (t - 0.92) * 5)
            if gaunt and 0.5 < t < 0.8:
                wf -= gaunt * math.sin((t - 0.5) / 0.3 * math.pi) * 0.12
            half = rx * wf
            for x in range(int(cx - half), int(cx + half) + 1):
                nx = (x + 0.5 - cx) / max(0.1, half)
                # base shade by lighting from light_dir
                lit = 0.5 + 0.5 * (-nx * light_dir)
                v = 2
                if lit > 0.72:
                    v = 3
                if t > 0.85 or abs(nx) > 0.82:
                    v = 1
                if abs(nx) > 0.94 or t > 0.96:
                    v = 0
                if gaunt and 0.55 < t < 0.8 and 0.35 < abs(nx) < 0.8:
                    v = min(v, 1 if abs(nx) > 0.55 else 2)
                if lit > 0.72 and 0.25 < t < 0.5 and abs(nx) < 0.5:
                    v = 4
                c.put(x, y, skin[v])
        # ears
        for side in (-1, 1):
            ex = cx + side * (rx + 1)
            ey = cy + 1
            for dy in range(-3, 4):
                for dx in range(-2, 2):
                    if abs(dx) + abs(dy) // 2 <= 2:
                        c.put(ex + dx, ey + dy, skin[1] if side == light_dir else skin[2])
            c.put(ex, ey, skin[0])
        if cheek:
            for side in (-1, 1):
                c.put(cx + side * 6, cy + 4, cheek)
                c.put(cx + side * 7, cy + 4, cheek)
                c.put(cx + side * 6, cy + 5, cheek)

    def overlay(self, text, key, ox=0, oy=0):
        self.c.grid(text, key, ox, oy)


# ---------------------------------------------------------------------------
# Individual portraits
# ---------------------------------------------------------------------------
def jackson():
    """Andrew Jackson, 67: gaunt, long face, upswept white hair, deep-set eyes."""
    p = Portrait(bg=((58, 44, 40), (30, 22, 22)))
    skin = SKIN_GREY
    p.coat(colour=(30, 28, 34), lapel=(20, 18, 22), shoulders=(10, 56), vest=(40, 36, 44),
           cravat=(238, 234, 226), cravat_style="stock")
    p.neck(skin, w=11, top=41, bottom=52)
    p.head(skin, cx=32, cy=26, rx=13, ry=17, jaw=0.78, gaunt=0.9)
    K = {
        "w": (244, 244, 240), "g": (200, 198, 196), "d": (150, 148, 150), "k": (98, 96, 100),
        "s": skin[1], "S": skin[0], "b": (48, 44, 46), "e": (52, 60, 68), "E": (18, 16, 18),
        "h": (236, 236, 232), "r": (176, 116, 100), "L": (220, 176, 156), "x": PAL["ink"],
    }
    # hair: tall, swept back and up, wild at the crown
    p.overlay("""
..................d.wgw.d.wg................
...............d.wwwgwwwgwwwgw.d............
.............dgwwwwwgwwwwwwwwwwgd...........
............gwwwwwwwwwwwwwwwwwwwwg..........
...........gwwwwwgwwwwwwwwwwwwwwwwd.........
..........dwwwwwwwwwwwwwwwwwwwwwwwwd........
..........gwwwwwwwwwwwwwwwwwwwwwwwwg........
.........dwwwwwwwwwwwwwwwwwwwwwwwwwwd.......
.........gwwwwwwwwwwwwwwwwwwwwwwwwwwg.......
.........gwwwwwwwwwwwwwwwwwwwwwwwwwwwg......
.........dgwwwwwgwwwwwwwwwwwgwwwwwwwwd......
.........dwwgd..............dgwwwwwwd.......
.........dwgd..................dgwwd........
.........dgd.....................dwd........
.........dd.......................dd........
..........d.......................dd........
..........d........................d........
""", K, ox=10, oy=3)
    # brows: heavy, straight, low
    p.overlay("""
..kkkkkkk.......kkkkkkk..
.kdkkkkkkd.....dkkkkkkdk.
""", K, ox=20, oy=20)
    # eyes: deep set, pale blue, shadowed sockets
    p.overlay("""
.SSSSSSS.....SSSSSSS.
SSbwwewbS...SbwewwbSS
.SbwEewbS...SbweEwbS.
..bbbbb.......bbbbb..
""", K, ox=22, oy=22)
    # nose: long, straight, strong bridge
    p.overlay("""
....S.
....Ss
...S.s
...S.s
...S..s
..S...s
..S...s
.SS...Ss
SS.SSSS.
""", K, ox=29, oy=25)
    # mouth: thin, set hard; chin cleft
    p.overlay("""
.SSrrrrrrrrrSS.
S..LLLLLLLLL..S
...SSSSSSSSS...
""", K, ox=25, oy=35)
    p.overlay("""
.S.
.S.
""", K, ox=31, oy=39)
    # lines: nasolabial, brow furrow
    for y in range(31, 37):
        p.c.put(26 - (y - 31) // 3, y, skin[1])
        p.c.put(38 + (y - 31) // 3, y, skin[1])
    p.c.put(31, 19, skin[1]); p.c.put(33, 19, skin[1])
    return p.c


def calhoun():
    """John C. Calhoun: severe, hollow-cheeked, hair thick and brushed up, burning eyes."""
    p = Portrait(bg=((44, 46, 58), (22, 24, 32)))
    skin = SKIN_PALE
    p.coat(colour=(26, 26, 30), lapel=(18, 18, 22), shoulders=(10, 56), vest=(26, 26, 30),
           cravat=(236, 236, 232), cravat_style="stock")
    p.neck(skin, w=11, top=41, bottom=52)
    p.head(skin, cx=32, cy=26, rx=13, ry=17, jaw=0.74, gaunt=1.0)
    K = {
        "w": (78, 72, 70), "g": (110, 102, 98), "d": (56, 50, 50), "k": (44, 38, 40),
        "s": skin[1], "S": skin[0], "b": (40, 34, 36), "e": (60, 58, 62), "E": (14, 12, 14),
        "r": (168, 108, 96), "L": (212, 168, 150), "x": PAL["ink"], "i": (250, 250, 250),
    }
    # hair: dense, brushed back and up, greying at temples
    p.overlay("""
...............ddwwwwwwwwwwwwwdd............
............ddwwwwwgwwwwwwwwwwwwwd..........
...........dwwwwwwwwwwwwwwwwwwwwwwd.........
..........dwwwwwwwwwwwwwwwwwwwwwwwwd........
.........dwwwwwwwwwwwwwwwwwwwwwwwwwwd.......
.........dwwwwwwwwwwwwwwwwwwwwwwwwwwwd......
........dwwwwwwwwwwwwwwwwwwwwwwwwwwwwd......
........dwwwwwwwwwwwwwwwwwwwwwwwwwwwwwd.....
........dwwwwwwgwwwwwwwwwwwwwwwwwwwwwwd.....
........dwwwwwdd....dwwwwwwwwwwwwwwwwd......
........dwwwd.........ddwwwwwwwwwwwwd.......
........dwwd.............dddwwwwwdd.........
........dgd..................dwwd...........
........dgd...................dgd...........
........dd....................dd............
........dd....................dd............
""", K, ox=10, oy=4)
    # brows: sharp, angled inward
    p.overlay("""
...kkkkkkk.....kkkkkkk...
..kkkkkkkkk...kkkkkkkkk..
""", K, ox=20, oy=20)
    # eyes: wide, intense, dark
    p.overlay("""
.SSSSSSSS...SSSSSSSS.
SbiiEEiibS.SbiiEEiibS
SbiEEEEibS.SbiEEEEibS
.SbbbbbbS...SbbbbbbS.
""", K, ox=22, oy=22)
    # nose: long, thin
    p.overlay("""
....S
....S.
...S.s
...S.s
...S..s
..S...s
..S...s
.SS..SSs
.SSSSSS.
""", K, ox=29, oy=25)
    # mouth: wide, thin, downturned
    p.overlay("""
SSrrrrrrrrrrrSS
.S.LLLLLLLLL.S.
..SSSSSSSSSSS..
""", K, ox=25, oy=35)
    # hollow cheeks
    for y in range(29, 37):
        p.c.put(22 + (y - 29) // 4, y, skin[0])
        p.c.put(42 - (y - 29) // 4, y, skin[0])
    return p.c


def clay():
    """Henry Clay: long wide mouth, high forehead, thinning grey hair, sly amused eyes."""
    p = Portrait(bg=((60, 48, 34), (30, 24, 18)))
    skin = SKIN_RUDDY
    p.coat(colour=(40, 32, 30), lapel=(30, 24, 22), shoulders=(10, 56), vest=(128, 98, 52),
           cravat=(240, 236, 226), cravat_style="bow")
    p.neck(skin, w=12, top=41, bottom=52)
    p.head(skin, cx=32, cy=26, rx=14, ry=17, jaw=0.86, cheek=(222, 150, 128))
    K = {
        "w": (150, 142, 132), "g": (184, 176, 166), "d": (108, 100, 92), "k": (96, 84, 76),
        "s": skin[1], "S": skin[0], "b": (46, 36, 34), "e": (96, 110, 92), "E": (16, 14, 14),
        "r": (190, 110, 96), "L": (232, 178, 160), "x": PAL["ink"], "i": (250, 250, 250),
    }
    # hair: receding, combed forward at the sides, high dome forehead showing
    p.overlay("""
...............ddwgwwgwwd...................
............ddwwwwwwwwwwwwd.................
..........dwwwwwwwwwwwwwwwwwd...............
.........dwwwwwwwwwwwwwwwwwwwwd.............
........dwwwwwwd.........dwwwwwd............
........dwwwd...............dwwwd...........
........dwwd..................dwwd..........
........dwd....................dwd..........
........dwd....................dwd..........
........dwwd..................dwwd..........
........dwwd..................dwwd..........
........dwd....................dwd..........
.........d......................d...........
""", K, ox=10, oy=5)
    # brows: raised, one higher (amused)
    p.overlay("""
..kkkkkkk......kkkkkkkk..
.kkkkkkkkk.......kkkkkk..
""", K, ox=20, oy=19)
    # eyes: narrow, bright, crow's feet
    p.overlay("""
.SSSSSSSS...SSSSSSSS.
SbiiEEiibS.SbiiEEiibS
.SbbbbbbS...SbbbbbbS.
S...........S.......S
""", K, ox=22, oy=22)
    # nose: broad
    p.overlay("""
....S.
....Ss
...S.s
...S.s
..S...s
..S...s
.SS...Ss
SSSSSSSS
""", K, ox=29, oy=25)
    # mouth: famously wide, faint smirk
    p.overlay("""
S.SrrrrrrrrrrrrS.S
.SS.LLLLLLLLLLL.SS
....SSSSSSSSSSS...
""", K, ox=23, oy=35)
    return p.c


def biddle():
    """Nicholas Biddle: smooth, handsome, self-satisfied, dark curly hair, tidy."""
    p = Portrait(bg=((36, 48, 52), (18, 26, 30)))
    skin = SKIN_PALE
    p.coat(colour=(34, 44, 66), lapel=(24, 30, 48), shoulders=(10, 56), vest=(206, 190, 150),
           cravat=(244, 240, 232), cravat_style="stock")
    p.neck(skin, w=12, top=41, bottom=52)
    p.head(skin, cx=32, cy=26, rx=14, ry=17, jaw=0.92)
    K = {
        "w": (58, 44, 36), "g": (92, 70, 54), "d": (38, 28, 24), "k": (50, 38, 32),
        "s": skin[1], "S": skin[0], "b": (46, 36, 34), "e": (74, 64, 52), "E": (16, 14, 14),
        "r": (196, 122, 108), "L": (236, 186, 168), "x": PAL["ink"], "i": (250, 250, 250),
    }
    # hair: dark, curled, full over the ears and forehead
    p.overlay("""
..............dgwwgwwwwgwwgd................
...........ddwwwwwwwwwwwwwwwwdd.............
.........dgwwwwwgwwwwwwwwwgwwwwgd...........
........dwwwwwwwwwwwwwwwwwwwwwwwwd..........
.......dwwwwwwwwwwwwwwwwwwwwwwwwwwd.........
.......dwwwgwwwwwwwwwwwwwwwwwwgwwwwd........
......dwwwwwwwwwwwwwwwwwwwwwwwwwwwwd........
......dwwwwwwwdd.......ddwwwwwwwwwwwd.......
......dwwwwwd.............dwwwwwwwwwd.......
......dwwwwd...............dwwwwwwwd........
......dwwwd.................dwwwwwd.........
......dwwwd..................dwwwd..........
......dgwwd..................dwwgd..........
.......dwd....................dwd...........
.......dgd....................dgd...........
""", K, ox=10, oy=5)
    # brows: neat arches
    p.overlay("""
..kkkkkkkk.....kkkkkkkk..
.kk......kk...kk......kk.
""", K, ox=20, oy=20)
    # eyes: heavy-lidded, complacent
    p.overlay("""
.SSSSSSSS...SSSSSSSS.
.SbbbbbbS...SbbbbbbS.
SbiiEEiibS.SbiiEEiibS
.SbbbbbbS...SbbbbbbS.
""", K, ox=22, oy=22)
    # nose
    p.overlay("""
....S.
....Ss
...S.s
...S.s
..S...s
..S...s
.SSSSSSs
""", K, ox=29, oy=26)
    # mouth: small, pursed, faint smile
    p.overlay("""
..SrrrrrrrrrS..
.S.LLLLLLLLL.S.
...SSSSSSSSS...
""", K, ox=25, oy=35)
    # sideburns
    p.overlay("""
d.
dd
dd
dd
.d
""", K, ox=19, oy=30)
    p.overlay("""
.d
dd
dd
dd
d.
""", K, ox=43, oy=30)
    return p.c


def ross():
    """John Ross: fair skin, blue eyes, dark hair parted and combed close, calm formal set."""
    p = Portrait(bg=((48, 42, 34), (24, 20, 18)))
    skin = SKIN_OLIVE
    p.coat(colour=(52, 40, 32), lapel=(36, 28, 24), shoulders=(10, 56), vest=(80, 66, 48),
           cravat=(236, 230, 214), cravat_style="stock")
    p.neck(skin, w=12, top=41, bottom=52)
    p.head(skin, cx=32, cy=26, rx=14, ry=17, jaw=0.9)
    K = {
        "w": (44, 34, 30), "g": (74, 58, 50), "d": (28, 22, 20), "k": (40, 30, 28),
        "s": skin[1], "S": skin[0], "b": (44, 34, 30), "e": (88, 120, 150), "E": (16, 14, 14),
        "r": (176, 116, 96), "L": (220, 170, 140), "x": PAL["ink"], "i": (250, 250, 250),
    }
    # hair: dark, side-parted, combed flat and close
    p.overlay("""
..............ddwwwwwwwwwwwwdd..............
............dwwwwwwwwwwwwwwwwwwd............
...........dwwwwwwwgwwwwwwwwwwwwd...........
..........dwwwwwwwwwgwwwwwwwwwwwwd..........
..........dwwwwwwwwwwgwwwwwwwwwwwwd.........
.........dwwwwwwwwwwwd.dwwwwwwwwwwd.........
.........dwwwwwwwwwwd...dwwwwwwwwwwd........
.........dwwwwwwwwd.......dwwwwwwwwd........
.........dwwwwwwd...........dwwwwwwd........
.........dwwwwd...............dwwwwd........
.........dwwd...................dwwd........
.........dwd.....................dwd........
.........dd.......................dd........
""", K, ox=10, oy=5)
    # brows: level, composed
    p.overlay("""
..kkkkkkkk.....kkkkkkkk..
.kk.......k...k.......kk.
""", K, ox=20, oy=20)
    # eyes: blue, steady
    p.overlay("""
.SSSSSSSS...SSSSSSSS.
SbiieEeiibS.SbiieEeibS
SbieEEEeibS.SbieEEEibS
.SbbbbbbS...SbbbbbbS.
""", K, ox=22, oy=22)
    # nose
    p.overlay("""
....S.
....Ss
...S.s
...S.s
..S...s
..S...s
.SSSSSSs
""", K, ox=29, oy=26)
    # mouth: firm, level
    p.overlay("""
.SSrrrrrrrrrrSS.
...LLLLLLLLLL...
..SSSSSSSSSSSS..
""", K, ox=24, oy=35)
    return p.c


def gregory():
    """John Gregory (fictional): worn, sandy hair thinning, spectacles, tired and resentful."""
    p = Portrait(bg=((46, 44, 36), (22, 22, 18)))
    skin = SKIN_PALE
    p.coat(colour=(70, 58, 40), lapel=(52, 44, 32), shoulders=(10, 56), vest=(96, 78, 50),
           cravat=(200, 190, 170), cravat_style="open", collar_high=False)
    p.neck(skin, w=11, top=41, bottom=52)
    p.head(skin, cx=32, cy=26, rx=13, ry=17, jaw=0.84, gaunt=0.5)
    K = {
        "w": (150, 124, 78), "g": (184, 158, 104), "d": (104, 84, 52), "k": (118, 96, 60),
        "s": skin[1], "S": skin[0], "b": (46, 38, 34), "e": (100, 96, 80), "E": (16, 14, 14),
        "r": (176, 116, 100), "L": (220, 170, 150), "x": PAL["ink"], "i": (250, 250, 250),
        "m": (160, 150, 130), "M": (90, 84, 74),
    }
    # hair: sandy, thinning, untidy
    p.overlay("""
..................dwwgwd.dwwd...............
...............dwwwwwwwwwwwwwwd.............
.............dwwwwwwwwwwwwwwwwwwd...........
............dwwwwwdd..ddwwwwwwwwwd..........
...........dwwwd........dddwwwwwwd..........
...........dwwd............ddwwwwd..........
...........dwd................dwwd..........
...........dwd.................dwd..........
...........dd..................dwd..........
...........dd...................dd..........
...........d....................d...........
""", K, ox=10, oy=6)
    # brows: pinched
    p.overlay("""
...kkkkkkk.....kkkkkkk...
....kkkkkk.....kkkkkk....
""", K, ox=20, oy=20)
    # eyes: tired, ringed
    p.overlay("""
.SSSSSSSS...SSSSSSSS.
SbiiEEiibS.SbiiEEiibS
.SbbbbbbS...SbbbbbbS.
.S......S...S......S.
""", K, ox=22, oy=22)
    # spectacles: thin wire rims
    p.overlay("""
.MMMMMMMMMM..MMMMMMMMMM.
M..........MM..........M
M..........MM..........M
M..........MM..........M
.MMMMMMMMMM..MMMMMMMMMM.
""", K, ox=20, oy=21)
    p.c.put(19, 23, K["M"]); p.c.put(44, 23, K["M"])
    # nose
    p.overlay("""
....S.
....Ss
...S.s
...S.s
..S...s
..S...s
.SSSSSSs
""", K, ox=29, oy=26)
    # mouth: tight, bitter
    p.overlay("""
..SrrrrrrrrrS..
.S.LLLLLLLLL.S.
..SSSSSSSSSSS..
""", K, ox=25, oy=35)
    # stubble
    p.c.speckle(25, 37, 14, 6, skin[1], 0.35, seed=7)
    return p.c


def lawrence():
    """Richard Lawrence: house painter, 35, bearded, hair wild, eyes far away."""
    p = Portrait(bg=((36, 36, 40), (16, 16, 20)))
    skin = SKIN_GREY
    p.coat(colour=(84, 70, 58), lapel=(60, 50, 42), shoulders=(10, 56), vest=(84, 70, 58),
           cravat=(170, 160, 140), cravat_style="open", collar_high=False)
    p.neck(skin, w=12, top=41, bottom=52)
    p.head(skin, cx=32, cy=26, rx=14, ry=17, jaw=0.9, gaunt=0.3)
    K = {
        "w": (62, 50, 40), "g": (94, 76, 60), "d": (40, 32, 26), "k": (48, 38, 32),
        "s": skin[1], "S": skin[0], "b": (40, 34, 32), "e": (110, 104, 96), "E": (16, 14, 14),
        "r": (170, 112, 100), "L": (210, 166, 150), "x": PAL["ink"], "i": (250, 250, 250),
    }
    # hair: unkempt, hanging over the forehead
    p.overlay("""
.............dwwwgwwwdwwwwgwwwd.............
...........dwwwwwwwwwwwwwwwwwwwwd...........
..........dwwwwwwwwwwwwwwwwwwwwwwd..........
.........dwwwwwwwwwwwwwwwwwwwwwwwwd.........
.........dwwwwwwwwwwwwwwwwwwwwwwwwd.........
.........dwwwwwwd.dwwwwd.dwwwwwwwwd.........
.........dwwwwd....dwwd....dwwwwwwd.........
.........dwwd.......dd.......dwwwwd.........
.........dwd..................dwwd..........
.........dwd...................dwd..........
.........dwd...................dwd..........
.........dwd...................dwd..........
.........dd....................dd...........
""", K, ox=10, oy=5)
    # brows: raised, asymmetrical
    p.overlay("""
..kkkkkkk........kkkkkk..
.kk.............kkkkkkk..
""", K, ox=20, oy=19)
    # eyes: wide, whites showing, staring
    p.overlay("""
.SSSSSSSS...SSSSSSSS.
SbiiiEiiibS.SbiiiEiiibS
SbiiEEEiibS.SbiiEEEiibS
.SbiiiiibS...SbiiiiibS.
.SbbbbbbS...SbbbbbbS.
""", K, ox=22, oy=21)
    # nose
    p.overlay("""
....S.
....Ss
...S.s
...S.s
..S...s
..S...s
.SSSSSSs
""", K, ox=29, oy=26)
    # beard: full, dark
    p.overlay("""
d.............d
dd...........dd
ddd.........ddd
dddd..rrrr..dddd
ddddd.LLLL.ddddd
dddddddddddddddd
.dddddddddddddd.
..dddddddddddd..
...dddddddddd...
""", K, ox=24, oy=33)
    return p.c


def magistrate():
    """The magistrate: heavy, older, white side-whiskers, spectacles pushed up, weary."""
    p = Portrait(bg=((50, 40, 30), (24, 20, 16)))
    skin = SKIN_RUDDY
    p.coat(colour=(36, 30, 28), lapel=(26, 22, 20), shoulders=(10, 56), vest=(110, 40, 40),
           cravat=(238, 234, 226), cravat_style="stock")
    p.neck(skin, w=15, top=41, bottom=52)
    p.head(skin, cx=32, cy=26, rx=15, ry=17, jaw=1.0, cheek=(226, 150, 128))
    K = {
        "w": (222, 218, 210), "g": (240, 238, 232), "d": (168, 162, 154), "k": (150, 144, 138),
        "s": skin[1], "S": skin[0], "b": (48, 40, 38), "e": (90, 80, 70), "E": (16, 14, 14),
        "r": (196, 122, 108), "L": (236, 186, 168), "x": PAL["ink"], "i": (250, 250, 250),
    }
    # bald crown, white hair at the sides, big side-whiskers
    p.overlay("""
..........................................
.........dwwd..................dwwd.......
........dwwwd..................dwwwd......
........dwwwd..................dwwwd......
........dwwwwd................dwwwwd......
........dwwwwwd..............dwwwwwd......
........dwwwwwwd............dwwwwwwd......
........dwwwwwwwd..........dwwwwwwwd......
.........dwwwwwwd..........dwwwwwwd.......
..........dwwwwd............dwwwwd........
...........dwwd..............dwwd.........
""", K, ox=11, oy=19)
    # brows: bushy white
    p.overlay("""
.kwwwwwwk.....kwwwwwwk.
kwwwwwwwwk...kwwwwwwwwk
""", K, ox=21, oy=19)
    # eyes: small, tired, bags
    p.overlay("""
.SSSSSSS.....SSSSSSS.
SbiiEEiibS..SbiiEEiibS
.SbbbbbbS....SbbbbbbS.
..SSSSS........SSSSS..
""", K, ox=22, oy=22)
    # nose: bulbous
    p.overlay("""
....S.
....Ss
...S.s
...S.s
..S...s
.S....rs
.SrrrrrS
..SSSSS.
""", K, ox=29, oy=25)
    # mouth: downturned, jowly
    p.overlay("""
S.SrrrrrrrrrrS.S
.S.LLLLLLLLLL.S.
...SSSSSSSSSS...
""", K, ox=24, oy=36)
    return p.c


PORTRAITS = {
    "jackson": jackson,
    "calhoun": calhoun,
    "clay": clay,
    "biddle": biddle,
    "ross": ross,
    "gregory": gregory,
    "lawrence": lawrence,
    "magistrate": magistrate,
}

if __name__ == "__main__":
    import sys
    names = sys.argv[1:] or list(PORTRAITS)
    outs = []
    for n in names:
        c = PORTRAITS[n]()
        c.save(f"portraits/{n}.png")
        outs.append(c)
    print(preview(outs, "portraits.png", scale=4))
