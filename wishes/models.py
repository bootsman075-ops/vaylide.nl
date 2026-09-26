"""Extra wensen en persoonlijk contact (maatwerkaanvragen).

AI-inschattingen zijn uitsluitend intern zichtbaar. Er wordt niets toegezegd aan
de klant (geen prijs, haalbaarheid of opleverdatum) zonder akkoord van de eigenaar.
"""
from __future__ import annotations

import uuid

from django.conf import settings
from django.db import models

from catalog.models import format_euro


class CustomRequest(models.Model):
    class Status(models.TextChoices):
        RECEIVED = "received", "Ontvangen"
        IN_PROGRESS = "in_progress", "In behandeling"
        PROPOSAL = "proposal", "Voorstel klaar"
        AWAITING_PAYMENT = "awaiting_payment", "Akkoord / wacht op betaling"
        EXECUTING = "executing", "In uitvoering"
        DONE = "done", "Afgerond"
        CLOSED = "closed", "Gesloten"

    class Fit(models.TextChoices):
        STANDARD = "standard", "Lijkt binnen bestaande mogelijkheden te passen"
        CUSTOM = "custom", "Lijkt maatwerk"
        UNCLEAR = "unclear", "Onduidelijk, eerst navragen"

    OPEN_STATUSES = [Status.RECEIVED, Status.IN_PROGRESS, Status.PROPOSAL, Status.AWAITING_PAYMENT, Status.EXECUTING]

    uid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, verbose_name="klant", on_delete=models.CASCADE, related_name="custom_requests"
    )
    invitation = models.ForeignKey(
        "invitations.Invitation",
        verbose_name="uitnodiging",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="custom_requests",
    )
    subject = models.CharField("onderwerp", max_length=140)
    description = models.TextField("omschrijving", max_length=4000)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.RECEIVED)

    proposal_text = models.TextField("voorstel", blank=True)
    proposal_price_cents = models.PositiveIntegerField("prijs voorstel (centen)", null=True, blank=True)
    proposal_sent_at = models.DateTimeField(null=True, blank=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Interne AI-inschatting (nooit zichtbaar voor de klant).
    ai_summary = models.TextField(blank=True)
    ai_fit = models.CharField(max_length=10, choices=Fit.choices, blank=True)
    ai_approach = models.TextField(blank=True)
    ai_questions = models.TextField(blank=True)
    ai_source = models.CharField(max_length=20, blank=True)
    ai_generated_at = models.DateTimeField(null=True, blank=True)

    unread_by_staff = models.BooleanField(default=True)
    unread_by_customer = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "extra wens"
        verbose_name_plural = "extra wensen"
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return self.subject

    @property
    def reference(self) -> str:
        return f"W-{self.pk:05d}" if self.pk else "W-nieuw"

    @property
    def proposal_price_display(self) -> str:
        if self.proposal_price_cents is None:
            return "Geen meerprijs"
        return format_euro(self.proposal_price_cents)

    @property
    def is_open(self) -> bool:
        return self.status in self.OPEN_STATUSES


class RequestMessage(models.Model):
    request = models.ForeignKey(CustomRequest, on_delete=models.CASCADE, related_name="messages")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    from_staff = models.BooleanField(default=False)
    internal = models.BooleanField("interne notitie", default=False)
    body = models.TextField(max_length=4000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "bericht"
        verbose_name_plural = "berichten"
        ordering = ["created_at"]


def attachment_upload_path(instance: "RequestAttachment", filename: str) -> str:
    return f"wensen/{instance.request.uid}/{instance.uid}/{filename}"


class RequestAttachment(models.Model):
    uid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    request = models.ForeignKey(CustomRequest, on_delete=models.CASCADE, related_name="attachments")
    message = models.ForeignKey(
        RequestMessage, null=True, blank=True, on_delete=models.SET_NULL, related_name="attachments"
    )
    file = models.FileField(upload_to=attachment_upload_path, max_length=255)
    original_name = models.CharField(max_length=200)
    content_type = models.CharField(max_length=80)
    size_bytes = models.PositiveIntegerField(default=0)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "bijlage"
        verbose_name_plural = "bijlagen"
        ordering = ["created_at"]
