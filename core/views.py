"""Commerciële website: home, ontwerpen, uitleg, prijzen, vragen, contact en juridische pagina's."""
from __future__ import annotations

from django.conf import settings
from django.contrib import messages
from django.http import Http404, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.http import require_http_methods

from catalog.models import AddOn, Package, Template
from catalog.occasions import OCCASION_CHOICES, OCCASION_LABELS
from invitations.demo import DEFAULT_DEMO_OCCASION

from .content import FAQ, FEATURES, STEPS
from .forms import ContactForm
from .models import ContactMessage, SiteConfig
from .utils import form_age_seconds, ip_fingerprint, rate_limit, signed_timestamp


def _designs():
    return list(Template.objects.filter(is_active=True, current_version__isnull=False).select_related("current_version"))


def _design_cards(designs, occasion=""):
    cards = []
    for template in designs:
        version = template.current_version
        demo_occasion = occasion if occasion in template.occasions else DEFAULT_DEMO_OCCASION.get(template.slug, template.occasions[0])
        cards.append(
            {
                "template": template,
                "palettes": version.palettes,
                "opening_label": version.manifest.get("opening_label", ""),
                "demo_url": f"{reverse('invitations:demo', args=[template.slug])}?gelegenheid={demo_occasion}",
                "start_url": f"{reverse('studio:start')}?ontwerp={template.slug}" + (f"&gelegenheid={occasion}" if occasion else ""),
                "image": f"img/designs/{template.slug}.webp",
            }
        )
    return cards


def home(request):
    designs = _designs()
    return render(
        request,
        "core/home.html",
        {
            "cards": _design_cards(designs),
            "demo_designs": designs,
            "steps": STEPS,
            "features": FEATURES,
            "occasions": OCCASION_CHOICES,
            "packages": Package.objects.filter(is_active=True),
            "faq": FAQ[:4],
            "config": SiteConfig.get(),
        },
    )


def designs(request):
    occasion = request.GET.get("gelegenheid", "")
    if occasion not in OCCASION_LABELS:
        occasion = ""
    all_designs = _designs()
    shown = [d for d in all_designs if not occasion or occasion in d.occasions]
    return render(
        request,
        "core/designs.html",
        {
            "cards": _design_cards(shown, occasion),
            "occasions": OCCASION_CHOICES,
            "occasion": occasion,
            "occasion_label": OCCASION_LABELS.get(occasion, ""),
        },
    )


def design_detail(request, slug):
    template = get_object_or_404(Template.objects.select_related("current_version"), slug=slug, is_active=True)
    if template.current_version is None:
        raise Http404()
    version = template.current_version
    occasion = request.GET.get("gelegenheid", "")
    if occasion not in template.occasions:
        occasion = DEFAULT_DEMO_OCCASION.get(slug, template.occasions[0])
    return render(
        request,
        "core/design_detail.html",
        {
            "template": template,
            "version": version,
            "occasion": occasion,
            "occasion_choices": [(k, OCCASION_LABELS[k]) for k in template.occasions if k in OCCASION_LABELS],
            "demo_url": f"{reverse('invitations:demo', args=[slug])}?gelegenheid={occasion}",
            "start_url": f"{reverse('studio:start')}?ontwerp={slug}&gelegenheid={occasion}",
            "others": [c for c in _design_cards(_designs()) if c["template"].pk != template.pk],
        },
    )


def how(request):
    return render(request, "core/how.html", {"steps": STEPS, "features": FEATURES})


def pricing(request):
    return render(
        request,
        "core/pricing.html",
        {
            "packages": Package.objects.filter(is_active=True),
            "addons": AddOn.objects.filter(is_active=True),
            "config": SiteConfig.get(),
        },
    )


def faq(request):
    return render(request, "core/faq.html", {"faq": FAQ})


@require_http_methods(["GET", "POST"])
def contact(request):
    config = SiteConfig.get()
    if request.method == "POST":
        form = ContactForm(request.POST)
        age = form_age_seconds(request.POST.get("form_ts", ""))
        allowed = rate_limit(f"contact:{ip_fingerprint(request)}", 5, 3600)
        if request.POST.get("website") or age is None or age < 3:
            form.add_error(None, "Je bericht kon niet worden verzonden. Vernieuw de pagina en probeer het opnieuw.")
        elif not allowed:
            form.add_error(None, "Je hebt al een aantal berichten gestuurd. Probeer het later opnieuw.")
        if form.is_valid():
            msg = ContactMessage.objects.create(**form.cleaned_data)
            from processing.emails import notify_owner_contact, send_contact_receipt

            notify_owner_contact(msg)
            send_contact_receipt(msg)
            messages.success(request, "Bedankt! Je bericht is ontvangen. Je krijgt een bevestiging per e-mail.")
            return redirect("core:contact")
    else:
        initial = {}
        if request.user.is_authenticated:
            initial = {"email": request.user.email, "name": request.user.name}
        form = ContactForm(initial=initial)
    return render(request, "core/contact.html", {"form": form, "form_ts": signed_timestamp(), "config": config})


def privacy(request):
    return render(request, "core/privacy.html", {"config": SiteConfig.get()})


def terms(request):
    return render(request, "core/terms.html")


def robots_txt(request):
    lines = [
        "User-agent: *",
        "Disallow: /u/",
        "Disallow: /voorbeeld/",
        "Disallow: /account/",
        "Disallow: /beheer/",
        "Disallow: /maken/",
        "Disallow: /bestelling/",
        "Disallow: /betalen/",
        "Disallow: /inloggen/",
        f"Disallow: /{settings.ADMIN_URL}",
        "",
        f"Sitemap: {settings.BASE_URL}/sitemap.xml",
    ]
    return HttpResponse("\n".join(lines) + "\n", content_type="text/plain; charset=utf-8")


def sitemap_xml(request):
    paths = [
        reverse("core:home"),
        reverse("core:designs"),
        reverse("core:how"),
        reverse("core:pricing"),
        reverse("core:faq"),
        reverse("core:contact"),
        reverse("core:privacy"),
        reverse("core:terms"),
    ] + [reverse("core:design_detail", args=[t.slug]) for t in _designs()]
    urls = "".join(f"<url><loc>{settings.BASE_URL}{p}</loc></url>" for p in paths)
    body = f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>'
    return HttpResponse(body, content_type="application/xml")


def healthz(request):
    return HttpResponse("ok", content_type="text/plain")


def not_found(request, exception=None):
    return render(request, "errors/404.html", status=404)


def server_error(request):
    return render(request, "errors/500.html", status=500)


def csrf_failure(request, reason=""):
    return render(request, "errors/csrf.html", status=403)
