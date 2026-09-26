"""QR-codes naar de gepubliceerde uitnodiging (PNG en SVG)."""
from __future__ import annotations

import io

import segno

DARK = "#2a1e1f"


def qr_png(url: str, scale: int = 12) -> bytes:
    buffer = io.BytesIO()
    segno.make(url, error="m").save(buffer, kind="png", scale=scale, border=4, dark=DARK, light="#ffffff")
    return buffer.getvalue()


def qr_svg(url: str) -> bytes:
    buffer = io.BytesIO()
    segno.make(url, error="m").save(buffer, kind="svg", scale=10, border=4, dark=DARK, light="#ffffff", xmldecl=False)
    return buffer.getvalue()
