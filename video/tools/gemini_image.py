"""Painted scenery from Gemini image generation: public/img/v2/gen/<name>.png

Only for things no period image can supply: stage backcloths, skies, sea, textures. Real people,
ships and documents always come from archival images (tools/find_images.py + tools/puppet.py).

  python3 tools/gemini_image.py sea_backcloth          # one entry from SCENERY
  python3 tools/gemini_image.py --list
"""
import base64, json, os, sys, urllib.error, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from voice import env  # noqa: E402

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "img", "v2", "gen")
MODEL = os.environ.get("GEMINI_IMAGE_MODEL", "gemini-3-pro-image")

STYLE = ("Style: a hand-painted backcloth for a 19th-century English paper toy theater (Pollock's / "
         "Skelt 'penny plain, twopence coloured'), printed as a hand-coloured lithograph on thick cream card. "
         "Flat, bold, saturated colours: vermilion, royal blue, mustard yellow, emerald green, cream; "
         "confident black ink outlines and engraved hatching for shading; slightly naive perspective; "
         "visible paper grain. No text, no letters, no signature, no border, no people, no ships.")

SCENERY = {
    "sea_backcloth": ("Wide backcloth of the open Atlantic off Cape Henry, Virginia, on a calm June morning, 1807. "
                      "Low horizon about 40% up from the bottom; far left a thin strip of sandy coast with a small "
                      "octagonal stone lighthouse. Huge sky with stylised rolling cumulus clouds painted in cream "
                      "and pale blue with ink outlines. Sea in royal blue and emerald bands with stylised wave "
                      "crests. Calm, open, peaceful. Leave the middle of the sea empty.", "16:9"),
    "sea_backcloth_storm": ("The same kind of backcloth as a calm Atlantic seascape, but at the moment of a sea battle: "
                            "the sky turned dark indigo and slate with smoke-grey clouds, a sickly mustard glow at "
                            "the horizon, the sea in deep navy with white-capped stylised wave crests. Low horizon "
                            "about 40% up. Ominous. Leave the middle of the sea empty.", "16:9"),
    "proscenium": ("The printed front of a Victorian paper toy theater (a Pollock's 'Regency' proscenium), seen "
                   "perfectly straight on and filling the whole frame edge to edge: an ornate arch of gilded "
                   "mouldings and scrollwork painted in mustard-gold with black ink linework; a painted vermilion "
                   "velvet valance with gold fringe and tassels swagged across the top; painted vermilion velvet "
                   "side curtains tied back at both sides with gold cords; a small painted royal-blue crest with "
                   "an eagle at the top centre; along the bottom, a dark wooden stage apron with a row of small "
                   "footlight lamps with shell reflectors. The stage opening in the middle is a large rectangle, "
                   "about 84% of the width and 76% of the height, and it must be filled with one completely flat "
                   "solid pure green colour (#00FF00) with no texture and no shading.", "16:9"),
    "drop_curtain": ("The painted drop curtain of a Victorian paper toy theater, filling the whole frame: heavy "
                     "vermilion velvet painted in swags and deep vertical folds with black ink hatching, a gold "
                     "fringe along the bottom edge, and a small oval gold cartouche in the centre left blank.", "16:9"),
    "smoke_puffs": ("A sheet of four separate painted cut-out cannon-smoke clouds for a toy theater, each a billowing "
                    "cauliflower puff of cream and pale grey with black ink outlines and hatching, spread out with "
                    "clear space between them, on a completely flat solid pure green (#00FF00) background.", "16:9"),
    "sailor_silhouettes": ("Four separate black paper silhouette cut-outs of ordinary sailors of 1807, full length, "
                           "standing side by side with clear space between them: loose trousers, short jackets, "
                           "round hats or bare heads, one with a pigtail; slumped, captive poses, heads down. Solid "
                           "matte black silhouettes only, no interior detail, on a completely flat solid pure green "
                           "(#00FF00) background.", "16:9"),
    "velvet": ("Close-up texture filling the whole frame: heavy crimson-vermilion stage curtain velvet hanging "
               "in deep vertical folds, lit from below by warm footlights, rich shadows in the folds. "
               "Photographic texture, no frame, no stage, nothing else.", "9:16"),
}


def generate(name):
    prompt, aspect = SCENERY[name]
    full = prompt if name == "velvet" else prompt + "\n\n" + STYLE.replace("no people, no ships.", "no people.") if name in ("proscenium", "drop_curtain", "smoke_puffs", "sailor_silhouettes") else prompt + "\n\n" + STYLE
    body = {"contents": [{"parts": [{"text": full}]}],
            "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": aspect, "imageSize": "2K"}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
                                 data=json.dumps(body).encode(), method="POST",
                                 headers={"x-goog-api-key": os.environ["GEMINI_API_KEY"], "Content-Type": "application/json"})
    try:
        r = json.loads(urllib.request.urlopen(req, timeout=300).read())
    except urllib.error.HTTPError as e:
        sys.exit(f"Gemini {e.code}: {e.read().decode()[:500]}")
    for part in r["candidates"][0]["content"]["parts"]:
        if "inlineData" in part:
            os.makedirs(OUT, exist_ok=True)
            path = os.path.join(OUT, name + ".png")
            open(path, "wb").write(base64.b64decode(part["inlineData"]["data"]))
            print("wrote", path)
            return
    sys.exit(f"no image returned: {json.dumps(r)[:400]}")


if __name__ == "__main__":
    env()
    if "--list" in sys.argv:
        print("\n".join(SCENERY))
    else:
        for n in sys.argv[1:] or list(SCENERY):
            generate(n)
