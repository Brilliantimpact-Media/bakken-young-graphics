// ---------- Spring Forth backgrounds: crumpled paper, cork board, photos, collages ----------
// Their whole look is a scrapbook: paper ground, a blue wave footer, gold doodles, taped photos
// and sticky notes. All of it is generated here so every graphic gets a fresh variation.
const SKY = '#1cc1e0', DEEP = '#03a2c6', GOLD = '#ffc000', BRONZE = '#bb8a2d';
const GROUNDS = { paper:'Crumpled paper', cork:'Cork board' };
const NOTE_FILLS = [['#dff1ee','Mint'],['#fbf0d7','Cream'],['#ddeef8','Sky'],['#ffffff','White'],['#fce9df','Peach']];
const artCache = new Map();
function seeded(seed){ let s = (Math.abs(seed)*9301+49297) % 233280 || 7; return () => (s = (s*9301+49297) % 233280) / 233280; }

function makeGround(style, seed, w, h){
  const key = style+'|'+seed+'|'+w+'x'+h; if (artCache.has(key)) return artCache.get(key);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); const rnd = seeded(seed);
  if (style === 'cork') {
    g.fillStyle = '#c9a36b'; g.fillRect(0,0,w,h);
    for (let i=0;i<Math.round(w*h/900);i++){
      const x = rnd()*w, y = rnd()*h, r = 2 + rnd()*9, a = 0.05 + rnd()*0.3;
      const dark = rnd() < 0.55;
      g.fillStyle = dark ? `rgba(120,84,44,${a})` : `rgba(235,208,167,${a})`;
      g.beginPath(); g.ellipse(x, y, r, r*(0.4+rnd()*0.7), rnd()*Math.PI, 0, Math.PI*2); g.fill();
    }
    const vg = g.createRadialGradient(w/2,h/2,Math.min(w,h)*0.3,w/2,h/2,Math.max(w,h)*0.75);
    vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(60,35,10,0.28)'); g.fillStyle = vg; g.fillRect(0,0,w,h);
  } else {
    g.fillStyle = '#fbfaf6'; g.fillRect(0,0,w,h);
    // crumple facets: soft light/dark wedges radiating from random creases
    for (let i=0;i<38;i++){
      const x = rnd()*w, y = rnd()*h, r = (0.18+rnd()*0.4)*Math.max(w,h), ang = rnd()*Math.PI*2;
      const lg = g.createLinearGradient(x, y, x+Math.cos(ang)*r, y+Math.sin(ang)*r);
      const dark = rnd() < 0.5, a = 0.05 + rnd()*0.07;
      lg.addColorStop(0, dark ? `rgba(120,115,105,${a})` : `rgba(255,255,255,${a*1.6})`);
      lg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = lg; g.beginPath();
      g.moveTo(x, y);
      for (let k=0;k<4;k++){ const a2 = ang + (k-1.5)*0.5; g.lineTo(x+Math.cos(a2)*r*(0.5+rnd()*0.8), y+Math.sin(a2)*r*(0.5+rnd()*0.8)); }
      g.closePath(); g.fill();
    }
    // crease lines
    g.lineWidth = 1;
    for (let i=0;i<14;i++){
      let x = rnd()*w, y = rnd()*h;
      g.strokeStyle = rnd() < 0.5 ? 'rgba(150,145,135,0.10)' : 'rgba(255,255,255,0.5)';
      g.beginPath(); g.moveTo(x,y);
      for (let k=0;k<3;k++){ x += (rnd()-0.5)*w*0.5; y += (rnd()-0.5)*h*0.4; g.lineTo(x,y); }
      g.stroke();
    }
    // fine grain
    for (let i=0;i<Math.round(w*h/420);i++){
      const a = rnd()*0.05; g.fillStyle = rnd()<0.5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a*2})`;
      g.fillRect(rnd()*w, rnd()*h, 1.4, 1.4);
    }
    const vg = g.createRadialGradient(w/2,h*0.45,Math.min(w,h)*0.4,w/2,h/2,Math.max(w,h)*0.8);
    vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(90,85,75,0.14)'); g.fillStyle = vg; g.fillRect(0,0,w,h);
  }
  if (artCache.size > 12) artCache.delete(artCache.keys().next().value);
  artCache.set(key, c); return c;
}

// ---------- the blue wave band (their signature footer) ----------
function waveBandRect(w, h, where){
  const bh = h * 0.132;
  return where === 'top' ? { x:0, y:0, w, h:bh, top:true } : { x:0, y:h-bh, w, h:bh, top:false };
}
function wavePath(ctx, w, y0, amp, phase, toBottom, h){
  ctx.beginPath();
  ctx.moveTo(0, y0 + Math.sin(phase)*amp);
  const steps = 8;
  for (let i=1;i<=steps;i++){
    const x = w*i/steps, xp = w*(i-1)/steps;
    const yp = y0 + Math.sin(phase + (i-1)*0.9)*amp, yc = y0 + Math.sin(phase + i*0.9)*amp;
    ctx.bezierCurveTo(xp + w/steps*0.5, yp, x - w/steps*0.5, yc, x, yc);
  }
  ctx.lineTo(w, toBottom ? h : 0); ctx.lineTo(0, toBottom ? h : 0); ctx.closePath();
}
function drawWaves(ctx, w, h, where, seed){
  if (!where || where === 'none') return;
  const list = where === 'both' ? ['bottom','top'] : [where];
  for (const pos of list) {
    const top = pos === 'top';
    const band = waveBandRect(w, h, pos);
    const amp = h*0.028, base = top ? band.h : h - band.h;
    ctx.save();
    // pale under-wave, offset, like the layered swoosh in their posts
    ctx.globalAlpha = 0.5; ctx.fillStyle = SKY;
    wavePath(ctx, w, base + (top ? amp*1.2 : -amp*1.2), amp*1.1, seed % 6, !top, h); ctx.fill();
    ctx.globalAlpha = 1;
    const lg = ctx.createLinearGradient(0, top ? 0 : h, 0, top ? band.h : h - band.h);
    lg.addColorStop(0, DEEP); lg.addColorStop(1, SKY);
    ctx.fillStyle = lg;
    wavePath(ctx, w, base, amp, (seed % 5) + 1.4, !top, h); ctx.fill();
    ctx.restore();
  }
}

// ---------- gold doodles ----------
const DOODLES = ['star','sparkle','swirl','arrow','heart','question','bolt','crown','squiggle','dots'];
function wobble(ctx, pts, rnd, amt){
  ctx.beginPath();
  pts.forEach((p, i) => { const x = p[0] + (rnd()-0.5)*amt, y = p[1] + (rnd()-0.5)*amt; i ? ctx.lineTo(x,y) : ctx.moveTo(x,y); });
}
function drawDoodle(ctx, d){
  const rnd = seeded(d.seed || 1), s = d.size, wob = s*0.035;
  ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot || 0);
  ctx.strokeStyle = d.color || GOLD; ctx.fillStyle = d.color || GOLD;
  ctx.lineWidth = Math.max(2, s*0.075); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const t = d.type;
  if (t === 'star') {
    const pts = []; for (let i=0;i<11;i++){ const a = -Math.PI/2 + i*Math.PI/5, r = i%2 ? s*0.42 : s; pts.push([Math.cos(a)*r, Math.sin(a)*r]); }
    wobble(ctx, pts, rnd, wob); d.fill ? ctx.fill() : ctx.stroke();
  } else if (t === 'sparkle') {
    for (const a of [0, Math.PI/2]) { ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0,-s); ctx.quadraticCurveTo(s*0.16,-s*0.16,s,0); ctx.quadraticCurveTo(s*0.16,s*0.16,0,s); ctx.quadraticCurveTo(-s*0.16,s*0.16,-s,0); ctx.quadraticCurveTo(-s*0.16,-s*0.16,0,-s); ctx.fill(); ctx.restore(); }
  } else if (t === 'swirl') {
    ctx.beginPath(); for (let i=0;i<=90;i++){ const a = i*0.12, r = s*0.12 + a*s*0.1; const x = Math.cos(a)*r, y = Math.sin(a)*r; i ? ctx.lineTo(x,y) : ctx.moveTo(x,y); } ctx.stroke();
  } else if (t === 'arrow') {
    ctx.beginPath(); ctx.moveTo(-s, s*0.5); ctx.quadraticCurveTo(-s*0.1, -s*0.9, s*0.85, -s*0.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s*0.85,-s*0.2); ctx.lineTo(s*0.3,-s*0.35); ctx.moveTo(s*0.85,-s*0.2); ctx.lineTo(s*0.62,s*0.3); ctx.stroke();
  } else if (t === 'heart') {
    ctx.beginPath(); ctx.moveTo(0, s*0.85);
    ctx.bezierCurveTo(-s*1.25, -s*0.1, -s*0.55, -s*1.05, 0, -s*0.32);
    ctx.bezierCurveTo(s*0.55, -s*1.05, s*1.25, -s*0.1, 0, s*0.85);
    d.fill ? ctx.fill() : ctx.stroke();
  } else if (t === 'question') {
    ctx.beginPath(); ctx.arc(0, -s*0.35, s*0.5, Math.PI*0.95, Math.PI*0.35); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s*0.32, -s*0.05); ctx.quadraticCurveTo(0, s*0.15, 0, s*0.45); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, s*0.85, s*0.1, 0, Math.PI*2); ctx.fill();
  } else if (t === 'bolt') {
    ctx.beginPath(); ctx.moveTo(s*0.25,-s); ctx.lineTo(-s*0.5,s*0.12); ctx.lineTo(0,s*0.12); ctx.lineTo(-s*0.2,s); ctx.lineTo(s*0.55,-s*0.18); ctx.lineTo(s*0.05,-s*0.18); ctx.closePath(); d.fill !== false ? ctx.fill() : ctx.stroke();
  } else if (t === 'crown') {
    ctx.beginPath(); ctx.moveTo(-s, s*0.5); ctx.lineTo(-s*0.75,-s*0.6); ctx.lineTo(-s*0.3,s*0.02); ctx.lineTo(0,-s*0.8); ctx.lineTo(s*0.3,s*0.02); ctx.lineTo(s*0.75,-s*0.6); ctx.lineTo(s,s*0.5); ctx.closePath(); ctx.stroke();
  } else if (t === 'squiggle') {
    ctx.beginPath(); ctx.moveTo(-s*1.3, 0);
    for (let i=0;i<3;i++){ const x0 = -s*1.3 + i*s*0.87; ctx.quadraticCurveTo(x0+s*0.22, -s*0.42, x0+s*0.43, 0); ctx.quadraticCurveTo(x0+s*0.65, s*0.42, x0+s*0.87, 0); }
    ctx.stroke();
  } else {
    for (let i=0;i<5;i++){ ctx.beginPath(); ctx.arc((i-2)*s*0.45, Math.sin(i)*s*0.2, s*0.11, 0, Math.PI*2); ctx.fill(); }
  }
  ctx.restore();
}
// Doodles are scattered around the edges so they never sit on the headline.
function makeDoodles(seed, w, h, count){
  const rnd = seeded(seed * 31 + 7); const out = [];
  const n = count == null ? 4 + Math.floor(rnd()*4) : count;
  const spots = [[0.12,0.13],[0.87,0.14],[0.09,0.42],[0.92,0.45],[0.16,0.72],[0.85,0.74],[0.5,0.09],[0.28,0.2],[0.72,0.22],[0.35,0.86],[0.66,0.85]];
  const order = spots.slice().sort(() => rnd() - 0.5).slice(0, n);
  for (const [fx, fy] of order) {
    const type = DOODLES[Math.floor(rnd()*DOODLES.length)];
    out.push({ type, x: (fx + (rnd()-0.5)*0.05)*w, y: (fy + (rnd()-0.5)*0.05)*h, size: w*(0.034 + rnd()*0.038),
               rot: (rnd()-0.5)*1.0, color: rnd() < 0.18 ? BRONZE : GOLD, fill: rnd() < 0.35, seed: Math.floor(rnd()*9999) });
  }
  return out;
}

// ---------- photo frames ----------
function drawCover(ctx, img, x, y, cw, ch){
  const iw = img.naturalWidth, ih = img.naturalHeight, s = Math.max(cw/iw, ch/ih), dw = iw*s, dh = ih*s;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, cw, ch); ctx.clip(); ctx.drawImage(img, x + (cw-dw)/2, y + (ch-dh)/2, dw, dh); ctx.restore();
}
function drawTape(ctx, cx, cy, len, rot){
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(242,228,196,0.82)';
  ctx.fillRect(-len/2, -len*0.17, len, len*0.34);
  ctx.strokeStyle = 'rgba(190,170,130,0.45)'; ctx.lineWidth = 1;
  ctx.strokeRect(-len/2, -len*0.17, len, len*0.34);
  ctx.restore();
}
// A photo in a frame: polaroid, taped, or plain white border. Returns nothing; draws in place.
function drawFramedPhoto(ctx, img, x, y, cw, ch, style, rot, seed){
  const rnd = seeded(seed || 3);
  ctx.save();
  ctx.translate(x + cw/2, y + ch/2); ctx.rotate(rot || 0); ctx.translate(-cw/2, -ch/2);
  const pad = style === 'polaroid' ? cw*0.055 : cw*0.028;
  const bottom = style === 'polaroid' ? cw*0.17 : pad;
  ctx.shadowColor = 'rgba(40,35,25,0.3)'; ctx.shadowBlur = cw*0.05; ctx.shadowOffsetY = cw*0.012;
  ctx.fillStyle = '#ffffff'; ctx.fillRect(-pad, -pad, cw + pad*2, ch + pad + bottom);
  ctx.shadowColor = 'transparent';
  drawCover(ctx, img, 0, 0, cw, ch);
  if (style === 'tape') { drawTape(ctx, 0, 0, cw*0.30, -0.6 + rnd()*0.2); drawTape(ctx, cw, ch, cw*0.30, -0.6 + rnd()*0.2); }
  ctx.restore();
}

// ---------- background compositing ----------
function collageCells(grid, w, h){
  const m = w*0.07, g = w*0.035, iw = w - m*2;
  if (grid === '2x2') { const ch = (h*0.62 - g)/2, cw = (iw - g)/2; const top = h*0.13;
    return [[m,top,cw,ch],[m+cw+g,top,cw,ch],[m,top+ch+g,cw,ch],[m+cw+g,top+ch+g,cw,ch]]; }
  if (grid === '2+1') { const cw = (iw - g)/2, ch = h*0.28; const top = h*0.13;
    return [[m,top,cw,ch],[m+cw+g,top,cw,ch],[m,top+ch+g,iw,h*0.30]]; }
  return [[m,h*0.13,iw,h*0.30],[m,h*0.13+h*0.30+g,(iw-g)/2,h*0.28],[m+(iw-g)/2+g,h*0.13+h*0.30+g,(iw-g)/2,h*0.28]];
}
function drawPhoto(ctx, w, h, bg){
  if (bg.kind === 'photo' && IMG.bg) {
    const img = IMG.bg, iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const s = Math.max(w/iw, h/ih) * bg.zoom, dw = iw*s, dh = ih*s;
    ctx.drawImage(img, (w-dw)/2 + bg.ox, (h-dh)/2 + bg.oy, dw, dh);
    return;
  }
  ctx.drawImage(makeGround(bg.ground || 'paper', bg.seed || 1, w, h), 0, 0);
  if (bg.kind === 'collage' && bg.cells && bg.cells.length) {
    const cells = collageCells(bg.grid || '2x2', w, h);
    bg.cells.forEach((c, i) => {
      const im = IMG.lib[c.url], r = cells[i]; if (!r) return;
      if (im) drawFramedPhoto(ctx, im, r[0], r[1], r[2], r[3], c.style || 'tape', c.rot || 0, c.seed);
      else { ctx.fillStyle = '#dfe6e9'; ctx.fillRect(r[0], r[1], r[2], r[3]); }
    });
  }
}
function hexA(hex, a){ const n = parseInt(hex.slice(1),16); return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`; }
function drawBackground(ctx, w, h){
  drawPhoto(ctx, w, h, S.bg);
  if (S.bg.kind === 'photo') {
    if (S.bg.dim > 0) { ctx.fillStyle = `rgba(0,0,0,${S.bg.dim})`; ctx.fillRect(0,0,w,h); }
    const f = S.bg.fade, p = S.bg.fadePos, col = S.bg.fadeColor || '#000000', size = h * (S.bg.fadeSize ?? 0.5);
    if (f > 0 && p !== 'none') {
      if (p === 'bottom' || p === 'both') { const g = ctx.createLinearGradient(0, h - size, 0, h); g.addColorStop(0, hexA(col,0)); g.addColorStop(1, hexA(col,f)); ctx.fillStyle = g; ctx.fillRect(0,0,w,h); }
      if (p === 'top' || p === 'both') { const g = ctx.createLinearGradient(0, size, 0, 0); g.addColorStop(0, hexA(col,0)); g.addColorStop(1, hexA(col,f*0.85)); ctx.fillStyle = g; ctx.fillRect(0,0,w,h); }
    }
  }
  if (S.doodles && S.doodles.length) for (const d of S.doodles) drawDoodle(ctx, d);
  drawWaves(ctx, w, h, S.wave || 'bottom', S.bg.seed || 1);
}

