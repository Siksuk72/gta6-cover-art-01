// AFTERGLOW Cover Studio — poster rendering engine.
// All art is drawn here from scratch: retro-sun, chrome lettering, palm and
// skyline silhouettes, film grain and the Vice-style colour grades.
// No font files, no images, no Rockstar artwork: every mark is code.

// ---------- colour grades ----------

export const GRADES = {
  sunset: { name: 'Sunset grade', filter: 'saturate(1.18) contrast(1.07) brightness(1.02)' },
  neon: { name: 'Neon grade', filter: 'saturate(1.42) contrast(1.12)' },
  dusk: { name: 'Dusk grade', filter: 'saturate(0.92) contrast(1.1) brightness(0.96)' },
  chrome: { name: 'Chrome grade', filter: 'saturate(0.55) contrast(1.16) brightness(1.04)' },
};

const NIGHT_NAVY = '#141033';
const HORIZON_MAUVE = '#5b2a6e';
const SUN_PINK = '#ff4fa0';
const SUN_ORANGE = '#ffb347';
const PALM_INK = '#0c0a24';

// ---------- background ----------

function drawDuskBackground(g, W, H) {
  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, NIGHT_NAVY);
  sky.addColorStop(0.55, HORIZON_MAUVE);
  sky.addColorStop(1, '#2a1440');
  g.fillStyle = sky;
  g.fillRect(0, 0, W, H);
}

// ---------- retro sun (striped, classic) ----------

export function drawRetroSun(g, cx, cy, r) {
  g.save();
  const body = g.createLinearGradient(cx, cy - r, cx, cy + r);
  body.addColorStop(0, SUN_PINK);
  body.addColorStop(1, SUN_ORANGE);
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.closePath();
  g.clip();
  g.fillStyle = body;
  g.fillRect(cx - r, cy - r, r * 2, r * 2);
  // horizontal gaps, wider towards the bottom
  const bands = 7;
  g.fillStyle = 'rgba(20,16,51,0.92)';
  for (let i = 1; i <= bands; i++) {
    const y = cy + (i / (bands + 1)) * r * 1.7;
    const h = r * 0.035 * i * (0.6 + 0.25 * i);
    g.fillRect(cx - r, y, r * 2, h);
  }
  g.restore();
}

// ---------- chrome caption lettering ----------

// Our own lettering, drawn stroke by stroke: gradient chrome fill, dark
// outline, thin top highlight and a hard offset shadow. No font files used.
export function drawChromeLettering(g, text, cx, y, size, opts = {}) {
  const spacing = (opts.spacing ?? 0.06) * size;
  const widths = [...text].map(ch => g.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * Math.max(0, text.length - 1);
  let x = cx - total / 2;
  const grad = g.createLinearGradient(0, y - size * 0.85, 0, y + size * 0.25);
  grad.addColorStop(0, '#fff6fb');
  grad.addColorStop(0.34, '#ffc6de');
  grad.addColorStop(0.52, SUN_ORANGE);
  grad.addColorStop(0.72, '#ff5f9e');
  grad.addColorStop(1, '#37146e');
  g.save();
  g.font = `900 ${size}px sans-serif`;
  g.textBaseline = 'alphabetic';
  for (let pass = 0; pass < 4; pass++) {
    let px = x;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const w = widths[i];
      if (pass === 0) { // hard offset shadow
        g.fillStyle = 'rgba(10,6,30,0.55)';
        g.fillText(ch, px + size * 0.045, y + size * 0.05);
      } else if (pass === 1) { // dark outline
        g.lineWidth = size * 0.085;
        g.lineJoin = 'round';
        g.strokeStyle = '#1a0b3c';
        g.strokeText(ch, px, y);
      } else if (pass === 2) { // chrome fill
        g.fillStyle = grad;
        g.fillText(ch, px, y);
      } else { // top glint
        g.save();
        g.beginPath();
        g.rect(x - size, y - size * 1.02, total + size * 2, size * 0.52);
        g.clip();
        g.fillStyle = 'rgba(255,255,255,0.5)';
        g.fillText(ch, px, y);
        g.restore();
      }
      px += w + spacing;
    }
  }
  g.restore();
  return total;
}

