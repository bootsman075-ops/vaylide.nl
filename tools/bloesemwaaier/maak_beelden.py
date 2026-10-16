"""Tekent de beelden van het ontwerp Bloesemwaaier (SVG, eigen tekenwerk).

Schrijft naar designs/bloesemwaaier/v1/:
- waaier.svg        het beschilderde waaierpapier (kersentak met bloesem, goudrand)
- stok.svg          een balein van de waaier (het deel onder het papier)
- stok-buiten.svg   de gouden buitenste balein
- kwast.svg         het kwastje met knoop en parel
- ornament.svg      kleine waaier boven de koppen (masker; de kleur komt uit de stijl)
- scene-lucht.html  wolken en hangende bloesemtakken boven in de kop
- scene-land.html   bergen, paviljoen, brug, waterval, vijver en bloesem onderin

De twee scene-bestanden staan als SVG in de pagina, zodat de kleuren uit de
kleurvariant komen (klassen wa-f-*, wa-c-* en wa-b* in style.css). De waaier zelf
heeft vaste kleuren: ivoor papier, roze bloesem en goud.

Alles is getekend met eenvoudige vormen; er zijn geen foto's of beelden van
anderen gebruikt. Het toeval heeft een vast startgetal: opnieuw draaien geeft
dezelfde beelden.

    .venv/bin/python tools/bloesemwaaier/maak_beelden.py
"""
from __future__ import annotations

import math
import random
import re
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent.parent / "designs" / "bloesemwaaier" / "v1"

HEADER = "{# Gemaakt met tools/bloesemwaaier/maak_beelden.py; niet met de hand aanpassen. #}\n"


def f(x: float) -> str:
    s = f"{x:.1f}"
    if s.endswith(".0"):
        s = s[:-2]
    return "0" if s == "-0" else s


def rot(x, y, deg, cx=0.0, cy=0.0):
    a = math.radians(deg)
    dx, dy = x - cx, y - cy
    return cx + dx * math.cos(a) - dy * math.sin(a), cy + dx * math.sin(a) + dy * math.cos(a)


# ---------------------------------------------------------------- bloemvormen

# Een kersenbloemblad met het inkepinkje aan de punt, wijzend naar boven (lengte 10).
PETAL = [(0, 0), (-3.2, -2.2), (-5.4, -6.4), (-3.6, -9.2), (-2.6, -10.4), (-1.2, -10.2), (0, -8.9),
         (1.2, -10.2), (2.6, -10.4), (3.6, -9.2), (5.4, -6.4), (3.2, -2.2), (0, 0)]


def petal_path(deg=0.0, scale=1.0, dx=0.0, dy=0.0) -> str:
    pts = [rot(x * scale, y * scale, deg) for x, y in PETAL]
    pts = [(x + dx, y + dy) for x, y in pts]
    d = f"M{f(pts[0][0])} {f(pts[0][1])}"
    for i in range(1, len(pts), 3):
        (x1, y1), (x2, y2), (x3, y3) = pts[i:i + 3]
        d += f"C{f(x1)} {f(y1)} {f(x2)} {f(y2)} {f(x3)} {f(y3)}"
    return d + "Z"


def flower_path(scale=1.0, dx=0.0, dy=0.0, turn=0.0) -> str:
    return "".join(petal_path(turn + k * 72, scale, dx, dy) for k in range(5))


# ---------------------------------------------------------------- de waaier

R_IN, R_OUT, SPREAD = 400, 975, 75  # papier van straal 400 tot 975, van -75 tot 75 graden


def polar(r, deg):
    """Punt op straal r en hoek deg (0 = recht omhoog, positief = naar rechts); draaipunt is (0, 0)."""
    a = math.radians(deg)
    return r * math.sin(a), -r * math.cos(a)


def sector(r1, r2, a1=-SPREAD, a2=SPREAD) -> str:
    p1, p2, p3, p4 = polar(r1, a1), polar(r2, a1), polar(r2, a2), polar(r1, a2)
    return (f"M{f(p1[0])} {f(p1[1])}L{f(p2[0])} {f(p2[1])}A{r2} {r2} 0 0 1 {f(p3[0])} {f(p3[1])}"
            f"L{f(p4[0])} {f(p4[1])}A{r1} {r1} 0 0 0 {f(p1[0])} {f(p1[1])}Z")


def arc(r, a1=-SPREAD, a2=SPREAD) -> str:
    p1, p2 = polar(r, a1), polar(r, a2)
    return f"M{f(p1[0])} {f(p1[1])}A{r} {r} 0 0 1 {f(p2[0])} {f(p2[1])}"


def branch(rng, points, width, out, twigs=True):
    """Een tak langs punten, steeds dunner; geeft de knopen terug voor bloesem."""
    nodes = []
    for i in range(len(points) - 1):
        (x0, y0), (x1, y1) = points[i], points[i + 1]
        w = width * (1 - i / len(points)) + 1.2
        mx, my = (x0 + x1) / 2 + rng.uniform(-14, 14), (y0 + y1) / 2 + rng.uniform(-14, 14)
        out.append(f'<path d="M{f(x0)} {f(y0)}Q{f(mx)} {f(my)} {f(x1)} {f(y1)}" stroke-width="{f(w)}"/>')
        nodes.append((x1, y1, w))
    return nodes


