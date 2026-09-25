"""Narration: script text -> public/audio/<name>.mp3 + <name>.words.json (word-level timing).

  python3 tools/voice.py script/v1_cold_open.txt v1_cold_open            # ElevenLabs (needs ELEVENLABS_API_KEY, VOICE_ID)
  python3 tools/voice.py script/v1_cold_open.txt v1_cold_open --piper    # offline stand-in voice

Paragraphs are voiced one at a time (ElevenLabs gets the neighbouring paragraphs as context so the
delivery stays continuous) and joined with a short pause. The scenes are timed off the words.json,
so swapping the voice re-times the whole video without touching the animation code.
"""
import base64, hashlib, json, os, re, subprocess, sys, tempfile, urllib.request, wave

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "public", "audio")
try:
    import imageio_ffmpeg                      # pip install imageio-ffmpeg (full static build)
    FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
except ImportError:
    FFMPEG = "ffmpeg"
RATE = 44100
PARA_GAP = 0.9    # seconds of silence between paragraphs
SENT_GAP = 0.45   # extra breath added after each sentence inside a paragraph
LEAD_IN = 0.4     # silence before the first word
SPEED = float(os.environ.get("VOICE_SPEED", "0.9"))  # ElevenLabs speed, 0.7-1.2
STRETCH = float(os.environ.get("VOICE_STRETCH", "1.0"))  # local pitch-preserving tempo; <1 is slower (v2 ignores SPEED; try 0.93)
CACHE = os.path.join(OUT, "cache")

# Spoken forms for words the voices tend to misread. Keys are matched as whole words.
PRONOUNCE = {"Floride": "Flo-reed", "1806": "eighteen oh-six", "1820": "eighteen twenty",
             "1824": "eighteen twenty-four", "1828": "eighteen twenty-eight", "1829": "eighteen twenty-nine",
             "1831": "eighteen thirty-one"}


def spoken(text):
    for k, v in PRONOUNCE.items():
        text = re.sub(rf"\b{re.escape(k)}\b", v, text)
    return text


def env():
    for p in (os.path.join(HERE, "..", ".env"), os.environ.get("VOICE_ENV", "")):
        if p and os.path.exists(p):
            for line in open(p):
                if "=" in line and not line.startswith("#"):
                    k, v = line.strip().split("=", 1)
                    os.environ.setdefault(k, v)


def eleven(text, prev, nxt):
    """Returns (pcm16 mono bytes at RATE, [(char, start, end)])."""
    voice = os.environ["VOICE_ID"]
    model = os.environ.get("ELEVEN_MODEL", "eleven_v3")
    if model.startswith("eleven_v3"):
        # v3: most expressive model; stability is one of 0.0 creative / 0.5 natural / 1.0 robust,
        # and it does not accept neighbouring-paragraph context yet.
        body = {"text": text, "model_id": model,
                "voice_settings": {"stability": 0.5, "similarity_boost": 0.85, "speed": SPEED}}
    else:
        body = {"text": text, "model_id": model, "previous_text": prev, "next_text": nxt,
                "voice_settings": {"stability": 0.45, "similarity_boost": 0.85, "style": 0.15,
                                   "use_speaker_boost": True, "speed": SPEED}}
    # Responses are cached by request body so re-running (e.g. to change pauses) spends no credits.
    key = hashlib.sha1(json.dumps([voice, body], sort_keys=True).encode()).hexdigest()[:16]
    cached = os.path.join(CACHE, key + ".json")
    if os.path.exists(cached):
        return decode(json.load(open(cached)))
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128",
        data=json.dumps(body).encode(), method="POST",
        headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
    try:
        r = json.loads(urllib.request.urlopen(req, timeout=300).read())
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs {e.code}: {e.read().decode()[:400]}")
    os.makedirs(CACHE, exist_ok=True)
    json.dump(r, open(cached, "w"))
    return decode(r)


