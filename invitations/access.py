"""Toegangscontrole voor uitnodigingen.

Een klant ziet alleen eigen uitnodigingen. Een ontwerp zonder account is alleen
bereikbaar in de browsersessie waarin het is gestart. Beheerders (is_staff)
hebben toegang tot alles.
"""
from __future__ import annotations

from django.http import Http404
from django.shortcuts import get_object_or_404

from .models import Invitation

SESSION_KEY = "vierlief_concepten"


def session_drafts(request) -> list[str]:
    return list(request.session.get(SESSION_KEY, []))


def remember_draft(request, invitation: Invitation) -> None:
    drafts = session_drafts(request)
    uid = str(invitation.uid)
    if uid not in drafts:
        drafts.append(uid)
        request.session[SESSION_KEY] = drafts[-20:]


def forget_draft(request, invitation: Invitation) -> None:
    drafts = [d for d in session_drafts(request) if d != str(invitation.uid)]
    request.session[SESSION_KEY] = drafts


def can_access(request, invitation: Invitation) -> bool:
    user = request.user
    if user.is_authenticated and user.is_staff:
        return True
    if invitation.owner_id is not None:
        return user.is_authenticated and invitation.owner_id == user.id
    return str(invitation.uid) in session_drafts(request)


def get_accessible_invitation(request, uid) -> Invitation:
    invitation = get_object_or_404(
        Invitation.objects.select_related("template_version__template", "published_version", "owner"), uid=uid
    )
    if not can_access(request, invitation):
        # Bewust 404 i.p.v. 403: we verklappen niet dat de uitnodiging bestaat.
        raise Http404("Niet gevonden")
    return invitation


def claim_session_drafts(request, user) -> int:
    """Koppelt ontwerpen uit deze browsersessie aan het (net geverifieerde) account."""
    uids = session_drafts(request)
    if not uids:
        return 0
    count = Invitation.objects.filter(uid__in=uids, owner__isnull=True).update(owner=user)
    return count
