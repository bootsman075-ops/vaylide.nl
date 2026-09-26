"""Kleine templatehulpmiddelen voor Vierlief."""
from django import template

from catalog.assets import design_image_url
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
