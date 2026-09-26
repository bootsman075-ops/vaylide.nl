"""Genereert het eigen, abstracte beeldmateriaal voor de voorbeelduitnodigingen.

Geen stockfoto's: alle beelden worden hier met Pillow opgebouwd (verlopen,
vormen, vervaging en papierkorrel). Draai opnieuw met:

    .venv/bin/python tools/generate_demo_images.py
"""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parent.parent / "static" / "img" / "demo"


def vertical_gradient(size, top, bottom):
    w, h = size
    base = Image.new("RGB", size, top)
    mask = Image.linear_gradient("L").resize((w, h))
    return Image.composite(Image.new("RGB", size, bottom), base, mask)


def add_grain(img, amount=10, seed=1):
    random.seed(seed)
    noise = Image.effect_noise(img.size, amount).convert("L")
    noise_rgb = Image.merge("RGB", (noise, noise, noise))
    return ImageChops.overlay(img, noise_rgb) if amount else img


def vignette(img, strength=0.55):
    w, h = img.size
    mask = Image.radial_gradient("L").resize((w, h))
    dark = Image.new("RGB", (w, h), (0, 0, 0))
    mask = mask.point(lambda v: int(v * strength))
    return Image.composite(dark, img, mask)


def stamp(img, draw_fn, bbox, color, alpha, blur):
    """Brengt een vorm aan via een vervaagd alfamasker (voorkomt donkere randen)."""
    pad = int(blur * 3) + 2
    x0, y0, x1, y1 = (int(bbox[0]) - pad, int(bbox[1]) - pad, int(bbox[2]) + pad, int(bbox[3]) + pad)
    x0, y0 = max(0, x0), max(0, y0)
    x1, y1 = min(img.width, x1), min(img.height, y1)
    if x1 <= x0 or y1 <= y0:
        return
    mask = Image.new("L", (x1 - x0, y1 - y0), 0)
    draw_fn(ImageDraw.Draw(mask), -x0, -y0, alpha)
    if blur:
        mask = mask.filter(ImageFilter.GaussianBlur(blur))
    region = img.crop((x0, y0, x1, y1))
    region.paste(Image.new("RGB", region.size, color), mask=mask)
    img.paste(region, (x0, y0))


def disc(img, x, y, r, color, alpha, blur):
    stamp(img, lambda d, ox, oy, a: d.ellipse((x - r + ox, y - r + oy, x + r + ox, y + r + oy), fill=a), (x - r, y - r, x + r, y + r), color, alpha, blur)


def soft_blob(img, cx, cy, r, color, alpha, blur, rnd, points=24, wobble=0.18):
    pts = []
    for i in range(points):
        a = 2 * math.pi * i / points
        rr = r * (1 + rnd.uniform(-wobble, wobble))
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    stamp(img, lambda d, ox, oy, a: d.polygon([(px + ox, py + oy) for px, py in pts], fill=a), (min(xs), min(ys), max(xs), max(ys)), color, alpha, blur)


def sea(size=(1500, 1500), seed=9):
    rnd = random.Random(seed)
    w, h = size
    sky = vertical_gradient((w, int(h * 0.52)), (206, 219, 228), (242, 230, 219))
    water = vertical_gradient((w, h - int(h * 0.52)), (170, 189, 199), (120, 142, 156))
    img = Image.new("RGB", size)
    img.paste(sky, (0, 0))
    img.paste(water, (0, int(h * 0.52)))
    lines = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lines)
    for _ in range(140):
        y = rnd.uniform(h * 0.53, h)
        x = rnd.uniform(0, w)
        length = rnd.uniform(40, 220) * (y / h)
        d.line((x, y, x + length, y), fill=(245, 240, 232, rnd.randint(40, 110)), width=2)
    img = Image.alpha_composite(img.convert("RGBA"), lines.filter(ImageFilter.GaussianBlur(1.4))).convert("RGB")
    return add_grain(img, 7)



