# Online zetten op je eigen domein

De site staat nog nergens online. Vanuit de omgeving waarin Vaylide is gebouwd, kan hij niet zelf online
worden gezet. Daarvoor zijn twee dingen nodig die alleen de eigenaar heeft of kiest:

- een **hostingaccount**: de computer op internet waarop de site draait (een betaalde dienst);
- toegang tot de **DNS-instellingen** van het domein, bij het bedrijf waar het domein is geregistreerd.

Dit stappenplan gaat uit van het domein van de eigenaar: `vaylide.com`.

## In twee stappen

1. **Eerst een afgeschermde testversie.** De site draait online in testmodus: betalingen zijn
   gesimuleerd, e-mails gaan niet echt de deur uit en op elke pagina staat de testbalk. Zet er altijd een
   wachtwoord op (`VIERLIEF_PREVIEW_PASSWORD`, zie stap 3). In testmodus staat de inlogcode namelijk op
   het scherm, dus zonder wachtwoord kan iedereen inloggen met elk e-mailadres en de gegevens van dat
   account zien. Deel het wachtwoord alleen met mensen die meekijken. Echte klanten horen hier niet op.
2. **Daarna live.** Echte bestellingen pas als Mollie (betalingen), e-mail (SMTP), de juridische teksten
   en de bedrijfsgegevens klaar zijn. De checklist staat in `docs/LIVEGANG.md`. In live-modus weigert de
   app te starten zonder echte betaalprovider, e-mail en https.

## 1. Hosting kiezen (keuze van de eigenaar)

Er is nog niets afgesloten. Twee mogelijkheden die bij dit project passen:

- **Een platform dat de app voor je draait** en een `Procfile` begrijpt. Het project heeft er een:
  `release` (database bijwerken), `web` (de site) en `worker` (taken na betaling). Kies een aanbieder
  met servers in de EU (gastgegevens), PostgreSQL als database, een blijvende schijf voor foto's, en
  https met je eigen domein.
- **Een eigen server (VPS) met Docker.** De `Dockerfile` en de commando's staan in de README
  (onder "Installeren op een server"). Zet er een webserver met https vóór, bijvoorbeeld Caddy of
  nginx met Let's Encrypt.

Nodig in beide gevallen: Python 3.11 (zit in de Docker-image), PostgreSQL (aanbevolen), een blijvende
map voor uploads, de worker of een cron op `/intern/taken/`, en dagelijks
`python manage.py apply_retention`.

## 2. Domein koppelen (DNS)

De hostingaanbieder geeft aan welke records nodig zijn. Meestal:

| Record | Naam | Waarde |
|---|---|---|
| A (en eventueel AAAA) | `vaylide.com` | het IP-adres van de hosting |
| CNAME | `www` | het adres dat de hosting opgeeft |

Kies één hoofdadres, bijvoorbeeld `https://www.vaylide.com`, en laat het andere daarheen doorsturen
(dat regel je bij de hosting). Het https-certificaat maakt de hosting meestal zelf aan zodra de DNS klopt.

## 3. Instellingen op de hosting

Zet deze waarden in de instellingen (omgevingsvariabelen) van de hosting, niet in de code. Voor de
afgeschermde testversie:

```bash
VIERLIEF_MODE=test
DJANGO_DEBUG=false
DJANGO_SECRET_KEY=            # lange willekeurige waarde, zie .env.example
DJANGO_ALLOWED_HOSTS=vaylide.com,www.vaylide.com
DJANGO_CSRF_TRUSTED_ORIGINS=https://vaylide.com,https://www.vaylide.com
VIERLIEF_BASE_URL=https://www.vaylide.com
VIERLIEF_CONTACT_EMAIL=       # het adres waarop je bereikbaar wilt zijn
VIERLIEF_OWNER_EMAIL=         # waar meldingen voor de eigenaar heen gaan
DATABASE_URL=                 # van de hosting (PostgreSQL)
VIERLIEF_DATA_DIR=            # blijvende map, bijvoorbeeld /data
VIERLIEF_UPLOAD_DIR=          # blijvende map voor foto's, bijvoorbeeld /data/uploads
VIERLIEF_TRUSTED_PROXY_HOPS=1 # bij de meeste hostingplatforms
VIERLIEF_DJANGO_ADMIN_PATH=   # een pad dat niet makkelijk te raden is, eindigend op /
VIERLIEF_PREVIEW_USER=voorbeeld
VIERLIEF_PREVIEW_PASSWORD=    # lang en willekeurig; alleen delen met mensen die meekijken
```

Voor live komen daar de waarden voor Mollie en e-mail bij en wordt `VIERLIEF_MODE=live` (zie
`docs/LIVEGANG.md` en `.env.example`). Het wachtwoord voor de hele site haal je dan weg.

## 4. Eerste start en controle

1. De database bijwerken: `python manage.py migrate` (bij een platform met `Procfile` gebeurt dat vanzelf
   bij `release`). De ontwerpen worden daarbij ingelezen.
2. Een beheeraccount maken: `python manage.py createsuperuser`, met een sterk wachtwoord.
3. `python manage.py check --deploy`. Er horen alleen de bewust open gelaten meldingen W005 en W021 te staan.
4. Open `https://www.vaylide.com`: je krijgt eerst het inlogvenster van de browser, daarna de site met
   de testbalk. Controleer het logo, een voorbeelduitnodiging, samenstellen tot de testbetaling, en het
   beheer op het geheime pad.
5. Bekijk `https://www.vaylide.com/healthz`: dat moet zonder wachtwoord "ok" geven (voor de controle door
   de hosting).

Gebruik een lege database: niet de ontwikkeldatabase met testgegevens, zoals het account
`controle@vierlief.test`.
