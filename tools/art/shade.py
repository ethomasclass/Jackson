"""Automatic hi-bit shading for sprites built from material maps.

A sprite is authored as a grid of material letters (skin, coat, hair ...). This
module turns that into shaded pixels: each material gets a 5-tone ramp, light
comes from the upper-left, pixels near a material's left/top edge lighten,
near the right/bottom edge darken, and outlines are *selective* — the darkest
tone of the material itself rather than black, lighter where the light hits.
"""
from common import shade, mix

LIGHT = (255, 244, 220)


def ramp5(base):
    """dark outline, shadow, mid, light, highlight"""
    return [shade(base, 0.42), shade(base, 0.68), base, mix(base, LIGHT, 0.22), mix(base, LIGHT, 0.45)]


def material_map(rows, key):
    """rows: list of strings; key: char -> material name (or None for transparent).
    Outline chars ('o') are re-assigned to the material of their most common
    neighbour so outlines take that material's darkest tone."""
    h, w = len(rows), max(len(r) for r in rows)
    grid = [[None] * w for _ in range(h)]
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            if ch in ". ":
                continue
            grid[y][x] = key.get(ch, "outline")
    # resolve outline pixels
    changed = True
    while changed:
        changed = False
        for y in range(h):
            for x in range(w):
                if grid[y][x] == "outline":
                    counts = {}
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < w and 0 <= ny < h and grid[ny][nx] not in (None, "outline"):
                            nm = grid[ny][nx]
                            nm = nm[1] if isinstance(nm, tuple) else nm
                            counts[nm] = counts.get(nm, 0) + (2 if dx == 0 or dy == 0 else 1)
                    if counts:
                        grid[y][x] = ("edge", max(counts, key=counts.get))
                        changed = True
    for y in range(h):
        for x in range(w):
            if grid[y][x] == "outline":
                grid[y][x] = None
    return grid


def render(grid, ramps, canvas, ox=0, oy=0, edge_light=True):
    """Paint a material grid with automatic shading onto canvas."""
    h, w = len(grid), len(grid[0])

    def mat(x, y):
        if 0 <= x < w and 0 <= y < h:
            g = grid[y][x]
            if g is None:
                return None
            return g[1] if isinstance(g, tuple) else g
        return None

    def is_edge(x, y):
        g = grid[y][x]
        return isinstance(g, tuple)

    # per-material horizontal spans per row and vertical spans per column
    for y in range(h):
        for x in range(w):
            m = mat(x, y)
            if m is None:
                continue
            ramp = ramps[m]
            # find row span of this material
            x0 = x
            while x0 - 1 >= 0 and mat(x0 - 1, y) == m:
                x0 -= 1
            x1 = x
            while x1 + 1 < w and mat(x1 + 1, y) == m:
                x1 += 1
            span = max(1, x1 - x0)
            u = (x - x0) / span if span else 0.5
            y0 = y
            while y0 - 1 >= 0 and mat(x, y0 - 1) == m:
                y0 -= 1
            y1 = y
            while y1 + 1 < h and mat(x, y1 + 1) == m:
                y1 += 1
            vspan = max(1, y1 - y0)
            v = (y - y0) / vspan if vspan else 0.5
            tone = 2
            if u < 0.22:
                tone = 3
            if u < 0.08 and v < 0.5:
                tone = 4
            if u > 0.74:
                tone = 1
            if v > 0.86:
                tone = min(tone, 1)
            if v < 0.1 and u < 0.6:
                tone = max(tone, 3)
            # selective outline
            if is_edge(x, y):
                left_or_top = (mat(x - 1, y) is None or mat(x, y - 1) is None) and not (mat(x + 1, y) is None or mat(x, y + 1) is None)
                tone = 1 if (left_or_top and edge_light) else 0
            else:
                # inner boundary between materials: darken the lower/right side a touch
                if mat(x, y + 1) not in (m, None) and mat(x, y + 1) is not None:
                    tone = min(tone, 1)
            canvas.put(ox + x, oy + y, ramp[tone])
