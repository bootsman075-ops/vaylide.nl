from django.urls import path

from . import views

app_name = "accounts"

urlpatterns = [
    path("inloggen/", views.login_view, name="login"),
    path("inloggen/code/", views.code_view, name="code"),
    path("inloggen/link/<str:token>/", views.link_view, name="link"),
    path("uitloggen/", views.logout_view, name="logout"),
]
