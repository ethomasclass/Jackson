"""Evidence card icons, 48x48, from the suspect/evidence deck."""
import json
import os
from common import Canvas, PAL, shade, preview, ASSETS

S = 48
items = {}


def card(name, draw):
    c = Canvas(S, S)
    draw(c)
    items[name] = c
    return c


def address_card(c):
    c.rect(6, 12, 36, 24, PAL["cream"]); c.outline(6, 12, 36, 24, PAL["parchment"])
    c.rect(7, 13, 34, 22, PAL["white"])
    c.hline(11, 18, 22, PAL["ink"]); c.hline(11, 22, 26, PAL["slate"]); c.hline(11, 26, 18, PAL["slate"])
    c.hline(11, 30, 14, PAL["slate"])
    c.rect(33, 27, 5, 5, PAL["red"]); c.put(35, 29, PAL["gold1"])


def resolutions(c):
    for k in range(3):
        c.rect(10 + k * 2, 6 + k * 2, 26, 34, PAL["parchment"] if k < 2 else PAL["cream"])
        c.outline(10 + k * 2, 6 + k * 2, 26, 34, shade(PAL["parchment"], 0.7))
    for y in range(14, 38, 3):
        c.hline(18, y, 14 if y % 2 else 10, PAL["ink"])
    c.hline(18, 11, 12, PAL["red"])


def poster(c):
    c.rect(4, 4, 40, 40, PAL["cream"]); c.outline(4, 4, 40, 40, PAL["parchment"])
    c.rect(8, 8, 32, 6, PAL["red"])
    c.hline(10, 10, 28, PAL["cream"])
    # portrait silhouette
    c.rect(18, 17, 12, 10, PAL["ink"]); c.rect(20, 15, 8, 4, PAL["white"])
    c.rect(16, 27, 16, 6, PAL["blue3"])
    c.hline(8, 36, 32, PAL["ink"]); c.hline(10, 39, 28, PAL["slate"])
    c.rect(36, 34, 6, 6, PAL["gold"])


def hat(c):
    c.rect(8, 30, 32, 5, PAL["ink"]); c.hline(8, 30, 32, PAL["shadow"])
    c.rect(14, 10, 20, 20, PAL["ink"])
    c.rect(15, 9, 18, 2, PAL["shadow"])
    c.vline(16, 12, 17, PAL["shadow"]); c.vline(31, 12, 17, PAL["black"])
    c.rect(14, 25, 20, 3, (110, 70, 40))
    c.rect(14, 24, 20, 1, (150, 100, 60))
    # inner leather band peeking + maker's mark
    c.put(24, 33, PAL["gold"]); c.put(25, 33, PAL["gold1"])


