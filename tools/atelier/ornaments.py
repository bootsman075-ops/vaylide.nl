"""Tekent de versieringen (SVG) voor de Atelier-ontwerpen.

Schrijft designs/_atelier/v1/ornaments/<naam>.html. Kleuren komen uit de huidige
tekstkleur (currentColor) en de klassen c1, c2 en c3 (zie atelier.css).
Opnieuw maken: .venv/bin/python tools/atelier/ornaments.py
"""
from __future__ import annotations

import math
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent.parent / "designs" / "_atelier" / "v1" / "ornaments"


def f(x: float) -> str:
    return f"{x:.1f}".rstrip("0").rstrip(".")


def svg(body: str, w=240, h=64, flip=False, cls="") -> str:
    classes = "a-orn__svg" + (" a-orn__svg--flip" if flip else "") + (f" {cls}" if cls else "")
    return (f'<svg class="{classes}" viewBox="0 0 {w} {h}" width="{w}" height="{h}" focusable="false" '
            f'fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">{body}</svg>\n')


def leaf(x, y, length, width, angle) -> str:
    """Spits blad vanaf (x, y) in richting angle (graden)."""
    a = math.radians(angle)
    ca, sa = math.cos(a), math.sin(a)

    def p(u, v):
        return f(x + u * ca - v * sa), f(y + u * sa + v * ca)

    x1, y1 = p(length * .35, -width)
    x2, y2 = p(length * .8, -width * .7)
    x3, y3 = p(length, 0)
    x4, y4 = p(length * .8, width * .7)
    x5, y5 = p(length * .35, width)
    return f'<path d="M{f(x)} {f(y)}C{x1} {y1} {x2} {y2} {x3} {y3}C{x4} {y4} {x5} {y5} {f(x)} {f(y)}Z"/>'


def mirror_pts(items):
    return items + [(240 - x, y, -dx if dx else dx) for x, y, dx in items]


def eucalyptus() -> str:
    body = ['<path d="M18 36C58 33 92 30 120 32C148 30 182 33 222 36"/>']
    leaves = []
    for i, x in enumerate([34, 48, 62, 76, 90, 104]):
        y_stem = 36 - (x - 18) * 0.03
        up = i % 2 == 0
        cy = y_stem - 7.5 if up else y_stem + 7.5
        r = 5.2 + i * 0.35
        for cx in (x, 240 - x):
            leaves.append(f'<ellipse cx="{f(cx)}" cy="{f(cy)}" rx="{f(r)}" ry="{f(r * .82)}"/>')
            leaves.append(f'<path d="M{f(cx)} {f(y_stem)}L{f(cx)} {f(cy + (r * .8 if up else -r * .8))}"/>')
    body.append('<g class="a-orn__fill">' + "".join(leaves) + "</g>")
    body.append('<circle cx="120" cy="32" r="2.4" fill="currentColor" stroke="none"/>')
    return svg("".join(body), flip=True)


def botanisch() -> str:
    body = ['<path d="M14 44C58 42 92 32 120 16C148 32 182 42 226 44"/>']
    specs = [(40, 43, 150), (58, 40, 205), (74, 36, 145), (90, 30, 210), (104, 23, 150)]
    for x, y, ang in specs:
        body.append(leaf(x, y, 16, 5, ang - 180 if ang > 180 else ang - 180))
        body.append(leaf(240 - x, y, 16, 5, -(ang - 180 if ang > 180 else ang - 180) + 180))
    body.append('<circle cx="120" cy="14" r="3" fill="currentColor" stroke="none"/>')
    return svg("".join(body), flip=True)


