"""Website: nieuwe pagina's, zoeken zonder klantgegevens en de navigatie uit de nieuwe vormgeving."""
from django.test import Client

from .helpers import VierliefTestCase


class NewPagesTests(VierliefTestCase):
    def test_inspiration_and_about_pages(self):
        inspiration = Client().get("/inspiratie/")
        self.assertContains(inspiration, "Voorbeeldteksten")
        self.assertContains(inspiration, 'id="tekst-bruiloft"')
        self.assertContains(inspiration, "/ontwerpen/?gelegenheid=babyshower")
        about = Client().get("/over-ons/")
        self.assertContains(about, "Uitnodigen met een verhaal")
        # Geen verzonnen reviews, sterren of klantenaantallen.
        for page in (inspiration, about, Client().get("/")):
            html = page.content.decode()
            self.assertNotIn("★", html)
            self.assertNotIn("klanten gingen je voor", html.lower())

    def test_header_has_mockup_navigation(self):
        html = Client().get("/prijzen/").content.decode()
        for label in ("Home", "Collectie", "Zo werkt het", "Prijzen", "Inspiratie", "Over ons", "Start nu"):
            self.assertIn(f">{label}<", html)
        self.assertIn('aria-label="Zoeken"', html)
        self.assertIn('href="/prijzen/" aria-current="page"', html)

    def test_sitemap_lists_new_pages_but_not_search(self):
        body = Client().get("/sitemap.xml").content.decode()
        self.assertIn("/inspiratie/</loc>", body)
        self.assertIn("/over-ons/</loc>", body)
        self.assertNotIn("/zoeken/", body)

    def test_faq_items_can_be_linked(self):
        self.assertContains(Client().get("/veelgestelde-vragen/"), 'id="vraag-1"')


class SearchTests(VierliefTestCase):
    def test_finds_faq_designs_and_pages(self):
        response = Client().get("/zoeken/", {"q": "muziek"})
        self.assertContains(response, "Kan ik muziek toevoegen?")
        self.assertContains(response, "/veelgestelde-vragen/#vraag-")
        self.assertContains(Client().get("/zoeken/", {"q": "Avondgoud"}), "/ontwerpen/avondgoud/")
        self.assertContains(Client().get("/zoeken/", {"q": "prijs pakket"}), "/prijzen/")

    def test_accents_and_case_do_not_matter(self):
        self.assertContains(Client().get("/zoeken/", {"q": "PRIVE"}), "Privacy")

    def test_never_returns_customer_data(self):
        owner = self.make_customer()
        invitation = self.published(owner=owner)
        self.rsvp(Client(), invitation, name="Geheime Gast", attending="ja", party_size="1")
        for term in ("Anna", "Bram", "Kasteel Test", "Geheime Gast", owner.email, invitation.slug):
            response = Client().get("/zoeken/", {"q": term})
            self.assertEqual(response.status_code, 200)
            self.assertContains(response, "Niets gevonden", msg_prefix=term)
            self.assertNotContains(response, "/u/", msg_prefix=term)

    def test_is_not_indexed_and_escapes_input(self):
        response = Client().get("/zoeken/", {"q": "<script>alert(1)</script>"})
        self.assertContains(response, 'content="noindex, follow"')
        self.assertNotContains(response, "<script>alert(1)</script>")
        self.assertContains(response, "&lt;script&gt;")

    def test_long_query_is_cut_off(self):
        response = Client().get("/zoeken/", {"q": "muziek " + "x" * 500})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context["query"]), 100)

    def test_empty_query_shows_examples(self):
        response = Client().get("/zoeken/")
        self.assertContains(response, "Bijvoorbeeld:")
        self.assertEqual(response.context["results"], [])
