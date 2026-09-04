"""Pull public-domain reference images from Wikimedia Commons for the art rebuild.

Searches the Commons file namespace for each query, keeps files whose licence is
public domain / CC0 / CC-BY, downloads a ~1000px rendition into tools/art/ref/<key>/
and writes tools/art/ref/CREDITS.md so every reference is attributed.
"""
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
import urllib.error

API = "https://commons.wikimedia.org/w/api.php"
UA = "CapitolStepsGame/0.1 (educational history game; reference gathering)"
REF = os.path.join(os.path.dirname(__file__), "ref")
OK_LICENCE = re.compile(r"public domain|pd-|cc0|cc-by(?!-nc)|cc by(?! nc)|no restrictions", re.I)

QUERIES = {
    # portraits
    "ross": ["John Ross Cherokee chief portrait", "John Ross Charles Bird King"],
    "biddle": ["Nicholas Biddle portrait banker", "Nicholas Biddle 1786"],
    "lawrence": ["Richard Lawrence assassination attempt Jackson 1835", "attempted assassination President Jackson 1835 lithograph"],
    "key": ["Francis Scott Key portrait"],
    "jackson": ["Andrew Jackson Ralph Earl portrait 1835", "Andrew Jackson 1837 portrait"],
    "clay_older": ["Henry Clay portrait 1840s", "Henry Clay Neagle"],
    "gentleman": ["portrait of a gentleman Thomas Sully", "portrait of a man 1830s American oil"],
    "old_man": ["portrait of an old man 1830s American", "Gilbert Stuart portrait elderly man"],
    "clerk": ["young man portrait 1830s daguerreotype", "portrait young man 1840 American painting"],
    # buildings
    "capitol": ["United States Capitol 1830s engraving", "Capitol Bulfinch dome 1846 daguerreotype Plumbe", "Capitol east front 1830s"],
    "white_house": ["President's House Washington 1830s engraving", "White House north portico 1840s print"],
    "penn_ave": ["Pennsylvania Avenue Washington 1830s", "Washington City 1834 view print", "Pennsylvania Avenue 1840s Capitol view"],
    "gadsbys": ["Gadsby's Tavern Alexandria", "Gadsby's Tavern taproom"],
    "indian_queen": ["Indian Queen Hotel Washington Brown's", "Brown's Hotel Washington Pennsylvania Avenue 19th century"],
    "post_office": ["Blodgett's Hotel General Post Office Washington", "General Post Office Washington 1830s"],
    "bank": ["Second Bank of the United States Philadelphia 1830s", "Second Bank of the United States interior"],
    "jail": ["Washington City jail Judiciary Square 19th century", "county jail 1830s stone building America"],
    "rowhouse": ["Federal style rowhouse Georgetown 1820s", "Alexandria Virginia 18th century townhouse"],
    # interiors and set pieces
    "parlor": ["Federal style parlor 1830s American interior", "American Empire parlor 1830 painting interior"],
    "taproom": ["colonial tavern taproom bar cage", "18th century tavern interior bar"],
    "press": ["Columbian printing press iron hand press", "Stanhope press 19th century printing office"],
    "post_interior": ["post office pigeonholes 19th century interior", "19th century post office counter"],
    "hatter": ["hatter shop 19th century interior", "beaver top hat 1830s"],
    "office": ["19th century clerk desk office interior", "Andrew Jackson desk study"],
    "cell": ["19th century jail cell iron bars interior", "old stone prison cell interior"],
    "furniture": ["Windsor chair 18th century", "Duncan Phyfe sofa", "four poster bed 1830 American", "Franklin stove 19th century", "Argand lamp 1830", "whale oil lamp 19th century"],
    "street": ["oil street lamp 19th century America", "horse drawn wagon 1830s", "hitching post 19th century"],
    # evidence objects and documents
    "cartoon": ["King Andrew the First cartoon 1833"],
    "broadside": ["Andrew Jackson 1828 campaign broadside", "Jackson 1828 election poster"],
    "banknote": ["Bank of the United States banknote 1830s", "Second Bank of the United States note"],
    "cards": ["playing cards 1830s American", "19th century playing cards deck"],
    "pipe": ["clay tobacco pipe 19th century", "clay pipe long stem"],
    "whiskey": ["whiskey jug stoneware 19th century", "bourbon bottle 19th century"],
    "resolutions": ["Kentucky Resolutions 1798 pamphlet", "Virginia Resolutions 1798 broadside"],
    "cheque": ["19th century bank cheque 1830s", "bank check 1830s American"],
    "hat": ["top hat beaver 1830s", "gentleman's hat 1830s"],
}


