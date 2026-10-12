"""Beveiligingscontroles voor Etsy OAuth, zonder echte API-calls."""
import base64
import hashlib
import json
from unittest import mock
from urllib.parse import parse_qs, urlparse

from cryptography.fernet import Fernet
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings

from etsy_integration.models import EtsyConnection


TEST_KEY = Fernet.generate_key().decode("ascii")
SETTINGS = {
    "ETSY_ENABLED": True,
    "ETSY_CLIENT_ID": "test-etsy-client-id",
    "ETSY_REDIRECT_URI": "https://vaylide.nl/integraties/etsy/callback/",
    "ETSY_FERNET_KEY": TEST_KEY,
}


class FakeTokenResponse:
    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def read(self, size=None):
        return json.dumps({
            "access_token": "123456789." + ("a" * 65),
            "refresh_token": "123456789." + ("r" * 65),
            "expires_in": 3600,
            "scope": "shops_r transactions_r",
        }).encode("utf-8")


class EtsyOauthTests(TestCase):
    def setUp(self):
        self.staff = get_user_model().objects.create_user(
            email="staff-etsy@vaylide.test",
            password="strong-unique-test-password",
            is_staff=True,
        )
        self.client.force_login(self.staff)
        self.override = override_settings(**SETTINGS)
        self.override.enable()
        self.addCleanup(self.override.disable)

    def test_start_uses_etsy_pkce_and_exact_redirect_uri(self):
        response = self.client.get("/beheer/etsy/verbinden/")
        self.assertEqual(response.status_code, 302)
        redirect = urlparse(response["Location"])
        self.assertEqual(redirect.scheme, "https")
        self.assertEqual(redirect.netloc, "www.etsy.com")
        params = parse_qs(redirect.query)
        self.assertEqual(params["redirect_uri"], [SETTINGS["ETSY_REDIRECT_URI"]])
        self.assertEqual(params["scope"], ["shops_r transactions_r"])
        self.assertEqual(params["code_challenge_method"], ["S256"])
        pending = self.client.session["etsy_oauth_pending"]
        self.assertEqual(params["state"], [pending["state"]])
        challenge = base64.urlsafe_b64encode(
            hashlib.sha256(pending["verifier"].encode()).digest()
        ).decode().rstrip("=")
        self.assertEqual(params["code_challenge"], [challenge])

    def test_unconfigured_app_fails_closed(self):
        with override_settings(ETSY_ENABLED=False):
            response = self.client.get("/beheer/etsy/verbinden/")
        self.assertEqual(response.status_code, 503)
        self.assertFalse(EtsyConnection.objects.exists())

    def test_anonymous_and_customer_cannot_connect(self):
        self.client.logout()
        self.assertEqual(self.client.get("/beheer/etsy/verbinden/").status_code, 302)
        self.assertEqual(self.client.get("/integraties/etsy/callback/").status_code, 302)
        customer = get_user_model().objects.create_user(email="klant-etsy@vaylide.test")
        self.client.force_login(customer)
        self.assertEqual(self.client.get("/beheer/etsy/verbinden/").status_code, 404)
        self.assertEqual(self.client.get("/integraties/etsy/callback/").status_code, 404)

    def test_missing_or_wrong_state_cannot_exchange_token(self):
        self.assertEqual(self.client.get("/integraties/etsy/callback/?code=foo&state=bar").status_code, 400)
        self.client.get("/beheer/etsy/verbinden/")
        with mock.patch("etsy_integration.views.urllib.request.urlopen") as http:
            result = self.client.get("/integraties/etsy/callback/?code=foo&state=wrong")
            self.assertEqual(result.status_code, 400)
            http.assert_not_called()
        self.assertFalse(EtsyConnection.objects.exists())

    def test_verified_code_saves_encrypted_tokens_and_replay_fails(self):
        self.client.get("/beheer/etsy/verbinden/")
        state = self.client.session["etsy_oauth_pending"]["state"]
        callback_url = "/integraties/etsy/callback/?code=fake-etsy-code&state=" + state
        with mock.patch("etsy_integration.views.urllib.request.urlopen", return_value=FakeTokenResponse()) as http:
            response = self.client.get(callback_url)
            self.assertEqual(response.status_code, 302)
            self.assertEqual(http.call_count, 1)
        conn = EtsyConnection.objects.get(identifier="primary")
        self.assertEqual(conn.etsy_user_id, "123456789")
        self.assertNotIn("123456789.", conn.access_token_encrypted)
        self.assertEqual(Fernet(TEST_KEY.encode()).decrypt(conn.access_token_encrypted.encode()).decode(),
                         "123456789." + ("a" * 65))
        with mock.patch("etsy_integration.views.urllib.request.urlopen") as http:
            self.assertEqual(self.client.get(callback_url).status_code, 400)
            http.assert_not_called()

    def test_etsy_denial_consumes_state(self):
        self.client.get("/beheer/etsy/verbinden/")
        state = self.client.session["etsy_oauth_pending"]["state"]
        response = self.client.get("/integraties/etsy/callback/?error=access_denied&state=" + state)
        self.assertEqual(response.status_code, 400)
        self.assertNotIn("etsy_oauth_pending", self.client.session)
        self.assertFalse(EtsyConnection.objects.exists())
