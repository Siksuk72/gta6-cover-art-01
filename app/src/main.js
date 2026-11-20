// Vice Grid Cover Studio v2 — editor wiring: photos, layouts, grades,
// caption, poster chrome (quote, role tags, seal), per-panel crop with a
// face-aware focus point, and PNG export in the three poster sizes.
// A `?shot=` query sets up a fixed scene for a screenshot (./shots.js).
import { drawCover, defaultState, LAYOUTS, GRADES, EXPORT_SIZES, panelAt, focusPoint, DEFAULT_ROLES } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const tray = document.getElementById('photoTray');
const zoomSlider = document.getElementById('zoom');
const zoomValue = document.getElementById('zoomValue');
const panelLabel = document.getElementById('panelLabel');
const roleInputs = document.getElementById('roleInputs');
const focusBtn = document.getElementById('focusBtn');

const state = defaultState();
let photos = []; // loaded Image elements, in tray order
let selectedPanel = 0;
let drag = null;
let focusMode = false;

const SAMPLES = [
  { name: 'boulevard', label: 'Boulevard', file: 'samples/boulevard.jpg' },
  { name: 'pier', label: 'Pier', file: 'samples/pier.jpg' },
  { name: 'skyline', label: 'Skyline', file: 'samples/skyline.jpg' },
];

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function drawFocusMarker() {
  if (!focusMode) return;
  const p = focusPoint(state, selectedPanel, canvas.width, canvas.height);
  if (!p) return;
  const ctx = canvas.getContext('2d');
  const r = Math.max(14, canvas.width * 0.012);
  ctx.save();
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = Math.max(2, canvas.width * 0.002);
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(p.x - r * 1.6, p.y);
  ctx.lineTo(p.x + r * 1.6, p.y);
  ctx.moveTo(p.x, p.y - r * 1.6);
  ctx.lineTo(p.x, p.y + r * 1.6);
  ctx.stroke();
  ctx.fillStyle = '#00e5ff';
  ctx.beginPath();
  ctx.arc(p.x, Math.max(2, canvas.width * 0.002), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function redraw() {
  drawCover(canvas, photos, state);
  drawFocusMarker();
  updatePanelControls();
}

function setStatus(text) {
  status.textContent = text;
}

function renderTray() {
  tray.innerHTML = '';
  photos.forEach((photo, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'trayItem';
    btn.title = `Use photo ${i + 1} in the selected panel`;
    const thumb = document.createElement('img');
    thumb.src = photo.src;
    thumb.alt = `Photo ${i + 1}`;
    btn.appendChild(thumb);
    const tag = document.createElement('span');
    tag.textContent = `${i + 1}`;
    btn.appendChild(tag);
    btn.addEventListener('click', () => {
      state.panels[selectedPanel].photo = i;
      redraw();
      setStatus(`Panel ${selectedPanel + 1} now shows photo ${i + 1}.`);
    });
    tray.appendChild(btn);
  });
  if (!photos.length) {
    const empty = document.createElement('p');
    empty.className = 'trayEmpty';
    empty.textContent = 'No photos yet — add your own or try a sample below.';
    tray.appendChild(empty);
  }
}

/** One small text field per cast role tag, kept in sync with state.roles. */
function renderRoleInputs() {
  roleInputs.innerHTML = '';
  state.roles.forEach((role, i) => {
    const label = document.createElement('label');
    label.textContent = `Panel ${i + 1}`;
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 16;
    input.value = role;
    input.setAttribute('aria-label', `Role tag for panel ${i + 1}`);
    input.addEventListener('input', () => {
      state.roles[i] = input.value;
      redraw();
    });
    label.appendChild(input);
    roleInputs.appendChild(label);
  });
}

function updatePanelControls() {
  const panel = state.panels[selectedPanel] || { photo: 0, zoom: 1, dx: 0, dy: 0, fx: 0.5, fy: 0.35 };
  const fx = panel.fx == null ? 0.5 : panel.fx;
  const fy = panel.fy == null ? 0.35 : panel.fy;
  panelLabel.textContent = `Panel ${selectedPanel + 1} — photo ${photos[panel.photo] ? panel.photo + 1 : '—'} · focus ${Math.round(fx * 100)}%, ${Math.round(fy * 100)}%`;
  zoomSlider.value = String(Math.round((panel.zoom || 1) * 100));
  zoomValue.textContent = `${Math.round((panel.zoom || 1) * 100)}%`;
  document.querySelectorAll('#layoutGrid button').forEach((b) => {
    b.classList.toggle('active', b.dataset.layout === state.layout);
    b.setAttribute('aria-pressed', String(b.dataset.layout === state.layout));
  });
  document.querySelectorAll('#gradeGrid button').forEach((b) => {
    b.classList.toggle('active', b.dataset.grade === state.grade);
    b.setAttribute('aria-pressed', String(b.dataset.grade === state.grade));
  });
  document.querySelectorAll('#sizeTabs button').forEach((b) => {
    b.classList.toggle('active', b.dataset.size === state.size);
    b.setAttribute('aria-pressed', String(b.dataset.size === state.size));
  });
  focusBtn.classList.toggle('active', focusMode);
  focusBtn.setAttribute('aria-pressed', String(focusMode));
}

/** Loads the three sample photos into the tray. */
export async function loadSamples() {
  photos = [];
  for (const s of SAMPLES) {
    try {
      photos.push(await loadImage(s.file));
    } catch {
      // A missing sample is skipped; the editor still works with uploads.
    }
  }
  renderTray();
  redraw();
}

/** Adds user-chosen files to the tray, keeping photos on this machine. */
async function addFiles(files) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    try {
      photos.push(await loadImage(URL.createObjectURL(file)));
    } catch {
      // Skip unreadable files.
    }
  }
  renderTray();
  redraw();
  setStatus(`${photos.length} photo${photos.length === 1 ? '' : 's'} loaded. Click a panel, then drag to crop.`);
}

