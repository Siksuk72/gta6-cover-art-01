// Fixed scenes for screenshots: ?shot=editor shows the full editor with a
// sample photo loaded; ?shot=cover shows only the finished cover, drawn by
// the app itself at the export size named by ?size= (square, portrait or
// wide). ?layout=, ?grade=, ?title= and ?subtitle= pick the look; ?quote=,
// ?tagline=, ?billing=, ?roles= (comma-separated), ?focus= (panel:fx,fy
// pairs separated by ';', e.g. focus=3:0.5,0.55) and ?seal=0 pick the
// poster chrome. window.__shotReady is set once the scene has painted, and
// a #probe element reports the canvas size and whether it drew anything
// non-blank.
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
  if (query.get('quote')) {
    state.quote = query.get('quote');
    if (api.quoteInput) api.quoteInput.value = state.quote;
  }
  if (query.get('billing')) state.billing = query.get('billing');
  if (query.get('roles')) {
    const roles = query.get('roles').split(',').map((r) => r.trim().toUpperCase());
    roles.forEach((r, i) => { if (r && state.roles[i] != null) state.roles[i] = r; });
    if (api.renderRoleInputs) api.renderRoleInputs();
  }
  if (query.get('focus')) {
    // Per-panel focus points for the demo scene, e.g. "3:0.5,0.55" puts
    // the hero panel's focus on the face in the sample photo.
    for (const part of query.get('focus').split(';')) {
      const [idx, xy] = part.split(':');
      if (!xy) continue;
      const [fx, fy] = xy.split(',').map(Number);
      const panel = state.panels[Number(idx)];
      if (panel && Number.isFinite(fx) && Number.isFinite(fy)) {
        panel.fx = Math.min(0.95, Math.max(0.05, fx));
        panel.fy = Math.min(0.95, Math.max(0.05, fy));
      }
    }
  }
  if (query.get('seal') === '0') state.seal = false;
  if (query.get('seal') === '1') state.seal = true;
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
