"""Voorbeeldafbeeldingen van ontwerpen, met een nette terugval.

Een nieuw ontwerp zonder eigen afbeelding (static/img/designs/<code>.webp) krijgt
een neutrale standaardafbeelding, zodat pagina's nooit een fout geven.
"""
from functools import lru_cache

from django.contrib.staticfiles import finders
from django.templatetags.static import static

PLACEHOLDER = "img/designs/_standaard.webp"


@lru_cache(maxsize=128)
def design_image_path(slug: str) -> str:
    name = f"img/designs/{slug}.webp"
    return name if finders.find(name) else PLACEHOLDER


def design_image_url(slug: str) -> str:
    return static(design_image_path(slug))
