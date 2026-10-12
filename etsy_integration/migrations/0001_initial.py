from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="EtsyConnection",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("identifier", models.CharField(default="primary", max_length=20, unique=True)),
                ("etsy_user_id", models.CharField(max_length=40)),
                ("access_token_encrypted", models.TextField()),
                ("refresh_token_encrypted", models.TextField()),
                ("expires_at", models.DateTimeField()),
                ("scopes", models.CharField(blank=True, max_length=300)),
                ("connected_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Etsy-verbinding",
                "verbose_name_plural": "Etsy-verbindingen",
            },
        ),
    ]
