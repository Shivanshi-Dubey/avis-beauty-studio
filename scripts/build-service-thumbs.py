#!/usr/bin/env python3
"""Build square service thumbnails from salon source photos."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent / "avi-beauty-studio"
SRC = ROOT / "images"
GOOGLE = SRC / "google" / "extracted"
OUT = ROOT / "images" / "services"
SIZE = 900

# name -> (source path relative to images/, crop mode)
MAPPING = {
    "facial.jpg": ("avis photo 3.jpeg", "top"),
    "waxing.jpg": ("avis photo 1.jpeg", "top"),
    "bleach.jpg": ("avis photo 7.png", "top"),
    "threading.jpg": ("avis photo 3.jpeg", "top"),
    "haircare.jpg": ("avis photo 1.jpeg", "center"),
    "makeup.jpg": ("avis photo 5.jpeg", "top"),
    "hairstyle.jpg": ("avis photo 3.jpeg", "center"),
}


def trim_grey_bars(img: Image.Image) -> Image.Image:
    """Remove grey pillarbox bars from some exports."""
    rgb = img.convert("RGB")
    w, h = rgb.size
    pixels = rgb.load()
    cols = []
    for x in range(w):
        dark = sum(1 for y in range(0, h, max(1, h // 40))
                   if max(pixels[x, y]) - min(pixels[x, y]) < 18 and sum(pixels[x, y]) / 3 < 120)
        if dark < max(1, (h // 40)) * 0.65:
            cols.append(x)
    if len(cols) < w * 0.4:
        return img
    left, right = cols[0], cols[-1]
    return img.crop((left, 0, right + 1, h))


def square_crop(img: Image.Image, mode: str) -> Image.Image:
    img = ImageOps.exif_transpose(img)
    if mode == "smart":
        img = trim_grey_bars(img)
        mode = "top"
    w, h = img.size
    side = min(w, h)
    if mode == "top":
        left = max(0, (w - side) // 2)
        top = 0
        if h > w * 1.35:
            # tall portrait: bias crop toward upper third (faces)
            top = min(int(h * 0.08), h - side)
        box = (left, top, left + side, top + side)
    else:
        left = (w - side) // 2
        top = (h - side) // 2
        box = (left, top, left + side, top + side)
    return img.crop(box)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for out_name, (src_rel, crop_mode) in MAPPING.items():
        src = SRC / src_rel
        if not src.exists():
            raise FileNotFoundError(src)
        img = Image.open(src)
        cropped = square_crop(img, crop_mode)
        out = cropped.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
        dest = OUT / out_name
        if dest.suffix.lower() == ".jpg":
            if out.mode != "RGB":
                out = out.convert("RGB")
            out.save(dest, "JPEG", quality=88, optimize=True)
        else:
            out.save(dest, "PNG", optimize=True)
        print(f"OK {out_name} <- {src_rel} ({dest.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
