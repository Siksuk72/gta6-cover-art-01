// Vice Grid cover engine v2: draws a full movie-poster cover onto a 2D
// canvas from the user's photos and the editor state — press-quote bar,
// role-tagged panels with a hero pop-out, a giant striped retro-chrome
// title, script subtitle, tagline ribbon, billing block, starburst seal
// and barcode. All lettering is drawn with the bundled Anton font (OFL)
// — no Rockstar artwork or fonts. Sample photos are our own AI originals.

export const EXPORT_SIZES = {
  square: { w: 1080, h: 1080, label: '1080 x 1080' },
  portrait: { w: 1080, h: 1350, label: '1080 x 1350' },
  wide: { w: 1920, h: 1080, label: '1920 x 1080' },
};

// Eight panel layouts. Each panel is [x, y, w, h] in fractions of the cover.
// `hero` names the panel drawn larger, overlapping its neighbours, with a
// white border and drop shadow — the movie-poster hero pop-out.
export const LAYOUTS = {
  'hero-left': {
    name: 'Hero Left',
    panels: [[0, 0, 0.62, 1], [0.62, 0, 0.38, 0.33], [0.62, 0.33, 0.38, 0.34], [0.62, 0.67, 0.38, 0.33]],
  },
  'hero-top': {
    name: 'Hero Top',
    panels: [[0, 0, 1, 0.58], [0, 0.58, 0.33, 0.42], [0.33, 0.58, 0.34, 0.42], [0.67, 0.58, 0.33, 0.42]],
  },
  'grid-four': {
    name: 'Grid Four',
    panels: [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]],
  },
  'comic-strip': {
    name: 'Comic Strip',
    panels: [[0, 0, 0.5, 0.36], [0.5, 0, 0.5, 0.36], [0, 0.36, 1, 0.28], [0, 0.64, 0.5, 0.36], [0.5, 0.64, 0.5, 0.36]],
  },
  'five-panel': {
    name: 'Five Panel',
    panels: [[0, 0, 0.34, 0.5], [0, 0.5, 0.34, 0.5], [0.34, 0, 0.32, 1], [0.66, 0, 0.34, 0.5], [0.66, 0.5, 0.34, 0.5]],
  },
  'full-bleed': {
    name: 'Full Bleed',
    panels: [[0, 0, 1, 1], [0.04, 0.72, 0.29, 0.22], [0.355, 0.72, 0.29, 0.22], [0.67, 0.72, 0.29, 0.22]],
  },
  'poster-seven': {
    name: 'Poster Seven',
    hero: 3,
    panels: [
      [0, 0, 0.33, 0.30], [0.33, 0, 0.34, 0.30], [0.67, 0, 0.33, 0.30],
      [0.30, 0.28, 0.40, 0.38],
      [0, 0.30, 0.30, 0.32], [0.70, 0.30, 0.30, 0.32],
      [0, 0.62, 1, 0.38],
    ],
  },
  'cinema-strip': {
    name: 'Cinema Strip',
    panels: [
      [0, 0, 1, 0.30],
      [0, 0.30, 0.33, 0.30], [0.33, 0.30, 0.34, 0.30], [0.67, 0.30, 0.33, 0.30],
      [0, 0.60, 0.5, 0.40], [0.5, 0.60, 0.5, 0.40],
    ],
  },
};

