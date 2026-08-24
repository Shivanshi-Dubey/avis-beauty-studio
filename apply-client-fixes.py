#!/usr/bin/env python3
"""Apply client-requested UI fixes across avi-beauty-studio HTML pages."""
from pathlib import Path
import re

ROOT = Path(__file__).parent / "avi-beauty-studio"
PAGES = list(ROOT.glob("*.html"))

# --- shared CSS patches (all main pages) ---
CSS_PATCHES = [
    (
        ".loader-word{ font-family:'Fraunces',serif; font-size:2.4rem; color:#fff; letter-spacing:.02em; }",
        ".loader-word{ font-family:'Fraunces',serif; font-size:2.4rem; color:#fff; letter-spacing:.02em; line-height:1.15; padding-bottom:.12em; }",
    ),
    (
        ".footer-brand h3{ margin-bottom:0; }",
        ".footer-brand h3{ margin-bottom:0; line-height:1.15; padding-bottom:.1em; }",
    ),
    (
        '<p class="footer-hours">Open daily · flexible bookings</p>',
        '<p class="footer-hours">Mon 10–6 · Tue Closed · Wed–Sat 10–7 · Sun 10–5</p>',
    ),
]

SERVICE_CSS_OLD = """.svc-img{ width:100%; height:160px; border-radius:14px; overflow:hidden; margin-bottom:1.3rem; }
.svc-img img{ width:100%; height:100%; object-fit:cover; transition:transform .6s ease; }
.svc-card:hover .svc-img img{ transform:scale(1.08); }
.svc-num{ position:absolute; top:1.6rem; right:1.8rem; font-family:'Fraunces',serif; font-style:italic; font-size:2.2rem; color:var(--lav-light); z-index:1; }"""

SERVICE_CSS_NEW = """.svc-img{ position:relative; width:100%; height:200px; border-radius:14px; overflow:hidden; margin-bottom:1.3rem; }
.svc-img img{ width:100%; height:100%; object-fit:cover; object-position:center center; transition:transform .6s ease; }
.svc-card:hover .svc-img img{ transform:scale(1.05); }
.svc-num{
  position:absolute; top:.75rem; right:.75rem; z-index:2;
  font-family:'Fraunces',serif; font-size:.95rem; font-weight:600; font-style:normal;
  color:#fff; background:rgba(69,57,105,.78); backdrop-filter:blur(4px);
  padding:.35rem .7rem; border-radius:10px; line-height:1; letter-spacing:.04em;
}"""

SERVICE_CARD_CSS_OLD = """.svc-card{
  background:var(--cream-card); border:1px solid var(--border); border-radius:22px; padding:1.6rem;
  cursor:pointer; transition:.4s ease; position:relative; overflow:hidden;
}"""

SERVICE_CARD_CSS_NEW = """.svc-card{
  background:var(--cream-card); border:1px solid var(--border); border-radius:22px; padding:1.6rem;
  cursor:default; transition:.4s ease; position:relative; overflow:hidden;
}"""

IMAGES = {
    "Facial": "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=900&q=85&auto=format&fit=crop",
    "Waxing": "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=900&q=85&auto=format&fit=crop",
    "Bleach": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&q=85&auto=format&fit=crop",
    "Threading": "https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?w=900&q=85&auto=format&fit=crop",
    "Haircare": "https://images.unsplash.com/photo-1560066984-138d4ef1c2b3?w=900&q=85&auto=format&fit=crop",
    "Makeup": "https://images.unsplash.com/photo-1487412948138-5b3b995efd36?w=900&q=85&auto=format&fit=crop",
    "Hairstyle": "https://images.unsplash.com/photo-1492106087820-71f1a00d81d4?w=900&q=85&auto=format&fit=crop",
}

LASER_IMG_OLD = 'src="https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?w=700&q=80" alt="Laser hair removal"'
LASER_IMG_NEW = 'src="https://images.unsplash.com/photo-1629909613654-28e377c37b26?w=900&q=85&auto=format&fit=crop" alt="Laser hair removal treatment"'

