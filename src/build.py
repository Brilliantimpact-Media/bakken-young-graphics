#!/usr/bin/env python3
"""Build each client's studio page from its template + assets.
Usage: python3 src/build.py            (builds every client)
"""
import base64, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
def b64(p): return base64.b64encode(p.read_bytes()).decode()

def build_bakken_young():
    tpl = (ROOT/'src/template-bakken-young.html').read_text()
    html = tpl.replace('__LOGO_B64__', b64(ROOT/'assets/bakken-young/logo-white.png'))
    (ROOT/'bakken-young/index.html').write_text(html); print('bakken-young  ok')

def build_mcmillan():
    src = ROOT/'src/template-mcmillan.html'
    if not src.exists(): print('mcmillan      (no template yet)'); return
    tpl = src.read_text()
    html = (tpl.replace('__LOGO_B64__', b64(ROOT/'assets/mcmillan/logo-white.png'))
               .replace('__MARK_B64__', b64(ROOT/'assets/mcmillan/mark-white.png'))
               .replace('__LOGOC_B64__', b64(ROOT/'assets/mcmillan/logo-color.png')))
    (ROOT/'mcmillan').mkdir(exist_ok=True)
    (ROOT/'mcmillan/index.html').write_text(html); print('mcmillan      ok')


def build_springforth():
    src = ROOT/'src/template-springforth.html'
    if not src.exists(): print('springforth   (no template yet)'); return
    A = ROOT/'assets/springforth'
    html = src.read_text()
    for key, f in [('__MARK_B64__','mark-color.png'), ('__MARKW_B64__','mark-white.png'),
                   ('__LOCKUP_B64__','lockup-color.png'), ('__LOCKUPW_B64__','lockup-white.png'),
                   ('__WORD_B64__','wordmark-h.png'), ('__WORDW_B64__','wordmark-h-white.png')]:
        html = html.replace(key, b64(A/f))
    (ROOT/'springforth').mkdir(exist_ok=True)
    (ROOT/'springforth/index.html').write_text(html); print('springforth   ok')

if __name__ == '__main__':
    build_bakken_young(); build_mcmillan(); build_springforth()
