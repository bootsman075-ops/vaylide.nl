"""Tokens voor de eigen Etsy-shop. Alleen versleutelde tokens worden opgeslagen."""
from django.db import models


class EtsyConnection(models.Model):
    """Maximaal één gekoppeld Etsy-verkoopaccount voor Vaylide."""

    identifier = models.CharField(max_length=20, unique=True, default="primary")
    etsy_user_id = models.CharField(max_length=40)
    access_token_encrypted = models.TextField()
    refresh_token_encrypted = models.TextField()
    expires_at = models.DateTimeField()
    scopes = models.CharField(max_length=300, blank=True)
    connected_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Etsy-verbinding"
        verbose_name_plural = "Etsy-verbindingen"

    def __str__(self):
        return f"Etsy-account {self.etsy_user_id}"
