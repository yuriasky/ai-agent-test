// Builds preview/index.html: a self-contained page showing every icon in icons/,
// grouped by Figma category (from icons.manifest.json). Open it straight from disk.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ICONS = 'icons';
const OUT_DIR = 'preview';

const manifest = JSON.parse(readFileSync('icons.manifest.json', 'utf8')).icons;
const files = readdirSync(ICONS).filter((f) => f.endsWith('.svg')).sort();

const icons = files.map((file) => {
  const svg = readFileSync(join(ICONS, file), 'utf8').trim();
  const entry = manifest[file];
  const figmaName = entry?.figmaName ?? null;
  const category = figmaName?.match(/^icon\/\s*([^/]+?)\s*\//i)?.[1] ?? 'Uncategorized';
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? '';
  return {
    file,
    figmaName,
    nodeId: entry?.nodeId ?? null,
    category,
    bytes: statSync(join(ICONS, file)).size,
    viewBox,
    svg,
  };
});

const missingFiles = Object.keys(manifest).filter((f) => !files.includes(f));
const data = { icons, missingFiles, builtAt: new Date().toISOString() };

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Icon Preview</title>
<style>
  :root { --bg:#f6f6f8; --card:#fff; --text:#1c1d36; --muted:#6b6c80; --line:#e3e3ea; --accent:#4f46e5; --warn:#b45309; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme=light]) { --bg:#121218; --card:#1c1c26; --text:#ececf3; --muted:#9a9ab0; --line:#2c2c3a; --accent:#8b85ff; --warn:#f59e0b; } }
  :root[data-theme=dark] { --bg:#121218; --card:#1c1c26; --text:#ececf3; --muted:#9a9ab0; --line:#2c2c3a; --accent:#8b85ff; --warn:#f59e0b; }
  * { box-sizing: border-box; }
  body { margin:0; font:14px/1.4 system-ui, sans-serif; background:var(--bg); color:var(--text); }
  header { position:sticky; top:0; z-index:2; background:var(--bg); border-bottom:1px solid var(--line); padding:12px 16px; display:flex; flex-wrap:wrap; gap:10px 16px; align-items:center; }
  h1 { font-size:16px; margin:0 8px 0 0; }
  input[type=search] { flex:1 1 220px; padding:7px 10px; border:1px solid var(--line); border-radius:6px; background:var(--card); color:var(--text); font:inherit; }
  label, select { font-size:13px; color:var(--muted); display:flex; align-items:center; gap:6px; }
  select { color:var(--text); background:var(--card); border:1px solid var(--line); border-radius:6px; padding:5px; }
  #count { color:var(--muted); font-size:13px; margin-left:auto; }
  main { padding:8px 16px 40px; }
  .warn { color:var(--warn); margin:12px 0; }
  h2 { font-size:13px; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); margin:24px 0 10px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(var(--cell,112px), 1fr)); gap:8px; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:8px; padding:12px 6px 8px; display:flex; flex-direction:column; align-items:center; gap:8px; cursor:pointer; min-width:0; }
  .card:hover { border-color:var(--accent); }
  .icon { width:var(--size,24px); height:var(--size,24px); position:relative; color:var(--icon-color); }
  .icon svg { width:100%; height:100%; display:block; }
  body.recolor .icon svg [fill]:not([fill=none]) { fill:currentColor; }
  body.recolor .icon svg [stroke]:not([stroke=none]) { stroke:currentColor; }
  body.grid-on .icon::after { content:""; position:absolute; inset:0; pointer-events:none;
    background-image:linear-gradient(to right, rgba(255,0,80,.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,0,80,.25) 1px, transparent 1px);
    background-size:calc(100% / 24) calc(100% / 24); outline:1px solid rgba(255,0,80,.5); }
  body.bounds-on .icon { outline:1px dashed var(--accent); }
  .name { font-size:11px; color:var(--muted); text-align:center; word-break:break-word; }
  .card.flag { border-color:var(--warn); }
  dialog { border:1px solid var(--line); border-radius:10px; background:var(--card); color:var(--text); max-width:min(560px, calc(100vw - 32px)); width:100%; padding:20px; }
  dialog::backdrop { background:rgba(0,0,0,.4); }
  .big { display:flex; gap:16px; align-items:flex-end; flex-wrap:wrap; margin-bottom:14px; }
  .big .icon { background:var(--bg); }
  dl { display:grid; grid-template-columns:auto 1fr; gap:4px 12px; font-size:13px; margin:0 0 12px; }
  dt { color:var(--muted); }
  dd { margin:0; word-break:break-all; }
  pre { background:var(--bg); padding:10px; border-radius:6px; font-size:11px; white-space:pre-wrap; word-break:break-all; max-height:160px; overflow:auto; }
  button { font:inherit; padding:6px 12px; border-radius:6px; border:1px solid var(--line); background:var(--bg); color:var(--text); cursor:pointer; }
  .toast { position:fixed; bottom:16px; left:50%; transform:translateX(-50%); background:var(--text); color:var(--bg); padding:6px 12px; border-radius:6px; font-size:13px; opacity:0; transition:opacity .2s; pointer-events:none; }
  .toast.show { opacity:1; }
</style>
</head>
<body class="recolor">
<header>
  <h1>Icon Preview</h1>
  <input type="search" id="q" placeholder="Search icons…" autofocus>
  <label>Size <select id="size"><option>16</option><option selected>24</option><option>32</option><option>48</option><option>96</option></select></label>
  <label>Color <input type="color" id="color" value="#1c1d36"></label>
  <label><input type="checkbox" id="original"> Original colors</label>
  <label><input type="checkbox" id="gridToggle"> 24px grid</label>
  <label><input type="checkbox" id="bounds"> Bounds</label>
  <label>Theme <select id="theme"><option value="">Auto</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
  <span id="count"></span>
</header>
<main id="main"></main>
<dialog id="detail"></dialog>
<div class="toast" id="toast"></div>
<script>
const DATA = ${JSON.stringify(data).replace(/</g, '\\u003c')};
const $ = (s) => document.querySelector(s);
const main = $('#main');

function flags(i) {
  const f = [];
  if (!i.figmaName) f.push('Not in manifest');
  if (i.viewBox !== '0 0 24 24') f.push('viewBox ' + (i.viewBox || 'missing'));
  if (/<image|<mask|<filter/i.test(i.svg)) f.push('Contains image/mask/filter');
  if (/stroke="(?!none)/i.test(i.svg)) f.push('Contains stroke');
  return f;
}
DATA.icons.forEach((i) => (i.flags = flags(i)));

function render() {
  const q = $('#q').value.trim().toLowerCase();
  const shown = DATA.icons.filter((i) => !q || i.file.includes(q) || (i.figmaName || '').toLowerCase().includes(q));
  const groups = {};
  shown.forEach((i) => (groups[i.category] ??= []).push(i));
  let html = '';
  if (DATA.missingFiles.length) html += '<p class="warn">In manifest but missing from icons/: ' + DATA.missingFiles.join(', ') + '</p>';
  const flagged = DATA.icons.filter((i) => i.flags.length).length;
  if (flagged) html += '<p class="warn">' + flagged + ' icon(s) flagged (orange border) — click for details.</p>';
  for (const cat of Object.keys(groups).sort()) {
    html += '<h2>' + cat + ' · ' + groups[cat].length + '</h2><div class="grid">';
    for (const i of groups[cat]) {
      html += '<div class="card' + (i.flags.length ? ' flag' : '') + '" data-file="' + i.file + '" title="' + i.file + '">' +
        '<div class="icon">' + i.svg + '</div><div class="name">' + i.file.replace(/^icon-/, '').replace(/\\.svg$/, '') + '</div></div>';
    }
    html += '</div>';
  }
  main.innerHTML = html || '<p>No icons match.</p>';
  $('#count').textContent = shown.length + ' / ' + DATA.icons.length + ' icons';
}

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1200); }

