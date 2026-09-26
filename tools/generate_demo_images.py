"""Genereert het eigen, abstracte beeldmateriaal voor de voorbeelduitnodigingen.

Geen stockfoto's: alle beelden worden hier met Pillow opgebouwd (verlopen,
vormen, vervaging en papierkorrel). Per beeld komt er ook een versie van 1000 px
breed bij (naam-1000.webp). Draai opnieuw met:

    .venv/bin/python tools/generate_demo_images.py            # alle beelden
    .venv/bin/python tools/generate_demo_images.py rozen      # alleen de genoemde
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


def curve_points(p0, p1, bend, steps=24):
    """Punten op een zachte boog van p0 naar p1 (kwadratische bezier)."""
    (x0, y0), (x1, y1) = p0, p1
    mx, my = (x0 + x1) / 2 + bend[0], (y0 + y1) / 2 + bend[1]
    return [((1 - t) ** 2 * x0 + 2 * (1 - t) * t * mx + t * t * x1, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * my + t * t * y1)
            for t in (k / steps for k in range(steps + 1))]


def poly(img, pts, color, alpha, blur):
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    stamp(img, lambda d, ox, oy, a: d.polygon([(px + ox, py + oy) for px, py in pts], fill=a), (min(xs), min(ys), max(xs), max(ys)), color, alpha, blur)


def line(img, pts, color, alpha, blur, width):
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    stamp(img, lambda d, ox, oy, a: d.line([(px + ox, py + oy) for px, py in pts], fill=a, width=width, joint="curve"),
          (min(xs) - width, min(ys) - width, max(xs) + width, max(ys) + width), color, alpha, blur)


def leaf(cx, cy, length, width, angle, steps=18):
    """Blad als spoelvorm rond (cx, cy), gedraaid over angle (radialen)."""
    pts = []
    for k in range(steps * 2):
        t = k / (steps * 2 - 1) * 2 * math.pi
        ex, ey = length / 2 * math.cos(t), width / 2 * math.sin(t) * abs(math.sin(t / 2) + .35) / 1.35
        pts.append((cx + ex * math.cos(angle) - ey * math.sin(angle), cy + ex * math.sin(angle) + ey * math.cos(angle)))
    return pts


def eucalyptus_scene(size=(1200, 1500), seed=31):
    rnd = random.Random(seed)
    img = vertical_gradient(size, (247, 244, 237), (236, 238, 229))
    w, h = size
    for _ in range(9):
        soft_blob(img, rnd.uniform(0, w), rnd.uniform(0, h), rnd.uniform(160, 320), rnd.choice([(214, 224, 208), (228, 222, 206)]), 90, 60, rnd)
    for layer, (blur, count, tones) in enumerate(((7, 5, [(190, 204, 186), (206, 214, 198)]), (1.2, 6, [(128, 154, 132), (152, 176, 152), (104, 132, 112)]))):
        for _ in range(count):
            start = (rnd.choice([-40, w + 40]), rnd.uniform(0.1, 0.95) * h)
            end = (rnd.uniform(0.25, 0.75) * w, rnd.uniform(0.05, 0.9) * h)
            stem = curve_points(start, end, (rnd.uniform(-160, 160), rnd.uniform(-160, 160)), 30)
            line(img, stem, (118, 132, 110), 150 if layer else 90, blur, 3)
            for i in range(2, len(stem) - 1, 3):
                x, y = stem[i]
                (xa, ya), (xb, yb) = stem[i - 1], stem[i + 1]
                ang = math.atan2(yb - ya, xb - xa)
                size_ = rnd.uniform(46, 78) * (1 - i / len(stem) * .45)
                for side in (-1, 1):
                    a = ang + side * rnd.uniform(1.0, 1.4)
                    poly(img, leaf(x + math.cos(a) * size_ * .45, y + math.sin(a) * size_ * .45, size_, size_ * .9, a), rnd.choice(tones), rnd.randint(170, 225), blur)
    return add_grain(img, 9, seed)


def pampas_scene(size=(1200, 1500), seed=33):
    rnd = random.Random(seed)
    img = vertical_gradient(size, (244, 234, 220), (229, 212, 190))
    w, h = size
    disc(img, w * .7, h * .22, 260, (252, 242, 228), 160, 90)
    for layer, (blur, count) in enumerate(((6, 4), (1, 5))):
        for _ in range(count):
            x0 = rnd.uniform(.12, .88) * w
            top = (x0 + rnd.uniform(-220, 220), rnd.uniform(.08, .4) * h)
            stem = curve_points((x0, h + 20), top, (rnd.uniform(-120, 120), 0), 40)
            line(img, stem, (184, 158, 124), 170 if layer else 100, blur, 3)
            plume = stem[-18:]
            for i, (x, y) in enumerate(plume):
                spread = math.sin(math.pi * (i + 2) / (len(plume) + 2))
                for _ in range(16):
                    a = rnd.uniform(-math.pi, 0) + rnd.uniform(-.5, .5)
                    ln = rnd.uniform(50, 130) * (.35 + spread * .75)
                    end = (x + math.cos(a) * ln, y + math.sin(a) * ln * .6)
                    line(img, [(x, y), ((x + end[0]) / 2 + rnd.uniform(-10, 10), (y + end[1]) / 2), end],
                         rnd.choice([(222, 198, 164), (198, 170, 132), (236, 220, 194), (180, 150, 112)]), rnd.randint(110, 190), blur + .6, 3)
    return add_grain(img, 10, seed)


def starry_sky(size=(1500, 1200), seed=35, top=(14, 20, 46), bottom=(46, 44, 84), moon=True):
    rnd = random.Random(seed)
    img = vertical_gradient(size, top, bottom)
    w, h = size
    for _ in range(14):
        soft_blob(img, rnd.gauss(w * .45, w * .3), rnd.gauss(h * .5, h * .12), rnd.uniform(90, 220), rnd.choice([(70, 72, 120), (88, 78, 128), (60, 80, 120)]), 70, 70, rnd)
    if moon:
        mx, my = w * .76, h * .22
        disc(img, mx, my, 190, (248, 228, 180), 60, 80)

        def crescent(d, ox, oy, a):
            d.ellipse((mx - 62 + ox, my - 62 + oy, mx + 62 + ox, my + 62 + oy), fill=a)
            d.ellipse((mx - 36 + ox, my - 80 + oy, mx + 80 + ox, my + 36 + oy), fill=0)
        stamp(img, crescent, (mx - 62, my - 62, mx + 62, my + 62), (250, 236, 200), 245, 1.5)
    for _ in range(420):
        x, y = rnd.uniform(0, w), rnd.uniform(0, h) ** 1.1 / h ** .1
        r = rnd.choice([1, 1, 1.4, 1.8, 2.4])
        disc(img, x, y, r, rnd.choice([(255, 250, 235), (255, 236, 196), (220, 230, 255)]), rnd.randint(120, 255), .4)
    for _ in range(12):
        x, y = rnd.uniform(0, w), rnd.uniform(0, h * .8)
        disc(img, x, y, 16, (255, 240, 210), 70, 8)
        disc(img, x, y, 2.6, (255, 252, 240), 255, .5)
    return add_grain(img, 5, seed)


def confetti_scene(size=(1600, 1100), seed=37, bg=(252, 246, 236), tones=None):
    rnd = random.Random(seed)
    tones = tones or [(232, 96, 74), (247, 191, 76), (86, 176, 196), (238, 142, 164), (124, 112, 204), (104, 188, 150)]
    img = Image.new("RGB", size, bg)
    w, h = size
    for blur, count, scale in ((10, 40, 1.4), (4, 50, 1.1), (.6, 70, .9)):
        for _ in range(count):
            x, y, c = rnd.uniform(0, w), rnd.uniform(0, h), rnd.choice(tones)
            kind = rnd.random()
            if kind < .45:
                pw, ph, a = rnd.uniform(14, 30) * scale, rnd.uniform(26, 50) * scale, rnd.uniform(0, math.pi)
                pts = [(x + dx * math.cos(a) - dy * math.sin(a), y + dx * math.sin(a) + dy * math.cos(a)) for dx, dy in ((-pw / 2, -ph / 2), (pw / 2, -ph / 2), (pw / 2, ph / 2), (-pw / 2, ph / 2))]
                poly(img, pts, c, rnd.randint(170, 235), blur)
            elif kind < .8:
                disc(img, x, y, rnd.uniform(7, 15) * scale, c, rnd.randint(170, 235), blur)
            else:
                pts = [(x + k * 9 * scale, y + math.sin(k * 1.4) * 9 * scale) for k in range(7)]
                line(img, pts, c, rnd.randint(170, 235), blur, int(6 * scale))
    return add_grain(img, 7, seed)


def neon_scene(size=(1200, 1500), seed=39):
    rnd = random.Random(seed)
    img = vertical_gradient(size, (20, 10, 38), (10, 6, 22))
    w, h = size
    for c, x, y, r in (((255, 60, 190), .25, .3, 330), ((60, 190, 255), .78, .62, 360), ((150, 70, 255), .5, .9, 300)):
        disc(img, w * x, h * y, r, c, 120, 130)
    for c, pts in (((255, 90, 210), curve_points((w * .1, h * .62), (w * .9, h * .38), (0, -260), 40)),
                   ((90, 210, 255), curve_points((w * .15, h * .78), (w * .85, h * .7), (0, 180), 40))):
        line(img, pts, c, 110, 14, 26)
        line(img, pts, c, 230, 2, 7)
        line(img, pts, (255, 240, 252), 230, .6, 2)
    for _ in range(60):
        disc(img, rnd.uniform(0, w), rnd.uniform(0, h), rnd.uniform(2, 7), rnd.choice([(255, 120, 220), (120, 220, 255), (255, 255, 255)]), rnd.randint(60, 160), 2)
    return add_grain(img, 6, seed)


def palm_scene(size=(1500, 1200), seed=41):
    rnd = random.Random(seed)
    img = vertical_gradient(size, (240, 245, 236), (226, 236, 226))
    w, h = size
    disc(img, w * .62, h * .4, 300, (252, 236, 206), 120, 110)
    for layer, (blur, count, tones) in enumerate(((8, 4, [(170, 200, 176), (186, 212, 186)]), (1.2, 5, [(44, 110, 84), (70, 136, 100), (98, 158, 116)]))):
        for _ in range(count):
            base = (rnd.choice([-80, w + 80, rnd.uniform(0, w)]), rnd.choice([h + 60, rnd.uniform(.4, 1) * h]))
            tip = (rnd.uniform(.15, .85) * w, rnd.uniform(.05, .6) * h)
            rib = curve_points(base, tip, (rnd.uniform(-200, 200), rnd.uniform(-200, 100)), 40)
            tone = rnd.choice(tones)
            line(img, rib, tone, 220, blur, 5)
            for i in range(6, len(rib) - 1):
                x, y = rib[i]
                (xa, ya), (xb, yb) = rib[i - 1], rib[i + 1]
                ang = math.atan2(yb - ya, xb - xa)
                ln = 190 * math.sin(math.pi * (i - 5) / (len(rib) - 5)) + 40
                for side in (-1, 1):
                    a = ang + side * 1.05
                    poly(img, leaf(x + math.cos(a) * ln / 2, y + math.sin(a) * ln / 2, ln, 22, a), tone, rnd.randint(190, 240), blur)
    return add_grain(img, 8, seed)


def terracotta_scene(size=(1200, 1500), seed=43):
    rnd = random.Random(seed)
    img = vertical_gradient(size, (246, 234, 220), (238, 220, 200))
    w, h = size
    cx, cy = w * .5, h * .78
    for r, c in ((560, (230, 190, 156)), (470, (212, 150, 112)), (380, (196, 112, 78)), (290, (236, 206, 176)), (200, (206, 132, 96))):
        stamp(img, lambda d, ox, oy, a, r=r: d.pieslice((cx - r + ox, cy - r + oy, cx + r + ox, cy + r + oy), 180, 360, fill=a), (cx - r, cy - r, cx + r, cy), c, 255, 1.2)
    disc(img, w * .5, h * .78 - 30, 110, (244, 214, 170), 255, 1.2)
    stamp(img, lambda d, ox, oy, a: d.rectangle((0 + ox, cy + oy, w + ox, h + oy), fill=a), (0, cy, w, h), (226, 200, 172), 255, 1)
    disc(img, w * .2, h * .2, 70, (212, 150, 112), 200, 1.2)
    for _ in range(30):
        disc(img, rnd.uniform(0, w), rnd.uniform(0, h * .45), rnd.uniform(2, 5), (198, 130, 96), rnd.randint(60, 140), .8)
    return add_grain(img, 12, seed)


def architecture_scene(size=(1800, 1200), seed=45):
    rnd = random.Random(seed)
    img = vertical_gradient(size, (236, 238, 242), (220, 224, 232))
    w, h = size
    planes = [((0, 0, w * .38, h), (212, 217, 226)), ((w * .38, 0, w * .62, h), (242, 243, 246)), ((w * .62, 0, w, h), (226, 230, 237))]
    for (x0, y0, x1, y1), c in planes:
        stamp(img, lambda d, ox, oy, a, b=(x0, y0, x1, y1): d.rectangle((b[0] + ox, b[1] + oy, b[2] + ox, b[3] + oy), fill=a), (x0, y0, x1, y1), c, 255, 1)
    poly(img, [(w * .38, 0), (w * .62, 0), (w * .95, h), (w * .6, h)], (250, 244, 234), 150, 30)
    poly(img, [(0, h * .72), (w * .38, h * .62), (w * .38, h), (0, h)], (196, 202, 214), 170, 6)
    for i in range(7):
        x = w * .64 + i * 52
        stamp(img, lambda d, ox, oy, a, x=x: d.rectangle((x + ox, h * .12 + oy, x + 20 + ox, h * .88 + oy), fill=a), (x, h * .12, x + 20, h * .88), (206, 212, 222), 200, 2)
    return add_grain(img, 6, seed)


def city_bokeh(size=(1800, 1200), seed=47):
    rnd = random.Random(seed)
    img = vertical_gradient(size, (14, 18, 34), (26, 26, 44))
    w, h = size
    for blur, count, rmin, rmax, alpha in ((34, 26, 80, 170, 80), (12, 46, 26, 70, 110), (3, 80, 5, 16, 180)):
        for _ in range(count):
            x, y = rnd.uniform(-50, w + 50), rnd.gauss(h * .58, h * .2)
            tone = rnd.choice([(255, 186, 110), (255, 214, 160), (120, 168, 255), (200, 214, 255), (255, 140, 110)])
            disc(img, x, y, rnd.uniform(rmin, rmax), tone, int(alpha * rnd.uniform(.5, 1)), blur)
    return add_grain(vignette(img, .45), 6, seed)


def clouds_scene(size=(1500, 1200), seed=49, sky=((206, 226, 244), (250, 236, 232))):
    rnd = random.Random(seed)
    img = vertical_gradient(size, sky[0], sky[1])
    w, h = size
    disc(img, w * .8, h * .75, 260, (255, 236, 214), 110, 100)
    for layer, (blur, count, alpha) in enumerate(((22, 5, 150), (6, 6, 235))):
        for _ in range(count):
            cx, cy, sc = rnd.uniform(-.05, 1.05) * w, rnd.uniform(.15, .85) * h, rnd.uniform(.7, 1.3)
            for _ in range(9):
                disc(img, cx + rnd.uniform(-170, 170) * sc, cy + rnd.uniform(-30, 30) * sc - abs(rnd.gauss(0, 30)), rnd.uniform(50, 105) * sc, (255, 255, 255), alpha, blur)
            stamp(img, lambda d, ox, oy, a, cx=cx, cy=cy, sc=sc: d.rectangle((cx - 200 * sc + ox, cy + oy, cx + 200 * sc + ox, cy + 60 * sc + oy), fill=a),
                  (cx - 200 * sc, cy, cx + 200 * sc, cy + 60 * sc), (255, 255, 255), alpha, blur + 14)
    return add_grain(img, 5, seed)


def silk_scene(size=(1500, 1200), seed=51, tones=((238, 214, 160), (214, 176, 108), (184, 142, 76), (250, 234, 196))):
    rnd = random.Random(seed)
    img = vertical_gradient(size, tones[0], tones[1])
    w, h = size
    for i in range(16):
        base, amp, freq, phase = rnd.uniform(-.1, 1.1) * h, rnd.uniform(60, 180), rnd.uniform(.6, 1.4), rnd.uniform(0, 6)
        top = [(x, base + amp * math.sin(x / w * math.pi * freq * 2 + phase)) for x in range(-20, w + 40, 20)]
        thick = rnd.uniform(40, 140)
        pts = top + [(x, y + thick) for x, y in reversed(top)]
        poly(img, pts, tones[rnd.choice([1, 2, 3, 3])], rnd.randint(70, 150), rnd.uniform(18, 40))
    for i in range(5):
        base, amp, phase = rnd.uniform(.1, .9) * h, rnd.uniform(80, 160), rnd.uniform(0, 6)
        pts = [(x, base + amp * math.sin(x / w * math.pi * 2 + phase)) for x in range(-20, w + 40, 20)]
        line(img, pts, (255, 248, 230), 140, 10, 14)
    return add_grain(img, 6, seed)


def blossom_branch(size=(1500, 1200), seed=53):
    rnd = random.Random(seed)
    img = vertical_gradient(size, (246, 244, 246), (238, 240, 246))
    w, h = size
    for _ in range(16):
        disc(img, rnd.uniform(0, w), rnd.uniform(0, h), rnd.uniform(40, 110), rnd.choice([(248, 214, 222), (244, 226, 232)]), 120, 40)
    branches = [curve_points((-40, h * .3), (w * .78, h * .12), (0, 140), 36), curve_points((w * .3, h * .24), (w * .55, h * .55), (60, 0), 20),
                curve_points((w + 40, h * .78), (w * .35, h * .92), (0, -90), 30)]
    for br in branches:
        line(img, br, (112, 86, 74), 235, 1, 9)
        for i in range(3, len(br), 3):
            x, y = br[i]
            for _ in range(2):
                fx, fy = x + rnd.uniform(-30, 30), y + rnd.uniform(-34, 22)
                rr = rnd.uniform(15, 24)
                tone = rnd.choice([(246, 190, 204), (236, 160, 180), (250, 214, 222)])
                for k in range(5):
                    a = k * 2 * math.pi / 5 + rnd.uniform(0, .3)
                    disc(img, fx + math.cos(a) * rr * .8, fy + math.sin(a) * rr * .8, rr * .62, tone, 235, .8)
                disc(img, fx, fy, rr * .28, (200, 120, 110), 240, .6)
    return add_grain(img, 7, seed)


def balloons_scene(size=(1200, 1500), seed=55):
    rnd = random.Random(seed)
    img = vertical_gradient(size, (234, 240, 248), (252, 240, 236))
    w, h = size
    tones = [(244, 176, 190), (160, 214, 204), (250, 214, 150), (200, 186, 236), (240, 150, 150)]
    for layer, (blur, count, sc) in enumerate(((12, 6, .7), (1, 6, 1.0))):
        for _ in range(count):
            cx, cy = rnd.uniform(.1, .9) * w, rnd.uniform(.12, .7) * h
            rx, ry = 110 * sc, 136 * sc
            c = rnd.choice(tones)
            line(img, curve_points((cx, cy + ry), (cx + rnd.uniform(-60, 60), h + 20), (rnd.uniform(-40, 40), 0), 20), (150, 146, 160), 150, blur, 2)
            stamp(img, lambda d, ox, oy, a, cx=cx, cy=cy, rx=rx, ry=ry: d.ellipse((cx - rx + ox, cy - ry + oy, cx + rx + ox, cy + ry + oy), fill=a), (cx - rx, cy - ry, cx + rx, cy + ry), c, 245, blur)
            disc(img, cx - rx * .35, cy - ry * .4, rx * .28, (255, 255, 255), 110, 14 + blur)
    return add_grain(img, 6, seed)


def save(img, name, quality=80):
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / f"{name}.webp"
    img.save(path, "WEBP", quality=quality, method=6)
    if path.stat().st_size > 90 * 1024:  # korrelige beelden iets sterker comprimeren
        img.save(path, "WEBP", quality=quality - 12, method=6)
    small = img.resize((1000, round(img.height * 1000 / img.width)), Image.LANCZOS)
    small_path = OUT / f"{name}-1000.webp"
    small.save(small_path, "WEBP", quality=quality, method=6)
    if small_path.stat().st_size > 40 * 1024:
        small.save(small_path, "WEBP", quality=quality - 12, method=6)
    print(f"{path.relative_to(OUT.parent.parent.parent)}  {img.size[0]}x{img.size[1]}  {path.stat().st_size // 1024} KB")


# Beelden voor de eerste drie ontwerpen.
SCENES = {
    "waterverf-bloesem": lambda: watercolor(),
    "waterverf-lavendel": lambda: watercolor(size=(1500, 1000), seed=8, palette=[(222, 214, 236), (190, 172, 214), (150, 128, 184), (205, 218, 196), (247, 232, 222)], stems=False),
    "goud-lichtjes": lambda: bokeh_gold(),
    "kaarslicht": lambda: candlelight(),
    "duinen-ochtend": lambda: dunes(),
    "zee-horizon": lambda: sea(),
    "bloemblaadjes": lambda: petals(),
    "duinen-staand": lambda: dunes(size=(1200, 1500), seed=13, sky=((232, 222, 214), (198, 208, 214)), sand=((214, 206, 196), (186, 176, 164), (160, 150, 140))),
}
# Beelden voor de Atelier-ontwerpen.
SCENES.update({
    "eucalyptus": lambda: eucalyptus_scene(),
    "pampas": lambda: pampas_scene(),
    "sterrenhemel": lambda: starry_sky(),
    "confetti": lambda: confetti_scene(),
    "neon": lambda: neon_scene(),
    "palmbladeren": lambda: palm_scene(),
    "terracotta": lambda: terracotta_scene(),
    "architectuur": lambda: architecture_scene(),
    "stadslicht": lambda: city_bokeh(),
    "wolken": lambda: clouds_scene(),
    "zijde-goud": lambda: silk_scene(),
    "zijde-zilver": lambda: silk_scene(seed=57, tones=((226, 230, 236), (186, 194, 206), (150, 160, 176), (246, 248, 250))),
    "rozen": lambda: watercolor(seed=59, palette=[(196, 62, 84), (222, 112, 124), (240, 172, 172), (150, 42, 62), (246, 224, 218), (214, 150, 150)]),
    "bloesemtak": lambda: blossom_branch(),
    "ballonnen": lambda: balloons_scene(),
})


if __name__ == "__main__":
    import sys

    wanted = sys.argv[1:] or list(SCENES)
    for name in wanted:
        save(SCENES[name](), name)
