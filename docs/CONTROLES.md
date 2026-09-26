# Uitgevoerde controles

Hier staan alleen controles die echt zijn uitgevoerd, met hoe en met welk resultaat. Wat niet gecontroleerd kon worden, staat onderaan.

## Controle 1: volledige werking

**116 geautomatiseerde tests** (`python manage.py test tests`), laatst gedraaid op de definitieve code met de 30 nieuwe ontwerpen (ronde 4), alle geslaagd:

- lokaal op SQLite;
- op PostgreSQL 16 (lokale database);
- in de Docker-image (Python 3.11), na een build vanaf nul: in ronde 2 (toen 92 tests). Daarna is de image niet opnieuw gebouwd; er zijn geen afhankelijkheden, instellingen of datamodellen veranderd (de nieuwe ontwerpen zijn bestanden, en het extra veld "Aantal jaar" staat in de bestaande inhoud van een uitnodiging).

| Uit de opdracht | Test(s) |
|---|---|
| Ontwerp → gegevens → upload → voorbeeld → testbetaling → publicatie → link → gast meldt zich aan → klant ziet het antwoord | `test_flow.FullJourneyTests.test_design_to_guest_response_seen_by_customer` (ook de gast-aanmelding zonder JavaScript) |
| Voortgang bewaren en hervatten | `ResumeProgressTests`: concept zonder account blijft bewaard en wordt na verificatie aan het account gekoppeld; de inloglink werkt maar één keer en pas na een klik; foute codes worden geweigerd en het aantal pogingen is beperkt |
| Ongeldige formulierinvoer | `InvalidInputTests`: verplichte velden (invoer blijft staan), ongeldige formaten, datum te ver weg, eindtijd zonder begintijd, programmaregels, telefoonnummer, aanmelddeadline na het evenement, keuzevraag met te weinig opties, onvolledige bestelling, onbekend pakket |
| Afgebroken en mislukte betaling | `test_cancelled_payment_keeps_design_and_allows_retry`, `test_failed_and_expired_payments_do_not_publish`, `test_return_page_alone_never_publishes` |
| Herhaalde betalingsmelding | `test_repeated_webhooks_do_not_duplicate_anything` (geen dubbele bestelling, publicatie of e-mail); ook: een vervalste melding (`test_webhook_cannot_fake_a_payment`), een afwijkend bedrag, een dubbele betaling, en de Mollie-koppeling met een gesimuleerde API |
| Mislukte publicatie en e-mail | `test_processing`: de betaalde bestelling blijft staan, de status is zichtbaar, het herstel gaat automatisch, de eigenaar krijgt een melding na herhaald falen, en een mislukte e-mail blokkeert de publicatie niet (de link staat al in Mijn Vierlief) |
| Wijzigen na publicatie | `EditAfterPublicationTests`: pas live na publiceren, op dezelfde link; publiceren wordt geblokkeerd als verplichte gegevens ontbreken |
| Extra wensen | `test_wishes`: alleen een ontvangstbevestiging (zonder prijs of toezegging), een interne inschatting die de klant niet ziet, een voorstel met en zonder prijs, akkoord, betaling, in uitvoering, afgerond, interne notities, ongeldige bijlagen |
| Afgeschermde toegang tussen klanten | `CustomerIsolationTests`: overal een 404 bij een uitnodiging van een ander, ook bij uploaden en publiceren |
| Onbevoegde toegang tot gastenlijsten en uploads | `GuestPrivacyTests` en `MediaAccessTests`: een gast ziet geen andere antwoorden, een wijzigingslink opent alleen het eigen antwoord, alleen foto's van gepubliceerde uitnodigingen zijn zichtbaar, offline betekent alles dicht |
| 30 nieuwe ontwerpen (ronde 4) | `test_atelier`: 30 ontwerpen, vijf per gelegenheid, allemaal ingelezen en zichtbaar; geldige keuzes; contrast van alle 90 kleurvarianten (minimaal 4,5:1); eigen kaart- en voorbeeldbeelden; weergave voor elke gelegenheid en in elke kleur; lange namen en lange woorden krijgen kleinere letters; het grote getal (leeftijd of aantal jaren) en de terugval op initialen; aantal jaren bij zakelijke evenementen; de hele reis samenstellen → voorbeeld → betalen → gepubliceerde uitnodiging met een nieuw ontwerp; homepage, collectie, ontwerppagina, samenstellen en zoeken |
| Versieherstel en conflicten | `ConflictTests`, `RestoreTests`, `TemplateVersionPinningTests`: een aanpassing door het team wordt niet stil overschreven, vergrendelde velden blijven staan, publiceren met een verouderde stand wordt geweigerd, een nieuwe ontwerpversie verandert bestaande uitnodigingen niet |

