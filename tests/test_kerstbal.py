"""Kerstbal: de opening met de video van de kerstbal, de kaart, de kleuren, het voorbeeld en de sneeuw."""
import json
import re
from datetime import timedelta
from pathlib import Path

from django.conf import settings
from django.test import Client, TestCase
from django.utils import timezone

from catalog.atelier import contrast
from catalog.effects import EFFECT_OPTIONS, effect_card_label, effect_summary
from catalog.models import Template
from invitations.demo import demo_content

FOLDER = Path(settings.BASE_DIR) / "designs" / "kerstbal" / "v1"


def manifest():
    return json.loads((FOLDER / "manifest.json").read_text(encoding="utf-8"))


class KerstbalDesignTests(TestCase):
    def test_design_is_read_in_with_its_video(self):
        template = Template.objects.get(slug="kerstbal")
        self.assertTrue(template.is_active)
        self.assertEqual(template.current_version.number, 1)
        self.assertEqual(template.occasions[0], "kerst")
        # Video in twee formaten (H.264 voor Safari, VP9 voor browsers zonder H.264) en het eerste beeld.
        for name, limit in (("kerstbal.mp4", 1_000_000), ("kerstbal.webm", 800_000), ("kerstbal-poster.webp", 150_000)):
            path = FOLDER / name
            self.assertTrue(path.exists(), name)
            self.assertLess(path.stat().st_size, limit, name)
        self.assertTrue((Path(settings.BASE_DIR) / "static" / "img" / "designs" / "kerstbal.webp").exists())

    def test_colours_are_readable(self):
        """Tekst op de kaart minstens 4,5:1 in elke kleurvariant, en de vaste kleuren van het openingsscherm ook."""
        for palette in manifest()["palettes"]:
            v = palette["vars"]
            for surface in ("--kb-card", "--kb-card-2", "--kb-field"):
                for text in ("--kb-ink", "--kb-muted", "--kb-gold", "--kb-name"):
                    self.assertGreaterEqual(contrast(v[text], v[surface]), 4.5, f"{palette['key']}: {text} op {surface}")
            self.assertGreaterEqual(contrast(v["--kb-btn-ink"], v["--kb-btn"]), 4.5, palette["key"])
            # Knoppen en links in de accentkleur staan op de kaart.
            self.assertGreaterEqual(contrast(v["--kb-btn"], v["--kb-card"]), 4.5, palette["key"])
        css = (FOLDER / "style.css").read_text(encoding="utf-8")
        fixed = dict(re.findall(r"(--kb-(?:bg|bg-text|cover-gold|cover-ink|cover-name)): (#[0-9A-Fa-f]{6});", css))
        self.assertEqual(len(fixed), 5)
        for name in ("--kb-bg-text", "--kb-cover-gold", "--kb-cover-ink", "--kb-cover-name"):
            self.assertGreaterEqual(contrast(fixed[name], fixed["--kb-bg"]), 4.5, name)

    def test_snow_effect(self):
        self.assertIn("sneeuw", EFFECT_OPTIONS["sfeer"])
        effects = manifest()["effects"]
        self.assertEqual(effects["sfeer"], "sneeuw")
        self.assertEqual(effect_summary(effects), "Zacht vallende sneeuw en bij het openen vonken en glanzende confetti.")
        self.assertEqual(effect_card_label(effects, manifest()["opening_label"]), "sneeuw")
        script = (Path(settings.BASE_DIR) / "invitations" / "static" / "invitations" / "effects.js").read_text(encoding="utf-8")
        self.assertIn('    sneeuw: { type: "multi"', script)
        self.assertIn("    sneeuw: function (p)", script)
        self.assertIn("    flake: { w: 1, h: 1", script)


