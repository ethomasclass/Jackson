#!/bin/sh
# Voice every King Andrew chapter at the Fix Everything pace (same settings as that project's
# voice_all.sh). The heavy chapter (Indian Removal) and the ending run slower with looser pauses.
cd "$(dirname "$0")/.."
for f in script/v3/ch*.txt; do
  n=v3_$(basename "$f" .txt)
  case "$n" in
    v3_ch10_*|v3_ch11_*) export VOICE_MAX_PAUSE=0.35 VOICE_SENT_GAP=0.05 VOICE_PARA_GAP=0.55 VOICE_STRETCH=1.08 ;;
    *)                   export VOICE_MAX_PAUSE=0.25 VOICE_SENT_GAP=0    VOICE_PARA_GAP=0.35 VOICE_STRETCH=1.15 ;;
  esac
  echo "== $n (stretch $VOICE_STRETCH)"
  python3 tools/voice.py "$f" "$n" 2>&1 | tail -1 || exit 1
done
