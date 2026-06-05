#!/usr/bin/env python3
"""
Manor restoration ART PROCESSING PIPELINE.

Takes raw art dropped into  assets/manor/_inbox/room1 .. room9/  and produces
game-ready, compressed assets in  assets/manor/_processed/room1 .. room9/ .

For each image it will:
  - skip background images (a "bg" hint in the name, or ~16:9 aspect): those are
    resized to 1024 wide and saved as quality-85 WEBP (small, browser-friendly).
  - otherwise treat it as a CUTOUT: if it sits on a white background, knock that
    white out to transparency with a GRADUATED alpha (distance-from-white), so soft
    drop shadows survive as semi-transparent grey instead of being eaten or leaving
    a white halo. The white is flood-filled from the EDGES, so white INSIDE the
    object (a shirt, a sheet of paper) is preserved. Then trim the transparent
    margin (+ a little padding), resize so the long edge is 256px, and compress to
    PNG-8-with-alpha via pngquant (graceful Pillow fallback if pngquant is absent).

Originals in _inbox are NEVER modified or deleted.

Usage:
    python tools/process_art.py            # process every room in _inbox
    python tools/process_art.py room1      # process just room1

The later visual rename/identification pass (originals -> assets/manor/<room>/ with
a manifest.json) is done by hand against MANOR_IMAGE_PROMPTS — see tools/ART_PIPELINE.md.
"""

import os
import sys
import shutil
import subprocess
import tempfile

import numpy as np
from PIL import Image, features

try:
    from scipy import ndimage  # fast connected-component flood-fill
    _HAVE_SCIPY = True
except Exception:
    _HAVE_SCIPY = False

# ---------------------------------------------------------------- configuration
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
INBOX = os.path.join(ROOT, "assets", "manor", "_inbox")
OUTBOX = os.path.join(ROOT, "assets", "manor", "_processed")

IMG_EXTS = {".png", ".jpg", ".jpeg", ".webp"}
BG_HINTS = ("bg", "background", "backdrop")     # filename substrings that mark a room background
CUTOUT_LONG_EDGE = 256                            # px, long edge of a cutout
BG_WIDTH = 1024                                   # px, width of a 16:9 room background
BG_WEBP_QUALITY = 85
TRIM_PAD = 6                                      # transparent px kept around a trimmed cutout

# white-knockout tuning
WHITE_MIN = 165       # a "background-ish" pixel has min(R,G,B) >= this (white + light shadow greys)
SAT_TOL = 30          # ...and low saturation (max-min) <= this (so it is grey/white, not a light colour)
GRAD_GAIN = 1.7       # alpha = (255 - min channel) * GAIN  -> graduated by distance from white
SHADOW_CAP = 165      # ...capped, so a soft shadow stays semi-transparent, never fully solid
ALPHA_KEEP = 10       # alpha above this counts as "real" content when trimming / detecting bg

# ----------------------------------------------------------------- quantizer
def detect_quantizer():
    """Return (kind, info) describing the best available PNG-8+alpha compressor."""
    pq = shutil.which("pngquant")
    if pq:
        return "pngquant", pq
    if features.check("libimagequant"):
        return "pillow-libimagequant", None
    return "pillow-fallback", None

QUANTIZER, QUANTIZER_PATH = detect_quantizer()


def human(nbytes):
    if nbytes < 1024:
        return f"{nbytes}B"
    if nbytes < 1024 * 1024:
        return f"{nbytes/1024:.1f}KB"
    return f"{nbytes/1024/1024:.2f}MB"


# ----------------------------------------------------------------- bg detection
def is_background_image(name, img):
    low = name.lower()
    if any(h in low for h in BG_HINTS):
        return True
    w, h = img.size
    if h and abs((w / h) - (16 / 9)) < 0.06:     # ~16:9
        return True
    return False


def has_white_background(rgba):
    """True if the image's border ring is mostly white-ish (so it needs knockout)."""
    arr = np.asarray(rgba)
    a = arr[..., 3]
    if (a < 250).mean() > 0.15:                  # already has meaningful transparency -> leave it
        return False
    rgb = arr[..., :3].astype(np.int16)
    minc = rgb.min(axis=2)
    sat = rgb.max(axis=2) - minc
    whiteish = (minc >= WHITE_MIN) & (sat <= SAT_TOL)
    border = np.concatenate([whiteish[0, :], whiteish[-1, :], whiteish[:, 0], whiteish[:, -1]])
    return border.mean() > 0.5


