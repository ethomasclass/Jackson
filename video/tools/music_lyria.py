"""Music cues from Google Lyria via the Gemini API: public/music/v2/<name>.mp3 (+ .wav, gitignored).
About $0.08 per full-length cue and $0.04 per 30 s clip, billed to the Gemini key, so every
scene can have its own score and ElevenLabs credits are left for the narration.

  python3 tools/music_lyria.py calm_sea
"""
import base64, json, os, subprocess, sys, urllib.error, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from voice import FFMPEG, env  # noqa: E402

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "music", "v2")

BED = ("Instrumental only, no vocals. Documentary underscore for a classroom history video staged as a "
       "19th-century paper toy theater; leave space in the midrange for a narrator; no drum kit, no synths, "
       "no modern pop production.")

# name: (model, prompt)
CUES = {
    "calm_sea": ("lyria-3.5",
                 "A 70-second cue. Calm, open, slightly uneasy morning at sea, June 1807: a small theater-pit "
                 "orchestra - gently rocking 6/8 low strings like swells, a solo wooden flute with a simple "
                 "sea-shanty-like phrase, soft harp, creaking-rope textures from col legno strings. After about "
                 "30 seconds a low cello ostinato creeps in and the harmony darkens as a threat approaches. "
                 "End on a held, unresolved minor chord. " + BED),
    "aftermath": ("lyria-3.5",
                  "A 60-second cue. The aftermath of a sudden naval attack, 1807: low sustained strings, a "
                  "distant muffled field drum like a heartbeat, a mournful solo fiddle line, sparse and grave. "
                  "In the second half it turns quietly questioning and builds tension toward something larger, "
                  "with a slow crescendo in the strings and a soft snare roll. " + BED),
    "frontier": ("lyria-3.5",
                 "A 95-second cue for the story of the Shawnee leader Tecumseh and his brother, Indiana Territory, "
                 "1805-1811: dignified and serious, a slow solo cello and a low wooden flute over sustained strings, "
                 "a soft, steady deep drum like a heartbeat; builds to urgency and alarm in the middle for a dawn battle, "
                 "then falls to a grieving, burnt-out quiet. Respectful, no stereotypes, no chanting. " + BED),
    "sea_battle": ("lyria-3.5",
                   "A 75-second cue: a heroic, swashbuckling 1812 naval battle for a toy theater: brisk strings, "
                   "brass fanfares, fife, field drums and timpani like cannon fire, a triumphant cheering ending. " + BED),
    "fire": ("lyria-3.5",
             "A 90-second cue: the night the British burned Washington, 1814. Opens urgent and anxious (hurried "
             "tremolo strings, a ticking clock pulse), a tender quiet interlude for saving a treasured painting, then "
             "dark and heavy as flames rise: low brass, timpani rolls, a descending minor theme. " + BED),
    "dawn": ("lyria-3.5",
             "A 65-second cue: night bombardment of a harbour fort, 1814: low rumbling timpani and anxious strings "
             "waiting in the dark, then a slow sunrise swell into a warm, noble, hopeful chorale for brass and strings "
             "as a flag is revealed still flying. " + BED),
    "title_fanfare": ("lyria-3-clip-preview",
                      "A short theatrical overture flourish for the title card of a toy-theater play: bright "
                      "brass fanfare, fife and field drums playing a martial 1812-era march phrase, cymbal crash, "
                      "then a big final chord that rings out. Instrumental only, no vocals."),
}


def generate(name):
    model, prompt = CUES[name]
    body = {"model": model, "input": prompt}
    req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/interactions",
                                 data=json.dumps(body).encode(), method="POST",
                                 headers={"x-goog-api-key": os.environ["GEMINI_API_KEY"], "Content-Type": "application/json"})
    try:
        r = json.loads(urllib.request.urlopen(req, timeout=600).read())
    except urllib.error.HTTPError as e:
        sys.exit(f"Lyria {e.code}: {e.read().decode()[:600]}")
    audio = []

    def walk(o):
        if isinstance(o, dict):
            if o.get("type") == "audio" and "data" in o:
                audio.append(o)
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    walk(r)
    if not audio:
        sys.exit(f"no audio in response: {json.dumps(r)[:600]}")
    os.makedirs(OUT, exist_ok=True)
    ext = "wav" if "wav" in audio[0].get("mime_type", "") else "mp3"
    raw = os.path.join(OUT, f"{name}.raw.{ext}")
    open(raw, "wb").write(base64.b64decode(audio[0]["data"]))
    mp3 = os.path.join(OUT, name + ".mp3")
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", raw, "-ar", "44100", "-ac", "2", "-b:a", "192k", mp3], check=True)
    os.remove(raw)
    dur = subprocess.run([FFMPEG, "-i", mp3], capture_output=True, text=True).stderr.split("Duration: ")[1][:11]
    print(f"music/v2/{name}.mp3  {dur}")


if __name__ == "__main__":
    env()
    for n in sys.argv[1:] or list(CUES):
        generate(n)
