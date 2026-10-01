# Images and masks

## Contents
1. Archival first: finding and crediting images
2. AI paintings for gaps (Gemini prompts)
3. Masks: the coral tint and teal trace
4. Getting files from the user

## 1. Archival first

Real people, places, documents and events come from period sources: engravings, lithographs, political cartoons,
portraits, daguerreotypes, broadsides, maps and scanned book plates. Every image shows black and white on screen,
so a good engraving beats a muddy color painting.

```sh
python3 tools/find_images.py search "Treaty of New Echota"                 # every source at once
python3 tools/find_images.py search "John Ross Cherokee" --src=loc,commons
python3 tools/find_images.py books "life of Andrew Jackson"                # pre-1930 scanned books (plates!)
python3 tools/find_images.py pages <ia-identifier> 1 60 out/pages.jpg      # contact sheet of a book's pages
python3 tools/find_images.py get loc:2003656574 public/img/ch10/ross.jpg   # download + record the credit
```

- Sources it searches: Wikimedia Commons, Library of Congress, The Met, Art Institute of Chicago, Cleveland Museum
  of Art, Internet Archive (and its pre-1930 books). It refuses anything that fails that source's public-domain or
  open-licence test, and every `get` is written to `public/img/credits.json`. Those credits feed the on-screen
  `Tag` and the description's "Sources & credits" line.
- Folder per chapter: `public/img/chNN/`. Name files for what they show (`ross_lithograph_1843.jpg`).
- Get more than you need: an alternate per key moment and a strong image for each person named.
- The 1836 Mitchell map ships with the template (`public/img/maps/`). For other eras, find a period wall map of
  the right decade, at least 4000 px wide, and read new `PLACES` pixel positions off it.

## 2. AI paintings for gaps

Use Gemini only for moments with no surviving image: a scene, a crowd, a room, a mood. The user runs the prompts
and uploads the PNGs. Write the prompts into `script/GEMINI_PROMPTS.md`:

- One entry per image: the file name (`chNN_slug.png`), the narration line it covers, the prompt, and
  **must-have** if the scene is noticeably worse without it.
- A prompt names the year, the place, what is in the frame, the light and the mood. Be specific about period
  clothing, buildings and objects.
- **No recognizable real person.** Where a real person must be in the scene, show them from behind, at a distance
  or in shadow, face not visible. Anonymous ordinary people may show faces.
- **Every prompt ends with the identical style paragraph**, so the images read as one series. Adjust only the
  decades to the video's era, then keep it word for word for the whole video:

> Style: an American oil painting from the 1820s–1830s in the manner of the period's genre painters, such as
> George Caleb Bingham and William Sidney Mount. Muted earth palette (umber, ochre, slate blue, dull red), warm
> directional light, visible brushwork, faint craquelure, slightly aged varnish. Every detail must be historically
> accurate for the stated year and place: clothing, hairstyles, buildings, furniture, lamps and tools. No text of
> any kind: no letters, words, signs, labels, captions, signatures, dates or watermarks. No frame or border. No
> recognizable real historical person. Faces, where visible, belong to ordinary anonymous people.

- Header notes to include for the user: the model (Gemini image generation at its largest size), aspect 16:9,
  paste the whole prompt including the style paragraph, regenerate rather than fix anything with text, extra
  fingers, modern objects or wrong details, and the scene still works if they skip an image.
- In scenes: read the real size (it won't be exactly 16:9), tag it `Illustration · <what it shows>`, and treat it
  like any archival image (B&W, one coral subject).

## 3. Masks

The coral subject and teal outline need a mask of the subject, the same size as the image.

**Default: rembg, locally** (`tools/mask.py`). Add a job and run it:

```python
JOBS = {
    "ross": ("img/ch10/john_ross.jpg", None, "isnet-general-use"),                 # whole image
    "voters_a": ("img/gen/ch05_new_voters.png", (80, 120, 420, 850), "isnet-general-use"),  # crop to one figure
}
```

`python3 tools/mask.py ross voters_a` writes `public/img/masks/<name>_subject.png`, `<name>_subject_a.png` (the
alpha used by `Tint`) and `<name>.json` (outline paths for `Traced`). Then import the JSON in `src/masks.ts`:

```ts
import ross from '../public/img/masks/ross.json';
export const MASKS = { ..., ross: maskRef('ross', ross) };
```

- Crop to one figure when a picture has several people; the largest piece is kept.
- Look at every mask on a still before relying on it (`node tools/stills.mjs ...`): the trace should hug the
  figure just outside its edge. Portraits and single figures work almost every time; busy engravings may need a
  tighter crop.
- Setup once: `pip install rembg onnxruntime opencv-python-headless pillow numpy` (the first run downloads the
  isnet model, ~170 MB).

**Optional: Gemini mask pass.** The prompt asks Gemini to return the same image with the subject filled flat
magenta (#FF00FF) and a second subject green (#00FF00). Then
`python3 tools/trace.py fromfile <painted.png> <original.png> <name>` turns the fills into a mask. **Check it
lines up**: overlay the mask on the original. On *King Andrew* only one of five Gemini mask passes came back
pixel-aligned; the rest were redrawn and had to be masked with rembg instead. Users also sometimes upload the
mask version in place of the original; compare the two files before using either.

## 4. Getting files from the user

- Ask where uploads will land (a folder, or a separate branch). If they use another branch, read from it with
  `git fetch origin <branch>` and `git checkout origin/<branch> -- <paths>` (or `git show`), and never push to it.
- Check what arrived: file names, sizes, and that the originals aren't the mask versions.
- Copy images into `public/img/gen/` (AI) or `public/img/chNN/` (archival) with the names the scenes expect.
