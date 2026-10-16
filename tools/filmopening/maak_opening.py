"""Maakt van een filmpje van een envelop (of iets anders dat opengaat) een vloeiende opening voor een ontwerp.

Wat het doet:
1. meet per beeld hoeveel er beweegt (optische stroming);
2. vertraagt de snelle stukken zacht, met een snelheidscurve zonder schokken: het begin van de opening
   het meest (T_begin), daarna minder (T_later);
3. berekent de tussenbeelden met optische stroming (geen dubbele beelden, geen haperingen);
4. schrijft de hele vertraagde film (voor de eigenaar) en het stuk voor de uitnodiging (opening.mp4,
   en opening.webm voor browsers zonder H.264);
5. maakt de stilstaande beelden: het eerste beeld (envelop.webp, de poster) en het laatste beeld
   (kaart.webp, de achtergrond van de kop, met optioneel een opgeschoond vlak), plus versieringen.

Gebruik (zie README.md in deze map):
    python tools/filmopening/maak_opening.py rozenzegel <uitvoermap>

Nodig: ffmpeg en ffprobe, en in een eigen omgeving: pip install opencv-python-headless numpy
(niet in requirements.txt: alleen nodig om de beelden opnieuw te maken).
"""
from __future__ import annotations

import os
import shutil
import subprocess
import sys
from fractions import Fraction
from pathlib import Path

import cv2
import numpy as np

HERE = Path(__file__).resolve().parent

PRESETS = {
    "rozenzegel": {
        "bron": HERE / "rozenzegel-bron.mp4",
        "fps_uit": 30,
        # Beweging per bronbeeld (pixels op 720 breed) die nog op ware snelheid speelt; daarboven zacht vertragen.
        "T_begin": 2.0,
        "T_later": 3.2,
        # Van T_begin naar T_later tussen deze brontijden (seconden).
        "overgang": (4.3, 5.3),
        # Stuk voor de uitnodiging (brontijd): net voor het zegel gaat gloeien tot de kaart stil ligt.
        "web": (1.23, 7.86),
        "crf_web": 23,
        "crf_webm": 33,
        "crf_volledig": 16,
        # Laatste beeld: een half zichtbaar stukje zegel bovenin wegwerken (y < 80, helder).
        "opschonen": {"tot_y": 80, "drempel": 25},
        # Versieringen uit het eerste beeld: het lakzegel (midden en straal) en een strook van de envelop.
        "zegel": (361, 644, 92),
        "band": (330, 960),
    },
}


def run(cmd: list[str]) -> bytes:
    return subprocess.run(cmd, check=True, capture_output=True).stdout


def read_frames(path: Path, scale: tuple[int, int] | None = None, gray: bool = False) -> np.ndarray:
    w, h = (int(x) for x in run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                    "stream=width,height", "-of", "csv=p=0", str(path)]).decode().strip().split(","))
    vf = []
    if scale:
        vf.append(f"scale={scale[0]}:{scale[1]}")
        w, h = scale
    raw = run(["ffmpeg", "-v", "error", "-i", str(path)] + (["-vf", ",".join(vf)] if vf else [])
              + ["-f", "rawvideo", "-pix_fmt", "gray" if gray else "bgr24", "-"])
    shape = (-1, h, w) if gray else (-1, h, w, 3)
    return np.frombuffer(raw, np.uint8).reshape(shape)


def dis(fine: bool):
    d = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    if fine:
        d.setFinestScale(0)
        d.setPatchSize(12)
        d.setPatchStride(4)
        d.setGradientDescentIterations(25)
        d.setVariationalRefinementIterations(10)
    return d


