# Room Floors — `assets/themes/manor/rooms/`

Drop top-down room floor art here. 1024×1024, seamless/tileable, no walls/doors/furniture (see `ROOM_PROMPTS.md`).
Each floor is tiled across its 3×3 room on the board. Missing files fall back to a flat color tint, so the board still works.

## Expected filenames (9) — JPG (converted from PNG to reduce size)

```
room-kitchen.jpg    room-library.jpg    room-study.jpg
room-lounge.jpg     room-dining.jpg     room-conservatory.jpg
room-bedroom.jpg    room-billiard.jpg   room-hall.jpg
```

The board loads `room-<slug>.jpg`. A missing file still falls back to the flat color tint.
