"""Past bewaartermijnen toe. Draai dagelijks: python manage.py apply_retention"""
from django.core.management.base import BaseCommand

from core.privacy import apply_retention


class Command(BaseCommand):
    help = "Zet verlopen uitnodigingen offline en verwijdert gegevens na de bewaartermijn."

    def handle(self, *args, **options):
        report = apply_retention()
        for key, value in report.items():
            self.stdout.write(f"{key}: {value}")
