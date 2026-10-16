"""Opening als film (Rozenzegel): manifest, bestanden, weergave, contrast en het gedrag in de scripts.

Het afspelen zelf (tik, film, vervagen, 'Overslaan', 'Beweging', 'minder beweging', een film die niet laadt,
zonder JavaScript) is in een browser gecontroleerd; zie docs/CONTROLES.md onder "Ronde 7".
"""
import copy
import json
import re
from pathlib import Path

from django.conf import settings
from django.template.loader import render_to_string
from django.test import Client, TestCase
from PIL import Image

from catalog.atelier import contrast
from catalog.models import Template
from catalog.seed import DesignError, film_errors, validate_manifest
from invitations.demo import demo_content
from invitations.render import RenderOptions, build_view

FOLDER = Path(settings.BASE_DIR) / "designs" / "rozenzegel" / "v1"
STATIC_JS = Path(settings.BASE_DIR) / "invitations" / "static" / "invitations"


def manifest():
    return json.loads((FOLDER / "manifest.json").read_text(encoding="utf-8"))


def render(content=None, occasion="bruiloft", mode="demo"):
    version = Template.objects.get(slug="rozenzegel").current_version
    content = content or demo_content("rozenzegel", occasion)
    view = build_view(occasion=occasion, content=content, overrides={}, template_version=version, options=RenderOptions(mode=mode))
    return view, render_to_string(version.template_path, {"v": view, "rsvp_form": {"client_token": "x", "form_ts": ""}})


class FilmManifestTests(TestCase):
    def test_film_files_exist_and_fit_the_same_frame(self):
        data = manifest()
        self.assertEqual(film_errors(FOLDER, data["film"]), [])
        # Poster (eerste beeld) en kaart (laatste beeld) hebben de maat van de film: de tekst staat dan precies op de kaart.
        for key in ("poster", "end"):
            with Image.open(FOLDER / data["film"][key]) as image:
                self.assertEqual(image.size, (720, 1280), key)
        # Licht genoeg voor een telefoon.
        self.assertLess((FOLDER / data["film"]["src"]).stat().st_size, 3 * 1024 * 1024)
        self.assertLess((FOLDER / data["film"]["webm"]).stat().st_size, 3 * 1024 * 1024)

    def test_missing_or_misplaced_film_files_are_refused(self):
        path = FOLDER / "manifest.json"
        for film, message in [
            (dict(manifest()["film"], src="ontbreekt.mp4"), "film.src: ontbreekt.mp4 ontbreekt"),
            (dict(manifest()["film"], poster="../liefde-op-papier/v1/manifest.json"), "film.poster moet een bestandsnaam"),
            (dict(manifest()["film"], src="opening.mov"), "film.src moet een bestandsnaam"),
            ({"src": "opening.mp4"}, "film.poster ontbreekt"),
            ("opening.mp4", "'film' moet een blok"),
        ]:
            with self.assertRaisesMessage(DesignError, message):
                validate_manifest(path, dict(manifest(), film=film))
        # WebM is optioneel.
        without_webm = dict(manifest()["film"])
        del without_webm["webm"]
        self.assertEqual(film_errors(FOLDER, without_webm), [])

    def test_version_gives_static_paths(self):
        version = Template.objects.get(slug="rozenzegel").current_version
        self.assertEqual(version.film["src"], "designs/rozenzegel/v1/opening.mp4")
        self.assertEqual(version.film["webm"], "designs/rozenzegel/v1/opening.webm")
        self.assertEqual(version.film["end"], "designs/rozenzegel/v1/kaart.webp")
        self.assertEqual(Template.objects.get(slug="liefde-op-papier").current_version.film, {})


