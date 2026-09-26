"""Kleine templatehulpmiddelen voor Vierlief."""
from django import template
from django.utils.safestring import mark_safe

from catalog.assets import design_image_url
from core.csp import BOOT_SCRIPT
from catalog.models import format_euro

register = template.Library()


@register.simple_tag
def design_image(slug):
    """URL van de voorbeeldafbeelding van een ontwerp (met standaardafbeelding als terugval)."""
    return design_image_url(slug)


@register.filter
def get_item(mapping, key):
    try:
        return mapping.get(key, "")
    except AttributeError:
        return ""


@register.filter
def euro(cents):
    return format_euro(cents)


@register.filter
def initial(value):
    value = str(value or "").strip()
    return value[:1].upper() if value else ""


@register.simple_tag
def boot_script():
    """Inline startscript; de hash staat in de Content-Security-Policy (core/csp.py)."""
    return mark_safe(f"<script>{BOOT_SCRIPT}</script>")