LOADER_JS_OLD = """window.addEventListener('load', ()=>{
  setTimeout(()=>{ document.getElementById('loader').classList.add('hide'); }, 700);
});"""

LOADER_JS_NEW = """window.addEventListener('load', ()=>{
  const loader = document.getElementById('loader');
  if(sessionStorage.getItem('absSeen')){
    loader.classList.add('hide');
  } else {
    sessionStorage.setItem('absSeen','1');
    setTimeout(()=> loader.classList.add('hide'), 700);
  }
});"""

TOGGLE_OLD = """function toggleCategory(h3){
  const card = h3.closest('.svc-card');
  const wasOpen = card.classList.contains('open');
  document.querySelectorAll('.svc-card.open').forEach(c=>c.classList.remove('open'));
  if(!wasOpen) card.classList.add('open');
}"""

TOGGLE_NEW = """function toggleCategory(h3){
  const card = h3.closest('.svc-card');
  if(!card) return;
  const wasOpen = card.classList.contains('open');
  document.querySelectorAll('.svc-card.open').forEach(c=>c.classList.remove('open'));
  if(!wasOpen) card.classList.add('open');
}

document.querySelectorAll('.svc-card h3[onclick*="toggleCategory"]').forEach(h3=>{
  h3.addEventListener('click', e=> e.stopPropagation());
});
document.querySelectorAll('.svc-list, .svc-row').forEach(el=>{
  el.addEventListener('click', e=> e.stopPropagation());
});"""


def patch_all_pages(text: str) -> str:
    for old, new in CSS_PATCHES:
        text = text.replace(old, new)
    if LOADER_JS_OLD in text:
        text = text.replace(LOADER_JS_OLD, LOADER_JS_NEW)
    return text


def patch_service_page(text: str) -> str:
    text = text.replace(SERVICE_CSS_OLD, SERVICE_CSS_NEW)
    text = text.replace(SERVICE_CARD_CSS_OLD, SERVICE_CARD_CSS_NEW)

    # Move svc-num inside svc-img for each card
    pattern = re.compile(
        r'(<div class="svc-img"><img src=")([^"]+)(" alt="[^"]*")(?: style="[^"]*")?(></div>)\s*'
        r'<span class="svc-num">(\d+)</span>\s*'
        r'(<h3 onclick="toggleCategory\(this\)">)([^<]+)(</h3>)',
        re.DOTALL,
    )

    def repl(m):
        num, title = m.group(5), m.group(7)
        src = IMAGES.get(title.strip(), m.group(2))
        return (
            f'{m.group(1)}{src}{m.group(3)}>'
            f'<span class="svc-num">{num}</span></div>'
            f'{m.group(6)}{title}{m.group(8)}'
        )

    text, n = pattern.subn(repl, text)
    if n != 7:
        print(f"  warning: restructured {n}/7 service cards")

    if TOGGLE_OLD in text:
        text = text.replace(TOGGLE_OLD, TOGGLE_NEW)

    # Booking modal: stop accidental overlay issues from bubbling
    if "svc-opt" in text and "stopPropagation" not in text.split("document.querySelectorAll('.svc-opt')")[1][:400]:
        text = text.replace(
            "document.querySelectorAll('.svc-opt').forEach(opt=>{\n  opt.addEventListener('click', ()=>{",
            "document.querySelectorAll('.svc-opt').forEach(opt=>{\n  opt.addEventListener('click', (e)=>{\n    e.stopPropagation();",
        )

    return text


def patch_index(text: str) -> str:
    return text.replace(LASER_IMG_OLD, LASER_IMG_NEW)


def main():
    for path in PAGES:
        if path.name == "services.html":
            continue
        text = path.read_text(encoding="utf-8")
        original = text
        text = patch_all_pages(text)
        if path.name == "service.html":
            text = patch_service_page(text)
        if path.name == "index.html":
            text = patch_index(text)
        if text != original:
            path.write_text(text, encoding="utf-8")
            print(f"updated {path.name}")
        else:
            print(f"unchanged {path.name}")


if __name__ == "__main__":
    main()
