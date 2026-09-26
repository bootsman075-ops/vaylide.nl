from django.apps import AppConfig


class CatalogConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "catalog"
    verbose_name = "Catalogus"

    def ready(self):
        from django.db.models.signals import post_migrate

        from .seed import ensure_catalog_on_migrate

        post_migrate.connect(ensure_catalog_on_migrate, sender=self)
