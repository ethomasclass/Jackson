#!/bin/sh
# Voice every chapter at the channel's locked pace:   tools/voice_all.sh            (all)
#                                                       tools/voice_all.sh 04 07      (just these)
# HEAVY="10 11" tools/voice_all.sh  voices those chapters slower, with longer pauses (suffering, the ending).
cd "$(dirname "$0")/.."
for f in script/ch*.txt; do
  num=$(basename "$f" | sed 's/^ch\([0-9]*\).*/\1/')
  [ -n "$*" ] && ! echo " $* " | grep -q " $num " && continue
  n=$(basename "$f" .txt)
  if echo " $HEAVY " | grep -q " $num "; then
    export VOICE_MAX_PAUSE=0.35 VOICE_SENT_GAP=0.05 VOICE_PARA_GAP=0.55 VOICE_STRETCH=1.08
  else
    export VOICE_MAX_PAUSE=0.25 VOICE_SENT_GAP=0 VOICE_PARA_GAP=0.35 VOICE_STRETCH=1.15
  fi
  echo "== $n (stretch $VOICE_STRETCH)"
  python3 tools/voice.py "$f" "$n" 2>&1 | tail -1 || exit 1
done
