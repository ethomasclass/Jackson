"""Replace the synthesized stand-in sound effects with ElevenLabs sound generation.
Writes the same filenames in public/sfx/, so no scene code changes.

  python3 tools/sfx_eleven.py            # all
  python3 tools/sfx_eleven.py shot boom  # just these
"""
import json, os, subprocess, sys, tempfile, urllib.error, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from voice import FFMPEG, env  # noqa: E402

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "sfx")

SFX = {
    "shot": ("Single antique flintlock pistol shot outdoors in a field: flint click, powder pan fizz, "
             "deep black-powder boom with a short echo off distant trees", 2.5),
    "stamp": ("Heavy wooden printer's block stamped hard onto paper on a wooden table, one dry thud", 0.6),
    "whoosh": "Sheet of thick old paper slid quickly across a wooden desk, soft whoosh",
    "tick": ("Single crisp mechanical clock tick", 0.5),
    "boom": ("Deep cinematic low drum hit with a long reverberant tail, for a title card", 3.5),
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
    with tempfile.NamedTemporaryFile(suffix=".mp3") as f:
        f.write(mp3); f.flush()
        subprocess.run([FFMPEG, "-v", "error", "-y", "-i", f.name, "-ac", "2", "-ar", "44100",
                        os.path.join(OUT, name + ".wav")], check=True)
    print("sfx/", name)


if __name__ == "__main__":
    env()
    names = sys.argv[1:] or list(SFX)
    for n in names:
        spec = SFX[n]
        prompt, secs = spec if isinstance(spec, tuple) else (spec, None)
        generate(n, prompt, secs)
