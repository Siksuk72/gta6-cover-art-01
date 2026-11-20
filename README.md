# gta6-cover-art-01

[![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/c/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/Siksuk72/gta6-cover-art-01/rank.svg)](https://make.fun/c/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/Siksuk72/gta6-cover-art-01/reward.svg)](https://make.fun/c/gta6-cover-art-01)

**Vice Grid Cover Studio** — turn your photos into GTA-style movie poster covers, offline in your browser. Pick one or several photos, choose from 8 multi-panel layouts (Hero Left, Hero Top, Grid Four, Comic Strip, Five Panel, Full Bleed, Poster Seven, Cinema Strip), pick one of 8 Vice City colour grades (Vice Sunset, Neon Nights, Golden Hour, Palm Noir, Pastel Vice, Mono Chrome, Ember Rush, Flamingo Teal), crop and position each panel by dragging and scrolling to zoom, then export a PNG in 1080 × 1080, 1080 × 1350 or 1920 × 1080.

## v2: a real movie poster, not a photo grid

- **Giant striped title** — the big title runs full width across the lower-middle in horizontal sunset stripes (orange / pink / purple) with a dark outline and hard drop shadow, with a script subtitle overlapping its lower edge and a black tagline ribbon underneath.
- **Hero pop-out** — the Poster Seven layout has 7 panels with the middle one drawn larger, overlapping its neighbours with a white border and drop shadow, like the lead on a film poster.
- **Cast role tags** — every panel carries a small angled black/white role tag (THE LEAD, THE DRIVER, THE INSIDER, THE FIXER, THE LOOKOUT, THE BOSS, THE RIDER by default), each editable in the editor.
- **Press quote** — a top bar with 5 gold stars and an editable press quote, plus a gold VOL. 1 badge.
- **Billing block, seal and barcode** — the bottom strip carries the billing line ("A VICE GRID PICTURE · STARRING YOU · SHOT ON YOUR OWN CAMERA · GRADED BY HAND"), a COMING SOON strip, a drawn barcode with numbers, and a gold starburst seal reading "ORIGINAL COVER ART" (toggleable).
- **Face-aware crop** — every panel has a focus point (default 0.5, 0.35 — the upper third, where faces usually are) and the cover-fit crop centres on it instead of the photo centre. Turn on "Set focus point" (or hold Alt) and click a face in a panel to move its focus point; a cyan crosshair marks it.
- **Cinema Strip layout** — a second new layout stacking three film strips: one wide strip, three panels, two wide panels.

Everything runs from static files with no network request: photos are read on your own machine and never uploaded. The display lettering is Anton under the SIL Open Font License, and the sample photos are AI-generated originals. No Rockstar Games logo, artwork or font is used anywhere.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Add your photos (or try the samples), pick a layout and grade, drag the panels to crop, Alt-click a face to set the focus point, edit the title, quote and role tags, and hit an export button.

## How it works

- `app/index.html` — the editor: photo tray, layout and grade pickers, caption fields, poster-chrome controls (quote, seal, role tags), per-panel controls with focus mode, export buttons, live preview canvas.
- `app/src/cover.js` — the cover engine: 8 layouts, 8 grades, per-panel cover-fit crop/zoom/pan around a face-aware focus point, role tags, giant striped chrome title with script subtitle and tagline ribbon, press-quote bar, billing block, starburst seal, barcode, film grain and vignette.
- `app/src/main.js` — editor wiring: uploads, sample photos, drag-to-pan and wheel-to-zoom on the canvas, focus-point clicks, PNG export.
- `app/src/shots.js` — fixed `?shot=` scenes for screenshots.
- `app/fonts/Anton-Regular.ttf` — Anton, SIL Open Font License (see `app/fonts/OFL.txt`).
- `main.ts` — copies `app/` and `screenshots/` to the output directory and writes `dossier.json`.

<sub>Entered on [make.fun](https://make.fun/?ref=hz26ha21&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