def bloemen() -> str:
    parts = []
    # Midden: bloem met vijf blaadjes
    for k in range(5):
        a = k * 72 - 90
        parts.append(f'<ellipse cx="120" cy="{f(20)}" rx="5.5" ry="10" transform="rotate({a + 90} 120 32) translate(0 0)"/>')
    petals = []
    for k in range(5):
        a = math.radians(k * 72 - 90)
        cx, cy = 120 + math.cos(a) * 9, 32 + math.sin(a) * 9
        petals.append(f'<ellipse cx="{f(cx)}" cy="{f(cy)}" rx="6.5" ry="4.6" transform="rotate({f(k * 72)} {f(cx)} {f(cy)})"/>')
    body = ['<g class="a-orn__fill">' + "".join(petals) + "</g>", '<circle class="c2f" cx="120" cy="32" r="3.6" stroke="none"/>']
    # Stengels met blad en knopjes
    body.append('<path d="M104 34C88 38 70 36 52 30M136 34C152 38 170 36 188 30"/>')
    for x, y, ang in [(84, 37, 200), (66, 34, 160)]:
        body.append(leaf(x, y, 13, 4.2, ang))
        body.append(leaf(240 - x, y, 13, 4.2, 180 - ang))
    for cx in (48, 192):
        body.append(f'<circle class="c2f" cx="{cx}" cy="29" r="3.4" stroke="none"/><circle cx="{cx}" cy="29" r="3.4"/>')
    body.append('<path d="M28 33H40M200 33H212"/>')
    return svg("".join(body))


def pampas() -> str:
    body = []
    stems = [(-18, 58), (0, 52), (18, 58)]
    for tilt, length in stems:
        a = math.radians(-90 + tilt)
        x0, y0 = 120, 62
        x1, y1 = x0 + math.cos(a) * length, y0 + math.sin(a) * length
        body.append(f'<path d="M{f(x0)} {f(y0)}Q{f(x0 + tilt * .2)} {f(y0 - length * .5)} {f(x1)} {f(y1)}"/>')
        n = 11
        for i in range(2, n):
            t = i / n
            px, py = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            span = 3 + 6 * math.sin(math.pi * t)
            for side in (-1, 1):
                b = a + side * math.radians(55)
                qx, qy = px + math.cos(b) * span, py + math.sin(b) * span
                body.append(f'<path d="M{f(px)} {f(py)}L{f(qx)} {f(qy)}" stroke-width=".9"/>')
    body.append('<path d="M60 62H104M136 62H180" stroke-width=".9"/>')
    return svg("".join(body), h=66)


def palm() -> str:
    body = ['<path d="M24 40C70 30 110 26 216 30"/>']
    for i in range(1, 15):
        t = i / 15
        x = 24 + (216 - 24) * t
        y = 40 - 10 * math.sin(t * math.pi * .5) + (0 if t < .5 else 0)
        length = 8 + 12 * math.sin(math.pi * t)
        for side in (-1, 1):
            ex, ey = x + length * .6, y + side * length
            body.append(f'<path d="M{f(x)} {f(y)}Q{f(x + length * .2)} {f(y + side * length * .6)} {f(ex)} {f(ey)}"/>')
    return svg("".join(body))


def lauwerkrans() -> str:
    body = []
    cx, cy, r = 100, 100, 76
    leaves = []
    for side in (-1, 1):
        start, end = 108, 256
        pts = []
        for k in range(0, 41):
            deg = start + (end - start) * k / 40
            a = math.radians(deg if side < 0 else 180 - deg)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
        body.append('<path d="M' + " L".join(f"{f(x)} {f(y)}" for x, y in pts) + '"/>')
        for k in range(1, 40, 3):
            deg = start + (end - start) * k / 40
            a = math.radians(deg if side < 0 else 180 - deg)
            x, y = cx + r * math.cos(a), cy + r * math.sin(a)
            tangent = math.degrees(a) + (90 if side > 0 else -90)
            size = 20 - (k / 40) * 8
            leaves.append(leaf(x, y, size, size * .36, tangent - 38 * side))
            leaves.append(leaf(x, y, size, size * .36, tangent + 180 + 38 * side))
    body.append('<g class="a-orn__fill">' + "".join(leaves) + "</g>")
    body.append('<path d="M84 186C94 179 106 179 116 186M91 177L109 192M109 177L91 192" stroke-width="1.2"/>')
    return svg("".join(body), w=200, h=200)