Verder getest: aanmeldingen (dubbel tikken geeft één antwoord, limieten, deadline, capaciteit, verstreken datum, wijzigen en verwijderen, spambescherming, rate limiting, extra vragen per pakket), uploads (EXIF en GPS verwijderd, verkeerde of te kleine bestanden, maximale grootte, audio, te grote verzoeken), weergave (lange namen, lege onderdelen verborgen, tijdzones, alle voorbeelden voor alle gelegenheden, werkt zonder JavaScript), beveiligingsheaders, prijsberekening, bewaartermijnen en accountverwijdering, foutpagina's, handmatige statuswijziging (met logboek), een ontwerp zonder voorbeeldafbeelding, de controle van ontwerpmanifesten, de snelheidsmaatregelen (inline startscript met CSP-hash, compressie van tekst maar niet van beelden of deelverzoeken, een vast aantal databasevragen in Mijn Vierlief), en de nieuwe pagina's: Inspiratie, Over ons en Zoeken. Zoeken vindt vragen, ontwerpen en pagina's, negeert hoofdletters en accenten, kort lange zoektermen in, toont invoer veilig (geen HTML) en staat op `noindex`. Een test controleert dat namen, locaties, e-mailadressen, gastnamen en links van echte uitnodigingen nooit in de resultaten verschijnen.

Daarnaast zijn de klantreis en het beheer tijdens de bouw doorlopen met scripts: publiceren, versies, herstellen, voorstellen en e-mails.

## Controle 2: vormgeving en gebruik

### Hoe

- Een productie-achtige server: `DEBUG` uit, gunicorn, statische bestanden met versiekenmerk (WhiteNoise), testmodus voor betalen en e-mail.
- Chromium via Playwright op **360×740, 390×844, 768×1024 en 1366×900** pixels (`e2e/controle2.cjs`), in ronde 4 in vier parallelle runs, één per schermformaat. De run op 390 pixels liep eerst vast bij het inloggen: de vier runs vroegen tegelijk een inlogcode aan voor hetzelfde testaccount, waarbij een nieuwe code de vorige ongeldig maakt. Het script probeert het inloggen nu opnieuw; de run op 390 pixels is daarna in zijn geheel herhaald.
- Per schermformaat **204 pagina's** (816 in totaal): alle websitepagina's (ook Inspiratie, Over ons en Zoeken met en zonder resultaten), de 404, alle 33 voorbeelden (geopend), 132 testuitnodigingen (vier per ontwerp), de klantomgeving, alle stappen van het samenstellen en de beheeromgeving.
- Testuitnodigingen per ontwerp (`e2e/fixtures.py`):
  - **lang**: zeer lange namen, een lange locatie, adres en contactgegevens, 11 programmaonderdelen, foto's in liggend, staand en vierkant formaat, extra vragen;
  - **minimaal**: geen foto's en geen optionele onderdelen;
  - **verstreken**: een datum in het verleden;
  - **woord** (nieuw): lange woorden in de titel voor de gelegenheid waarvoor het ontwerp is gemaakt, zoals "Nieuwjaarsreceptie", en een getal van drie cijfers.
- Per pagina: een schermafbeelding, horizontaal scrollen, zichtbare onderdelen die buiten beeld steken, tekst die buiten beeld loopt (ook als een omringend vak hem afsnijdt; nieuw in ronde 4), fouten in de browserconsole en mislukte verzoeken. Bewust scrollbare tabellen, menu's en de veegrij met ontwerpen, bijgesneden foto's en tekst die alleen voor schermlezers is, tellen niet mee.

### Resultaat