def bokeh_gold(size=(1800, 1200), seed=7):
    rnd = random.Random(seed)
    img = vertical_gradient(size, (22, 26, 40), (9, 11, 18))
    for blur, count, rmin, rmax, alpha in ((30, 30, 70, 160, 70), (12, 44, 24, 70, 105), (3, 70, 5, 18, 170)):
        for _ in range(count):
            x = rnd.gauss(size[0] * 0.55, size[0] * 0.28)
            y = rnd.gauss(size[1] * 0.45, size[1] * 0.26)
            tone = rnd.choice([(232, 200, 140), (245, 222, 170), (214, 170, 100), (255, 236, 200)])
            disc(img, x, y, rnd.uniform(rmin, rmax), tone, int(alpha * rnd.uniform(0.5, 1)), blur)
    return add_grain(vignette(img, 0.5), 6)


def candlelight(size=(1200, 1600), seed=11):
    rnd = random.Random(seed)
    img = vertical_gradient(size, (34, 18, 22), (12, 8, 10))
    for _ in range(30):
        x, y = rnd.uniform(0, size[0]), rnd.uniform(size[1] * 0.25, size[1])
        disc(img, x, y, rnd.uniform(30, 120), rnd.choice([(255, 190, 110), (240, 170, 100), (255, 214, 150)]), rnd.randint(40, 110), 26)
    for i in range(5):
        x = size[0] * (0.2 + 0.15 * i) + rnd.uniform(-20, 20)
        y = size[1] * 0.62 + rnd.uniform(-40, 40)
        disc(img, x, y, 70, (255, 200, 130), 90, 30)
        stamp(img, lambda d, ox, oy, a, x=x, y=y: d.ellipse((x - 14 + ox, y - 38 + oy, x + 14 + ox, y + 18 + oy), fill=a), (x - 14, y - 38, x + 14, y + 18), (255, 232, 185), 235, 6)
    return add_grain(vignette(img, 0.45), 6)


def watercolor(size=(1200, 1500), seed=3, palette=None, stems=True):
    rnd = random.Random(seed)
    palette = palette or [(233, 190, 184), (214, 150, 160), (198, 124, 136), (190, 205, 180), (160, 182, 150), (243, 218, 196)]
    img = Image.new("RGB", size, (251, 246, 239))
    for blur, count, scale, alpha in ((46, 14, 2.0, 90), (22, 18, 1.2, 80), (8, 20, 0.7, 70)):
        for _ in range(count):
            cx = rnd.gauss(size[0] * 0.5, size[0] * 0.3)
            cy = rnd.gauss(size[1] * 0.42, size[1] * 0.28)
            r = rnd.uniform(50, 170) * scale
            soft_blob(img, cx, cy, r, rnd.choice(palette), int(alpha * rnd.uniform(0.6, 1.1)), blur, rnd)
    if stems:
        for _ in range(7):
            x0, y0 = rnd.uniform(0.25, 0.75) * size[0], size[1] * rnd.uniform(0.82, 1.0)
            x1, y1 = x0 + rnd.uniform(-140, 140), size[1] * rnd.uniform(0.25, 0.5)
            mx, my = (x0 + x1) / 2 + rnd.uniform(-60, 60), (y0 + y1) / 2
            curve = []
            for k in range(21):
                t = k / 20
                curve.append(((1 - t) ** 2 * x0 + 2 * (1 - t) * t * mx + t * t * x1, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * my + t * t * y1))
            xs, ys = [p[0] for p in curve], [p[1] for p in curve]
            stamp(img, lambda d, ox, oy, a, c=curve: d.line([(px + ox, py + oy) for px, py in c], fill=a, width=3), (min(xs), min(ys), max(xs), max(ys)), (120, 140, 108), 150, 0.8)
            for t_idx in (6, 10, 14, 18):
                lx, ly = curve[t_idx]
                side = 1 if t_idx % 8 else -1
                leaf = [(lx, ly), (lx + side * 22, ly - 16), (lx + side * 46, ly - 4), (lx + side * 22, ly + 6)]
                lxs, lys = [p[0] for p in leaf], [p[1] for p in leaf]
                stamp(img, lambda d, ox, oy, a, pts=leaf: d.polygon([(px + ox, py + oy) for px, py in pts], fill=a), (min(lxs), min(lys), max(lxs), max(lys)), (150, 172, 132), 130, 1.2)
    return add_grain(img, 12)


