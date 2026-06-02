# Victims — `assets/themes/manor/victims/`

The **victim cast** is a *separate* roster from the 16 playable suspects. Victims are
**never placeable on the board** and **never a candidate** — a victim is only ever "the
body" of a case. The case picks one victim (weighted by theme tags, no repeat within 8),
names them in the story, shows their **living** portrait in the case-file header, and
their **dead** variant on the crime-scene (dashed) cell next to the weapon.

Defined in code as `THEME.victims` (see `#cludoku-theme` in `index.html`). Each victim has
`{slug, name, gender, age, class, vibe, themes[]}`.

## Expected filenames

For every victim slug, two transparent PNGs (match the locked Cozy Cartoon Noir style;
head-and-shoulders bust, plain/transparent background for cutout):

```
victim-<slug>.png        — living portrait (case-file header)
victim-<slug>-dead.png   — deceased variant (crime-scene cell)
```

**Graceful fallback:** a missing file never breaks the board — the `<img>` is only
assigned once the file is confirmed to load, so an absent asset simply shows the
silhouette placeholder (`.img-missing`). Drop real files in to override automatically.

## Slugs (50) — two files each

```
victim-lord-ambrose-vane.png          victim-lord-ambrose-vane-dead.png
victim-dowager-clarissa-vane.png      victim-dowager-clarissa-vane-dead.png
victim-reginald-thorne.png            victim-reginald-thorne-dead.png
victim-vivian-thorne.png              victim-vivian-thorne-dead.png
victim-old-mr-pemberton.png           victim-old-mr-pemberton-dead.png
victim-agnes-holloway.png             victim-agnes-holloway-dead.png
victim-butler-crispin.png             victim-butler-crispin-dead.png
victim-nanny-edith-frost.png          victim-nanny-edith-frost-dead.png
victim-doctor-silas-marsh.png         victim-doctor-silas-marsh-dead.png
victim-nurse-beatrice-lowe.png        victim-nurse-beatrice-lowe-dead.png
victim-barrister-quill.png            victim-barrister-quill-dead.png
victim-madam-isolde-fenn.png          victim-madam-isolde-fenn-dead.png
victim-professor-aldous-finch.png     victim-professor-aldous-finch-dead.png
victim-archivist-cordelia-wren.png    victim-archivist-cordelia-wren-dead.png
victim-colonel-rupert-hayes.png       victim-colonel-rupert-hayes-dead.png
victim-captain-mira-vance.png         victim-captain-mira-vance-dead.png
victim-painter-lucien-roy.png         victim-painter-lucien-roy-dead.png
victim-chanteuse-delphine.png         victim-chanteuse-delphine-dead.png
victim-jeweller-otto-brandt.png       victim-jeweller-otto-brandt-dead.png
victim-florist-poppy-meade.png        victim-florist-poppy-meade-dead.png
victim-groundskeeper-mungo.png        victim-groundskeeper-mungo-dead.png
victim-chambermaid-tilly.png          victim-chambermaid-tilly-dead.png
victim-vicar-edmund-pyke.png          victim-vicar-edmund-pyke-dead.png
victim-sister-mary-aldwin.png         victim-sister-mary-aldwin-dead.png
victim-the-drifter-cole.png           victim-the-drifter-cole-dead.png
victim-fortune-teller-zara.png        victim-fortune-teller-zara-dead.png
victim-financier-harlan-cross.png     victim-financier-harlan-cross-dead.png
victim-heiress-rosalind-day.png       victim-heiress-rosalind-day-dead.png
victim-young-master-felix.png         victim-young-master-felix-dead.png
victim-governess-prudence.png         victim-governess-prudence-dead.png
victim-king-aldric-the-grey.png       victim-king-aldric-the-grey-dead.png
victim-queen-mother-elspeth.png       victim-queen-mother-elspeth-dead.png
victim-court-alchemist-bram.png       victim-court-alchemist-bram-dead.png
victim-the-veiled-oracle.png          victim-the-veiled-oracle-dead.png
victim-knight-sir-godfrey.png         victim-knight-sir-godfrey-dead.png
victim-lady-rowena-of-ash.png         victim-lady-rowena-of-ash-dead.png
victim-guildmaster-orrin.png          victim-guildmaster-orrin-dead.png
victim-hedge-witch-morrow.png         victim-hedge-witch-morrow-dead.png
victim-senator-gaius-velm.png         victim-senator-gaius-velm-dead.png
victim-vestal-claudia.png             victim-vestal-claudia-dead.png
victim-general-lucius-faro.png        victim-general-lucius-faro-dead.png
victim-matron-octavia.png             victim-matron-octavia-dead.png
victim-station-chief-orlov.png        victim-station-chief-orlov-dead.png
victim-navigator-lyra-soon.png        victim-navigator-lyra-soon-dead.png
victim-magnate-dex-corvale.png        victim-magnate-dex-corvale-dead.png
victim-android-curator-vela.png       victim-android-curator-vela-dead.png
victim-saint-nick-stand-in.png        victim-saint-nick-stand-in-dead.png
victim-caroler-margaret-yule.png      victim-caroler-margaret-yule-dead.png
victim-orchard-keeper-hazel.png       victim-orchard-keeper-hazel-dead.png
victim-clockmaker-bartleby.png        victim-clockmaker-bartleby-dead.png
```

## Theme tags

`themes[]` drives which packs a victim can appear in. The manor pack draws from
`victimThemes = ["manor","noir","general"]`; victims whose `themes[]` intersect that set
are eligible, weighted by the size of the overlap. Tags in use across the roster:
`manor, noir, general, medieval, fantasy, roman, space, futuristic, holiday, seasonal`.
