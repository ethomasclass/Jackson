#!/bin/sh
# Render chapters, join all of them, master once:   tools/render.sh            (every chapter)
#                                                     tools/render.sh 03 07      (re-render only these, then rejoin)
# Writes out/<SLUG>_1080p.mp4 (the YouTube master, -14 LUFS) and renders/<SLUG>_720p.mp4.
cd "$(dirname "$0")/.."
export REMOTION_CHROME=${REMOTION_CHROME:-$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell 2>/dev/null | head -1)}
BROWSER=${REMOTION_CHROME:+--browser-executable=$REMOTION_CHROME}
FF=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
SLUG=$(sed -n "s/^export const SLUG = '\(.*\)';/\1/p" src/project.ts)
ALL=$(grep -o "id: 'Ch[0-9]*'" src/chapters.ts | grep -o '[0-9][0-9]*')
mkdir -p out/ch renders
for n in ${*:-$ALL}; do
  npx remotion render src/index.ts Ch$n out/ch/ch$n.mp4 --crf=18 $BROWSER --log=error || exit 1
  echo "rendered ch$n"
  rm -rf /tmp/remotion-webpack-bundle-*   # each render leaves a ~500 MB copy of public/ behind
done
LIST=out/ch/list.txt; : > $LIST
for n in $ALL; do echo "file '$(pwd)/out/ch/ch$n.mp4'" >> $LIST; done
$FF -v error -y -f concat -safe 0 -i $LIST -c:v copy -c:a pcm_s16le out/full_raw.mkv || exit 1
python3 tools/master.py out/full_raw.mkv out/${SLUG}_1080p.mp4 || exit 1
$FF -v error -y -i out/${SLUG}_1080p.mp4 -vf scale=1280:720 -c:v libx264 -crf 24 -preset slow -c:a aac -b:a 160k -movflags +faststart renders/${SLUG}_720p.mp4 || exit 1
# chapter start times for the YouTube description
python3 - "$LIST" <<'PY'
import re, subprocess, sys, imageio_ffmpeg
t = 0.0
for line in open(sys.argv[1]):
    f = line.split("'")[1]
    d = re.search(r"Duration: (\d+):(\d+):([\d.]+)", subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-i", f], capture_output=True, text=True).stderr)
    print(f"{int(t // 60)}:{int(t % 60):02d}  {f.rsplit('/', 1)[-1]}")
    t += int(d[1]) * 3600 + int(d[2]) * 60 + float(d[3])
print(f"total {int(t // 60)}:{int(t % 60):02d}")
PY
echo "done"