export function drawTagline(g, text, cx, y, size) {
  g.save();
  g.font = `600 ${size}px sans-serif`;
  g.textBaseline = 'alphabetic';
  g.fillStyle = 'rgba(255,244,250,0.94)';
  const spacing = size * 0.32;
  const widths = [...text].map(ch => g.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * Math.max(0, text.length - 1);
  let x = cx - total / 2;
  for (let i = 0; i < text.length; i++) {
    g.fillText(text[i], x, y);
    x += widths[i] + spacing;
  }
  g.restore();
  return total;
}

// ---------- scenery silhouettes (original art) ----------

export function drawPalmSilhouette(g, x, baseY, h, lean = 0) {
  g.save();
  g.fillStyle = PALM_INK;
  g.strokeStyle = PALM_INK;
  // trunk: a curved tapered stroke
  g.beginPath();
  g.lineWidth = Math.max(2, h * 0.055);
  g.lineCap = 'round';
  g.moveTo(x, baseY);
  g.quadraticCurveTo(x + lean * h * 0.5, baseY - h * 0.55, x + lean * h, baseY - h);
  g.stroke();
  // fronds from the crown
  const cx = x + lean * h;
  const cy = baseY - h;
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (0.08 + (i / 6) * 0.84);
    const len = h * (0.38 + 0.1 * Math.sin(i * 1.7));
    const ex = cx + Math.cos(a) * len * (i % 2 ? 1 : -1);
    const ey = cy - Math.sin(a) * len * 0.55;
    g.beginPath();
    g.lineWidth = Math.max(1.5, h * 0.028);
    g.moveTo(cx, cy);
    g.quadraticCurveTo(cx + (ex - cx) * 0.5, ey - h * 0.12, ex, ey + h * 0.08);
    g.stroke();
  }
  g.restore();
}

export function drawSkylineBand(g, x, y, w, h) {
  g.save();
  g.fillStyle = PALM_INK;
  let px = x;
  let i = 0;
  while (px < x + w - h * 0.3) {
    const bw = h * (0.35 + 0.4 * ((i * 37) % 5) / 5);
    const bh = h * (0.35 + 0.6 * ((i * 61) % 7) / 7);
    g.fillRect(px, y + h - bh, bw, bh);
    // a few lit windows
    g.fillStyle = 'rgba(255,179,71,0.5)';
    for (let k = 0; k < 3; k++) {
      if ((i * 7 + k * 13) % 3 === 0) {
        g.fillRect(px + bw * 0.25, y + h - bh + bh * 0.2 + k * bh * 0.22, bw * 0.12, bh * 0.07);
      }
    }
    g.fillStyle = PALM_INK;
    px += bw + h * 0.08;
    i++;
  }
  g.restore();
}

// ---------- texture ----------

let grainTile = null;
function getGrainTile() {
  if (grainTile) return grainTile;
  const c = document.createElement('canvas');
  c.width = c.height = 160;
  const g = c.getContext('2d');
  const img = g.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 118 + Math.floor(Math.random() * 20);
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  grainTile = c;
  return c;
}

function addGrain(g, W, H) {
  g.save();
  g.globalAlpha = 0.07;
  g.globalCompositeOperation = 'overlay';
  const pat = g.createPattern(getGrainTile(), 'repeat');
  g.fillStyle = pat;
  g.fillRect(0, 0, W, H);
  g.restore();
}

function addVignette(g, W, H) {
  const v = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.4, W / 2, H / 2, Math.max(W, H) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(8,4,28,0.42)');
  g.fillStyle = v;
  g.fillRect(0, 0, W, H);
}

// ---------- photo grading inside a panel ----------

