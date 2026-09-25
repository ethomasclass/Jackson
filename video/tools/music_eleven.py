"""Music cues from ElevenLabs Music, one per scene, saved to public/music/<name>.mp3 (+ a local .wav).
Music costs roughly 850 credits per minute, so cues are short and reused rather than wall-to-wall.

  python3 tools/music_eleven.py cold_open
"""
import json, os, subprocess, sys, urllib.error, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from voice import FFMPEG, env  # noqa: E402

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "music")

# Every cue is instrumental, sparse in the narration's frequency range, and period-flavoured
# (fiddle, cello, fife, snare, piano-forte) without being a pastiche.
CUES = {
    "cold_open": ("Tense, restrained documentary underscore for a history explainer about an 1806 pistol duel "
                  "in Tennessee. Low solo cello and string drones, sparse plucked pizzicato, a soft ticking "
                  "pulse, distant frame drum heartbeat, a lonely fiddle line. Slow build of suspense, then a "
                  "held, unresolved chord. Instrumental only, no vocals, leaves room for a narrator.", 62000),
    "good_feelings": ("Light, warm, slightly wry documentary underscore for a history explainer about the calm "
                      "'Era of Good Feelings' in 1820s America. Gentle plucked strings, a lilting parlor "
                      "fiddle melody, soft fife, piano-forte, a relaxed walking pulse; pleasant and a little "
                      "too cozy, with a faint hint of mischief near the end. Instrumental only, no vocals, "
                      "leaves room for a narrator.", 90000),
}


def generate(name):
    prompt, ms = CUES[name]
    body = {"prompt": prompt, "music_length_ms": ms, "force_instrumental": True}
    req = urllib.request.Request("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128",
                                 data=json.dumps(body).encode(), method="POST",
                                 headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"],
                                          "Content-Type": "application/json"})
    try:
        mp3 = urllib.request.urlopen(req, timeout=600).read()
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs music {e.code}: {e.read().decode()[:500]}")
    os.makedirs(OUT, exist_ok=True)
    src = os.path.join(OUT, name + ".mp3")
    open(src, "wb").write(mp3)
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", src, "-ar", "44100", "-ac", "2",
                    os.path.join(OUT, name + ".wav")], check=True)
    print("music/", name)


if __name__ == "__main__":
    env()
    for n in sys.argv[1:] or list(CUES):
        generate(n)
