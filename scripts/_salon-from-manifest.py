import json, pathlib, urllib.request, ssl
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
root = pathlib.Path(r"Z:/avi-beauty-studio/images/google")
salon = root / "salon"
manifest = json.loads((root / "download-manifest.json").read_text(encoding="utf-8"))
ctx = ssl.create_default_context()
added = []
for item in manifest.get("downloaded", []):
    if item.get("source") != "belleriver_bia":
        continue
    url = item["url"]
    fname = "manifest-" + item["file"]
    dest = salon / fname
    if dest.exists():
        continue
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, context=ctx, timeout=60) as r:
        data = r.read()
    dest.write_bytes(data)
    added.append((fname, len(data)))
print("added", len(added))
for a in added:
    print(a[0], a[1])