def get(url, params=None, binary=False):
    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
            time.sleep(0.6)
            return data if binary else json.loads(data.decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 5:
                time.sleep(4 * (attempt + 1)); continue
            raise


def search(query, limit=6):
    j = get(API, {"action": "query", "format": "json", "list": "search", "srsearch": query, "srnamespace": 6, "srlimit": limit})
    return [h["title"] for h in j.get("query", {}).get("search", [])]


def info(titles):
    j = get(API, {"action": "query", "format": "json", "titles": "|".join(titles), "prop": "imageinfo",
                  "iiprop": "url|extmetadata|mime|size", "iiurlwidth": 1000})
    out = []
    for p in j.get("query", {}).get("pages", {}).values():
        ii = (p.get("imageinfo") or [None])[0]
        if not ii or not ii.get("mime", "").startswith("image/"):
            continue
        em = ii.get("extmetadata", {})
        lic = em.get("LicenseShortName", {}).get("value", "") + " " + em.get("License", {}).get("value", "")
        out.append({"title": p["title"], "url": ii.get("thumburl") or ii["url"], "page": ii["descriptionurl"],
                    "licence": lic.strip(), "artist": re.sub("<[^>]+>", "", em.get("Artist", {}).get("value", "")).strip()[:80],
                    "date": em.get("DateTimeOriginal", {}).get("value", "")[:40], "w": ii.get("width"), "h": ii.get("height")})
    return out


def main(keys=None):
    os.makedirs(REF, exist_ok=True)
    cj = os.path.join(REF, "credits.json")
    credits = json.load(open(cj)) if os.path.exists(cj) else []
    for key, queries in QUERIES.items():
        if keys and key not in keys:
            continue
        d = os.path.join(REF, key)
        os.makedirs(d, exist_ok=True)
        got = len([f for f in os.listdir(d) if not f.startswith('.')])
        if got >= 2 and not keys:
            continue
        seen = set()
        for q in queries:
            try:
                titles = search(q)
            except Exception as e:
                print("search failed", q, e); continue
            titles = [t for t in titles if t not in seen and not t.lower().endswith((".svg", ".pdf", ".djvu", ".tif", ".tiff"))]
            seen.update(titles)
            if not titles:
                continue
            try:
                items = info(titles[:5])
            except Exception as e:
                print("info failed", q, e); continue
            for it in items:
                if not OK_LICENCE.search(it["licence"]):
                    continue
                if (it.get("w") or 0) < 300:
                    continue
                name = re.sub(r"[^A-Za-z0-9]+", "_", it["title"].replace("File:", ""))[:60]
                ext = os.path.splitext(it["url"])[1].lower() or ".jpg"
                if ext not in (".jpg", ".jpeg", ".png"):
                    ext = ".jpg"
                path = os.path.join(d, f"{got:02d}_{name}{ext}")
                try:
                    data = get(it["url"], binary=True)
                    open(path, "wb").write(data)
                except Exception as e:
                    print("download failed", it["url"], e); continue
                it["file"] = os.path.relpath(path, REF); it["key"] = key
                credits.append(it)
                got += 1
                time.sleep(0.2)
                if got >= 4:
                    break
            if got >= 4:
                break
        print(f"{key}: {got}")
    with open(os.path.join(REF, "credits.json"), "w") as f:
        json.dump(credits, f, indent=1)
    with open(os.path.join(REF, "CREDITS.md"), "w") as f:
        f.write("# Reference images\n\nAll from Wikimedia Commons; public domain or permissive licences. Used only as drawing references.\n\n")
        for c in credits:
            f.write(f"- **{c['key']}** — {c['title'].replace('File:', '')} — {c['artist']} {c['date']} — {c['licence']} — {c['page']}\n")


if __name__ == "__main__":
    main(sys.argv[1:] or None)
