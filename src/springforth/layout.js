function layout(){
  const w = W(), h = H(), u = U();
  const wide = w > h;
  const els = [];
  const m = 0.08*w;
  const pos = S.textPos || 'tc';
  const onPhoto = S.bg.kind === 'photo';
  // House rules (2026 Instagram set): handwritten headline in brand blue on crumpled paper,
  // gold doodles around the edges, and the blue wave footer carrying the mark + site address.
  const bandH = h * 0.155;

  // ---- the wave footer: white mark + "Visit us at springforthsv.org" ----
  function footer(){
    if ((S.wave || 'bottom') === 'none') return;
    const markW = w*0.115, markH = markW * markAspect('mark');
    const fs = 30*u, gap = w*0.022;
    const label = byId('site')?.text ?? 'Visit us at\nspringforthsv.org';
    const lines = label.split('\n').length;
    const textW = w*0.40;
    const groupW = markW + gap + textW;
    const cx = (w - groupW)/2;
    const by = h - bandH*0.52;
    els.push(logoEl({ x:cx, y:by - markH/2, w:markW, variant:'mark-white' }));
    els.push(text('site', label, { x:cx + markW + gap, y:by - (fs*1.18*lines)/2, w:textW, size:fs, weight:600,
      align:'left', lh:1.18, font:'sans', color:'#ffffff', shadow:false }));
  }

  if (S.template === 'note') {
    const hl = byId('headline')?.text ?? 'What Makes\nSpring Forth\nDifferent?';
    const hsize = 96*u;
    // the card grows with the writing, and the writing sits centred inside it
    const hLines = hl.split('\n').reduce((n,l) => n + Math.max(1, Math.ceil(l.length/13)), 0);
    const textH = hLines * hsize * 1.22;
    const nw = w*0.66, nh = Math.max(h*0.26, textH + h*0.085);
    const nx = (w - nw)/2, ny = h*0.19;
    els.push({ id:'note', type:'note', x:nx, y:ny, w:nw, h:nh, fill:S.noteFill || '#dff1ee', rot:S.noteRot ?? -0.015, tape:true, kids:['headline'] });
    els.push(text('headline', hl, { x:nx + nw*0.08, y:ny + (nh - textH)/2, w:nw*0.84, size:hsize, weight:400,
      align:'center', lh:1.22, color:DEEP, shadow:false }));
    footer();
  }
  else if (S.template === 'quote') {
    const q = byId('quote')?.text ?? '“It’s very hands on, student driven… I love that we allow them to fail early and cheaply.”';
    const a = byId('attr')?.text ?? '— a Spring Forth parent';
    const nw = w*0.68, nh = h*0.52, nx = (w - nw)/2, ny = h*0.17;
    els.push({ id:'note', type:'note', x:nx, y:ny, w:nw, h:nh, fill:'#fffdf6', rot:S.noteRot ?? 0.02, tape:false, lines:true, pin:'#e05c4b', kids:['quote','attr'] });
    els.push(text('quote', q, { x:nx + nw*0.10, y:ny + nh*0.17, w:nw*0.80, size:52*u, weight:400, align:'left', lh:1.34, color:DEEP, shadow:false }));
    const lw = w*0.19, lh = lw*markAspect('lockup');
    els.push(logoEl({ x:nx + nw*0.08, y:ny + nh - lh - nh*0.05, w:lw, variant:'lockup' }));
    els.push(text('attr', a, { x:nx + nw*0.10, y:ny + nh - lh*0.62, w:nw*0.80, size:28*u, weight:500, align:'right', lh:1.2, font:'sans', color:'#6d7f88', shadow:false }));
    footer();
  }
  else if (S.template === 'collage') {
    const hl = byId('headline')?.text ?? '';
    if (hl) els.push(text('headline', hl, { x:m, y:h*0.045, w:w-m*2, size:68*u, weight:400, align:'center', lh:1.2, color:DEEP, shadow:false }));
    footer();
  }
  else if (S.template === 'logo') {
    footer();
    if ((S.wave || 'bottom') === 'none') { const lw = w*0.34; els.push(logoEl({ x:(w-lw)/2, y:h - lw*markAspect('lockup') - 0.07*h, w:lw, variant:'lockup' })); }
  }
  else { // 'headline' — handwritten headline with an optional photo beneath
    const hl = byId('headline')?.text ?? 'Learning By Doing';
    const sb = byId('sub')?.text ?? '';
    const hsize = 78*u*(wide? .85:1), ssize = 36*u;
    const tw = pos === 'tl' ? w*0.74 : w - m*2;
    const tx = pos === 'tl' ? m : m;
    const align = pos === 'tl' ? 'left' : 'center';
    const hLines = Math.max(1, Math.ceil(hl.length / 20));
    let y = pos === 'mid' ? h*0.36 : h*0.055;
    const col = onPhoto ? '#ffffff' : DEEP;
    els.push(text('headline', hl, { x:tx, y, w:tw, size:hsize, weight:400, align, lh:1.22, color:col, shadow:onPhoto }));
    if (sb) els.push(text('sub', sb, { x:tx, y:y + hsize*1.26*hLines, w:tw, size:ssize, weight:500, align, lh:1.35, font:'sans', color:onPhoto ? '#ffffff' : '#6d7f88', shadow:onPhoto }));
    footer();
  }

  // a framed photo the user placed (or the generator added) sits under the text
  const ph = byId('photo'); if (ph) els.unshift(ph);
  const note = els.find(e => e.type === 'note');
  if (note) { // keep the note behind its own text
    const i = els.indexOf(note); els.splice(i, 1); els.unshift(note);
    const p = els.indexOf(byId('photo')); if (p > -1) { const x = els.splice(p,1)[0]; els.unshift(x); }
  }
  S.els = els;
  S.sel = null;
  applyLook(false);
}
function templateDefaults(){
  S.bg.fadePos = 'none'; S.bg.fade = 0.45; S.bg.fadeSize = 0.5;
  S.bg.dim = S.bg.kind === 'photo' ? 0.2 : 0;
  if (S.template === 'quote') {
    // cork board, no wave — and remember what the wave was so leaving a quote restores it
    S.bg.ground = 'cork'; if (S.waveWas == null) S.waveWas = S.wave || 'bottom'; S.wave = 'none';
  } else {
    if (S.bg.ground === 'cork') S.bg.ground = 'paper';
    if (S.waveWas != null) { S.wave = S.waveWas; S.waveWas = null; }
  }
}