# ----------------------------------------------------------------- knockout
def border_connected(mask):
    """Boolean mask of the True-pixels in `mask` that are reachable from the image edge."""
    if _HAVE_SCIPY:
        structure = np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]], bool)   # 4-connectivity
        labels, n = ndimage.label(mask, structure=structure)
        if n == 0:
            return np.zeros_like(mask)
        edge = set(np.unique(np.concatenate([labels[0, :], labels[-1, :], labels[:, 0], labels[:, -1]])))
        edge.discard(0)
        return np.isin(labels, list(edge))
    # scipy-free fallback: multi-source BFS from the border over the candidate mask
    from collections import deque
    h, w = mask.shape
    seen = np.zeros_like(mask)
    dq = deque()
    for x in range(w):
        for y in (0, h - 1):
            if mask[y, x] and not seen[y, x]:
                seen[y, x] = True; dq.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if mask[y, x] and not seen[y, x]:
                seen[y, x] = True; dq.append((y, x))
    while dq:
        y, x = dq.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; dq.append((ny, nx))
    return seen


def knockout_white(rgba):
    """Return a new RGBA with the (edge-connected) white background made transparent,
    graduated by distance-from-white so soft shadows survive as semi-transparent grey."""
    arr = np.asarray(rgba).copy()
    rgb = arr[..., :3].astype(np.int16)
    minc = rgb.min(axis=2)
    sat = rgb.max(axis=2) - minc
    candidate = (minc >= WHITE_MIN) & (sat <= SAT_TOL)      # white + light-grey shadow pixels
    background = border_connected(candidate)               # ...only those reachable from the edge
    graded = np.clip((255 - minc).astype(np.float32) * GRAD_GAIN, 0, SHADOW_CAP).astype(np.uint8)
    alpha = np.where(background, graded, arr[..., 3]).astype(np.uint8)
    arr[..., 3] = alpha
    return Image.fromarray(arr, "RGBA")


def trim(rgba, pad=TRIM_PAD):
    a = np.asarray(rgba)[..., 3]
    ys, xs = np.where(a > ALPHA_KEEP)
    if len(xs) == 0:
        return rgba
    x0, x1 = xs.min(), xs.max() + 1
    y0, y1 = ys.min(), ys.max() + 1
    w, h = rgba.size
    x0 = max(0, x0 - pad); y0 = max(0, y0 - pad)
    x1 = min(w, x1 + pad); y1 = min(h, y1 + pad)
    return rgba.crop((int(x0), int(y0), int(x1), int(y1)))


def resize_long_edge(img, long_edge):
    w, h = img.size
    if max(w, h) == long_edge:
        return img
    scale = long_edge / float(max(w, h))
    return img.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)


