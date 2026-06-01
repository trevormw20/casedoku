#!/usr/bin/env python3
"""Generate placeholder art for Cludoku.

Creates everything the app references so real art can be dropped in later
with no code changes. Raster files match the exact dimensions the brief asks
for; SVGs are simple, recognizable line icons.
"""
import os
import struct
import zlib
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(ROOT, "assets")
ICONS = os.path.join(ASSETS, "icons")
os.makedirs(ICONS, exist_ok=True)


def load_font(size, bold=True):
    candidates = []
    if bold:
        candidates += ["arialbd.ttf", "ariblk.ttf"]
    candidates += ["arial.ttf", "segoeui.ttf"]
    for name in candidates:
        for base in (r"C:\Windows\Fonts", "/usr/share/fonts"):
            p = os.path.join(base, name)
            if os.path.exists(p):
                try:
                    return ImageFont.truetype(p, size)
                except Exception:
                    pass
    return ImageFont.load_default()


# --- Suspect portraits: suspect-01.png .. suspect-09.png (512x512) ----------
# Placeholder = colored card with a silhouette bust + the suspect letter.
SUSPECTS = [
    ("A", "Scarlet",  (193, 39, 45)),
    ("B", "Mustard",  (214, 158, 46)),
    ("C", "Plum",     (123, 64, 145)),
    ("D", "Green",    (46, 139, 87)),
    ("E", "Peacock",  (32, 107, 156)),
    ("F", "Orchid",   (199, 102, 168)),
    ("G", "Slate",    (96, 108, 122)),
    ("H", "Azure",    (52, 168, 188)),
    ("I", "Ivory",    (193, 178, 140)),
]


def draw_suspect(idx, letter, name, rgb):
    S = 512
    img = Image.new("RGB", (S, S), tuple(max(0, c - 70) for c in rgb))
    d = ImageDraw.Draw(img)
    # vertical gradient
    top = rgb
    bot = tuple(int(c * 0.45) for c in rgb)
    for y in range(S):
        t = y / S
        col = tuple(int(top[i] * (1 - t) + bot[i] * t) for i in range(3))
        d.line([(0, y), (S, y)], fill=col)
    # silhouette bust
    sil = (255, 255, 255, 40)
    overlay = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.ellipse([196, 150, 316, 270], fill=(255, 255, 255, 38))          # head
    od.pieslice([140, 300, 372, 540], 180, 360, fill=(255, 255, 255, 38))  # shoulders
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"), (0, 0))
    d = ImageDraw.Draw(img)
    # letter badge
    f = load_font(150)
    bbox = d.textbbox((0, 0), letter, font=f)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text(((S - w) / 2 - bbox[0], 40 - bbox[1]), letter, font=f, fill=(255, 255, 255))
    # name plate
    fn = load_font(46)
    nb = d.textbbox((0, 0), name.upper(), font=fn)
    nw = nb[2] - nb[0]
    d.rectangle([0, 446, S, 512], fill=(0, 0, 0))
    d.text(((S - nw) / 2 - nb[0], 452 - nb[1]), name.upper(), font=fn, fill=(235, 220, 180))
    img.save(os.path.join(ASSETS, f"suspect-{idx:02d}.png"))


for i, (letter, name, rgb) in enumerate(SUSPECTS, start=1):
    draw_suspect(i, letter, name, rgb)


