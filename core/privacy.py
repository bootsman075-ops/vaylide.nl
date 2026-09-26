"""Verwijderen van klantgegevens, verlopen uitnodigingen en bewaartermijnen.

- Bestellingen blijven bewaard voor de boekhouding (wettelijke bewaarplicht);
  de koppeling met de verwijderde uitnodiging vervalt en het account wordt
  geanonimiseerd.
- Foto's, muziek, bijlagen, aanmeldingen en versies worden echt verwijderd.
"""
from __future__ import annotations

import logging
from datetime import timedelta

from django.db import transaction
from django.utils import timezone

log = logging.getLogger(__name__)


def delete_invitation(invitation) -> None:
    from invitations.models import MediaAsset

    with transaction.atomic():
        for asset in MediaAsset.objects.filter(invitation=invitation):
            asset.delete_files()
        invitation.delete()


def delete_custom_request(req) -> None:
    for attachment in req.attachments.all():
        if attachment.file and attachment.file.name:
            attachment.file.storage.delete(attachment.file.name)
    req.delete()


def anonymize_user(user) -> None:
    from invitations.models import Invitation
    from wishes.models import CustomRequest

    with transaction.atomic():
        for invitation in Invitation.objects.filter(owner=user):
            delete_invitation(invitation)
        for req in CustomRequest.objects.filter(customer=user):
            delete_custom_request(req)
        user.email = f"verwijderd-{user.pk}@vierlief.invalid"
        user.name = ""
        user.is_active = False
        user.set_unusable_password()
        user.anonymized_at = timezone.now()
        user.save()


def apply_retention(now=None) -> dict:
    """Voert bewaartermijnen uit. Draai dagelijks: manage.py apply_retention."""
    from accounts.models import LoginCode
    from invitations.models import GuestResponse, Invitation

    from .models import SiteConfig

    now = now or timezone.now()
    config = SiteConfig.get()
    report = {}

    expired = Invitation.objects.filter(status=Invitation.Status.LIVE, available_until__lt=now)
    report["verlopen_uitnodigingen"] = expired.update(status=Invitation.Status.EXPIRED)

    guest_cutoff = now - timedelta(days=config.guest_data_retention_days)
    old_guests = GuestResponse.objects.filter(
        invitation__status__in=[Invitation.Status.EXPIRED, Invitation.Status.OFFLINE],
        invitation__available_until__lt=guest_cutoff,
    )
    report["verwijderde_aanmeldingen"] = old_guests.count()
    old_guests.delete()

    anon_cutoff = now - timedelta(days=config.anonymous_draft_retention_days)
    anon = Invitation.objects.filter(owner__isnull=True, status=Invitation.Status.DRAFT, updated_at__lt=anon_cutoff)
    report["verwijderde_anonieme_concepten"] = anon.count()
    for invitation in anon:
        delete_invitation(invitation)

    draft_cutoff = now - timedelta(days=config.unpaid_draft_retention_days)
    stale = Invitation.objects.filter(owner__isnull=False, status=Invitation.Status.DRAFT, updated_at__lt=draft_cutoff, orders__isnull=True)
    report["verwijderde_oude_concepten"] = stale.count()
    for invitation in stale:
        delete_invitation(invitation)

    report["verwijderde_inlogcodes"] = LoginCode.objects.filter(created_at__lt=now - timedelta(days=2)).delete()[0]
    return report
