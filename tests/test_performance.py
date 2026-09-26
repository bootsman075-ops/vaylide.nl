"""Snelheid: inline startscript met CSP-hash, compressie van tekst en zuinige databasequeries."""
import gzip
import re

from django.db import connection
from django.test import Client
from django.test.utils import CaptureQueriesContext

from core.csp import BOOT_SCRIPT, script_hash

from .helpers import VierliefTestCase, jpeg_file


class BootScriptTests(VierliefTestCase):
    def test_inline_script_matches_csp_hash(self):
        inv = self.published(owner=self.make_customer())
        response = Client().get(inv.public_path)
        html = response.content.decode()
        match = re.search(r"<script>(.*?)</script>", html)
        self.assertIsNotNone(match)
        self.assertEqual(match.group(1), BOOT_SCRIPT)
        self.assertIn(script_hash(BOOT_SCRIPT), response["Content-Security-Policy"])
        # Geen andere inline scripts: die zouden door de CSP geblokkeerd worden.
        self.assertEqual(len(re.findall(r"<script>", html)), 1)


class CompressionTests(VierliefTestCase):
    def test_html_is_compressed_but_images_are_not(self):
        page = Client().get("/prijzen/", HTTP_ACCEPT_ENCODING="gzip")
        self.assertEqual(page["Content-Encoding"], "gzip")
        self.assertIn("Prijzen", gzip.decompress(page.content).decode())
        self.assertIn("Accept-Encoding", page["Vary"])

        from invitations.services import save_draft

        owner = self.make_customer()
        inv = self.make_invitation(owner=owner)
        client = Client()
        client.force_login(owner)
        uid = client.post(f"/maken/{inv.uid}/upload/", {"fotos": [jpeg_file()]}, HTTP_ACCEPT="application/json").json()["created"][0]["uid"]
        inv.refresh_from_db()
        content = dict(inv.draft_content, photos={"hero": {"asset": uid, "x": 50, "y": 50, "zoom": 1}, "gallery": []})
        save_draft(inv, expected_rev=None, content=content, user=owner)
        self.pay(inv, owner)
        inv.refresh_from_db()
        url = f"/u/{inv.slug}/media/{uid}/middel/"
        image = Client().get(url, HTTP_ACCEPT_ENCODING="gzip")
        self.assertEqual(image.status_code, 200)
        self.assertFalse(image.has_header("Content-Encoding"))

    def test_partial_responses_are_never_compressed(self):
        from django.http import HttpResponse
        from django.test import RequestFactory

        from core.middleware import CompressTextMiddleware

        request = RequestFactory().get("/", HTTP_ACCEPT_ENCODING="gzip")
        middleware = CompressTextMiddleware(lambda r: None)
        partial = HttpResponse("x" * 500, status=206, content_type="text/plain")
        partial["Content-Range"] = "bytes 0-499/1000"
        self.assertFalse(middleware.process_response(request, partial).has_header("Content-Encoding"))
        full = HttpResponse("x" * 500, content_type="text/plain")
        self.assertEqual(middleware.process_response(request, full)["Content-Encoding"], "gzip")


class QueryCountTests(VierliefTestCase):
    def test_customer_overview_does_not_query_per_invitation(self):
        owner = self.make_customer()
        first = self.published(owner=owner)
        self.rsvp(Client(), first, name="Gast", attending="ja", party_size="2")
        client = Client()
        client.force_login(owner)
        client.get("/account/")  # sessie en caches opwarmen
        with CaptureQueriesContext(connection) as few:
            client.get("/account/")
        for _ in range(4):
            self.make_invitation(owner=owner)
        with CaptureQueriesContext(connection) as more:
            response = client.get("/account/")
        self.assertEqual(len(more.captured_queries), len(few.captured_queries))
        self.assertContains(response, "1 aanwezig (2 personen)")


class HomeTests(VierliefTestCase):
    def test_home_shows_lowest_active_price(self):
        from catalog.models import Package

        response = Client().get("/")
        cheapest = Package.objects.filter(is_active=True).order_by("price_cents").first()
        self.assertContains(response, f"Vanaf {cheapest.price_display}")
        self.assertContains(response, "Een bijzondere dag verdient een")
        self.assertContains(response, "Bekijk de ontwerpen")
        self.assertContains(response, "Maak jouw uitnodiging")
