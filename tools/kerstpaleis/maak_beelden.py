"""Kerstpaleis: maakt de beelden van het ontwerp uit de film van de eigenaar.

Gebruik (vanuit de hoofdmap van het project, met ffmpeg en ffprobe op het pad):

    python3 tools/kerstpaleis/maak_beelden.py <film.mp4> [uitvoermap]

Standaard schrijft het script naar designs/kerstpaleis/v1/img/. Het maakt:

- kerstpaleis.webm en kerstpaleis.mp4: het stuk van de film waarin de deuren opengaan (0,42 tot 4,40 s, zonder
  de overgang naar de kaart en zonder geluid);
- poster.webp: het eerste beeld (de dichte deuren);
- lijst.webp: de gouden sierlijst met dennengroen en hulst van de kaart, los van de rode achtergrond (doorzichtig),
  zodat de kaart in elke kleur kan. De tekst uit de film (de groet en VAYLIDE) zit er niet in;
- fleur.webp: het sierstuk halverwege de zijkant (los, zodat het niet uitrekt op een hoog scherm);
- velours.webp: een naadloze tegel met de structuur van het fluweel (zwart en wit, half doorzichtig);
- scheiding.webp, sier-boven.webp en sier-onder.webp: de sierlijntjes onder de groet en rond de afzender.

Nodig: Pillow en numpy. Het script verwacht de film van 720 x 1280 pixels en 24 beelden per seconde zoals de
eigenaar hem aanleverde (WhatsApp-video van 15 oktober 2026); de tijden staan hieronder.
"""
from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

# Tijden in de film (seconden): de deuren gaan open van 0,5 tot 4,4 s, daarna vloeit het beeld in 0,6 s over
# in de kaart, die vanaf 5,04 s stilstaat. Het stuk voor de site begint vlak voordat de deuren bewegen
# (dan hoeft de browser niet te spoelen) en houdt op voor de overgang: die doet de site zelf, naar de echte kaart.
DOOR_START, DOOR_END = 0.42, 4.40
CARD_FROM_FRAME, CARD_TO_FRAME = 125, 189  # stilstaande kaart: deze beelden worden gemiddeld (minder ruis)

W, H = 720, 1280
SCALE = 1.5  # de lijst iets groter, zodat hij op een telefoon met een scherp scherm niet wazig is
# Waar de lijst ophoudt (in pixels van de film): boven, rechts, onder, links. Ertussen ligt de tekst.
SLICE = (300, 44, 340, 44)
FLEUR_BOX = (0, 588, 44, 664)  # het sierstuk halverwege de linkerzijkant (x0, y0, x1, y1)
# De vier trosjes hulstbessen (x0, y0, x1, y1), linksboven, rechtsboven, linksonder en rechtsonder.
# De sierlijntjes van de kaart (x0, y0, x1, y1): onder de groet, en boven en onder VAYLIDE (daar komt de afzender).
ORNAMENTS = {"scheiding": (185, 665, 540, 708), "sier-boven": (258, 922, 462, 957), "sier-onder": (258, 1006, 462, 1037)}
BERRY_BOXES = ((132, 22, 198, 88), (522, 22, 588, 88), (132, 1152, 198, 1218), (522, 1152, 588, 1218))


def run(*args: str) -> None:
    subprocess.run(args, check=True)


def box_blur(a: np.ndarray, r: int) -> np.ndarray:
    """Vervaging met een vierkant venster (drie keer na elkaar is bijna een gaussische vervaging)."""
    out = a
    for _ in range(3):
        for axis in (0, 1):
            pad = [(0, 0)] * out.ndim
            pad[axis] = (r + 1, r)
            p = np.pad(out, pad, mode="edge")
            c = np.cumsum(p, axis=axis)
            n = out.shape[axis]
            hi = np.take(c, range(2 * r + 1, 2 * r + 1 + n), axis=axis)
            lo = np.take(c, range(0, n), axis=axis)
            out = (hi - lo) / (2 * r + 1)
    return out


