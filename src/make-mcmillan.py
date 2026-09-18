#!/usr/bin/env python3
"""Derive McMillan's studio template from the Bakken-Young engine.

Everything client-specific (fonts, colors, layout rules, photo pools, phrase bank,
photo block list, storage keys) is swapped here; the engine itself is untouched.
Run:  python3 src/make-mcmillan.py   → writes src/template-mcmillan.html
"""
import pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
s = (ROOT / 'src/template-bakken-young.html').read_text()

def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ('anchor', s.count(a), a[:90])
    s = s.replace(a, b)

def rep_between(start, end, new):
    global s
    i = s.index(start); j = s.index(end, i); s = s[:i] + new + s[j:]

# ---------------- identity / fonts / theme ----------------
rep("<title>Bakken-Young Graphics</title>", "<title>McMillan Graphics</title>")
rep('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Nunito+Sans:wght@400;600;700&display=swap">',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;1,500;1,600&family=Nunito+Sans:wght@400;600;700&display=swap">')
s = s.replace('"Cormorant Garamond",Georgia,serif', '"Cinzel","Montserrat",Georgia,serif')
s = s.replace('font:italic 700 15px "Cormorant Garamond",serif', 'font:700 13px "Cinzel",serif')
s = s.replace('font:600 24px/1.1 "Cormorant Garamond",serif', 'font:700 22px/1.1 "Cinzel",serif')
rep("const SERIF = '\"Cormorant Garamond\", Georgia, \"Times New Roman\", serif';",
    "const SERIF = '\"Cinzel\", \"Montserrat\", Georgia, serif';\nconst SANS = '\"Montserrat\", \"Nunito Sans\", Arial, sans-serif';")
rep('<select id="profileSel" class="profile" aria-label="Client"><option value="bakken-young">Bakken-Young</option></select>\n    <span>Social graphics</span>',
    '<select id="profileSel" class="profile" aria-label="Client"><option value="mcmillan">McMillan</option></select>\n    <span>Precision Electric Motors</span>')
s = s.replace("--accent:#19441f; --accent-ink:#ffffff; --accent-soft:#e3ece3;", "--accent:#006c40; --accent-ink:#ffffff; --accent-soft:#e1f1e8;")
s = s.replace("--focus:#19441f;", "--focus:#006c40;")
s = s.replace("--accent:#7fb58d; --accent-ink:#0f1a13; --accent-soft:#25352a;", "--accent:#00d66b; --accent-ink:#04261a; --accent-soft:#123d2b;")
s = s.replace("--focus:#7fb58d;", "--focus:#00d66b;")
s = s.replace("background:rgba(25,68,31,.75)", "background:rgba(0,108,64,.8)")
s = s.replace("background:linear-gradient(135deg,#19441f,#2f6b3a);color:#fff;border-color:#19441f", "background:linear-gradient(135deg,#006c40,#00a85a);color:#fff;border-color:#006c40")
s = s.replace("ctx.strokeStyle = '#19441f'; ctx.lineWidth = 1.5*k;", "ctx.strokeStyle = '#006c40'; ctx.lineWidth = 1.5*k;")
s = s.replace('fill="#592231" opacity=".85"/><rect x="14" y="4" width="16" height="4" rx="1" fill="#f0ad54"/>', 'fill="#034226" opacity=".9"/><rect x="14" y="4" width="16" height="4" rx="1" fill="#00d66b"/>')
s = s.replace('fill="#6b8f78"', 'fill="#586e63"')

# ---------------- text: per-element font + tracking ----------------
rep("function fontStr(el, size){ return `${el.italic?'italic ':''}${el.weight} ${size||el.size}px ${SERIF}`; }",
    "function fontStr(el, size){ return `${el.italic?'italic ':''}${el.weight} ${size||el.size}px ${el.font === 'sans' ? SANS : SERIF}`; }")
rep("  return Object.assign({ id, type:'text', text:str, x:0, y:0, w:800, size:60, italic:false, weight:600, color:'#ffffff', align:'center', lh:1.12, shadow:true, upper:false, ls:0, shade:NO_SHADE() }, o);",
    "  return Object.assign({ id, type:'text', text:str, x:0, y:0, w:800, size:60, italic:false, weight:700, color:'#ffffff', align:'center', lh:1.12, shadow:true, upper:false, ls:0, font:'serif', shade:NO_SHADE() }, o);")
rep("function wrapLines(ctx, el){\n  ctx.font = fontStr(el);\n  if ('letterSpacing' in ctx) ctx.letterSpacing = (el.ls||0)+'px';",
    "function wrapLines(ctx, el){\n  ctx.font = fontStr(el);\n  if ('letterSpacing' in ctx) ctx.letterSpacing = ((el.ls||0)*el.size)+'px';")
rep("  ctx.font = fontStr(el);\n  if ('letterSpacing' in ctx) ctx.letterSpacing = (el.ls||0)+'px';\n  ctx.fillStyle = el.color; ctx.textBaseline = 'alphabetic'; ctx.textAlign = el.align;",
    "  ctx.font = fontStr(el);\n  if ('letterSpacing' in ctx) ctx.letterSpacing = ((el.ls||0)*el.size)+'px';\n  ctx.fillStyle = el.color; ctx.textBaseline = 'alphabetic'; ctx.textAlign = el.align;")

# ---------------- colors / storage / logo + mark ----------------
rep("""const COLORS = [
  ['#ffffff','White'],['#19441f','Bakken green'],['#719587','Sage'],['#f0ad54','Gold'],['#592231','Plum'],['#1f1f1f','Charcoal'],['#f3e9d2','Cream']
];
const SHADE_COLORS = [['#000000','Black'],['#19441f','Bakken green'],['#592231','Plum'],['#719587','Sage'],['#f0ad54','Gold'],['#ffffff','White']];
const LS = { prefs:'by-prefs-v4', drafts:'by-drafts-v1', photos:'by-photos-v1' };""",
"""const COLORS = [
  ['#ffffff','White'],['#00d66b','Bright green'],['#006c40','McMillan green'],['#034226','Deep green'],['#586e63','Slate'],['#1f1f1f','Charcoal'],['#e9eeeb','Light gray']
];
const SHADE_COLORS = [['#000000','Black'],['#034226','Deep green'],['#006c40','McMillan green'],['#586e63','Slate'],['#ffffff','White']];
const LS = { prefs:'mcm-prefs-v1', drafts:'mcm-drafts-v1', photos:'mcm-photos-v1' };""")
rep("const LOGO_SRC = 'data:image/png;base64,__LOGO_B64__';", "const LOGO_SRC = 'data:image/png;base64,__LOGO_B64__';\nconst MARK_SRC = 'data:image/png;base64,__MARK_B64__';")
rep("const DEFAULT_QUERY = { logo:'sunlight through leaves', headline:'hands holding comfort', event:'person writing notebook', review:'forest canopy looking up' };",
    "const DEFAULT_QUERY = { logo:'industrial electric motor', headline:'engineer inspecting machine', event:'manufacturing plant floor', review:'industrial workshop dark' };")
rep("""const LOOKS = {
  classic: { label:'White on photo', accent:'#ffffff', text:'#ffffff', shadow:true,  dim:null, fade:null,   shade:{style:'none',color:'#000000',alpha:0.35}, swatch:['#3b4a3e','#fff'] },
  green:   { label:'Green on light', accent:'#19441f', text:'#19441f', shadow:false, dim:0,    fade:'none', shade:{style:'none',color:'#000000',alpha:0.3}, dark:true, swatch:['#e8e4d6','#19441f'] },
  gold:    { label:'Gold accent',    accent:'#f0ad54', text:'#ffffff', shadow:true,  dim:null, fade:null,   shade:{style:'none',color:'#000000',alpha:0.35}, swatch:['#3b4a3e','#f0ad54'] },
};""",
"""const LOOKS = {
  classic: { label:'White on photo',   accent:'#ffffff', text:'#ffffff', shadow:true,  dim:null, fade:null,   shade:{style:'none',color:'#000000',alpha:0.35}, swatch:['#2b3a33','#fff'] },
  bright:  { label:'Bright green',     accent:'#00d66b', text:'#ffffff', shadow:true,  dim:null, fade:null,   shade:{style:'none',color:'#000000',alpha:0.35}, swatch:['#2b3a33','#00d66b'] },
  panel:   { label:'Green panel',      accent:'#ffffff', text:'#ffffff', shadow:false, dim:0.15, fade:null,   shade:{style:'box',color:'#034226',alpha:0.85}, swatch:['#034226','#fff'], panel:true },
  green:   { label:'Green on light',   accent:'#034226', text:'#006c40', shadow:false, dim:0,    fade:'none', shade:{style:'none',color:'#000000',alpha:0.3}, dark:true, swatch:['#e9eeeb','#034226'] },
};""")
rep("function logoAspect(){ return IMG.logo ? IMG.logo.naturalHeight / IMG.logo.naturalWidth : 0.286; }",
    "function logoAspect(el){ const v = (el && el.variant) || 'full'; const im = v === 'mark' ? IMG.mark : IMG.logo; return im ? im.naturalHeight / im.naturalWidth : (v === 'mark' ? 0.58 : 0.21); }")
rep("if (el.type === 'logo') return { x:el.x, y:el.y, w:el.w, h:el.w*logoAspect() };", "if (el.type === 'logo') return { x:el.x, y:el.y, w:el.w, h:el.w*logoAspect(el) };")
rep("function drawLogo(ctx, el){\n  const h = el.w * logoAspect();", "function drawLogo(ctx, el){\n  const h = el.w * logoAspect(el);")
rep("  if (IMG.logo) ctx.drawImage(IMG.logo, el.x, el.y, el.w, h);", "  const im = el.variant === 'mark' ? IMG.mark : IMG.logo;\n  if (im) ctx.drawImage(im, el.x, el.y, el.w, h);")
rep("function logoEl(o){ const L = LOOKS[S.look]; return Object.assign({ id:'logo', type:'logo', shadow:true, shade:{style:L.shade.style, color:L.shade.color, alpha:L.shade.alpha, size:0.5} }, o); }",
    "function logoEl(o){ return Object.assign({ id:'logo', type:'logo', variant:'full', shadow:true, shade:{style:'none', color:'#000000', alpha:0.35, size:0.5} }, o); }")

# ---------------- layout (starting rules; calibrate against McMillan's past posts) ----------------
rep_between("function layout(){", "function templateDefaults(){",
"""function layout(){
  const w = W(), h = H(), u = U();
  const wide = w > h;
  const els = [];
  // Starting rules for McMillan: logo bottom-left, caps headline upper-left, tracked sans subline.
  const logoW = wide ? 0.30*w : 0.40*w;
  const logoH = logoW * 0.21;
  const m = 0.07*w;
  const bottomLogo = () => logoEl({ x:m, y:h - logoH - 0.07*h, w:logoW });
  const pos = S.textPos || 'tl';

  if (S.template === 'logo') {
    els.push(bottomLogo());
  }
  else if (S.template === 'headline' || S.template === 'event') {
    const isEvent = S.template === 'event';
    const hl = byId('headline')?.text ?? (isEvent ? 'Open House' : 'Built to Last');
    const sb = byId('sub')?.text ?? (isEvent ? 'Thursday, May 14\\n10 AM \\u2013 2 PM' : 'precision motors, repaired and rebuilt');
    const hsize = (isEvent ? 62 : 66)*u*(wide? .9:1), ssize = (isEvent ? 34 : 30)*u*(wide? .9:1);
    const corner = pos === 'tl' || pos === 'tr';
    const tw = corner ? 0.62*w : 0.84*w;
    const tx = pos === 'tl' ? m : pos === 'tr' ? w - m - tw : (w - tw)/2;
    const align = pos === 'tl' ? 'left' : pos === 'tr' ? 'right' : 'center';
    const sLines = Math.max(1, sb.split('\\n').length);
    const block = hsize*1.15 + ssize*1.3*sLines;
    let y = pos === 'mid' ? (h - block)/2 - 0.04*h : 0.09*h;
    els.push(text('headline', hl, { x:tx, y, w:tw, size:hsize, weight:700, align, lh:1.08, upper:true, ls:0.02 }));
    y += hsize*1.2 + 0.01*h;
    els.push(text('sub', sb, { x:tx, y, w:tw, size:ssize, weight:600, align, lh:1.35, font:'sans', upper:true, ls:0.12 }));
    els.push(bottomLogo());
  }
  else if (S.template === 'review') {
    const q = byId('quote')?.text ?? '\\u201CMcMillan rebuilt our 200 HP motor in four days and it has run flawlessly since. Their team knows what downtime costs and they treat it that way.\\u201D';
    const a = byId('attr')?.text ?? '\\u2014 Plant Manager, Midwest Foods';
    const bx = 0.07*w, bw = 0.86*w, by = wide ? 0.10*h : 0.08*h, bh = wide ? 0.66*h : 0.58*h;
    els.push({ id:'box', type:'box', x:bx, y:by, w:bw, h:bh, fill:'#034226', alpha:0.88, label:'CUSTOMER REVIEW', labelFill:'#00d66b', labelColor:'#034226', kids:['quote','attr'] });
    const pad = 0.05*w;
    els.push(text('quote', q, { x:bx+pad, y:by + (wide? 0.13*h : 0.09*h), w:bw-pad*2, size:40*u*(wide? .8:1), weight:500, align:'left', italic:false, shadow:false, lh:1.3, font:'sans' }));
    els.push(text('attr', a, { x:bx+pad, y:by+bh - (wide? 0.14*h : 0.09*h), w:bw-pad*2, size:26*u*(wide? .8:1), weight:600, align:'right', italic:false, shadow:false, font:'sans', upper:true, ls:0.08, color:'#00d66b' }));
    els.push(bottomLogo());
  }
  S.els = els;
  S.sel = null;
  applyLook(false);
}
""")
rep("""function templateDefaults(){
  // Uniform darkening is the house look; edge fades stay available as an option.
  S.bg.fadePos = 'none'; S.bg.fade = 0.45;
  S.bg.dim = S.template === 'review' ? 0.3 : S.template === 'logo' ? 0.25 : 0.35;""",
"""function templateDefaults(){
  // Industrial photos tend to be dark already: moderate tint plus a bottom fade behind the logo.
  S.bg.fadePos = S.template === 'review' ? 'none' : 'bottom'; S.bg.fade = 0.5; S.bg.fadeSize = 0.5;
  S.bg.dim = S.template === 'review' ? 0.35 : S.template === 'logo' ? 0.2 : 0.4;""")
rep("""    if (el.type === 'text') {
      const inBox = el.id === 'quote' || el.id === 'attr';
      el.color = inBox ? '#ffffff' : (el.id === 'headline' ? L.accent : L.text);
      el.shadow = inBox ? false : L.shadow;
    } else if (el.type === 'logo') {
      el.shade = Object.assign(el.shade || {size:0.5}, { style:L.shade.style, color:L.shade.color, alpha:L.shade.alpha });
    }""",
"""    if (el.type === 'text') {
      const inBox = el.id === 'quote' || el.id === 'attr';
      if (!inBox) { el.color = el.id === 'headline' ? L.accent : L.text; el.shadow = L.shadow; }
      if (!inBox && (el.id === 'headline' || el.id === 'sub')) el.shade = L.panel ? { style:'box', color:L.shade.color, alpha:L.shade.alpha, size:0.45 } : NO_SHADE();
    }""")
s = s.replace("let S = { template:'headline', size:'square', textPos:'tc', look:'classic',", "let S = { template:'headline', size:'square', textPos:'tl', look:'classic',")
rep("""          <button data-v="tc" aria-pressed="true">Top</button>
          <button data-v="tl" aria-pressed="false">Top left</button>""", """          <button data-v="tl" aria-pressed="true">Top left</button>
          <button data-v="tc" aria-pressed="false">Top</button>""")
rep("    box.append(h('p',{class:'hint',style:'margin-bottom:8px'}, 'Bakken-Young logo'));",
    "    box.append(row('Logo', seg([['full','Full logo'],['mark','M mark']], ()=>el.variant||'full', v=>el.variant=v)));")
rep("    box.append(chk('ALL CAPS', ()=>el.upper, v=>el.upper=v));\n    if (el.align === 'center')",
    "    box.append(chk('ALL CAPS', ()=>el.upper, v=>el.upper=v));\n    box.append(row('Font', seg([['serif','McMillan serif'],['sans','Clean sans']], ()=>el.font||'serif', v=>el.font=v)));\n    box.append(row('Tracking', h('input',{type:'range',min:0,max:30,value:Math.round((el.ls||0)*100),oninput:change(e=>{guard();el.ls=e.target.value/100;})})));\n    if (el.align === 'center')")
rep("rules:!!src.rules, shade:clone(src.shade || NO_SHADE()) });", "rules:!!src.rules, font:src.font, ls:src.ls, shade:clone(src.shade || NO_SHADE()) });")
rep("    else if (el.type === 'logo') Object.assign(el, { shadow:src.shadow, shade:clone(src.shade) });", "    else if (el.type === 'logo') Object.assign(el, { shadow:src.shadow, variant:src.variant, shade:clone(src.shade) });")
rep("  await new Promise(res => { const im = new Image(); im.onload = () => { IMG.logo = im; res(); }; im.onerror = res; im.src = LOGO_SRC; });",
    "  await Promise.all([LOGO_SRC, MARK_SRC].map((srcUrl, i) => new Promise(res => { const im = new Image(); im.onload = () => { if (i) IMG.mark = im; else IMG.logo = im; res(); }; im.onerror = res; im.src = srcUrl; })));")
rep("  return `bakken-young-${slug}-${w}x${hh}.png`;", "  return `mcmillan-${slug}-${w}x${hh}.png`;")
rep("const LEARN_KEY = 'by-learn-v1';", "const LEARN_KEY = 'mcm-learn-v1';")
rep("  try { await Promise.all(['italic 600 40px','600 40px','700 40px','500 40px','400 40px','italic 500 40px','italic 700 40px'].map(f => document.fonts.load(`${f} \"Cormorant Garamond\"`))); } catch {}",
    "  try { await Promise.all([...['600 40px','700 40px','800 40px'].map(f => document.fonts.load(`${f} \"Cinzel\"`)), ...['400 40px','500 40px','600 40px','700 40px','italic 500 40px'].map(f => document.fonts.load(`${f} \"Montserrat\"`))]); } catch {}")

# ---------------- randomizer odds ----------------
rep("if (S.template === 'headline') S.textPos = pick([['tc', 4], ['tl', 3], ['tr', 3], ['mid', 1]], 'textPos');", "if (S.template === 'headline') S.textPos = pick([['tl', 5], ['tc', 2], ['tr', 1], ['mid', 1]], 'textPos');")
rep("  S.look = pick([['classic', 17], ['gold', 1], ['green', bright ? 4 : 0.02]], 'look');", "  S.look = pick([['classic', 6], ['bright', 5], ['panel', 3], ['green', bright ? 3 : 0.02]], 'look');")
rep("  if (box) { const g = pick([['green', 3], ['plum', 1]], 'boxColor'); if (g === 'plum') { box.fill = '#592231'; box.labelFill = '#f0ad54'; } else { box.fill = '#1f3a26'; box.labelFill = '#719587'; } }",
    "  if (box) { const g = pick([['deep', 3], ['slate', 1]], 'boxColor'); box.fill = g === 'slate' ? '#586e63' : '#034226'; box.labelFill = '#00d66b'; box.labelColor = '#034226'; }")
rep("    hl.shade = { style, color:'#000000', alpha:0.35, size: 0.6 + Math.random()*0.6 };\n    if (sb && style !== 'none') sb.shade = { style, color:'#000000', alpha:0.35, size: hl.shade.size };",
    "    if (!LOOKS[S.look].panel) { hl.shade = { style, color:'#000000', alpha:0.35, size: 0.6 + Math.random()*0.6 }; if (sb && style !== 'none') sb.shade = { style, color:'#000000', alpha:0.35, size: hl.shade.size }; }")
rep("  if (logo) logo.shade = { style: pick([['none', 6], ['glow', 3]], 'logoShade'), color:'#000000', alpha:0.35, size: 0.4 + Math.random()*0.4 };",
    "  if (logo) { logo.shade = { style: pick([['none', 6], ['glow', 3]], 'logoShade'), color:'#000000', alpha:0.35, size: 0.4 + Math.random()*0.4 }; logo.variant = pick([['full', 5], ['mark', 1]], 'logoVariant'); if (logo.variant === 'mark') { logo.w = W()*0.16; logo.y = H() - logo.w*0.58 - 0.07*H(); } }")
rep("    hl.rules = hl.align === 'center' && pick([['off', 4], ['on', 1]], 'rules') === 'on';", "    hl.rules = false;")

# ---------------- photo pools (industrial) ----------------
rep_between("const _m = new Date().getMonth();", "function bump(kind, key)",
"""const _m = new Date().getMonth();
const SEASON = [];
// Starting pools for McMillan (industrial / B2B). Calibrate against their past posts.
const MOTORS   = [['industrial electric motor',3],['electric motor closeup',3],['copper winding coil',2],['motor stator rotor',2],['industrial pump motor',2]];
const SHOP     = [['industrial workshop machinery',3],['machine shop lathe',2],['cnc machine precision',2],['metal grinding sparks',2],['industrial workshop dark',2],['welding sparks industrial',1]];
const PEOPLE   = [['engineer inspecting machine',3],['technician industrial equipment',3],['engineer hard hat factory',2],['worker safety glasses machine',2],['engineer tablet factory floor',2],['handshake industrial',1]];
const PLANT    = [['manufacturing plant floor',3],['factory interior industrial',2],['industrial facility exterior',1],['warehouse industrial shelves',1],['power plant turbine',1]];
const DETAIL   = [['gears machinery closeup',2],['industrial bearings steel',2],['electrical control panel',2],['steel texture dark',1],['brushed metal background',1],['blueprint engineering drawing',1]];
const POOLS = {
  logo:     [...MOTORS, ...SHOP, ...DETAIL, ...PLANT.slice(0,2)],
  headline: [...MOTORS, ...SHOP, ...PEOPLE, ...PLANT, ...DETAIL],
  event:    [...PLANT, ...PEOPLE, ...SHOP.slice(0,3)],
  review:   [...DETAIL, ...SHOP.slice(0,4), ...MOTORS.slice(0,2)],
};
""")

# ---------------- photo block list: industrial-appropriate ----------------
rep("  'money','cash','coin','wallet','purse','credit card','bucket','car','truck','motorcycle','bike','bicycle','tractor','boat','airplane','phone','smartphone','headphones','camera','gun','knife','weapon','tool','hammer',",
    "  'money','cash','coin','wallet','purse','credit card','bucket','motorcycle','bicycle','airplane','smartphone','headphones','gun','knife','weapon','toy car','model',")
rep("  'bed','bedroom','pillow','sleeping','asleep','nap','lying',", "  'bed','bedroom','pillow','sleeping','asleep','nap','lying','rust','broken','fire','explosion','smoke','pollution','garbage','trash','chainsaw','lawn','garden','yard','feet','sandal','flip flop','barefoot','home repair','diy',")

# ---------------- phrase bank (starting voice for McMillan) ----------------
rep_between("const BANK = {", "const SEASON_NAME =",
"""const BANK = {
  repair:  { label:'Motor Repair',      heads:['Motor Repair','Emergency Repair','Back Online Fast'],
             subs:['back up and running fast','downtime costs \\u2014 we move quickly','diagnosed, repaired, tested','24/7 emergency service','we fix what stops production'] },
  rewind:  { label:'Rewinding',         heads:['Motor Rewinding','Rebuilt Right','Rewound to Spec'],
             subs:['restored to factory specifications','precision rewinding, every time','tested before it leaves our shop','longer life, lower energy use','quality you can measure'] },
  custom:  { label:'Custom Motors',     heads:['Custom Motors','Built to Spec','Engineered for You'],
             subs:['designed around your application','precision electric motors since day one','from prototype to production','when off-the-shelf won\\u2019t do','built to your exact requirements'] },
  maint:   { label:'Maintenance',       heads:['Preventive Maintenance','Predictive Service','Keep It Running'],
             subs:['catch problems before downtime','scheduled service, fewer surprises','vibration analysis & testing','protect your equipment investment','planned today, running tomorrow'] },
  team:    { label:'Team & Hiring',     heads:['We\\u2019re Hiring','Meet the Team','Skilled Hands'],
             subs:['join the McMillan team','careers in precision manufacturing','experience that shows in the work','apprentice to expert','people who take pride in the craft'] },
  thanks:  { label:'Thank you',         heads:['Thank You','Trusted Partners'],
             subs:['for trusting us with your equipment','proud to keep your plant running','partners in uptime','your business means a great deal to us'] },
};
const SEASONAL_LINES = {
  spring:['spring shutdown season \\u2014 book service now','plan maintenance before the busy season','a good time for a motor check-up'],
  summer:['summer heat is hard on motors','keep cool: preventive service season','beat the heat with a tune-up'],
  autumn:['year-end maintenance season','schedule before the holiday shutdown','prepare your plant for winter'],
  winter:['cold starts are tough on motors','winter reliability, guaranteed','plan next year\\u2019s service now'],
};
""")
rep("  const k = key === 'any' ? pick(Object.keys(BANK).filter(x => x !== 'thanks').map(x => [x, x === 'grief' ? 2 : 3]), 'topic') : key;",
    "  const k = key === 'any' ? pick(Object.keys(BANK).filter(x => x !== 'thanks').map(x => [x, x === 'team' ? 1 : 3]), 'topic') : key;")
rep("""    if (/pre-planning/i.test(line)) return { headline: line.replace(/\\s*pre-planning$/i,''), sub: 'Pre-Planning', topic:'pre' };
    const t2 = pick([['pre',3],['funeral',2],['grief',2]], 'topic');""",
"""    const t2 = pick([['maint',4],['repair',2],['rewind',1]], 'topic');""")
rep_between("function detectTopic(t){", "// Reads a pasted caption",
"""function detectTopic(t){
  const x = t.toLowerCase();
  if (/rewind|rewound|rebuil|refurbish|restor/.test(x)) return 'rewind';
  if (/emergency|repair|fix|breakdown|failed|failure|down\\b|downtime|troubleshoot/.test(x)) return 'repair';
  if (/custom|engineer(ed)? to|built to|prototype|design(ed)? for|spec\\b|specification/.test(x)) return 'custom';
  if (/maintenance|preventive|predictive|vibration|inspection|service plan|check-?up|tune-?up/.test(x)) return 'maint';
  if (/hiring|career|join our team|apprentice|employee|meet the team|welcome .* to the team/.test(x)) return 'team';
  if (/thank|grateful|appreciate|review|testimonial|partner/.test(x)) return 'thanks';
  return null;
}
""")
rep("  const eventish = /webinar|join us|gather|rsvp|session|support group|in person|online|zoom|picnic|event/i.test(txt) && (time || date || /webinar|rsvp/i.test(txt));",
    "  const eventish = /open house|trade show|expo|booth|webinar|join us|rsvp|visit us|tour|training|seminar|event/i.test(txt) && (time || date || /open house|trade show|expo|booth|rsvp/i.test(txt));")
rep("  const isReviewPost = /review|testimonial|families share|one family wrote|kind words/i.test(txt);", "  const isReviewPost = /review|testimonial|customer wrote|kind words|five stars|5 stars/i.test(txt);")
rep("    const title = quoted || (tp ? (BANK[tp].heads[0] + (/webinar/i.test(txt) ? ' Webinar' : /group/i.test(txt) ? ' Group' : '')) : 'Join Us');",
    "    const title = quoted || (/open house/i.test(txt) ? 'Open House' : /trade show|expo|booth/i.test(txt) ? 'See Us at the Show' : /training|seminar/i.test(txt) ? 'Training Session' : 'Join Us');")
rep("    const details = [date, time, /zoom|online|virtual/i.test(txt) ? 'via Zoom' : /in person/i.test(txt) ? 'in person' : ''].filter(Boolean).join('\\n');",
    "    const boothM = txt.match(/booth\\s*#?\\s*([A-Za-z0-9-]+)/i);\n    const details = [date, time, boothM ? 'Booth ' + boothM[1] : '', /zoom|online|virtual/i.test(txt) ? 'online' : ''].filter(Boolean).join('\\n');")
rep("  // blog shares stay logo-only (the photo carries the mood), matching the 2026 posts\n  if (/\\bblog\\b|read more/i.test(txt)) return { template:'logo', headline:'', sub:'', quote:'', attr:'' };\n", "")
rep("  const firstPerson = /\\b(we were treated|treated us|treated like family|my (mom|dad|mother|father)|our (mom|dad|mother|father|parents)|thank you|recommend|helped us|took care of us|handled everything)\\b/i.test(txt);",
    "  const firstPerson = /\\b(they (fixed|rebuilt|repaired|rewound)|our (plant|line|motor|equipment)|saved us|got us (back )?running|thank you|recommend|helped us|great to work with)\\b/i.test(txt);")
rep("detectTopic(hl0?.text || '') || 'funeral'; }", "detectTopic(hl0?.text || '') || 'custom'; }")
rep("  return { template, headline: body[0] || '', sub: template === 'event' ? body.slice(1).join('\\n') : body.slice(1).join(' '), quote: joined, attr: attr || '\\u2014 from a client' };",
    "  return { template, headline: body[0] || '', sub: template === 'event' ? body.slice(1).join('\\n') : body.slice(1).join(' '), quote: joined, attr: attr || '\\u2014 a McMillan customer' };")
rep('placeholder="e.g. bucket, wallet, sunglasses"', 'placeholder="e.g. rust, wind turbine, robot"')
rep("<b>Photos are screened automatically.</b> Anything described with animals, hospitals or illness, money, vehicles, parties, alcohol, babies, costumes, cemeteries or coffins is skipped",
    "<b>Photos are screened automatically.</b> Anything described with animals, hospitals or illness, money, parties, alcohol, babies, costumes, rust, fire, smoke or broken equipment is skipped")
rep("placeholder=\"Search photos: autumn path, family, candle…\"", "placeholder=\"Search photos: electric motor, machine shop, engineer…\"")
rep('placeholder="Pre-Planning&#10;a simple process&#10;&#10;…or paste the whole caption here"', 'placeholder="Motor Rewinding&#10;restored to factory specifications&#10;&#10;…or paste the whole caption here"')

# ---------------- placeholder background: brushed steel + green instead of warm bokeh ----------------
rep("  grad.addColorStop(0,'#7e8f6a'); grad.addColorStop(.5,'#a9a98a'); grad.addColorStop(1,'#c7a877');",
    "  grad.addColorStop(0,'#1c2a24'); grad.addColorStop(.5,'#3a4a44'); grad.addColorStop(1,'#0f1f18');")
rep("    rg.addColorStop(0,`rgba(255,250,235,${a})`); rg.addColorStop(0.85,`rgba(255,250,235,${a*0.7})`); rg.addColorStop(1,'rgba(255,250,235,0)');",
    "    rg.addColorStop(0,`rgba(180,200,190,${a*0.5})`); rg.addColorStop(0.85,`rgba(180,200,190,${a*0.3})`); rg.addColorStop(1,'rgba(180,200,190,0)');")

leftovers = [w for w in ['Bakken', 'funeral', 'Funeral', 'cremat', 'grief', 'by-prefs', 'by-drafts', 'by-photos', 'by-learn', 'Cormorant', 'Pre-Planning'] if w in s]
assert not leftovers, leftovers
(ROOT / 'src/template-mcmillan.html').write_text(s)
print('template-mcmillan.html written')
