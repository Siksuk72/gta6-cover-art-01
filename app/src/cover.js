// Vice Grid cover engine: draws a multi-panel GTA-style poster cover onto a
// 2D canvas from the user's photos and the editor state. All lettering is
// drawn with the bundled Anton font (OFL) — no Rockstar artwork or fonts.

export const EXPORT_SIZES = {
  square: { w: 1080, h: 1080, label: '1080 x 1080' },
  portrait: { w: 1080, h: 1350, label: '1080 x 1350' },
  wide: { w: 1920, h: 1080, label: '1920 x 1080' },
};

// Six panel layouts. Each panel is [x, y, w, h] in fractions of the cover.
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
};

// Six colour grades: each tints the photos with a sunset / neon wash and
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
};

export const DEFAULT_PANEL = { photo: 0, zoom: 1, dx: 0, dy: 0 };

/** A fresh default state for the editor. */
export function defaultState() {
  return {
    layout: 'hero-left',
    grade: 'vice-sunset',
    size: 'wide',
    title: 'VICE CITY',
    subtitle: 'Neon Shore',
    tagline: 'One city. One night. No brakes.',
    badge: 'EST. 2026',
    frame: true,
    grain: true,
    panels: Array.from({ length: 6 }, (_, i) => ({ ...DEFAULT_PANEL, photo: i % 3 })),
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

/** Draws one photo into a panel rect, cover-fit, with the panel zoom/pan. */
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
  const cx = x + pw / 2 + (panel.dx || 0) * pw;
  const cy = y + ph / 2 + (panel.dy || 0) * ph;
  ctx.filter = filter || 'none';
  ctx.drawImage(photo, cx - dw / 2, cy - dh / 2, dw, dh);
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

/** Bold display lettering with a hard outline and drop shadow. */
export function drawDisplayText(ctx, text, x, y, size, color, accent) {
  ctx.save();
  ctx.font = `${size}px Anton, 'Arial Black', sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = size * 0.08;
  ctx.shadowOffsetY = size * 0.045;
  ctx.strokeStyle = 'rgba(16, 4, 28, 0.92)';
  ctx.lineWidth = Math.max(2, size * 0.09);
  ctx.strokeText(text, x, y);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** The title block: big title, accent underline, subtitle and tagline. */
export function drawTitleBlock(ctx, state, grade) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const pad = w * 0.035;
  const title = (state.title || '').trim().toUpperCase();
  const sub = (state.subtitle || '').trim();
  const tag = (state.tagline || '').trim();
  if (!title && !sub) return;
  // Dark band behind the lettering so it reads over any photo.
  const bandH = h * (tag ? 0.20 : 0.16);
  const bandY = h - bandH;
  const band = ctx.createLinearGradient(0, bandY, 0, h);
  band.addColorStop(0, 'rgba(12, 3, 24, 0)');
  band.addColorStop(0.35, 'rgba(12, 3, 24, 0.72)');
  band.addColorStop(1, 'rgba(12, 3, 24, 0.88)');
  ctx.fillStyle = band;
  ctx.fillRect(0, bandY, w, bandH);
  let size = h * 0.115;
  // Ceiling from a per-character estimate as well as the live measurement:
  // Anton is condensed, but the font may still be loading when the canvas
  // first measures, so the estimate keeps long titles inside the cover.
  if (title) size = Math.min(size, (w - pad * 2) / (title.length * 0.55));
  ctx.font = `${size}px Anton, 'Arial Black', sans-serif`;
  while (title && ctx.measureText(title).width > w - pad * 2 && size > 14) {
    size -= 2;
    ctx.font = `${size}px Anton, 'Arial Black', sans-serif`;
  }
  const titleY = h - h * (tag ? 0.085 : 0.055);
  if (title) drawDisplayText(ctx, title, pad, titleY, size, grade.title, grade.accent);
  // Accent underline bar under the title.
  ctx.fillStyle = grade.accent;
  ctx.fillRect(pad, titleY + h * 0.012, Math.min(w * 0.22, size * 2.6), Math.max(3, h * 0.007));
  if (sub) {
    ctx.save();
    ctx.font = `italic 700 ${Math.round(h * 0.038)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillStyle = grade.sub;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 6;
    ctx.fillText(sub, pad, titleY - size * 0.92);
    ctx.restore();
  }
  if (tag) {
    ctx.save();
    ctx.font = `600 ${Math.round(h * 0.021)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillText(tag.toUpperCase(), pad, h - h * 0.028);
    ctx.restore();
  }
  // Badge ribbon, top right.
  if (state.badge) {
    const label = state.badge.trim().toUpperCase();
    ctx.save();
    ctx.font = `700 ${Math.round(h * 0.02)}px 'Segoe UI', system-ui, sans-serif`;
    const bw = ctx.measureText(label).width + w * 0.03;
    const bh = h * 0.042;
    ctx.translate(w - bw - pad * 0.6, pad * 0.7);
    ctx.rotate(0.0);
    ctx.fillStyle = grade.accent;
    ctx.fillRect(0, 0, bw, bh);
    ctx.fillStyle = '#14041f';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, bw / 2, bh / 2 + 1);
    ctx.restore();
  }
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
  const layout = LAYOUTS[state.layout] || LAYOUTS['hero-left'];
  const grade = GRADES[state.grade] || GRADES['vice-sunset'];
  // Comic-book white gutters.
  ctx.fillStyle = state.frame ? '#f8f2ea' : '#12081f';
  ctx.fillRect(0, 0, w, h);
  const gap = state.frame ? Math.max(4, Math.round(w * 0.006)) : 0;
  layout.panels.forEach((rect, i) => {
    const panel = state.panels[i] || { ...DEFAULT_PANEL, photo: i % 3 };
    const photo = photos[panel.photo] ?? null;
    const inset = [
      rect[0] + (rect[0] > 0 ? gap / w : 0),
      rect[1] + (rect[1] > 0 ? gap / h : 0),
      rect[2] - (rect[0] > 0 ? gap / w : 0) - (rect[0] + rect[2] < 1 ? gap / w : 0),
      rect[3] - (rect[1] > 0 ? gap / h : 0) - (rect[1] + rect[3] < 1 ? gap / h : 0),
    ];
    drawPanelPhoto(ctx, photo, inset, panel, grade.filter);
    paintGrade(ctx, inset, grade);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = Math.max(1, w * 0.0012);
    ctx.strokeRect(inset[0] * w + 0.5, inset[1] * h + 0.5, inset[2] * w - 1, inset[3] * h - 1);
  });
  drawTitleBlock(ctx, state, grade);
  if (state.grain) paintFinish(ctx, 20261119);
  return canvas;
}

/** Finds which panel (index) a point in canvas pixels falls in, or -1. */
export function panelAt(state, px, py, canvasW, canvasH) {
  const layout = LAYOUTS[state.layout] || LAYOUTS['hero-left'];
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    const [fx, fy, fw, fh] = layout.panels[i];
    if (px >= fx * canvasW && px <= (fx + fw) * canvasW && py >= fy * canvasH && py <= (fy + fh) * canvasH) return i;
  }
  return -1;
}