# --- Backgrounds: noir vignette gradients -----------------------------------
def make_bg(path, w, h):
    img = Image.new("RGB", (w, h), (14, 16, 22))
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        base = (
            int(20 + 8 * (1 - t)),
            int(22 + 10 * (1 - t)),
            int(30 + 14 * (1 - t)),
        )
        d.line([(0, y), (w, y)], fill=base)
    # warm light pool near top-center (interrogation lamp)
    glow = Image.new("L", (w, h), 0)
    gd = ImageDraw.Draw(glow)
    cx, cy = w // 2, int(h * 0.28)
    r = int(min(w, h) * 0.55)
    gd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=120)
    glow = glow.filter(ImageFilter.GaussianBlur(min(w, h) // 6))
    warm = Image.new("RGB", (w, h), (120, 92, 40))
    img = Image.composite(warm, img, glow.point(lambda p: int(p * 0.5)))
    img.save(path, quality=82)


make_bg(os.path.join(ASSETS, "bg-desktop.jpg"), 1920, 1080)
make_bg(os.path.join(ASSETS, "bg-mobile.jpg"), 1080, 1920)


# --- SVG icons --------------------------------------------------------------
STROKE = "#e7d4a8"
WRAP = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" '
        'fill="none" stroke="{s}" stroke-width="1.8" stroke-linecap="round" '
        'stroke-linejoin="round">{body}</svg>')

ICON_BODIES = {
    # UI
    "undo":  '<path d="M4 8h9a5 5 0 0 1 0 10H7"/><path d="M4 8l4-4M4 8l4 4"/>',
    "redo":  '<path d="M20 8h-9a5 5 0 0 0 0 10h6"/><path d="M20 8l-4-4M20 8l-4 4"/>',
    "erase": '<path d="M4 16l7-7 6 6-4 4H8z"/><path d="M11 9l5 5"/><path d="M3 21h11"/>',
    "hint":  '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10c1 1 1.5 2 1.5 3h5c0-1 .5-2 1.5-3a6 6 0 0 0-4-10z"/>',
    "check": '<path d="M4 12l5 6L20 5"/>',
    "settings": '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    "back":  '<path d="M15 5l-7 7 7 7"/>',
    "close": '<path d="M6 6l12 12M18 6L6 18"/>',
    # objects / rooms
    "plant": '<path d="M12 21V11"/><path d="M12 11C7 11 6 6 6 6c5 0 6 5 6 5z"/><path d="M12 12c5 0 6-5 6-5-5 0-6 5-6 5z"/><path d="M8 21h8"/>',
    "table": '<path d="M3 9h18"/><path d="M5 9v10M19 9v10"/><path d="M3 9l3-4h12l3 4"/>',
    "chair": '<path d="M7 3v8M17 3v8"/><path d="M6 11h12"/><path d="M7 11l-1 9M17 11l1 9"/><path d="M7 16h10"/>',
    "bush":  '<path d="M5 16a4 4 0 0 1 1-7 4 4 0 0 1 7-1 4 4 0 0 1 5 4 3 3 0 0 1-1 5z"/><path d="M5 16h13"/><path d="M11 16v5"/>',
    "tv":    '<rect x="3" y="5" width="18" height="12" rx="1"/><path d="M8 21h8M12 17v4"/>',
    "bookshelf": '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M4 9h16M4 15h16"/><path d="M8 3v6M16 9v6"/>',
    "rug":   '<path d="M3 12l9-5 9 5-9 5z"/><path d="M7 12l5-2 5 2-5 2z"/>',
    "lamp":  '<path d="M9 3h6l3 7H6z"/><path d="M12 10v8"/><path d="M8 21h8"/><path d="M10 18h4"/>',
    "bed":   '<path d="M3 18v-7h14a4 4 0 0 1 4 4v3"/><path d="M3 11V7M3 18v2M21 18v2"/><path d="M3 14h18"/><path d="M6 11V9h6v2"/>',
    "painting": '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M7 16l3-4 2 2 3-4 2 6z"/><circle cx="9" cy="9" r="1"/>',
}

for name, body in ICON_BODIES.items():
    with open(os.path.join(ICONS, f"{name}.svg"), "w", encoding="utf-8") as fh:
        fh.write(WRAP.format(s=STROKE, body=body))

# logo.svg — magnifier over a mini grid + wordmark
logo = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f0d98c"/><stop offset="1" stop-color="#c79a3a"/>
  </linearGradient></defs>
  <g fill="none" stroke="url(#g)" stroke-width="3">
    <rect x="10" y="14" width="52" height="52" rx="4"/>
    <path d="M10 31h52M10 48h52M27 14v52M44 14v52"/>
  </g>
  <g fill="none" stroke="#e7d4a8" stroke-width="5" stroke-linecap="round">
    <circle cx="44" cy="48" r="14"/><path d="M54 58l12 12"/>
  </g>
  <text x="78" y="40" font-family="Georgia, serif" font-size="30" fill="#f0d98c"
        font-weight="bold" letter-spacing="2">CLUDOKU</text>
  <text x="80" y="60" font-family="Georgia, serif" font-size="12" fill="#9aa0aa"
        letter-spacing="6">A MURDER IN NINE ROOMS</text>
</svg>'''
with open(os.path.join(ASSETS, "logo.svg"), "w", encoding="utf-8") as fh:
    fh.write(logo)

print("Assets generated:")
for dirpath, _, files in os.walk(ASSETS):
    for f in sorted(files):
        p = os.path.join(dirpath, f)
        print(f"  {os.path.relpath(p, ROOT)}  ({os.path.getsize(p)} bytes)")