def smoothstep(e0: float, e1: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def hsv(img: np.ndarray):
    r, g, b = img[..., 0], img[..., 1], img[..., 2]
    mx, mn = img.max(-1), img.min(-1)
    d = mx - mn + 1e-9
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    s = np.where(mx > 0, (mx - mn) / (mx + 1e-9), 0)
    return h, s, mx


def average_card(video: Path, tmp: Path) -> np.ndarray:
    pattern = tmp / "kaart%03d.png"
    run("ffmpeg", "-v", "error", "-i", str(video), "-vf",
        f"select='between(n\\,{CARD_FROM_FRAME}\\,{CARD_TO_FRAME})'", "-vsync", "0", str(pattern))
    frames = sorted(tmp.glob("kaart*.png"))
    acc = sum(np.asarray(Image.open(f).convert("RGB"), dtype=np.float64) for f in frames)
    return acc / len(frames) / 255.0


def ornament_layer(card: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Scheidt de versiering van het rode fluweel. Geeft (rgba-laag, geschatte achtergrond)."""
    h, s, v = hsv(card)
    red_dist = np.minimum(h, 360 - h)
    # Versiering: goud, groen, wit en alles wat niet het verzadigde rood van het fluweel is.
    a_o = np.maximum(smoothstep(11, 24, red_dist), smoothstep(0.72, 0.45, s))
    a_o = np.where(v < 0.1, 0, a_o)  # bijna zwart: schaduw, die volgt hieronder

    # De achtergrond ter plekke (met het vignet van de film), zonder versiering en schaduw.
    lum = card @ np.array([0.2126, 0.7152, 0.0722])
    mask = ((a_o < 0.05) & (v > 0.12)).astype(float)
    bg = box_blur(card * mask[..., None], 28) / np.maximum(box_blur(mask, 28)[..., None], 1e-6)
    bg_lum = bg @ np.array([0.2126, 0.7152, 0.0722])
    mask2 = mask * (lum > bg_lum * 0.82)
    bg = box_blur(card * mask2[..., None], 28) / np.maximum(box_blur(mask2, 28)[..., None], 1e-6)
    bg_lum = bg @ np.array([0.2126, 0.7152, 0.0722])

    # Hulstbessen: rood op rood, dus niet van het fluweel te onderscheiden op kleur. Ze zitten in vier trosjes
    # tussen het dennengroen (zonder fluweel ertussen); die vakjes blijven zoals in de film.
    for x0, y0, x1, y1 in BERRY_BOXES:
        a_o[y0:y1, x0:x1] = 1

    # Schaduw van de versiering op het fluweel: donkerder dan de achtergrond, alleen vlak bij versiering.
    near = box_blur((a_o > 0.5).astype(float), 12) > 0.02
    a_s = np.clip((1 - lum / np.maximum(bg_lum, 1e-6) - 0.1) / 0.9, 0, 1) * near

    color = np.clip((card - (1 - a_o[..., None]) * bg) / np.maximum(a_o, 0.35)[..., None], 0, 1)
    alpha = a_o + a_s * (1 - a_o)
    color = color * (a_o / np.maximum(alpha, 1e-6))[..., None]
    rgba = np.dstack([color, alpha])
    return rgba, bg


def build_frame(rgba: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    top, right, bottom, left = SLICE
    layer = rgba.copy()
    # Alleen de rand blijft over; het midden (met de tekst uit de film) is leeg.
    layer[top:H - bottom, left:W - right, 3] = 0
    # VAYLIDE en de sierlijntjes eromheen staan net in de onderste strook.
    layer[900:1048, 228:492, 3] = 0
    # Het sierstuk halverwege de zijkanten apart; op die plek gaan de lijnen gewoon door.
    x0, y0, x1, y1 = FLEUR_BOX
    fleur = rgba[y0:y1, x0:x1].copy()
    for (a, b) in ((0, left), (W - right, W)):
        layer[y0 - 10:y1 + 10, a:b] = layer[y0 - 10 - 160:y1 + 10 - 160, a:b]
    return layer, fleur


def velvet_tile(card: np.ndarray, bg: np.ndarray, size: int = 192) -> np.ndarray:
    """Een naadloze tegel met de fijne structuur van het fluweel (zwart en wit, half doorzichtig)."""
    lum = card @ np.array([0.2126, 0.7152, 0.0722])
    base = box_blur(lum, 3)
    ratio = lum / np.maximum(base, 1e-6)
    # Een stuk zonder versiering en tekst: onder het sierstuk bovenaan, boven 'Fijne'.
    patch = ratio[170:170 + size, 200:200 + size]
    # Naadloos: meng de tegel met een kwart verschoven kopie, met een venster dat aan de randen nul is.
    win1 = np.sin(np.linspace(0, np.pi, size)) ** 2
    win = np.outer(win1, win1)
    shifted = np.roll(np.roll(patch, size // 2, 0), size // 2, 1)
    tile = (patch * win + shifted * (1 - win))
    dev = (tile - tile.mean()) * 0.9
    alpha = np.clip(np.abs(dev), 0, 1)
    white = (dev > 0).astype(float)
    return np.dstack([white, white, white, alpha])


def save_rgba(arr: np.ndarray, path: Path, scale: float = 1.0, quality: int = 86, alpha_quality: int = 90) -> None:
    img = Image.fromarray(np.clip(arr * 255 + 0.5, 0, 255).astype(np.uint8), "RGBA")
    if scale != 1:
        # Vergroten met voorvermenigvuldigd alfa, anders krijgen de randen een rode of zwarte zoom.
        img = img.convert("RGBa").resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS).convert("RGBA")
        img = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
    img.save(path, "WEBP", quality=quality, method=6, alpha_quality=alpha_quality)


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    video = Path(sys.argv[1])
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).resolve().parents[2] / "designs" / "kerstpaleis" / "v1" / "img"
    out.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as t:
        tmp = Path(t)
        card = average_card(video, tmp)
        rgba, bg = ornament_layer(card)
        layer, fleur = build_frame(rgba)
        save_rgba(layer, out / "lijst.webp", SCALE, quality=78, alpha_quality=80)
        save_rgba(fleur, out / "fleur.webp", SCALE * 2, quality=90)
        save_rgba(velvet_tile(card, bg), out / "velours.webp", quality=80)
        for name, (x0, y0, x1, y1) in ORNAMENTS.items():
            save_rgba(rgba[y0:y1, x0:x1], out / f"{name}.webp", 2, quality=90)
        # De achtergrond van de film als controlebeeld (niet nodig op de site).
        Image.fromarray(np.clip(bg * 255, 0, 255).astype(np.uint8)).save(tmp / "achtergrond.png")
        # Het eerste beeld van het stuk als poster (de deuren zijn nog dicht).
        run("ffmpeg", "-v", "error", "-y", "-ss", f"{DOOR_START:.2f}", "-i", str(video), "-frames:v", "1", str(tmp / "poster.png"))
        Image.open(tmp / "poster.png").convert("RGB").save(out / "poster.webp", "WEBP", quality=74, method=6)
    # De deuren: webm (VP9) en mp4 (H.264), zonder geluid, klein genoeg voor een telefoon.
    clip = ["-ss", f"{DOOR_START:.2f}", "-t", f"{DOOR_END - DOOR_START:.2f}", "-i", str(video), "-an"]
    run("ffmpeg", "-v", "error", "-y", *clip, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "36", "-row-mt", "1",
        "-deadline", "good", "-cpu-used", "2", "-pix_fmt", "yuv420p", str(out / "kerstpaleis.webm"))
    run("ffmpeg", "-v", "error", "-y", *clip, "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-profile:v", "high",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(out / "kerstpaleis.mp4"))
    for f in sorted(out.iterdir()):
        print(f"{f.name}: {f.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