def deco() -> str:
    body = []
    cx, cy = 120, 52
    for k in range(9):
        a = math.radians(180 + k * 22.5)
        body.append(f'<path d="M{cx} {cy}L{f(cx + 30 * math.cos(a))} {f(cy + 30 * math.sin(a))}"/>')
    body.append(f'<path d="M{cx - 30} {cy}A30 30 0 0 1 {cx + 30} {cy}"/><path d="M{cx - 38} {cy}A38 38 0 0 1 {cx + 38} {cy}" stroke-width=".9"/>')
    for side in (-1, 1):
        x0 = cx + side * 44
        body.append(f'<path d="M{x0} {cy}H{x0 + side * 70}M{x0} {cy - 6}H{x0 + side * 56}M{x0} {cy - 12}H{x0 + side * 40}" stroke-width="1"/>')
        body.append(f'<path d="M{x0 + side * 74} {cy - 3}l{side * 4} 3l{-side * 4} 3l{-side * 4} -3z" fill="currentColor"/>')
    body.append(f'<path d="M{cx - 60} {cy + 4}H{cx + 60}" stroke-width=".8"/>')
    return svg("".join(body), flip=True)


def geometrisch() -> str:
    body = ['<path d="M120 16L136 32L120 48L104 32Z"/><path d="M120 24L128 32L120 40L112 32Z" fill="currentColor"/>',
            '<path d="M20 32H92M148 32H220"/>',
            '<path d="M92 32l6-5l6 5l-6 5z"/><path d="M148 32l-6-5l-6 5l6 5z"/>',
            '<circle cx="18" cy="32" r="2" fill="currentColor" stroke="none"/><circle cx="222" cy="32" r="2" fill="currentColor" stroke="none"/>']
    return svg("".join(body), flip=True)


def star(cx, cy, r, points=5, inner=.45) -> str:
    pts = []
    for k in range(points * 2):
        rr = r if k % 2 == 0 else r * inner
        a = math.radians(-90 + k * 180 / points)
        pts.append(f"{f(cx + rr * math.cos(a))} {f(cy + rr * math.sin(a))}")
    return "M" + " L".join(pts) + "Z"


def sparkle(cx, cy, r) -> str:
    return (f"M{f(cx)} {f(cy - r)}Q{f(cx + r * .15)} {f(cy - r * .15)} {f(cx + r)} {f(cy)}"
            f"Q{f(cx + r * .15)} {f(cy + r * .15)} {f(cx)} {f(cy + r)}"
            f"Q{f(cx - r * .15)} {f(cy + r * .15)} {f(cx - r)} {f(cy)}"
            f"Q{f(cx - r * .15)} {f(cy - r * .15)} {f(cx)} {f(cy - r)}Z")


def crescent(cx, cy, r, dx, dy, r2) -> str:
    """Maansikkel: cirkel (cx, cy, r) min een verschoven cirkel (cx + dx, cy + dy, r2)."""
    d = math.hypot(dx, dy)
    a = (r * r - r2 * r2 + d * d) / (2 * d)
    h = math.sqrt(max(r * r - a * a, 0))
    ux, uy = dx / d, dy / d
    px, py = cx + a * ux, cy + a * uy
    x1, y1 = px - h * uy, py + h * ux
    x2, y2 = px + h * uy, py - h * ux
    return (f"M{f(x1)} {f(y1)}A{f(r)} {f(r)} 0 1 1 {f(x2)} {f(y2)}"
            f"A{f(r2)} {f(r2)} 0 1 0 {f(x1)} {f(y1)}Z")


def sterren() -> str:
    body = [f'<path d="{crescent(120, 32, 15, 7, -5, 13)}" fill="currentColor" stroke="none"/>']
    for x, y, r in [(80, 24, 6), (160, 20, 5), (60, 42, 3.6), (184, 40, 4.2), (100, 50, 2.8), (148, 50, 3)]:
        body.append(f'<path class="c2f" d="{star(x, y, r)}" stroke="none"/>')
    for x, y in [(36, 30), (204, 28), (112, 10), (70, 12), (176, 54)]:
        body.append(f'<circle cx="{x}" cy="{y}" r="1.4" fill="currentColor" stroke="none"/>')
    return svg("".join(body))


