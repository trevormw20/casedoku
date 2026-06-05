# assets/manor — manor restoration assets

Staging + output tree for the manor restoration art. See **`tools/ART_PIPELINE.md`**
for the full how-to and the one command.

## Folder layout

```
_inbox/room1 … room9/      raw downloads you drop in (ORIGINALS — never modified)
_processed/room1 … room9/  cleaned + compressed output of tools/process_art.py
<room-id>/                 the shipped, hand-named finals + manifest.json
```

## Room number → room id

| # | room id            |
|---|--------------------|
| 1 | `study`            |
| 2 | `entry-hall`       |
| 3 | `library`          |
| 4 | `trophy-hall`      |
| 5 | `press-room`       |
| 6 | `portrait-gallery` |
| 7 | `wine-cellar`      |
| 8 | `attic`            |
| 9 | `secret-office`    |

Flow: drop art in `_inbox/room#/` → `python tools/process_art.py` →
review `_processed/room#/` against `MANOR_IMAGE_PROMPTS` → place named finals in
`<room-id>/` with a `manifest.json` logging original→final decisions.