def pipe(c):
    c.rect(8, 30, 14, 10, (200, 180, 150)); c.rect(10, 28, 10, 3, (200, 180, 150))
    c.outline(8, 30, 14, 10, (140, 110, 80))
    c.rect(11, 30, 8, 3, PAL["ink"])
    for i in range(20):
        c.put(22 + i, 34 - i // 2, (200, 180, 150)); c.put(22 + i, 35 - i // 2, (170, 140, 100))
    c.put(41, 24, (120, 90, 60))
    # smoke
    for (x, y) in [(14, 24), (15, 21), (17, 18), (16, 15), (18, 12)]:
        c.put(x, y, PAL["lstone"]); c.put(x + 1, y, PAL["marble"])
    # carved palmetto mark
    c.put(12, 36, PAL["green2"]); c.put(13, 35, PAL["green1"]); c.put(14, 36, PAL["green2"]); c.put(13, 37, PAL["green2"])


def bank_note(c):
    c.rect(4, 14, 40, 22, (206, 214, 190)); c.outline(4, 14, 40, 22, PAL["green2"])
    c.outline(6, 16, 36, 18, PAL["green1"])
    c.rect(10, 19, 8, 8, PAL["green2"]); c.rect(12, 21, 4, 4, (206, 214, 190))
    c.hline(21, 20, 18, PAL["green2"]); c.hline(21, 23, 14, PAL["green1"]); c.hline(21, 26, 16, PAL["green1"])
    c.rect(32, 28, 8, 5, PAL["green2"]); c.hline(33, 30, 6, PAL["gold1"])


def playing_cards(c):
    for k, (x, y) in enumerate([(8, 12), (16, 9), (24, 6)]):
        c.rect(x, y, 16, 24, PAL["white"]); c.outline(x, y, 16, 24, PAL["lstone"])
    c.rect(26, 8, 4, 5, PAL["red"]); c.put(28, 13, PAL["red"])
    c.put(30, 24, PAL["red"]); c.put(31, 23, PAL["red"]); c.put(32, 24, PAL["red"]); c.put(31, 25, PAL["red"])
    c.rect(18, 11, 3, 4, PAL["ink"]); c.put(19, 15, PAL["ink"])
    c.rect(10, 14, 3, 4, PAL["ink"])
    c.rect(6, 36, 36, 6, PAL["green2"])


def check(c):
    c.rect(4, 14, 40, 20, PAL["cream"]); c.outline(4, 14, 40, 20, PAL["parchment"])
    c.hline(8, 18, 12, PAL["ink"])
    c.hline(8, 22, 30, PAL["slate"]); c.hline(8, 25, 24, PAL["slate"])
    c.rect(28, 17, 12, 4, PAL["white"]); c.hline(29, 19, 10, PAL["ink"])
    c.hline(24, 30, 16, PAL["blue2"])
    c.rect(6, 28, 6, 4, PAL["red"])


def whiskey(c):
    c.rect(18, 8, 12, 4, (120, 90, 60)); c.rect(20, 5, 8, 4, PAL["wood3"])
    c.rect(16, 12, 16, 28, (150, 90, 40))
    c.rect(14, 16, 20, 22, (150, 90, 40)); c.outline(14, 16, 20, 22, (100, 60, 30))
    c.vline(17, 18, 18, (200, 140, 70))
    c.rect(18, 24, 12, 8, PAL["cream"]); c.hline(20, 27, 8, PAL["ink"]); c.hline(20, 29, 6, PAL["red"])
    c.rect(14, 38, 20, 3, (100, 60, 30))


def cartoon(c):
    c.rect(4, 4, 40, 40, PAL["cream"]); c.outline(4, 4, 40, 40, PAL["parchment"])
    # crowned king figure with veto scroll, torn constitution underfoot
    c.rect(20, 8, 8, 4, PAL["gold"]); c.put(20, 6, PAL["gold"]); c.put(24, 6, PAL["gold"]); c.put(27, 6, PAL["gold"])
    c.rect(20, 12, 8, 8, PAL["parchment"]); c.put(22, 15, PAL["ink"]); c.put(26, 15, PAL["ink"])
    c.rect(16, 20, 16, 14, PAL["red"]); c.rect(18, 22, 12, 10, shade(PAL["red"], 1.2))
    c.rect(10, 22, 6, 10, PAL["cream"]); c.hline(11, 25, 4, PAL["ink"]); c.hline(11, 28, 4, PAL["ink"])
    c.rect(14, 36, 20, 4, PAL["white"]); c.hline(15, 38, 8, PAL["slate"]); c.put(28, 37, PAL["slate"])
    c.hline(8, 42, 32, PAL["ink"])


def build_all():
    card("address_card", address_card)
    card("resolutions", resolutions)
    card("poster", poster)
    card("hat", hat)
    card("pipe", pipe)
    card("bank_note", bank_note)
    card("playing_cards", playing_cards)
    card("check", check)
    card("whiskey", whiskey)
    card("cartoon", cartoon)
    for n, c in items.items():
        c.save(f"evidence/{n}.png")
    with open(os.path.join(ASSETS, "evidence", "index.json"), "w") as f:
        json.dump(list(items), f)
    return list(items.values())


def ui():
    """Small UI sprites: exclamation marker, interaction arrow, footprint cursor."""
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
    u = ui()
    print(len(cs), "evidence cards")
    print(preview(cs + u, "evidence.png", scale=3))
