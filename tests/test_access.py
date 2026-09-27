"""Controle 1: afgeschermde toegang tussen klanten, gasten en beheer."""
from django.test import Client

from invitations.models import GuestResponse, MediaAsset
from wishes.services import create_request

from .helpers import VaylideTestCase, jpeg_file


class CustomerIsolationTests(VaylideTestCase):
    def setUp(self):
        self.alice = self.make_customer("alice@example.com")
        self.bob = self.make_customer("bob@example.com")
        self.inv = self.published(owner=self.alice)
        GuestResponse.objects.create(invitation=self.inv, client_token="t" * 20, name="Geheime Gast", attending=True, party_size=2, edit_token_hash="h" * 64)
        self.wish = create_request(customer=self.alice, invitation=self.inv, subject="Privé wens", description="Iets heel persoonlijks.")
        self.bob_client = Client()
        self.bob_client.force_login(self.bob)

    def test_other_customer_gets_404_everywhere(self):
        uid = self.inv.uid
        urls = [
            f"/account/uitnodiging/{uid}/",
            f"/account/uitnodiging/{uid}/gasten/",
            f"/account/uitnodiging/{uid}/gasten/export.csv",
            f"/account/uitnodiging/{uid}/qr.png",
            f"/account/uitnodiging/{uid}/verwijderen/",
            f"/maken/{uid}/gegevens/",
            f"/maken/{uid}/voorbeeld/weergave/",
            f"/account/wensen/{self.wish.uid}/",
            f"/bestelling/{self.inv.orders.first().uid}/",
        ]
        for url in urls:
            with self.subTest(url=url):
                response = self.bob_client.get(url)
                self.assertEqual(response.status_code, 404, url)
                self.assertNotContains(response, "Geheime Gast", status_code=404)
        # Ook schrijfacties worden geweigerd.
        response = self.bob_client.post(f"/account/uitnodiging/{uid}/verwijderen/", {"bevestig": "verwijderen"})
        self.assertEqual(response.status_code, 404)
        self.assertEqual(self.bob_client.post(f"/maken/{uid}/upload/", {"fotos": jpeg_file()}).status_code, 404)
        self.assertEqual(self.bob_client.post(f"/maken/{uid}/publiceren/", {"rev": 1}).status_code, 404)
        self.inv.refresh_from_db()
        self.assertTrue(self.inv.is_published)

    def test_bob_does_not_see_alice_in_his_portal(self):
        response = self.bob_client.get("/account/")
        self.assertNotContains(response, self.inv.title)
        self.assertNotContains(response, "Privé wens")

    def test_anonymous_draft_only_in_own_session(self):
        owner_session = Client()
        uid = owner_session.post("/maken/", {"occasion": "bruiloft", "template": "puur-moment"})["Location"].split("/")[2]
        self.assertEqual(owner_session.get(f"/maken/{uid}/gegevens/").status_code, 200)
        self.assertEqual(Client().get(f"/maken/{uid}/gegevens/").status_code, 404)
        self.assertEqual(self.bob_client.get(f"/maken/{uid}/gegevens/").status_code, 404)

    def test_portal_and_admin_require_login(self):
        anon = Client()
        self.assertIn("/inloggen/", anon.get("/account/")["Location"])
        self.assertIn("/beheer/inloggen/", anon.get("/beheer/")["Location"])
        # Een klant krijgt geen toegang tot het beheer.
        self.assertEqual(self.bob_client.get("/beheer/").status_code, 404)
        self.assertEqual(self.bob_client.get(f"/beheer/uitnodigingen/{self.inv.uid}/").status_code, 404)
        self.assertEqual(self.bob_client.get(f"/beheer/uitnodigingen/{self.inv.uid}/gasten.csv").status_code, 404)

    def test_staff_login_with_password_and_customer_cannot_use_it(self):
        self.make_staff("owner@example.com", "Heel-geheim-wachtwoord-2026")
        c = Client()
        bad = c.post("/beheer/inloggen/", {"username": "owner@example.com", "password": "fout"})
        self.assertEqual(bad.status_code, 200)
        ok = c.post("/beheer/inloggen/", {"username": "owner@example.com", "password": "Heel-geheim-wachtwoord-2026"})
        self.assertEqual(ok.status_code, 302)
        self.assertEqual(c.get("/beheer/").status_code, 200)
        # Beheerders kunnen niet inloggen met een e-mailcode.
        codes = Client()
        codes.post("/inloggen/", {"email": "owner@example.com"})
        response = codes.post("/inloggen/code/", {"code": codes.session["vierlief_test_code"]["code"]})
        self.assertContains(response, "Beheerders loggen in via de beheerderslogin")


