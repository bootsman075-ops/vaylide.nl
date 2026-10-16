# Opening als film

Maakt van een filmpje van de eigenaar een vloeiende opening voor een uitnodigingsontwerp, zoals bij Rozenzegel.

- `rozenzegel-bron.mp4`: het filmpje zoals de eigenaar het aanleverde (10 seconden, 720 × 1280, 24 beelden per seconde, zonder geluid).
- `maak_opening.py`: vertraagt het filmpje vloeiend en maakt alle bestanden voor het ontwerp.

## Wat het script doet

1. Meet per beeld hoeveel er beweegt (optische stroming).
2. Vertraagt zacht waar het snel gaat: wat langzaam beweegt blijft op ware snelheid. Het begin van het openen het meest (`T_begin`), daarna minder (`T_later`). Bij Rozenzegel gaat het begin van het openen zo ongeveer drie keer langzamer en de rest ongeveer anderhalf keer.
3. Berekent de tussenbeelden met optische stroming (OpenCV, DIS). Gewoon trager afspelen zou haperen; `minterpolate` van ffmpeg maakte het zegel blokkerig.
4. Schrijft:
   - `volledig-langzaam.mp4`: het hele filmpje, vertraagd (13,7 seconden bij Rozenzegel), om los te gebruiken;
   - `opening.mp4` (H.264) en `opening.webm` (VP9, voor browsers zonder H.264): het stuk voor de uitnodiging, van net vóór het zegel gaat gloeien tot de kaart stil ligt (10,3 seconden);
   - `envelop.webp`: het eerste beeld (het openingsscherm, ook de poster van de video);
   - `kaart.webp`: het laatste beeld, de achtergrond van de kop; een half zichtbaar stukje zegel bovenin is weggewerkt;
   - `zegel.webp`: het lakzegel, los, en `envelop-band.webp`: een strook van de dichte envelop voor de afsluiting.

## Opnieuw maken

Nodig: ffmpeg en ffprobe, en Python met OpenCV in een eigen omgeving (niet in `requirements.txt`, want de site heeft het niet nodig):

```bash
python3 -m venv /tmp/film-venv && /tmp/film-venv/bin/pip install opencv-python-headless numpy
/tmp/film-venv/bin/python tools/filmopening/maak_opening.py rozenzegel /tmp/rozenzegel-uit
```

Dat duurt een paar minuten. Kopieer daarna `opening.mp4`, `opening.webm`, `envelop.webp`, `kaart.webp`, `zegel.webp` en `envelop-band.webp` naar de ontwerpmap. Let op: een uitgebracht ontwerp verander je niet; maak een nieuwe versie (`designs/rozenzegel/v2/`, zie `docs/HANDLEIDING.md`).

## Aanpassen

De instellingen staan per filmpje in `PRESETS` bovenin het script:

| Instelling | Betekenis |
|---|---|
| `T_begin`, `T_later` | Beweging per beeld die nog op ware snelheid speelt. Lager is langzamer. |
| `overgang` | Tussen welke seconden (van het bronfilmpje) het van `T_begin` naar `T_later` gaat |
| `web` | Begin en eind (seconden van het bronfilmpje) van het stuk voor de uitnodiging |
| `crf_web`, `crf_webm` | Kwaliteit van de video's (lager is mooier en groter) |
| `opschonen` | Vlak bovenin het laatste beeld dat wordt weggewerkt (`null` om niets te doen) |
| `zegel`, `band` | Waar het zegel en de strook van de envelop in het eerste beeld staan |

Een ander filmpje: voeg een nieuw blok toe aan `PRESETS` met een eigen bronbestand en meet de plekken opnieuw. Zie `docs/HANDLEIDING.md` onder "Ontwerp met een film als opening".
