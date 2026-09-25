"""Offline stand-in sound effects (no credits needed). tools/sfx_eleven.py writes the same
filenames with real ElevenLabs effects; music cues come from tools/music_eleven.py."""
import os, wave
import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "sfx")
rng = np.random.default_rng(3)


def save(name, x, stereo=False):
    x = x / (np.abs(x).max() + 1e-9) * 0.9
    if not stereo:
        x = np.stack([x, x], 1)
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
    print("sfx/", name)


def t(sec):
    return np.arange(int(SR * sec)) / SR


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR); y = np.zeros_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc; y[i] = acc
    return y


def env(n, attack, decay):
    tt = np.arange(n) / SR
    return np.minimum(tt / max(attack, 1e-4), 1) * np.exp(-tt / decay)


def shot():
    # flintlock: flint click, pan-powder fizz, then the charge
    click = np.zeros(int(SR * 0.02)); click[:40] = rng.uniform(-1, 1, 40)
    fizz = rng.normal(0, 1, int(SR * 0.09)) * env(int(SR * 0.09), 0.005, 0.04) * 0.35
    n = int(SR * 2.2)
    boom = lowpass(rng.normal(0, 1, n), 900) * env(n, 0.002, 0.18) * 3
    boom += np.sin(2 * np.pi * 55 * t(2.2) * np.exp(-t(2.2) * 2)) * env(n, 0.003, 0.35) * 0.8
    crack = rng.normal(0, 1, n) * env(n, 0.0005, 0.02)
    tail = lowpass(rng.normal(0, 1, n), 400) * env(n, 0.05, 0.8) * 0.25   # echo off the trees
    return np.concatenate([click, fizz, boom + crack + tail])


def stamp():
    n = int(SR * 0.5)
    thud = np.sin(2 * np.pi * 90 * t(0.5) * np.exp(-t(0.5) * 6)) * env(n, 0.001, 0.07)
    slap = lowpass(rng.normal(0, 1, n), 2500) * env(n, 0.0005, 0.025) * 0.7
    return thud + slap


def whoosh(sec=0.7):
    n = int(SR * sec); x = rng.normal(0, 1, n)
    shape = np.sin(np.pi * np.arange(n) / n) ** 2
    # sweep a one-pole filter upward for a paper slide
    y = np.zeros(n); acc = 0.0
    for i in range(n):
        c = 300 + 3500 * (i / n)
        a = np.exp(-2 * np.pi * c / SR); acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y * shape


def tick():
    n = int(SR * 0.06)
    return np.sin(2 * np.pi * 1800 * t(0.06)) * env(n, 0.0005, 0.008) + rng.normal(0, 0.3, n) * env(n, 0.0002, 0.004)


def boom():
    n = int(SR * 3.5)
    x = np.sin(2 * np.pi * 42 * t(3.5)) * env(n, 0.01, 1.1)
    x += lowpass(rng.normal(0, 1, n), 200) * env(n, 0.005, 0.6) * 2
    return x


def bed(sec=60):
    """Low strings-ish pad in D minor with a slow pulse; sits under the narration."""
    tt = t(sec); x = np.zeros_like(tt)
    chords = [(146.8, 174.6, 220.0), (116.5, 174.6, 233.1), (130.8, 164.8, 196.0), (110.0, 164.8, 220.0)]
    seg = 6.0
    for k in range(int(sec / seg) + 1):
        f = chords[k % 4]; s0 = int(k * seg * SR); s1 = min(len(tt), int((k + 1) * seg * SR) + SR)
        if s0 >= len(tt): break
        local = np.arange(s1 - s0) / SR
        e = np.minimum(local / 1.5, 1) * np.minimum((s1 - s0) / SR - local, 1).clip(0, 1)
        for fr in f:
            for det in (-0.6, 0.6):
                ph = 2 * np.pi * (fr + det) * local
                x[s0:s1] += (np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)) * e * 0.12
    pulse = np.zeros_like(tt)
    for b in np.arange(0, sec, 1.5):
        i = int(b * SR); n = min(int(SR * 0.6), len(tt) - i)
        pulse[i:i + n] += np.sin(2 * np.pi * 73.4 * np.arange(n) / SR) * env(n, 0.005, 0.18) * 0.5
    x = lowpass(x, 1400) + pulse
    L = x + 0.02 * np.roll(x, 900); R = x + 0.02 * np.roll(x, 1300)
    return np.stack([L, R], 1)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    save("shot", shot()); save("stamp", stamp()); save("whoosh", whoosh()); save("tick", tick())
    save("boom", boom())