class GuestPrivacyTests(VaylideTestCase):
    def setUp(self):
        self.inv = self.published()
        self.other_guest = Client()
        self.rsvp(self.other_guest, self.inv, name="Eerste Gast", remark="privé opmerking")

    def test_guest_cannot_see_other_responses(self):
        guest = Client()
        page = guest.get(self.inv.public_path)
        self.assertNotContains(page, "Eerste Gast")
        self.assertNotContains(page, "privé opmerking")
        response = self.rsvp(guest, self.inv, name="Tweede Gast")
        body = response.json()
        self.assertNotIn("Eerste Gast", str(body))
        self.assertEqual(set(body.keys()), {"ok", "title", "message", "edit_url"})
        # Geen publieke lijst- of exportroutes.
        for url in [f"/u/{self.inv.slug}/gasten/", f"/u/{self.inv.slug}/aanmelden/"]:
            self.assertNotEqual(guest.get(url).status_code, 200)

    def test_edit_link_only_opens_own_answer(self):
        guest = Client()
        edit_url = self.rsvp(guest, self.inv, name="Derde Gast").json()["edit_url"]
        page = Client().get(edit_url)
        self.assertContains(page, "Derde Gast")
        self.assertNotContains(page, "Eerste Gast")
        self.assertEqual(Client().get(f"/u/{self.inv.slug}/antwoord/verkeerd-token-1234567890/").status_code, 404)


class MediaAccessTests(VaylideTestCase):
    def setUp(self):
        self.owner = self.make_customer("media@example.com")
        self.inv = self.make_invitation(owner=self.owner)
        self.c = Client()
        self.c.force_login(self.owner)
        created = self.c.post(f"/maken/{self.inv.uid}/upload/", {"fotos": [jpeg_file(name="a.jpg"), jpeg_file(name="b.jpg")]}, HTTP_ACCEPT="application/json").json()["created"]
        self.used, self.unused = created[0]["uid"], created[1]["uid"]
        self.inv.refresh_from_db()
        content = dict(self.inv.draft_content)
        content["photos"] = {"hero": {"asset": self.used, "x": 50, "y": 50, "zoom": 1}, "gallery": []}
        from invitations.services import save_draft

        save_draft(self.inv, expected_rev=None, content=content, user=self.owner)
        self.pay(self.inv, self.owner)

    def test_only_referenced_photos_of_live_invitation_are_public(self):
        anon = Client()
        self.assertEqual(anon.get(f"/u/{self.inv.slug}/media/{self.used}/groot/").status_code, 200)
        self.assertEqual(anon.get(f"/u/{self.inv.slug}/media/{self.unused}/groot/").status_code, 404)
        # Conceptmedia vereisen toegang tot de uitnodiging.
        self.assertEqual(anon.get(f"/maken/{self.inv.uid}/media/{self.unused}/groot/").status_code, 404)
        self.assertEqual(self.c.get(f"/maken/{self.inv.uid}/media/{self.unused}/groot/").status_code, 200)

    def test_photo_of_other_invitation_cannot_be_referenced(self):
        stranger = self.make_customer("stranger@example.com")
        other = self.make_invitation(owner=stranger)
        content = dict(other.draft_content)
        content["photos"] = {"hero": {"asset": self.unused, "x": 50, "y": 50, "zoom": 1}, "gallery": [{"asset": self.used}]}
        from invitations.services import save_draft

        other = save_draft(other, expected_rev=None, content=content, user=stranger)
        self.assertIsNone(other.draft_content["photos"]["hero"])
        self.assertEqual(other.draft_content["photos"]["gallery"], [])

    def test_offline_invitation_hides_everything(self):
        self.inv.status = "offline"
        self.inv.save()
        anon = Client()
        self.assertEqual(anon.get(self.inv.public_path).status_code, 410)
        self.assertEqual(anon.get(f"/u/{self.inv.slug}/media/{self.used}/groot/").status_code, 404)
        self.assertEqual(MediaAsset.objects.filter(invitation=self.inv).count(), 2)


class ErrorPageTests(VaylideTestCase):
    def test_404_page_is_own_page_and_not_indexed(self):
        response = Client().get("/bestaat-echt-niet/")
        self.assertEqual(response.status_code, 404)
        self.assertContains(response, "Deze pagina bestaat niet (meer)", status_code=404)
        self.assertContains(response, 'content="noindex, nofollow"', status_code=404)

    def test_500_page_renders_without_request_context(self):
        from django.test import RequestFactory

        from core.views import server_error

        response = server_error(RequestFactory().get("/"))
        self.assertEqual(response.status_code, 500)
        self.assertIn("Er ging iets mis", response.content.decode())