export function drawGradedPhoto(g, img, dx, dy, dWidth, dHeight, gradeName, crop) {
  const grade = GRADES[gradeName] || GRADES.sunset;
  g.save();
  g.beginPath();
  g.rect(dx, dy, dWidth, dHeight);
  g.clip();
  g.fillStyle = '#1a1038';
  g.fillRect(dx, dy, dWidth, dHeight);
  if (img) {
    const ir = img.width / img.height;
    const pr = dWidth / dHeight;
    let w, h;
    const z = crop ? crop.zoom : 1;
    if (ir > pr) { h = dHeight * z; w = h * ir; } else { w = dWidth * z; h = w / ir; }
    let ox = (dWidth - w) / 2 + (crop ? crop.dx : 0) * dWidth;
    let oy = (dHeight - h) / 2 + (crop ? crop.dy : 0) * dHeight;
    if (crop && crop.rot) {
      g.translate(dx + dWidth / 2, dy + dHeight / 2);
      g.rotate(crop.rot * Math.PI / 180);
      g.translate(-(dx + dWidth / 2), -(dy + dHeight / 2));
    }
    try { g.filter = grade.filter; } catch (e) { /* older engine: draw unfiltered */ }
    // the crop offsets are panel-relative: the image lands inside the panel
    g.drawImage(img, dx + ox, dy + oy, w, h);
    g.filter = 'none';
    // colour grade overlays on top of the photo
    const ov = g.createLinearGradient(0, dy, 0, dy + dHeight);
    if (gradeName === 'neon') {
      ov.addColorStop(0, 'rgba(255,79,160,0.30)');
      ov.addColorStop(1, 'rgba(64,220,255,0.28)');
    } else if (gradeName === 'dusk') {
      ov.addColorStop(0, 'rgba(40,40,120,0.20)');
      ov.addColorStop(1, 'rgba(255,79,160,0.24)');
    } else if (gradeName === 'chrome') {
      ov.addColorStop(0, 'rgba(255,225,180,0.16)');
      ov.addColorStop(1, 'rgba(90,60,160,0.20)');
    } else {
      ov.addColorStop(0, 'rgba(255,105,180,0.20)');
      ov.addColorStop(0.55, 'rgba(255,140,60,0.20)');
      ov.addColorStop(1, 'rgba(25,25,90,0.30)');
    }
    g.globalCompositeOperation = 'soft-light';
    g.fillStyle = ov;
    g.fillRect(dx, dy, dWidth, dHeight);
    g.globalCompositeOperation = 'source-over';
    // gentle bottom shading so caption plates stay readable
    const sh = g.createLinearGradient(0, dy + dHeight * 0.6, 0, dy + dHeight);
    sh.addColorStop(0, 'rgba(10,6,30,0)');
    sh.addColorStop(1, 'rgba(10,6,30,0.55)');
    g.fillStyle = sh;
    g.fillRect(dx, dy, dWidth, dHeight);
  }
  g.restore();
}

// ---------- sample photos (drawn, so the app demos without any file) ----------

export function drawSamplePhoto(kind = 0, w = 1100, h = 1400) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, h * 0.62);
  sky.addColorStop(0, '#2b1a5e');
  sky.addColorStop(0.5, '#b03d7e');
  sky.addColorStop(1, '#ff9d5c');
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h * 0.62);
  drawRetroSun(g, w * 0.62, h * 0.40, w * 0.17);
  // sea
  const sea = g.createLinearGradient(0, h * 0.62, 0, h * 0.8);
  sea.addColorStop(0, '#432a6e');
  sea.addColorStop(1, '#1c1442');
  g.fillStyle = sea;
  g.fillRect(0, h * 0.62, w, h * 0.18);
  // sand
  g.fillStyle = '#c98a5e';
  g.fillRect(0, h * 0.8, w, h * 0.2);
  // figure silhouette
  g.fillStyle = '#150d33';
  const fx = w * (kind ? 0.4 : 0.56), fy = h * 0.52, s = h * 0.075;
  g.beginPath(); g.arc(fx, fy, s * 0.5, 0, Math.PI * 2); g.fill();           // head
  g.beginPath();                                                             // body
  g.ellipse(fx, fy + s * 1.25, s * 0.62, s * 1.15, 0, 0, Math.PI * 2); g.fill();
  g.fillRect(fx - s * 0.5, fy + s * 2.2, s * 0.42, s * 2.3);                 // legs
  g.fillRect(fx + s * 0.08, fy + s * 2.2, s * 0.42, s * 2.3);
  drawPalmSilhouette(g, w * 0.14, h * 0.8, h * 0.34, 0.25);
  if (kind) drawPalmSilhouette(g, w * 0.9, h * 0.62, h * 0.3, -0.2);
  return c;
}

