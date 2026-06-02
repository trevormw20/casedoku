# Victims — `assets/themes/manor/victims/`

The **victim cast** is a *separate* roster from the 16 playable suspects. Victims are
**never placeable on the board** and **never a candidate** — a victim is only ever "the
body" of a case. The case picks one victim (weighted by theme tags, no repeat within 8),
names them in the story, and shows their single crime-scene/deceased portrait in both the
case-file header and on the crime-scene (dashed) cell next to the weapon.

Defined in code as `THEME.victims` (see `#cludoku-theme` in `index.html`). Each victim has
`{slug, name, gender, age, class, vibe, themes[]}`.

## Expected filenames

One transparent PNG per victim slug (match the locked Cozy Cartoon Noir style;
head-and-shoulders bust, plain/transparent background for cutout):

```
victim-<slug>.png   — crime-scene/deceased portrait (case-file header + crime-scene cell)
```

**Graceful fallback:** a missing file never breaks the board — the `<img>` is only
assigned once the file is confirmed to load, so an absent asset simply shows the
silhouette placeholder (`.img-missing`). Drop real files in to override automatically.

## Slugs (50) — one file each

```
victim-lord-ambrose-vane.png
victim-dowager-clarissa-vane.png
victim-reginald-thorne.png
victim-vivian-thorne.png
victim-old-mr-pemberton.png
victim-agnes-holloway.png
victim-butler-crispin.png
victim-nanny-edith-frost.png
victim-doctor-silas-marsh.png
victim-nurse-beatrice-lowe.png
victim-barrister-quill.png
victim-madam-isolde-fenn.png
victim-professor-aldous-finch.png
victim-archivist-cordelia-wren.png
victim-colonel-rupert-hayes.png
victim-captain-mira-vance.png
victim-painter-lucien-roy.png
victim-chanteuse-delphine.png
victim-jeweller-otto-brandt.png
victim-florist-poppy-meade.png
victim-groundskeeper-mungo.png
victim-chambermaid-tilly.png
victim-vicar-edmund-pyke.png
victim-sister-mary-aldwin.png
victim-the-drifter-cole.png
victim-fortune-teller-zara.png
victim-financier-harlan-cross.png
victim-heiress-rosalind-day.png
victim-young-master-felix.png
victim-governess-prudence.png
victim-king-aldric-the-grey.png
victim-queen-mother-elspeth.png
victim-court-alchemist-bram.png
victim-the-veiled-oracle.png
victim-knight-sir-godfrey.png
victim-lady-rowena-of-ash.png
victim-guildmaster-orrin.png
victim-hedge-witch-morrow.png
victim-senator-gaius-velm.png
victim-vestal-claudia.png
victim-general-lucius-faro.png
victim-matron-octavia.png
victim-station-chief-orlov.png
victim-navigator-lyra-soon.png
victim-magnate-dex-corvale.png
victim-android-curator-vela.png
victim-saint-nick-stand-in.png
victim-caroler-margaret-yule.png
victim-orchard-keeper-hazel.png
victim-clockmaker-bartleby.png
```

## Theme tags

`themes[]` drives which packs a victim can appear in. The manor pack draws from
`victimThemes = ["manor","noir","general"]`; victims whose `themes[]` intersect that set
are eligible, weighted by the size of the overlap. Tags in use across the roster:
`manor, noir, general, medieval, fantasy, roman, space, futuristic, holiday, seasonal`.
