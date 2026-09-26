"""Agenda-bestand (.ics) voor 'Zet in je agenda'."""
from __future__ import annotations

from datetime import timedelta, timezone as dt_timezone

from django.utils import timezone


def _escape(text: str) -> str:
    return (
        (text or "")
        .replace("\\", "\\\\")
        .replace(";", "\\;")
        .replace(",", "\\,")
        .replace("\r\n", "\\n")
        .replace("\n", "\\n")
    )


def _fold(line: str) -> str:
    raw = line.encode("utf-8")
    if len(raw) <= 75:
        return line
    parts, current = [], b""
    for ch in line:
        encoded = ch.encode("utf-8")
        if len(current) + len(encoded) > (75 if not parts else 74):
            parts.append(current.decode("utf-8"))
            current = b""
        current += encoded
    parts.append(current.decode("utf-8"))
    return "\r\n ".join(parts)


def build_ics(*, uid: str, title: str, start, end, location: str, description: str, url: str) -> str:
    fmt = "%Y%m%dT%H%M%SZ"
    end = end or start + timedelta(hours=4)
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Vierlief//Uitnodiging//NL",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        f"UID:{uid}@vierlief",
        f"DTSTAMP:{timezone.now().astimezone(dt_timezone.utc).strftime(fmt)}",
        f"DTSTART:{start.astimezone(dt_timezone.utc).strftime(fmt)}",
        f"DTEND:{end.astimezone(dt_timezone.utc).strftime(fmt)}",
        f"SUMMARY:{_escape(title)}",
        f"LOCATION:{_escape(location)}",
        f"DESCRIPTION:{_escape(description)}",
    ]
    if url:
        lines.append(f"URL:{url}")
    lines += ["END:VEVENT", "END:VCALENDAR"]
    return "\r\n".join(_fold(line) for line in lines) + "\r\n"
