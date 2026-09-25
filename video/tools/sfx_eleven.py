"""Replace the synthesized stand-in sound effects with ElevenLabs sound generation.
Writes the same filenames in public/sfx/, so no scene code changes.

  python3 tools/sfx_eleven.py            # all
  python3 tools/sfx_eleven.py shot boom  # just these
  python3 tools/sfx_eleven.py --finish   # re-trim/normalise the saved originals (free)
"""
import json, os, re, subprocess, sys, urllib.error, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from voice import FFMPEG, env  # noqa: E402

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "sfx")
RAW = os.path.join(OUT, "raw")

SFX = {
    # cold open
    "shot": ("Cinematic antique black-powder pistol gunshot outdoors: a huge deep boom followed by a long "
             "rolling echo that reverberates across an open valley for several seconds. Film sound design, "
             "heavy low end, no music, no voices.", 4.0),
    "stamp": ("Loud close-up impact: a heavy rubber stamp slammed hard onto a wooden desk through paper. "
              "One punchy thump, clearly audible, no reverb.", 0.8),
    "whoosh": ("A thick sheet of old paper sliding fast across a wooden desk, a soft papery swoosh.", 1.0),
    "tick": ("A single crisp tick of an antique pocket watch, close up.", 0.5),
    "boom": ("Deep cinematic low drum and orchestral bass hit for a documentary title card, with a long "
             "dark reverberant tail.", 4.0),
    # scene 2
    "crickets": ("Loud, clear, close-up field crickets chirping steadily, the classic comedic "
                 "awkward-silence cricket sound effect.", 3.0),
    "quill": ("A dip pen quill scratching quickly across parchment, writing one short word, close up.", 1.5),
    "crowd_cheer": ("A small nineteenth-century crowd outdoors cheering and applauding politely, distant.", 3.0),
    "page_turn": ("A single page of an old book turned quickly, crisp paper flip.", 0.8),
    "gavel": ("A single wooden gavel strike on a sound block in a large hall.", 1.2),
}


def generate(name, prompt, seconds=None):
    body = {"text": prompt, "prompt_influence": 0.55}
    if seconds:
        body["duration_seconds"] = seconds
    req = urllib.request.Request("https://api.elevenlabs.io/v1/sound-generation", data=json.dumps(body).encode(),
                                 headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"],
                                          "Content-Type": "application/json"}, method="POST")
    try:
        mp3 = urllib.request.urlopen(req, timeout=180).read()
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs {e.code}: {e.read().decode()[:400]}")
    os.makedirs(RAW, exist_ok=True)
    open(os.path.join(RAW, name + ".mp3"), "wb").write(mp3)   # keep the paid-for original
    finish(name)


def finish(name):
    """Trim leading silence so the hit lands on its frame, then normalise the peak to -2 dBFS."""
    src = os.path.join(RAW, name + ".mp3")
    dst = os.path.join(OUT, name + ".wav")
    trim = "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.01"
    probe = subprocess.run([FFMPEG, "-hide_banner", "-i", src, "-af", trim + ",volumedetect", "-f", "null", "-"],
                           capture_output=True, text=True).stderr
    m = re.search(r"max_volume: ([-0-9.]+) dB", probe)
    if not m:
        sys.exit(f"{name}: nothing above -50 dB; regenerate it with a different prompt")
    peak = float(m.group(1))
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", src, "-af", f"{trim},volume={-2 - peak}dB",
                    "-ac", "2", "-ar", "44100", dst], check=True)
    print(f"sfx/ {name}  (peak {peak:.1f} dB -> -2 dB)")


if __name__ == "__main__":
    env()
    if sys.argv[1:2] == ["--finish"]:          # re-process saved originals, no credits
        for n in sys.argv[2:] or list(SFX):
            finish(n)
        sys.exit()
    names = sys.argv[1:] or list(SFX)
    for n in names:
        spec = SFX[n]
        prompt, secs = spec if isinstance(spec, tuple) else (spec, None)
        generate(n, prompt, secs)
