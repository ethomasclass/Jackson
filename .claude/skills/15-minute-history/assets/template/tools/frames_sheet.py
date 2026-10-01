"""Check a finished render: grab frames at chosen seconds and lay them out 3 across in one contact sheet.

  python3 tools/frames_sheet.py out/ch/ch05.mp4 out/check.jpg 12 18 40.5      # seconds into that chapter file
  python3 tools/frames_sheet.py out/My_Video_1080p.mp4 out/check.jpg 61 250  # or into the full video

Use it after a render to look at the moments the text probe flagged, new graphics, and anything a viewer reported.
"""
import os, subprocess, sys, tempfile
import imageio_ffmpeg
from PIL import Image, ImageDraw

src, out, secs = sys.argv[1], sys.argv[2], sys.argv[3:]
FF = imageio_ffmpeg.get_ffmpeg_exe()
w, h, cols = 640, 360, 3
rows = (len(secs) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w, rows * (h + 22)), "white")
d = ImageDraw.Draw(sheet)
with tempfile.TemporaryDirectory() as tmp:
    for i, s in enumerate(secs):
        f = os.path.join(tmp, f"{i}.jpg")
        subprocess.run([FF, "-v", "error", "-y", "-ss", s, "-i", src, "-frames:v", "1", "-vf", f"scale={w}:{h}", f], check=True)
        x, y = (i % cols) * w, (i // cols) * (h + 22)
        sheet.paste(Image.open(f), (x, y + 22))
        d.text((x + 6, y + 4), f"{os.path.basename(src)} @ {s}s", fill="black")
sheet.save(out, quality=85)
print("wrote", out)
