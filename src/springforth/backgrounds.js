// ---------- Spring Forth art layer ----------
// Everything here comes from the 2026 Canva master: the real crumpled-paper and cork
// photographs and the wave footer, all lifted from the artwork itself.
const SKY = '#1cc1e0', DEEP = '#03a2c6', GOLD = '#ffc000', BRONZE = '#bb8a2d';
const GROUNDS = { paper:'Crumpled paper', cork:'Cork board' };
const NOTE_FILLS = [['#e5f4ee','Mint'],['#fbf0d7','Cream'],['#fae2e0','Peach'],['#ddeef8','Sky'],['#ffffff','White']];
const TAPE_FILLS = ['#f8c97a','#bfe3f5','#cfe8cf','#f3e3c4'];
IMG.tex = {}; let WAVE = null;

function loadArt(){
  const one = (src) => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  return Promise.all([
    one('art/paper.jpg').then(i => IMG.tex.paper = i),
    one('art/cork.jpg').then(i => IMG.tex.cork = i),
    Promise.all([one('art/wave-bottom.png'), fetch('art/wave-bottom.json').then(r => r.json())])
      .then(([im, j]) => { WAVE = im ? Object.assign({ img:im }, j) : null; }).catch(() => WAVE = null),
  ]);
}
function drawGround(ctx, w, h, style){
  const im = IMG.tex[style === 'cork' ? 'cork' : 'paper'];
  if (!im) { ctx.fillStyle = style === 'cork' ? '#c9a36b' : '#f7f6f3'; ctx.fillRect(0,0,w,h); return; }
  const s = Math.max(w/im.naturalWidth, h/im.naturalHeight);
  const dw = im.naturalWidth*s, dh = im.naturalHeight*s;
  ctx.drawImage(im, (w-dw)/2, (h-dh)/2, dw, dh);
}

// ---------- the wave footer, traced from the real artwork ----------
// wave.json holds, per column of the 1080px master, the top of the blue band and the top
// of the white crest above it. Both are replayed scaled to whatever canvas we are on.
// The footer wave is the real element, cut straight out of the master as a transparent PNG:
// the #03a2c6 band with its wave edge, the #1cc1e0 crescent that rides above it on the left,
// and the gold hairline along the very bottom. It is drawn full width, never redrawn by hand.
function drawWaves(ctx, w, h, where){
  if (!where || where === 'none') return;
  for (const pos of (where === 'both' ? ['bottom','top'] : [where])) {
    if (!WAVE || !WAVE.img) { ctx.fillStyle = DEEP; ctx.fillRect(0, pos === 'top' ? 0 : h*0.847, w, h*0.153); continue; }
    const bh = WAVE.h*h;
    if (pos === 'top') { ctx.save(); ctx.translate(0, bh); ctx.scale(1, -1); ctx.drawImage(WAVE.img, 0, 0, w, bh); ctx.restore(); }
    else ctx.drawImage(WAVE.img, 0, WAVE.top*h, w, bh);
  }
}
// How far down the page the band's top edge sits at a given fraction across the width \u2014
// used to park the site lockup where the band is actually deep enough to hold it.
function bandTopAt(fx){
  const a = WAVE && WAVE.bandTopByCol;
  if (!a) return 0.86;
  return a[Math.max(0, Math.min(a.length-1, Math.round(fx*(a.length-1))))];
}
// The band's lowest top edge over a span — where the band is deep enough to park the lockup.
function bandTopOver(x0, x1){
  let m = 0;
  for (let f = Math.max(0,x0); f <= Math.min(1,x1); f += 0.004) m = Math.max(m, bandTopAt(f));
  return m;
}
// The band's highest top edge over a span — the line content has to stay above to clear it.
function bandCrestOver(x0, x1){
  let m = 1;
  for (let f = Math.max(0,x0); f <= Math.min(1,x1); f += 0.004) m = Math.min(m, bandTopAt(f));
  return m;
}


