from django.conf import settings
from django.utils import timezone


def vierlief(request):
    return {
        "TEST_MODE": settings.TEST_MODE,
        "CONTACT_EMAIL": settings.CONTACT_EMAIL,
        "BASE_URL": settings.BASE_URL,
        "CURRENT_YEAR": timezone.localdate().year,
        "SLOGAN": "Elk bijzonder moment begint met een uitnodiging.",
    }