// ---------- layout ----------

export function layoutPanels(W, H, template, panelCount, posterPortrait = false) {
  const m = Math.round(Math.min(W, H) * 0.035);          // outer margin
  const gap = Math.round(Math.min(W, H) * 0.022);
  const rects = [];
  const innerW = W - m * 2;
  if (template === 'hero') {
    if (posterPortrait || H >= W) { // hero on top, row of panels below
      const heroH = Math.round((H - m * 2 - gap) * 0.66);
      rects.push({ x: m, y: m, w: innerW, h: heroH, hero: true });
      const n = Math.max(1, panelCount - 1);
      const pw = (innerW - gap * (n - 1)) / n;
      for (let i = 0; i < n; i++) {
        rects.push({ x: m + i * (pw + gap), y: m + heroH + gap, w: pw, h: H - m * 2 - heroH - gap });
      }
    } else { // hero left, stack right
      const heroW = Math.round((innerW - gap) * (W > H * 1.4 ? 0.62 : 0.58));
      rects.push({ x: m, y: m, w: heroW, h: H - m * 2, hero: true });
      const n = Math.max(1, panelCount - 1);
      const ph = (H - m * 2 - gap * (n - 1)) / n;
      for (let i = 0; i < n; i++) {
        rects.push({ x: m + heroW + gap, y: m + i * (ph + gap), w: innerW - heroW - gap, h: ph });
      }
    }
  } else if (template === 'duo') {
    if (H >= W) {
      const ph = (H - m * 2 - gap) / 2;
      rects.push({ x: m, y: m, w: innerW, h: ph, hero: true });
      rects.push({ x: m, y: m + ph + gap, w: innerW, h: ph });
    } else {
      const pw = (innerW - gap) / 2;
      rects.push({ x: m, y: m, w: pw, h: H - m * 2, hero: true });
      rects.push({ x: m + pw + gap, y: m, w: pw, h: H - m * 2 });
    }
  } else { // grid: even rows
    const n = Math.max(2, panelCount);
    const cols = n <= 3 ? n : (H >= W ? 2 : 3);
    const rows = Math.ceil(n / cols);
    const pw = (innerW - gap * (cols - 1)) / cols;
    const ph = (H - m * 2 - gap * (rows - 1)) / rows;
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / cols), cIdx = i % cols;
      const cnt = (r === rows - 1) ? (n - (rows - 1) * cols) : cols;
      const rw = (innerW - gap * (cnt - 1)) / cnt;
      const x = m + (cIdx < cnt ? cIdx : cIdx) * (rw + gap);
      rects.push({ x, y: m + r * (ph + gap), w: cIdx < cnt ? rw : rw, h: ph, hero: i === 0 });
    }
  }
  return rects;
}

// ---------- poster renderer ----------

export const SIZES = {
  square: { w: 1080, h: 1080, label: '1080 × 1080' },
  portrait: { w: 1080, h: 1350, label: '1080 × 1350' },
  wide: { w: 1920, h: 1080, label: '1920 × 1080' },
};

