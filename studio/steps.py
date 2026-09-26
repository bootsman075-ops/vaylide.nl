"""Stappen van het samenstellen."""

STEPS = [
    ("gelegenheid", "Gelegenheid"),
    ("ontwerp", "Ontwerp"),
    ("gegevens", "Gegevens"),
    ("programma", "Programma & info"),
    ("aanmelden", "Aanmelden"),
    ("fotos", "Foto's & verhaal"),
    ("stijl", "Stijl & onderdelen"),
    ("voorbeeld", "Voorbeeld"),
    ("bestellen", "Bestellen"),
]
STEP_KEYS = [key for key, _ in STEPS]
STEP_LABELS = dict(STEPS)
FORM_STEPS = ["ontwerp", "gegevens", "programma", "aanmelden", "fotos", "stijl"]


def next_step(step: str, *, paid: bool = False) -> str:
    keys = [k for k in STEP_KEYS if k != "gelegenheid" and not (paid and k == "bestellen")]
    index = keys.index(step) if step in keys else 0
    return keys[min(index + 1, len(keys) - 1)]


def previous_step(step: str) -> str:
    keys = [k for k in STEP_KEYS if k != "gelegenheid"]
    index = keys.index(step) if step in keys else 0
    return keys[max(index - 1, 0)]


def progress(current: str, *, paid: bool = False) -> list[dict]:
    items = []
    keys = [k for k in STEP_KEYS if not (paid and k == "bestellen")]
    current_index = keys.index(current) if current in keys else 0
    for index, key in enumerate(keys):
        items.append(
            {
                "key": key,
                "label": STEP_LABELS[key],
                "number": index + 1,
                "state": "done" if index < current_index else ("current" if index == current_index else "todo"),
                "linkable": key not in ("gelegenheid",),
            }
        )
    return items
