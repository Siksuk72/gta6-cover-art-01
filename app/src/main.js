// Vice Grid Cover Studio — editor wiring: photos, layouts, grades, caption,
// per-panel crop and position, and PNG export in the three post sizes.
// A `?shot=` query sets up a fixed scene for a screenshot (./shots.js).
import { drawCover, defaultState, LAYOUTS, GRADES, EXPORT_SIZES, panelAt } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const tray = document.getElementById('photoTray');
const zoomSlider = document.getElementById('zoom');
const zoomValue = document.getElementById('zoomValue');
const panelLabel = document.getElementById('panelLabel');

const state = defaultState();
let photos = []; // loaded Image elements, in tray order
let selectedPanel = 0;
let drag = null;

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

function redraw() {
  drawCover(canvas, photos, state);
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

function updatePanelControls() {
  const panel = state.panels[selectedPanel] || { photo: 0, zoom: 1, dx: 0, dy: 0 };
  panelLabel.textContent = `Panel ${selectedPanel + 1} — photo ${photos[panel.photo] ? panel.photo + 1 : '—'}`;
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

// --- Controls: caption ------------------------------------------------------
const titleInput = document.getElementById('titleInput');
const subtitleInput = document.getElementById('subtitleInput');
const taglineInput = document.getElementById('taglineInput');
titleInput.addEventListener('input', () => { state.title = titleInput.value; redraw(); });
subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });
taglineInput.addEventListener('input', () => { state.tagline = taglineInput.value; redraw(); });
document.getElementById('badgeInput').addEventListener('input', (e) => { state.badge = e.target.value; redraw(); });
document.getElementById('frameToggle').addEventListener('change', (e) => { state.frame = e.target.checked; redraw(); });
document.getElementById('grainToggle').addEventListener('change', (e) => { state.grain = e.target.checked; redraw(); });

// --- Controls: selected panel ----------------------------------------------
zoomSlider.addEventListener('input', () => {
  state.panels[selectedPanel].zoom = Number(zoomSlider.value) / 100;
  zoomValue.textContent = `${zoomSlider.value}%`;
  redraw();
});
document.getElementById('resetPanelBtn').addEventListener('click', () => {
  state.panels[selectedPanel] = { photo: state.panels[selectedPanel].photo, zoom: 1, dx: 0, dy: 0 };
  redraw();
  setStatus(`Panel ${selectedPanel + 1} crop reset.`);
});
document.getElementById('resetAllBtn').addEventListener('click', () => {
  const fresh = defaultState();
  state.layout = fresh.layout;
  state.grade = fresh.grade;
  state.panels = fresh.panels;
  titleInput.value = fresh.title;
  subtitleInput.value = fresh.subtitle;
  taglineInput.value = fresh.tagline;
  state.title = fresh.title;
  state.subtitle = fresh.subtitle;
  state.tagline = fresh.tagline;
  selectedPanel = 0;
  redraw();
  setStatus('Cover reset to the default look.');
});

// --- Export -----------------------------------------------------------------
document.querySelectorAll('[data-export]').forEach((b) => {
  b.addEventListener('click', () => exportPNG(b.dataset.export));
});

// --- Canvas: click a panel to select it, drag to pan, wheel to zoom --------
function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * canvas.width,
    y: ((e.clientY - r.top) / r.height) * canvas.height,
  };
}
canvas.addEventListener('pointerdown', (e) => {
  const p = canvasPoint(e);
  const hit = panelAt(state, p.x, p.y, canvas.width, canvas.height);
  if (hit < 0) return;
  selectedPanel = hit;
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
  });
} else {
  loadSamples();
}
