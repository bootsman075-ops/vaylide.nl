"""Aanmeldingen van gasten: valideren en veilig opslaan.

- Succes wordt pas gemeld nadat de transactie is vastgelegd.
- Dubbel tikken levert geen dubbele aanmelding op (uniek client_token per formulier).
- Deadline, maximaal aantal personen en totale capaciteit worden aan de serverzijde bewaakt.
- Gasten kunnen alleen hun eigen antwoord wijzigen via een geheime wijzigingslink.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

from django.db import IntegrityError, transaction
from django.db.models import Sum

from core.utils import new_token, token_digest

from .models import GuestResponse, Invitation

TOKEN_RE = re.compile(r"^[A-Za-z0-9_-]{16,64}$")


@dataclass
class RsvpResult:
    ok: bool
    errors: dict = field(default_factory=dict)
    values: dict = field(default_factory=dict)
    response: GuestResponse | None = None
    edit_token: str = ""


def attending_persons(invitation: Invitation, exclude_pk=None) -> int:
    qs = invitation.responses.filter(attending=True)
    if exclude_pk:
        qs = qs.exclude(pk=exclude_pk)
    return qs.aggregate(total=Sum("party_size"))["total"] or 0


def clean_submission(data, view: dict) -> tuple[dict, dict, dict]:
    """Geeft (schone waarden, fouten, ruwe waarden voor opnieuw tonen)."""
    rsvp = view["rsvp"]
    formal = view.get("formal")
    errors: dict[str, str] = {}
    raw = {
        "name": (data.get("name") or "").strip()[:200],
        "attending": data.get("attending") or "",
        "party_size": data.get("party_size") or "1",
        "remark": (data.get("remark") or "").strip()[:1200],
    }
    name = re.sub(r"\s+", " ", raw["name"])
    if not name:
        errors["name"] = "Vul uw naam in." if formal else "Vul je naam in."
    elif len(name) > 120:
        errors["name"] = "Gebruik maximaal 120 tekens."
    attending = raw["attending"]
    if attending not in ("ja", "nee"):
        errors["attending"] = "Kies of u erbij bent." if formal else "Kies of je erbij bent."
    is_attending = attending == "ja"
    party_size = 0
    if is_attending:
        try:
            party_size = int(raw["party_size"])
        except (TypeError, ValueError):
            party_size = 0
        if rsvp["max_party"] == 1:
            party_size = 1
        if party_size < 1 or party_size > rsvp["max_party"]:
            errors["party_size"] = f"Kies een aantal tussen 1 en {rsvp['max_party']}."
    answers = []
    for q in rsvp["questions"]:
        value = (data.get(q["field"]) or "").strip()[:300]
        raw[q["field"]] = value
        if not is_attending:
            continue
        if q["type"] == "yesno" and value and value not in ("Ja", "Nee"):
            errors[q["field"]] = "Kies ja of nee."
        elif q["type"] == "choice" and value and value not in q["options"]:
            errors[q["field"]] = "Kies een van de opties."
        elif q["required"] and not value:
            errors[q["field"]] = "Beantwoord deze vraag."
        if value:
            answers.append({"id": q["id"], "label": q["label"], "value": value})
    remark = raw["remark"][:1000] if rsvp["ask_remark"] else ""
    cleaned = {
        "name": name,
        "attending": is_attending,
        "party_size": party_size,
        "answers": answers,
        "remark": remark,
    }
    return cleaned, errors, raw


def submit_response(invitation: Invitation, data, view: dict, *, capacity: int | None) -> RsvpResult:
    cleaned, errors, raw = clean_submission(data, view)
    client_token = (data.get("client_token") or "").strip()
    if not TOKEN_RE.match(client_token):
        errors["algemeen"] = "Het formulier is verlopen. Vernieuw de pagina en probeer het opnieuw."
    if errors:
        return RsvpResult(ok=False, errors=errors, values=raw)

    edit_token = new_token()
    try:
        with transaction.atomic():
            inv = Invitation.objects.select_for_update().get(pk=invitation.pk)
            existing = GuestResponse.objects.filter(invitation=inv, client_token=client_token).first()
            if cleaned["attending"] and capacity:
                taken = attending_persons(inv, exclude_pk=existing.pk if existing else None)
                if taken + cleaned["party_size"] > capacity:
                    left = max(0, capacity - taken)
                    message = (
                        f"Er is nog plek voor {left} {'persoon' if left == 1 else 'personen'}."
                        if left
                        else "Het maximale aantal aanmeldingen is bereikt."
                    )
                    return RsvpResult(ok=False, errors={"party_size" if left else "algemeen": message}, values=raw)
            if existing:
                # Zelfde formulier opnieuw verstuurd (dubbel tikken of terugknop): bijwerken, niet verdubbelen.
                for key, value in cleaned.items():
                    setattr(existing, key, value)
                existing.edit_token_hash = token_digest(edit_token)
                existing.save()
                response = existing
            else:
                response = GuestResponse.objects.create(
                    invitation=inv,
                    client_token=client_token,
                    edit_token_hash=token_digest(edit_token),
                    **cleaned,
                )
    except IntegrityError:
        # Twee gelijktijdige verzoeken met hetzelfde formulier: het eerste heeft gewonnen.
        response = GuestResponse.objects.filter(invitation=invitation, client_token=client_token).first()
        if response is None:
            return RsvpResult(ok=False, errors={"algemeen": "Opslaan is niet gelukt. Probeer het opnieuw."}, values=raw)
        response.edit_token_hash = token_digest(edit_token)
        response.save(update_fields=["edit_token_hash", "updated_at"])
    return RsvpResult(ok=True, response=response, edit_token=edit_token, values=raw)


def find_by_edit_token(invitation: Invitation, token: str) -> GuestResponse | None:
    if not token or not TOKEN_RE.match(token):
        return None
    return GuestResponse.objects.filter(invitation=invitation, edit_token_hash=token_digest(token)).first()


def update_response(response: GuestResponse, data, view: dict, *, capacity: int | None) -> RsvpResult:
    cleaned, errors, raw = clean_submission(data, view)
    if errors:
        return RsvpResult(ok=False, errors=errors, values=raw)
    with transaction.atomic():
        inv = Invitation.objects.select_for_update().get(pk=response.invitation_id)
        if cleaned["attending"] and capacity:
            taken = attending_persons(inv, exclude_pk=response.pk)
            if taken + cleaned["party_size"] > capacity:
                left = max(0, capacity - taken)
                return RsvpResult(ok=False, errors={"party_size": f"Er is nog plek voor {left} {'persoon' if left == 1 else 'personen'}."}, values=raw)
        for key, value in cleaned.items():
            setattr(response, key, value)
        response.edit_count += 1
        response.save()
    return RsvpResult(ok=True, response=response, values=raw)