def fan_paper() -> str:
    rng = random.Random(7)
    parts = []
    defs = f"""<defs>
<clipPath id="p"><path d="{sector(R_IN, R_OUT)}"/></clipPath>
<radialGradient id="papier" cx="0" cy="0" r="1000" gradientUnits="userSpaceOnUse">
<stop offset=".38" stop-color="#f3e2cc"/><stop offset=".62" stop-color="#fbf3e7"/><stop offset=".9" stop-color="#f9eedf"/><stop offset="1" stop-color="#efd8bd"/></radialGradient>
<radialGradient id="roze" cx="-430" cy="-700" r="520" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#f7c7cf" stop-opacity=".75"/><stop offset="1" stop-color="#f7c7cf" stop-opacity="0"/></radialGradient>
<radialGradient id="zacht" cx="420" cy="-520" r="420" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#fbe3c4" stop-opacity=".8"/><stop offset="1" stop-color="#fbe3c4" stop-opacity="0"/></radialGradient>
<linearGradient id="goud" x1="0" y1="-1000" x2="0" y2="-300" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#f5dc9c"/><stop offset=".5" stop-color="#c9973f"/><stop offset="1" stop-color="#ecc77a"/></linearGradient>
<linearGradient id="berg" x1="0" y1="-640" x2="0" y2="-420" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#c7a7ad" stop-opacity=".55"/><stop offset="1" stop-color="#c7a7ad" stop-opacity="0"/></linearGradient>
<symbol id="b" viewBox="-10.5 -10.5 21 21" overflow="visible"><path d="{flower_path(1.0)}"/></symbol>
<radialGradient id="hart"><stop offset="0" stop-color="#d4567a" stop-opacity=".9"/><stop offset=".55" stop-color="#e98aa3" stop-opacity=".35"/><stop offset="1" stop-color="#f4b6c4" stop-opacity="0"/></radialGradient>
</defs>"""
    parts.append(f'<path d="{sector(R_IN, R_OUT)}" fill="url(#papier)"/>')
    parts.append('<g clip-path="url(#p)">')
    parts.append(f'<rect x="-1000" y="-1000" width="2000" height="1000" fill="url(#roze)"/>')
    parts.append(f'<rect x="-1000" y="-1000" width="2000" height="1000" fill="url(#zacht)"/>')
    # Inktbergen in de verte, rechts onderin het papier.
    peaks = "M150 -420"
    x = 150
    while x < 980:
        h = rng.uniform(90, 210)
        w = rng.uniform(60, 120)
        peaks += f"Q{f(x + w * .45)} {f(-420 - h * 1.25)} {f(x + w)} {f(-420 - h * .35)}"
        x += w
    peaks += "L980 -400L150 -400Z"
    parts.append(f'<path d="{peaks}" fill="url(#berg)"/>')
    # Goudspikkels in het papier.
    for _ in range(90):
        r = rng.uniform(R_IN + 30, R_OUT - 40)
        a = rng.uniform(-SPREAD + 3, SPREAD - 3)
        x, y = polar(r, a)
        parts.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(rng.uniform(1.4, 4.2))}" fill="#d6ad5c" opacity="{f(rng.uniform(.35, .85))}"/>')

    # Takken: een grote van links onder naar rechts boven, een kleinere van rechts.
    sticks = []
    main = [(-940, -250), (-760, -420), (-560, -560), (-360, -700), (-150, -790), (60, -840), (270, -835), (470, -770), (620, -700)]
    nodes = branch(rng, main, 26, sticks)
    side = [
        [(-760, -420), (-640, -380), (-520, -400)],
        [(-560, -560), (-560, -700), (-500, -840), (-440, -900)],
        [(-360, -700), (-260, -640), (-150, -600)],
        [(-150, -790), (-100, -880), (-20, -930)],
        [(60, -840), (140, -760), (250, -700), (330, -690)],
        [(270, -835), (330, -900), (410, -930)],
        [(470, -770), (560, -820), (650, -830)],
    ]
    for pts in side:
        nodes += branch(rng, pts, 11, sticks)
    right = [(960, -300), (830, -380), (700, -480), (560, -540)]
    nodes += branch(rng, right, 16, sticks)
    nodes += branch(rng, [(830, -380), (800, -500), (820, -600)], 8, sticks)
    parts.append('<g fill="none" stroke="#5d3b2f" stroke-linecap="round">' + "".join(sticks) + "</g>")
    # Een lichte rand op de takken.
    parts.append('<g fill="none" stroke="#8b6450" stroke-linecap="round" opacity=".55" transform="translate(-2 -3)">'
                 + "".join(re.sub(r'stroke-width="([\d.]+)"', lambda m: f'stroke-width="{f(float(m.group(1)) * .3)}"', s) for s in sticks)
                 + "</g>")

    # Blaadjes.
    leaves = []
    for x, y, w in rng.sample(nodes, 16):
        a = rng.uniform(0, 360)
        lx, ly = rot(0, -46, a)
        leaves.append(f'<path d="M{f(x)} {f(y)}Q{f(x + lx * .5 + 14)} {f(y + ly * .5 - 10)} {f(x + lx)} {f(y + ly)}'
                      f'Q{f(x + lx * .5 - 14)} {f(y + ly * .5 + 10)} {f(x)} {f(y)}Z"/>')
    parts.append('<g fill="#8a7a48" opacity=".75">' + "".join(leaves) + "</g>")

    # Bloesem langs de takken: lichte bloemen, met een dieproze hart en meeldraden.
    colors = ["#f7c3cf", "#f4b0c1", "#fad5dc", "#f0a2b6"]
    flowers, hearts, lines, dots, buds = [], [], [], [], []
    spots = []
    for x, y, w in nodes:
        for _ in range(rng.randint(1, 3)):
            spots.append((x + rng.uniform(-62, 62), y + rng.uniform(-52, 52), rng.uniform(2.9, 5.6)))
    for x, y, s in spots:
        r, a = math.hypot(x, y), math.degrees(math.atan2(x, -y))
        if not (R_IN + 40 < r < R_OUT - 50 and -SPREAD + 6 < a < SPREAD - 6):
            continue
        turn = rng.uniform(0, 72)
        flowers.append(f'<use href="#b" x="{f(x - 10.5 * s)}" y="{f(y - 10.5 * s)}" width="{f(21 * s)}" height="{f(21 * s)}"'
                       f' fill="{rng.choice(colors)}" transform="rotate({f(turn)} {f(x)} {f(y)})"/>')
        hearts.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(s * 5.2)}"/>')
        for k in range(6):
            sx, sy = rot(0, -s * 3.3, turn + k * 60 + 15)
            lines.append(f"M{f(x)} {f(y)}l{f(sx)} {f(sy)}")
            dots.append(f"M{f(x + sx)} {f(y + sy)}h0")
    for x, y, w in rng.sample(nodes, 14):
        bx, by = x + rng.uniform(-40, 40), y + rng.uniform(-40, 40)
        r, a = math.hypot(bx, by), math.degrees(math.atan2(bx, -by))
        if R_IN + 40 < r < R_OUT - 50 and -SPREAD + 6 < a < SPREAD - 6:
            buds.append(f'<ellipse cx="{f(bx)}" cy="{f(by)}" rx="9" ry="14" transform="rotate({f(rng.uniform(-60, 60))} {f(bx)} {f(by)})"/>')
    parts.append('<g fill="#e07d98">' + "".join(buds) + "</g>")
    parts.append('<g stroke="#e58aa2" stroke-width=".32" stroke-linejoin="round">' + "".join(flowers) + "</g>")
    parts.append('<g fill="url(#hart)">' + "".join(hearts) + "</g>")
    parts.append(f'<path d="{"".join(lines)}" stroke="#b9853a" stroke-width="2" fill="none"/>')
    parts.append(f'<path d="{"".join(dots)}" stroke="#c9963f" stroke-width="5.5" stroke-linecap="round" fill="none"/>')
    # Losse vallende blaadjes.
    loose = []
    for _ in range(16):
        r = rng.uniform(R_IN + 60, R_OUT - 70)
        a = rng.uniform(-SPREAD + 8, SPREAD - 8)
        x, y = polar(r, a)
        loose.append(f'<path d="{petal_path(rng.uniform(0, 360), rng.uniform(3.4, 5), x, y)}"/>')
    parts.append('<g fill="#f3aebf" opacity=".9">' + "".join(loose) + "</g>")
    parts.append("</g>")
    # Goudranden.
    parts.append(f'<path d="{arc(R_OUT - 14)}" fill="none" stroke="url(#goud)" stroke-width="26"/>')
    parts.append(f'<path d="{arc(R_OUT - 46)}" fill="none" stroke="#c99a48" stroke-width="3.5"/>')
    parts.append(f'<path d="{arc(R_IN + 9)}" fill="none" stroke="url(#goud)" stroke-width="16"/>')
    parts.append(f'<path d="{arc(R_IN + 34)}" fill="none" stroke="#c99a48" stroke-width="3"/>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1000 -1000 2000 1000">{defs}'
            + "".join(parts) + "</svg>\n")


