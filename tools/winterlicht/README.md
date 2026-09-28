# Beelden van de kerstkaart Winterlicht

Alle beelden van Winterlicht zijn eigen werk: ze worden met code op een canvas getekend (`art.js`). Er zitten geen foto's, stockbeelden of AI-beelden in, en niets uit de schermopname die als voorbeeld diende.

| Bestand | Wat |
| --- | --- |
| `designs/winterlicht/v1/img/scene-<kleur>.webp` (1080 × 1920) en `scene-<kleur>-720.webp` (720 × 1280) | Het kerstraam in de kop: een boog van dennengroen met lichtjes, strik en lantaarns, met buiten een besneeuwd dorpje en kaarsen op de vensterbank. Eén per kleurvariant |
| `designs/winterlicht/v1/lichtjes.html` | De plekken van de levende lichtjes op dat kerstraam (kaarsvlammen, lichtsnoer, kerstster, lantaarns, ramen). Hoort bij de scènes: niet met de hand aanpassen |
| `designs/winterlicht/v1/img/huis-<kleur>.webp` (900 × 600) | Het huisje in de sneeuw bij "Locatie" |
| `designs/winterlicht/v1/img/relief-*.webp` | Het blinddruk-reliëf van de envelop (guirlande, ranken, krans en een klein patroon), als licht en schaduw. Werkt daardoor op elke papierkleur |
| `designs/winterlicht/v1/img/goud-*.webp` | Hetzelfde reliëf in goud: de golf die bij het openen door de envelop gaat |
| `static/img/demo/kerst-*.webp` | Voorbeeldfoto's voor de voorbeeldkaart (kerstboom, kaarsen, lichtjes, winterbos), elk ook in een kleinere versie (`-1000`) |

Opnieuw maken (Node met Playwright en Chromium):

```bash
node tools/winterlicht/render.cjs            # alles
node tools/winterlicht/render.cjs scene      # alleen de scènes (en lichtjes.html)
node tools/winterlicht/render.cjs huis relief goud foto
.venv/bin/python tools/winterlicht/comprimeer.py   # daarna: reliëf- en goudbeelden ongeveer half zo groot
```

Hoe het werkt:

- **Vaste toevalsgetallen.** Elke tekening gebruikt vaste reeksen (`rng(seed)`), zodat een nieuwe run hetzelfde beeld geeft. Elk deel van de scène heeft een eigen reeks: pas je één deel aan, dan blijft de rest gelijk.
- **Kleuren per variant** staan in `PALETTES` bovenin `art.js`. Een nieuwe kleurvariant krijgt daar een blok en in `render.cjs` een plek in `PALETTES`; voeg hem ook toe aan `manifest.json` (met de controle op contrast in de tests).
- **Reliëf.** Het motief wordt eerst als hoogtekaart getekend. Daaruit komen licht en schaduw, zoals bij echt blindgedrukt papier, als een doorzichtige laag.
- **Zwaarte.** De envelop is het eerste wat een gast ziet, dus die beelden moeten snel binnen zijn. `comprimeer.py` maakt de reliëf- en goudbeelden ongeveer half zo groot, en de gouden laag laadt pas na de rest (`.wl-geladen` in `style.css`, gezet door `winterlicht.js`), want die is pas bij het openen nodig.
- **Lichtjes.** Tijdens het tekenen onthoudt `art.js` waar lichtjes staan. `render.cjs` kiest er een vast aantal per soort uit (`KEEP`: genoeg voor de sfeer, weinig genoeg voor een oudere telefoon) en schrijft ze naar `lichtjes.html`. Daar twinkelen ze met CSS, alleen als beweging aan staat.
- **Tekst vrijhouden.** De namen en de wens staan in het bovenste deel van de boog (`.wl-hero__text` in `style.css`), tussen de lantaarns en boven de torenspits (op 49% van de hoogte; `LIMIT` in `winterlicht.js`). Houd dat deel van de scène rustig; de kerstster staat daarom links van het kerkje, onder de tekst. Controleer na een wijziging het contrast van de tekst op de tekening met `node e2e/kerstraam.cjs http://127.0.0.1:8000`.

Let op: `designs/winterlicht/v1` is een uitgebrachte ontwerpversie zodra er echte kerstkaarten op staan. Nieuwe beelden horen dan in een `v2` (zie `docs/HANDLEIDING.md`). Pas daarvoor `OUT` en `PARTIAL` bovenin `render.cjs` aan.