export function renderPoster(canvas, state, photos, sizeKey) {
  const S = SIZES[sizeKey] || SIZES.square;
  canvas.width = S.w; canvas.height = S.h;
  const g = canvas.getContext('2d');
  const W = S.w, H = S.h;
  drawDuskBackground(g, W, H);

  const wide = W > H * 1.3;
  const titleH = Math.round(H * (wide ? 0.30 : 0.24));
  const decoH = Math.round(H * 0.10);
  const bandY = wide ? H - decoH : H - decoH;
  // scenery band along the bottom
  g.save();
  g.globalAlpha = 0.9;
  drawSkylineBand(g, 0, bandY, W * 0.6, decoH);
  drawPalmSilhouette(g, W * 0.87, H, decoH * 2.4, 0.16);
  drawPalmSilhouette(g, W * 0.95, H, decoH * 1.7, -0.28);
  drawPalmSilhouette(g, W * 0.78, H, decoH * 1.9, 0.24);
  drawPalmSilhouette(g, W * 0.05, H, decoH * 2.1, 0.2);
  g.restore();

  // panel area: between title band and deco band
  const panelTop = wide ? 0 : titleH;
  const panelBottom = bandY;
  const area = { x: 0, y: panelTop, w: W, h: panelBottom - panelTop };
  const rects = layoutPanels(area.w, area.h, state.template, state.panels.length, H > W);
  // plateH now computed per panel inside the loop

  state.panels.forEach((p, i) => {
    const r = rects[i % rects.length];
    const photo = p.photo != null ? photos[p.photo] : null;
    // in wide covers the big title sits over the hero's lower edge — skip its plate
    const plateH = (state.panelCaptions && !(wide && r.hero)) ? Math.round(Math.min(W, H) * 0.045) : 0;
    const px = area.x + r.x, py = area.y + r.y;
    // hero pop-out: slight tilt + drop shadow, overlapping neighbours
    const tilt = r.hero && p.tilt ? -1.6 : 0;
    g.save();
    if (r.hero) {
      g.shadowColor = 'rgba(8,4,26,0.6)';
      g.shadowBlur = Math.min(W, H) * 0.035;
      g.shadowOffsetY = Math.min(W, H) * 0.012;
    }
    if (tilt) {
      g.translate(px + r.w / 2, py + r.h / 2);
      g.rotate(tilt * Math.PI / 180);
      g.translate(-(px + r.w / 2), -(py + r.h / 2));
    }
    const ph = plateH ? r.h - plateH : r.h;
    // white frame behind the panel
    g.fillStyle = '#f7f3ec';
    roundRect(g, px, py, r.w, r.h, Math.min(W, H) * 0.012);
    g.fill();
    drawGradedPhoto(g, photo, px + r.w * 0.012, py + r.w * 0.012,
      r.w * 0.976, ph - r.w * 0.024, p.grade, p);
    if (plateH && p.caption) {
      g.fillStyle = '#f7f3ec';
      g.fillRect(px + r.w * 0.012, py + ph, r.w * 0.976, plateH - r.w * 0.012);
      g.fillStyle = '#17103a';
      g.font = `700 ${Math.round(plateH * 0.52)}px sans-serif`;
      g.textBaseline = 'middle';
      g.textAlign = 'center';
      g.save();
      g.beginPath(); g.rect(px, py + ph, r.w, plateH); g.clip();
      g.fillText(p.caption.toUpperCase(), px + r.w / 2, py + ph + plateH * 0.5);
      g.restore();
      g.textAlign = 'left';
    }
    g.restore();
  });

  // caption lettering block
  const titleY = wide ? bandY - decoH * 0.45 : titleH * 0.62;
  const sunR = Math.min(W, H) * (wide ? 0.17 : 0.15);
  drawRetroSun(g, W / 2, wide ? bandY - decoH * 0.1 : titleH * 0.35, sunR);
  const titleSize = fitTitle(g, state.title, W * 0.86, H * 0.085);
  g.font = `900 ${titleSize}px sans-serif`;
  drawChromeLettering(g, state.title, W / 2, titleY, titleSize);
  drawTagline(g, state.tagline, W / 2, titleY + titleSize * 0.42, Math.max(11, titleSize * 0.22));

  addVignette(g, W, H);
  addGrain(g, W, H);
  return canvas;
}

function roundRect(g, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function fitTitle(g, text, maxW, maxH) {
  let size = maxH;
  for (let i = 0; i < 12; i++) {
    g.font = `900 ${size}px sans-serif`;
    if (g.measureText(text).width <= maxW) break;
    size *= 0.94;
  }
  return size;
}
