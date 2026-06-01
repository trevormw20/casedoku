# Cludoku — Art Bible
**Direction: Cozy Cartoon Noir**
_Single source of truth for all visual assets. Generate everything against this so the suspects, rooms, weapons, UI, and board read as one game. Built to be reskinned later for DLC theme packs (medieval, kid-friendly, etc.)._

## 1. The vibe in one line
Charming, rounded cartoon characters and cozy interiors, wrapped in a warm-but-moody mystery atmosphere — think a friendly whodunit board game lit by a single desk lamp. Approachable, never grim.

## 2. Color palette (locked)
**Noir base (backgrounds, walls, shadows)**
- Ink Navy `#1B2330`
- Charcoal `#2A2F3A`
- Warm Black (outlines) `#1A1A22`

**Warm woods & interiors**
- Walnut `#8B5E3C`
- Oak `#B07B4F`
- Honey `#C9A06A`

**Case-file paper (UI surfaces, clue cards)**
- Cream `#F2E8D5`
- Aged Paper `#E8D9B5`
- Gold Accent `#E0B04A`

**Suspect signature colors (one per cast member, must stay distinct at token size)**
- Scarlet `#C0392B`
- Mustard `#D4A017`
- Plum `#7D3C98`
- Forest `#1E8449`
- Royal `#2471A3`
- Rose `#C2407A`
- Amber `#D86A1E`
- Teal `#17A2A2`
- Slate `#5D6D7E`

Rule: noir base + warm woods carry the world; jewel-tone suspect colors are the only high-saturation pops. Never let two suspects share a color family.

## 3. Line & shading
- Bold, uniform-weight outline in Warm Black `#1A1A22`, slightly rounded corners — hand-drawn warmth, no thin/scratchy lines.
- Two-tone cel shading only: one base color + one soft shadow tone. No smooth gradients, no realistic rendering.
- Subtle paper-grain texture overlay across everything for the cozy vintage feel.
- Highlights are flat shapes, not glossy.

## 4. Lighting & mood
- Single warm key light (the "desk lamp / chandelier" feel), soft shadows pooling toward room edges.
- Overall value is mid-to-dark so the cream UI and jewel suspect colors glow against it.
- Mood is inviting curiosity, not dread.

## 5. Camera & perspective (critical for the board)
- Room floors and the board: STRAIGHT top-down, 90°, orthographic. No tilt, no vanishing point. Every room must use the identical angle or the mansion won't read as one house.
- Suspects: front-facing bust/portrait (head + shoulders), eye-level, for both the round board token and the case-file mugshot.
- Objects/weapons: top-down to match the floor when placed on the board, OR a clean 3/4 icon for menus — pick one per use and stay consistent.

## 6. Board architecture — THREE LAYERS (do not bake into art)
1. **Floor layer** — each room = its floor pattern + ambient styling only. Walls cropped flush at the frame edge. NO doors, NO walls drawn, edge-agnostic, seamless. The only per-room art you generate.
2. **Object layer** — furniture as separate transparent icons the engine drops into individual cells. Never painted into the floor (would collide with suspect tokens).
3. **Wall + door layer** — drawn programmatically as a vector overlay: thick Warm Black `#1A1A22` walls between rooms with gaps for doorways, a game-controlled property. This is what stitches the rooms into one connected mansion and stays identical across all theme packs.

## 7. Room floor tiles — spec + prompt
- Square 1:1, generate 1024×1024, seamless, transparent or flat fill, NO walls/doors.
- Prompt template: "Top-down view of an empty [ROOM] floor, cozy cartoon noir style, bold rounded black outlines, flat two-tone cel shading, warm wood and muted jewel-tone palette, soft single-lamp lighting, decorative patterned floor, subtle paper grain, walls cropped at the edge of the frame, floor pattern continues to all four edges, no doorways, no walls drawn, no people, no text, 1:1."
- The nine rooms: Kitchen, Library, Study, Lounge, Dining Room, Conservatory, Bedroom, Billiard Room, Grand Hall.

