# UI & Branding — `assets/ui/`

Theme-neutral UI and branding art (shared across all theme packs). See `UI_PROMPTS.md` for generation prompts.
Missing `<img>` assets hide gracefully (the button/text label remains); backgrounds fall back to a flat dark color.

## Expected filenames

Branding:
```
logo.svg            (or logo.png ~2048px wide)   — the CASEDOKU wordmark (in the header)
logo-subtitle.png   — the theme subtitle, e.g. "MANOR"
bg-desktop.jpg      1920×1080  — page background (desktop)
bg-mobile.jpg       1080×1920  — page background (mobile)
appicon.png         512×512    — app icon
appicon-192.png     192×192    — favicon / small icon
```

Difficulty badges (512×512, transparent):
```
badge-easy.png   badge-medium.png   badge-hard.png   badge-extreme.png
```

Reveal / case-file pieces (512×512, transparent):
```
stamp-caseclosed.png   frame-spotlight.png   ui-evidence-card.png
```

UI icons — `icon-<name>.svg` (used in the toolbar/modals; SVG, or 512×512 PNG):
```
icon-undo.svg    icon-redo.svg    icon-erase.svg    icon-hint.svg     icon-check.svg
icon-settings.svg icon-back.svg   icon-close.svg    icon-notebook.svg icon-lock.svg
```