- **816 pagina's zonder bevindingen** (ronde 4, definitieve code): geen horizontaal scrollen, niets buiten beeld, geen afgesneden tekst, geen consolefouten, geen mislukte verzoeken.
- **264 van 264 gedragscontroles geslaagd**, voor alle 33 ontwerpen (acht per ontwerp):
  - minder beweging: de uitnodiging opent binnen ongeveer 0,3 seconde (hoogstens 302 ms), zonder lopende animaties;
  - toetsenbord: de openknop is met Tab bereikbaar; na openen staat de focus op de kop en is de inhoud bedienbaar;
  - muziek start pas na een tik en is te pauzeren;
  - laadt het script niet, dan verdwijnt het openingsscherm vanzelf (vangnet);
  - in een andere tijdzone verschijnt de melding "tijd in Nederland";
  - zonder JavaScript zijn de kop en het aanmeldformulier direct zichtbaar.
- **Toegankelijkheid van alle ontwerpen** (`e2e/toegankelijkheid.cjs`, ronde 4): axe-core 4.13 (WCAG 2.0/2.1, A en AA) en de contrastcontrole op **204 pagina's**: alle 33 ontwerpen in alle 102 kleurvarianten, dicht en geopend. Op het openingsscherm telt ook decoratieve tekst mee die voor schermlezers verborgen is. **0 overtredingen en 0 contrastproblemen in de 30 nieuwe ontwerpen.** Bij Liefde op papier (ronde 1) haalt de decoratieve monogram op het lakzegel 3,0 tot 4,3:1 in drie van de vier kleuren. WCAG stelt geen eis aan puur decoratieve tekst (de knop zelf heet "Open de uitnodiging"); aanpassen kan in een v2 van dat ontwerp.
- **Toegankelijkheid van de website** (ronde 4): axe-core op **199 pagina's**: 19 websitepagina's (waaronder de collectie met het filter op verjaardag, de ontwerppagina van Confetti en het samenstellen voor een babyshower), de eerste 12 kleurvarianten dicht en geopend, 132 testuitnodigingen (alle 33 ontwerpen met vier soorten gegevens: lang, minimaal, verstreken en een lang woord), de klantomgeving, alle stappen van het samenstellen en het beheer. **0 overtredingen.** Contrast van tekst op kleurverlopen en beelden op 172 pagina's: **0 onder 4,5:1** (3:1 voor grote tekst). Voor de tekst op het doorschijnende vel van Puur moment is ook het slechtste geval berekend (een volledig zwarte foto onder een licht vel, of een witte onder het donkere vel): minimaal 5,3:1 in alle vier kleurvarianten. In ronde 3 waren dit 73 en 46 pagina's, met dezelfde uitkomst.
- **Met het oog bekeken** (ronde 4): alle 30 nieuwe ontwerpen dicht, tijdens het openen, geopend op de telefoon (hele pagina) en op de computer; de kaartbeelden van de collectie; de homepage, collectie, een ontwerppagina en het samenstellen; testuitnodigingen met lange namen op 360 pixels. Wat daarbij opviel, staat hieronder bij "Gevonden en opgelost".
- **Lange woorden** (ronde 4): alle 30 nieuwe ontwerpen in al hun gelegenheden (77 combinaties) met een lang woord als titel of naam, op 360, 320 en 270 pixels breed (de telefoon op de ontwerppagina): geen tekst buiten beeld.
- Eerdere rondes: de schermafbeeldingen op 360 pixels zijn met het oog bekeken (lange uitnodigingen, website, samenstellen, klantomgeving, beheer en foutpagina's), en de homepage is op 390 en 1440 pixels naast de voorbeeldfoto gelegd. Het live voorbeeld op de homepage laadt pas bij het scrollen; zonder JavaScript staat er een leesbare link naar het voorbeeld.

### Snelheid (Lighthouse 12, telefoon met trage mobiele verbinding)

Gemeten op de productie-achtige server. Ronde 4 (met de 30 nieuwe ontwerpen):

| Pagina | Prestaties | Eerste inhoud | Grootste element | Verspringen | Gewicht |
|---|---|---|---|---|---|
| Homepage | 99 | 0,8 s | 2,0 s | 0 | 214 KB |
| Collectie (alle 33 ontwerpen) | 100 | 0,8 s | 1,5 s | 0 | 138 KB |
| Collectie, filter verjaardag | 100 | 0,8 s | 1,7 s | 0 | 158 KB |
| Ontwerppagina Confetti (met live voorbeeld) | 100 | 0,8 s | 1,4 s | 0 | 224 KB |
| Voorbeelden Confetti / Gala / Ja-woord | 100 / 100 / 99 | 0,9–1,5 s | 1,7–2,0 s | ≤ 0,003 | 109–149 KB |
| Voorbeelden Rozentuin / Onder de sterren / Tropisch | 98 / 99 / 99 | 1,4–1,7 s | 1,8–2,1 s | ≤ 0,005 | 142–189 KB |

Ronde 3 (nieuwe vormgeving):

| Pagina | Prestaties | Eerste inhoud | Grootste element | Verspringen | Gewicht |
|---|---|---|---|---|---|
| Homepage | 99 | 0,8 s | 2,0 s | 0 | 198 KB |
| Collectie (ontwerpen) | 100 | 0,8 s | 1,5 s | 0 | 136 KB |
| Prijzen | 100 | 0,8 s | 1,4 s | 0 | 90 KB |
| Inspiratie | 99 | 1,1 s | 2,1 s | 0 | 171 KB |
| Samenstellen | 99 | 0,9 s | 1,7 s | 0,05 | 129 KB |
| Liefde op papier / Avondgoud / Puur moment (voorbeeld) | 99 / 99 / 100 | 1,2–1,7 s | 1,7–2,0 s | ≤ 0,01 | 102–169 KB |
| Gepubliceerde uitnodiging | 99 | 1,4 s | 2,0 s | 0 | 171 KB |

Toegankelijkheid en beste praktijken scoren 100 op alle gemeten pagina's, vindbaarheid 100 op de websitepagina's. De lagere vindbaarheidsscore van uitnodigingen, voorbeelden en het samenstellen is bewust: die pagina's staan op `noindex`. Een Atelier-ontwerp laadt de gedeelde opmaak (44 KB, gecomprimeerd 9 KB), een eigen stylesheet van ongeveer 1 KB en alleen de eigen lettertypen. De collectie laadt de kaartbeelden pas als ze in beeld komen, dus 33 ontwerpen maken de pagina nauwelijks zwaarder.

### Gevonden en opgelost

Ronde 4 (30 nieuwe ontwerpen):

| Bevinding | Oplossing |
|---|---|
| Cadeaulint: het lint liep dwars over de namen op het openingsscherm | Namen op een kaartje dat over het lint ligt |
| Envelop: de namen waren half zichtbaar tussen klep en voorkant | Klep en voorkant sluiten naadloos; de namen staan op de voorkant van de envelop, ook bij lange namen (twee regels) |
| Schuifpaneel: het paneel bedekte maar een deel van het scherm (een basisregel was sterker) | Paneel over het hele scherm |
| Polaroid: een vlak grijs vlak | Een donker, nog niet ontwikkeld beeld dat bij het openen oplicht |
| Koppen met lijnen braken op telefoons onnodig af ("Goed om te / weten") | Eerst worden de lijnen korter, pas daarna breekt de tekst |
| Sierletters (Italiana, Abril Fatface) lazen slecht in kleine tekst en cijfers | Rustiger letter voor ondertitel, welkomsttekst, datum en afteller |
| Stippen en confetti op de achtergrond liepen door de tekst | Lichter en kleiner |
| Alle ontwerpen toonden dezelfde voorbeeldfoto | 15 nieuwe eigen illustraties, per ontwerp gekozen |
| Mijlpaal (zakelijk) toonde een losse letter in plaats van een getal | Optioneel veld "Aantal jaar" bij zakelijke evenementen |
| Een lang woord in de titel (zoals "Nieuwjaarsreceptie") liep buiten beeld, ook in de telefoon op de ontwerppagina; de browsercontrole zag dat niet, omdat de pagina zulke tekst afsnijdt | Kleinere letter bij lange woorden en als laatste redmiddel afbreken; de browsercontrole meet nu ook afgesneden tekst, en elk ontwerp heeft een testuitnodiging met lange woorden |
| De homepage toonde alle ontwerpen onder elkaar | Drie uitgelichte ontwerpen en het aantal |
| Op de homepage-afbeeldingen (kaart en drie tegels) stond een focusrand rond de namen | Opnieuw gemaakt zonder focus; de tegels tonen nu ontwerpen die voor die gelegenheid zijn gemaakt |

Eerdere rondes:

| Bevinding | Oplossing |
|---|---|
| Nieuwe homepage: het cursieve lettertype in de kop laadde te laat, waardoor de knoppen versprongen (CLS 0,13) | Lettertype vooraf geladen: 0 |
| Nieuwe homepage: het live voorbeeld in het groene blok laadde meteen mee (366 KB, 125 ms blokkering) | Afbeelding als voorvertoning; het voorbeeld laadt pas vlak voordat het in beeld komt (198 KB, 0 ms) |
| Zonder JavaScript was de link in de telefoon onleesbaar (lichte tekst op lichte knop) | Donkere tekst |
| Op telefoons liep de tekst in het groene blok over de bloemen in de achtergrond | Donkere laag onder de tekst |
| Op "Zo werkt het" zakte de omschrijving van een kenmerk weg in hoge rijen | Rijen lijnen bovenaan uit |
| Samenstellen: stappen die nog niet bereikbaar zijn, stonden in een grotere letter | Alle stappen gelijk opgemaakt |
| Mijn Vierlief deed per uitnodiging aparte databasevragen (23 vragen bij 9 uitnodigingen) | Eén vraag voor alle uitnodigingen (5 in totaal, ongeacht het aantal) |
| Voorbeeldfoto's werden op telefoons in volle grootte geladen | Versies van 1000 pixels (4–13 KB in plaats van 9–80 KB) |
| Het startscript van de uitnodigingen blokkeerde de eerste weergave | Inline, toegestaan via een vaste hash in de CSP |
| HTML werd ongecomprimeerd verstuurd | Tekst wordt gecomprimeerd; beelden en deelverzoeken niet |
| Ontwerpenpagina sloeg een kopniveau over (Lighthouse) | Ontwerpkaarten zonder losse koppen |
| Kaarten onder "Andere ontwerpen" rekten uit tot halve breedte; de knop in "Op maat" werd uitgerekt | Vaste kolombreedte; knop onderaan zonder uitrekken |
| Tabbladen in Mijn Vierlief vielen op 360 px buiten beeld | Over de volle breedte verdeeld op smalle schermen |
| Stap Foto's schoof op 360 en 390 px 64–94 px te breed (het uploadveld) | Breedte van het uploadveld begrensd |
| Ontbrekende deelafbeeldingen en app-icoon zouden in productie een foutpagina geven | Afbeeldingen gemaakt in de huisstijl |
| Een nieuw ontwerp zonder voorbeeldafbeelding zou in productie een foutpagina geven | Neutrale standaardafbeelding als terugval |
| Statische bestanden waren in de Docker-container niet leesbaar voor het webproces | Vaste bestandsrechten voor statische bestanden; opnieuw getest in Docker |
| In het sierlettertype leken 1 en 0 op I en O ("I antwoorden") | Gewone cijfers op de site en in alle uitnodigingen |
| "1 antwoorden", "1 personen" | Enkelvoud en meervoud |
| Avondgoud: los scheidingsteken tussen tijd en locatie op de telefoon | Tijd en locatie onder elkaar op smalle schermen |
| Puur moment: gaten in de fotogalerij bij gemengde formaten | Galerij vult open plekken op |
| Puur moment: het kleine label op het doorschijnende vel kon bij een zeer donkere foto te weinig contrast hebben (berekend 3:1) | Label in de hoofdtekstkleur (minimaal 5,3:1) |
| "Automatisch bewaard" klopte niet (bewaren gebeurt per stap) | "Bewaard bij elke stap" |
| Kleurkiezers bij de dresscode hadden geen label (axe) | Labels toegevoegd |
| 404-pagina: veel lege ruimte, geen knop | Compacte kaart met knop naar de homepage |
| Foutpagina (500) kon zelf mislukken bij een databasestoring | Wordt nu zonder databasegegevens opgebouwd |
| Bij accountverwijdering bleven namen in bestellingen en bewaarde e-mails staan | Worden nu ook verwijderd |
| Ruimte onder het menu in Mijn Vierlief; lege toelichting zonder tekst | Afstand toegevoegd; toont nu "—" |

In eerdere rondes al opgelost: overlappende knop in de mobiele kop, de testbalk onder de camera-uitsparing in de telefoondemo, onduidelijke deadlinetekst, een te brede muziekknop op telefoons, het onthullen en fonkelen in Avondgoud, en de stappenweergave op de homepage.

### Productie-achtige controles

- `python manage.py check --deploy` met productie-instellingen (opnieuw in ronde 4): alleen de bewuste meldingen W005 en W021. `makemigrations --check`: geen wijzigingen in het datamodel.
- Docker (vorige ronde): de image bouwt vanaf nul, start met migraties op een leeg volume, laadt de ontwerpen, draait als gewone gebruiker (uid 10001), serveert statische bestanden en de eigen 404, en de onderhoudscommando's werken.

## Niet gecontroleerd

- **Echte apparaten en andere browsers**: alleen Chromium is gebruikt, op telefoon- en computerformaat. Safari/WebKit (iPhone) en Firefox zijn niet getest. Test vóór de lancering op echte iPhones en Android-telefoons.
- **Schermlezers** (VoiceOver, TalkBack): niet getest. Wel de automatische axe-controle en de toetsenbordbediening.
- **Geluid**: dat muziek pas na een tik start en te pauzeren is, is gecontroleerd; het geluid zelf is niet beluisterd.
- **Echte koppelingen**: Mollie, SMTP en de Claude-API zijn alleen met gesimuleerde antwoorden getest.
- **Weergave van e-mails** in mailprogramma's en de linkvoorvertoning in WhatsApp.
- **Belasting en snelheid** onder veel gelijktijdige bezoekers.
- **Vergelijking met de referenties en de schermopname**: niet mogelijk; zie `docs/AANPAK.md`.
- **Nieuwe vormgeving**: de voorbeeldfoto is als richting gebruikt, niet pixel voor pixel nagemaakt. Afwijkingen en de redenen staan in `docs/AANPAK.md`. De Docker-image is na deze ronde niet opnieuw gebouwd.
- **Nieuwe ontwerpen (ronde 4)**: de openingen zijn alleen in Chromium bekeken (dicht, tijdens het openen en geopend), niet in Safari of Firefox en niet op echte telefoons. De voorbeelden gebruiken eigen illustraties; met echte foto's zijn ze alleen via de testuitnodigingen bekeken (met dezelfde illustraties als foto). De 90 kleurvarianten zijn automatisch gecontroleerd (contrast en axe), niet allemaal met het oog.

## Zelf herhalen

```bash
# Functioneel
.venv/bin/python manage.py test tests

# Visueel (Playwright met Chromium nodig; alleen in testmodus)
.venv/bin/python e2e/fixtures.py > /tmp/fixtures.json          # maakt de testuitnodigingen (vier per ontwerp)
.venv/bin/python manage.py createsuperuser                        # beheerder: controle-beheer@vierlief.test
node e2e/controle2.cjs http://127.0.0.1:8000 /tmp/fixtures.json /tmp/controle2 '<wachtwoord beheerder>'

# Sneller: vier runs tegelijk, één per schermformaat (gedragscontroles in één ervan)
VIEWPORTS=360 CHECKS=0 SHOTS=viewport node e2e/controle2.cjs … &
VIEWPORTS=390 SHOTS=viewport node e2e/controle2.cjs … &         # enzovoort voor 768 en 1366

# Toegankelijkheid en contrast van alle ontwerpen in alle kleuren (eenmalig: npm install --no-save axe-core@4)
node e2e/toegankelijkheid.cjs http://127.0.0.1:8000 /tmp/toegankelijkheid.json [code ...]
```

Het rapport en de schermafbeeldingen komen in de uitvoermap (`rapport.json` of `rapport-<schermformaat>.json`, en per schermformaat een map met afbeeldingen). Gebruik bij de controles een server met `DEBUG` uit (zoals gunicorn); de ontwikkelserver toont bij een 404 een eigen foutpagina.
