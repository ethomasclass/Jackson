#!/bin/sh
# Render every King Andrew chapter, join them, master once:  tools/render_v3.sh [01 02 ...]
cd "$(dirname "$0")/.."
export REMOTION_CHROME=${REMOTION_CHROME:-$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell | head -1)}
FF=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
mkdir -p out/v3
CH=${*:-"01 02 03 04 05 06 07 08 09 10 11"}
for n in $CH; do
  npx remotion render src/index.ts V3-Ch$n out/v3/ch$n.mp4 --crf=18 --browser-executable=$REMOTION_CHROME --log=error || exit 1
  echo "rendered ch$n"
  rm -rf /tmp/remotion-webpack-bundle-*   # each render leaves a ~500 MB copy of public/ behind
done
LIST=out/v3/list.txt; : > $LIST
for n in 01 02 03 04 05 06 07 08 09 10 11; do echo "file '$(pwd)/out/v3/ch$n.mp4'" >> $LIST; done
$FF -v error -y -f concat -safe 0 -i $LIST -c:v copy -c:a pcm_s16le out/v3/full_raw.mkv || exit 1
python3 tools/master.py out/v3/full_raw.mkv out/v3/King_Andrew_1080p.mp4 || exit 1
$FF -v error -y -i out/v3/King_Andrew_1080p.mp4 -vf scale=1280:720 -c:v libx264 -crf 24 -preset slow -c:a aac -b:a 160k -movflags +faststart renders/King_Andrew_720p.mp4 || exit 1
echo "done"