// Eight colour grades: each tints the photos with a sunset / neon wash and
// sets the title colours. `wash` is painted with the overlay blend mode.
export const GRADES = {
  'vice-sunset': {
    name: 'Vice Sunset', top: 'rgba(255, 94, 98, 0.34)', bottom: 'rgba(255, 149, 0, 0.42)',
    title: '#ffffff', accent: '#ff5e62', sub: '#ffd166', filter: 'saturate(1.3) contrast(1.06)',
  },
  'neon-nights': {
    name: 'Neon Nights', top: 'rgba(0, 229, 255, 0.30)', bottom: 'rgba(255, 0, 153, 0.44)',
    title: '#ffffff', accent: '#00e5ff', sub: '#ff7ad9', filter: 'saturate(1.45) contrast(1.1)',
  },
  'golden-hour': {
    name: 'Golden Hour', top: 'rgba(255, 190, 80, 0.26)', bottom: 'rgba(255, 110, 30, 0.40)',
    title: '#fff8e7', accent: '#ffb627', sub: '#ffe9a8', filter: 'saturate(1.25) contrast(1.04) brightness(1.04)',
  },
  'palm-noir': {
    name: 'Palm Noir', top: 'rgba(20, 20, 60, 0.42)', bottom: 'rgba(255, 60, 90, 0.34)',
    title: '#f5f0ff', accent: '#ff3c5a', sub: '#b8b3ff', filter: 'saturate(1.05) contrast(1.18) brightness(0.94)',
  },
  'pastel-vice': {
    name: 'Pastel Vice', top: 'rgba(255, 170, 220, 0.30)', bottom: 'rgba(120, 220, 255, 0.32)',
    title: '#ffffff', accent: '#ff9ed2', sub: '#aee9ff', filter: 'saturate(1.15) contrast(1.0) brightness(1.06)',
  },
  'mono-chrome': {
    name: 'Mono Chrome', top: 'rgba(255, 255, 255, 0.10)', bottom: 'rgba(0, 0, 0, 0.34)',
    title: '#ffffff', accent: '#ffd166', sub: '#d8d8d8', filter: 'grayscale(1) contrast(1.22) brightness(1.02)',
  },
  'ember-rush': {
    name: 'Ember Rush', top: 'rgba(255, 60, 10, 0.38)', bottom: 'rgba(190, 10, 40, 0.46)',
    title: '#fff3e0', accent: '#ff3d00', sub: '#ffc46b', filter: 'saturate(1.5) contrast(1.12) brightness(1.0)',
  },
  'flamingo-teal': {
    name: 'Flamingo Teal', top: 'rgba(255, 110, 180, 0.34)', bottom: 'rgba(0, 190, 180, 0.42)',
    title: '#ffffff', accent: '#ff6eb4', sub: '#7ef0e2', filter: 'saturate(1.4) contrast(1.08)',
  },
};

export const DEFAULT_ROLES = ['THE LEAD', 'THE DRIVER', 'THE INSIDER', 'THE FIXER', 'THE LOOKOUT', 'THE BOSS', 'THE RIDER'];
export const DEFAULT_PANEL = { photo: 0, zoom: 1, dx: 0, dy: 0, fx: 0.5, fy: 0.35 };

/** A fresh default state for the editor. */
export function defaultState() {
  return {
    layout: 'poster-seven',
    grade: 'vice-sunset',
    size: 'wide',
    title: 'VICE CITY',
    subtitle: 'Neon Shore',
    tagline: 'One city. One night. No brakes.',
    badge: 'VOL. 1',
    quote: '"NEON-SOAKED AND DANGEROUS" — VICE GAZETTE',
    billing: 'A VICE GRID PICTURE · STARRING YOU · SHOT ON YOUR OWN CAMERA · GRADED BY HAND',
    roles: [...DEFAULT_ROLES],
    seal: true,
    frame: true,
    grain: true,
    panels: Array.from({ length: 7 }, (_, i) => ({ ...DEFAULT_PANEL, photo: i % 3 })),
  };
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The hero pop-out rect: the base rect grown a little on every side. */
export function heroRect(rect) {
  const grow = 0.022;
  return [rect[0] - grow, rect[1] - grow, rect[2] + grow * 2, rect[3] + grow * 2];
}

/**
 * Draws one photo into a panel rect, cover-fit, with the panel zoom/pan.
 * The crop centres on the panel focus point (fx, fy) — the upper third by
 * default, where faces usually are — instead of the photo centre.
 */
export function drawPanelPhoto(ctx, photo, rect, panel, filter) {
  const [fx, fy, fw, fh] = rect;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const x = fx * w, y = fy * h, pw = fw * w, ph = fh * h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, pw, ph);
  ctx.clip();
  if (!photo) {
    const g = ctx.createLinearGradient(x, y, x, y + ph);
    g.addColorStop(0, '#3a1c5e');
    g.addColorStop(1, '#12081f');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, pw, ph);
    ctx.restore();
    return;
  }
  const base = Math.max(pw / photo.naturalWidth, ph / photo.naturalHeight);
  const scale = base * (panel.zoom || 1);
  const dw = photo.naturalWidth * scale;
  const dh = photo.naturalHeight * scale;
  // Put the focus point of the photo at the centre of the panel (plus pan),
  // then clamp so the photo always covers the whole panel: without the
  // clamp a focus near an edge would leave a strip of bare frame showing.
  const fpx = panel.fx == null ? 0.5 : panel.fx;
  const fpy = panel.fy == null ? 0.35 : panel.fy;
  let ox = x + pw / 2 + (panel.dx || 0) * pw - fpx * dw;
  let oy = y + ph / 2 + (panel.dy || 0) * ph - fpy * dh;
  ox = Math.min(x, Math.max(x + pw - dw, ox));
  oy = Math.min(y, Math.max(y + ph - dh, oy));
  ctx.filter = filter || 'none';
  ctx.drawImage(photo, ox, oy, dw, dh);
  ctx.filter = 'none';
  ctx.restore();
}

