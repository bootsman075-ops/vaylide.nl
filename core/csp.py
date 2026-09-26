"""Kleine inline scripts met een vaste hash in de Content-Security-Policy.

Alleen voor code die vóór de eerste weergave moet draaien en nooit verandert;
al het andere blijft in bestanden (script-src 'self').
"""
import base64
import hashlib

# Markeert dat JavaScript beschikbaar is, vóór de eerste weergave (geen extra verzoek).
BOOT_SCRIPT = 'document.documentElement.classList.add("js");'


def script_hash(code: str) -> str:
    return "'sha256-" + base64.b64encode(hashlib.sha256(code.encode("utf-8")).digest()).decode("ascii") + "'"


SCRIPT_HASHES = (script_hash(BOOT_SCRIPT),)
