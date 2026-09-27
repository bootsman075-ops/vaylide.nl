# Logo van Vaylia

`vaylia-logo-bron.webp` is het logo zoals de eigenaar het aanleverde (1254 × 1254 pixels, crèmekleurige
achtergrond). Het logo wordt **zoals aangeleverd** gebruikt: de V, VAYLIA en de regel eronder samen, in
dezelfde kleuren en verhoudingen. Niet opsplitsen, bijsnijden, hertekenen of de tekst aanpassen zonder
akkoord van de eigenaar.

`maak_logo.py` maakt daaruit de bestanden voor de site. Het maakt alleen de lege achtergrond doorzichtig
en snijdt de lege rand eromheen weg. Halfdoorzichtige randen krijgen hun eigen kleur terug, zodat het
logo op de crèmekleurige achtergronden van de site gelijk is aan het origineel. Losse ruispuntjes van
de compressie, ver van het logo, vallen weg.

| Bestand | Waarvoor |
| --- | --- |
| `static/img/merk/vaylia-logo.webp` (346 × 240) | Kop en voet van de website, het samenstellen, de klantomgeving, het beheer en de foutpagina's (`templates/partials/logo.html`) |
| `static/img/merk/vaylia-logo.png` (346 × 240) | De e-mails (niet elk mailprogramma toont WebP) en de deelafbeelding (`tools/merkbeelden/`) |
| `static/img/favicon-32.png`, `favicon-48.png`, `icon-192.png` | Tabblad-icoon en Android: de V uit het logo op de crèmekleur van het origineel. Het hele logo is op 16 tot 48 pixels niet leesbaar |
| `static/img/apple-touch-icon.png` (180 × 180) | Icoon op het beginscherm van een iPhone of iPad: het hele logo op de crèmekleur |
| `tools/logo/vaylia-logo-vrijstaand.png` | Het hele logo vrijstaand op volle grootte (936 × 650), voor ander gebruik zoals drukwerk of sociale media |

De iconen staan in `templates/partials/icons.html`. De deelafbeelding `static/img/og-vaylia.jpg` maak je met
`node tools/merkbeelden/render.cjs merk`, nadat het logo is bijgewerkt.

## Opnieuw maken of een ander logo gebruiken

1. Vervang `vaylia-logo-bron.webp` door het nieuwe logo, op een effen lichte achtergrond, bij voorkeur
   minstens 1000 pixels breed.
2. `.venv/bin/python tools/logo/maak_logo.py`
3. `node tools/merkbeelden/render.cjs merk` (deelafbeelding)
4. Bekijk de kop en voet op telefoon en computer, en draai daarna `python manage.py collectstatic` op de server.

Heeft het nieuwe logo andere verhoudingen, pas dan de `width` en `height` in `templates/partials/logo.html` en
in `processing/templates/emails/base.html` aan. De hoogte op de site staat in `static/css/vierlief.css`
(`.logo__img`) en `static/css/app.css` (samenstellen en beheer).
