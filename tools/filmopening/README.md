# Opening als film

Maakt van een filmpje van de eigenaar een vloeiende opening voor een uitnodigingsontwerp, zoals bij Rozenzegel en Rozenboog.

- `rozenzegel-bron.mp4`: het filmpje van Rozenzegel zoals de eigenaar het aanleverde (10 seconden, 720 × 1280, 24 beelden per seconde, zonder geluid).
- `rozenboog-bron.mp4`: het filmpje van Rozenboog (10 seconden, 720 × 1280, 30 beelden per seconde, zonder geluid). De eigenaar stuurde het via WhatsApp (23,6 MB); dit is een opnieuw ingepakte versie van 7,5 MB (H.264, CRF 18, SSIM 0,991 tegen het origineel), zodat de repository niet te zwaar wordt.
- `maak_opening.py`: vertraagt het filmpje vloeiend en maakt alle bestanden voor het ontwerp.

## Wat het script doet

1. Meet per beeld hoeveel er beweegt (optische stroming).
2. Trekt desgewenst een ongelijkmatig tempo recht (`gelijkmatig`). Een filmpje dat van 24 naar 30 beelden per seconde is omgezet (zoals dat van Rozenboog), beweegt per beeld afwisselend veel en weinig; vertraagd wordt dat een zichtbaar golven. Het script geeft dan elk bronbeeld een eigen tijd naar de hoeveelheid beweging, alleen waar duidelijk iets beweegt.
3. Vertraagt zacht waar het snel gaat: wat langzaam beweegt blijft op ware snelheid. Het begin van het openen het meest (`T_begin`), daarna minder (`T_later`). Bij Rozenzegel gaat het begin van het openen zo ongeveer drie keer langzamer en de rest ongeveer anderhalf keer; bij Rozenboog gaan de rozen twee tot drie keer langzamer uiteen en speelt de rest op ware snelheid.
4. Berekent de tussenbeelden met optische stroming (OpenCV, DIS). Gewoon trager afspelen zou haperen; `minterpolate` van ffmpeg maakte het zegel blokkerig.
5. Schrijft:
   - `volledig-langzaam.mp4`: het hele filmpje, vertraagd (13,7 seconden bij Rozenzegel, 13,3 bij Rozenboog), om los te gebruiken;
   - `opening.mp4` (H.264) en `opening.webm` (VP9, voor browsers zonder H.264): het stuk voor de uitnodiging (bij Rozenzegel van net vóór het zegel gaat gloeien tot de kaart stil ligt, 10,3 seconden; bij Rozenboog van de rozenwand tot de boog stil staat, 8,0 seconden);
   - het eerste beeld (het openingsscherm, ook de poster van de video): `envelop.webp` bij Rozenzegel, `rozen.webp` bij Rozenboog;
   - het laatste beeld, de achtergrond van de kop: `kaart.webp` bij Rozenzegel (een half zichtbaar stukje zegel bovenin is weggewerkt), `boog.webp` bij Rozenboog;
   - een strook uit het eerste beeld voor de afsluiting: `envelop-band.webp` bij Rozenzegel, `rozen-band.webp` bij Rozenboog;
   - bij Rozenzegel ook het lakzegel, los: `zegel.webp`.

## Opnieuw maken

Nodig: ffmpeg en ffprobe, en Python met OpenCV in een eigen omgeving (niet in `requirements.txt`, want de site heeft het niet nodig):

```bash
python3 -m venv /tmp/film-venv && /tmp/film-venv/bin/pip install opencv-python-headless numpy
/tmp/film-venv/bin/python tools/filmopening/maak_opening.py rozenzegel /tmp/rozenzegel-uit
/tmp/film-venv/bin/python tools/filmopening/maak_opening.py rozenboog /tmp/rozenboog-uit
```

Dat duurt een paar minuten per filmpje. Staat er in het sjabloon een codecprofiel bij de bron (`codecs="avc1.64001F"`), controleer dat dan bij een nieuwe film: `ffprobe -show_streams opening.mp4` (High, level 3.1 is `avc1.64001F`). Kopieer daarna de video's en de beelden naar de ontwerpmap. Let op: een uitgebracht ontwerp verander je niet; maak een nieuwe versie (`designs/<code>/v2/`, zie `docs/HANDLEIDING.md`).

## Aanpassen

De instellingen staan per filmpje in `PRESETS` bovenin het script:

| Instelling | Betekenis |
|---|---|
| `T_begin`, `T_later` | Beweging per beeld die nog op ware snelheid speelt. Lager is langzamer. |
| `overgang` | Tussen welke seconden (van het bronfilmpje) het van `T_begin` naar `T_later` gaat |
| `gelijkmatig` | `True`: een ongelijkmatig tempo rechttrekken (filmpje omgezet van 24 naar 30 beelden per seconde) |
| `web` | Begin en eind (seconden van het bronfilmpje) van het stuk voor de uitnodiging |
| `crf_web`, `crf_webm` | Kwaliteit van de video's (lager is mooier en groter) |
| `opschonen` | Vlak bovenin het laatste beeld dat wordt weggewerkt (`None` om niets te doen) |
| `poster`, `eind` | Bestandsnamen van het eerste en het laatste beeld (standaard `envelop.webp` en `kaart.webp`) |
| `band`, `band_naam` | Welke strook (boven- en onderkant in beeldpunten) uit het eerste beeld voor de afsluiting, en de bestandsnaam (standaard `envelop-band.webp`) |
| `zegel` | Alleen Rozenzegel: waar het zegel in het eerste beeld staat (midden en straal) |

Een ander filmpje: voeg een nieuw blok toe aan `PRESETS` met een eigen bronbestand en meet de plekken opnieuw. Zie `docs/HANDLEIDING.md` onder "Ontwerp met een film als opening".