class FilmRenderTests(TestCase):
    def test_demo_page_has_the_film_opening(self):
        response = Client().get("/voorbeeld/rozenzegel/")
        self.assertEqual(response.status_code, 200)
        html = response.content.decode()
        self.assertIn('<meta name="robots" content="noindex, nofollow, noarchive">', html)
        video = re.search(r"<video[^>]*data-cover-film[^>]*>", html).group(0)
        # Stil, zonder bediening, niet voorgelezen; pas laden als de pagina beweging mag tonen (invite.js).
        for attribute in ("muted", "playsinline", 'preload="metadata"', 'aria-hidden="true"', 'tabindex="-1"',
                          'poster="/static/designs/rozenzegel/v1/envelop.webp"'):
            self.assertIn(attribute, video)
        self.assertNotIn("autoplay", video)
        self.assertNotIn("controls", video)
        # MP4 eerst (Safari, Chrome, Firefox), WebM voor browsers zonder H.264.
        # Met het codecprofiel, zodat een browser zonder H.264 de MP4 niet eerst downloadt.
        self.assertLess(html.index('src="/static/designs/rozenzegel/v1/opening.mp4" type=\'video/mp4; codecs="avc1.64001F"\''),
                        html.index('src="/static/designs/rozenzegel/v1/opening.webm" type=\'video/webm; codecs="vp9"\''))
        self.assertIn('href="#uitnodiging" class="rz-seal fx-pulse" data-open data-fx-origin aria-label="Open de uitnodiging"', html)
        self.assertIn('<button type="button" class="rz-skip" data-cover-skip hidden>Overslaan</button>', html)
        self.assertIn("data-film-frame", html)
        self.assertIn('class="rz-frame rz-frame--hero" data-film-target style="background-image: url(\'/static/designs/rozenzegel/v1/kaart.webp\')"', html)
        # Geen inline scripts naast het vaste startscript (CSP).
        self.assertEqual(len(re.findall(r"<script>", html)), 1)

    def test_every_occasion_renders(self):
        for occasion in Template.objects.get(slug="rozenzegel").occasions:
            response = Client().get("/voorbeeld/rozenzegel/", {"gelegenheid": occasion})
            self.assertEqual(response.status_code, 200, occasion)
            self.assertContains(response, "rz-card", msg_prefix=occasion)

    def test_without_opening_the_card_still_shows(self):
        content = copy.deepcopy(demo_content("rozenzegel", "bruiloft"))
        content["style"]["opening"] = False
        view, html = render(content)
        self.assertFalse(view["opening_enabled"])
        self.assertNotIn("<video", html)
        self.assertNotIn("data-cover", html)
        self.assertIn("url('/static/designs/rozenzegel/v1/kaart.webp')", html)
        self.assertIn("Sanne", html)

    def test_long_texts_get_the_dense_card(self):
        content = copy.deepcopy(demo_content("rozenzegel", "bruiloft"))
        content["names"].update({"partner_1": "Anne-Wilhelmina Charlotte Maria van Oldenbarnevelt-Hoogeveen",
                                 "partner_2": "Maximiliaan Alexander Frederik de Vries van der Wetering"})
        content["headline"] = "Wij gaan trouwen en willen deze bijzondere dag graag met jullie allemaal vieren!"
        content["venue_name"] = "Kasteel de Haar, de grote feestzaal in het koetshuis aan de achterzijde van het landgoed"
        view, html = render(content)
        self.assertEqual(view["names_size"], "xlong")
        self.assertIn("rz-card rz-card--dense", html)
        self.assertIn("rz-names rz-names--xlong", html)
        self.assertIn("rz-cover__names rz-cover__names--xlong", html)
        _, short = render()
        self.assertNotIn("rz-card--dense", short)

    def test_design_on_the_website(self):
        page = Client().get("/ontwerpen/rozenzegel/")
        self.assertContains(page, "<dt>Opening</dt><dd>Envelop met gloeiend lakzegel (film)</dd>")
        self.assertContains(page, "Fonkelend goudstof en bij het openen een regen van bloemblaadjes.")
        self.assertTrue((Path(settings.BASE_DIR) / "static" / "img" / "designs" / "rozenzegel.webp").exists())


class FilmContrastTests(TestCase):
    def test_text_colors_have_enough_contrast(self):
        c = manifest()["palettes"][0]["vars"]
        # De crème kaart in kaart.webp is op zijn donkerst #C4C2B6 (bovenrand), in het midden #D4D3C8.
        card = "#C4C2B6"
        pairs = [
            (c["--rz-ink"], c["--rz-paper"]), (c["--rz-muted"], c["--rz-paper"]), (c["--rz-accent"], c["--rz-paper"]),
            (c["--rz-muted"], c["--rz-paper-2"]), (c["--rz-accent"], c["--rz-paper-2"]), ("#FFFFFF", c["--rz-accent"]),
            (c["--rz-card-ink"], card), (c["--rz-card-accent"], card), (c["--rz-card-muted"], card),
            (c["--rz-on-dark"], c["--rz-page"]), (c["--rz-on-dark-muted"], c["--rz-page"]), (c["--rz-gold-soft"], c["--rz-page"]),
            # Openingsscherm: lichte tekst op het bordeaux van de envelop (lichtste plek, bovenaan).
            (c["--rz-on-dark-muted"], "#793136"), (c["--rz-gold-soft"], "#793136"),
        ]
        for fg, bg in pairs:
            self.assertGreaterEqual(contrast(fg, bg), 4.5, (fg, bg))


class FilmScriptTests(TestCase):
    """De scripts horen bij de film te passen; het gedrag zelf is in de browser gecontroleerd."""

    def test_invite_script_plays_and_reveals(self):
        js = (STATIC_JS / "invite.js").read_text(encoding="utf-8")
        for needle in ("[data-cover-film]", "[data-film-target]", "invite:reveal", "[data-cover-skip]",
                       "film.NETWORK_NO_SOURCE", 'film.preload = "auto"', 'html.classList.contains("inv-embed")', "hashchange", "document.fonts.ready", "ResizeObserver", "is-aligned"):
            self.assertIn(needle, js)

    def test_effects_wait_for_the_film(self):
        js = (STATIC_JS / "effects.js").read_text(encoding="utf-8")
        self.assertIn('document.addEventListener("invite:reveal"', js)
        self.assertIn("if (event.detail && event.detail.film) return;", js)
