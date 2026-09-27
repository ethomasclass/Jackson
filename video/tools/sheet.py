"""Contact sheet of review stills:  python3 tools/sheet.py out.jpg a.jpg b.jpg ...  (3 across, 640 px each)"""
import sys
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
cols, w, h = 3, 640, 360
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w, rows * (h + 22)), "white")
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert("RGB").resize((w, h))
    x, y = (i % cols) * w, (i // cols) * (h + 22)
    sheet.paste(im, (x, y + 22))
    d.text((x + 6, y + 4), f.rsplit("/", 1)[-1], fill="black")
sheet.save(out, quality=85)