# ----------------------------------------------------------------- compression
def save_cutout_png(rgba, out_path):
    """Save a cutout as a small PNG-8+alpha. Returns the quantizer label actually used."""
    if QUANTIZER == "pngquant":
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp_path = tmp.name
        try:
            rgba.save(tmp_path, "PNG")
            r = subprocess.run([QUANTIZER_PATH, "--force", "--skip-if-larger", "--strip",
                                "--quality=60-90", "--output", out_path, "--", tmp_path],
                               capture_output=True)
            if r.returncode == 0 and os.path.exists(out_path):
                return "pngquant"
            # 98/99 = couldn't meet quality / larger -> fall through to Pillow
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    if QUANTIZER == "pillow-libimagequant" or features.check("libimagequant"):
        try:
            q = rgba.quantize(colors=256, method=Image.Quantize.LIBIMAGEQUANT)
            q.save(out_path, "PNG", optimize=True)
            return "pillow-libimagequant"
        except Exception:
            pass
    # last-resort Pillow fallback: reduce the RGB to an adaptive palette (shrinks the file)
    # while keeping the full 8-bit graded alpha, then save an optimised RGBA PNG.
    rgb = rgba.convert("RGB").quantize(colors=255, method=Image.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")
    out = Image.merge("RGBA", (*rgb.split(), rgba.split()[3]))
    out.save(out_path, "PNG", optimize=True)
    return "pillow-fallback"


def save_background_webp(img, out_path):
    img.convert("RGB").save(out_path, "WEBP", quality=BG_WEBP_QUALITY, method=6)


# ----------------------------------------------------------------- per-file
def process_file(src, room):
    name = os.path.basename(src)
    stem = os.path.splitext(name)[0]
    orig_size = os.path.getsize(src)
    img = Image.open(src)
    img.load()

    if is_background_image(name, img):
        # backgrounds: fix width to 1024, keep aspect (≈16:9), save as quality-85 webp
        bw = BG_WIDTH
        bh = round(bw * img.size[1] / img.size[0])
        bg = img.convert("RGB").resize((bw, bh), Image.LANCZOS)
        out_path = os.path.join(OUTBOX, room, stem + ".webp")
        save_background_webp(bg, out_path)
        return dict(name=name, kind="background", out=os.path.basename(out_path),
                    orig=orig_size, final=os.path.getsize(out_path), dims=f"{bw}x{bh}", quant="webp-q85")

    rgba = img.convert("RGBA")
    if has_white_background(rgba):
        rgba = knockout_white(rgba)
    rgba = trim(rgba)
    rgba = resize_long_edge(rgba, CUTOUT_LONG_EDGE)
    out_path = os.path.join(OUTBOX, room, stem + ".png")
    used = save_cutout_png(rgba, out_path)
    return dict(name=name, kind="cutout", out=os.path.basename(out_path),
                orig=orig_size, final=os.path.getsize(out_path),
                dims=f"{rgba.size[0]}x{rgba.size[1]}", quant=used)


def rooms_to_process(argv):
    if len(argv) > 1:
        rooms = [a for a in argv[1:] if a.startswith("room")]
        if not rooms:
            print(f"Unrecognised argument(s): {argv[1:]} — expected e.g. room1")
            sys.exit(2)
        return rooms
    return sorted([d for d in os.listdir(INBOX) if d.startswith("room")
                   and os.path.isdir(os.path.join(INBOX, d))]) if os.path.isdir(INBOX) else []


def main():
    print(f"Quantizer: {QUANTIZER}" + (f" ({QUANTIZER_PATH})" if QUANTIZER_PATH else "")
          + f"   |   scipy flood-fill: {'yes' if _HAVE_SCIPY else 'no (BFS fallback)'}")
    rooms = rooms_to_process(sys.argv)
    if not rooms:
        print("Nothing to do — no room* folders found in _inbox.")
        return
    rows = []
    for room in rooms:
        in_dir = os.path.join(INBOX, room)
        out_dir = os.path.join(OUTBOX, room)
        os.makedirs(out_dir, exist_ok=True)
        files = sorted(f for f in os.listdir(in_dir)
                       if os.path.splitext(f)[1].lower() in IMG_EXTS)
        for f in files:
            try:
                rows.append((room, process_file(os.path.join(in_dir, f), room)))
            except Exception as e:
                rows.append((room, dict(name=f, kind="ERROR", out="-", orig=0, final=0,
                                        dims="-", quant=f"{type(e).__name__}: {e}")))

    if not rows:
        print("No images found in the selected room(s). Drop art into assets/manor/_inbox/room*/ and re-run.")
        return
    # summary table
    print()
    hdr = f"{'room':<6} {'file':<26} {'type':<10} {'orig':>9} -> {'final':>9} {'dims':>11}  {'quant'}"
    print(hdr); print("-" * len(hdr))
    tot_o = tot_f = 0
    for room, r in rows:
        tot_o += r["orig"]; tot_f += r["final"]
        print(f"{room:<6} {r['name'][:26]:<26} {r['kind']:<10} "
              f"{human(r['orig']):>9} -> {human(r['final']):>9} {r['dims']:>11}  {r['quant']}")
    print("-" * len(hdr))
    print(f"{'TOTAL':<6} {len(rows):<26} {'':<10} {human(tot_o):>9} -> {human(tot_f):>9}")


if __name__ == "__main__":
    main()
