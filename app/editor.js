// AFTERGLOW Cover Studio — editor state and UI wiring.
// Live preview, drag-to-position, per-panel crop and grade, one-click PNG export.

import { renderPoster, SIZES, GRADES, drawSamplePhoto, layoutPanels } from './poster.js';

const state = {
  template: 'hero',
  title: 'AFTERGLOW',
  tagline: 'EVERY PHOTO HAS A STORY',
  panelCaptions: true,
  sizeKey: 'portrait',
  panels: [],
};

const photos = [];   // HTMLImageElement | HTMLCanvasElement sources
const photoNames = [];
let selected = 0;

const $ = id => document.getElementById(id);

// ---------- photos ----------

export function addPhotoFromImage(img, name) {
  photos.push(img);
  photoNames.push(name || `photo ${photos.length}`);
  refreshPhotoStrip();
  // first photo drops straight into the empty hero panel: one step to a cover
  if (photos.length === 1) {
    ensurePanels();
    state.panels[0].photo = 0;
  }
  syncPanelList();
  scheduleRender();
}

function addPhotoFromFile(file) {
  if (!file || !/^image\//.test(file.type)) return;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => addPhotoFromImage(img, file.name);
  img.src = url;
}

// ---------- panels ----------

export function ensurePanels() {
  if (state.panels.length) return;
  state.panels = [
    { photo: null, zoom: 1, dx: 0, dy: 0, rot: 0, grade: 'sunset', caption: 'GOLDEN HOUR', tilt: true },
    { photo: null, zoom: 1, dx: 0, dy: 0, rot: 0, grade: 'neon', caption: 'NIGHT DRIVE', tilt: false },
    { photo: null, zoom: 1, dx: 0, dy: 0, rot: 0, grade: 'dusk', caption: 'LAST CALL', tilt: false },
  ];
}

function defaultPanels() {
  ensurePanels();
  scheduleRender();
}

export function setTemplate(t) {
  state.template = t;
  const n = { hero: 3, duo: 2, grid: 4 }[t] || 3;
  while (state.panels.length < n) {
    state.panels.push({ photo: null, zoom: 1, dx: 0, dy: 0, rot: 0, grade: 'sunset', caption: '', tilt: false });
  }
  syncPanelList();
  scheduleRender();
}

// ---------- rendering ----------

let rafPending = false;
export function scheduleRender() {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => { rafPending = false; render(); });
}

function render() {
  const stage = $('stage');
  const S = SIZES[state.sizeKey];
  // preview canvas fits its aspect inside the stage box
  const boxW = stage.clientWidth, boxH = stage.clientHeight;
  const scale = Math.min(boxW / S.w, boxH / S.h);
  const cw = Math.max(200, Math.round(S.w * scale));
  const ch = Math.max(200, Math.round(S.h * scale));
  const cv = $('preview');
  cv.style.width = cw + 'px';
  cv.style.height = ch + 'px';
  cv.dataset.pw = S.w; cv.dataset.ph = S.h;
  renderPoster(cv, state, photos, state.sizeKey);
  $('stageLabel').textContent = `${S.label} · ${state.template} template · live preview`;
}

// hit-testing on the live preview: which panel is under the pointer
function panelAt(px, py) {
  const cv = $('preview');
  const S = SIZES[state.sizeKey];
  const cw = cv.clientWidth, ch = cv.clientHeight;
  const x = px / cw * S.w, y = py / ch * S.h;
  const wide = S.w > S.h * 1.3;
  const titleH = Math.round(S.h * (wide ? 0.30 : 0.24));
  const decoH = Math.round(S.h * 0.10);
  const area = { x: 0, y: wide ? 0 : titleH, w: S.w, h: S.h - decoH - (wide ? 0 : titleH) };
  const rects = layoutPanels(area.w, area.h, state.template, state.panels.length, S.h > S.w);
  for (let i = rects.length - 1; i >= 0; i--) {
    const r = rects[i];
    const ax = area.x + r.x, ay = area.y + r.y;
    if (x >= ax && x <= ax + r.w && y >= ay && y <= ay + r.h) return i;
  }
  return -1;
}

