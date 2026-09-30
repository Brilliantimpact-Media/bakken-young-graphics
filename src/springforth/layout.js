// Footer lockup measured off the master (fractions of the 1080×1350 page):
// shield height .085h, lockup centred on y .928h, left edge .062w, shield-to-text gap .025w,
// two lines of .0455w on 1.12 line-height — "Visit us at" then the domain.
const FOOT = { h:0.085, cy:0.928, x:0.062, gap:0.025, size:0.0455, lh:1.12, aspect:1.122 };

function layout(){
  const w = W(), h = H(), u = U();
  const els = [];
  const m = 0.075*w;
  const pos = S.textPos || 'tc';
  const onPhoto = S.bg.kind === 'photo';
  const handSize = 78*u;

  // ---- the site lockup: shield + "Visit us at" / the domain, as one measured unit ----
  // House rule: every page carries it, and on the wave it sits where the band is deep enough
  // to hold it — the master puts it left when the wave rises on the left, right when it doesn't.
  function footer(){
    const banded = (S.wave || 'bottom') !== 'none';
    const onDark = banded || S.bg.ground === 'cork' || onPhoto;
    const label = byId('site')?.text ?? 'Visit us at\nspringforthsv.org';
    const markH = FOOT.h*h;
    let markW = markH/FOOT.aspect, size = FOOT.size*w, gap = FOOT.gap*w;
    const measure = () => { ctx.save(); ctx.font = `400 ${size}px ${SANS}`;
      const t = Math.max(...label.split('\n').map(s => ctx.measureText(s).width)); ctx.restore(); return t; };
    let tw = measure();
    const room = w*(1 - FOOT.x*2);
    if (markW + gap + tw > room) { size *= (room - markW - gap)/tw; tw = measure(); }
    const total = markW + gap + tw, fw = total/w;
    let x = FOOT.x*w, cy = FOOT.cy*h;
    if (banded) {
      const floor = 1 - ((typeof WAVE !== 'undefined' && WAVE && WAVE.gold) || 0.0148) - 0.014;
      const slot = (x0) => { const top = bandTopOver(x0, x0+fw) + 0.016; return { x0, top, room:floor - top }; };
      const need = Math.max(FOOT.h, 2*size*FOOT.lh/h);
      const opts = [slot(FOOT.x), slot(1 - FOOT.x - fw), slot((1-fw)/2)];
      const fit = opts.find(o => o.room >= need) || opts.reduce((a,b) => b.room > a.room ? b : a);
      x = fit.x0*w; cy = (fit.top + Math.min(fit.room, need)/2)*h;
    } else {
      x = (w - total)/2;
    }
    const blockH = 2*size*FOOT.lh;
    els.push(logoEl({ x, y:cy - markH/2, w:markW, variant:onDark ? 'mark-white' : 'mark', shadow:false }));
    els.push(text('site', label, { x:x + markW + gap, y:cy - blockH/2, w:tw + size*0.2, size, weight:400,
      align:'left', lh:FOOT.lh, font:'sans', color:onDark ? '#ffffff' : DEEP, color2:onDark ? GOLD : SKY, shadow:false }));
  }

  if (S.template === 'note') {
    // One card, sized to its words and optically centred in the space above the wave — the
    // master never leaves a paper page with a line of type and a hollow middle.
    const hl = byId('headline')?.text ?? 'Ownership';
    const hLines = hl.split('\n').reduce((n,l) => n + Math.max(1, Math.ceil(l.length/13)), 0);
    const textH = hLines * handSize * 1.22;
    const top = h*0.085, floor = (S.wave === 'none' ? 0.845 : bandCrestOver(0.1, 0.9) - 0.028)*h;
    const nw = w*0.72, nh = Math.min(floor - top, Math.max(h*0.40, textH + h*0.13));
    const nx = (w - nw)/2, ny = top + (floor - top - nh)*0.5;
    els.push({ id:'note', type:'note', x:nx, y:ny, w:nw, h:nh, fill:S.noteFill || '#e5f4ee',
               tapeFill:S.tapeFill || TAPE_FILLS[0], rot:S.noteRot ?? -0.015, tape:true, kids:['headline'] });
    els.push(text('headline', hl, { x:nx + nw*0.08, y:ny + (nh - textH)/2, w:nw*0.84, size:handSize,
      align:'center', lh:1.22, color:DEEP, shadow:false }));
    footer();
  }
  else if (S.template === 'list') {
    // their "Three questions …" / "Instead of … try:" format: a blue headline, then three
    // cards carrying a gold numeral, filling the page down to the wave.
    const hl = byId('headline')?.text ?? 'Three questions we encourage parents to ask';
    const hs = 66*u;
    const hLines = Math.max(1, Math.ceil(hl.length/24));
    els.push(text('headline', hl, { x:m, y:h*0.062, w:w-m*2, size:hs, align:'center', lh:1.18, color:DEEP, shadow:false }));
    const top = h*0.062 + hLines*hs*1.18 + h*0.055;
    const floor = (S.wave === 'none' ? 0.845 : bandCrestOver(0.06, 0.94) - 0.028)*h;
    const gap = w*0.032, nw = (w - m*2 - gap*2)/3;
    const nh = Math.max(h*0.19, Math.min(h*0.33, floor - top - h*0.02));
    const y0 = top + (floor - top - nh)*0.52;
    const defaults = ['“You worked hard on that.”','“You stuck with it, even when it was hard.”','“You tried a new strategy — that took courage.”'];
    for (let i=0;i<3;i++){
      const id = 'item-'+(i+1), nx = m + i*(nw+gap);
      const ny = y0 + (i===1 ? -h*0.020 : h*0.012);          // the middle card sits slightly proud
      els.push(text('num-'+(i+1), String(i+1), { x:nx, y:ny - 62*u, w:nw, size:58*u, align:'center', lh:1,
        color:GOLD, shadow:false }));
      els.push({ id:'note-'+(i+1), type:'note', x:nx, y:ny, w:nw, h:nh, fill:NOTE_FILLS[i%NOTE_FILLS.length][0],
                 rot:(i-1)*0.016, tape:false, kids:[id] });
      els.push(text(id, byId(id)?.text ?? defaults[i], { x:nx+nw*0.09, y:ny+nh*0.20, w:nw*0.82, size:29*u,
        align:'center', lh:1.30, font:'sans', color:'#2f3a40', shadow:false }));
    }
    footer();
  }
  else if (S.template === 'quote') {
    const q = byId('quote')?.text ?? '“It’s very hands on, student driven… I love that we allow them to fail early and cheaply.”';
    const a = byId('attr')?.text ?? '— a Spring Forth parent';
    // the note fills the board down to the wave rather than floating in the middle of it
    const floor = (S.wave === 'none' ? 0.88 : bandCrestOver(0.06, 0.94) - 0.030)*h;
    const nw = w*0.74, ny = h*0.115, nh = Math.max(h*0.44, floor - ny), nx = (w - nw)/2;
    els.push({ id:'note', type:'note', x:nx, y:ny, w:nw, h:nh, fill:'#fffdf6', rot:S.noteRot ?? 0.02,
               tape:false, lines:true, pin:'#e05c4b', kids:['quote','attr'] });
    els.push(text('quote', q, { x:nx+nw*0.10, y:ny+nh*0.16, w:nw*0.80, size:46*u, align:'left', lh:1.30,
      font:'sans', color:DEEP, shadow:false }));
    els.push(text('attr', a, { x:nx+nw*0.10, y:ny+nh*0.80, w:nw*0.80, size:26*u, align:'right', lh:1.2,
      font:'sans', color:'#6d7f88', shadow:false }));
    footer();
  }
  else if (S.template === 'collage') {
    const hl = byId('headline')?.text ?? '';
    if (hl) els.push(text('headline', hl, { x:m, y:h*0.045, w:w-m*2, size:60*u, align:'center', lh:1.2, color:DEEP, shadow:false }));
    footer();
  }
  else if (S.template === 'logo') {
    footer();
  }
  else { // 'headline' and 'photo' — a headline always sits with a photo
    const hl = byId('headline')?.text ?? 'Learning By Doing';
    const sb = byId('sub')?.text ?? '';
    const tw = pos === 'tl' ? w*0.76 : w - m*2;
    const align = pos === 'tl' ? 'left' : 'center';
    const hLines = Math.max(1, Math.ceil(hl.length/18));
    const y0 = h*0.055;
    const col = onPhoto ? '#ffffff' : DEEP;
    els.push(text('headline', hl, { x:m, y:y0, w:tw, size:handSize, align, lh:1.22, color:col, shadow:onPhoto }));
    if (sb) els.push(text('sub', sb, { x:m, y:y0 + handSize*1.26*hLines, w:tw, size:34*u, align, lh:1.32,
      font:'sans', color:onPhoto ? '#ffffff' : '#6d7f88', shadow:onPhoto }));
    footer();
  }

  // a framed photo belongs to the headline layout only — it never rides along under a card
  const ph = S.template === 'headline' ? byId('photo') : null; if (ph) els.unshift(ph);
  const notes = els.filter(e => e.type === 'note');           // notes render behind their own text
  for (const n of notes) { const i = els.indexOf(n); els.splice(i,1); els.unshift(n); }
  const p = els.findIndex(e => e.id === 'photo'); if (p > 0) els.unshift(els.splice(p,1)[0]);
  S.els = els;
  S.sel = null;
  applyLook(false);
  refreshDoodles();
}

// Doodles are placed last, once the content boxes are known, and only in free margins.
function refreshDoodles(){
  if (S.bg.kind === 'photo' || S.bg.ground === 'cork') { S.doodles = []; return; }
  const boxes = S.els.filter(e => e.type !== 'logo' && e.id !== 'site').map(e => bbox(ctx, e));
  const blob = S.els.filter(e => e.type === 'text' && e.id !== 'site').map(e => e.text).join(' ');
  S.doodles = placeDoodles(blob, W(), H(), boxes, S.bg.seed || 1);
}

function templateDefaults(){
  S.bg.dim = S.bg.kind === 'photo' ? 0.18 : 0;
  if (S.template === 'quote') {
    // the cork board still carries the wave: it is the one element on every page, and the
    // white lockup has nothing to sit on without it
    S.bg.ground = 'cork';
  } else {
    if (S.bg.ground === 'cork') S.bg.ground = 'paper';
    if (S.waveWas != null) { S.wave = S.waveWas; S.waveWas = null; }
  }
}
