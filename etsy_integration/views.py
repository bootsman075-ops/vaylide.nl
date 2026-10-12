"""OAuth2 + PKCE voor de eigen Etsy-winkel.

Verzend tokens NOOIT naar de browser. Een server-side sessie bewaart tijdelijk
de CSRF-state en PKCE-verifier; de database bevat alleen Fernet-ciphertext.
Dit verzorgt alleen accountautorisatie, nog geen ordersynchronisatie.
"""
from __future__ import annotations

import base64
import hashlib
import json
import logging
import secrets
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import timedelta

from cryptography.fernet import Fernet
from django.conf import settings
from django.contrib import messages
from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import redirect
from django.utils import timezone
from django.views.decorators.http import require_GET

from beheer.views import staff_required
from .models import EtsyConnection

LOGGER = logging.getLogger(__name__)
PENDING_SESSION_KEY = "etsy_oauth_pending"
AUTH_URL = "https://www.etsy.com/oauth/connect"
TOKEN_URL = "https://api.etsy.com/v3/public/oauth/token"
SCOPES = "shops_r transactions_r"


def _configured():
    if not settings.ETSY_ENABLED:
        return None
    if not (settings.ETSY_CLIENT_ID and settings.ETSY_REDIRECT_URI and settings.ETSY_FERNET_KEY):
        return None
    if not settings.ETSY_REDIRECT_URI.startswith("https://"):
        return None
    try:
        return Fernet(settings.ETSY_FERNET_KEY.encode("ascii"))
    except (ValueError, TypeError):
        return None


@staff_required
@require_GET
def connect(request):
    """Begin expliciet door de eigenaar gestarte Etsy-toestemming."""
    cipher = _configured()
    if cipher is None:
        return HttpResponse("Etsy is nog niet veilig geconfigureerd op de server.", status=503)

    state = secrets.token_urlsafe(32)
    verifier = secrets.token_urlsafe(64)
    challenge = base64.urlsafe_b64encode(
        hashlib.sha256(verifier.encode("ascii")).digest()
    ).decode("ascii").rstrip("=")
    request.session[PENDING_SESSION_KEY] = {
        "state": state,
        "verifier": verifier,
        "created_at": time.time(),
    }
    request.session.modified = True

    params = {
        "response_type": "code",
        "client_id": settings.ETSY_CLIENT_ID,
        "redirect_uri": settings.ETSY_REDIRECT_URI,
        "scope": SCOPES,
        "state": state,
        "code_challenge": challenge,
        "code_challenge_method": "S256",
    }
    return redirect(AUTH_URL + "?" + urllib.parse.urlencode(params))


@staff_required
@require_GET
def callback(request):
    """Ontvang Etsy-code, controleer state, wissel server-side om voor tokens."""
    pending = request.session.pop(PENDING_SESSION_KEY, None)
    request.session.modified = True
    if _configured() is None:
        return HttpResponse("Etsy is niet geconfigureerd.", status=503)
    if not isinstance(pending, dict):
        return HttpResponseBadRequest("Geen lopende Etsy-verbinding. Begin opnieuw in Vaylide.")

    expected = str(pending.get("state") or "")
    supplied = str(request.GET.get("state") or "")
    age = time.time() - float(pending.get("created_at") or 0)
    if not expected or not supplied or len(supplied) > 256 or not secrets.compare_digest(expected, supplied) or not (0 <= age <= 600):
        return HttpResponseBadRequest("Ongeldige of verlopen Etsy-toestemming.")

    if request.GET.get("error"):
        return HttpResponseBadRequest("Etsy-toestemming niet verleend.")
    code = str(request.GET.get("code") or "")
    verifier = str(pending.get("verifier") or "")
    if not code or len(code) > 2048 or len(verifier) < 43 or len(verifier) > 128:
        return HttpResponseBadRequest("Onvolledige Etsy-autorisation.")

    payload = urllib.parse.urlencode({
        "grant_type": "authorization_code",
        "client_id": settings.ETSY_CLIENT_ID,
        "redirect_uri": settings.ETSY_REDIRECT_URI,
        "code": code,
        "code_verifier": verifier,
    }).encode("utf-8")
    req = urllib.request.Request(
        TOKEN_URL,
        data=payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            token_data = json.loads(response.read(16384))
        access = token_data["access_token"]
        refresh = token_data["refresh_token"]
        if not isinstance(access, str) or not isinstance(refresh, str):
            raise ValueError("Ongeldige tokenvelden")
        user_id = access.split(".", 1)[0]
        if not user_id.isdigit() or not (10 <= len(access) <= 4096 and 10 <= len(refresh) <= 4096):
            raise ValueError("Ongeldige Etsy-token")
        expires_seconds = int(token_data["expires_in"])
        if not (60 <= expires_seconds <= 86400):
            raise ValueError("Ongeldige geldigheidsduur")
        cipher = _configured()
        EtsyConnection.objects.update_or_create(
            identifier="primary",
            defaults={
                "etsy_user_id": user_id,
                "access_token_encrypted": cipher.encrypt(access.encode("utf-8")).decode("ascii"),
                "refresh_token_encrypted": cipher.encrypt(refresh.encode("utf-8")).decode("ascii"),
                "expires_at": timezone.now() + timedelta(seconds=expires_seconds),
                "scopes": str(token_data.get("scope") or "")[:300],
            },
        )
    except (urllib.error.URLError, TimeoutError, ValueError, KeyError, TypeError, json.JSONDecodeError):
        LOGGER.warning("Etsy OAuth: tokenuitwisseling mislukt, zonder tokengegevens te loggen")
        return HttpResponse("Etsy-koppeling is niet gelukt. Probeer het later opnieuw.", status=502)

    messages.success(request, "Etsy-account veilig verbonden. Bestellingen synchroniseren nog niet automatisch.")
    return redirect("beheer:dashboard")