// ---------- notes, tape, framed photos ----------
function drawTape(ctx, cx, cy, len, rot, fill){
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot||0);
  ctx.fillStyle = fill || TAPE_FILLS[0];
  ctx.globalAlpha = 0.92; ctx.fillRect(-len/2, -len*0.155, len, len*0.31);
  ctx.restore();
}
function drawNote(ctx, el){
  ctx.save();
  ctx.translate(el.x + el.w/2, el.y + el.h/2); ctx.rotate(el.rot || 0); ctx.translate(-el.w/2, -el.h/2);
  ctx.shadowColor = 'rgba(40,40,40,0.26)'; ctx.shadowBlur = el.w*0.055; ctx.shadowOffsetY = el.w*0.014;
  ctx.fillStyle = el.fill || '#e5f4ee';
  ctx.beginPath(); ctx.roundRect(0, 0, el.w, el.h, el.w*0.018); ctx.fill();
  ctx.shadowColor = 'transparent';
  if (el.lines) {
    ctx.strokeStyle = 'rgba(110,145,168,0.32)'; ctx.lineWidth = Math.max(1, el.w*0.004);
    for (let y = el.h*0.20; y < el.h*0.93; y += el.h*0.098) { ctx.beginPath(); ctx.moveTo(el.w*0.07, y); ctx.lineTo(el.w*0.93, y); ctx.stroke(); }
  }
  if (el.tape !== false) drawTape(ctx, el.w/2, 0, el.w*0.30, -(el.rot||0)*0.7, el.tapeFill);
  if (el.pin) {
    const px = el.w/2, py = el.h*0.045, pr = el.w*0.032;
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(px+pr*0.35, py+pr*0.5, pr*0.95, pr*0.5, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = el.pin; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(px-pr*0.3, py-pr*0.3, pr*0.33, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();
}
function drawCover(ctx, img, x, y, cw, ch){
  const iw = img.naturalWidth, ih = img.naturalHeight, s = Math.max(cw/iw, ch/ih), dw = iw*s, dh = ih*s;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, cw, ch); ctx.clip(); ctx.drawImage(img, x + (cw-dw)/2, y + (ch-dh)/2, dw, dh); ctx.restore();
}
function drawFramedPhoto(ctx, img, x, y, cw, ch, style, rot, seed){
  let s = (Math.abs(seed||3)*9301+49297) % 233280 || 5; const rnd = () => (s = (s*9301+49297) % 233280) / 233280;
  ctx.save();
  ctx.translate(x + cw/2, y + ch/2); ctx.rotate(rot || 0); ctx.translate(-cw/2, -ch/2);
  const pad = style === 'polaroid' ? cw*0.05 : cw*0.026;
  const bottom = style === 'polaroid' ? cw*0.16 : pad;
  ctx.shadowColor = 'rgba(40,40,40,0.30)'; ctx.shadowBlur = cw*0.045; ctx.shadowOffsetY = cw*0.011;
  ctx.fillStyle = '#ffffff'; ctx.fillRect(-pad, -pad, cw + pad*2, ch + pad + bottom);
  ctx.shadowColor = 'transparent';
  drawCover(ctx, img, 0, 0, cw, ch);
  if (style === 'tape') {
    drawTape(ctx, 0, 0, cw*0.28, -0.62 + rnd()*0.16, TAPE_FILLS[3]);
    drawTape(ctx, cw, ch, cw*0.28, -0.62 + rnd()*0.16, TAPE_FILLS[3]);
  }
  ctx.restore();
}
function drawImageEl(ctx, el){
  const im = IMG.lib[el.src]; if (!im) return;
  drawFramedPhoto(ctx, im, el.x, el.y, el.w, el.w * (im.naturalHeight/im.naturalWidth), el.style || 'tape', el.rot || 0, el.seed);
}
function imageAspect(el){ const im = IMG.lib[el.src]; return im ? im.naturalHeight/im.naturalWidth : 0.75; }

// ---------- collage + background compositing ----------
function collageCells(grid, w, h){
  const m = w*0.07, g = w*0.035, iw = w - m*2, top = h*0.13;
  if (grid === '2x2') { const ch = (h*0.60 - g)/2, cw = (iw - g)/2;
    return [[m,top,cw,ch],[m+cw+g,top,cw,ch],[m,top+ch+g,cw,ch],[m+cw+g,top+ch+g,cw,ch]]; }
  if (grid === '2+1') { const cw = (iw - g)/2, ch = h*0.27;
    return [[m,top,cw,ch],[m+cw+g,top,cw,ch],[m,top+ch+g,iw,h*0.29]]; }
  return [[m,top,iw,h*0.29],[m,top+h*0.29+g,(iw-g)/2,h*0.27],[m+(iw-g)/2+g,top+h*0.29+g,(iw-g)/2,h*0.27]];
}
function hexA(hex, a){ const n = parseInt(hex.slice(1),16); return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`; }
function drawPhoto(ctx, w, h, bg){
  if (bg.kind === 'photo' && IMG.bg) {
    const img = IMG.bg, iw = img.naturalWidth, ih = img.naturalHeight;
    const s = Math.max(w/iw, h/ih) * bg.zoom, dw = iw*s, dh = ih*s;
    ctx.drawImage(img, (w-dw)/2 + bg.ox, (h-dh)/2 + bg.oy, dw, dh);
    return;
  }
  drawGround(ctx, w, h, bg.ground || 'paper');
  if (bg.kind === 'collage' && bg.cells && bg.cells.length) {
    const cells = collageCells(bg.grid || '2x2', w, h);
    bg.cells.forEach((c, i) => {
      const im = IMG.lib[c.url], r = cells[i]; if (!r) return;
      if (im) drawFramedPhoto(ctx, im, r[0], r[1], r[2], r[3], c.style || 'tape', c.rot || 0, c.seed);
    });
  }
}
function drawBackground(ctx, w, h){
  drawPhoto(ctx, w, h, S.bg);
  if (S.bg.kind === 'photo' && S.bg.dim > 0) { ctx.fillStyle = `rgba(0,0,0,${S.bg.dim})`; ctx.fillRect(0,0,w,h); }
  drawWaves(ctx, w, h, S.wave || 'bottom');
}
