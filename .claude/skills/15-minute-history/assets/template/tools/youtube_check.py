"""Check review/YouTube_description.md against YouTube's limits before the user pastes it in.

  python3 tools/youtube_check.py [review/YouTube_description.md]

The file holds three fenced blocks in order: title, description, tags (comma-separated). Checks: title under 70
(YouTube's limit is 100; past ~70 it gets cut off in search), description under 5,000, tags under 500 counted
YouTube's way (a tag with a space counts 2 extra for the quotes YouTube adds, plus the commas), chapter list starts
at 0:00 with 3+ entries at least 10 s apart, and at most 3 hashtags at the end (the first three show above the title).
"""
import re, sys

path = sys.argv[1] if len(sys.argv) > 1 else "review/YouTube_description.md"
blocks = re.findall(r"```[a-z]*\n(.*?)```", open(path).read(), re.S)
title, desc, tags = blocks[0].strip(), blocks[1], blocks[2].strip()
tag_list = [t.strip() for t in tags.split(",") if t.strip()]
tag_len = sum(len(t) + (2 if " " in t else 0) for t in tag_list) + len(tag_list) - 1
stamps = [m for m in re.findall(r"^(\d+):(\d\d)\b", desc, re.M)]
secs = [int(m) * 60 + int(s) for m, s in stamps]
hashtags = re.findall(r"(?<!\w)#\w+", desc)

ok = True
def check(cond, msg):
    global ok
    print(("ok    " if cond else "FIX   ") + msg)
    ok &= cond

check(len(title) <= 70, f"title {len(title)} characters (≤ 70)")
check(len(desc) <= 5000, f"description {len(desc)} characters (≤ 5,000)")
check(tag_len <= 500, f"tags {tag_len} characters YouTube's way, {len(tag_list)} tags (≤ 500)")
check(bool(secs) and secs[0] == 0 and len(secs) >= 3 and all(b - a >= 10 for a, b in zip(secs, secs[1:])),
      f"chapters: {len(secs)} timestamps, first at 0:00, each ≥ 10 s apart")
check(len(hashtags) <= 3, f"hashtags: {len(hashtags)} (≤ 3 recommended)")
sys.exit(0 if ok else 1)
