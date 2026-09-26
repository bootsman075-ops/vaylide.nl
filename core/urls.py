from django.urls import path

from . import views

app_name = "core"

urlpatterns = [
    path("", views.home, name="home"),
    path("ontwerpen/", views.designs, name="designs"),
    path("ontwerpen/<slug:slug>/", views.design_detail, name="design_detail"),
    path("zo-werkt-het/", views.how, name="how"),
    path("prijzen/", views.pricing, name="pricing"),
    path("veelgestelde-vragen/", views.faq, name="faq"),
    path("contact/", views.contact, name="contact"),
    path("privacy/", views.privacy, name="privacy"),
    path("voorwaarden/", views.terms, name="terms"),
    path("robots.txt", views.robots_txt, name="robots"),
    path("sitemap.xml", views.sitemap_xml, name="sitemap"),
    path("healthz", views.healthz, name="healthz"),
]