/** Paints the grade wash over one panel rect. */
export function paintGrade(ctx, rect, grade) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const x = rect[0] * w, y = rect[1] * h, pw = rect[2] * w, ph = rect[3] * h;
  const g = ctx.createLinearGradient(x, y, x, y + ph);
  g.addColorStop(0, grade.top);
  g.addColorStop(1, grade.bottom);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, pw, ph);
  ctx.clip();
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = g;
  ctx.fillRect(x, y, pw, ph);
  ctx.globalCompositeOperation = 'source-over';
  const shade = ctx.createLinearGradient(x, y + ph * 0.55, x, y + ph);
  shade.addColorStop(0, 'rgba(10, 4, 24, 0)');
  shade.addColorStop(1, 'rgba(10, 4, 24, 0.38)');
  ctx.fillStyle = shade;
  ctx.fillRect(x, y, pw, ph);
  ctx.restore();
}

/** A small angled black/white cast role tag on a panel. `top` puts it at
 * the panel's top-left instead of bottom-left — used where the bottom
 * edge is covered by the title, the hero pop-out or the billing strip. */
export function drawRoleTag(ctx, rect, role, grade, top) {
  if (!role) return;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const x = rect[0] * w, y = rect[1] * h, pw = rect[2] * w, ph = rect[3] * h;
  const label = role.trim().toUpperCase();
  if (!label) return;
  const size = Math.max(11, Math.round(h * 0.017));
  ctx.save();
  ctx.font = `800 ${size}px 'Segoe UI', system-ui, sans-serif`;
  const tw = ctx.measureText(label).width;
  const padX = size * 0.7;
  const tagW = tw + padX * 2 + size * 0.35;
  const tagH = size * 1.9;
  const tx = x + Math.max(4, pw * 0.03);
  const ty = top ? y + Math.max(4, ph * 0.04) : y + ph - tagH - Math.max(4, ph * 0.04);
  ctx.translate(tx + tagW / 2, ty + tagH / 2);
  ctx.rotate(-0.035);
  ctx.fillStyle = 'rgba(8, 2, 16, 0.92)';
  ctx.fillRect(-tagW / 2, -tagH / 2, tagW, tagH);
  ctx.fillStyle = grade.accent;
  ctx.fillRect(-tagW / 2, -tagH / 2, size * 0.35, tagH);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 1;
  ctx.strokeRect(-tagW / 2 + 0.5, -tagH / 2 + 0.5, tagW - 1, tagH - 1);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, -tagW / 2 + padX + size * 0.35, 1);
  ctx.restore();
}

