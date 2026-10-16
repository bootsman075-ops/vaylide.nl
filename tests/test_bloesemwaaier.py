"""Het ontwerp Bloesemwaaier: waaier die dichtklapt en in de vijver valt, met een getekende tuin."""
import json
import re
from pathlib import Path

from django.conf import settings
from django.test import Client

from catalog.atelier import contrast
from catalog.models import Template
from catalog.occasions import OCCASIONS
from tools.bloesemwaaier import maak_beelden

from .helpers import VaylideTestCase

FOLDER = Path(settings.BASE_DIR) / "designs" / "bloesemwaaier" / "v1"


def manifest():
    return json.loads((FOLDER / "manifest.json").read_text(encoding="utf-8"))


def mix(a: str, b: str, share_a: float) -> str:
    ca = [int(a[i:i + 2], 16) for i in (1, 3, 5)]
    cb = [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    return "#" + "".join(f"{round(x * share_a + y * (1 - share_a)):02X}" for x, y in zip(ca, cb))


class BloesemwaaierManifestTests(VaylideTestCase):
    def test_design_is_read_with_its_versions_and_card_image(self):
        template = Template.objects.get(slug="bloesemwaaier")
        self.assertEqual(template.name, "Bloesemwaaier")
        self.assertEqual(template.current_version.renderer, "bloesemwaaier/v1")
        self.assertEqual(template.occasions[0], "bruiloft")
        self.assertTrue(set(template.occasions) <= set(OCCASIONS))
        self.assertTrue((Path(settings.BASE_DIR) / "static" / "img" / "designs" / "bloesemwaaier.webp").exists())

    def test_accent_override_from_beheer_hits_the_text_accent(self):
        # Beheer zet een afwijkende accentkleur op de eerste variabele die op -accent of -gold eindigt.
        for palette in manifest()["palettes"]:
            first = next(k for k in palette["vars"] if k.endswith("-accent") or k.endswith("-gold"))
            self.assertEqual(first, "--wa-accent", palette["key"])

    def test_every_text_color_has_enough_contrast(self):
        for palette in manifest()["palettes"]:
            v = {k[len("--wa-"):]: c for k, c in palette["vars"].items()}
            card = mix(v["accent"], v["bg-2"], .07)  # --inv-surface-2
            pairs = [
                ("tekst op papier", v["ink"], v["bg"]), ("tekst op kaart", v["ink"], v["bg-2"]),
                ("gedempt op papier", v["muted"], v["bg"]), ("gedempt op kaart", v["muted"], v["bg-2"]),
                ("gedempt op vak", v["muted"], card), ("accent op papier", v["accent"], v["bg"]),
                ("accent op kaart", v["accent"], v["bg-2"]), ("knoptekst", v["btn-ink"], v["accent"]),
            ]
            # De tekst in de kop en op het openingsscherm staat op de lucht (sky-1 tot sky-2).
            for sky in ("sky-1", "sky-2"):
                for role in ("hero-ink", "hero-muted", "hero-accent"):
                    pairs.append((f"{role} op {sky}", v[role], v[sky]))
            for label, fg, bg in pairs:
                self.assertGreaterEqual(contrast(fg, bg), 4.5, f"{palette['key']}: {label}")


class BloesemwaaierRenderTests(VaylideTestCase):
    def test_demo_renders_for_every_occasion_and_color(self):
        for occasion in manifest()["occasions"]:
            for palette in manifest()["palettes"]:
                response = Client().get("/voorbeeld/bloesemwaaier/", {"gelegenheid": occasion, "kleur": palette["key"]})
                self.assertEqual(response.status_code, 200, (occasion, palette["key"]))
                html = response.content.decode()
                self.assertIn(f'data-palette="{palette["key"]}"', html)
                self.assertIn("--wa-sky-1:", html)

    def test_opening_works_without_script_and_has_the_fan(self):
        html = Client().get("/voorbeeld/bloesemwaaier/").content.decode()
        # De waaier is een gewone link naar de uitnodiging; met een duidelijke naam.
        self.assertRegex(html, r'<a href="#uitnodiging" class="wa-fan" data-open data-fx-tilt aria-label="Open de uitnodiging">')
        self.assertEqual(html.count('class="wa-pleat"'), 15)
        self.assertIn("data-fx-origin", html)
        self.assertIn('data-fx-slot="cover"', html)
        # De tuin staat in de kop en is versiering (verborgen voor schermlezers).
        self.assertIn('<div class="wa-land" aria-hidden="true">', html)
        self.assertIn('<div class="wa-sky" aria-hidden="true">', html)
        for part in ("wa-pav", "wa-bridge", "wa-cliff", "wa-mtn--far", "wa-pond"):
            self.assertRegex(html, rf'class="(?:[^"]* )?{part}[ "]', part)
        # Geen inline scripts of stijlblokken (CSP).
        self.assertEqual(len(re.findall(r"<script>", html)), 1)
        self.assertNotIn("<style", html)
        self.assertIn("noindex", html)

    def test_svg_ids_in_the_page_are_unique(self):
        html = Client().get("/voorbeeld/bloesemwaaier/").content.decode()
        ids = re.findall(r'\sid="([^"]+)"', html)
        self.assertEqual(len(ids), len(set(ids)), sorted({i for i in ids if ids.count(i) > 1}))
        for ref in set(re.findall(r'(?:href="#|url\(#)([\w-]+)', html)):
            if ref in ("uitnodiging", "aanmelden"):
                continue
            self.assertIn(ref, ids, ref)

    def test_long_names_get_smaller_type(self):
        long_a = "Maximiliaan-Alexander van den Boogaard"
        owner = self.make_customer()
        inv = self.published(owner=owner, template="bloesemwaaier", names={"partner_1": long_a, "partner_2": "Ernestina"})
        page = Client().get(inv.public_path)
        self.assertContains(page, long_a)
        self.assertContains(page, "wa-names--xlong")


class BloesemwaaierImageTests(VaylideTestCase):
    def test_images_match_the_generator(self):
        # De beelden komen uit tools/bloesemwaaier/maak_beelden.py en zijn niet met de hand aangepast.
        expected = {
            "waaier.svg": maak_beelden.fan_paper(), "stok.svg": maak_beelden.stick(False),
            "stok-buiten.svg": maak_beelden.stick(True), "kwast.svg": maak_beelden.tassel(),
            "ornament.svg": maak_beelden.ornament(), "scene-lucht.html": maak_beelden.scene_sky(),
            "scene-land.html": maak_beelden.scene_land(),
        }
        for name, text in expected.items():
            self.assertEqual((FOLDER / name).read_text(encoding="utf-8"), text, name)

    def test_images_are_self_contained(self):
        for path in FOLDER.glob("*.svg"):
            text = path.read_text(encoding="utf-8")
            self.assertNotIn("<script", text, path.name)
            self.assertEqual(re.findall(r'href="(?!#)', text), [], path.name)
            self.assertEqual(re.findall(r"https?://(?!www\.w3\.org/2000/svg)", text), [], path.name)
        for name in ("scene-lucht.html", "scene-land.html"):
            text = (FOLDER / name).read_text(encoding="utf-8")
            self.assertNotIn("<script", text)
            self.assertNotIn("<style", text)
            self.assertNotIn("http", text)
