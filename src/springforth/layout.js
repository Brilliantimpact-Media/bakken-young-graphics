// The wave frame carries the site lockup itself — it is part of the exported artwork, so
// nothing here draws it. Every layout just has to keep its content clear of the frame:
// `waveCeiling` is how far the top wave hangs, `waveFloor` how high the bottom wave rises.

function layout(){
  const w = W(), h = H(), u = U();
  const els = [];
  const m = 0.075*w;
  const pos = S.textPos || 'tc';
  const onPhoto = S.bg.kind === 'photo';
  const handSize = 78*u;
  const head = (waveCeiling(0.05, 0.95) + 0.045)*h;       // first line of type clears the top wave
  const stickers = (S.els || []).filter(e => e.type === 'sticker');

  if (S.template === 'note') {
    // One card, sized to its words and optically centred in the space the frame leaves — the
    // master never leaves a paper page with a line of type and a hollow middle.
    const hl = byId('headline')?.text ?? 'Ownership';
    const hLines = hl.split('\n').reduce((n,l) => n + Math.max(1, Math.ceil(l.length/13)), 0);
    const textH = hLines * handSize * 1.22;
    const top = head, floor = (waveFloor(0.1, 0.9) - 0.028)*h;
    const nw = w*0.72;
    const tape = tapeDepth(S.noteFill, nw), pad = nw*0.055;   // writing starts clear of the tape
    const nh = Math.min(floor - top, Math.max(h*0.40, textH + tape + pad*2));
    const nx = (w - nw)/2, ny = top + (floor - top - nh)*0.5;
    els.push({ id:'note', type:'note', x:nx, y:ny, w:nw, h:nh, fill:S.noteFill || '#e5f4ee',
               tapeFill:S.tapeFill || TAPE_FILLS[0], rot:S.noteRot ?? -0.015, tape:true, kids:['headline'] });
    const ty = ny + tape + pad + Math.max(0, (nh - tape - pad*2 - textH)/2);
    els.push(text('headline', hl, { x:nx + nw*0.08, y:ty, w:nw*0.84, size:handSize,
      align:'center', lh:1.22, color:DARK_CARDS.includes(S.noteFill) ? '#ffffff' : DEEP, shadow:false }));
  }
  else if (S.template === 'list') {
    // their "Three questions …" / "Instead of … try:" format: a blue headline, then three
    // cards carrying a gold numeral, filling the page down to the wave.
    const hl = byId('headline')?.text ?? 'Three questions we encourage parents to ask';
    const hs = 66*u;
    const hLines = Math.max(1, Math.ceil(hl.length/24));
    els.push(text('headline', hl, { x:m, y:head, w:w-m*2, size:hs, align:'center', lh:1.18, color:DEEP, shadow:false }));
    const top = head + hLines*hs*1.18 + h*0.055;
    const floor = (waveFloor(0.06, 0.94) - 0.028)*h;
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
        align:'center', lh:1.30, font:'sans', color:DARK_CARDS.includes(NOTE_FILLS[i%NOTE_FILLS.length][0]) ? '#ffffff' : '#2f3a40', shadow:false }));
    }
  }
  else if (S.template === 'quote') {
    const q = byId('quote')?.text ?? '“It’s very hands on, student driven… I love that we allow them to fail early and cheaply.”';
    const a = byId('attr')?.text ?? '— a Spring Forth parent';
    // the card is cut to the length of the quote, with a couple of spare rules under it —
    // the master never pins up a notepad that trails off empty
    const floor = (waveFloor(0.06, 0.94) - 0.030)*h;
    const top = Math.max(h*0.105, head), nw = w*0.74, nx = (w - nw)/2, qs = 46*u;
    const probe = text('quote', q, { x:nx+nw*0.10, y:0, w:nw*0.80, size:qs, align:'left', lh:1.30, font:'sans', color:DEEP, shadow:false });
    const qh = bbox(ctx, probe).h;
    const nh = Math.max(h*0.34, Math.min(floor - top, qh + qs*2.9));
    const ny = top + (floor - top - nh)*0.46;          // pinned in the middle of the board
    els.push({ id:'note', type:'note', x:nx, y:ny, w:nw, h:nh, fill:'#fffdf6', rot:S.noteRot ?? 0.02,
               tape:false, lines:true, pin:'#02d594', kids:['quote','attr'] });
    probe.y = ny + nh*0.17;
    els.push(probe);
    els.push(text('attr', a, { x:nx+nw*0.10, y:ny + nh*0.17 + qh + qs*0.75, w:nw*0.80, size:26*u, align:'right', lh:1.2,
      font:'sans', color:'#6d7f88', shadow:false }));
  }
  else if (S.template === 'collage') {
    const hl = byId('headline')?.text ?? '';
    if (hl) els.push(text('headline', hl, { x:m, y:head, w:w-m*2, size:60*u, align:'center', lh:1.2, color:DEEP, shadow:false }));
  }
  else if (S.template === 'logo') {
    // the frame's own lockup is the whole point of this one — nothing else goes on the page
  }
  else { // 'headline' and 'photo' — a headline always sits with a photo
    const hl = byId('headline')?.text ?? 'Learning By Doing';
    const sb = byId('sub')?.text ?? '';
    const tw = pos === 'tl' ? w*0.76 : w - m*2;
    const align = pos === 'tl' ? 'left' : 'center';
    const hLines = Math.max(1, Math.ceil(hl.length/18));
    const y0 = head;
    const col = onPhoto ? '#ffffff' : DEEP;
    els.push(text('headline', hl, { x:m, y:y0, w:tw, size:handSize, align, lh:1.22, color:col, shadow:onPhoto }));
    if (sb) els.push(text('sub', sb, { x:m, y:y0 + handSize*1.26*hLines, w:tw, size:34*u, align, lh:1.32,
      font:'sans', color:onPhoto ? '#ffffff' : '#6d7f88', shadow:onPhoto }));
  }

  // a framed photo belongs to the headline layout only — it never rides along under a card
  const ph = S.template === 'headline' ? byId('photo') : null; if (ph) els.unshift(ph);
  const notes = els.filter(e => e.type === 'note');           // notes render behind their own text
  for (const n of notes) { const i = els.indexOf(n); els.splice(i,1); els.unshift(n); }
  const p = els.findIndex(e => e.id === 'photo'); if (p > 0) els.unshift(els.splice(p,1)[0]);
  els.push(...stickers);                                      // stickers are placed by hand, and stay put
  S.els = els;
  S.sel = null;
  applyLook(false);
}

function templateDefaults(){
  S.bg.dim = S.bg.kind === 'photo' ? 0.18 : 0;
  if (S.template === 'quote') {
    S.bg.ground = 'cork';
  } else {
    if (S.bg.ground === 'cork') S.bg.ground = 'paper';
    if (S.waveWas != null) { S.wave = S.waveWas; S.waveWas = null; }
  }
}