// ---------- pointer interaction: select, drag to position, wheel to zoom ----------

let drag = null;
function setupCanvasInput() {
  const cv = $('preview');
  cv.addEventListener('pointerdown', e => {
    const r = cv.getBoundingClientRect();
    const i = panelAt(e.clientX - r.left, e.clientY - r.top);
    if (i >= 0) { selected = i; syncPanelList(); }
    drag = { i, x: e.clientX, y: e.clientY };
    cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener('pointermove', e => {
    if (!drag) return;
    const p = state.panels[drag.i];
    if (!p) return;
    p.dx += (e.clientX - drag.x) / cv.clientWidth;
    p.dy += (e.clientY - drag.y) / cv.clientHeight;
    drag.x = e.clientX; drag.y = e.clientY;
    scheduleRender();
  });
  cv.addEventListener('pointerup', () => { drag = null; });
  cv.addEventListener('wheel', e => {
    const r = cv.getBoundingClientRect();
    const i = panelAt(e.clientX - r.left, e.clientY - r.top);
    if (i < 0) return;
    e.preventDefault();
    const p = state.panels[i];
    p.zoom = Math.min(3, Math.max(1, p.zoom * (e.deltaY > 0 ? 0.94 : 1.06)));
    selected = i; syncPanelList();
    scheduleRender();
  }, { passive: false });
}

// ---------- side panel controls ----------

function refreshPhotoStrip() {
  const strip = $('photoStrip');
  strip.innerHTML = '';
  photos.forEach((ph, i) => {
    const b = document.createElement('button');
    b.className = 'thumb';
    b.title = photoNames[i] + ' — click a panel to place it';
    const c = document.createElement('canvas');
    c.width = 96; c.height = Math.max(1, Math.round(96 * (ph.height / ph.width)));
    c.getContext('2d').drawImage(ph, 0, 0, c.width, c.height);
    b.appendChild(c);
    b.onclick = () => { if (state.panels[selected]) { state.panels[selected].photo = i; syncPanelList(); scheduleRender(); } };
    strip.appendChild(b);
  });
}

function syncPanelList() {
  const list = $('panelList');
  list.innerHTML = '';
  state.panels.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'panel-card' + (i === selected ? ' sel' : '');
    const opts = ['<option value="">— empty —</option>'].concat(
      photos.map((_, j) => `<option value="${j}" ${p.photo === j ? 'selected' : ''}>${photoNames[j]}</option>`)).join('');
    const grades = Object.keys(GRADES).map(k =>
      `<option value="${k}" ${p.grade === k ? 'selected' : ''}>${GRADES[k].name}</option>`).join('');
    card.innerHTML = `
      <div class="panel-head"><b>Panel ${i + 1}</b>${i === 0 ? ' <span class="hero-tag">hero</span>' : ''}</div>
      <div class="row"><label>Photo</label><select data-act="photo">${opts}</select>
      <select data-act="grade">${grades}</select></div>
      <div class="row"><label>Zoom ${p.zoom.toFixed(2)}</label>
        <input type="range" min="1" max="3" step="0.01" value="${p.zoom}" data-act="zoom">
        <input type="range" min="-10" max="10" step="0.5" value="${p.rot}" data-act="rot" title="tilt">
      </div>
      <div class="row"><label>Caption</label><input type="text" maxlength="18" value="${p.caption.replace(/"/g, '&quot;')}" data-act="caption" placeholder="panel caption"></div>
    `;
    card.querySelector('[data-act="photo"]').onchange = e => {
      p.photo = e.target.value === '' ? null : +e.target.value; scheduleRender();
    };
    card.querySelector('[data-act="grade"]').onchange = e => { p.grade = e.target.value; scheduleRender(); };
    card.querySelector('[data-act="zoom"]').oninput = e => { p.zoom = +e.target.value; scheduleRender(); };
    card.querySelector('[data-act="rot"]').oninput = e => { p.rot = +e.target.value; scheduleRender(); };
    card.querySelector('[data-act="caption"]').oninput = e => { p.caption = e.target.value; scheduleRender(); };
    card.onclick = e => { if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') { selected = i; syncPanelList(); } };
    list.appendChild(card);
  });
}

// ---------- export ----------

export function exportCover(sizeKey) {
  const out = document.createElement('canvas');
  renderPoster(out, state, photos, sizeKey);
  out.toBlob(blob => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `afterglow-cover-${sizeKey}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    $('exportNote').textContent = `Exported afterglow-cover-${sizeKey}.png (${SIZES[sizeKey].label})`;
  }, 'image/png');
}

// ---------- demo mode (sample photos, no files needed) ----------

export function loadDemoPhotos() {
  addPhotoFromImage(drawSamplePhoto(0), 'sample-sunset.jpg');
  addPhotoFromImage(drawSamplePhoto(1), 'sample-shore.jpg');
  // fill every panel so the demo looks like a finished cover
  ensurePanels();
  const fills = [
    { photo: 0, zoom: 1.0, dy: 0.05 },
    { photo: 1, zoom: 1.3, dx: 0.04, dy: 0 },
    { photo: 0, zoom: 1.55, dx: -0.05, dy: 0.02 },
  ];
  fills.forEach((f, i) => {
    if (state.panels[i]) Object.assign(state.panels[i], f);
  });
  syncPanelList();
  scheduleRender();
}

// ---------- boot ----------

export function bootEditor() {
  defaultPanels();
  setupCanvasInput();
  $('photoFile').addEventListener('change', e => { [...e.target.files].forEach(addPhotoFromFile); e.target.value = ''; });
  const stage = $('stage');
  stage.addEventListener('dragover', e => e.preventDefault());
  stage.addEventListener('drop', e => {
    e.preventDefault();
    [...(e.dataTransfer.files || [])].forEach(addPhotoFromFile);
  });
  $('template').onchange = e => setTemplate(e.target.value);
  $('size').onchange = e => { state.sizeKey = e.target.value; scheduleRender(); };
  $('title').oninput = e => { state.title = e.target.value || ' '; scheduleRender(); };
  $('tagline').oninput = e => { state.tagline = e.target.value; scheduleRender(); };
  $('panelCaptions').onchange = e => { state.panelCaptions = e.target.checked; scheduleRender(); };
  ['exportSquare', 'exportPortrait', 'exportWide'].forEach(id => {
    $(id).onclick = () => exportCover({ exportSquare: 'square', exportPortrait: 'portrait', exportWide: 'wide' }[id]);
  });
  window.addEventListener('resize', scheduleRender);

  // deep links for screenshots and demos: ?demo=1&size=portrait&bleed=1
  const q = new URLSearchParams(location.search);
  if (q.get('demo')) { loadDemoPhotos(); state.title = 'AFTERGLOW'; state.tagline = 'EVERY PHOTO HAS A STORY'; }
  if (q.get('size') && SIZES[q.get('size')]) {
    state.sizeKey = q.get('size');
    $('size').value = state.sizeKey;
  }
  if (q.get('bleed')) {
    document.body.classList.add('bleed');
    scheduleRender();
  } else {
    scheduleRender();
  }
  if (q.get('autoexport')) {
    // self-check: render each size, verify blobs, report in the console
    setTimeout(() => {
      ['square', 'portrait', 'wide'].forEach(k => {
        const c = document.createElement('canvas');
        renderPoster(c, state, photos, k);
        c.toBlob(b => console.log(`autoexport ${k}:`, b ? `${b.size} bytes` : 'FAILED'), 'image/png');
      });
    }, 400);
  }
}

bootEditor();
