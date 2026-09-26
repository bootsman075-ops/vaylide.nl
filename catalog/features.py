"""Functies die per pakket of als extra optie worden ontgrendeld.

Alle overige onderdelen (openingsscherm, afteller, programma, locatie, dresscode,
praktische info, aanmelden, contactpersoon, afsluiting, agenda, delen, QR-code en
één hoofdfoto) zitten altijd in de basis.
"""

FEATURES = {
    "story": "Persoonlijk verhaal",
    "gallery": "Fotogalerij",
    "music": "Muziek",
    "extra_questions": "Extra vragen bij aanmelden",
}

# Welke sectie of instelling hoort bij welke functie.
SECTION_FEATURE = {
    "story": "story",
    "gallery": "gallery",
    "music": "music",
}


def feature_label(key: str) -> str:
    return FEATURES.get(key, key)
