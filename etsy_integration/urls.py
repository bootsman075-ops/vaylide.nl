"""Etsy-app OAuth callback (het exact bij Etsy geregistreerde pad)."""
from django.urls import path

from . import views

app_name = "etsy_integration"

urlpatterns = [
    path("callback/", views.callback, name="callback"),
]