// ---------- note card (their sticky-note format) ----------
function drawNote(ctx, el){
  ctx.save();
  ctx.translate(el.x + el.w/2, el.y + el.h/2); ctx.rotate(el.rot || 0); ctx.translate(-el.w/2, -el.h/2);
  ctx.shadowColor = 'rgba(40,35,25,0.28)'; ctx.shadowBlur = el.w*0.06; ctx.shadowOffsetY = el.w*0.015;
  ctx.fillStyle = el.fill || '#dff1ee';
  const r = el.w*0.02;
  ctx.beginPath(); ctx.roundRect(0, 0, el.w, el.h, r); ctx.fill();
  ctx.shadowColor = 'transparent';
  if (el.lines) { // notebook rules, for the quote format
    ctx.strokeStyle = 'rgba(120,150,170,0.35)'; ctx.lineWidth = Math.max(1, el.w*0.004);
    for (let y = el.h*0.22; y < el.h*0.92; y += el.h*0.105) { ctx.beginPath(); ctx.moveTo(el.w*0.08, y); ctx.lineTo(el.w*0.92, y); ctx.stroke(); }
  }
  if (el.tape !== false) drawTape(ctx, el.w/2, 0, el.w*0.30, (el.rot || 0) * -0.6 + 0.04);
  if (el.pin) { // pushpin, for the cork-board quotes
    const px = el.w/2, py = el.h*0.045, pr = el.w*0.035;
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(px+pr*0.3, py+pr*0.5, pr*0.9, pr*0.5, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = el.pin; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(px - pr*0.3, py - pr*0.3, pr*0.35, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();
}
// Foreground image element (a single framed photo the user placed)
function drawImageEl(ctx, el){
  const im = IMG.lib[el.src]; if (!im) return;
  drawFramedPhoto(ctx, im, el.x, el.y, el.w, el.w * (im.naturalHeight / im.naturalWidth), el.style || 'tape', el.rot || 0, el.seed);
}
function imageAspect(el){ const im = IMG.lib[el.src]; return im ? im.naturalHeight / im.naturalWidth : 0.75; }
