"""Bundle the whole game into one self-contained HTML file (all art as data URIs).

Writes dist/capitol-steps.html (page body only: <title>, <style>, markup, scripts — what an
artifact wrapper expects) and dist/index.html (a full standalone document).
"""
import base64
import json
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def read(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
        return f.read()


def main():
    html = read("index.html")
    body = re.search(r"<body>(.*)</body>", html, re.S).group(1)
    scripts = re.findall(r'<script src="([^"]+)"></script>', body)
    markup = re.sub(r'<script src="[^"]+"></script>\s*', "", body).strip()

    # embed every asset
    embedded = {}
    for dirpath, _, files in os.walk(os.path.join(ROOT, "assets")):
        for fn in files:
            full = os.path.join(dirpath, fn)
            rel = os.path.relpath(full, ROOT).replace(os.sep, "/")
            if fn.endswith(".png"):
                with open(full, "rb") as f:
                    embedded[rel] = "data:image/png;base64," + base64.b64encode(f.read()).decode("ascii")
            elif fn.endswith(".json"):
                embedded[rel] = json.loads(read(rel))

    css = read("src/style.css")
    js = "\n\n".join(f"// ---- {s} ----\n" + read(s) for s in scripts)
    title = re.search(r"<title>(.*?)</title>", html).group(1)

    parts = [
        f"<title>{title}</title>",
        f"<style>\n{css}\n</style>",
        markup,
        "<script>window.EMBEDDED = " + json.dumps(embedded, separators=(",", ":")) + ";</script>",
        "<script>\n" + js + "\n</script>",
    ]
    out = "\n".join(parts)
    os.makedirs(os.path.join(ROOT, "dist"), exist_ok=True)
    with open(os.path.join(ROOT, "dist", "capitol-steps.html"), "w", encoding="utf-8") as f:
        f.write(out)
    with open(os.path.join(ROOT, "dist", "index.html"), "w", encoding="utf-8") as f:
        f.write('<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"><link rel="icon" href="data:,"></head><body>\n' + out + "\n</body></html>\n")
    print("dist/capitol-steps.html", round(len(out.encode()) / 1024), "KB")


if __name__ == "__main__":
    main()