/** Five gold stars, drawn as text glyphs. Returns the width drawn. */
export function drawStars(ctx, x, y, size, color) {
  ctx.save();
  ctx.font = `${size}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillStyle = color || '#ffc93c';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 3;
  ctx.fillText('★★★★★', x, y);
  const w = ctx.measureText('★★★★★').width;
  ctx.restore();
  return w;
}

/**
 * Giant striped retro-chrome title: horizontal sunset stripes inside the
 * letters, a dark outline and a hard offset drop shadow. `size` is the
 * font size; the text is drawn left-aligned at (x, y) baseline.
 */
export function drawDisplayText(ctx, text, x, y, size, color, accent) {
  ctx.save();
  ctx.font = `${size}px Anton, 'Arial Black', sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  // Hard drop shadow, offset down-right, no blur.
  const shX = size * 0.045;
  const shY = size * 0.06;
  ctx.fillStyle = 'rgba(24, 2, 40, 0.92)';
  ctx.fillText(text, x + shX, y + shY);
  // Dark outline.
  ctx.strokeStyle = 'rgba(16, 4, 28, 0.95)';
  ctx.lineWidth = Math.max(2, size * 0.085);
  ctx.strokeText(text, x, y);
  // Horizontal sunset stripes clipped to the glyphs.
  const grad = ctx.createLinearGradient(0, y - size * 0.92, 0, y + size * 0.08);
  grad.addColorStop(0.0, '#fff3a6');
  grad.addColorStop(0.22, '#ffb347');
  grad.addColorStop(0.42, '#ff5e62');
  grad.addColorStop(0.62, '#ff2e88');
  grad.addColorStop(0.82, '#c44dff');
  grad.addColorStop(1.0, '#7b2ff7');
  ctx.fillStyle = grad;
  ctx.fillText(text, x, y);
  // Thin bright top edge for the chrome shine.
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  ctx.restore();
  ctx.restore();
}

/** Fits the title to the cover width (leaving room for the seal at the
 * right) and returns its font size. */
export function fitTitleSize(ctx, title, w, h) {
  let size = h * 0.175;
  if (title) size = Math.min(size, (w * 0.92) / (title.length * 0.52));
  ctx.font = `${size}px Anton, 'Arial Black', sans-serif`;
  while (title && ctx.measureText(title).width > w * 0.92 && size > 14) {
    size -= 2;
    ctx.font = `${size}px Anton, 'Arial Black', sans-serif`;
  }
  return size;
}

/** Gold starburst seal reading "ORIGINAL COVER ART". */
export function drawSeal(ctx, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.21);
  // Starburst: 16 points, alternating outer / inner radius.
  ctx.beginPath();
  const points = 16;
  for (let i = 0; i < points * 2; i++) {
    const ang = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.84;
    const px = Math.cos(ang) * rad;
    const py = Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffb627';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = r * 0.12;
  ctx.shadowOffsetY = r * 0.05;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = Math.max(2, r * 0.05);
  ctx.strokeStyle = '#8a5a00';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd76a';
  ctx.fill();
  ctx.lineWidth = Math.max(1, r * 0.025);
  ctx.strokeStyle = '#8a5a00';
  ctx.stroke();
  ctx.fillStyle = '#3a1c00';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${Math.round(r * 0.26)}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillText('ORIGINAL', 0, -r * 0.24);
  ctx.fillText('COVER ART', 0, r * 0.05);
  ctx.font = `${Math.round(r * 0.22)}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillText('★ ★ ★', 0, r * 0.34);
  ctx.restore();
}

/** A drawn barcode with numbers, in a white box. */
export function drawBarcode(ctx, x, y, w, h) {
  const rand = mulberry32(90211);
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#111111';
  let bx = x + w * 0.06;
  const top = y + h * 0.10;
  const bottom = y + h * 0.68;
  while (bx < x + w * 0.94) {
    const bw = (1 + Math.floor(rand() * 4)) * Math.max(1, w * 0.008);
    if (rand() > 0.42) ctx.fillRect(bx, top, bw, bottom - top);
    bx += bw + Math.max(1, w * 0.008) * (1 + Math.floor(rand() * 2));
  }
  ctx.font = `${Math.max(8, Math.round(h * 0.16))}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('8 90211 202602', x + w / 2, y + h * 0.84);
  ctx.restore();
}

