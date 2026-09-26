# Aanpak, keuzes en aannames

## Doel

Een complete eerste versie van Vierlief waarin standaardbestellingen zelfstandig verlopen: van ontwerp kiezen tot een gepubliceerde uitnodiging met aanmeldingen. De eigenaar grijpt alleen in bij extra wensen, vragen en storingen.

## Uitgangssituatie

Vierlief is een nieuw, zelfstandig project met een eigen repository. Er was nog geen bestaande techniek om op voort te bouwen, dus de keuze hieronder is gemaakt voor een platform met een database, betalingen, accounts en uploads.

## Techniekkeuze

**Python met Django 5.2 LTS** (ondersteund tot april 2028):

- Pagina's worden op de server opgebouwd. Ze laden snel op telefoons en werken ook zonder zware JavaScript. De uitnodiging blijft leesbaar als scripts of animaties niet laden.
- Django heeft ingebouwde beveiliging (CSRF, sessies, wachtwoorden, clickjacking), een volwassen database-laag met migraties en een noodbeheer (Django admin).
- Geen aparte build-stap of frontend-framework. Dat houdt het onderhoud eenvoudig.
- SQLite voor ontwikkeling en kleine installaties; PostgreSQL voor productie. De tests zijn op beide gedraaid.
- Verder: WhiteNoise (statische bestanden), Pillow (fotoverwerking), segno (QR-codes), gunicorn (webserver) en de officiële Anthropic-SDK voor de optionele AI-hulp.

## Opbouw in het kort

- **Ontwerpen en inhoud zijn gescheiden.** Een ontwerp is een map `designs/<code>/v<N>/` met een manifest, een HTML-template en een stylesheet. De gegevens van een evenement staan los daarvan in de database, als gestructureerde inhoud. Er wordt per bestelling geen website gebouwd.
- **Ontwerpversies zijn vastgezet.** Iedere uitnodiging verwijst naar één vaste ontwerpversie. Een nieuwe versie verandert bestaande uitnodigingen dus niet. Overstappen gebeurt alleen bewust, in het concept, en gaat pas live na publiceren.
- **Concept en gepubliceerde versie zijn gescheiden.** Wijzigingen gaan pas live na publiceren, op dezelfde link. Elke publicatie is een bewaarde versie die hersteld kan worden.
- **Conflicten worden gemeld.** Elk opslaan controleert of het concept intussen door een ander is gewijzigd (door de klant of het team). Zo ja, dan wordt niets overschreven: de klant ziet wat er veranderd is en kiest zelf. Beheer kan velden ook vergrendelen.
- **Verwerking na betaling via een takenwachtrij.** Publiceren en e-mailen zijn taken met een unieke sleutel. Herhaalde betalingsmeldingen leveren dus geen dubbele publicaties of e-mails op. Mislukte taken worden automatisch opnieuw geprobeerd en daarna aan de eigenaar gemeld.
- **Externe diensten zitten achter een eigen koppeling**, met een herkenbare testvariant: de betaalprovider (test of Mollie), e-mail (bewaren of SMTP) en AI (vaste teksten of Claude).

## De tien stappen uit de opdracht

| Opdracht | In Vierlief |
|---|---|
| 1. Gelegenheid kiezen | `/maken/`: bruiloft, verloving, verjaardag, jubileum, babyshower of zakelijk |
| 2. Ontwerp kiezen en uitproberen | Stap *Ontwerp*, met werkende voorbeelden per ontwerp en per gelegenheid |
| 3. Evenementgegevens invullen | Stappen *Gegevens*, *Programma & info* en *Aanmelden*; alleen vragen die bij de gelegenheid passen |
| 4. Foto's uploaden | Stap *Foto's & verhaal*: uitsnede kiezen (focuspunt en zoom) per foto, eventueel muziek |
| 5. Kleuren, secties en opties | Stap *Stijl & onderdelen*: kleurvariant, opening, onderdelen aan/uit |
| 6. Persoonlijk voorbeeld | Stap *Voorbeeld*: telefoon-, computer- en volledige weergave |
| 7. Fouten corrigeren | Het voorbeeld toont een controlelijst met directe links naar de stap waar iets ontbreekt |
| 8. Bestelling en totaalprijs | Stap *Bestellen*: pakket, automatisch benodigde opties, totaal aan de serverzijde berekend |
| 9. Betalen | Testbetaalpagina (nu) of Mollie (na aansluiten) |
| 10. Publicatie en klantomgeving | Statuspagina met de link, e-mail met link en QR-code, en in *Mijn Vierlief* de link, de QR-code (PNG en SVG) en de aanmeldingen |

Een voortgangsindicator toont steeds waar de klant is. Zonder account wordt het ontwerp in de sessie bewaard. Met **Opslaan en later verder** krijgt de klant een inlogcode per e-mail en staat het concept daarna in *Mijn Vierlief*. Bij bestellen is een geverifieerd e-mailadres nodig; dat wordt op dat moment duidelijk gemeld.

## Aannames

Deze keuzes zijn gemaakt om door te kunnen bouwen. Alle zijn aan te passen.