def dunes(size=(1800, 1150), seed=5, sky=((246, 226, 208), (214, 226, 232)), sand=((226, 203, 176), (201, 172, 142), (180, 148, 118))):
    rnd = random.Random(seed)
    img = vertical_gradient(size, sky[1], sky[0])
    w, h = size
    disc(img, w * 0.68, h * 0.27, 120, (255, 240, 222), 120, 60)
    disc(img, w * 0.68, h * 0.27, 70, (255, 246, 232), 235, 8)
    for i, tone in enumerate(sand):
        base = h * (0.55 + 0.13 * i)
        amp = 60 - i * 12
        phase = rnd.uniform(0, math.pi)
        pts = [(0, h)]
        for x in range(0, w + 20, 20):
            pts.append((x, base + amp * math.sin(x / (w / (1.6 + i * 0.7)) + phase) + 18 * math.sin(x / 90 + i)))
        pts.append((w, h))
        stamp(img, lambda d, ox, oy, a, p=pts: d.polygon([(px + ox, py + oy) for px, py in p], fill=a), (0, min(y for _, y in pts), w, h), tone, 255, 1.5 + i)
    return add_grain(img, 8)


def petals(size=(1600, 1100), seed=21):
    rnd = random.Random(seed)
    img = Image.new("RGB", size, (250, 245, 238))
    for blur, count in ((9, 22), (1.5, 30)):
        for _ in range(count):
            pw, ph = rnd.randint(40, 110), rnd.randint(22, 50)
            cx, cy = rnd.uniform(0, size[0]), rnd.uniform(0, size[1])
            ang = math.radians(rnd.uniform(0, 180))
            pts = []
            for k in range(28):
                t = 2 * math.pi * k / 28
                ex, ey = pw / 2 * math.cos(t), ph / 2 * math.sin(t)
                pts.append((cx + ex * math.cos(ang) - ey * math.sin(ang), cy + ex * math.sin(ang) + ey * math.cos(ang)))
            xs, ys = [p[0] for p in pts], [p[1] for p in pts]
            color = rnd.choice([(229, 180, 178), (240, 205, 196), (206, 150, 158), (247, 226, 214)])
            stamp(img, lambda d, ox, oy, a, p=pts: d.polygon([(px + ox, py + oy) for px, py in p], fill=a), (min(xs), min(ys), max(xs), max(ys)), color, rnd.randint(140, 220), blur)
    return add_grain(img, 10)


def save(img, name, quality=80):
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / f"{name}.webp"
    img.save(path, "WEBP", quality=quality, method=6)
    print(f"{path.relative_to(OUT.parent.parent.parent)}  {img.size[0]}x{img.size[1]}  {path.stat().st_size // 1024} KB")


if __name__ == "__main__":
    save(watercolor(), "waterverf-bloesem")
    save(watercolor(size=(1500, 1000), seed=8, palette=[(222, 214, 236), (190, 172, 214), (150, 128, 184), (205, 218, 196), (247, 232, 222)], stems=False), "waterverf-lavendel")
    save(bokeh_gold(), "goud-lichtjes")
    save(candlelight(), "kaarslicht")
    save(dunes(), "duinen-ochtend")
    save(sea(), "zee-horizon")
    save(petals(), "bloemblaadjes")
    save(dunes(size=(1200, 1500), seed=13, sky=((232, 222, 214), (198, 208, 214)), sand=((214, 206, 196), (186, 176, 164), (160, 150, 140))), "duinen-staand")
