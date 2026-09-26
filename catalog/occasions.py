"""Gelegenheden en de bijbehorende vragen.

Per gelegenheid staat hier welke naam-/titelvelden gevraagd worden, welke
standaardkop op de uitnodiging staat en welke onderdelen standaard aan staan.
Zo toont de vragenlijst alleen vragen die bij de gelegenheid passen.
"""
from __future__ import annotations

OCCASION_CHOICES = [
    ("bruiloft", "Bruiloft"),
    ("verloving", "Verloving"),
    ("verjaardag", "Verjaardag"),
    ("jubileum", "Jubileum"),
    ("babyshower", "Babyshower"),
    ("zakelijk", "Zakelijk evenement"),
]
OCCASION_LABELS = dict(OCCASION_CHOICES)

# Velden voor namen/titel per gelegenheid: (sleutel, label, verplicht, max_lengte, hulptekst)
OCCASIONS: dict[str, dict] = {
    "bruiloft": {
        "label": "Bruiloft",
        "intro": "Voor jullie trouwdag, van ceremonie tot feest.",
        "name_fields": [
            ("partner_1", "Naam partner 1", True, 60, "Zoals je hem op de uitnodiging wilt zien, bijv. alleen de voornaam."),
            ("partner_2", "Naam partner 2", True, 60, ""),
        ],
        "default_headline": "Wij gaan trouwen",
        "invite_line": "nodigen je van harte uit voor hun bruiloft",
        "story_title": "Ons verhaal",
        "story_default": True,
        "program_hint": "Bijv. 14:00 Ceremonie, 15:30 Toost, 18:00 Diner, 21:00 Feest",
    },
    "verloving": {
        "label": "Verloving",
        "intro": "Vier jullie ja-woord met familie en vrienden.",
        "name_fields": [
            ("partner_1", "Naam partner 1", True, 60, ""),
            ("partner_2", "Naam partner 2", True, 60, ""),
        ],
        "default_headline": "Wij zijn verloofd",
        "invite_line": "nodigen je uit om hun verloving te vieren",
        "story_title": "Hoe het begon",
        "story_default": True,
        "program_hint": "Bijv. 16:00 Ontvangst, 17:00 Toost, 18:00 Buffet",
    },
    "verjaardag": {
        "label": "Verjaardag",
        "intro": "Voor een verjaardag die je niet wilt laten voorbijgaan.",
        "name_fields": [
            ("person_name", "Naam jarige", True, 60, ""),
            ("age", "Leeftijd (optioneel)", False, 3, "Laat leeg als je de leeftijd niet wilt noemen."),
        ],
        "default_headline": "Kom je ook?",
        "invite_line": "nodigt je uit voor een feestje",
        "story_title": "Over de jarige",
        "story_default": False,
        "program_hint": "Bijv. 20:00 Inloop, 20:30 Taart, 22:00 Muziek",
    },
    "jubileum": {
        "label": "Jubileum",
        "intro": "Voor een huwelijks- of bedrijfsjubileum.",
        "name_fields": [
            ("honorees", "Wie vieren het jubileum?", True, 90, "Bijv. Ria & Kees of de naam van een organisatie."),
            ("years", "Aantal jaar (optioneel)", False, 3, ""),
        ],
        "default_headline": "Wij vieren ons jubileum",
        "invite_line": "nodigen je uit om dit bijzondere jubileum te vieren",
        "story_title": "Terugblik",
        "story_default": True,
        "program_hint": "Bijv. 15:00 Ontvangst, 16:00 Woordje, 17:30 Diner",
    },
    "babyshower": {
        "label": "Babyshower",
        "intro": "Een warm welkom voor de kleine die op komst is.",
        "name_fields": [
            ("parents", "Naam (aanstaande) ouder(s)", True, 90, ""),
            ("baby_name", "Naam van de baby (optioneel)", False, 60, "Alleen invullen als die al bekend mag zijn."),
        ],
        "default_headline": "Er is iets kleins op komst",
        "invite_line": "nodigen je uit voor een babyshower",
        "story_title": "Over ons",
        "story_default": False,
        "program_hint": "Bijv. 14:00 Ontvangst, 14:30 Spelletjes, 16:00 Cadeautjes",
    },
    "zakelijk": {
        "label": "Zakelijk evenement",
        "intro": "Voor een lancering, relatie-evenement of zakelijke viering.",
        "name_fields": [
            ("event_title", "Naam van het evenement", True, 90, "Bijv. Jubileumborrel of Productlancering."),
            ("organization", "Organisatie", True, 90, ""),
        ],
        "default_headline": "Graag nodigen wij u uit",
        "invite_line": "nodigt u uit",
        "story_title": "Over dit evenement",
        "story_default": False,
        "program_hint": "Bijv. 16:00 Ontvangst, 16:30 Presentatie, 17:30 Netwerkborrel",
        "formal": True,
    },
}


def occasion_config(key: str) -> dict:
    return OCCASIONS.get(key) or OCCASIONS["bruiloft"]


def display_title(occasion: str, content: dict) -> str:
    """Leesbare titel van een uitnodiging op basis van de ingevulde namen."""
    n = content.get("names") or {}
    if occasion in ("bruiloft", "verloving"):
        a, b = (n.get("partner_1") or "").strip(), (n.get("partner_2") or "").strip()
        if a and b:
            return f"{a} & {b}"
        return a or b
    if occasion == "verjaardag":
        return (n.get("person_name") or "").strip()
    if occasion == "jubileum":
        return (n.get("honorees") or "").strip()
    if occasion == "babyshower":
        return (n.get("parents") or "").strip()
    if occasion == "zakelijk":
        return (n.get("event_title") or "").strip()
    return ""


def monogram(occasion: str, content: dict) -> str:
    """Initialen voor het zegel, bijv. 'S&D'."""
    n = content.get("names") or {}
    if occasion in ("bruiloft", "verloving"):
        a, b = (n.get("partner_1") or "").strip(), (n.get("partner_2") or "").strip()
        if a and b:
            return f"{a[0].upper()}&{b[0].upper()}"
        return (a or b or "V")[0].upper()
    title = display_title(occasion, content)
    letters = [w[0].upper() for w in title.replace("&", " ").split() if w and w[0].isalnum()]
    return "".join(letters[:2]) or "V"
