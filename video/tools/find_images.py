"""Search every copyright-friendly image archive we can reach, and download with credits.

  python3 tools/find_images.py search "corrupt bargain"            # all sources
  python3 tools/find_images.py search "House of Representatives 1822" --src met,aic
  python3 tools/find_images.py get loc:2003656574 public/img/beauty_booty.jpg
  python3 tools/find_images.py get met:12345 public/img/x.jpg

Sources and what counts as usable:
  commons  Wikimedia Commons       public domain / CC0 / CC BY (licence per file)
  loc      Library of Congress     "No known restrictions on publication"
  met      The Met open access     isPublicDomain (CC0)
  aic      Art Institute Chicago   is_public_domain (CC0)
  cma      Cleveland Museum of Art share_license_status CC0
  ia       Internet Archive        explicit PD/CC licence, or created before 1930 (US public domain by age)
  iabook   Internet Archive books  pages of scanned books published before 1930 (engraved plates!)

Old books are the richest source of period engravings. Find a book, preview its pages, grab a plate:
  python3 tools/find_images.py books "life of Andrew Jackson"          # pre-1930 scanned books
  python3 tools/find_images.py pages lifeofandrewjack01part 1 60 out/pages.jpg   # contact sheet of pages
  python3 tools/find_images.py get iabook:lifeofandrewjack01part:14 public/img/plate.jpg

Anything that does not pass its source's test is listed as SKIP and `get` refuses it.
Every download is recorded in public/img/credits.json.
"""
import io, json, os, re, sys, time, urllib.error, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import commons  # noqa: E402

UA = commons.UA
CREDITS = commons.CREDITS


def fetch(url, binary=False, tries=5):
    headers = {"User-Agent": UA}
    if "artic.edu" in url:
        headers["AIC-User-Agent"] = UA   # the Art Institute's image server requires it
    req = urllib.request.Request(url, headers=headers)
    for i in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                data = r.read()
            return data if binary else json.loads(data)
        except urllib.error.HTTPError as e:
            if e.code in (429, 503) and i < tries - 1:
                time.sleep(5 * (i + 1)); continue
            raise


def q(s):
    return urllib.parse.quote(s)


# ---------- per-source search: yield dicts {id, title, who, date, ok, licence, size} ----------

def s_loc(text, n):
    # the Prints & Photographs catalogue: prints, cartoons, broadsides, portraits
    d = fetch(f"https://www.loc.gov/pictures/search/?q={q(text)}&fo=json&c={n}")
    for x in d.get("results", [])[:n]:
        m = re.search(r"/item/([^/]+)/", (x.get("links") or {}).get("item", ""))
        if not m:
            continue
        # rights are only on the item record; checked at download time
        yield dict(id="loc:" + m.group(1), title=x.get("title", ""), who=x.get("creator") or "",
                   date=x.get("created_published_date", "") or "", ok=None, licence="checked on get", size="")