def source_times(path: Path, p: dict, fps_in: float) -> tuple[np.ndarray, np.ndarray]:
    """Brontijd voor elk uitvoerbeeld, en de uitvoertijd per bronbeeld."""
    g = read_frames(path, scale=(360, 640), gray=True)
    flow = dis(False)
    v = [0.0] + [float(np.linalg.norm(flow.calc(g[i - 1], g[i], None), axis=2).mean()) * 2 for i in range(1, len(g))]
    v = np.array(v)
    kernel = np.exp(-0.5 * (np.arange(-8, 9) / 3.0) ** 2)
    kernel /= kernel.sum()
    vs = np.convolve(np.pad(v, 8, mode="edge"), kernel, mode="valid")
    s_grid = np.arange(len(v)) / fps_in
    a, b = p["overgang"]
    x = np.clip((s_grid - a) / (b - a), 0, 1)
    x = x * x * (3 - 2 * x)
    T = p["T_begin"] + (p["T_later"] - p["T_begin"]) * x
    slow = (1 + (vs / T) ** 3) ** (1 / 3)
    dt = slow / fps_in
    u = np.concatenate([[0], np.cumsum((dt[1:] + dt[:-1]) / 2)])
    uo = np.arange(0, u[-1], 1 / p["fps_uit"])
    return np.interp(uo, u, s_grid), u


def interpolate(frames, flows, i: int, t: float, grid: np.ndarray, flow) -> np.ndarray:
    """Beeld op tijd i+t tussen bronbeeld i en i+1, met zichtbaarheid uit voor- en achterwaartse stroming."""
    i0 = frames[i].astype(np.float32)
    i1 = frames[i + 1].astype(np.float32)
    if t <= 1e-4:
        return i0
    if t >= 1 - 1e-4:
        return i1
    if (i, i + 1) not in flows:
        flows.clear()
        g0 = cv2.cvtColor(frames[i], cv2.COLOR_BGR2GRAY)
        g1 = cv2.cvtColor(frames[i + 1], cv2.COLOR_BGR2GRAY)
        flows[(i, i + 1)] = (flow.calc(g0, g1, None), flow.calc(g1, g0, None))
    f01, f10 = flows[(i, i + 1)]

    def warp(img, f, interp=cv2.INTER_CUBIC):
        m = (grid + f).astype(np.float32)
        return cv2.remap(img, m[..., 0], m[..., 1], interp, borderMode=cv2.BORDER_REPLICATE)

    ft0 = -(1 - t) * t * f01 + t * t * f10
    ft1 = (1 - t) * (1 - t) * f01 - t * (1 - t) * f10
    w0, w1 = warp(i0, ft0), warp(i1, ft1)
    v0 = np.exp(-np.linalg.norm(f01 + warp(f10, f01, cv2.INTER_LINEAR), axis=2) / 2.0).astype(np.float32)
    v1 = np.exp(-np.linalg.norm(f10 + warp(f01, f10, cv2.INTER_LINEAR), axis=2) / 2.0).astype(np.float32)
    a = (1 - t) * warp(v0, ft0, cv2.INTER_LINEAR) + 1e-3
    b = t * warp(v1, ft1, cv2.INTER_LINEAR) + 1e-3
    return (a[..., None] * w0 + b[..., None] * w1) / (a + b)[..., None]


def encode(frame_dir: Path, start: int, count: int, fps: int, crf: int, out: Path) -> None:
    run(["ffmpeg", "-v", "error", "-y", "-framerate", str(fps), "-start_number", str(start), "-i", str(frame_dir / "b_%05d.png"),
         "-frames:v", str(count), "-c:v", "libx264", "-preset", "slow", "-crf", str(crf), "-profile:v", "high",
         "-pix_fmt", "yuv420p", "-g", str(fps * 2), "-movflags", "+faststart", "-an", str(out)])


def encode_webm(frame_dir: Path, start: int, count: int, fps: int, crf: int, out: Path) -> None:
    """Tweede bron voor browsers zonder H.264 (bijvoorbeeld Chromium zonder licentiecodecs)."""
    run(["ffmpeg", "-v", "error", "-y", "-framerate", str(fps), "-start_number", str(start), "-i", str(frame_dir / "b_%05d.png"),
         "-frames:v", str(count), "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", str(crf), "-row-mt", "1", "-deadline", "good",
         "-cpu-used", "2", "-pix_fmt", "yuv420p", "-g", str(fps * 2), "-an", str(out)])


def webp(img: np.ndarray, out: Path, quality: int = 84) -> None:
    cv2.imwrite(str(out), img, [cv2.IMWRITE_WEBP_QUALITY, quality])