def confetti() -> str:
    body = []
    shapes = [
        ("c", 22, 30, 3.2, "c1"), ("t", 40, 38, 6, "c2"), ("s", 58, 24, 0, "c3"), ("r", 78, 36, 20, "c1"),
        ("c", 96, 22, 2.6, "c3"), ("t", 112, 40, 5, "c1"), ("s", 128, 26, 0, "c2"), ("c", 146, 36, 3.4, "c2"),
        ("r", 162, 24, -25, "c3"), ("t", 180, 36, 6, "c3"), ("s", 198, 28, 0, "c1"), ("c", 218, 34, 2.8, "c2"),
    ]
    for kind, x, y, v, cls in shapes:
        if kind == "c":
            body.append(f'<circle class="{cls}f" cx="{x}" cy="{y}" r="{v}" stroke="none"/>')
        elif kind == "t":
            body.append(f'<path class="{cls}f" d="M{x} {y - v}L{f(x + v * .9)} {f(y + v * .6)}L{f(x - v * .9)} {f(y + v * .6)}Z" stroke="none"/>')
        elif kind == "r":
            body.append(f'<rect class="{cls}f" x="{x - 5}" y="{y - 2}" width="10" height="4" rx="1" transform="rotate({v} {x} {y})" stroke="none"/>')
        else:
            body.append(f'<path class="{cls}s" d="M{x - 8} {y}q2 -5 4 0t4 0t4 0t4 0" stroke-width="2"/>')
    return svg("".join(body))


def ballonnen() -> str:
    body = []
    for x, y, cls, sway in [(96, 24, "c2", -1), (120, 18, "c1", 1), (144, 26, "c3", -1)]:
        body.append(f'<ellipse class="{cls}f" cx="{x}" cy="{y}" rx="10" ry="12.5" stroke="none"/>')
        body.append(f'<path class="{cls}f" d="M{x - 2.5} {y + 13.5}L{x + 2.5} {y + 13.5}L{x} {y + 11}Z" stroke="none"/>')
        body.append(f'<path d="M{x} {y + 14}q{sway * 5} 6 0 12t{sway * 4} 12" stroke-width="1"/>')
        body.append(f'<path d="M{x - 5} {y - 6}q2 -3 5 -3" stroke="#fff" stroke-opacity=".7" stroke-width="1.6"/>')
    body.append('<path d="M40 44H76M164 44H200" stroke-width=".9"/>')
    return svg("".join(body), h=72)


def heart(cx, cy, s) -> str:
    return (f"M{f(cx)} {f(cy + s * .9)}C{f(cx - s * 1.4)} {f(cy)} {f(cx - s * .8)} {f(cy - s * 1.1)} {f(cx)} {f(cy - s * .35)}"
            f"C{f(cx + s * .8)} {f(cy - s * 1.1)} {f(cx + s * 1.4)} {f(cy)} {f(cx)} {f(cy + s * .9)}Z")


def harten() -> str:
    body = [f'<path class="c1f" d="{heart(120, 32, 10)}" stroke="none"/>',
            f'<path d="{heart(92, 34, 6)}"/>', f'<path d="{heart(148, 34, 6)}"/>',
            '<path d="M24 36C44 30 60 40 78 34M162 34C180 40 196 30 216 36" stroke-dasharray="2 5"/>']
    return svg("".join(body))


def zon() -> str:
    body = ['<path d="M92 50A28 28 0 0 1 148 50Z" class="c1f" stroke="none"/>', '<path d="M40 50H200"/>']
    for k in range(9):
        a = math.radians(180 + 15 + k * 18.75)
        body.append(f'<path d="M{f(120 + 34 * math.cos(a))} {f(50 + 34 * math.sin(a))}L{f(120 + 44 * math.cos(a))} {f(50 + 44 * math.sin(a))}"/>')
    body.append('<path d="M70 56H170" stroke-width=".9"/>')
    return svg("".join(body))


def golven() -> str:
    body = []
    for i, y in enumerate([22, 32, 42]):
        d = f"M20 {y}" + "".join(f"q12.5 {-6 if k % 2 == 0 else 6} 25 0" for k in range(8))
        body.append(f'<path d="{d}" stroke-width="{1.3 - i * .15:.2f}"/>')
    return svg("".join(body), flip=True)


