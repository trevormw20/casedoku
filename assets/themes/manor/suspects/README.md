# Suspects — `assets/themes/manor/suspects/`

Drop suspect art here. Named by **role** (see `CAST_PROMPTS.md`). 1024×1024 (or any square), transparent PNG.
If a file is missing the game falls back to the colored lettered placeholder token, so you can add art incrementally.

## Expected filenames (16 roles)

Alive — `suspect-<role>.png`:

```
suspect-colonel.png      suspect-widow.png        suspect-butler.png       suspect-chef.png
suspect-professor.png    suspect-heiress.png      suspect-gardener.png     suspect-captain.png
suspect-doctor.png       suspect-actress.png      suspect-inspector.png    suspect-maid.png
suspect-heir.png         suspect-magician.png     suspect-antiquarian.png  suspect-nurse.png
```

Victim variant — `suspect-<role>-victim.png` (same 16 roles):

```
suspect-colonel-victim.png      suspect-widow-victim.png        suspect-butler-victim.png
suspect-chef-victim.png         suspect-professor-victim.png    suspect-heiress-victim.png
suspect-gardener-victim.png     suspect-captain-victim.png      suspect-doctor-victim.png
suspect-actress-victim.png      suspect-inspector-victim.png    suspect-maid-victim.png
suspect-heir-victim.png         suspect-magician-victim.png     suspect-antiquarian-victim.png
suspect-nurse-victim.png
```

The active game uses the first N suspects (9 for the 9×9 board, 6 for the 6×6 board).
