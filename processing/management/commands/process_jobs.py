"""Voert openstaande en mislukte taken uit (publiceren, e-mail, AI-beoordeling).

Eenmalig (bijv. elke minuut via cron):   python manage.py process_jobs
Als doorlopende worker:                  python manage.py process_jobs --loop --interval 20
"""
import time

from django.core.management.base import BaseCommand

from processing.jobs import process_due


class Command(BaseCommand):
    help = "Voert openstaande verwerkingstaken uit en probeert mislukte taken opnieuw."

    def add_arguments(self, parser):
        parser.add_argument("--loop", action="store_true", help="Blijf draaien (worker).")
        parser.add_argument("--interval", type=int, default=20, help="Seconden tussen rondes (met --loop).")

    def handle(self, *args, **options):
        while True:
            done = process_due()
            if done or not options["loop"]:
                self.stdout.write(f"{done} taak/taken uitgevoerd.")
            if not options["loop"]:
                return
            time.sleep(max(5, options["interval"]))