class KerstbalPageTests(TestCase):
    def page(self, occasion="zakelijk", palette=""):
        params = {"gelegenheid": occasion}
        if palette:
            params["kleur"] = palette
        response = Client().get("/voorbeeld/kerstbal/", params)
        self.assertEqual(response.status_code, 200)
        return response.content.decode()

    def test_cover_has_the_video_that_only_plays_after_a_tap(self):
        html = self.page()
        video = re.search(r"<video[^>]*>", html).group(0)
        for attr in ("data-cover-video", "muted", "playsinline", 'preload="none"', 'tabindex="-1"', "kerstbal-poster.webp"):
            self.assertIn(attr, video)
        # Nooit vanzelf afspelen en geen bediening: de video start pas na de tik (invite.js).
        self.assertNotIn("autoplay", video)
        self.assertNotIn("controls", video)
        self.assertIn('<source src="/static/designs/kerstbal/v1/kerstbal.mp4" type="video/mp4">', html)
        self.assertIn('<source src="/static/designs/kerstbal/v1/kerstbal.webm" type="video/webm">', html)
        # De video is decoratief; de knop over de bal heeft een naam en werkt ook zonder JavaScript.
        self.assertRegex(html, r'<div class="kb-frame kb-stage" aria-hidden="true">')
        self.assertIn('<a href="#uitnodiging" class="kb-ball fx-pulse" data-open data-fx-origin aria-label="Open de uitnodiging"></a>', html)
        self.assertIn("Tik op de kerstbal", html)
        # De kaart die uit de bal komt, toont de titel en de datum, maar wordt niet dubbel voorgelezen.
        self.assertIn('<div class="kb-card" aria-hidden="true">', html)
        self.assertIn('<p class="kb-card__names kb-card__names--normal">Kerstborrel</p>', html)
        # Geen inline scripts naast het vaste startscript (CSP).
        self.assertEqual(len(re.findall(r"<script>", html)), 1)

    def test_every_occasion_and_colour_renders(self):
        for occasion in manifest()["occasions"]:
            for palette in manifest()["palettes"]:
                html = self.page(occasion, palette["key"])
                self.assertIn(f'data-palette="{palette["key"]}"', html, (occasion, palette["key"]))
                self.assertIn('class="kb-sheet"', html)
                self.assertIn('data-fx-sfeer="sneeuw"', html)

    def test_opening_can_be_switched_off(self):
        from invitations.render import RenderOptions, build_view
        from django.template.loader import render_to_string

        version = Template.objects.get(slug="kerstbal").current_version
        content = demo_content("kerstbal", "zakelijk")
        content["style"] = dict(content.get("style") or {}, opening=False)
        view = build_view(occasion="zakelijk", content=content, overrides={}, template_version=version, options=RenderOptions(mode="demo"))
        html = render_to_string(version.template_path, {"v": view, "rsvp_form": {"client_token": "x", "form_ts": ""}})
        self.assertNotIn("<video", html)
        self.assertIn('class="kb-sheet"', html)

    def test_christmas_greeting_without_event(self):
        """Een kerstgroet zonder datum en locatie: de kaart uit de bal wenst fijne feestdagen, zonder aanmelden."""
        from invitations.render import RenderOptions, build_view
        from django.template.loader import render_to_string

        version = Template.objects.get(slug="kerstbal").current_version
        content = demo_content("kerstbal", "kerst")
        content.update({"date": "", "start_time": "", "end_time": "", "venue_name": "", "address": ""})
        view = build_view(occasion="kerst", content=content, overrides={}, template_version=version, options=RenderOptions(mode="demo"))
        self.assertFalse(view["has_event"])
        html = render_to_string(version.template_path, {"v": view, "rsvp_form": {"client_token": "x", "form_ts": ""}})
        self.assertIn('<p class="kb-card__date">Fijne feestdagen</p>', html)
        self.assertNotIn('id="aanmelden"', html)
        self.assertNotIn('class="kb-date', html)
        self.assertIn("Familie Van Dijk", html)

    def test_shared_script_plays_a_cover_video_only_after_the_tap(self):
        script = (Path(settings.BASE_DIR) / "invitations" / "static" / "invitations" / "invite.js").read_text(encoding="utf-8")
        self.assertIn('cover.querySelector("video[data-cover-video]")', script)
        self.assertIn("if (video && !calm)", script)
        self.assertIn('html.classList.add("cover-video-failed")', script)


class KerstbalDemoTests(TestCase):
    def test_demo_falls_just_before_christmas(self):
        today = timezone.localdate()
        for occasion in manifest()["occasions"]:
            content = demo_content("kerstbal", occasion)
            day = timezone.datetime.fromisoformat(content["date"]).date()
            self.assertEqual(day.month, 12, occasion)
            if occasion == "kerst":
                # Het kerstvoorbeeld van de gelegenheid Kerst: een kerstdiner op eerste kerstdag.
                self.assertEqual(day.day, 25)
            else:
                self.assertEqual(day.weekday(), 5, occasion)
                self.assertLessEqual(day.day, 20, occasion)
                self.assertGreaterEqual(day, today + timedelta(weeks=5), occasion)
            deadline = timezone.datetime.fromisoformat(content["rsvp"]["deadline"]).date()
            self.assertGreater(deadline, today, occasion)
            self.assertNotIn("zomer", (content["welcome_text"] + content["dresscode"]["text"]).lower(), occasion)
            self.assertNotIn("gras", content["dresscode"]["text"], occasion)

    def test_christmas_card_is_the_default_example(self):
        html = Client().get("/voorbeeld/kerstbal/").content.decode()
        self.assertIn('<p class="kb-cover__kicker">Warme kerstgroeten</p>', html)
        self.assertIn("Familie Van Dijk", html)
        self.assertIn('aria-label="Open de kerstkaart"', html)
        self.assertIn('<p class="kb-subnames fx-intro" style="--fx-d:4">Sanne, Daan, Lotte en Siem</p>', html)
        self.assertIn("december", html)

    def test_business_example_is_a_christmas_party(self):
        content = demo_content("kerstbal", "zakelijk")
        self.assertEqual(content["names"]["event_title"], "Kerstborrel")
        self.assertIn("kerstborrel", content["welcome_text"])

    def test_other_designs_keep_their_own_example(self):
        content = demo_content("avondgoud", "zakelijk")
        self.assertEqual(content["names"]["event_title"], "Jubileumborrel")
        self.assertIn("Zakelijk", content["dresscode"]["text"])