def s_met(text, n):
    ids = (fetch(f"https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&title=true&q={q(text)}")
           .get("objectIDs") or [])[:n]
    for i in ids:
        o = fetch(f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{i}")
        yield dict(id=f"met:{i}", title=o.get("title", ""), who=o.get("artistDisplayName", ""),
                   date=o.get("objectDate", ""), ok=bool(o.get("isPublicDomain") and o.get("primaryImage")),
                   licence="CC0" if o.get("isPublicDomain") else "not public domain", size="")


def s_aic(text, n):
    d = fetch("https://api.artic.edu/api/v1/artworks/search?q=" + q(text) + f"&limit={n}"
              "&fields=id,title,artist_display,date_display,image_id,is_public_domain,thumbnail")
    for x in d.get("data", []):
        th = x.get("thumbnail") or {}
        yield dict(id=f"aic:{x['id']}", title=x.get("title", ""), who=(x.get("artist_display") or "").split("\n")[0],
                   date=x.get("date_display", ""), ok=bool(x.get("is_public_domain") and x.get("image_id")),
                   licence="CC0" if x.get("is_public_domain") else "not public domain",
                   size=f"{th.get('width', '')}x{th.get('height', '')}")


def s_cma(text, n):
    d = fetch(f"https://openaccess-api.clevelandart.org/api/artworks/?q={q(text)}&has_image=1&limit={n}")
    for x in d.get("data", []):
        img = (x.get("images") or {}).get("print") or {}
        who = "; ".join(c.get("description", "") for c in x.get("creators") or [])
        yield dict(id=f"cma:{x['id']}", title=x.get("title", ""), who=who, date=x.get("creation_date", ""),
                   ok=x.get("share_license_status") == "CC0" and bool(img.get("url")),
                   licence=x.get("share_license_status", ""), size=f"{img.get('width', '')}x{img.get('height', '')}")


def ia_ok(meta):
    lic = (meta.get("licenseurl") or "").lower()
    if "publicdomain" in lic or ("creativecommons" in lic and "-nc" not in lic and "-nd" not in lic):
        return True, lic
    years = [int(y) for y in re.findall(r"\b(1[5-9]\d\d)\b", str(meta.get("date", "")) + " " + str(meta.get("year", "")))]
    if years and min(years) < 1930:
        return True, f"public domain by age ({min(years)})"
    return False, lic or "no licence stated"


def s_ia(text, n):
    d = fetch("https://archive.org/advancedsearch.php?q=" + q(f"({text}) AND mediatype:image") +
              "&fl[]=identifier&fl[]=title&fl[]=date&fl[]=year&fl[]=licenseurl&fl[]=creator"
              f"&rows={n}&output=json")
    for x in d["response"]["docs"]:
        ok, lic = ia_ok(x)
        who = x.get("creator", "")
        yield dict(id="ia:" + x["identifier"], title=str(x.get("title", "")), who=who if isinstance(who, str) else "; ".join(who),
                   date=str(x.get("date", x.get("year", ""))), ok=ok, licence=lic, size="")


def s_commons(text, n):
    r = commons.api(action="query", list="search", srsearch=text, srnamespace=6, srlimit=n)
    titles = [s["title"] for s in r["query"]["search"]]
    for i in commons.info(titles) if titles else []:
        ok = bool(re.search(r"public domain|pd|cc0|no restrictions|cc by(?!-nc)", i["licence"], re.I))
        yield dict(id="commons:" + i["title"], title=i["title"][5:], who=i["artist"], date=i["date"], ok=ok,
                   licence=i["licence"], size=f"{i['w']}x{i['h']}")


SOURCES = {"commons": s_commons, "loc": s_loc, "met": s_met, "aic": s_aic, "cma": s_cma, "ia": s_ia}


def search(text, srcs, n=8):
    for name in srcs:
        print(f"== {name}")
        try:
            for r in SOURCES[name](text, n):
                flag = "OK  " if r["ok"] else ("??  " if r["ok"] is None else "SKIP")
                print(f"  {flag} {r['id']:<40.40} {r['size']:>10}  {r['date'][:14]:<14} {r['title'][:60]}  — {r['who'][:40]}")
        except Exception as e:  # one archive being down should not stop the others
            print(f"  (error: {e})")


# ---------- download ----------

def best_loc(item):
    d = fetch(f"https://www.loc.gov/item/{item}/?fo=json")
    rights = d["item"].get("rights_advisory") or ""
    if isinstance(rights, list):
        rights = " ".join(rights)
    if "no known restrictions" not in rights.lower():
        sys.exit(f"refusing loc:{item}: rights say {rights!r}")
    files = [f for r in d.get("resources", []) for group in r.get("files", []) for f in group]
    jpgs = sorted((f for f in files if f.get("mimetype") == "image/jpeg"), key=lambda f: f.get("width") or 0)
    tifs = [f for f in files if f.get("mimetype") == "image/tiff"]
    meta = dict(title=d["item"].get("title", ""), artist=", ".join(d["item"].get("contributor_names", []) or []),
                date=d["item"].get("date", ""), licence=rights, page=f"https://www.loc.gov/item/{item}/")
    # prefer the archival TIFF when the largest JPEG is small
    if tifs and (not jpgs or (jpgs[-1].get("width") or 0) < 1600):
        return tifs[0]["url"], meta
    return jpgs[-1]["url"], meta


def books(text, n=12):
    d = fetch("https://archive.org/advancedsearch.php?q=" + q(f"title:({text}) AND mediatype:texts AND year:[1700 TO 1929]") +
              f"&fl[]=identifier&fl[]=title&fl[]=year&fl[]=imagecount&sort[]=downloads+desc&rows={n}&output=json")
    for x in d["response"]["docs"]:
        print(f"  {x['identifier']:<42.42} {str(x.get('year', '')):<6} {str(x.get('imagecount', '')):>5}p  {str(x.get('title', ''))[:70]}")


def page_url(book, page, width=None):
    size = f"_w{width}" if width else ""
    return f"https://archive.org/download/{book}/page/n{page}{size}.jpg"


def pages(book, start, end, out):
    """Contact sheet of book pages so the engraved plates can be spotted by eye."""
    from PIL import Image, ImageDraw
    thumbs = []
    for p in range(start, end + 1):
        try:
            im = Image.open(io.BytesIO(fetch(page_url(book, p, 300), binary=True))).convert("RGB")
            im.thumbnail((200, 280))
            ImageDraw.Draw(im).text((4, 4), str(p), fill=(255, 0, 0))
            thumbs.append(im)
        except Exception:
            pass
    cols = 10
    sheet = Image.new("RGB", (cols * 205, ((len(thumbs) + cols - 1) // cols) * 285), "white")
    for i, im in enumerate(thumbs):
        sheet.paste(im, ((i % cols) * 205, (i // cols) * 285))
    sheet.save(out, quality=85)
    print(f"sheet {out}: pages {start}-{end}")


def get(ident, dest):
    src, key = ident.split(":", 1)
    if src == "iabook":
        book, page = key.rsplit(":", 1)
        md = fetch(f"https://archive.org/metadata/{book}")["metadata"]
        years = [int(y) for y in re.findall(r"\b(1[5-9]\d\d)\b", str(md.get("year", "")) + " " + str(md.get("date", "")))]
        if not years or min(years) >= 1930:
            sys.exit(f"refusing iabook:{book}: not clearly published before 1930 ({md.get('year') or md.get('date')})")
        data = fetch(page_url(book, int(page)), binary=True)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        open(dest, "wb").write(data)
        meta = dict(title=f"{md.get('title', '')} (page {page})", artist=str(md.get("creator", "")),
                    date=str(md.get("year", md.get("date", ""))), licence=f"public domain by age ({min(years)})",
                    page=f"https://archive.org/details/{book}/page/n{page}")
        credits = json.load(open(CREDITS)) if os.path.exists(CREDITS) else {}
        credits[os.path.relpath(dest, os.path.dirname(CREDITS))] = {**meta, "source": ident}
        json.dump(credits, open(CREDITS, "w"), indent=2)
        print(f"saved {dest} ({len(data) // 1024} KB) {meta['licence']}")
        return
    if src == "commons":
        return commons.get(key, dest, 1920)
    if src == "loc":
        url, meta = best_loc(key)
    elif src == "met":
        o = fetch(f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{key}")
        if not o.get("isPublicDomain"):
            sys.exit(f"refusing met:{key}: not public domain")
        url = o["primaryImage"]
        meta = dict(title=o["title"], artist=o.get("artistDisplayName", ""), date=o.get("objectDate", ""),
                    licence="CC0 (The Met Open Access)", page=o.get("objectURL", ""))
    elif src == "aic":
        o = fetch(f"https://api.artic.edu/api/v1/artworks/{key}?fields=id,title,artist_display,date_display,image_id,is_public_domain")["data"]
        if not o.get("is_public_domain"):
            sys.exit(f"refusing aic:{key}: not public domain")
        url = f"https://www.artic.edu/iiif/2/{o['image_id']}/full/1686,/0/default.jpg"
        meta = dict(title=o["title"], artist=o.get("artist_display", ""), date=o.get("date_display", ""),
                    licence="CC0 (Art Institute of Chicago)", page=f"https://www.artic.edu/artworks/{key}")
    elif src == "cma":
        o = fetch(f"https://openaccess-api.clevelandart.org/api/artworks/{key}")["data"]
        if o.get("share_license_status") != "CC0":
            sys.exit(f"refusing cma:{key}: licence {o.get('share_license_status')}")
        url = o["images"]["print"]["url"]
        meta = dict(title=o["title"], artist="; ".join(c.get("description", "") for c in o.get("creators") or []),
                    date=o.get("creation_date", ""), licence="CC0 (Cleveland Museum of Art)", page=o.get("url", ""))
    elif src == "ia":
        m = fetch(f"https://archive.org/metadata/{key}")
        ok, lic = ia_ok(m.get("metadata", {}))
        if not ok:
            sys.exit(f"refusing ia:{key}: {lic}")
        imgs = sorted((f for f in m["files"] if f.get("format") in ("JPEG", "PNG", "TIFF") and f.get("source") == "original"),
                      key=lambda f: int(f.get("size", 0)))
        if not imgs:
            sys.exit(f"ia:{key} has no original image file")
        url = f"https://archive.org/download/{key}/{q(imgs[-1]['name'])}"
        md = m["metadata"]
        meta = dict(title=str(md.get("title", "")), artist=str(md.get("creator", "")), date=str(md.get("date", "")),
                    licence=lic, page=f"https://archive.org/details/{key}")
    else:
        sys.exit(f"unknown source {src}")
    data = fetch(url, binary=True)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    if url.lower().endswith((".tif", ".tiff")) or data[:4] in (b"II*\0", b"MM\0*"):
        from PIL import Image
        im = Image.open(io.BytesIO(data)).convert("RGB")
        im.thumbnail((3000, 3000))
        im.save(dest, quality=92)
    else:
        open(dest, "wb").write(data)
    credits = json.load(open(CREDITS)) if os.path.exists(CREDITS) else {}
    credits[os.path.relpath(dest, os.path.dirname(CREDITS))] = {**meta, "source": ident}
    json.dump(credits, open(CREDITS, "w"), indent=2)
    print(f"saved {dest} ({len(data) // 1024} KB) {meta['licence'][:60]}")


if __name__ == "__main__":
    if sys.argv[1] == "books":
        books(" ".join(sys.argv[2:]))
        sys.exit()
    if sys.argv[1] == "pages":
        pages(sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5])
        sys.exit()
    if sys.argv[1] == "search":
        args = [a for a in sys.argv[2:] if not a.startswith("--src")]
        srcs = next((a.split("=", 1)[1].split(",") for a in sys.argv[2:] if a.startswith("--src=")), list(SOURCES))
        search(" ".join(args), srcs)
    else:
        get(sys.argv[2], sys.argv[3])
