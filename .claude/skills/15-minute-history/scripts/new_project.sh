#!/bin/sh
# Start a new 15 Minute History video from the template.
#   sh <skill>/scripts/new_project.sh <target-dir> [Slug_For_Files]
# Copies the starter project (kit, tools, fonts, sfx, title sting, 1836 map, demo portrait + mask), writes
# placeholder narration for the two example chapters so it previews at once, and installs node packages.
set -e
SKILL=$(cd "$(dirname "$0")/.." && pwd)
DEST=${1:?usage: new_project.sh <target-dir> [Slug]}
SLUG=${2:-My_Video}
if [ -e "$DEST/src" ]; then echo "$DEST already has a src/ folder; not overwriting" >&2; exit 1; fi
mkdir -p "$DEST"
cp -R "$SKILL/assets/template/." "$DEST/"
mv "$DEST/gitignore.txt" "$DEST/.gitignore"
mv "$DEST/env.example.txt" "$DEST/.env.example"
sed -i.bak "s/^export const SLUG = '.*';/export const SLUG = '$SLUG';/" "$DEST/src/project.ts" && rm -f "$DEST/src/project.ts.bak"
chmod +x "$DEST"/tools/*.sh
cd "$DEST"
python3 tools/fake_voice.py --all
if [ -z "$NO_INSTALL" ]; then npm install --no-audit --no-fund --loglevel=error; fi
echo "ready: $DEST  (npx remotion studio to preview; see the skill's SKILL.md for the workflow)"
