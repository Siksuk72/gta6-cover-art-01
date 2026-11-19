// Fixed scenes for screenshots: ?shot=editor shows the full editor with a
// sample photo loaded; ?shot=cover shows only the finished cover, drawn by
// the app itself at the export size named by ?size= (square, portrait or
// wide). ?layout=, ?grade=, ?title= and ?subtitle= pick the look.
// window.__shotReady is set once the scene has painted, and a #probe element
// reports the canvas size and whether it drew anything non-blank.
import { EXPORT_SIZES } from './cover.js';

function probeCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const data = ctx.getImageData(0, 0, w, h).data;
  let seen = 0;
  let sum = 0;
  for (let i = 0; i < data.length; i += 400) {
    sum += data[i] + data[i + 1] + data[i + 2];
    if (data[i] + data[i + 1] + data[i + 2] > 60) seen++;
  }
  return { w, h, litSamples: seen, mean: Math.round(sum / (data.length / 400) / 3) };
}

export async function runShot(shot, query, api) {
  const { state } = api;
  if (query.get('layout')) state.layout = query.get('layout');
  if (query.get('grade')) state.grade = query.get('grade');
  if (query.get('size')) state.size = query.get('size');
  if (query.get('title')) { state.title = query.get('title'); api.titleInput.value = state.title; }
  if (query.get('subtitle')) { state.subtitle = query.get('subtitle'); api.subtitleInput.value = state.subtitle; }
  if (query.get('tagline')) { state.tagline = query.get('tagline'); api.taglineInput.value = state.tagline; }
  if (shot === 'cover') document.body.classList.add('shot-cover');
  await api.loadSamples();
  // Wait for the display font so the title measures (and draws) in Anton.
  try { await document.fonts.ready; } catch { /* fall back to system sans */ }
  // The cover scene draws at the real export size so a screenshot of it is
  // the app's own drawing of the exported cover.
  const size = EXPORT_SIZES[state.size] || EXPORT_SIZES.square;
  api.canvas.width = size.w;
  api.canvas.height = size.h;
  api.redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const probe = probeCanvas(api.canvas);
    let el = document.getElementById('probe');
    if (!el) {
      el = document.createElement('div');
      el.id = 'probe';
      document.body.appendChild(el);
    }
    el.textContent = `probe ${probe.w}x${probe.h} lit=${probe.litSamples} mean=${probe.mean}`;
    window.__shotReady = true;
  }));
}