def decode(r):
    a = r["alignment"]
    chars = list(zip(a["characters"], a["character_start_times_seconds"], a["character_end_times_seconds"]))
    # MP3 works on every plan (raw PCM needs Pro); decode it to PCM here
    pcm = subprocess.run([FFMPEG, "-v", "error", "-f", "mp3", "-i", "-", "-af", f"atempo={STRETCH}",
                          "-f", "s16le", "-ac", "1", "-ar", str(RATE), "-"],
                         input=base64.b64decode(r["audio_base64"]), capture_output=True, check=True).stdout
    return pcm, [(c, s / STRETCH, e / STRETCH) for c, s, e in chars]


def piper(text):
    """Stand-in voice. Piper gives no timestamps, so each sentence is voiced separately and its
    duration is spread over its characters."""
    model = os.environ.get("PIPER_MODEL")
    pcm, chars, t = b"", [], 0.0
    for sent in re.findall(r"[^.?!]+[.?!]*\s*", text):
        with tempfile.NamedTemporaryFile(suffix=".wav") as f:
            subprocess.run(["python3", "-m", "piper", "-m", model, "-f", f.name, "--length-scale", "1.08",
                            "--sentence-silence", "0"], input=sent.strip().encode(), check=True,
                           capture_output=True)
            raw = subprocess.run([FFMPEG, "-v", "error", "-i", f.name, "-f", "s16le", "-ac", "1", "-ar",
                                  str(RATE), "-"], capture_output=True, check=True).stdout
        dur = len(raw) / 2 / RATE
        n = len(sent)
        for i, c in enumerate(sent):
            chars.append((c, t + 0.05 + (dur - 0.1) * i / n, t + 0.05 + (dur - 0.1) * (i + 1) / n))
        pcm += raw + b"\0\0" * int(RATE * 0.22)
        t += dur + 0.22
    return pcm, chars


def add_pauses(pcm, chars, gap):
    """Insert `gap` seconds of silence after every sentence that is followed by more speech,
    cutting halfway between the sentence's last sound and the next word, and shift timings."""
    out, shifted, prev_cut, shift = b"", [], 0, 0.0
    cuts = []
    for i, (c, s, e) in enumerate(chars):
        if c in ".?!" and i + 1 < len(chars) and chars[i + 1][0].isspace():
            nxt = next((cs for cc, cs, ce in chars[i + 1:] if not cc.isspace()), None)
            if nxt is not None:
                cuts.append((i, (e + nxt) / 2))
    ci = 0
    for i, (c, s, e) in enumerate(chars):
        shifted.append((c, s + shift, e + shift))
        if ci < len(cuts) and cuts[ci][0] == i:
            cut = int(cuts[ci][1] * RATE) * 2
            out += pcm[prev_cut:cut] + b"\0\0" * int(RATE * gap)
            prev_cut, shift, ci = cut, shift + int(RATE * gap) / RATE, ci + 1
    return out + pcm[prev_cut:], shifted


def words_from_chars(display, chars, offset):
    """Map timings of the spoken text back onto the words of the display text.
    Words are compared by index, so PRONOUNCE substitutions must keep a 1:1 word count or be
    listed as multi-word; we align by walking both word lists."""
    spoken_words, cur, start = [], "", None
    for c, s, e in chars:
        if c.isspace():
            if cur:
                spoken_words.append((cur, start, last))
            cur, start = "", None
        else:
            if start is None:
                start = s
            cur += c
            last = e
    if cur:
        spoken_words.append((cur, start, last))
    disp = display.split()
    out, j = [], 0
    for w in disp:
        n = len(spoken(w).split())   # a year like 1806 becomes 3 spoken words
        grp = spoken_words[j:j + n]
        j += n
        out.append({"w": w, "s": round(grp[0][1] + offset, 3), "e": round(grp[-1][2] + offset, 3)})
    return out