/**
 * All the poster chrome: press-quote bar, giant title, script subtitle,
 * tagline ribbon, VOL. 1 badge, seal, barcode, billing block and
 * COMING SOON strip. Drawn over the panels, like a real movie poster.
 */
export function drawTitleBlock(ctx, state, grade) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const pad = w * 0.03;
  const title = (state.title || '').trim().toUpperCase();
  const sub = (state.subtitle || '').trim();
  const tag = (state.tagline || '').trim();
  const quote = (state.quote || '').trim();

  // Press-quote bar across the top.
  if (quote) {
    const barH = h * 0.052;
    ctx.fillStyle = 'rgba(10, 2, 20, 0.88)';
    ctx.fillRect(0, 0, w, barH);
    ctx.fillStyle = grade.accent;
    ctx.fillRect(0, barH, w, Math.max(2, h * 0.003));
    const starSize = Math.round(barH * 0.52);
    const sw = drawStars(ctx, pad, barH / 2, starSize);
    ctx.save();
    ctx.font = `italic 700 ${Math.round(barH * 0.42)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 4;
    let q = quote;
    const maxQ = w - pad * 2 - sw - w * 0.05;
    while (q && ctx.measureText(q).width > maxQ && q.length > 8) q = q.slice(0, -4) + '…';
    ctx.fillText(q, pad + sw + w * 0.012, barH / 2 + 1);
    ctx.restore();
  }

  // VOL. 1 badge, top right.
  if (state.badge) {
    const label = state.badge.trim().toUpperCase();
    ctx.save();
    ctx.font = `800 ${Math.round(h * 0.021)}px 'Segoe UI', system-ui, sans-serif`;
    const bw = ctx.measureText(label).width + w * 0.03;
    const bh = h * 0.042;
    const bx = w - bw - pad * 0.5;
    const by = Math.max(h * 0.058, h * 0.062);
    ctx.translate(bx, by);
    ctx.rotate(0.02);
    ctx.fillStyle = '#ffb627';
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    ctx.fillRect(0, 0, bw, bh);
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#14041f';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, bw / 2, bh / 2 + 1);
    ctx.restore();
  }

  if (!title && !sub) return;

  // Dark gradient behind the title zone so the lettering reads over photos.
  const titleY = h * 0.795;
  const zoneTop = h * 0.60;
  const zone = ctx.createLinearGradient(0, zoneTop, 0, h * 0.94);
  zone.addColorStop(0, 'rgba(12, 3, 24, 0)');
  zone.addColorStop(0.45, 'rgba(12, 3, 24, 0.42)');
  zone.addColorStop(1, 'rgba(12, 3, 24, 0.78)');
  ctx.fillStyle = zone;
  ctx.fillRect(0, zoneTop, w, h * 0.94 - zoneTop);

  // Giant title, full width, centred.
  if (title) {
    const size = fitTitleSize(ctx, title, w, h);
    ctx.font = `${size}px Anton, 'Arial Black', sans-serif`;
    const tw = ctx.measureText(title).width;
    const tx = (w - tw) / 2;
    drawDisplayText(ctx, title, tx, titleY, size, grade.title, grade.accent);
  }

  // Script subtitle, overlapping the title's lower edge, centred.
  if (sub) {
    ctx.save();
    ctx.translate(w / 2, h * 0.855);
    ctx.rotate(-0.03);
    const subSize = Math.round(h * 0.058);
    ctx.font = `italic 700 ${subSize}px 'Brush Script MT', 'Segoe Script', 'Snell Roundhand', cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = Math.max(2, subSize * 0.10);
    ctx.strokeText(sub, 0, 0);
    ctx.fillStyle = grade.sub;
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.fillText(sub, 0, 0);
    ctx.restore();
  }

  // Tagline ribbon: black bar, white caps.
  if (tag) {
    const ribbonH = h * 0.034;
    const ribbonY = h * 0.895 - ribbonH / 2;
    ctx.save();
    ctx.font = `700 ${Math.round(h * 0.019)}px 'Segoe UI', system-ui, sans-serif`;
    try { ctx.letterSpacing = '2px'; } catch { /* older canvas: no letter-spacing */ }
    const tw = ctx.measureText(tag.toUpperCase()).width;
    const rw = Math.min(w * 0.92, tw + w * 0.06);
    ctx.fillStyle = 'rgba(8, 2, 16, 0.92)';
    ctx.fillRect((w - rw) / 2, ribbonY, rw, ribbonH);
    ctx.fillStyle = grade.accent;
    ctx.fillRect((w - rw) / 2, ribbonY, Math.max(3, w * 0.004), ribbonH);
    ctx.fillRect((w + rw) / 2 - Math.max(3, w * 0.004), ribbonY, Math.max(3, w * 0.004), ribbonH);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tag.toUpperCase(), w / 2, ribbonY + ribbonH / 2 + 1);
    ctx.restore();
  }

  // Gold starburst seal, right side above the title zone edge.
  if (state.seal) {
    drawSeal(ctx, w * 0.90, h * 0.615, Math.min(w, h) * 0.062);
  }

  // Barcode, bottom right, just above the billing strip.
  const bcW = Math.min(w * 0.11, 150);
  const bcH = h * 0.048;
  drawBarcode(ctx, w - bcW - pad * 0.6, h * 0.945 - bcH - h * 0.008, bcW, bcH);

  // Billing block along the bottom.
  const billH = h * 0.042;
  ctx.fillStyle = 'rgba(8, 2, 16, 0.94)';
  ctx.fillRect(0, h - billH, w, billH);
  ctx.fillStyle = grade.accent;
  ctx.fillRect(0, h - billH, w, Math.max(2, h * 0.002));
  const billing = (state.billing || '').trim();
  if (billing) {
    ctx.save();
    // Shrink the billing type until the whole line fits clear of the
    // COMING SOON strip on the left, instead of truncating it.
    let bSize = Math.round(h * 0.0155);
    ctx.font = `600 ${bSize}px 'Segoe UI', system-ui, sans-serif`;
    const maxB = w * 0.72;
    while (ctx.measureText(billing).width > maxB && bSize > 10) {
      bSize -= 1;
      ctx.font = `600 ${bSize}px 'Segoe UI', system-ui, sans-serif`;
    }
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(billing, w * 0.60, h - billH / 2 + 1);
    ctx.restore();
  }
  // COMING SOON strip, bottom left.
  ctx.save();
  ctx.font = `900 ${Math.round(h * 0.021)}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillStyle = '#ff5e62';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(255,94,98,0.8)';
  ctx.shadowBlur = 10;
  ctx.fillText('COMING SOON', pad, h - billH / 2 + 1);
  ctx.restore();
}

/** Film grain + vignette for the poster finish. */
export function paintFinish(ctx, seed) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const rand = mulberry32(seed);
  ctx.save();
  for (let i = 0; i < 1600; i++) {
    const a = rand() * 0.09;
    ctx.fillStyle = rand() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
    ctx.fillRect(rand() * w, rand() * h, 1.6, 1.6);
  }
  const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(8,2,18,0.42)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/**
 * Draws the whole cover onto `canvas` at the size named by state.size.
 * `photos` is the array of loaded images; each panel picks one by index.
 */
export function drawCover(canvas, photos, state) {
  const size = EXPORT_SIZES[state.size] || EXPORT_SIZES.square;
  canvas.width = size.w;
  canvas.height = size.h;
  const ctx = canvas.getContext('2d');
  const w = size.w;
  const h = size.h;
  const layout = LAYOUTS[state.layout] || LAYOUTS['poster-seven'];
  const grade = GRADES[state.grade] || GRADES['vice-sunset'];
  // Comic-book white gutters.
  ctx.fillStyle = state.frame ? '#f8f2ea' : '#12081f';
  ctx.fillRect(0, 0, w, h);
  const gap = state.frame ? Math.max(4, Math.round(w * 0.006)) : 0;
  const insetFor = (rect) => [
    rect[0] + (rect[0] > 0 ? gap / w : 0),
    rect[1] + (rect[1] > 0 ? gap / h : 0),
    rect[2] - (rect[0] > 0 ? gap / w : 0) - (rect[0] + rect[2] < 1 ? gap / w : 0),
    rect[3] - (rect[1] > 0 ? gap / h : 0) - (rect[1] + rect[3] < 1 ? gap / h : 0),
  ];
  const drawOne = (i, rect, hero) => {
    const panel = state.panels[i] || { ...DEFAULT_PANEL, photo: i % 3 };
    const photo = photos[panel.photo] ?? null;
    const inset = insetFor(rect);
    if (hero) {
      // White pop-out border + drop shadow behind the hero panel.
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.65)';
      ctx.shadowBlur = w * 0.02;
      ctx.shadowOffsetY = h * 0.012;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(inset[0] * w - w * 0.005, inset[1] * h - w * 0.005, inset[2] * w + w * 0.01, inset[3] * h + w * 0.01);
      ctx.restore();
    }
    drawPanelPhoto(ctx, photo, inset, panel, grade.filter);
    paintGrade(ctx, inset, grade);
    ctx.strokeStyle = hero ? '#ffffff' : 'rgba(255,255,255,0.85)';
    ctx.lineWidth = hero ? Math.max(2, w * 0.004) : Math.max(1, w * 0.0012);
    ctx.strokeRect(inset[0] * w + 0.5, inset[1] * h + 0.5, inset[2] * w - 1, inset[3] * h - 1);
    return inset;
  };
  // Non-hero panels first, hero last so it overlaps its neighbours.
  const heroIndex = layout.hero;
  const insets = [];
  layout.panels.forEach((rect, i) => {
    if (i === heroIndex) return;
    insets[i] = drawOne(i, rect, false);
  });
  if (heroIndex != null && layout.panels[heroIndex]) {
    insets[heroIndex] = drawOne(heroIndex, heroRect(layout.panels[heroIndex]), true);
  }
  // Role tags in a second pass, above every panel (including the hero
  // overlap), so none of them is half-hidden behind a neighbour. Tags go
  // on top where the bottom edge is covered by the title, the hero or
  // the billing strip.
  layout.panels.forEach((rect, i) => {
    const top = i === heroIndex || rect[1] + rect[3] > 0.98;
    drawRoleTag(ctx, insets[i], (state.roles || [])[i] || '', grade, top);
  });
  drawTitleBlock(ctx, state, grade);
  if (state.grain) paintFinish(ctx, 20261120);
  return canvas;
}

/** Finds which panel (index) a point in canvas pixels falls in, or -1. */
export function panelAt(state, px, py, canvasW, canvasH) {
  const layout = LAYOUTS[state.layout] || LAYOUTS['poster-seven'];
  const order = layout.panels.map((_, i) => i);
  // Hero first: it overlaps its neighbours, so it wins the hit test.
  if (layout.hero != null) order.sort((a, b) => (a === layout.hero ? -1 : b === layout.hero ? 1 : b - a));
  else order.reverse();
  for (const i of order) {
    let rect = layout.panels[i];
    if (i === layout.hero) rect = heroRect(rect);
    const [fx, fy, fw, fh] = rect;
    if (px >= fx * canvasW && px <= (fx + fw) * canvasW && py >= fy * canvasH && py <= (fy + fh) * canvasH) return i;
  }
  return -1;
}

/** Focus point of a panel in canvas pixels (for the editor crosshair). */
export function focusPoint(state, index, canvasW, canvasH) {
  const layout = LAYOUTS[state.layout] || LAYOUTS['poster-seven'];
  const rect = layout.panels[index];
  if (!rect) return null;
  const panel = state.panels[index] || DEFAULT_PANEL;
  return {
    x: (rect[0] + (panel.fx == null ? 0.5 : panel.fx) * rect[2]) * canvasW,
    y: (rect[1] + (panel.fy == null ? 0.35 : panel.fy) * rect[3]) * canvasH,
  };
}
