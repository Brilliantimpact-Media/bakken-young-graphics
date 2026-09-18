// ---------- McMillan backgrounds: generated green art, or a library / uploaded photo ----------
const ART = { texture:'Textured green', gradient:'Green gradient', circuit:'Circuit board', dark:'Deep green' };
const artCache = new Map();
function seeded(seed){ let s = (Math.abs(seed)*9301+49297) % 233280; return () => (s = (s*9301+49297) % 233280) / 233280; }
function makeArt(style, seed, w, h){
  const key = style+'|'+seed+'|'+w+'x'+h; if (artCache.has(key)) return artCache.get(key);
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); const rnd = seeded(seed);
  if (style === 'gradient' || style === 'texture') {
    const cx = w*(0.3+rnd()*0.4), cy = h*(0.25+rnd()*0.35);
    const rg = g.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*0.95);
    rg.addColorStop(0,'#0e8a50'); rg.addColorStop(0.5,'#046b3f'); rg.addColorStop(1,'#03331e');
    g.fillStyle = rg; g.fillRect(0,0,w,h);
    // diagonal light streak, like the "INTEGRITY / QUALITY" posts
    g.save(); g.globalAlpha = 0.14 + rnd()*0.08; g.translate(w/2,h/2); g.rotate(-0.55 - rnd()*0.3);
    const lg = g.createLinearGradient(0,-h*0.3,0,h*0.3); lg.addColorStop(0,'rgba(255,255,255,0)'); lg.addColorStop(0.5,'rgba(255,255,255,1)'); lg.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle = lg; g.fillRect(-w,-h*0.25,w*2,h*0.5); g.restore();
  } else if (style === 'dark') {
    const lg = g.createLinearGradient(0,0,w,h); lg.addColorStop(0,'#075a34'); lg.addColorStop(1,'#021a10'); g.fillStyle = lg; g.fillRect(0,0,w,h);
  } else {
    const lg = g.createLinearGradient(0,0,0,h); lg.addColorStop(0,'#0b5a35'); lg.addColorStop(0.5,'#06301c'); lg.addColorStop(1,'#031a0f'); g.fillStyle = lg; g.fillRect(0,0,w,h);
  }
  if (style === 'texture') {
    const n = Math.round(w*h/160);
    for (let i=0;i<n;i++){ const x = rnd()*w, y = rnd()*h, r = rnd()*1.8+0.4, a = rnd()*0.22; g.fillStyle = rnd()<0.55 ? `rgba(0,0,0,${a})` : `rgba(190,235,205,${a*0.6})`; g.fillRect(x,y,r,r); }
    for (let i=0;i<50;i++){ const x = rnd()*w, y = rnd()*h, r = (0.04+rnd()*0.22)*w; const rg = g.createRadialGradient(x,y,0,x,y,r); const dark = rnd()<0.6; rg.addColorStop(0, dark?'rgba(0,20,10,0.28)':'rgba(120,220,160,0.10)'); rg.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(x-r,y-r,r*2,r*2); }
  }
  if (style === 'circuit') {
    const unit = Math.round(w/26);
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (let i=0;i<80;i++){
      let x = Math.round(rnd()*w/unit)*unit, y = Math.round(rnd()*h/unit)*unit; const len = 3+Math.floor(rnd()*7);
      const bright = rnd() < 0.25;
      g.strokeStyle = bright ? 'rgba(0,214,107,0.55)' : 'rgba(0,214,107,0.15)'; g.lineWidth = bright ? unit*0.09 : unit*0.06;
      g.shadowColor = bright ? 'rgba(0,214,107,0.6)' : 'transparent'; g.shadowBlur = bright ? unit*0.4 : 0;
      g.beginPath(); g.moveTo(x,y);
      let dir = Math.floor(rnd()*4);
      for (let k=0;k<len;k++){ if (rnd()<0.35) dir = (dir + (rnd()<0.5?1:3)) % 4; const d = unit*(1+Math.floor(rnd()*3)); x += dir===0?d:dir===2?-d:0; y += dir===1?d:dir===3?-d:0; g.lineTo(x,y); }
      g.stroke();
      g.shadowBlur = 0; g.fillStyle = bright ? 'rgba(0,214,107,0.85)' : 'rgba(0,214,107,0.35)'; g.beginPath(); g.arc(x,y,unit*0.13,0,Math.PI*2); g.fill();
    }
    for (let i=0;i<70;i++){ const x = rnd()*w, y = rnd()*h, r = (0.008+rnd()*0.03)*w; const rg = g.createRadialGradient(x,y,0,x,y,r); const a = 0.08+rnd()*0.3; rg.addColorStop(0,`rgba(140,255,190,${a})`); rg.addColorStop(1,'rgba(140,255,190,0)'); g.fillStyle = rg; g.fillRect(x-r,y-r,r*2,r*2); }
  }
  const vg = g.createRadialGradient(w/2,h/2,Math.min(w,h)*0.35,w/2,h/2,Math.max(w,h)*0.8); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,0.42)'); g.fillStyle = vg; g.fillRect(0,0,w,h);
  if (artCache.size > 16) artCache.delete(artCache.keys().next().value);
  artCache.set(key, c); return c;
}
function drawPhoto(ctx, w, h, bg){
  if (bg.kind !== 'photo' || !IMG.bg) { ctx.drawImage(makeArt(bg.art || 'gradient', bg.seed || 1, w, h), 0, 0); return; }
  const img = IMG.bg; const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const s = Math.max(w/iw, h/ih) * bg.zoom; const dw = iw*s, dh = ih*s;
  ctx.drawImage(img, (w-dw)/2 + bg.ox, (h-dh)/2 + bg.oy, dw, dh);
}
function hexA(hex, a){ const n = parseInt(hex.slice(1),16); return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`; }
// Frames: the solid green or white band McMillan uses to hold the headline (and sometimes the logo).
const FRAMES = { none:'None', top:'Green top', bottom:'Green bottom', wtop:'White top', wbottom:'White bottom' };
function frameRect(w, h){
  const f = S.frame || 'none'; if (f === 'none') return null;
  const bh = h * (S.bandH || (f.startsWith('w') ? 0.30 : 0.24));
  return { f, white: f.startsWith('w'), x:0, y: (f === 'top' || f === 'wtop') ? 0 : h - bh, w, h: bh, top: f === 'top' || f === 'wtop' };
}
function drawBackground(ctx, w, h){
  drawPhoto(ctx, w, h, S.bg);
  if (S.bg.kind === 'photo') {
    if (S.bg.dim > 0) { ctx.fillStyle = `rgba(0,0,0,${S.bg.dim})`; ctx.fillRect(0,0,w,h); }
    const f = S.bg.fade, p = S.bg.fadePos, col = S.bg.fadeColor || '#000000', size = h * (S.bg.fadeSize ?? 0.55);
    if (f > 0 && p !== 'none') {
      if (p === 'bottom' || p === 'both') { const g = ctx.createLinearGradient(0, h - size, 0, h); g.addColorStop(0, hexA(col, 0)); g.addColorStop(1, hexA(col, f)); ctx.fillStyle = g; ctx.fillRect(0,0,w,h); }
      if (p === 'top' || p === 'both') { const g = ctx.createLinearGradient(0, size, 0, 0); g.addColorStop(0, hexA(col, 0)); g.addColorStop(1, hexA(col, f*0.85)); ctx.fillStyle = g; ctx.fillRect(0,0,w,h); }
    }
  }
  const fr = frameRect(w, h);
  if (fr) { ctx.fillStyle = fr.white ? '#ffffff' : (S.bandColor || '#034226'); ctx.fillRect(fr.x, fr.y, fr.w, fr.h); }
}
// Foreground image (a product cutout from the library) — drawn like a logo, movable and resizable.
function drawImageEl(ctx, el){
  const im = IMG.lib[el.src]; if (!im) return;
  const h = el.w * (im.naturalHeight / im.naturalWidth);
  ctx.save();
  if (el.shadow !== false) { ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = el.w*0.05; ctx.shadowOffsetY = el.w*0.02; }
  ctx.drawImage(im, el.x, el.y, el.w, h);
  ctx.restore();
}
function imageAspect(el){ const im = IMG.lib[el.src]; return im ? im.naturalHeight / im.naturalWidth : 1; }
