"""Check scene anchors against a chapter's word timings before (or after) wiring them into a scene.

  python3 tools/anchors.py ch02_example "His supporters" Indiana "to the victors"
  python3 tools/anchors.py ch02_example --src src/ch/Ch02.tsx      # every t.at('...') / at('...') in that file

For each phrase it prints every occurrence with its time and the words around it. t.at(phrase) takes the
FIRST occurrence, so when a phrase appears more than once, check that the first is the one you mean,
or pass the occurrence number: t.at('His supporters', 2). Matching ignores case and punctuation, like the scenes.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())

name, args = sys.argv[1], sys.argv[2:]
words = json.load(open(os.path.join(HERE, "..", "public", "audio", name + ".words.json")))["words"]
toks = [norm(w["w"]) for w in words]
if args[:1] == ["--src"]:
    code = open(args[1]).read()
    found = re.findall(r"\bat\(\s*(['\"])(.+?)\1\s*(?:,\s*(\d+))?\s*\)", code)
    phrases = sorted({(p, int(n) if n else 1) for _, p, n in found})
else:
    phrases = [(p, 1) for p in args]
bad = 0
for p, want in phrases:
    q = [norm(x) for x in p.split()]
    hits = [i for i in range(len(toks) - len(q) + 1) if toks[i:i + len(q)] == q]
    flag = "MISSING" if len(hits) < want else ("check: repeats" if len(hits) > 1 else "ok")
    bad += flag == "MISSING"
    print(f"{p!r} (occurrence {want}): {len(hits)} found  {flag}")
    for k, i in enumerate(hits, 1):
        ctx = " ".join(w["w"] for w in words[max(0, i - 4):i + len(q) + 4])
        print(f"   {'->' if k == want else '  '} #{k} {words[i]['s']:7.2f}s  ...{ctx}...")
sys.exit(1 if bad else 0)
