"""Gestructureerde gegevens (JSON-LD) voor zoekmachines.

Alleen feiten die ook op de website staan: geen reviews, klantenaantallen, adressen
of prijzen die nog voorlopig zijn (zie CLAUDE.md, regel 8).
"""
import json

from django.conf import settings
from django.templatetags.static import static
from django.utils.safestring import mark_safe


def absolute(path: str) -> str:
    return path if path.startswith("http") else f"{settings.BASE_URL}{path}"


def organization() -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": f"{settings.BASE_URL}/#organisatie",
        "name": "Vaylide",
        "url": f"{settings.BASE_URL}/",
        "logo": absolute(static("img/merk/vaylide-logo.png")),
    }


def website() -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": f"{settings.BASE_URL}/#website",
        "name": "Vaylide",
        "url": f"{settings.BASE_URL}/",
        "inLanguage": "nl-NL",
        "publisher": {"@id": f"{settings.BASE_URL}/#organisatie"},
    }


def breadcrumbs(items: list[tuple[str, str]]) -> dict:
    """items: lijst van (naam, pad), van de homepage naar de huidige pagina."""
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i, "name": name, "item": absolute(path)}
            for i, (name, path) in enumerate(items, start=1)
        ],
    }


def render_json_ld(data: dict) -> str:
    """Veilige <script type="application/ld+json">: een gegevensblok, geen uitvoerbaar script."""
    payload = json.dumps(data, ensure_ascii=False).replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026")
    return mark_safe(f'<script type="application/ld+json">{payload}</script>')
