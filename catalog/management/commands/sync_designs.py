"""Registreert nieuwe ontwerpen en ontwerpversies uit designs/*/v*/manifest.json.

Bestaande versies worden nooit aangepast (behalve met --update-manifest tijdens ontwikkelen).
"""
from django.core.management.base import BaseCommand, CommandError

from catalog.seed import DesignError, sync_designs


class Command(BaseCommand):
    help = "Leest de ontwerpmanifesten in en registreert nieuwe ontwerpen en versies."

    def add_arguments(self, parser):
        parser.add_argument("--update-manifest", action="store_true",
                            help="Alleen tijdens ontwikkelen: werk het manifest van bestaande versies bij.")

    def handle(self, *args, **options):
        try:
            messages = sync_designs(update_existing_manifest=options["update_manifest"])
        except DesignError as exc:
            raise CommandError(f"Ontwerp niet ingelezen: {exc}") from exc
        for message in messages or ["Geen wijzigingen."]:
            self.stdout.write(message)
