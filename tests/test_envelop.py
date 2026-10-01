"""Liefde op papier v2: de versierde envelop met logo, en de afsluitende regel."""
from django.test import Client

from .helpers import VaylideTestCase


class EnvelopV2Tests(VaylideTestCase):
    def demo(self, occasion):
        response = Client().get(f"/voorbeeld/liefde-op-papier/?gelegenheid={occasion}")
        self.assertEqual(response.status_code, 200)
        return response

    def test_envelope_has_logo_seal_and_letter(self):
        response = self.demo("bruiloft")
        self.assertContains(response, "designs/liefde-op-papier/v2/style.css")
        self.assertContains(response, "img/merk/vaylide-logo.webp")
        self.assertContains(response, 'class="lp-env__letter"')
        self.assertContains(response, 'aria-label="Open de uitnodiging"')
        self.assertContains(response, "lp-flap__seal")

    def test_wedding_stamp_has_rings_other_occasions_a_heart(self):
        self.assertContains(self.demo("bruiloft"), "lp-stamp__art\" fill=\"none\"")
        self.assertContains(self.demo("verjaardag"), "lp-stamp__art--fill")

    def test_closing_line(self):
        response = self.demo("bruiloft")
        self.assertContains(response, "Jouw moment begint hier")
        self.assertContains(response, '<span class="lp-signoff__brand">— Vaylide</span>')

    def test_no_inline_style_blocks(self):
        html = self.demo("bruiloft").content.decode()
        self.assertNotIn("<style", html)
