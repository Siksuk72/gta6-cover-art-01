# gta6-cover-art-01

[![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/c/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/Siksuk72/gta6-cover-art-01/rank.svg)](https://make.fun/c/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/Siksuk72/gta6-cover-art-01/reward.svg)](https://make.fun/c/gta6-cover-art-01)

**Vice Grid Cover Studio** — turn your photos into GTA-style poster covers, offline in your browser. Pick one or several photos, choose from 6 multi-panel layouts (Hero Left, Hero Top, Grid Four, Comic Strip, Five Panel, Full Bleed), pick one of 6 Vice City colour grades (Vice Sunset, Neon Nights, Golden Hour, Palm Noir, Pastel Vice, Mono Chrome), crop and position each panel by dragging and scrolling to zoom, write your big title, subtitle and tagline in bold outlined display lettering, then export a PNG in 1080 × 1080, 1080 × 1350 or 1920 × 1080.

Everything runs from static files with no network request: photos are read on your own machine and never uploaded. The display lettering is Anton under the SIL Open Font License, and the sample photos are AI-generated originals. No Rockstar Games logo, artwork or font is used anywhere.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Add your photos (or try the samples), pick a layout and grade, drag the panels to crop, edit the caption, and hit an export button.

## How it works

- `app/index.html` — the editor: photo tray, layout and grade pickers, caption fields, per-panel controls, export buttons, live preview canvas.
- `app/src/cover.js` — the cover engine: 6 layouts, 6 grades, per-panel cover-fit crop/zoom/pan, bold outlined Anton title block with badge ribbon, film grain and vignette.
- `app/src/main.js` — editor wiring: uploads, sample photos, drag-to-pan and wheel-to-zoom on the canvas, PNG export.
- `app/src/shots.js` — fixed `?shot=` scenes for screenshots.
- `app/fonts/Anton-Regular.ttf` — Anton, SIL Open Font License (see `app/fonts/OFL.txt`).
- `main.ts` — copies `app/` and `screenshots/` to the output directory and writes `dossier.json`.

<sub>Entered on [make.fun](https://make.fun/?ref=hz26ha21&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
