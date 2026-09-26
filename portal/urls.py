from django.urls import path

from . import views

app_name = "portal"

urlpatterns = [
    path("", views.home, name="home"),
    path("gegevens/", views.account, name="account"),
    path("uitnodiging/<uuid:uid>/", views.invitation_detail, name="invitation"),
    path("uitnodiging/<uuid:uid>/gasten/", views.guests, name="guests"),
    path("uitnodiging/<uuid:uid>/gasten/export.csv", views.guests_export, name="guests_export"),
    path("uitnodiging/<uuid:uid>/gasten/<uuid:response_uid>/verwijderen/", views.delete_guest, name="delete_guest"),
    path("uitnodiging/<uuid:uid>/qr.<str:fmt>", views.qr_code, name="qr"),
    path("uitnodiging/<uuid:uid>/verwijderen/", views.invitation_delete, name="invitation_delete"),
    path("wensen/", views.wishes, name="wishes"),
    path("wensen/nieuw/", views.wish_new, name="wish_new"),
    path("wensen/<uuid:uid>/", views.wish_detail, name="wish"),
    path("wensen/<uuid:uid>/bijlage/<uuid:attachment_uid>/", views.wish_attachment, name="wish_attachment"),
]
