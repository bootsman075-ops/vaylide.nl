# Promotiefilmpje (Instagram-post)

`maak_promo.cjs` maakt een filmpje van 10 seconden in het formaat van een Instagram-post (1080 × 1350,
30 beelden per seconde, zonder geluid): een telefoon met de voorbeelduitnodiging van Liefde op papier
bij een bruiloft.

| Tijd | Wat je ziet |
| --- | --- |
| 0 – 2 s | De dichte envelop met het Vaylide-logo |
| 2 – 5,8 s | Een tik op het zegel; de klep klapt open en de brief springt eruit |
| 5,8 – 8,8 s | De namen, de datum en de locatie; het beeld zakt rustig een stukje |
| 8,8 – 10 s | Het logo (zoals aangeleverd) met "Jouw moment begint hier" |

Onderaan staat klein "Voorbeeld met fictieve namen": de namen en de locatie zijn verzonnen.

```bash
.venv/bin/python manage.py runserver                     # in een eigen terminal
node tools/promo/maak_promo.cjs http://127.0.0.1:8000 vaylide-promo.mp4 [blush|salie|lavendel|bordeaux-goud]
```

Nodig: Playwright met Chromium en `ffmpeg`. Het script neemt de echte pagina op (CDP-screencast van
Chromium) en voegt de beelden met ffmpeg samen. Muziek voeg je in Instagram zelf toe.
