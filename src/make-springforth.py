#!/usr/bin/env python3
"""Derive Spring Forth Academy's studio template from the shared engine.

Spring Forth's look is a scrapbook: crumpled paper, a blue wave footer, gold doodles, sticky
notes, taped photos and cork-board parent quotes. All of that art is generated in code and lives
in src/springforth/*.js; the engine (canvas editor, drafts, undo, export, welcome card) is shared.

Run:  python3 src/make-springforth.py   → writes src/template-springforth.html   (then src/build.py)
"""
import pathlib, re
ROOT = pathlib.Path(__file__).resolve().parent.parent
s = (ROOT / 'src/template-bakken-young.html').read_text()
blk = lambda name: (ROOT / 'src/springforth' / name).read_text()

def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ('anchor', s.count(a), a[:90])
    s = s.replace(a, b)

def rep_between(start, end, new):
    global s
    i = s.index(start); j = s.index(end, i); s = s[:i] + new + s[j:]

# ================= identity / fonts / theme =================
rep("<title>Bakken-Young Graphics</title>", "<title>Spring Forth Graphics</title>")
rep('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Nunito+Sans:wght@400;600;700&display=swap">',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gochi+Hand&family=Caveat:wght@500;600;700&family=Quicksand:wght@400;500;600;700&family=Nunito+Sans:wght@400;600;700&display=swap">')
s = s.replace('font:600 20px/1 "Cormorant Garamond",Georgia,serif;letter-spacing:.01em', 'font:700 19px/1 "Quicksand",sans-serif;letter-spacing:.01em')
s = s.replace('font:italic 700 15px "Cormorant Garamond",serif', 'font:400 15px "Gochi Hand",cursive')
s = s.replace('font:600 24px/1.1 "Cormorant Garamond",serif', 'font:400 26px/1.1 "Gochi Hand",cursive')
rep("const SERIF = '\"Cormorant Garamond\", Georgia, \"Times New Roman\", serif';",
    "const SERIF = '\"Gochi Hand\", \"Caveat\", \"Comic Sans MS\", cursive';\nconst SANS = '\"Quicksand\", \"Nunito Sans\", Arial, sans-serif';")
rep('<select id="profileSel" class="profile" aria-label="Client"><option value="bakken-young">Bakken-Young</option></select>\n    <span>Social graphics</span>',
    '<select id="profileSel" class="profile" aria-label="Client"><option value="springforth">Spring Forth</option></select>\n    <span>Academy</span>')
s = s.replace("--accent:#19441f; --accent-ink:#ffffff; --accent-soft:#e3ece3;", "--accent:#03a2c6; --accent-ink:#ffffff; --accent-soft:#ddeef8;")
s = s.replace("--focus:#19441f;", "--focus:#03a2c6;")
s = s.replace("--accent:#7fb58d; --accent-ink:#0f1a13; --accent-soft:#25352a;", "--accent:#1cc1e0; --accent-ink:#04222b; --accent-soft:#123945;")
s = s.replace("--focus:#7fb58d;", "--focus:#1cc1e0;")
s = s.replace("background:rgba(25,68,31,.75)", "background:rgba(3,162,198,.8)")
s = s.replace("background:linear-gradient(135deg,#19441f,#2f6b3a);color:#fff;border-color:#19441f", "background:linear-gradient(135deg,#03a2c6,#1cc1e0);color:#fff;border-color:#03a2c6")
s = s.replace("ctx.strokeStyle = '#19441f'; ctx.lineWidth = 1.5*k;", "ctx.strokeStyle = '#03a2c6'; ctx.lineWidth = 1.5*k;")

# ================= text: per-element font + tracking =================
rep("function fontStr(el, size){ return `${el.italic?'italic ':''}${el.weight} ${size||el.size}px ${SERIF}`; }",
    "function fontStr(el, size){ return `${el.italic?'italic ':''}${el.weight} ${size||el.size}px ${el.font === 'sans' ? SANS : SERIF}`; }")
rep("  return Object.assign({ id, type:'text', text:str, x:0, y:0, w:800, size:60, italic:false, weight:600, color:'#ffffff', align:'center', lh:1.12, shadow:true, upper:false, ls:0, shade:NO_SHADE() }, o);",
    "  return Object.assign({ id, type:'text', text:str, x:0, y:0, w:800, size:60, italic:false, weight:400, color:'#03a2c6', align:'center', lh:1.2, shadow:false, upper:false, ls:0, font:'hand', shade:NO_SHADE() }, o);")
rep("function wrapLines(ctx, el){\n  ctx.font = fontStr(el);\n  if ('letterSpacing' in ctx) ctx.letterSpacing = (el.ls||0)+'px';",
    "function wrapLines(ctx, el){\n  ctx.font = fontStr(el);\n  if ('letterSpacing' in ctx) ctx.letterSpacing = ((el.ls||0)*el.size)+'px';")
rep("  ctx.font = fontStr(el);\n  if ('letterSpacing' in ctx) ctx.letterSpacing = (el.ls||0)+'px';\n  ctx.fillStyle = el.color; ctx.textBaseline = 'alphabetic'; ctx.textAlign = el.align;",
    "  ctx.font = fontStr(el);\n  if ('letterSpacing' in ctx) ctx.letterSpacing = ((el.ls||0)*el.size)+'px';\n  ctx.fillStyle = el.color; ctx.textBaseline = 'alphabetic'; ctx.textAlign = el.align;")

# ================= constants / state =================
rep("""const COLORS = [
  ['#ffffff','White'],['#19441f','Bakken green'],['#719587','Sage'],['#f0ad54','Gold'],['#592231','Plum'],['#1f1f1f','Charcoal'],['#f3e9d2','Cream']
];
const SHADE_COLORS = [['#000000','Black'],['#19441f','Bakken green'],['#592231','Plum'],['#719587','Sage'],['#f0ad54','Gold'],['#ffffff','White']];
const LS = { prefs:'by-prefs-v4', drafts:'by-drafts-v1', photos:'by-photos-v1' };""",
"""const COLORS = [
  ['#03a2c6','Deep blue'],['#1cc1e0','Sky'],['#ffc000','Yellow'],['#bb8a2d','Bronze'],['#ffffff','White'],['#6d7f88','Slate'],['#2f3a40','Charcoal']
];
const SHADE_COLORS = [['#000000','Black'],['#03a2c6','Deep blue'],['#1cc1e0','Sky'],['#bb8a2d','Bronze'],['#ffffff','White']];
const LS = { prefs:'sfa-prefs-v1', drafts:'sfa-drafts-v1', photos:'sfa-photos-v1' };""")
rep("const LOGO_SRC = 'data:image/png;base64,__LOGO_B64__';",
    "const LOGO_SRCS = { 'mark':'data:image/png;base64,__MARK_B64__', 'mark-white':'data:image/png;base64,__MARKW_B64__',\n"
    "  'lockup':'data:image/png;base64,__LOCKUP_B64__', 'lockup-white':'data:image/png;base64,__LOCKUPW_B64__',\n"
    "  'wordmark':'data:image/png;base64,__WORD_B64__', 'wordmark-white':'data:image/png;base64,__WORDW_B64__' };\nconst LOGOS = {};")
rep("const DEFAULT_QUERY = { logo:'sunlight through leaves', headline:'hands holding comfort', event:'person writing notebook', review:'forest canopy looking up' };\n", "")
rep("""const LOOKS = {
  classic: { label:'White on photo', accent:'#ffffff', text:'#ffffff', shadow:true,  dim:null, fade:null,   shade:{style:'none',color:'#000000',alpha:0.35}, swatch:['#3b4a3e','#fff'] },
  green:   { label:'Green on light', accent:'#19441f', text:'#19441f', shadow:false, dim:0,    fade:'none', shade:{style:'none',color:'#000000',alpha:0.3}, dark:true, swatch:['#e8e4d6','#19441f'] },
  gold:    { label:'Gold accent',    accent:'#f0ad54', text:'#ffffff', shadow:true,  dim:null, fade:null,   shade:{style:'none',color:'#000000',alpha:0.35}, swatch:['#3b4a3e','#f0ad54'] },
};""",
"""const LOOKS = {
  blue: { label:'Blue writing', accent:'#03a2c6', text:'#6d7f88', shadow:false, dim:null, fade:null, swatch:['#fbfaf6','#03a2c6'] },
  gold: { label:'Gold writing', accent:'#bb8a2d', text:'#8a7a55', shadow:false, dim:null, fade:null, swatch:['#fbfaf6','#bb8a2d'] },
};""")
rep("let S = { template:'headline', size:'square', textPos:'tc', look:'classic',\n          bg:{zoom:1, ox:0, oy:0, dim:0.35, fadePos:'none', fade:0.45, fadeSize:0.55, fadeColor:'#000000'}, els:[], sel:null };",
    "let S = { template:'note', size:'portrait', textPos:'tc', look:'blue', wave:'bottom', noteFill:'#dff1ee', noteRot:-0.015, doodles:[],\n          bg:{kind:'paper', ground:'paper', seed:11, zoom:1, ox:0, oy:0, dim:0, fadePos:'none', fade:0.45, fadeSize:0.5, fadeColor:'#000000'}, els:[], sel:null };")
rep("const BUILT_IN_KEY = 'dMBOWE33ohoJ8Weu0lSEIQhWNDpSnHnC3n9Vkhs3l7I4cfYOKDJgZ7Tf';\nlet page = 1, lastQuery = '', results = [], apiKey = BUILT_IN_KEY, tab = 'search';",
    "let page = 1, lastQuery = '', results = [];")
rep("const IMG = { bg:null, logo:null, src:null }; // src: {kind:'pexels',id,url,tiny,photographer,alt} | {kind:'own',data}",
    "const IMG = { bg:null, src:null, lib:{} }; // src: {kind:'lib',id,url,...} | {kind:'own',data} | {kind:'ground',ground} | {kind:'collage',cells}")
rep("function logoAspect(){ return IMG.logo ? IMG.logo.naturalHeight / IMG.logo.naturalWidth : 0.286; }",
    "function logoImg(el){ return LOGOS[(el && el.variant) || 'lockup']; }\n"
    "function markAspect(v){ const base = (v||'lockup').replace('-white',''); const im = LOGOS[base] || LOGOS[base+'-white'];\n"
    "  return im ? im.naturalHeight / im.naturalWidth : (base === 'wordmark' ? 0.134 : 1.12); }\n"
    "function logoAspect(el){ return markAspect((el && el.variant) || 'lockup'); }")
rep("if (el.type === 'logo') return { x:el.x, y:el.y, w:el.w, h:el.w*logoAspect() };",
    "if (el.type === 'logo') return { x:el.x, y:el.y, w:el.w, h:el.w*logoAspect(el) };\n  if (el.type === 'image') return { x:el.x, y:el.y, w:el.w, h:el.w*imageAspect(el) };")
rep("function drawLogo(ctx, el){\n  const h = el.w * logoAspect();", "function drawLogo(ctx, el){\n  const h = el.w * logoAspect(el);")
rep("  if (IMG.logo) ctx.drawImage(IMG.logo, el.x, el.y, el.w, h);", "  const im = logoImg(el);\n  if (im) ctx.drawImage(im, el.x, el.y, el.w, h);")
rep("function logoEl(o){ const L = LOOKS[S.look]; return Object.assign({ id:'logo', type:'logo', shadow:true, shade:{style:L.shade.style, color:L.shade.color, alpha:L.shade.alpha, size:0.5} }, o); }",
    "function logoEl(o){ return Object.assign({ id:'logo', type:'logo', variant:'lockup', shadow:false, shade:NO_SHADE() }, o); }")

# ================= backgrounds, notes, framed photos =================
rep_between("function drawBokeh(w, h){", "// Soft feathered rectangle", blk('backgrounds.js'))
rep("    else if (el.type === 'logo') drawLogo(ctx, el);\n  }\n  if (!forExport && S.sel) {",
    "    else if (el.type === 'logo') drawLogo(ctx, el);\n    else if (el.type === 'image') drawImageEl(ctx, el);\n    else if (el.type === 'note') drawNote(ctx, el);\n  }\n  if (!forExport && S.sel) {")
rep("    else if (el.type === 'logo') el.w = drag.w0*f;\n    else { el.w = drag.w0*f; el.h = drag.h0*f; }",
    "    else if (el.type === 'logo' || el.type === 'image') el.w = drag.w0*f;\n    else { el.w = drag.w0*f; el.h = drag.h0*f; }")

# ================= layout + look =================
rep_between("function layout(){", "// Apply the current look's colors", blk('layout.js'))
rep_between("// Apply the current look's colors", "// ---------- text measuring ----------",
"""// Apply the look: handwriting in brand blue (or bronze) on paper, white over a photo.
// The footer line stays white on the wave and the quote stays blue on its note.
function applyLook(withPhoto){
  const L = LOOKS[S.look];
  const onPhoto = S.bg.kind === 'photo';
  for (const el of S.els) {
    if (el.type !== 'text') continue;
    if (el.id === 'site') { el.color = '#ffffff'; el.shadow = false; continue; }
    if (el.id === 'quote') { el.color = L.accent; el.shadow = false; continue; }
    if (el.id === 'attr') { el.shadow = false; continue; }
    const inNote = S.template === 'note' && el.id === 'headline';
    el.color = (onPhoto && !inNote) ? '#ffffff' : (el.id === 'headline' ? L.accent : L.text);
    el.shadow = onPhoto && !inNote;
  }
  if (withPhoto) { templateDefaults(); if (IMG.bg && S.bg.kind === 'photo') autoContrast(false); }
}

""")
rep("function autoContrast(announce){\n  if (!IMG.bg) return;",
    "function autoContrast(announce){\n  if (S.bg.kind !== 'photo' || !IMG.bg) { S.bg.dim = 0; syncControls(); render(); return; }")
rep("    S.bg.dim = Math.round(Math.min(0.5, Math.max(0.2, 0.15 + lum * 0.5)) * 100) / 100;",
    "    S.bg.dim = Math.round(Math.min(0.45, Math.max(0.08, 0.02 + lum * 0.5)) * 100) / 100;")

# ================= HTML: template tiles, controls, background section =================
rep_between('      <div class="tiles" id="tiles">', '      </div>\n      <div class="row" style="margin-top:10px"><label for="size">Size</label>',
"""      <div class="tiles" id="tiles">
        <button class="tile" data-t="note" aria-pressed="false">
          <svg viewBox="0 0 44 44"><rect x="2" y="2" width="40" height="40" rx="4" fill="#eef3f2"/><rect x="2" y="33" width="40" height="9" fill="#1cc1e0"/><rect x="9" y="10" width="26" height="19" rx="2" fill="#dff1ee" stroke="#a9cfc8"/><rect x="17" y="8" width="10" height="4" rx="1" fill="#f0e2c0"/><path d="M13 16h18M15 21h14" stroke="#03a2c6" stroke-width="2" stroke-linecap="round"/></svg>Note</button>
        <button class="tile" data-t="headline" aria-pressed="false">
          <svg viewBox="0 0 44 44"><rect x="2" y="2" width="40" height="40" rx="4" fill="#eef3f2"/><rect x="2" y="33" width="40" height="9" fill="#1cc1e0"/><path d="M9 9h26M13 15h18" stroke="#03a2c6" stroke-width="2.4" stroke-linecap="round"/><rect x="11" y="20" width="22" height="10" rx="1.5" fill="#fff" stroke="#c3cdd2"/></svg>Headline</button>
        <button class="tile" data-t="photo" aria-pressed="false">
          <svg viewBox="0 0 44 44"><rect x="2" y="2" width="40" height="40" rx="4" fill="#9fb8c4"/><path d="M2 26l11-9 9 7 7-5 13 10v8a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" fill="#7d9aa8"/><circle cx="31" cy="12" r="4" fill="#ffc000"/><rect x="2" y="33" width="40" height="9" fill="#1cc1e0"/></svg>Photo</button>
        <button class="tile" data-t="collage" aria-pressed="false">
          <svg viewBox="0 0 44 44"><rect x="2" y="2" width="40" height="40" rx="4" fill="#eef3f2"/><rect x="2" y="33" width="40" height="9" fill="#1cc1e0"/><rect x="6" y="7" width="15" height="12" fill="#fff" stroke="#c3cdd2"/><rect x="23" y="7" width="15" height="12" fill="#fff" stroke="#c3cdd2"/><rect x="6" y="21" width="32" height="9" fill="#fff" stroke="#c3cdd2"/></svg>Collage</button>
        <button class="tile" data-t="quote" aria-pressed="false">
          <svg viewBox="0 0 44 44"><rect x="2" y="2" width="40" height="40" rx="4" fill="#c9a36b"/><rect x="9" y="7" width="26" height="30" rx="1.5" fill="#fffdf6" stroke="#ddd3bb"/><circle cx="22" cy="10" r="2.4" fill="#e05c4b"/><path d="M13 17h18M13 22h18M13 27h11" stroke="#8fb9cb" stroke-width="1.6" stroke-linecap="round"/></svg>Quote</button>
        <button class="tile" data-t="logo" aria-pressed="false">
          <svg viewBox="0 0 44 44"><rect x="2" y="2" width="40" height="40" rx="4" fill="#9fb8c4"/><path d="M2 24l12-8 10 7 6-4 12 9v6a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" fill="#7d9aa8"/><rect x="2" y="31" width="40" height="11" fill="#03a2c6"/><rect x="13" y="34" width="18" height="5" rx="2" fill="#fff"/></svg>Logo</button>
""")
rep(".tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}", ".tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}")
rep(".tile{border:1px solid var(--line-strong);border-radius:8px;background:var(--panel-2);padding:8px 6px;",
    ".tile{border:1px solid var(--line-strong);border-radius:8px;background:var(--panel-2);padding:7px 4px;")
rep("""      <div class="row" id="textPosRow"><label>Text</label>
        <div class="seg" id="textPos">
          <button data-v="tc" aria-pressed="true">Top</button>
          <button data-v="tl" aria-pressed="false">Top left</button>
          <button data-v="tr" aria-pressed="false">Top right</button>
          <button data-v="mid" aria-pressed="false">Middle</button>
        </div></div>""",
"""      <div class="row" id="textPosRow"><label>Text</label>
        <div class="seg" id="textPos">
          <button data-v="tc" aria-pressed="true">Top</button>
          <button data-v="tl" aria-pressed="false">Top left</button>
          <button data-v="mid" aria-pressed="false">Middle</button>
        </div></div>
      <div class="row"><label>Wave</label>
        <div class="seg" id="waveSeg">
          <button data-v="bottom" aria-pressed="true">Bottom</button>
          <button data-v="top" aria-pressed="false">Top</button>
          <button data-v="both" aria-pressed="false">Both</button>
          <button data-v="none" aria-pressed="false">None</button>
        </div></div>
      <div class="row" id="noteFillRow"><label>Note</label><div class="swatches" id="noteFills"></div></div>""")
# background section replaces the Pexels search section
i = s.index('    <div class="sec">\n      <h2>Background photo'); j = s.index('    <div class="sec">\n      <h2>Photo adjustments')
s = s[:i] + """    <div class="sec">
      <h2>Background</h2>
      <div class="subh" style="margin-top:0">Paper</div>
      <div class="chips" id="artChips"></div>
      <div class="subh">Spring Forth photos</div>
      <div class="tabs" id="tabs" style="margin-top:0">
        <button data-tab="lib" aria-selected="true">Library</button>
        <button data-tab="favs" aria-selected="false">Favorites</button>
        <button data-tab="recent" aria-selected="false">Recently used</button>
      </div>
      <div class="chips" id="kindChips" style="margin-top:8px"></div>
      <div class="results" id="results"></div>
      <div class="results-status" id="rstatus"></div>
      <div class="row" style="margin-top:10px">
        <input type="file" id="bgFile" accept="image/*" hidden>
        <button class="btn sm" id="bgBtn">Upload a photo…</button>
        <button class="btn sm" id="collageBtn" title="3–4 library photos, taped and tilted">⊞ Collage</button>
      </div>
      <p class="hint" style="margin-top:6px">On a paper layout a photo lands framed on the page; on Photo or Logo it fills the background. You can also drag a photo onto the canvas or paste one (⌘V).</p>
    </div>

""" + s[j:]
rep('<button class="btn sm" id="shufPhoto" title="Keep the layout, try a different photo">Shuffle photo</button>', '<button class="btn sm" id="shufPhoto" title="Keep the text, try a different background">Shuffle background</button>')
rep('<button class="btn sm" id="addText">+ Add text</button>',
    '<button class="btn sm" id="collageQuick" title="Generate a photo collage">⊞ Collage</button>\n      <button class="btn sm" id="addText">+ Add text</button>')
rep('<h2>Photo adjustments <button class="btn link" id="autoBtn" title="Set Darken and Fade based on how bright the photo is behind the logo and text">Auto-adjust</button></h2>',
    '<h2>Photo adjustments <button class="btn link" id="autoBtn" title="Set Darken based on how bright the photo is">Auto-adjust</button></h2>\n      <p class="hint" id="adjHint" hidden>These apply when a photo fills the background.</p>')
rep("""        <button data-v="auto" aria-pressed="true">Auto</button>
        <button data-v="logo" aria-pressed="false">Logo only</button>
        <button data-v="headline" aria-pressed="false">Headline</button>
        <button data-v="event" aria-pressed="false">Event</button>
        <button data-v="review" aria-pressed="false">Review</button>""",
"""        <button data-v="auto" aria-pressed="true">Auto</button>
        <button data-v="note" aria-pressed="false">Note</button>
        <button data-v="headline" aria-pressed="false">Headline</button>
        <button data-v="photo" aria-pressed="false">Photo</button>
        <button data-v="collage" aria-pressed="false">Collage</button>
        <button data-v="quote" aria-pressed="false">Quote</button>""")
rep("<p>Type what it should say — first line is the headline, the next line the subline. Add a date or time and it becomes an event. Paste a client's quote for a review. Leave it blank for logo only. Keep pressing Generate until you like one, then tweak.</p>",
    "<p>Type the headline (first line) and an optional second line. A short phrase like <b>Ownership</b> becomes a sticky-note card. Paste a parent’s quote and it becomes a cork-board note. Leave it blank for a photo. Keep pressing Generate until you like one, then tweak.</p>")
rep('placeholder="Pre-Planning&#10;a simple process&#10;&#10;…or paste the whole caption here"',
    'placeholder="Ownership&#10;&#10;…or paste the whole caption here"')
rep('<div class="kicker">Bakken-Young studio</div>', '<div class="kicker">Spring Forth studio</div>')
rep('.welcome-card h2{margin:0 0 10px;font:600 40px/1.05 "Cormorant Garamond",Georgia,serif;color:var(--ink)}',
    '.welcome-card h2{margin:0 0 10px;font:400 44px/1.05 "Gochi Hand",cursive;color:var(--ink)}')
s = s.replace("rgba(25,68,31,.55)", "rgba(3,162,198,.55)").replace("rgba(25,68,31,0)", "rgba(3,162,198,0)")
rep("['#tiles','#results','#drafts','#genBtn','#shufPhoto','#shufLook','#addText','#bgBtn','#importBtn','#looks']",
    "['#tiles','#results','#drafts','#genBtn','#shufPhoto','#shufLook','#addText','#bgBtn','#importBtn','#looks','#artChips','#collageBtn','#collageQuick']")

# ================= controls / sync =================
rep("$('#textPos').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; pushUndo(); S.textPos = b.dataset.v; templateDefaults(); layout(); syncControls(); renderInspector(); render(); persist(); });",
"""$('#textPos').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; pushUndo(); S.textPos = b.dataset.v; templateDefaults(); layout(); syncControls(); renderInspector(); render(); persist(); });
$('#waveSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; pushUndo(); S.wave = b.dataset.v; templateDefaults(); layout(); syncControls(); renderInspector(); render(); persist(); });
function renderNoteFills(){
  const box = $('#noteFills'); box.innerHTML = '';
  for (const [hex,name] of NOTE_FILLS) box.append(h('button',{class:'sw',title:name,style:`background:${hex}`,'aria-pressed':String((S.noteFill||'').toLowerCase()===hex),onclick:()=>{ pushUndo(); S.noteFill = hex; layout(); syncControls(); render(); persist(); }}));
}""")
rep("  $('#textPosRow').style.display = (S.template === 'headline' || S.template === 'event') ? '' : 'none';",
"""  $('#textPosRow').style.display = S.template === 'headline' ? '' : 'none';
  $('#noteFillRow').style.display = S.template === 'note' ? '' : 'none';
  document.querySelectorAll('#waveSeg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === (S.wave||'bottom'))));
  renderNoteFills(); renderGroundChips();
  const isPhoto = S.bg.kind === 'photo';
  ['dim','zoom','fade','fadeSize'].forEach(id => { const n = document.getElementById(id); if (n) n.closest('.row').style.opacity = isPhoto ? '' : '.4'; });
  $('#adjHint').hidden = isPhoto;""")
rep("function setTemplate(t){\n  pushUndo(); S.template = t; templateDefaults(); layout(); if (IMG.bg && !LOOKS[S.look].dark) autoContrast(false);\n  syncControls(); renderInspector(); render();\n  if (apiKey) { $('#q').value = DEFAULT_QUERY[t]; search(true); }\n}",
"""async function setTemplate(t){
  pushUndo(); S.template = t;
  // each template needs the right ground: photos fill, paper carries writing, quotes sit on cork
  if ((t === 'photo' || t === 'logo') && S.bg.kind !== 'photo') { if (await randomBackground(t) === 'none') toast('Add Spring Forth photos to the library, or upload one below'); }
  else if (t === 'collage' && S.bg.kind !== 'collage') { if (await randomBackground('collage') === 'none') toast('A collage needs at least 3 library photos'); }
  else if (t === 'quote') { await randomBackground('quote'); }
  else if (S.bg.kind !== 'paper') { await randomBackground(t); }
  templateDefaults(); layout(); if (IMG.bg && S.bg.kind === 'photo') autoContrast(false);
  syncControls(); renderInspector(); renderResults(); render();
}""")
rep("function snapshot(){ return JSON.stringify({ template:S.template, size:S.size, textPos:S.textPos, look:S.look, bg:S.bg, els:S.els }); }",
    "function snapshot(){ return JSON.stringify({ template:S.template, size:S.size, textPos:S.textPos, look:S.look, wave:S.wave, waveWas:S.waveWas, noteFill:S.noteFill, noteRot:S.noteRot, doodles:S.doodles, bg:S.bg, els:S.els }); }")
rep("state: { template:S.template, size:S.size, textPos:S.textPos, look:S.look, bg:clone(S.bg), els:clone(S.els) }",
    "state: { template:S.template, size:S.size, textPos:S.textPos, look:S.look, wave:S.wave, waveWas:S.waveWas, noteFill:S.noteFill, noteRot:S.noteRot, doodles:clone(S.doodles||[]), bg:clone(S.bg), els:clone(S.els) }")
rep("  if (['tc','tl','tr','mid'].includes(o.textPos)) S.textPos = o.textPos;", "  if (['tc','tl','mid'].includes(o.textPos)) S.textPos = o.textPos;")
rep("  if (['logo','headline','event','review'].includes(o.template)) S.template = o.template;", "  if (['logo','headline','photo','collage','quote','note'].includes(o.template)) S.template = o.template;")
rep("  if (typeof o.apiKey === 'string' && o.apiKey) apiKey = o.apiKey;\n", "")
rep("JSON.stringify({ template:S.template, size:S.size, textPos:S.textPos, look:S.look, apiKey })", "JSON.stringify({ template:S.template, size:S.size, textPos:S.textPos, look:S.look, wave:S.wave })")
rep("  if (['top','with','bottom'].includes(o.logoPos)) S.logoPos = o.logoPos;\n", "") if "o.logoPos" in s else None
rep_between("// A setup link (", "// ---------- export ----------", "")
rep("(IMG.src?.kind === 'pexels' ? ` · Photo: ${IMG.src.photographer} / Pexels` : '')",
    "(S.bg.kind === 'collage' ? ' · Collage' : S.bg.kind === 'photo' && IMG.src?.kind === 'lib' ? ` · ${IMG.src.file}` : ` · ${GROUNDS[S.bg.ground] || 'Paper'}`)")

rep("""  const defs = S.template === 'headline' ? [['headline','Headline','input'],['sub','Subheadline','input']]
             : S.template === 'event' ? [['headline','Event title','input'],['sub','Details (date, time, place)','textarea']]
             : S.template === 'review' ? [['quote','Review quote','textarea'],['attr','Attribution','input']] : [];""",
"""  const defs = S.template === 'headline' ? [['headline','Headline','textarea'],['sub','Second line','input'],['site','Footer line','textarea']]
             : S.template === 'note' ? [['headline','On the note','textarea'],['site','Footer line','textarea']]
             : S.template === 'quote' ? [['quote','Parent quote','textarea'],['attr','Attribution','input']]
             : [['headline','Headline','textarea'],['site','Footer line','textarea']];""")

# ================= inspector: logo variants, framed photo, note =================
rep("    box.append(h('p',{class:'hint',style:'margin-bottom:8px'}, 'Bakken-Young logo'));",
    "    box.append(row('Logo', seg([['lockup','Stacked'],['mark','Shield'],['wordmark','Wide']], ()=>(el.variant||'lockup').replace('-white',''), v=>el.variant = v + (String(el.variant||'').includes('white') ? '-white' : ''))));\n"
    "    box.append(row('Colour', seg([['color','Full colour'],['white','White']], ()=>String(el.variant||'').includes('white') ? 'white' : 'color', v=>el.variant = (el.variant||'lockup').replace('-white','') + (v === 'white' ? '-white' : ''))));")
rep("  else if (el.type === 'box') {\n    box.append(h('div',{class:'field'}, h('label',{},'Label'),",
"""  else if (el.type === 'image') {
    box.append(h('p',{class:'hint',style:'margin-bottom:8px'}, 'Photo on the page. Drag to move, corners to resize.'));
    box.append(row('Width', h('input',{type:'range',id:'insp-width',min:Math.round(W()*0.15),max:W(),value:Math.round(el.w),oninput:change(e=>{guard();el.w=+e.target.value;})})));
    box.append(row('Frame', seg([['tape','Taped'],['polaroid','Polaroid'],['plain','Plain']], ()=>el.style||'tape', v=>el.style=v)));
    box.append(row('Tilt', h('input',{type:'range',min:-12,max:12,value:Math.round((el.rot||0)*100),oninput:change(e=>{guard();el.rot=e.target.value/100;})})));
  }
  else if (el.type === 'note') {
    box.append(h('p',{class:'hint',style:'margin-bottom:8px'}, 'The card behind the writing. Moving it moves the text with it.'));
    box.append(row('Colour', swatches(NOTE_FILLS, ()=>el.fill, v=>{ el.fill = v; S.noteFill = v; })));
    box.append(row('Tilt', h('input',{type:'range',min:-8,max:8,value:Math.round((el.rot||0)*100),oninput:change(e=>{guard();el.rot=e.target.value/100;S.noteRot=el.rot;})})));
    box.append(chk('Tape at the top', ()=>el.tape!==false, v=>el.tape=v));
    box.append(chk('Notebook lines', ()=>!!el.lines, v=>el.lines=v));
  }
  else if (el.type === 'box') {
    box.append(h('div',{class:'field'}, h('label',{},'Label'),""")
rep("    box.append(chk('ALL CAPS', ()=>el.upper, v=>el.upper=v));\n    if (el.align === 'center')",
    "    box.append(chk('ALL CAPS', ()=>el.upper, v=>el.upper=v));\n    box.append(row('Font', seg([['hand','Handwriting'],['sans','Clean sans']], ()=>el.font||'hand', v=>el.font=v)));\n    if (el.align === 'center')")
rep("rules:!!src.rules, shade:clone(src.shade || NO_SHADE()) });", "rules:!!src.rules, font:src.font, ls:src.ls, shade:clone(src.shade || NO_SHADE()) });")
rep("    else if (el.type === 'logo') Object.assign(el, { shadow:src.shadow, shade:clone(src.shade) });",
    "    else if (el.type === 'logo') Object.assign(el, { shadow:src.shadow, variant:src.variant, shade:clone(src.shade) });\n    else if (el.type === 'note') Object.assign(el, { fill:src.fill, rot:src.rot, tape:src.tape, lines:src.lines, pin:src.pin });")
rep("      for (const ex of extras) S.els.push(Object.assign(clone(ex), { x: ex.x/w0*w, y: ex.y/h0*hh, w: ex.w/w0*w, size: ex.size*Math.min(w/w0, hh/h0) }));",
    "      for (const ex of extras) S.els.push(Object.assign(clone(ex), { x: ex.x/w0*w, y: ex.y/h0*hh, w: ex.w/w0*w, size: ex.size*Math.min(w/w0, hh/h0) }));\n"
    "      S.doodles = (S.bg.kind === 'photo' || S.bg.ground === 'cork') ? [] : makeDoodles(S.bg.seed || 1, w, hh);\n"
    "      const pr = byId('photo'), pr0 = fromEls.find(e => e.id === 'photo'); if (pr && pr0) { pr.w = pr0.w/w0*w; pr.x = pr0.x/w0*w; pr.y = pr0.y/h0*hh; }")
rep("      if (IMG.bg && !LOOKS[S.look].dark) autoContrast(false);\n      const blob = await renderBlob();", "      if (IMG.bg && S.bg.kind === 'photo') autoContrast(false);\n      const blob = await renderBlob();")

# ================= photo memory + search → library =================
rep_between("// ---------- photo memory (favorites + recently used) ----------", "// ---------- own photo ----------", blk('library.js') + "\n")
rep("    IMG.bg = img; IMG.src = { kind:'own', data: shrinkForStorage(img) };\n    S.bg.ox = S.bg.oy = 0; S.bg.zoom = 1; $('#zoom').value = 100;\n    autoContrast(false); fitCanvas(); toast('Photo added');",
    "    IMG.bg = img; IMG.src = { kind:'own', data: shrinkForStorage(img) };\n    S.bg.kind = 'photo'; S.bg.cells = null; S.doodles = []; S.bg.ox = S.bg.oy = 0; S.bg.zoom = 1; $('#zoom').value = 100;\n    if (S.template === 'note' || S.template === 'quote') S.template = 'headline';\n    templateDefaults(); layout(); autoContrast(false); syncControls(); renderInspector(); fitCanvas(); toast('Photo added');")
rep("""  IMG.bg = null; IMG.src = null;
  if (d.photo) {
    $('#loading').classList.add('show');
    try {
      const img = new Image();
      if (d.photo.kind === 'pexels') img.crossOrigin = 'anonymous';
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = d.photo.kind === 'pexels' ? d.photo.url : d.photo.data; });
      IMG.bg = img; IMG.src = clone(d.photo);
    } catch { toast('The photo for this draft couldn’t be loaded'); }
    finally { $('#loading').classList.remove('show'); }
  }""",
"""  IMG.bg = null; IMG.src = null;
  $('#loading').classList.add('show');
  try {
    if (d.photo && d.photo.kind === 'lib') { IMG.bg = await libImage(d.photo.url); IMG.src = clone(d.photo); }
    else if (d.photo && d.photo.kind === 'own') { const img = new Image(); await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = d.photo.data; }); IMG.bg = img; IMG.src = clone(d.photo); }
    else if (d.photo) IMG.src = clone(d.photo);
    const pr = byId('photo'); if (pr) await libImage(pr.src);
    if (S.bg.kind === 'collage' && S.bg.cells) await Promise.all(S.bg.cells.map(c => libImage(c.url).catch(() => null)));
  } catch { toast('An image for this draft couldn’t be loaded'); }
  finally { $('#loading').classList.remove('show'); }""")
rep("  return `bakken-young-${slug}-${w}x${hh}.png`;", "  return `springforth-${slug}-${w}x${hh}.png`;")
rep("  const base = (S.template === 'headline' || S.template === 'event') ? (byId('headline')?.text || 'headline') : S.template === 'review' ? 'featured-review' : 'logo';",
    "  const base = byId('headline')?.text || (S.template === 'quote' ? 'parent-quote' : S.template === 'collage' ? 'collage' : S.template);")
rep("""function draftName(){
  if (S.template === 'headline' || S.template === 'event') return byId('headline')?.text || 'Headline';
  if (S.template === 'review') return 'Review: ' + (byId('quote')?.text || '').replace(/^\u201C/, '').slice(0, 40);
  return 'Logo only';
}""",
"""function draftName(){
  if (byId('headline')?.text) return byId('headline').text.replace(/\\n/g, ' ');
  if (S.template === 'quote') return 'Quote: ' + (byId('quote')?.text || '').replace(/^\u201C/, '').slice(0, 40);
  return S.template === 'collage' ? 'Collage' : 'Photo';
}""")

# ================= generator =================
rep_between("// ---------- Generate (randomizer) ----------", "// ---------- misc ----------", blk('generate.js'))

# ================= fonts / boot =================
rep("  try { await Promise.all(['italic 600 40px','600 40px','700 40px','500 40px','400 40px','italic 500 40px','italic 700 40px'].map(f => document.fonts.load(`${f} \"Cormorant Garamond\"`))); } catch {}",
    "  try { await Promise.all([document.fonts.load('400 40px \"Gochi Hand\"'), document.fonts.load('600 40px \"Caveat\"'),\n"
    "    ...['400 40px','500 40px','600 40px','700 40px'].map(f => document.fonts.load(`${f} \"Quicksand\"`))]); } catch {}")
rep("""  restore(); loadPhotoMem();
  const fromLink = keyFromLink();
  await new Promise(res => { const im = new Image(); im.onload = () => { IMG.logo = im; res(); }; im.onerror = res; im.src = LOGO_SRC; });
  renderLooks(); templateDefaults(); layout(); syncControls(); fitCanvas(); renderDrafts();
  $('#apiKey').value = apiKey; $('#q').value = DEFAULT_QUERY[S.template]; search(true);""",
"""  restore(); loadPhotoMem();
  await Promise.all(Object.entries(LOGO_SRCS).map(([k, url]) => new Promise(res => { const im = new Image(); im.onload = () => { LOGOS[k] = im; res(); }; im.onerror = res; im.src = url; })));
  IMG.src = { kind:'ground', ground:S.bg.ground };
  if (!S.doodles || !S.doodles.length) S.doodles = makeDoodles(S.bg.seed, W(), H());
  renderLooks(); templateDefaults(); layout(); syncControls(); fitCanvas(); renderDrafts();
  loadLibrary();""")

for bad in ['Bakken', 'funeral', 'Funeral', 'cremat', 'by-prefs', 'by-drafts', 'by-photos', 'by-learn', 'Cormorant',
            'Pre-Planning', 'apiKey', 'fetchPhotos', 'BLOCK_WORDS', 'keyFromLink', 'DEFAULT_QUERY', 'pexels', 'Pexels']:
    assert bad not in s, ('leftover', bad, [s[max(0,m.start()-70):m.start()+40] for m in re.finditer(re.escape(bad), s)][:2])
(ROOT / 'src/template-springforth.html').write_text(s)
print('template-springforth.html written')
