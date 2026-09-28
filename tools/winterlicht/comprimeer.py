"""Maakt de reliëf- en goudbeelden van Winterlicht kleiner (draai dit na render.cjs).

Het tekenvlak in de browser bewaart WebP met een verliesvrij doorzichtig kanaal; voor deze zachte
reliëflagen is dat onnodig zwaar. Opnieuw opslaan met kwaliteit 72 (ook voor het doorzichtige kanaal)
halveert ze ongeveer, zonder zichtbaar verschil (vergeleken op dubbele pixeldichtheid).
Het huisje en de scènes blijven zoals ze zijn: daar gaf het doorzichtige kanaal zichtbare banden in de sneeuw.

Gebruik (vanuit de projectmap): .venv/bin/python tools/winterlicht/comprimeer.py
"""
from pathlib import Path

from PIL import Image

MAP = Path(__file__).resolve().parents[2] / "designs" / "winterlicht" / "v1" / "img"
NAMEN = ["relief-boven", "relief-krans", "relief-zijkant", "relief-patroon", "goud-boven", "goud-krans", "goud-zijkant"]

for naam in NAMEN:
    pad = MAP / f"{naam}.webp"
    voor = pad.stat().st_size
    Image.open(pad).save(pad, "WEBP", quality=72, alpha_quality=70, method=6)
    print(f"{pad.name}: {voor // 1024} KB -> {pad.stat().st_size // 1024} KB")
