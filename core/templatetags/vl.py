"""Kleine templatehulpmiddelen voor Vierlief."""
from django import template

from catalog.models import format_euro

register = template.Library()


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
