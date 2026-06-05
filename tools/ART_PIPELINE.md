# Manor restoration — art pipeline

A tiny pipeline that turns raw art downloads into game-ready, compressed assets.
You drop files into one folder, run one command, and get small cutouts (transparent
PNG-8) and room backgrounds (webp) out the other side. **Your original downloads are
never touched.**

## The 9 rooms (folder ↔ room id)

The kit's nine rooms, in order. Drop a room's art into the matching `room#` inbox:

| inbox folder | room id          |
|--------------|------------------|
| `room1`      | `study`          |
| `room2`      | `entry-hall`     |
| `room3`      | `library`        |
| `room4`      | `trophy-hall`    |
| `room5`      | `press-room`     |
| `room6`      | `portrait-gallery` |
| `room7`      | `wine-cellar`    |
| `room8`      | `attic`          |
| `room9`      | `secret-office`  |

## Where to drop downloads

```
assets/manor/_inbox/room1/   ← drop the study's raw art here
assets/manor/_inbox/room2/   ← entry-hall
...
assets/manor/_inbox/room9/   ← secret-office
```

Accepted formats: `.png`, `.jpg`, `.jpeg`, `.webp`. Keep whatever filenames you like —
they're preserved through processing.

## The one command

```bash
python tools/process_art.py            # process every room in _inbox
python tools/process_art.py room1      # process just one room
```

Outputs land in `assets/manor/_processed/room1 … room9/` with the **same base
filename** (new extension). The script prints a summary table (file, original →
final size, dimensions, quantizer used).

## What the script does

For each file in `_inbox/room*/`:

- **Backgrounds** (filename contains a `bg`/`background`/`backdrop` hint, **or** the
  image is ~16:9): left as full images — resized to **1024px wide** (aspect kept) and
  saved as **quality-85 WEBP**. *(webp chosen over png here: meaningfully smaller for
  photographic room art, and supported by every browser the game targets.)*
- **Cutouts** (everything else):
  1. If it sits on a **white background**, knock the white out to transparency with a
     **graduated alpha** based on distance-from-white — so soft drop shadows survive as
     semi-transparent grey instead of being eaten or leaving a white halo. The white is
     flood-filled **from the edges**, so white *inside* the object (a shirt, a sheet of
     paper) stays opaque. Images that already have transparency, or a non-white
     background, are left as-is.
  2. **Trim** the transparent margin (with a few px of padding).
  3. **Resize** so the long edge is **256px**.
  4. **Compress** to **PNG-8 with alpha** via **pngquant** if it's on your PATH
     (best). If not, it falls back to Pillow's **libimagequant** quantizer, and failing
     that to a Pillow fallback that reduces the palette while keeping the full graded
     alpha (a touch larger than true PNG-8 — install `pngquant` for the smallest files).
     The script prints which quantizer it actually used.

> Install pngquant for best cutout compression: `choco install pngquant` (Windows),
> `brew install pngquant` (macOS), or `apt install pngquant` (Debian/Ubuntu).

Requires Python 3 with **Pillow** and **numpy** (and **scipy** for the fast flood-fill;
without scipy it uses a slower built-in BFS — still correct).

## After processing: the rename / identification pass (done by hand)

Processing is deliberately *dumb* — it keeps your filenames and just cleans + compresses.
The **identification** step happens afterwards, visually:

1. Open the `_processed/room*/` outputs next to **`MANOR_IMAGE_PROMPTS`** and match each
   processed image to the prompt it fulfils.
2. Move/rename the chosen finals into **`assets/manor/<room>/`** (e.g.
   `assets/manor/study/`) using the MANOR naming convention.
3. Record every decision in a **`manifest.json`** in that room folder, logging the
   `original → final` name mapping, plus a **review list** flagging ambiguous
   "stage-sibling" variants (e.g. two near-identical bookcases) that need a human's eye
   before one is picked.

The `_inbox/` originals stay put as the archive of record; `_processed/` is the scratch
staging area; `assets/manor/<room>/` is the shipped, named result.