def main() -> None:
    if len(sys.argv) != 3 or sys.argv[1] not in PRESETS:
        sys.exit(f"Gebruik: python {sys.argv[0]} <{'|'.join(PRESETS)}> <uitvoermap>")
    p = PRESETS[sys.argv[1]]
    out = Path(sys.argv[2])
    tmp = out / "_beelden"
    tmp.mkdir(parents=True, exist_ok=True)
    fps_in = float(Fraction(run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate",
                                 "-of", "csv=p=0", str(p["bron"])]).decode().strip()))  # bijv. "24/1"

    times, u = source_times(p["bron"], p, fps_in)
    print(f"bron {len(u) / fps_in:.2f} s -> vertraagd {len(times) / p['fps_uit']:.2f} s ({len(times)} beelden)")
    frames = read_frames(p["bron"])
    h, w = frames.shape[1:3]
    gx, gy = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    grid = np.dstack([gx, gy])
    flow, flows = dis(True), {}
    n = len(frames)
    for k, s in enumerate(times):
        pos = float(min(max(s * fps_in, 0), n - 1))
        i = int(pos)
        t = pos - i
        if i >= n - 1:
            i, t = n - 2, 1.0
        img = interpolate(frames, flows, i, t, grid, flow)
        cv2.imwrite(str(tmp / f"b_{k:05d}.png"), np.clip(img + 0.5, 0, 255).astype(np.uint8))

    encode(tmp, 0, len(times), p["fps_uit"], p["crf_volledig"], out / "volledig-langzaam.mp4")
    first = int(np.searchsorted(times, p["web"][0]))
    last = int(np.searchsorted(times, p["web"][1]))
    encode(tmp, first, last - first + 1, p["fps_uit"], p["crf_web"], out / "opening.mp4")
    encode_webm(tmp, first, last - first + 1, p["fps_uit"], p["crf_webm"], out / "opening.webm")

    poster = cv2.imread(str(tmp / f"b_{first:05d}.png"))
    end = cv2.imread(str(tmp / f"b_{last:05d}.png"))
    webp(poster, out / "envelop.webp")
    clean = p.get("opschonen")
    if clean:
        g = cv2.cvtColor(end, cv2.COLOR_BGR2GRAY)
        mask = np.zeros(g.shape, np.uint8)
        top = mask[: clean["tot_y"]]
        top[g[: clean["tot_y"]] > clean["drempel"]] = 255
        mask = cv2.dilate(mask, np.ones((9, 9), np.uint8))
        end = cv2.inpaint(end, mask, 7, cv2.INPAINT_TELEA)
    webp(end, out / "kaart.webp")

    # Het lakzegel, los (met doorzichtige rand), uit het eerste beeld.
    cx, cy, r = p["zegel"]
    gray = cv2.cvtColor(poster, cv2.COLOR_BGR2GRAY)
    yy, xx = np.mgrid[0:h, 0:w]
    m = ((gray > 105) & (((xx - cx) ** 2 + (yy - cy) ** 2) <= r * r)).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    _, labels, _, _ = cv2.connectedComponentsWithStats(m)
    m = (labels == labels[cy, cx]).astype(np.uint8) * 255
    filled = m.copy()
    cv2.floodFill(filled, np.zeros((h + 2, w + 2), np.uint8), (0, 0), 255)
    m = cv2.erode(m | cv2.bitwise_not(filled), np.ones((3, 3), np.uint8))
    alpha = cv2.GaussianBlur(m, (0, 0), 1.1)
    x0, y0 = cx - 120, cy - 120
    seal = np.dstack([poster[y0:y0 + 240, x0:x0 + 240], alpha[y0:y0 + 240, x0:x0 + 240]])
    webp(seal, out / "zegel.webp", 90)

    # Strook van de dichte envelop (rozen links en rechts, zegel in het midden) voor de afsluiting.
    top_y, bottom_y = p["band"]
    webp(poster[top_y:bottom_y], out / "envelop-band.webp", 82)

    shutil.rmtree(tmp)
    for name in sorted(os.listdir(out)):
        print(f"{name}: {(out / name).stat().st_size / 1024:.0f} kB")


if __name__ == "__main__":
    main()
