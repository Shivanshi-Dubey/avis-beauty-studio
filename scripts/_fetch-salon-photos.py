import re, json, urllib.request, pathlib, ssl
from urllib.parse import unquote

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
root = pathlib.Path(r"Z:/avi-beauty-studio/images/google")
salon = root / "salon"
salon.mkdir(parents=True, exist_ok=True)

def fetch(url, out=None):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9"})
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, context=ctx, timeout=60) as r:
        data = r.read()
        if out:
            out.write_bytes(data)
        return r.status, len(data), data

def unique_lh3(text):
    text = text.replace("\\u003d", "=").replace("\\u0026", "&")
    pat = re.compile(r"https?://lh3\.googleusercontent\.com/[A-Za-z0-9_\-=./%+]+")
    seen = []
    for m in pat.finditer(text):
        u = unquote(m.group(0).rstrip("\\,;"))
        if "default-user" in u or u.endswith("/ogw/default-u"):
            continue
        if len(u) < 40:
            continue
        if u not in seen:
            seen.append(u)
    return seen

report = {"maps_urls": [], "downloaded": [], "errors": [], "bia": {}}

maps = root / "maps-page.html"
if maps.exists():
    text = maps.read_text(encoding="utf-8", errors="ignore")
    urls = unique_lh3(text)
    report["maps_urls_count"] = len(urls)
    report["maps_urls_sample"] = urls[:10]
    for i, url in enumerate(urls[:20], 1):
        dest = salon / ("salon-%02d.jpg" % i)
        try:
            st, n, _ = fetch(url, dest)
            if n < 8000:
                dest.unlink(missing_ok=True)
                report["errors"].append({"file": dest.name, "bytes": n, "note": "skipped small"})
            else:
                report["downloaded"].append({"file": dest.name, "bytes": n, "source": "google_maps", "url": url[:240]})
        except Exception as e:
            report["errors"].append({"url": url[:100], "error": str(e)})

bia = "https://www.belleriverbia.com/live-here/Beauty-and-Spa-263/avis-beauty-studio"
try:
    st, n, data = fetch(bia)
    html = data.decode("utf-8", errors="ignore")
    imgs = sorted(set(re.findall(r"https://www\.belleriverbia\.com/upl/i/[^\"'\\s>]+", html)))
    report["bia"]["count"] = len(imgs)
    for i, url in enumerate(imgs[:12], 1):
        ext = ".png" if url.lower().endswith(".png") else ".jpg"
        dest = salon / ("bia-%02d%s" % (i, ext))
        try:
            _, sz, _ = fetch(url, dest)
            report["downloaded"].append({"file": dest.name, "bytes": sz, "source": "belleriver_bia", "url": url})
        except Exception as e:
            report["errors"].append({"bia": url, "error": str(e)})
except Exception as e:
    report["bia"]["error"] = str(e)

for fb in ["https://www.facebook.com/avisbeautystudio", "https://m.facebook.com/avisbeautystudio"]:
    try:
        st, n, data = fetch(fb)
        html = data.decode("utf-8", errors="ignore")
        ogs = re.findall(r'property="og:image" content="([^"]+)"', html)
        report.setdefault("facebook", []).append({"url": fb, "status": st, "og_images": ogs[:3]})
    except Exception as e:
        report.setdefault("facebook", []).append({"url": fb, "error": str(e)})

(root / "salon-fetch-report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
print("lh3 urls:", report.get("maps_urls_count", 0))
print("downloaded:", len(report["downloaded"]))
for d in report["downloaded"]:
    print(" ", d["file"], d["bytes"], d.get("source"))