def stick(outer=False) -> str:
    """Een balein in een vak van 100 x 1000: onderaan (y = 1000) het draaipunt, bovenaan de rand."""
    if outer:
        w_bottom, w_mid, w_top = 16, 50, 40
        grad = '<stop offset="0" stop-color="#a87a35"/><stop offset=".45" stop-color="#f7e0a3"/><stop offset=".6" stop-color="#e2bb6a"/><stop offset="1" stop-color="#9c6f2e"/>'
    else:
        w_bottom, w_mid, w_top = 9, 36, 30
        grad = '<stop offset="0" stop-color="#c39a5c"/><stop offset=".5" stop-color="#f6e7c8"/><stop offset="1" stop-color="#b98d50"/>'
    top = 8 if outer else 60
    d = (f"M{f(50 - w_bottom / 2)} 1000L{f(50 - w_mid / 2)} 610L{f(50 - w_top / 2)} {top + 20}"
         f"Q50 {top - 12} {f(50 + w_top / 2)} {top + 20}L{f(50 + w_mid / 2)} 610L{f(50 + w_bottom / 2)} 1000Z")
    parts = [f'<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0">{grad}</linearGradient></defs>',
             f'<path d="{d}" fill="url(#g)" stroke="#8d6631" stroke-width="2"/>']
    if outer:
        # Ivoren inleg met kleine bloemen langs de buitenste balein.
        parts.append('<path d="M45 90L55 90L56 590L44 590Z" fill="#f8efdd" stroke="#b58a45" stroke-width="1.5"/>')
        for y in range(130, 590, 80):
            parts.append(f'<path d="{flower_path(.75, 50, y)}" fill="#ef9db2"/><circle cx="50" cy="{y}" r="2" fill="#c9963f"/>')
        for y in range(650, 960, 52):
            parts.append(f'<path d="M50 {y - 16}L57 {y}L50 {y + 16}L43 {y}Z" fill="#fbecc0" stroke="#9c6f2e" stroke-width="1.5"/>')
    else:
        # Opengewerkt motief onderaan: ruitjes en een middenlijn.
        parts.append('<path d="M50 625L50 975" stroke="#a67c43" stroke-width="2.5"/>')
        for y in range(650, 960, 45):
            half = 3 + (1000 - y) / 400 * 8
            parts.append(f'<path d="M50 {y - 14}L{f(50 + half)} {y}L50 {y + 14}L{f(50 - half)} {y}Z" fill="#7a5a33" opacity=".55"/>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 1000" preserveAspectRatio="none">{"".join(parts)}</svg>\n'


def tassel() -> str:
    rng = random.Random(3)
    threads = []
    for i in range(34):
        t = i / 33
        x_top = 47 + t * 26
        x_bot = 30 + t * 60 + rng.uniform(-2, 2)
        y_bot = 500 + rng.uniform(-14, 6) - abs(t - .5) * 26
        threads.append(f'<path d="M{f(x_top)} 262Q{f((x_top + x_bot) / 2 + rng.uniform(-3, 3))} 380 {f(x_bot)} {f(y_bot)}"/>')
    rosette = "".join(f'<ellipse cx="60" cy="122" rx="9" ry="20" transform="rotate({k * 45} 60 142)"/>' for k in range(8))
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 520">
<defs>
<linearGradient id="goud" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a87a35"/><stop offset=".5" stop-color="#f6dc9c"/><stop offset="1" stop-color="#a87a35"/></linearGradient>
<linearGradient id="zijde" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9dcc4"/><stop offset=".45" stop-color="#fffaf0"/><stop offset="1" stop-color="#dccaa9"/></linearGradient>
<radialGradient id="parel" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#f3ece4"/><stop offset="1" stop-color="#cdbfae"/></radialGradient>
</defs>
<path d="M60 0L60 112" stroke="#c99a48" stroke-width="5" stroke-linecap="round"/>
<g fill="url(#goud)" stroke="#8d6631" stroke-width="1.5">{rosette}</g>
<circle cx="60" cy="142" r="10" fill="#f8e7b4" stroke="#8d6631" stroke-width="1.5"/>
<path d="M60 168L60 186" stroke="#c99a48" stroke-width="4"/>
<circle cx="60" cy="200" r="14" fill="url(#parel)"/>
<path d="M60 214L60 226" stroke="#c99a48" stroke-width="4"/>
<path d="M47 228L73 228L78 262L42 262Z" fill="url(#goud)" stroke="#8d6631" stroke-width="1.5"/>
<path d="M46 262L74 262Q92 380 92 500Q60 512 28 500Q28 380 46 262Z" fill="url(#zijde)"/>
<g fill="none" stroke="#d8c6a6" stroke-width="1.1" opacity=".9">{"".join(threads)}</g>
<path d="M44 276L76 276" stroke="#c99a48" stroke-width="6"/>
</svg>
"""


def ornament() -> str:
    """Kleine waaier als masker voor de koppen (de kleur komt uit de stijl)."""
    cx, cy = 60, 58
    def pp(r, a):
        x, y = polar(r, a)
        return f"{f(cx + x)} {f(cy + y)}"
    outline = (f"M{pp(16, -62)}L{pp(52, -62)}A52 52 0 0 1 {pp(52, 62)}L{pp(16, 62)}A16 16 0 0 0 {pp(16, -62)}Z")
    pleats = "".join(f"M{pp(16, a)}L{pp(52, a)}" for a in range(-62 + 124 // 7, 62, 124 // 7))
    sticks = "".join(f"M{f(cx)} {f(cy)}L{pp(16, a)}" for a in (-62, -31, 0, 31, 62))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 64">'
            f'<path d="{outline}" fill="#000" fill-opacity=".16" stroke="#000" stroke-width="2.4" stroke-linejoin="round"/>'
            f'<path d="{pleats}{sticks}" stroke="#000" stroke-width="1.4" fill="none"/>'
            f'<path d="{arc_at(cx, cy, 46)}" stroke="#000" stroke-width="1" fill="none"/>'
            f'<path d="{flower_path(.82, 78, 26, 8)}" fill="#000"/><path d="{flower_path(.56, 46, 18, 30)}" fill="#000"/>'
            f'<circle cx="{cx}" cy="{cy}" r="3.6" fill="#000"/></svg>\n')


def arc_at(cx, cy, r, a1=-62, a2=62) -> str:
    x1, y1 = polar(r, a1)
    x2, y2 = polar(r, a2)
    return f"M{f(cx + x1)} {f(cy + y1)}A{r} {r} 0 0 1 {f(cx + x2)} {f(cy + y2)}"


# ---------------------------------------------------------------- de tuin (kleuren via klassen)

def i(x: float) -> str:
    return str(round(x))


def flower_use(x, y, s, cls, rng, op=None, turn=False) -> str:
    """Een bloem; alleen in de patroontegels gedraaid (een draaiing per bloem in de pagina kost de browser veel)."""
    extra = f' opacity="{f(op)}"' if op is not None else ""
    angle = rng.uniform(0, 72)
    rotation = f' transform="rotate({i(angle)} {i(x)} {i(y)})"' if turn else ""
    return (f'<use href="#wa-bl" class="{cls}" x="{i(x - s / 2)}" y="{i(y - s / 2)}" width="{i(s)}" height="{i(s)}"'
            f'{rotation}{extra}/>')


def circle_d(x, y, r) -> str:
    """Een cirkel als stukje pad, zodat veel cirkels van één kleur samen één element zijn."""
    return f"M{i(x - r)} {i(y)}a{i(r)} {i(r)} 0 1 0 {i(2 * r)} 0a{i(r)} {i(r)} 0 1 0 {i(-2 * r)} 0"


def canopy(rng, cx, cy, rx, ry, density=1.0, flower_size=(9, 16)) -> str:
    """Een wolk van bloesem: zachte bollen, donkerder aan de onderkant, met een bloemenpatroon erover
    en een paar losse bloemen. Per kleur één pad: dat houdt de pagina licht voor de browser."""
    base = {"wa-b1": [], "wa-b2": [], "wa-b3": []}
    blobs = []
    for _ in range(int(30 * density)):
        a = rng.uniform(0, math.tau)
        d = math.sqrt(rng.random())
        x, y = cx + math.cos(a) * rx * d, cy + math.sin(a) * ry * d
        r = rng.uniform(.13, .27) * min(rx, ry) * 1.3
        cls = "wa-b3" if y > cy + ry * .3 else rng.choice(["wa-b1", "wa-b2", "wa-b1"])
        base[cls].append(circle_d(x, y, r))
        blobs.append((x, y, r))
    out = [f'<path class="{cls}" d="{"".join(ds)}"/>' for cls, ds in base.items() if ds]
    pattern = "wa-p-bloom-l" if flower_size[1] > 20 else "wa-p-bloom"
    out.append(f'<path fill="url(#{pattern})" d="{"".join(circle_d(x, y, r * .94) for x, y, r in blobs)}"/>')
    lo, hi = flower_size
    for _ in range(int(6 * density)):
        a = rng.uniform(0, math.tau)
        d = math.sqrt(rng.random())
        x, y = cx + math.cos(a) * rx * d, cy + math.sin(a) * ry * d
        out.append(flower_use(x, y, rng.uniform((lo + hi) / 2, hi * 1.1), "wa-b4" if y < cy else "wa-b2", rng))
    return "".join(out)


def bloom_pattern(pid: str, w: int, h: int, sizes, seed: int) -> str:
    """Een tegel met bloemetjes; herhaald over de bollen van een bloesemwolk."""
    rng = random.Random(seed)
    placed = []
    for _ in range(400):
        s = rng.uniform(*sizes)
        x, y = rng.uniform(s / 2 + 1, w - s / 2 - 1), rng.uniform(s / 2 + 1, h - s / 2 - 1)
        if all(math.hypot(x - px, y - py) > (s + ps) * .5 for px, py, ps in placed):
            placed.append((x, y, s))
        if len(placed) >= 11:
            break
    flowers = "".join(flower_use(x, y, s, rng.choice(["wa-b4", "wa-b4", "wa-b2"]), rng, turn=True) for x, y, s in placed)
    return f'<pattern id="{pid}" width="{w}" height="{h}" patternUnits="userSpaceOnUse">{flowers}</pattern>'


def twigs(rng, pts, width, cls="wa-f-branch") -> str:
    out = []
    for i in range(len(pts) - 1):
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        w = max(.8, width * (1 - i / len(pts)))
        mx, my = (x0 + x1) / 2 + rng.uniform(-6, 6), (y0 + y1) / 2 + rng.uniform(-6, 6)
        out.append(f'<path d="M{f(x0)} {f(y0)}Q{f(mx)} {f(my)} {f(x1)} {f(y1)}" stroke-width="{f(w)}"/>')
    return f'<g class="{cls}" fill="none" stroke-linecap="round">' + "".join(out) + "</g>"


def defs_svg() -> str:
    flower = flower_path(1.0)
    petal = petal_path(0, 1.0, 0, 5)
    return f"""<svg class="wa-defs" width="0" height="0" focusable="false" aria-hidden="true"><defs>
<symbol id="wa-bl" viewBox="-11 -11 22 22" overflow="visible"><path d="{flower}"/><circle r="2.6" class="wa-eye"/></symbol>
<symbol id="wa-pe" viewBox="-6 -6 12 12" overflow="visible"><path d="{petal}"/></symbol>
<linearGradient id="wa-g-mtn1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="wa-c-mtn1"/><stop offset="1" class="wa-c-mist"/></linearGradient>
<linearGradient id="wa-g-mtn2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="wa-c-mtn2"/><stop offset=".85" class="wa-c-mist"/></linearGradient>
<linearGradient id="wa-g-mtn3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="wa-c-mtn3"/><stop offset="1" class="wa-c-mtn3b"/></linearGradient>
<linearGradient id="wa-g-rock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="wa-c-rock1"/><stop offset="1" class="wa-c-rock2"/></linearGradient>
<linearGradient id="wa-g-roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="wa-c-roof1"/><stop offset="1" class="wa-c-roof2"/></linearGradient>
<linearGradient id="wa-g-win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="wa-c-glow1"/><stop offset="1" class="wa-c-glow2"/></linearGradient>
<linearGradient id="wa-g-fall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="wa-c-fall1"/><stop offset="1" class="wa-c-fall2"/></linearGradient>
<radialGradient id="wa-g-halo"><stop offset="0" class="wa-c-halo1"/><stop offset=".35" class="wa-c-halo2"/><stop offset="1" class="wa-c-halo3"/></radialGradient>
<radialGradient id="wa-g-cloud"><stop offset="0" class="wa-c-cloud1"/><stop offset=".55" class="wa-c-cloudm"/><stop offset="1" class="wa-c-cloud2"/></radialGradient>
<radialGradient id="wa-g-mistball"><stop offset="0" class="wa-c-mistball1"/><stop offset="1" class="wa-c-mistball2"/></radialGradient>
<linearGradient id="wa-g-refl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".62"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="wa-g-sides" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset=".26" stop-color="#fff" stop-opacity="0"/><stop offset=".74" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>
<mask id="wa-m-sides" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#wa-g-sides)"/></mask>
<mask id="wa-m-refl" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#wa-g-refl)"/></mask>
{bloom_pattern("wa-p-bloom", 62, 56, (8, 15), 81)}
{bloom_pattern("wa-p-bloom-l", 118, 104, (15, 28), 82)}
<pattern id="wa-p-lattice" width="14" height="14" patternUnits="userSpaceOnUse"><path class="wa-s-lattice" d="M0 7H14M7 0V14M0 0L14 14" fill="none" stroke-width="1.6"/></pattern>
</defs></svg>"""


def skyline(rng, width, base, n_peaks, h_range, w_range, sharp=1.6, step=6):
    peaks = []
    x = -w_range[1]
    while x < width + w_range[1]:
        peaks.append((x, rng.uniform(*h_range), rng.uniform(*w_range)))
        x += rng.uniform(.35, .8) * w_range[1]
    pts = []
    for xi in range(0, int(width) + step, step):
        h = 0.0
        for cx, ph, pw in peaks:
            t = abs(xi - cx) / pw
            if t < 1:
                h = max(h, ph * (1 - t ** sharp) ** 1.8)
        pts.append((xi, base - h - rng.uniform(0, 1.2)))
    d = f"M0 {f(base + 2)}" + "".join(f"L{f(x)} {f(y)}" for x, y in pts) + f"L{f(width)} {f(base + 2)}Z"
    return d


def mountains() -> str:
    rng = random.Random(11)
    far = skyline(rng, 1200, 300, 0, (150, 270), (90, 190), sharp=1.15)
    mid = skyline(rng, 1200, 300, 0, (70, 170), (60, 140), sharp=1.35)
    # Dichtbij alleen aan de zijkanten, zodat het midden (zon en brug) vrij blijft.
    rng_near = random.Random(12)
    near_pts = skyline(rng_near, 1200, 300, 0, (60, 150), (50, 110), sharp=1.5)
    return (f'<svg class="wa-mtn wa-mtn--far" viewBox="0 0 1200 300" preserveAspectRatio="none" focusable="false">'
            f'<path d="{far}" fill="url(#wa-g-mtn1)"/></svg>'
            f'<svg class="wa-mtn wa-mtn--mid" viewBox="0 0 1200 300" preserveAspectRatio="none" focusable="false">'
            f'<path d="{mid}" fill="url(#wa-g-mtn2)"/></svg>'
            f'<svg class="wa-mtn wa-mtn--near" viewBox="0 0 1200 300" preserveAspectRatio="none" focusable="false">'
            f'<path d="{near_pts}" fill="url(#wa-g-mtn3)" mask="url(#wa-m-sides)"/></svg>')


def lantern(x, y, s=1.0) -> str:
    """Hangende lantaarn met gloed; (x, y) is het ophangpunt."""
    return (f'<circle cx="{f(x)}" cy="{f(y + 34 * s)}" r="{f(52 * s)}" fill="url(#wa-g-halo)" class="wa-halo"/>'
            f'<path d="M{f(x)} {f(y)}V{f(y + 14 * s)}" class="wa-f-gold-s" stroke-width="{f(2 * s)}"/>'
            f'<rect x="{f(x - 9 * s)}" y="{f(y + 13 * s)}" width="{f(18 * s)}" height="{f(5 * s)}" rx="{f(1.5 * s)}" class="wa-f-gold"/>'
            f'<ellipse cx="{f(x)}" cy="{f(y + 34 * s)}" rx="{f(14 * s)}" ry="{f(17 * s)}" class="wa-f-lantern"/>'
            f'<ellipse cx="{f(x)}" cy="{f(y + 34 * s)}" rx="{f(7 * s)}" ry="{f(14 * s)}" fill="url(#wa-g-win)" opacity=".9"/>'
            f'<rect x="{f(x - 9 * s)}" y="{f(y + 50 * s)}" width="{f(18 * s)}" height="{f(5 * s)}" rx="{f(1.5 * s)}" class="wa-f-gold"/>'
            f'<path d="M{f(x)} {f(y + 55 * s)}V{f(y + 72 * s)}" class="wa-f-lantern-s" stroke-width="{f(3 * s)}"/>')


def roof(x_left, x_ridge_end, y_ridge, y_eave, tip_x, tip_y, depth=12) -> str:
    """Een gebogen dak met opgekrulde punt rechts (links loopt het buiten beeld)."""
    out = (f'<path class="wa-roof" d="M{f(x_left)} {f(y_ridge)}L{f(x_ridge_end)} {f(y_ridge)}'
           f'C{f(x_ridge_end + (tip_x - x_ridge_end) * .45)} {f(y_ridge + (y_eave - y_ridge) * .25)} '
           f'{f(tip_x - 40)} {f(y_eave + 4)} {f(tip_x)} {f(tip_y)}'
           f'L{f(tip_x - 6)} {f(tip_y + 12)}C{f(tip_x - 40)} {f(y_eave + 14)} {f(x_ridge_end + 30)} {f(y_eave + 2)} {f(x_ridge_end)} {f(y_eave + 2)}'
           f'L{f(x_left)} {f(y_eave + 2)}Z" fill="url(#wa-g-roof)"/>')
    tiles = "".join(f"M{f(x)} {f(y_ridge + 4)}L{f(x + 4)} {f(y_eave)}" for x in range(int(x_left) + 8, int(x_ridge_end), 13))
    out += f'<path d="{tiles}" class="wa-s-tile" stroke-width="2.2" fill="none"/>'
    out += f'<rect x="{f(x_left)}" y="{f(y_ridge - 8)}" width="{f(x_ridge_end - x_left + 6)}" height="9" rx="3" class="wa-f-roofdark"/>'
    out += f'<rect x="{f(x_left)}" y="{f(y_eave + 2)}" width="{f(x_ridge_end - x_left + 8)}" height="{depth}" class="wa-f-wood2"/>'
    out += "".join(f'<rect x="{f(x)}" y="{f(y_eave + 4)}" width="7" height="{depth - 4}" class="wa-f-gold" opacity=".8"/>'
                   for x in range(int(x_left) + 14, int(x_ridge_end), 26))
    out += f'<circle cx="{f(tip_x + 1)}" cy="{f(tip_y - 3)}" r="5" class="wa-f-gold"/>'
    return out


def pavilion() -> str:
    rng = random.Random(21)
    g = []
    # Bloesemboom achter het paviljoen.
    g.append(twigs(rng, [(330, 470), (350, 360), (330, 250), (380, 160)], 14))
    g.append(canopy(rng, 360, 150, 120, 95, 1.6, (11, 19)))
    g.append(canopy(rng, 250, 70, 110, 70, 1.2, (10, 17)))
    # Benedenverdieping.
    g.append('<rect x="-10" y="400" width="350" height="180" class="wa-f-wood3"/>')
    for x in (16, 116, 216):
        g.append(f'<rect x="{x + 18}" y="430" width="64" height="108" fill="url(#wa-g-win)" class="wa-win"/>')
        g.append(f'<rect x="{x + 18}" y="430" width="64" height="108" fill="url(#wa-p-lattice)"/>')
    for x in (4, 104, 204, 304):
        g.append(f'<rect x="{x}" y="404" width="18" height="176" class="wa-f-wood"/>')
    g.append('<rect x="-10" y="538" width="360" height="8" class="wa-f-wood2"/>')
    g.append('<path d="' + "".join(f"M{x} 546V574" for x in range(0, 350, 12)) + '" class="wa-s-wood" stroke-width="3"/>')
    g.append('<rect x="-10" y="572" width="364" height="6" class="wa-f-wood2"/>')
    # Bovenverdieping met balkon.
    g.append('<rect x="-10" y="238" width="270" height="110" class="wa-f-wood3"/>')
    for x in (10, 92, 174):
        g.append(f'<rect x="{x + 16}" y="254" width="52" height="62" fill="url(#wa-g-win)" class="wa-win"/>')
        g.append(f'<rect x="{x + 16}" y="254" width="52" height="62" fill="url(#wa-p-lattice)"/>')
    for x in (0, 82, 164, 246):
        g.append(f'<rect x="{x}" y="240" width="16" height="110" class="wa-f-wood"/>')
    g.append('<rect x="-10" y="318" width="300" height="7" class="wa-f-wood2"/>')
    g.append('<path d="' + "".join(f"M{x} 325V346" for x in range(0, 292, 11)) + '" class="wa-s-wood" stroke-width="2.6"/>')
    g.append('<rect x="-10" y="344" width="304" height="6" class="wa-f-wood2"/>')
    # Daken.
    g.append(roof(-20, 300, 352, 398, 404, 368, 14))
    g.append(roof(-20, 228, 176, 226, 326, 196, 12))
    g.append('<path d="M196 168L204 128L212 168Z" class="wa-f-gold"/><circle cx="204" cy="124" r="6" class="wa-f-gold"/>')
    # Lantaarns.
    for x in (64, 164, 264, 360):
        g.append(lantern(x, 412, 1.0))
    for x in (110, 210):
        g.append(lantern(x, 238, .8))
    # Fundament en trap naar het water.
    g.append('<rect x="-10" y="578" width="378" height="26" class="wa-f-stone"/>')
    g.append('<path d="M368 578H392V588H414V598H436V608H368Z" class="wa-f-stone2"/>')
    g.append('<rect x="-10" y="600" width="400" height="20" class="wa-f-stone2"/>')
    # Stenen lantaarn bij de trap.
    g.append('<circle cx="410" cy="540" r="44" fill="url(#wa-g-halo)" class="wa-halo"/>'
             '<rect x="398" y="556" width="24" height="24" class="wa-f-stone2"/><rect x="402" y="528" width="16" height="30" class="wa-f-stone"/>'
             '<rect x="396" y="522" width="28" height="8" class="wa-f-stone2"/><rect x="401" y="530" width="18" height="20" fill="url(#wa-g-win)"/>'
             '<path d="M390 524L410 508L430 524Z" class="wa-f-stone2"/>')
    # Bloesem op de voorgrond, links onder het balkon en tegen de gevel.
    g.append(canopy(rng, 40, 600, 90, 40, 1.0, (10, 16)))
    g.append(canopy(rng, 300, 600, 70, 30, .7, (9, 14)))
    body = "".join(g)
    return (f'<svg class="wa-pav" viewBox="0 0 440 880" focusable="false"><g id="wa-pav-g">{body}</g>'
            f'<use href="#wa-pav-g" transform="translate(0 1240) scale(1 -1)" mask="url(#wa-m-refl)" class="wa-refl"/></svg>')


def cliff() -> str:
    rng = random.Random(31)
    g = []
    # Pagode boven op de rots.
    pag = []
    for i, (w, y) in enumerate([(70, 132), (56, 96), (42, 64)]):
        pag.append(f'<rect x="{f(390 - w / 2 + 8)}" y="{y - 26}" width="{f(w - 16)}" height="28" class="wa-f-wood"/>')
        pag.append(f'<rect x="{f(390 - w / 2 + 14)}" y="{y - 20}" width="{f(w - 28)}" height="16" fill="url(#wa-g-win)" class="wa-win"/>')
        pag.append(f'<path d="M{f(390 - w / 2 - 12)} {y - 22}Q390 {y - 40} {f(390 + w / 2 + 12)} {y - 22}L{f(390 + w / 2 + 2)} {y - 16}L{f(390 - w / 2 - 2)} {y - 16}Z" fill="url(#wa-g-roof)"/>')
    pag.append('<path d="M388 40L390 18L392 40Z" class="wa-f-gold"/>')
    g.append('<circle cx="390" cy="100" r="70" fill="url(#wa-g-halo)" class="wa-halo" opacity=".7"/>' + "".join(pag))
    # Bloesembomen achter de rand.
    g.append(canopy(rng, 230, 168, 80, 40, .9, (8, 13)))
    # De rots.
    rock = "M100 560L118 470L140 392L132 330L170 268L196 214L240 182L286 176L330 150L372 140L420 148L470 138L470 560Z"
    g.append(f'<path d="{rock}" fill="url(#wa-g-rock)"/>')
    faces = ["M140 392L190 300L230 330L196 420Z", "M196 214L240 182L262 240L222 270Z", "M330 150L372 140L392 210L350 236Z",
             "M286 176L330 150L340 230L300 250Z", "M150 470L196 420L232 470L190 520Z", "M380 240L430 220L450 300L404 320Z"]
    g.append('<g class="wa-f-rockface">' + "".join(f'<path d="{d}"/>' for d in faces) + "</g>")
    # Dennen.
    pines = []
    for cx, cy, s in [(178, 232, 1.0), (412, 168, .8), (140, 330, .7)]:
        pines.append(f'<path d="M{f(cx)} {f(cy + 40 * s)}Q{f(cx + 6 * s)} {f(cy + 10 * s)} {f(cx - 2 * s)} {f(cy - 20 * s)}" class="wa-s-trunk" stroke-width="{f(6 * s)}" fill="none"/>')
        for dx, dy, rx in [(-26, -22, 34), (18, -36, 30), (-6, -52, 24), (30, -10, 26)]:
            pines.append(f'<ellipse cx="{f(cx + dx * s)}" cy="{f(cy + dy * s)}" rx="{f(rx * s)}" ry="{f(10 * s)}" class="wa-f-pine"/>'
                         f'<ellipse cx="{f(cx + (dx - 3) * s)}" cy="{f(cy + (dy - 4) * s)}" rx="{f(rx * .7 * s)}" ry="{f(5 * s)}" class="wa-f-pine2"/>')
    g.append("".join(pines))
    # Watervallen. Het stromen zit in een eigen laag van HTML (zie onder) die alleen verschuift:
    # dan hoeft de tekening van de rots niet elk beeld opnieuw gemaakt te worden.
    flows = []
    for x_top, y_top, w_top, w_bot, x_bot in [(262, 196, 26, 58, 244), (346, 232, 22, 46, 352)]:
        left = (x_top - w_top / 2, x_top - w_top / 2 - 6, x_bot - w_bot / 2)
        right = (x_top + w_top / 2, x_top + w_top / 2 + 6, x_bot + w_bot / 2)
        d = (f"M{f(left[0])} {y_top}Q{f(left[1])} 400 {f(left[2])} 560"
             f"L{f(right[2])} 560Q{f(right[1])} 400 {f(right[0])} {y_top}Z")
        g.append(f'<path d="{d}" fill="url(#wa-g-fall)"/>')

        # Drie smalle, rechte stroompjes per waterval (rechthoekig afgesneden, dus zuinig te bewegen).
        for k in (-.3, 0, .3):
            xa, xb = x_top + k * w_top, x_bot + k * w_bot
            cx, cy = (xa + xb) / 2, (y_top + 560) / 2
            length = math.hypot(xb - xa, 560 - y_top)
            angle = -math.degrees(math.atan2(xb - xa, 560 - y_top))
            flows.append(f'<span class="wa-fall" style="left:{f(cx / 470 * 100)}%;top:{f(cy / 820 * 100)}%;'
                         f'width:{f(5 / 470 * 100)}%;height:{f(length / 820 * 100)}%;rotate:{f(angle)}deg"><span></span></span>')
    # Nevel onder aan de watervallen.
    for cx, cy, rx, ry in [(250, 548, 120, 40), (350, 552, 100, 34), (300, 540, 160, 30)]:
        g.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="url(#wa-g-mistball)" class="wa-mistball"/>')
    g.append(canopy(rng, 440, 520, 60, 40, .7, (9, 14)))
    body = "".join(g)
    return (f'<svg class="wa-cliff" viewBox="0 0 470 820" focusable="false"><g id="wa-cliff-g">{body}</g>'
            f'<use href="#wa-cliff-g" transform="translate(0 1120) scale(1 -1)" mask="url(#wa-m-refl)" class="wa-refl"/></svg>'
            f'<div class="wa-cliff wa-cliff--flow">{"".join(flows)}</div>')


def bridge() -> str:
    def deck_y(x):
        t = (x - 40) / 920
        return (1 - t) ** 2 * 182 + 2 * t * (1 - t) * 52 + t ** 2 * 182

    g = []
    g.append('<path d="M150 200Q500 100 850 200" class="wa-s-wood2" stroke-width="12" fill="none"/>')
    for x in (130, 250, 750, 870):
        g.append(f'<rect x="{x - 6}" y="{f(deck_y(x))}" width="12" height="{f(200 - deck_y(x))}" class="wa-f-wood2"/>')
    g.append('<path d="M40 182Q500 52 960 182L960 198Q500 70 40 198Z" class="wa-f-wood"/>')
    g.append('<path d="M40 182Q500 52 960 182" class="wa-s-gold" stroke-width="2.5" fill="none" opacity=".75"/>')
    rails = []
    for off in (34, 18):
        rails.append(f'<path d="M40 {182 - off}Q500 {52 - off} 960 {182 - off}" class="wa-s-wood" stroke-width="{5 if off == 34 else 3}" fill="none"/>')
    bal = "".join(f"M{x} {f(deck_y(x))}V{f(deck_y(x) - 34)}" for x in range(46, 956, 11))
    g.append(f'<path d="{bal}" class="wa-s-wood" stroke-width="1.6"/>')
    g.append("".join(rails))
    posts = "".join(f'<rect x="{x - 4}" y="{f(deck_y(x) - 42)}" width="8" height="42" class="wa-f-wood"/>'
                    f'<circle cx="{x}" cy="{f(deck_y(x) - 44)}" r="4.5" class="wa-f-gold"/>' for x in range(60, 950, 74))
    g.append(posts)
    for x in (52, 948):
        y = deck_y(x)
        g.append(f'<circle cx="{x}" cy="{f(y - 64)}" r="46" fill="url(#wa-g-halo)" class="wa-halo"/>'
                 f'<rect x="{x - 5}" y="{f(y - 56)}" width="10" height="56" class="wa-f-wood"/>'
                 f'<rect x="{x - 11}" y="{f(y - 82)}" width="22" height="26" rx="3" class="wa-f-lantern"/>'
                 f'<rect x="{x - 6}" y="{f(y - 78)}" width="12" height="18" fill="url(#wa-g-win)"/>'
                 f'<path d="M{x - 15} {f(y - 82)}L{x} {f(y - 94)}L{x + 15} {f(y - 82)}Z" class="wa-f-roofdark"/>')
    body = "".join(g)
    return (f'<svg class="wa-bridge" viewBox="0 0 1000 340" focusable="false"><g id="wa-bridge-g">{body}</g>'
            f'<use href="#wa-bridge-g" transform="translate(0 400) scale(1 -1)" mask="url(#wa-m-refl)" class="wa-refl"/></svg>')


def water_details() -> str:
    rng = random.Random(41)
    out = []
    # Drijvende blaadjes. (De kringen op het water staan in water_rings: losse lagen die zuinig bewegen.)
    petals = []
    for _ in range(46):
        x, y = rng.uniform(0, 1000), rng.uniform(20, 400)
        s = 5 + y / 400 * 9
        rng.uniform(-30, 30)  # vroeger de draaiing; blijft staan zodat de rest van de toevalsreeks gelijk blijft
        petals.append(f'<ellipse cx="{f(x)}" cy="{f(y)}" rx="{f(s)}" ry="{f(s * .42)}" class="{rng.choice(["wa-b1", "wa-b2", "wa-b4"])}"/>')
    out.append("".join(petals))
    return (f'<svg class="wa-pond" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMin slice" focusable="false">'
            + "".join(out) + "</svg>")


def water_rings() -> str:
    rings = [(30, 30, 18), (69, 52, 24), (52, 82, 30), (16, 70, 16), (86, 28, 14)]
    return '<div class="wa-rings">' + "".join(
        f'<span style="--x:{x}%;--y:{y}%;--w:{w}%;--d:{k}"></span>' for k, (x, y, w) in enumerate(rings)) + "</div>"


def front(side: str) -> str:
    rng = random.Random(51 if side == "l" else 52)
    g = []
    if side == "l":
        g.append(twigs(rng, [(-10, 250), (60, 190), (120, 150), (200, 120)], 9))
        g.append(canopy(rng, 70, 200, 120, 70, 1.4, (16, 30)))
        g.append(canopy(rng, 150, 270, 110, 40, .8, (16, 28)))
    else:
        g.append(twigs(rng, [(410, 250), (330, 200), (260, 170), (200, 150)], 9))
        g.append(canopy(rng, 330, 220, 110, 60, 1.2, (16, 30)))
        g.append(canopy(rng, 260, 280, 120, 40, .8, (16, 28)))
    # Zachte, onscherpe bloemen dichtbij.
    for _ in range(6):
        x, y = rng.uniform(20, 380), rng.uniform(160, 290)
        g.append(flower_use(x, y, rng.uniform(36, 60), "wa-b2 wa-soft", rng, .55))
    return (f'<svg class="wa-front wa-front--{side}" viewBox="0 0 400 300" preserveAspectRatio="x{"Min" if side == "l" else "Max"}YMax meet" focusable="false">'
            + "".join(g) + "</svg>")


def hanging(side: str) -> str:
    rng = random.Random(61 if side == "l" else 62)
    g = []
    if side == "l":
        main = [(-20, 10), (80, 40), (180, 60), (280, 96), (360, 150)]
        subs = [[(80, 40), (110, 110), (100, 170)], [(180, 60), (220, 130), (230, 200)], [(280, 96), (300, 160)]]
    else:
        main = [(520, 6), (420, 36), (320, 52), (230, 90), (160, 140)]
        subs = [[(420, 36), (400, 110), (410, 160)], [(320, 52), (290, 120), (280, 190)], [(230, 90), (210, 150)]]
    g.append(twigs(rng, main, 9))
    for pts in subs:
        g.append(twigs(rng, pts, 4))
    spots = main[1:] + [p for s in subs for p in s[1:]]
    for x, y in spots:
        g.append(canopy(rng, x, y, 46, 30, .45, (10, 17)))
    return (f'<svg class="wa-hang wa-hang--{side}" viewBox="0 0 500 240" preserveAspectRatio="x{"Min" if side == "l" else "Max"}YMin meet" focusable="false">'
            + "".join(g) + "</svg>")


def clouds() -> str:
    rng = random.Random(71)
    out = []
    for _ in range(7):
        cx, cy = rng.uniform(0, 1200), rng.uniform(60, 330)
        rx = rng.uniform(140, 300)
        parts = "".join(f'<ellipse cx="{f(cx + dx)}" cy="{f(cy + dy)}" rx="{f(rx * k)}" ry="{f(rx * k * .16)}"/>'
                        for dx, dy, k in [(0, 0, 1), (rx * .35, -10, .6), (-rx * .3, 8, .7)])
        out.append(f'<g fill="url(#wa-g-cloud)">{parts}</g>')
    return (f'<svg class="wa-clouds" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" focusable="false">'
            + "".join(out) + "</svg>")


def scene_sky() -> str:
    return HEADER + defs_svg() + clouds() + hanging("l") + hanging("r") + "\n"


def scene_land() -> str:
    return (HEADER + '<div class="wa-sun"><span class="wa-sun__rays"></span></div>' + mountains()
            + '<div class="wa-mist"></div><div class="wa-water"><span class="wa-water__glow"></span></div>'
            + water_details() + water_rings() + cliff() + bridge() + pavilion() + front("l") + front("r") + "\n")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    files = {
        "waaier.svg": fan_paper(),
        "stok.svg": stick(False),
        "stok-buiten.svg": stick(True),
        "kwast.svg": tassel(),
        "ornament.svg": ornament(),
        "scene-lucht.html": scene_sky(),
        "scene-land.html": scene_land(),
    }
    for name, text in files.items():
        (OUT / name).write_text(text, encoding="utf-8")
        print(f"{name}: {len(text.encode('utf-8')) // 1024} kB")


if __name__ == "__main__":
    main()
