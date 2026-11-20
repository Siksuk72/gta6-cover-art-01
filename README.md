# Siksuk72/gta6-cover-art-01

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Siksuk72/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Siksuk72/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# 🌅 AFTERGLOW — GTA-style Cover Art Studio

*Entri untuk bounty make.fun `gta6-cover-art-01` ($250, 50 tempat dibayar).*

Web app offline: foto + caption → poster multi-panel gaya GTA 6 → PNG siap share
(1080×1080, 1080×1350, 1920×1080). Foto tidak pernah keluar dari mesin.

## Seni (100% orisinal — tanpa aset Rockstar)

Semua digambar dari kode di `app/poster.js`:

- **Sunset / Neon / Dusk / Chrome grade** — filter canvas + overlay gradient per panel
- **Retro sun** bergaris, **chrome lettering** (gradient + outline + glint + hard shadow) — lettering digambar tangan di kode, tanpa file font
- **Palem & skyline siluet**, film grain, vignette
- **Hero panel pop-out** — panel utama miring dengan drop shadow, menonjol dari grid
- Frame putih + caption plate ala poster

## Editor (foto apa pun)

- Tambah foto (klik/drag-drop) → langsung ke panel hero: **1 langkah ke cover**
- Klik panel → pilih foto, zoom slider, **drag untuk posisi**, wheel untuk zoom
- Grade & caption per panel, judul + tagline, 3 template layout
- **Live preview** mengikuti ukuran export — WYSIWYG penuh
- Export 1 klik per ukuran

## Menjalankan

Buka `app/index.html` di Chrome desktop — bekerja tanpa jaringan.
Demo tanpa file: `app/index.html?demo=1` (2 foto contoh digambar prosedural).

Menyerahkan entry:

```bash
node main.ts   # menyalin app/ + screenshots/ ke /output + dossier.json
```

## Run it

```sh
# open the app in a desktop browser (works offline, no network needed)
# app/index.html — or serve it locally:
python3 -m http.server 8080
# then open http://localhost:8080/app/index.html?demo=1
# hand the entry in (copies app/ + screenshots/ to /output + dossier.json):
node main.ts
```

## Struktur

```
main.ts            # menyerahkan entry (copy + buildDossier dari kit)
app/index.html     # editor
app/style.css      # UI
app/editor.js      # state, interaksi, export
app/poster.js      # engine render poster (semua seni)
screenshots/       # 4 tangkapan asli
```

## Lisensi

MIT — lihat [LICENSE](LICENSE).

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
