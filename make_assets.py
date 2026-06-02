#!/usr/bin/env python3
"""Generate placeholder art for Casedoku into the theme-pack folder structure.

Layout produced (real art drops in over these with no code change):

  assets/themes/<theme>/suspects/suspect-<role>.png         (+ -victim.png)
  assets/themes/<theme>/objects/object-<name>.png
  assets/themes/<theme>/rooms/room-<name>.png
  assets/themes/<theme>/weapons/weapon-<name>.png
  assets/ui/  logo.svg, logo-subtitle.png, bg-desktop.jpg, bg-mobile.jpg,
              badge-<tier>.png, stamp-caseclosed.png, frame-spotlight.png,
              ui-evidence-card.png, icon-<name>.svg, appicon.png, appicon-192.png

assets/reference/style-reference.png is left untouched.
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(ROOT, "assets")
THEME = "manor"
TROOT = os.path.join(ASSETS, "themes", THEME)
DIRS = {
    "suspects": os.path.join(TROOT, "suspects"),
    "objects":  os.path.join(TROOT, "objects"),
    "rooms":    os.path.join(TROOT, "rooms"),
    "weapons":  os.path.join(TROOT, "weapons"),
    "ui":       os.path.join(ASSETS, "ui"),
}
for d in DIRS.values():
    os.makedirs(d, exist_ok=True)


def font(size, bold=True):
    names = (["arialbd.ttf", "ariblk.ttf"] if bold else []) + ["arial.ttf", "segoeui.ttf"]
    for n in names:
        for base in (r"C:\Windows\Fonts", "/usr/share/fonts"):
            p = os.path.join(base, n)
            if os.path.exists(p):
                try:
                    return ImageFont.truetype(p, size)
                except Exception:
                    pass
    return ImageFont.load_default()


def hex2rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def centered(d, box, text, fnt, fill):
    bb = d.textbbox((0, 0), text, font=fnt)
    w, h = bb[2]-bb[0], bb[3]-bb[1]
    d.text((box[0]+(box[2]-box[0]-w)/2-bb[0], box[1]+(box[3]-box[1]-h)/2-bb[1]),
           text, font=fnt, fill=fill)


# ---- data -----------------------------------------------------------------
ROLES = [  # (slug, label, hex)
    ("colonel", "Colonel", "#D4A017"), ("widow", "Widow", "#7D3C98"),
    ("butler", "Butler", "#5D6D7E"), ("chef", "Chef", "#C0392B"),
    ("professor", "Professor", "#1E8449"), ("heiress", "Heiress", "#C2407A"),
    ("gardener", "Gardener", "#D86A1E"), ("captain", "Captain", "#2471A3"),
    ("doctor", "Doctor", "#17A2A2"), ("actress", "Actress", "#B03060"),
    ("inspector", "Inspector", "#3A4250"), ("maid", "Maid", "#4FA3D1"),
    ("heir", "Heir", "#7A8B3C"), ("magician", "Magician", "#3D348B"),
    ("antiquarian", "Antiquarian", "#9C6B30"), ("nurse", "Nurse", "#D98C9A"),
]
LETTERS = "ABCDEFGHIJKLMNOP"

OBJECTS = ["plant", "table", "chair", "bush", "tv", "bookshelf",
           "rug", "lamp", "bed", "painting", "fireplace", "vase"]
ROOMS = [  # (slug, label, hue)
    ("kitchen", "Kitchen", 200), ("library", "Library", 48), ("study", "Study", 35),
    ("lounge", "Lounge", 265), ("dining", "Dining", 20), ("conservatory", "Conservatory", 140),
    ("bedroom", "Bedroom", 320), ("billiard", "Billiard", 175), ("hall", "Grand Hall", 0),
]
WEAPONS = ["knife", "candlestick", "revolver", "rope", "wrench", "poison",
           "pipe", "poker", "pan", "letteropener", "rollingpin", "shears"]


# ---- suspects -------------------------------------------------------------
def draw_suspect(slug, letter, label, hexcol, victim=False):
    S = 512
    rgb = hex2rgb(hexcol)
    if victim:  # desaturate toward grey
        g = sum(rgb)//3
        rgb = tuple(int(c*0.4 + g*0.6) for c in rgb)
    img = Image.new("RGB", (S, S), tuple(int(c*0.4) for c in rgb))
    d = ImageDraw.Draw(img)
    top, bot = rgb, tuple(int(c*0.42) for c in rgb)
    for y in range(S):
        t = y/S
        d.line([(0, y), (S, y)], fill=tuple(int(top[i]*(1-t)+bot[i]*t) for i in range(3)))
    ov = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    od = ImageDraw.Draw(ov)
    od.ellipse([196, 150, 316, 270], fill=(255, 255, 255, 34))
    od.pieslice([140, 300, 372, 540], 180, 360, fill=(255, 255, 255, 34))
    img = Image.alpha_composite(img.convert("RGBA"), ov).convert("RGB")
    d = ImageDraw.Draw(img)
    mark = letter + ("†" if victim else "")
    centered(d, (0, 30, S, 210), mark, font(150), (235, 235, 235) if victim else (255, 255, 255))
    d.rectangle([0, 446, S, 512], fill=(0, 0, 0))
    plate = (label + " — VICTIM") if victim else label
    centered(d, (0, 452, S, 510), plate.upper(), font(40), (210, 200, 175) if victim else (235, 220, 180))
    img.save(os.path.join(DIRS["suspects"], f"suspect-{slug}{'-victim' if victim else ''}.png"))


for i, (slug, label, hx) in enumerate(ROLES):
    draw_suspect(slug, LETTERS[i], label, hx, False)
    draw_suspect(slug, LETTERS[i], label, hx, True)


# ---- tinted tile placeholders (objects / weapons) -------------------------
def tile(path, label, hue, transparent=True):
    S = 512
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    col = hsl(hue, 0.45, 0.5)
    d.rounded_rectangle([86, 86, 426, 426], radius=46, fill=col+(235,),
                        outline=(26, 26, 34, 255), width=8)
    centered(d, (86, 300, 426, 400), label.upper(), font(34), (20, 20, 26))
    centered(d, (86, 150, 426, 280), label[:1].upper(), font(120), (255, 255, 255, 230))
    if not transparent:
        bg = Image.new("RGBA", (S, S), (245, 232, 213, 255))
        img = Image.alpha_composite(bg, img)
    img.save(path)


def hsl(h, s, l):
    import colorsys
    r, g, b = colorsys.hls_to_rgb((h % 360)/360.0, l, s)
    return (int(r*255), int(g*255), int(b*255))


for name in OBJECTS:
    tile(os.path.join(DIRS["objects"], f"object-{name}.png"), name, (hash(name) % 360))
for name in WEAPONS:
    tile(os.path.join(DIRS["weapons"], f"weapon-{name}.png"), name, (hash(name) % 360))


# ---- room floors (patterned tiles) ----------------------------------------
def room_floor(slug, label, hue):
    S = 512
    img = Image.new("RGB", (S, S), hsl(hue, 0.30, 0.30))
    d = ImageDraw.Draw(img)
    a, b = hsl(hue, 0.30, 0.34), hsl(hue, 0.28, 0.26)
    step = S//8
    for yi in range(8):
        for xi in range(8):
            d.rectangle([xi*step, yi*step, (xi+1)*step, (yi+1)*step],
                        fill=a if (xi+yi) % 2 == 0 else b)
    d.rectangle([0, S-58, S, S], fill=(0, 0, 0))
    centered(d, (0, S-56, S, S-4), ("ROOM: " + label).upper(), font(34), (225, 212, 168))
    img.save(os.path.join(DIRS["rooms"], f"room-{slug}.png"))


for slug, label, hue in ROOMS:
    room_floor(slug, label, hue)


# ---- backgrounds ----------------------------------------------------------
def make_bg(path, w, h):
    img = Image.new("RGB", (w, h), (14, 16, 22))
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y/h
        d.line([(0, y), (w, y)], fill=(int(20+8*(1-t)), int(22+10*(1-t)), int(30+14*(1-t))))
    glow = Image.new("L", (w, h), 0)
    gd = ImageDraw.Draw(glow)
    cx, cy, r = w//2, int(h*0.28), int(min(w, h)*0.55)
    gd.ellipse([cx-r, cy-r, cx+r, cy+r], fill=120)
    glow = glow.filter(ImageFilter.GaussianBlur(min(w, h)//6))
    warm = Image.new("RGB", (w, h), (120, 92, 40))
    img = Image.composite(warm, img, glow.point(lambda p: int(p*0.5)))
    img.save(path, quality=82)


make_bg(os.path.join(DIRS["ui"], "bg-desktop.jpg"), 1920, 1080)
make_bg(os.path.join(DIRS["ui"], "bg-mobile.jpg"), 1080, 1920)


# ---- badges ---------------------------------------------------------------
def badge(tier, hexcol, star=False):
    S = 512
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    col = hex2rgb(hexcol)
    d.polygon([(256, 60), (430, 130), (430, 300), (256, 452), (82, 300), (82, 130)],
              fill=col+(255,), outline=(26, 26, 34, 255))
    d.ellipse([176, 150, 336, 310], outline=(245, 232, 213, 255), width=10)
    if star:
        d.polygon([(256, 195), (272, 240), (320, 240), (282, 268),
                   (296, 314), (256, 286), (216, 314), (230, 268),
                   (192, 240), (240, 240)], fill=(245, 232, 213, 255))
    centered(d, (82, 360, 430, 440), tier.upper(), font(48), (245, 232, 213))
    img.save(os.path.join(DIRS["ui"], f"badge-{tier}.png"))


for t, c, s in [("easy", "#2E8B57", False), ("medium", "#E0B04A", False),
                ("hard", "#D86A1E", False), ("extreme", "#5B3A66", True)]:
    badge(t, c, s)


# ---- stamp / frame / evidence card / subtitle -----------------------------
def stamp():
    S = 512
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    red = (170, 40, 40, 235)
    d.ellipse([40, 110, 472, 402], outline=red, width=12)
    d.ellipse([66, 134, 446, 378], outline=red, width=4)
    centered(d, (66, 180, 446, 330), "CASE\nCLOSED", font(86), red)
    img = img.rotate(-8, resample=Image.BICUBIC, expand=False)
    img.save(os.path.join(DIRS["ui"], "stamp-caseclosed.png"))


def spotlight():
    S = 512
    glow = Image.new("L", (S, S), 0)
    gd = ImageDraw.Draw(glow)
    gd.ellipse([96, 96, 416, 416], fill=255)
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    img = Image.new("RGBA", (S, S), (8, 9, 13, 255))
    gold = Image.new("RGBA", (S, S), (224, 176, 74, 255))
    img = Image.composite(gold, img, glow)
    # punch a transparent center
    hole = Image.new("L", (S, S), 0)
    ImageDraw.Draw(hole).ellipse([150, 150, 362, 362], fill=255)
    hole = hole.filter(ImageFilter.GaussianBlur(40))
    img.putalpha(Image.eval(hole, lambda p: 255-p))
    img.save(os.path.join(DIRS["ui"], "frame-spotlight.png"))


def evidence_card():
    S = 512
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([46, 70, 466, 442], radius=26, fill=(242, 232, 213, 255),
                        outline=(26, 26, 34, 255), width=6)
    d.rectangle([300, 56, 360, 96], fill=(224, 176, 74, 255), outline=(26, 26, 34, 255))
    img.save(os.path.join(DIRS["ui"], "ui-evidence-card.png"))


def subtitle():
    img = Image.new("RGBA", (512, 128), (0, 0, 0, 0))
    centered(ImageDraw.Draw(img), (0, 0, 512, 128), "MANOR", font(72), (242, 232, 213, 255))
    img.save(os.path.join(DIRS["ui"], "logo-subtitle.png"))


stamp(); spotlight(); evidence_card(); subtitle()


# ---- app icon -------------------------------------------------------------
def appicon(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    s = size
    d.rounded_rectangle([s*0.06, s*0.06, s*0.94, s*0.94], radius=s*0.18,
                        fill=(27, 35, 48, 255))
    g0, g1, gs = s*0.20, s*0.66, (s*0.66-s*0.20)/3
    for k in range(4):
        d.line([(g0+gs*k, g0), (g0+gs*k, g1)], fill=(224, 176, 74, 255), width=max(2, int(s*0.012)))
        d.line([(g0, g0+gs*k), (g1, g0+gs*k)], fill=(224, 176, 74, 255), width=max(2, int(s*0.012)))
    d.ellipse([s*0.50, s*0.50, s*0.78, s*0.78], outline=(242, 232, 213, 255), width=max(3, int(s*0.03)))
    d.line([(s*0.76, s*0.76), (s*0.88, s*0.88)], fill=(242, 232, 213, 255), width=max(3, int(s*0.04)))
    img.save(os.path.join(DIRS["ui"], f"appicon{'' if size==512 else '-'+str(size)}.png"))


appicon(512); appicon(192)


# ---- UI icons (SVG) -------------------------------------------------------
STROKE = "#e7d4a8"
WRAP = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" '
        'stroke="{s}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">{b}</svg>')
ICONS = {
    "undo":  '<path d="M4 8h9a5 5 0 0 1 0 10H7"/><path d="M4 8l4-4M4 8l4 4"/>',
    "redo":  '<path d="M20 8h-9a5 5 0 0 0 0 10h6"/><path d="M20 8l-4-4M20 8l-4 4"/>',
    "erase": '<path d="M4 16l7-7 6 6-4 4H8z"/><path d="M11 9l5 5"/><path d="M3 21h11"/>',
    "hint":  '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10c1 1 1.5 2 1.5 3h5c0-1 .5-2 1.5-3a6 6 0 0 0-4-10z"/>',
    "check": '<path d="M4 12l5 6L20 5"/>',
    "settings": '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    "back":  '<path d="M15 5l-7 7 7 7"/>',
    "close": '<path d="M6 6l12 12M18 6L6 18"/>',
    "notebook": '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 3v18"/><path d="M12 8h4M12 12h4M12 16h4"/>',
    "lock": '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
}
for name, body in ICONS.items():
    with open(os.path.join(DIRS["ui"], f"icon-{name}.svg"), "w", encoding="utf-8") as fh:
        fh.write(WRAP.format(s=STROKE, b=body))

# logo.svg (CASEDOKU + MANOR)
LOGO = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 80">
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
        font-weight="bold" letter-spacing="2">CASEDOKU</text>
  <text x="80" y="60" font-family="Georgia, serif" font-size="13" fill="#9aa0aa"
        letter-spacing="8">MANOR</text>
</svg>'''
with open(os.path.join(DIRS["ui"], "logo.svg"), "w", encoding="utf-8") as fh:
    fh.write(LOGO)

# ---- report ---------------------------------------------------------------
total = 0
for dp, _, files in os.walk(ASSETS):
    for f in files:
        if "reference" in dp:
            continue
        total += 1
print(f"Generated placeholder assets under assets/ (theme '{THEME}'): {total} files")
for kind, d in DIRS.items():
    print(f"  {os.path.relpath(d, ROOT)}: {len(os.listdir(d))} files")
