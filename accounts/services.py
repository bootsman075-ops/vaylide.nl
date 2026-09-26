"""Inloggen met een eenmalige code of link."""
from __future__ import annotations

from django.contrib.auth import login
from django.utils import timezone
from django.utils.http import url_has_allowed_host_and_scheme

from invitations.access import claim_session_drafts

from .models import LoginCode, User, normalize_email


def safe_next(request, value: str, default: str = "/account/") -> str:
    if value and url_has_allowed_host_and_scheme(value, allowed_hosts={request.get_host()}, require_https=request.is_secure()):
        return value
    return default


def complete_login(request, email: str) -> tuple[User | None, str]:
    """Maakt zo nodig het account aan, logt in en koppelt ontwerpen uit deze sessie."""
    email = normalize_email(email)
    user = User.objects.filter(email=email).first()
    if user and user.is_staff:
        return None, "Beheerders loggen in via de beheerderslogin met wachtwoord."
    if user and not user.is_active:
        return None, "Dit account is niet actief. Neem contact met ons op."
    if user is None:
        user = User.objects.create_user(email=email)
    if not user.email_verified_at:
        user.email_verified_at = timezone.now()
        user.save(update_fields=["email_verified_at"])
    login(request, user, backend="django.contrib.auth.backends.ModelBackend")
    claimed = claim_session_drafts(request, user)
    request.session["vierlief_claimed"] = claimed
    return user, ""


def verify_code(email: str, code: str) -> LoginCode | None:
    email = normalize_email(email)
    candidate = LoginCode.objects.filter(email=email, used_at__isnull=True).order_by("-created_at").first()
    if candidate is None or not candidate.is_usable:
        return None
    candidate.attempts += 1
    candidate.save(update_fields=["attempts"])
    if not candidate.check_code(code):
        return None
    candidate.used_at = timezone.now()
    candidate.save(update_fields=["used_at"])
    return candidate