/** Renders the cover at an export size and downloads it as a PNG. */
export function exportPNG(sizeKey) {
  const size = EXPORT_SIZES[sizeKey];
  if (!size) return;
  const off = document.createElement('canvas');
  const keep = state.size;
  state.size = sizeKey;
  drawCover(off, photos, state);
  state.size = keep;
  redraw();
  off.toBlob((blob) => {
    if (!blob) { setStatus('Export failed — try again.'); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-grid-cover-${size.w}x${size.h}.png`;
    // The anchor must be in the document for the download to start in
    // every browser; it is removed again right after the click.
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    setStatus(`Saved vice-grid-cover-${size.w}x${size.h}.png`);
  }, 'image/png');
}

// --- Controls: photos -------------------------------------------------------
document.getElementById('photoInput').addEventListener('change', (e) => {
  addFiles(Array.from(e.target.files || []));
  e.target.value = '';
});
document.getElementById('sampleBtn').addEventListener('click', async () => {
  setStatus('Loading sample photos…');
  await loadSamples();
  setStatus('Sample photos loaded — pick a layout and export.');
});
document.getElementById('shuffleBtn').addEventListener('click', () => {
  if (!photos.length) { setStatus('Add a photo first, then shuffle.'); return; }
  state.panels.forEach((p) => { p.photo = Math.floor(Math.random() * photos.length); });
  redraw();
  setStatus('Photos shuffled across the panels.');
});

// --- Controls: layout, grade, size -----------------------------------------
const layoutGrid = document.getElementById('layoutGrid');
Object.entries(LAYOUTS).forEach(([key, layout]) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.dataset.layout = key;
  b.textContent = layout.name;
  b.addEventListener('click', () => {
    state.layout = key;
    selectedPanel = 0;
    redraw();
    setStatus(`Layout: ${layout.name}.`);
  });
  layoutGrid.appendChild(b);
});

const gradeGrid = document.getElementById('gradeGrid');
Object.entries(GRADES).forEach(([key, grade]) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.dataset.grade = key;
  b.innerHTML = `<span class="swatch" style="background:linear-gradient(135deg, ${grade.top}, ${grade.bottom})"></span>${grade.name}`;
  b.addEventListener('click', () => {
    state.grade = key;
    redraw();
    setStatus(`Colour grade: ${grade.name}.`);
  });
  gradeGrid.appendChild(b);
});

document.querySelectorAll('#sizeTabs button').forEach((b) => {
  b.addEventListener('click', () => {
    state.size = b.dataset.size;
    redraw();
    setStatus(`Preview size: ${EXPORT_SIZES[b.dataset.size].label}.`);
  });
});

// --- Controls: caption + poster chrome --------------------------------------
const titleInput = document.getElementById('titleInput');
const subtitleInput = document.getElementById('subtitleInput');
const taglineInput = document.getElementById('taglineInput');
titleInput.addEventListener('input', () => { state.title = titleInput.value; redraw(); });
subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });
taglineInput.addEventListener('input', () => { state.tagline = taglineInput.value; redraw(); });
document.getElementById('badgeInput').addEventListener('input', (e) => { state.badge = e.target.value; redraw(); });
document.getElementById('quoteInput').addEventListener('input', (e) => { state.quote = e.target.value; redraw(); });
document.getElementById('sealToggle').addEventListener('change', (e) => { state.seal = e.target.checked; redraw(); });
document.getElementById('frameToggle').addEventListener('change', (e) => { state.frame = e.target.checked; redraw(); });
document.getElementById('grainToggle').addEventListener('change', (e) => { state.grain = e.target.checked; redraw(); });
renderRoleInputs();

// --- Controls: selected panel + focus point ---------------------------------
zoomSlider.addEventListener('input', () => {
  state.panels[selectedPanel].zoom = Number(zoomSlider.value) / 100;
  zoomValue.textContent = `${zoomSlider.value}%`;
  redraw();
});
focusBtn.addEventListener('click', () => {
  focusMode = !focusMode;
  redraw();
  setStatus(focusMode
    ? 'Focus mode: click a face in the selected panel to centre the crop on it.'
    : 'Focus mode off — drag a panel to reposition the photo.');
});
document.getElementById('resetPanelBtn').addEventListener('click', () => {
  state.panels[selectedPanel] = { photo: state.panels[selectedPanel].photo, zoom: 1, dx: 0, dy: 0, fx: 0.5, fy: 0.35 };
  redraw();
  setStatus(`Panel ${selectedPanel + 1} crop and focus reset.`);
});
document.getElementById('resetAllBtn').addEventListener('click', () => {
  const fresh = defaultState();
  state.layout = fresh.layout;
  state.grade = fresh.grade;
  state.panels = fresh.panels;
  state.roles = [...fresh.roles];
  state.quote = fresh.quote;
  state.seal = fresh.seal;
  titleInput.value = fresh.title;
  subtitleInput.value = fresh.subtitle;
  taglineInput.value = fresh.tagline;
  document.getElementById('quoteInput').value = fresh.quote;
  document.getElementById('sealToggle').checked = fresh.seal;
  state.title = fresh.title;
  state.subtitle = fresh.subtitle;
  state.tagline = fresh.tagline;
  selectedPanel = 0;
  renderRoleInputs();
  redraw();
  setStatus('Cover reset to the default look.');
});

// --- Export -----------------------------------------------------------------
document.querySelectorAll('[data-export]').forEach((b) => {
  b.addEventListener('click', () => exportPNG(b.dataset.export));
});

// --- Canvas: click a panel to select it, drag to pan, wheel to zoom --------
// In focus mode (or with Alt held) a click sets the panel's face-aware
// focus point instead of starting a drag.
function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * canvas.width,
    y: ((e.clientY - r.top) / r.height) * canvas.height,
  };
}
function setFocusAt(p) {
  const layout = LAYOUTS[state.layout];
  const rect = layout.panels[selectedPanel];
  if (!rect) return;
  const panel = state.panels[selectedPanel];
  panel.fx = Math.min(0.95, Math.max(0.05, (p.x / canvas.width - rect[0]) / rect[2]));
  panel.fy = Math.min(0.95, Math.max(0.05, (p.y / canvas.height - rect[1]) / rect[3]));
  redraw();
  setStatus(`Panel ${selectedPanel + 1} focus set to ${Math.round(panel.fx * 100)}%, ${Math.round(panel.fy * 100)}% — the crop now centres there.`);
}
canvas.addEventListener('pointerdown', (e) => {
  const p = canvasPoint(e);
  const hit = panelAt(state, p.x, p.y, canvas.width, canvas.height);
  if (hit < 0) return;
  selectedPanel = hit;
  if (focusMode || e.altKey) {
    setFocusAt(p);
    return;
  }
  drag = { x: p.x, y: p.y, dx: state.panels[hit].dx, dy: state.panels[hit].dy, moved: false };
  canvas.setPointerCapture(e.pointerId);
  updatePanelControls();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const p = canvasPoint(e);
  const panel = state.panels[selectedPanel];
  panel.dx = drag.dx + (p.x - drag.x) / canvas.width;
  panel.dy = drag.dy + (p.y - drag.y) / canvas.height;
  if (Math.abs(p.x - drag.x) + Math.abs(p.y - drag.y) > 2) drag.moved = true;
  redraw();
});
canvas.addEventListener('pointerup', () => {
  if (drag && drag.moved) setStatus(`Panel ${selectedPanel + 1} repositioned — drag more or use the zoom slider.`);
  drag = null;
});
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const panel = state.panels[selectedPanel];
  const next = Math.min(3, Math.max(1, (panel.zoom || 1) * (e.deltaY < 0 ? 1.08 : 0.93)));
  panel.zoom = next;
  redraw();
}, { passive: false });

// --- Shot scenes ------------------------------------------------------------
const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), {
    state, canvas, titleInput, subtitleInput, taglineInput, loadSamples, loadImage,
    setPhotos(next) { photos = next; renderTray(); },
    redraw,
    quoteInput: document.getElementById('quoteInput'),
    renderRoleInputs,
  });
} else {
  loadSamples();
}