## 8. Suspect characters — spec + prompt
- Generate 12–16 so procedural casts vary. Front-facing bust, 1:1, 1024×1024, plain flat background for easy cutout.
- Rounded, friendly proportions (slightly large head, simple expressive face), one strong silhouette + one signature color each (see palette).
- Generate the whole cast in ONE consistent pass / from one style reference so they look like one family.
- Prompt template: "Character bust portrait of [DESCRIPTION], cozy cartoon noir style, bold rounded black outlines, flat two-tone cel shading, friendly rounded proportions, expressive simple face, wearing [signature color #HEX] clothing, soft warm lighting, subtle paper grain, plain flat [color] background, front-facing, no text, 1:1."
- Each suspect also gets a greyed/slumped "victim" variant for when they're the body.

## 9. Weapons — spec + prompt
- 10–12 (knife, candlestick, revolver, rope, wrench, poison vial, lead pipe, etc.). 512×512, transparent.
- Prompt template: "A [WEAPON] icon, cozy cartoon noir style, bold rounded black outline, flat two-tone cel shading, warm muted palette, subtle paper grain, centered, plain background for cutout, no text, 1:1."

## 10. Crime-scene dressing
- Chalk body outline, blood splatter (stylized, not gory — a soft cartoon splash), numbered evidence markers, police tape, magnifying glass, fingerprint, footprint. 512×512 transparent, same outline/shading rules.

## 11. Room objects / furniture
- ~12 (plant, table, chair, bush, TV, bookshelf, rug, lamp, bed, painting, fireplace, broken vase). 512×512 transparent, top-down to sit on the floor tiles, same style rules.

## 12. UI & iconography
- Surfaces use Cream/Aged Paper with Gold accents — clue cards look like case-file paper.
- Icons (undo, redo, erase, hint, check, settings, back, close, notebook, lock): single Warm Black line on transparent, simple rounded forms; generate 512×512 then trace to SVG.
- Typography pairing recommendation: a friendly rounded display face for the logo/headers, a clean humanist sans for clue text. Keep body text high-contrast on the cream cards.

## 13. Branding & screens
- CLUDOKU logo/wordmark: rounded cartoon lettering, Gold + Cream on noir, playful but legible; transparent, ~2048px wide.
- Main background: a cozy detective's desk / evidence corkboard under a warm lamp. Landscape 1920×1080 and portrait 1080×1920.
- Difficulty badges (Rookie / Detective / Inspector / Chief): enamel-pin style emblems, 512×512 transparent.
- Reveal art: a cartoon "Case Closed" rubber stamp + a warm spotlight frame for the killer.

## 14. Asset checklist (names, size, format)
- suspect-01…16.png — 1024×1024, transparent
- suspect-01…16_victim.png — 1024×1024, transparent
- room-kitchen / library / study / lounge / dining / conservatory / bedroom / billiard / hall .png — 1024×1024, seamless
- weapon-[name].png ×10–12 — 512×512, transparent
- object-[name].png ×12 — 512×512, transparent
- scene-[name].png ×7 — 512×512, transparent
- icon-[name].svg ×10 (trace from 512 raster)
- badge-rookie/detective/inspector/chief.png — 512×512, transparent
- logo.svg (or logo.png ~2048w), bg-desktop.jpg 1920×1080, bg-mobile.jpg 1080×1920
- stamp-caseclosed.png, frame-spotlight.png — 512×512, transparent

## 15. Reskinning for DLC theme packs
The style + 3-layer board are theme-agnostic by design. A pack = same slots, redrawn: medieval → knight/maid suspects, dagger/mace weapons, great-hall/armory/dungeon rooms; kid-friendly → softer palette, rounder characters, "missing cookie" tone. Keep outline weight, shading, and top-down camera identical so packs feel like the same game.

## 16. nano banana workflow
- Generate ONE "style frame" you love first; feed it as the reference image for everything else ("match this exact style").
- Make the suspect cast in a single batch for consistency.
- Generate on a plain flat background and cut out for transparency; never pre-crop tokens to circles (CSS handles that).
- 1:1 for suspects/objects/icons; 16:9 and 9:16 for backgrounds; generate at 1024+ and downscale.

---
After creating and committing ART_BIBLE.md, just confirm it's saved — no need to change any code.
