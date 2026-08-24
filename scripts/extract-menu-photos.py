#!/usr/bin/env python3
"""Extract service photos embedded in the Avi's Beauty Studio menu graphic."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "avi-beauty-studio"
MENU = ROOT / "images" / "google" / "google-05.jpg"
OUT = ROOT / "images" / "google" / "extracted"
SIZE = 900

# Tighter crops — photo only, no menu text (fractions of full menu image)
CROPS = {
    "menu-facial.jpg": (0.05, 0.50, 0.30, 0.62),
    "menu-haircare.jpg": (0.38, 0.80, 0.62, 0.94),
    "menu-makeup.jpg": (0.70, 0.46, 0.95, 0.58),
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    img = Image.open(MENU)
    w, h = img.size
    for name, (x1, y1, x2, y2) in CROPS.items():
        box = (int(x1 * w), int(y1 * h), int(x2 * w), int(y2 * h))
        crop = img.crop(box).resize((SIZE, SIZE), Image.Resampling.LANCZOS)
        if crop.mode != "RGB":
            crop = crop.convert("RGB")
        dest = OUT / name
        crop.save(dest, "JPEG", quality=90, optimize=True)
        print(f"OK {name} ({dest.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
