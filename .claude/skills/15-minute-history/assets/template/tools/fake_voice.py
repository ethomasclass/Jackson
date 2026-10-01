"""Placeholder narration: silent audio + evenly paced word timings, so scenes can be built and previewed
before the real voice exists (and without an ElevenLabs key).

  python3 tools/fake_voice.py script/ch02_example.txt ch02_example        # one chapter
  python3 tools/fake_voice.py --all                                        # every script/ch*.txt

Writes public/audio/<name>.wav and <name>.words.json in the same format as tools/voice.py, at the channel's
locked pace (~185 words a minute with 0.35 s between paragraphs). Every t.at('phrase') anchor works the same,
so when the real voice replaces it, the scenes re-time themselves. Never ship a render made from this.
"""
import glob, json, os, sys, wave

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from voice import parse_marks, spoken  # noqa: E402

OUT = os.path.join(HERE, "..", "public", "audio")
RATE = 8000            # silent placeholder, kept small
WPM = float(os.environ.get("FAKE_WPM", "185"))
LEAD_IN, PARA_GAP, SENT_GAP = 0.4, 0.35, 0.12


def fake(src, name):
    paras = [parse_marks(p.strip()) for p in open(src).read().split("\n\n") if p.strip()]
    per_word = 60 / WPM
    t, words = LEAD_IN, []
    for text, kinds in paras:
        for w, k in zip(text.split(), kinds):
            n = max(1, len(spoken(w).split()))          # "1806" is three spoken words
            d = per_word * n * (0.75 + 0.05 * min(len(w), 10))
            item = {"w": w, "s": round(t, 3), "e": round(t + d * 0.85, 3)}
            if k:
                item["k"] = k
            words.append(item)
            t += d + (SENT_GAP if w[-1] in ".?!" else 0)
        words[-1]["para_end"] = True
        t += PARA_GAP
    os.makedirs(OUT, exist_ok=True)
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(RATE); f.writeframes(b"\0\0" * int(RATE * t))
    json.dump({"voice": "placeholder", "duration": round(t, 3), "words": words}, open(os.path.join(OUT, name + ".words.json"), "w"), indent=0)
    print(f"placeholder {name}: {t:.1f}s, {len(words)} words")


if __name__ == "__main__":
    if sys.argv[1:] == ["--all"]:
        for f in sorted(glob.glob(os.path.join(HERE, "..", "script", "ch*.txt"))):
            fake(f, os.path.basename(f)[:-4])
    else:
        fake(sys.argv[1], sys.argv[2])