- **Naam en domein:** "Vierlief" is een werknaam. Het domein staat niet vast, dus het adres is instelbaar (`VIERLIEF_BASE_URL`).
- **Taal:** alleen Nederlands in deze versie.
- **Prijzen (voorlopig, incl. btw):** *Essentieel* € 39 (6 maanden online) en *Compleet* € 69 (12 maanden, met verhaal, fotogalerij tot 12 foto's, muziek en extra vragen). Losse opties: muziek € 9, fotogalerij € 12, verhaal € 6, extra vragen € 6 en 12 maanden langer online € 12. Op de site staat "Voorlopige prijzen". Alles is instelbaar in Beheer.
- **Inloggen klanten:** met een eenmalige code per e-mail, zonder wachtwoord. De code is 20 minuten geldig, met maximaal 5 pogingen. Zo is het e-mailadres meteen geverifieerd en zijn er geen vergeten wachtwoorden. **Beheerders** loggen in met e-mail en wachtwoord op `/beheer/inloggen/`.
- **Gasten:** geen account. Er wordt alleen gevraagd naar naam, aanwezig of afwezig, aantal personen en de vragen die de klant zelf toevoegt (met Compleet of de optie). Standaard mogen gasten met maximaal 2 personen komen, per uitnodiging instelbaar.
- **Beschikbaarheid:** een uitnodiging staat online vanaf de eerste publicatie, zo lang als het pakket aangeeft (verlengbaar). Daarna gaat hij automatisch offline.
- **Bewaartermijnen (instelbaar):** gastgegevens 90 dagen na het einde van de beschikbaarheid; ontwerpen zonder account 30 dagen; onbetaalde concepten van klanten 365 dagen; inlogcodes 2 dagen.
- **Betalen:** via Mollie, omdat die in Nederland iDEAL en andere methoden via één koppeling aanbiedt. Welke methoden beschikbaar zijn, bepaal je in je Mollie-account.
- **Muziek:** de klant uploadt een eigen MP3- of M4A-bestand en bevestigt de rechten. De muziek start nooit vanzelf. In de voorbeelden klinkt een eenvoudige, zelf gegenereerde melodie (geen bestaande muziek).
- **Beelden en lettertypen:** de voorbeeldfoto's zijn eigen abstracte afbeeldingen (`tools/generate_demo_images.py`), zonder stockfoto's of foto's van echte mensen. De lettertypen zijn open source (OFL) en staan op de eigen server, zodat er geen verzoeken naar Google Fonts gaan.
- **Juridische teksten:** privacyverklaring en voorwaarden zijn gemarkeerd als concept en moeten nog juridisch worden gecontroleerd en aangevuld met bedrijfsgegevens.
- **AI:** optioneel. Het standaardproces werkt volledig zonder AI. De AI-hulp gebruikt alleen wat de klant invulde en verzint geen gegevens; de klant beslist zelf over elk tekstvoorstel. Bij extra wensen maakt AI alleen een interne inschatting voor de eigenaar, zonder toezeggingen. De klant krijgt alleen een ontvangstbevestiging.

## Referenties en schermopname

Hier staat eerlijk wat wel en niet is bekeken.

- **Websites** (webgencyinvitations.com, /order en /thesacredgarden, template3.tilda.ws) en de **twee Instagram-reels**: in deze werkomgeving geblokkeerd door het netwerkbeleid (403 bij de proxy). Aan het begin geprobeerd en aan het eind opnieuw, met hetzelfde resultaat. **Ik heb deze pagina's niet gezien.** Via een zoekmachine kwamen alleen korte samenvattingen van zoekresultaten binnen: Webgency biedt kant-en-klare ontwerpen die met eigen kleuren, foto's en tekst worden aangepast, naast maatwerk, en "The Sacred Garden" is een van die ontwerpen. Dat is tweedehands informatie; details, teksten en prijzen van Webgency zijn niet gebruikt.
- **Schermopname** `Referentie_Vierlief_3_Voorbeelden.mp4`: niet ontvangen in deze sessie. Er was geen bijlage en het bestand staat nergens op de schijf. Begin- en eindtijden, openingsanimaties, overgangen en timing van de drie filmpjes zijn dus **niet** geanalyseerd.
- **Gevolg:** de drie ontwerpen volgen de eigen richtingen uit de opdracht en zijn **nog niet vergeleken met de opname of de referentiesites**:

| Ontwerp | Richting | Opening |
|---|---|---|
| Liefde op papier | Romantisch en zacht: handgeschreven namen, fijne lijntekeningen, zachte kleuren | Envelop met persoonlijk lakzegel (initialen); na een tik opent de klep en schuift de kaart naar buiten |
| Avondgoud | Donker, feestelijk en elegant: champagnegouden lijnen, medaillon, fonkelend licht | Gouden dubbele deur die openzwaait |
| Puur moment | Rustig en modern: veel witruimte, grote foto, strakke letters, genummerde onderdelen | Doorschijnend vel dat omhoog schuift, waarna de foto scherp wordt |

Elk ontwerp heeft vier kleurvarianten, werkt voor meerdere gelegenheden en is volledig bruikbaar zonder animatie. Er is ondersteuning voor minder beweging, voor bediening met het toetsenbord, en een vangnet dat de uitnodiging na 7 seconden toont als het script niet laadt.

**Bewuste afwijkingen en onbekende onderdelen.** Omdat de referenties niet te bekijken waren, is niet vast te stellen waar Vierlief ervan afwijkt. Onbekend zijn onder meer: de exacte timing en volgorde van de openingsanimaties in de filmpjes, welke effecten alleen in de montage zitten, de volledige vragenlijst en bestelstappen van Webgency, en het gedrag van muziek en formulieren in de voorbeelden.

**Vervolgstap:** sta de domeinen toe in de netwerkinstellingen van de omgeving en stuur de schermopname opnieuw mee, bijvoorbeeld als bestand in de repository. Dan volgt een vergelijkingsronde per filmpje: tijden, opening, overgangen en interacties. Aanpassingen komen als nieuwe ontwerpversie (`v2`), zodat bestaande uitnodigingen niet veranderen.