def parse_marks(para):
    """Strip emphasis markup. *key idea* and {vocab term} may span several words.
    Returns (plain text, [None|'key'|'vocab'] per word)."""
    words, kinds, state = [], [], None
    for tok in para.split():
        kind = state
        if tok.startswith("*"): kind = state = "key"
        elif tok.startswith("{"): kind = state = "vocab"
        if re.search(r"[*}][^\w]*$", tok): state = None
        words.append(tok.replace("*", "").replace("{", "").replace("}", ""))
        kinds.append(kind)
    return " ".join(words), kinds


def forced_align(wav_path, spoken_text):
    """Exact word timings from ElevenLabs forced alignment on the finished audio. v3's own
    timestamps drift by up to ~0.7 s around its natural pauses; this does not. Cached by audio hash."""
    data = open(wav_path, "rb").read()
    key = hashlib.sha1(data + spoken_text.encode()).hexdigest()[:16]
    cached = os.path.join(CACHE, "align_" + key + ".json")
    if not os.path.exists(cached):
        boundary = "----jacksonvideo" + key
        body = (f"--{boundary}\r\nContent-Disposition: form-data; name=\"text\"\r\n\r\n{spoken_text}\r\n"
                f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"n.wav\"\r\n"
                f"Content-Type: audio/wav\r\n\r\n").encode() + data + f"\r\n--{boundary}--\r\n".encode()
        req = urllib.request.Request("https://api.elevenlabs.io/v1/forced-alignment", data=body, method="POST",
                                     headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"],
                                              "Content-Type": f"multipart/form-data; boundary={boundary}"})
        try:
            r = json.loads(urllib.request.urlopen(req, timeout=600).read())
        except urllib.error.HTTPError as e:
            sys.exit(f"ElevenLabs alignment {e.code}: {e.read().decode()[:400]}")
        os.makedirs(CACHE, exist_ok=True)
        json.dump(r, open(cached, "w"))
    r = json.load(open(cached))
    return [(w["text"].strip(), w["start"], w["end"]) for w in r["words"] if w["text"].strip()]


def main():
    env()
    src, name = sys.argv[1], sys.argv[2]
    use_piper = "--piper" in sys.argv
    marked = [parse_marks(p.strip()) for p in open(src).read().split("\n\n") if p.strip()]
    paras = [m[0] for m in marked]
    pcm = b"\0\0" * int(RATE * LEAD_IN)
    words = []
    for i, p in enumerate(paras):
        offset = len(pcm) / 2 / RATE
        if use_piper:
            audio, chars = piper(spoken(p))
        else:
            audio, chars = eleven(spoken(p), spoken(paras[i - 1]) if i else "",
                                  spoken(paras[i + 1]) if i + 1 < len(paras) else "")
            audio, chars = add_pauses(audio, chars, SENT_GAP)
        ws = words_from_chars(p, chars, offset)
        for w, k in zip(ws, marked[i][1]):
            if k: w["k"] = k
        words += ws
        words[-1]["para_end"] = True
        pcm += audio + b"\0\0" * int(RATE * PARA_GAP)
        print(f"  paragraph {i + 1}/{len(paras)}: {len(audio) / 2 / RATE:.1f}s", flush=True)
    os.makedirs(OUT, exist_ok=True)
    wav = os.path.join(OUT, name + ".wav")
    with wave.open(wav, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE); w.writeframes(pcm)
    if not use_piper:
        # replace the TTS timestamps with forced-alignment timings, word for word
        aligned = forced_align(wav, " ".join(spoken(p) for p in paras))
        j = 0
        for w in words:
            n = len(spoken(w["w"]).split())
            grp = aligned[j:j + n]
            j += n
            w["s"], w["e"] = round(grp[0][1], 3), round(grp[-1][2], 3)
        assert j == len(aligned), f"alignment word count mismatch: {j} vs {len(aligned)}"
    json.dump({"voice": "piper-placeholder" if use_piper else os.environ.get("VOICE_ID"),
               "duration": round(len(pcm) / 2 / RATE, 3), "words": words},
              open(os.path.join(OUT, name + ".words.json"), "w"), indent=0)
    print(f"wrote {wav} ({len(pcm) / 2 / RATE:.1f}s, {len(words)} words)")


if __name__ == "__main__":
    main()
