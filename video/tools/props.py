"""Split Gemini prop sheets (tools/gemini_image.py) into separate cut-out props: public/v2/props/<name>_<i>.png

  smoke_puffs          green-screen sheet -> each cloud keeps its own painted edge
  sailor_silhouettes   black silhouettes lifted off whatever was painted around them, mounted on
                       a scissor-cut cream card margin like the puppets
"""
import os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HERE, "..", "public", "img", "v2", "gen")
OUT = os.path.join(HERE, "..", "public", "v2", "props")
CARD = (246, 238, 218)


def blobs(mask, n):
    lab, k = ndimage.label(mask)
    sizes = ndimage.sum(mask, lab, range(1, k + 1))
    keep = np.argsort(sizes)[::-1][:n] + 1
    boxes = [(ndimage.find_objects((lab == i).astype(int))[0], i) for i in keep]
    return sorted(boxes, key=lambda b: (b[0][1].start // 400, b[0][1].start)), lab


def save(img, name):
    os.makedirs(OUT, exist_ok=True)
    img.crop(img.getbbox()).save(os.path.join(OUT, name + ".png"))
    print("v2/props/" + name + ".png", img.getbbox())


def smoke():
    im = Image.open(os.path.join(GEN, "smoke_puffs.png")).convert("RGB")
    a = np.asarray(im).astype(int)
    fg = ~((a[..., 1] > a[..., 0] + 60) & (a[..., 1] > a[..., 2] + 60))
    fg = ndimage.binary_fill_holes(ndimage.binary_opening(fg, iterations=2))
    boxes, lab = blobs(fg, 4)
    for j, ((ys, xs), i) in enumerate(boxes):
        m = Image.fromarray(((lab == i) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
        rgba = im.convert("RGBA"); rgba.putalpha(m)
        save(rgba.crop((xs.start - 4, ys.start - 4, xs.stop + 4, ys.stop + 4)), f"smoke_{j}")


def sailors():
    im = Image.open(os.path.join(GEN, "sailor_silhouettes.png")).convert("RGB")
    a = np.asarray(im).astype(int)
    dark = (a.max(axis=2) < 60)
    dark = ndimage.binary_opening(dark, iterations=7)  # erase ink linework, keep solid figures
    boxes, lab = blobs(dark, 4)
    for j, ((ys, xs), i) in enumerate(boxes):
        sil = (lab == i)[ys.start:ys.stop, xs.start:xs.stop]
        pad = 24
        m = Image.fromarray(np.pad(sil, pad).astype(np.uint8) * 255)
        card = m.filter(ImageFilter.MaxFilter(15)).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(8)).point(lambda v: 255 if v > 90 else 0)
        out = Image.new("RGBA", m.size, CARD + (0,))
        out.paste(Image.new("RGBA", m.size, CARD + (255,)), (0, 0), card.filter(ImageFilter.GaussianBlur(0.8)))
        out.paste(Image.new("RGBA", m.size, (22, 18, 16, 255)), (0, 0), m.filter(ImageFilter.GaussianBlur(0.7)))
        save(out, f"sailor_{j}")


if __name__ == "__main__":
    smoke()
    sailors()