main.addEventListener('click', (e) => {
  const card = e.target.closest('.card'); if (!card) return;
  const i = DATA.icons.find((x) => x.file === card.dataset.file);
  const d = $('#detail');
  d.innerHTML = '<div class="big">' + [24, 48, 96].map((s) => '<div class="icon" style="--size:' + s + 'px">' + i.svg + '</div>').join('') + '</div>' +
    '<dl><dt>File</dt><dd>icons/' + i.file + '</dd><dt>Figma</dt><dd>' + (i.figmaName || '—') + '</dd><dt>Node</dt><dd>' + (i.nodeId || '—') +
    '</dd><dt>Size</dt><dd>' + i.bytes + ' B</dd><dt>Flags</dt><dd>' + (i.flags.join(', ') || 'none') + '</dd></dl>' +
    '<pre></pre><button id="copyName">Copy file name</button> <button id="copySvg">Copy SVG</button> <button id="close">Close</button>';
  d.querySelector('pre').textContent = i.svg;
  d.querySelector('#copyName').onclick = () => navigator.clipboard.writeText(i.file).then(() => toast('Copied ' + i.file));
  d.querySelector('#copySvg').onclick = () => navigator.clipboard.writeText(i.svg).then(() => toast('Copied SVG'));
  d.querySelector('#close').onclick = () => d.close();
  d.showModal();
});

$('#q').addEventListener('input', render);
$('#size').addEventListener('change', (e) => { document.body.style.setProperty('--size', e.target.value + 'px'); document.body.style.setProperty('--cell', Math.max(112, +e.target.value + 48) + 'px'); });
$('#color').addEventListener('input', (e) => document.body.style.setProperty('--icon-color', e.target.value));
$('#original').addEventListener('change', (e) => document.body.classList.toggle('recolor', !e.target.checked));
$('#gridToggle').addEventListener('change', (e) => document.body.classList.toggle('grid-on', e.target.checked));
$('#bounds').addEventListener('change', (e) => document.body.classList.toggle('bounds-on', e.target.checked));
$('#theme').addEventListener('change', (e) => { if (e.target.value) document.documentElement.dataset.theme = e.target.value; else delete document.documentElement.dataset.theme; });
document.body.style.setProperty('--icon-color', $('#color').value);
render();
</script>
</body>
</html>
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'index.html'), html);
console.log(`Wrote ${OUT_DIR}/index.html (${icons.length} icons, ${missingFiles.length} missing, ${(html.length / 1024).toFixed(0)} KB)`);
