// ---------- the social calendar ----------
// Karissa's posting schedule lives in a Google Sheet, one tab per month, shared as
// "anyone with the link can view". The studio reads it straight from the browser through
// the gviz CSV endpoint, which needs no key and answers with CORS headers.
//
// Two things about that endpoint shape this code:
//   * when the named tab does not exist it silently returns the FIRST sheet rather than an
//     error, so every month is verified against the dates that come back before it is shown;
//   * it drops fully empty leading rows, so the header row is not where the sheet's own row
//     numbers say it is. The header row is found by its contents, and the configured column
//     letters are only a fallback for headers that never made it into the sheet (DATE has no
//     header text of its own).
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_ABBR = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const CAL = { cfg:null, ym:null, posts:[], sel:null, tab:null, state:'idle', note:'' };
const CLIENT_SLUG = 'springforth';

// clients.js is loaded at the end of the body, so this resolves lazily rather than at parse
// time. A client with no calendar block simply doesn't get the panel.
function calCfg(){
  const c = (window.BI_CLIENTS || []).find(x => x.slug === CLIENT_SLUG);
  return (c && c.calendar) || null;
}

// Google's CSV: quoted fields, doubled quotes inside them, and real newlines inside a field.
function parseCsv(text){
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i+1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
const colLetter = (s) => { let n = 0; for (const ch of String(s).toUpperCase()) n = n*26 + (ch.charCodeAt(0)-64); return n-1; };

function tabNames(y, m){ return [MONTHS[m] + ' ' + y, MONTHS[m].slice(0,3) + ' ' + y]; }
function tabUrl(sheetId, tab){
  return 'https://docs.google.com/spreadsheets/d/' + sheetId +
         '/gviz/tq?tqx=out:csv&headers=0&sheet=' + encodeURIComponent(tab);
}
// M/D/YY or M/D/YYYY, which is what gviz gives for these cells whether they were typed or
// came out of a formula.
function parseDate(s){
  const m = String(s).trim().match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (!m) return null;
  let y = +m[3]; if (y < 100) y += 2000;
  const d = new Date(y, +m[1]-1, +m[2]);
  return isNaN(d) ? null : d;
}
function readTab(text, cfg, y, m){
  const rows = parseCsv(text);
  const hdr = rows.findIndex(r => r.some(c => /HOOK\s*TEXT/i.test(c)) && r.some(c => /^\s*POST\s*$/i.test(c)));
  if (hdr < 0) return { posts:[], reason:'no-header' };
  const head = rows[hdr].map(c => c.trim().toUpperCase());
  const at = (name, letter) => {
    const i = head.indexOf(name);
    return i >= 0 ? i : colLetter(cfg.cols[letter]);
  };
  const ci = { week:at('WEEK','week'), day:at('DAY','day'), date:at('DATE','date'),
               bucket:at('BUCKET','bucket'), hook:at('HOOK TEXT','hook'), post:at('POST','post') };
  const cell = (r, i) => (i >= 0 && i < r.length ? r[i].trim() : '');
  const posts = [];
  for (const r of rows.slice(hdr+1)) {
    const d = parseDate(cell(r, ci.date));
    if (!d) continue;
    posts.push({ date:d, iso:isoDate(d), week:cell(r, ci.week), day:cell(r, ci.day),
                 bucket:cell(r, ci.bucket), hook:cell(r, ci.hook), post:cell(r, ci.post) });
  }
  // gviz answers a missing tab with the first sheet, so the dates decide whether this is
  // really the month that was asked for
  const mine = posts.filter(p => p.date.getFullYear() === y && p.date.getMonth() === m);
  if (!posts.length) return { posts:[], reason:'empty' };
  if (mine.length < posts.length/2) return { posts:[], reason:'wrong-month' };
  return { posts:mine, reason:'ok' };
}
function isoDate(d){
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

async function loadMonth(y, m){
  const cfg = calCfg();
  if (!cfg) { CAL.state = 'off'; return; }
  CAL.ym = { y, m }; CAL.state = 'loading'; CAL.posts = []; CAL.tab = null; CAL.note = '';
  renderCalendar();
  let lastErr = null;
  for (const tab of tabNames(y, m)) {
    let text;
    try {
      const r = await fetch(tabUrl(cfg.sheetId, tab), { cache:'no-store' });
      if (!r.ok) { lastErr = 'http ' + r.status; continue; }
      text = await r.text();
    } catch (e) { lastErr = 'network'; continue; }
    const got = readTab(text, cfg, y, m);
    if (got.reason === 'ok') {
      CAL.posts = got.posts; CAL.tab = tab; CAL.state = 'ready';
      const blank = got.posts.filter(p => !p.hook).length;
      if (blank) CAL.note = blank === got.posts.length
        ? 'No hook text in the sheet this month — headlines start from the phrase bank.'
        : blank + ' of these have no hook text yet — those start from the phrase bank.';
      pickUpcoming();
      renderCalendar();
      return;
    }
    lastErr = got.reason;
  }
  CAL.state = lastErr === 'network' ? 'offline' : 'missing';
  renderCalendar();
}
function pickUpcoming(){
  const today = new Date(); today.setHours(0,0,0,0);
  const next = CAL.posts.find(p => p.date >= today) || CAL.posts[CAL.posts.length-1];
  CAL.sel = next ? next.iso : null;
}
function selectedPost(){ return CAL.posts.find(p => p.iso === CAL.sel) || null; }

// Which posts already have a graphic. Local to this browser for now; phase 2 replaces this
// with what is actually sitting in the Drive folder.
let calDone = {};
function loadCalDone(){ try { calDone = JSON.parse(localStorage.getItem(LS.calendar) || '{}') || {}; } catch { calDone = {}; } }
function saveCalDone(){ try { localStorage.setItem(LS.calendar, JSON.stringify(calDone)); } catch {} }
function doneKey(p){ return (calCfg() || {}).sheetId + '|' + p.iso; }
function markPostDone(p){ if (!p) return; calDone[doneKey(p)] = Date.now(); saveCalDone(); renderCalendar(); }

// Choosing a post fills the headline box from its hook text, and falls back to the phrase
// bank when the sheet has none yet. The box stays editable either way.
function usePost(iso){
  const p = CAL.posts.find(x => x.iso === iso); if (!p) return;
  CAL.sel = iso;
  pushUndo();
  let head = p.hook;
  if (!head) {
    const from = p.post || p.bucket || '';
    head = suggestText(from ? detectTopic(from) : 'any').headline;
  }
  if (S.template === 'logo' || S.template === 'photo') { S.template = 'note'; templateDefaults(); }
  layout();
  const el = byId('headline');
  if (el) el.text = head; else { S.template = 'note'; templateDefaults(); layout(); const e2 = byId('headline'); if (e2) e2.text = head; }
  renderQuickFields(); syncControls(); renderInspector(); render(); persist();
  renderCalendar();
}

// SpringForth_2026-10-05_Mon.png, so a month's graphics sort by date in the Drive folder.
function calFilename(){
  const p = selectedPost(); if (!p) return null;
  return 'SpringForth_' + p.iso + '_' + DAY_ABBR[p.date.getDay()] + '.png';
}

// ---------- panel ----------
function monthOptions(){
  const out = []; const now = new Date();
  for (let i = -6; i <= 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth()+i, 1);
    out.push({ y:d.getFullYear(), m:d.getMonth(), label:MONTHS[d.getMonth()] + ' ' + d.getFullYear() });
  }
  return out;
}
function renderCalendar(){
  const sec = $('#calSec'); if (!sec) return;
  const cfg = calCfg();
  if (!cfg) { sec.hidden = true; return; }
  sec.hidden = false;
  const sel = $('#calMonth');
  if (sel && !sel.options.length) {
    for (const o of monthOptions()) sel.append(h('option',{value:o.y+'-'+o.m}, o.label));
    sel.value = (CAL.ym ? CAL.ym.y + '-' + CAL.ym.m : '');
  }
  const status = $('#calStatus'), list = $('#calList'), cap = $('#calPost');
  list.innerHTML = '';
  if (CAL.state === 'loading') { status.textContent = 'Reading the calendar…'; cap.hidden = true; return; }
  if (CAL.state === 'offline') { status.textContent = 'Couldn’t reach the calendar. You can still type a headline yourself.'; cap.hidden = true; return; }
  if (CAL.state === 'missing') { status.textContent = 'No tab for this month in the sheet yet. Type a headline yourself, or pick another month.'; cap.hidden = true; return; }
  if (CAL.state !== 'ready') { status.textContent = ''; cap.hidden = true; return; }
  status.textContent = CAL.posts.length + ' post' + (CAL.posts.length === 1 ? '' : 's') + ' · tab “' + CAL.tab + '”'
    + (CAL.note ? ' · ' + CAL.note : '');
  for (const p of CAL.posts) {
    const done = !!calDone[doneKey(p)];
    const row = h('button',{class:'cal-row','aria-pressed':String(p.iso === CAL.sel),onclick:()=>usePost(p.iso)},
      h('span',{class:'cal-when'}, DAY_ABBR[p.date.getDay()] + ' ' + (p.date.getMonth()+1) + '/' + p.date.getDate()),
      h('span',{class:'cal-body'},
        h('span',{class:'cal-hook'}, p.hook || '— no hook text yet —'),
        h('span',{class:'cal-bucket'}, p.bucket || '')),
      h('span',{class:'cal-done',title:done ? 'A graphic has been downloaded for this post' : ''}, done ? '✓' : ''));
    list.append(row);
  }
  const p = selectedPost();
  if (p && p.post) {
    cap.hidden = false;
    $('#calPostText').textContent = p.post;
  } else cap.hidden = true;
}
async function wireCalendar(){
  if (!window.BI_CLIENTS) await new Promise(r => window.addEventListener('load', r, { once:true }));
  const cfg = calCfg();
  if (!cfg) { const sec = $('#calSec'); if (sec) sec.hidden = true; return; }
  $('#calMonth').addEventListener('change', e => {
    const [y,m] = e.target.value.split('-').map(Number);
    loadMonth(y, m);
  });
  $('#calOpen').addEventListener('click', () => window.open(cfg.url, '_blank', 'noopener'));
  $('#calCopy').addEventListener('click', async () => {
    const p = selectedPost(); if (!p) return;
    try { await navigator.clipboard.writeText(p.post); toast('Post text copied'); }
    catch { toast('Couldn’t copy — select the text and copy it by hand'); }
  });
  loadCalDone();
  const now = new Date();
  $('#calMonth').value = now.getFullYear() + '-' + now.getMonth();
  loadMonth(now.getFullYear(), now.getMonth());
}