def cloud(cx, cy, s) -> str:
    return (f"M{f(cx - s * 2.2)} {f(cy + s * .6)}"
            f"A{f(s * .9)} {f(s * .9)} 0 0 1 {f(cx - s * 1.4)} {f(cy - s * .6)}"
            f"A{f(s * 1.2)} {f(s * 1.2)} 0 0 1 {f(cx + s * .4)} {f(cy - s * 1.1)}"
            f"A{f(s)} {f(s)} 0 0 1 {f(cx + s * 2)} {f(cy - s * .1)}"
            f"A{f(s * .75)} {f(s * .75)} 0 0 1 {f(cx + s * 2.2)} {f(cy + s * .6)}Z")


def wolken() -> str:
    body = [f'<path class="c2f" d="{cloud(84, 36, 10)}" stroke-width="1.2"/>', f'<path class="c3f" d="{cloud(156, 30, 8)}" stroke-width="1.2"/>',
            f'<path d="{star(120, 18, 4)}" fill="currentColor" stroke="none"/>', '<circle cx="46" cy="24" r="1.6" fill="currentColor" stroke="none"/><circle cx="198" cy="44" r="1.6" fill="currentColor" stroke="none"/>']
    return svg("".join(body))


def regenboog() -> str:
    body = []
    for i, cls in enumerate(["c1", "c2", "c3"]):
        r = 36 - i * 9
        body.append(f'<path class="{cls}s" d="M{120 - r} 58A{r} {r} 0 0 1 {120 + r} 58" stroke-width="7"/>')
    body.append(f'<path d="{cloud(76, 54, 5)}" fill="var(--a-bg)"/><path d="{cloud(164, 54, 5)}" fill="var(--a-bg)"/>')
    return svg("".join(body), h=66)


def ringen() -> str:
    body = ['<circle cx="110" cy="36" r="15"/><circle cx="130" cy="36" r="15"/>',
            f'<path class="c2f" d="{sparkle(120, 12, 6)}" stroke="none"/>',
            '<path d="M40 36H86M154 36H200" stroke-width=".9"/><circle cx="36" cy="36" r="1.8" fill="currentColor" stroke="none"/><circle cx="204" cy="36" r="1.8" fill="currentColor" stroke="none"/>']
    return svg("".join(body))


def lijnen() -> str:
    body = ['<path d="M40 30H108M132 30H200"/><path d="M40 36H108M132 36H200" stroke-width=".7"/>',
            '<circle cx="120" cy="33" r="3.2" fill="currentColor" stroke="none"/>']
    return svg("".join(body), flip=True)


def fonkel() -> str:
    body = []
    for x, y, r, cls in [(120, 30, 12, "c1f"), (94, 20, 6, "c2f"), (146, 42, 7, "c2f"), (74, 38, 4, "c1f"), (166, 18, 4.5, "c1f"), (52, 26, 2.8, "c2f"), (188, 32, 3, "c2f")]:
        body.append(f'<path class="{cls}" d="{sparkle(x, y, r)}" stroke="none"/>')
    return svg("".join(body))


def stippen() -> str:
    body = []
    xs = [30, 48, 66, 84, 102, 120, 138, 156, 174, 192, 210]
    for i, x in enumerate(xs):
        r = 2 + 3.2 * math.sin(math.pi * (i + .5) / len(xs))
        cls = ["c1f", "c2f", "c3f"][i % 3]
        body.append(f'<circle class="{cls}" cx="{x}" cy="{32 + (4 if i % 2 else -4)}" r="{f(r)}" stroke="none"/>')
    return svg("".join(body))


ORNAMENTS = {
    "eucalyptus": eucalyptus, "botanisch": botanisch, "bloemen": bloemen, "pampas": pampas, "palm": palm,
    "lauwerkrans": lauwerkrans, "deco": deco, "geometrisch": geometrisch, "sterren": sterren, "confetti": confetti,
    "ballonnen": ballonnen, "harten": harten, "zon": zon, "golven": golven, "wolken": wolken, "regenboog": regenboog,
    "ringen": ringen, "lijnen": lijnen, "fonkel": fonkel, "stippen": stippen,
}

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in ORNAMENTS.items():
        (OUT / f"{name}.html").write_text(fn(), encoding="utf-8")
    print(len(ORNAMENTS), "versieringen geschreven naar", OUT)
