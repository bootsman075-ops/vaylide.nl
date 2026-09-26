from django.urls import path

from . import views

app_name = "invitations"

urlpatterns = [
    path("voorbeeld/<slug:slug>/", views.demo, name="demo"),
    path("voorbeeld/<slug:slug>/agenda.ics", views.demo_ics, name="demo_ics"),
    path("u/<slug:slug>/", views.public_invitation, name="public"),
    path("u/<slug:slug>/aanmelden/", views.rsvp_submit, name="rsvp"),
    path("u/<slug:slug>/antwoord/<str:token>/", views.rsvp_edit, name="rsvp_edit"),
    path("u/<slug:slug>/agenda.ics", views.public_ics, name="ics"),
    path("u/<slug:slug>/media/<uuid:asset_uid>/<str:variant>/", views.public_media, name="media"),
]
