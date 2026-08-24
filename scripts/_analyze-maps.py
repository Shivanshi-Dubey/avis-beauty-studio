import re, pathlib
for name in ["maps-page.html", "maps-search.html"]:
    p = pathlib.Path(r"Z:/avi-beauty-studio/images/google") / name
    if not p.exists():
        print(name, "missing")
        continue
    t = p.read_text(encoding="utf-8", errors="ignore")
    print("===", name, "len", len(t), "googleusercontent", t.count("googleusercontent"))
    m = sorted(set(re.findall(r"https://lh3\.googleusercontent\.com[^\s\"\\]+", t)))
    print("lh3 https urls", len(m))
    for x in m[:8]:
        print(" ", x[:120])
