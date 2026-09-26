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
- **Vormgeving naar de voorbeeldfoto van de eigenaar**: warm crème, goud en diep bosgroen, Playfair Display voor koppen en DM Sans voor tekst, zachte panelen met ronde hoeken en dunne gouden lijniconen. Eén duidelijke knop per blok en korte teksten. De website, het samenstellen, Mijn Vierlief en het beheer delen één stijlblad met dezelfde kleuren en lettertypen. Zie "Nieuwe vormgeving" hieronder.
- **Snel**: pagina's worden op de server opgebouwd, tekst wordt gecomprimeerd, statische bestanden krijgen een versiekenmerk en lange cachetijd, en foto's komen in passende formaten.
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
- **Beelden en lettertypen:** de voorbeeldfoto's in de uitnodigingen zijn eigen abstracte afbeeldingen (`tools/generate_demo_images.py`). De sfeerbeelden, merkbeelden en tegels van de website zijn ook eigen werk (`tools/merkbeelden/`): getekende sfeerbeelden en schermafbeeldingen van de echte voorbeelduitnodigingen. Er zijn geen stockfoto's of foto's van echte mensen gebruikt. De lettertypen zijn open source (OFL) en staan op de eigen server, zodat er geen verzoeken naar Google Fonts gaan.
- **Juridische teksten:** privacyverklaring en voorwaarden zijn gemarkeerd als concept en moeten nog juridisch worden gecontroleerd en aangevuld met bedrijfsgegevens.
- **AI:** optioneel. Het standaardproces werkt volledig zonder AI. De AI-hulp gebruikt alleen wat de klant invulde en verzint geen gegevens; de klant beslist zelf over elk tekstvoorstel. Bij extra wensen maakt AI alleen een interne inschatting voor de eigenaar, zonder toezeggingen. De klant krijgt alleen een ontvangstbevestiging.

## Nieuwe vormgeving (voorbeeldfoto)

De eigenaar leverde een voorbeeldfoto van de gewenste website (kop, hero met foto en zwevende kaart, tegels per gelegenheid, "Zo werkt het" in vier stappen, een donker blok "Meer dan een uitnodiging", populaire ontwerpen, een review en "Liever iets unieks?"). De website volgt die opbouw, kleuren en letters. Bewust anders:

| In de voorbeeldfoto | In Vierlief | Waarom |
|---|---|---|
| Kop "Bijzondere momenten verdienen een bijzondere uitnodiging" | "Een bijzondere dag verdient een *bijzondere* uitnodiging." in dezelfde opmaak | Deze kop en de knoppen "Bekijk de ontwerpen" en "Maak jouw uitnodiging" zijn vastgelegd in de opdracht |
| Foto's van een bruidspaar, ringen, ballonnen, een vrouw met laptop | Eigen sfeerbeelden (gouden licht, groen, papier) en schermafbeeldingen van de echte voorbeelduitnodigingen | De foto's uit de voorbeeldfoto zijn niet los beschikbaar, te klein en de rechten zijn onbekend. Alle beelden zijn te vervangen door eigen foto's met dezelfde bestandsnaam (zie `tools/merkbeelden/README.md`) |
| Knop "Bekijk video" | Knop "Bekijk de ontwerpen"; de afspeelknop op de kaart opent het werkende voorbeeld | Er is geen video |
| Review met vijf sterren ("Sanne & Tim") | Weggelaten | Geen verzonnen reviews |
| "Populaire ontwerpen", hartjes om te bewaren | "Onze ontwerpen", zonder hartjes | Er zijn geen cijfers over populariteit en geen bewaarlijst |
| "Direct online", "Unieke ontwerpen" | "Automatisch online", "Stijlvolle ontwerpen" | Publiceren gebeurt pas na een bevestigde betaling; meerdere klanten kunnen hetzelfde ontwerp kiezen |
| Tegel "Evenement" | Tegel "Verloving" | Vierlief heeft deze zes gelegenheden: bruiloft, verloving, verjaardag, jubileum, babyshower en zakelijk |
| Kenmerken "Cadeautip", "Foto's & video's", "Persoonlijk design" | "Programma", "Foto's", "Kleurkeuze" | Alleen wat echt kan: praktische info (zoals een cadeautip) kan wel, maar video niet, en per ontwerp kies je uit drie of vier kleurvarianten |
| "Wij helpen je graag verder" | "We bekijken hem persoonlijk en je krijgt eerst een voorstel" | Geen toezegging over maatwerk zonder akkoord van de eigenaar |
| Menu-items Inspiratie en Over ons, zoeken en winkeltas | Nieuwe pagina's Inspiratie (voorbeeldteksten en tips) en Over ons (zonder verzonnen verhaal of cijfers), een zoekpagina, en de tas opent Mijn Vierlief | Zo werkt elk onderdeel uit de kop echt |

## Uitbreiding: 30 nieuwe ontwerpen

Op verzoek van de eigenaar ("een stuk of 30, met verschillende designs, verdeeld over de categorieën") zijn er 30 ontwerpen bijgekomen: **vijf per gelegenheid**. Samen met de eerste drie zijn het er 33.

**Aanpak.** Dertig losse ontwerpen met elk eigen HTML zouden lastig te onderhouden zijn en de kans op fouten in toegankelijkheid vergroten. Daarom delen ze één opbouw, **Atelier** (`designs/_atelier/v1/`), met tien openingen, negen koppen, zes soorten secties, vijf kopstijlen, vijf naamstijlen, vijf datumstijlen, vijf fotovormen, zeven achtergrondstructuren en twintig versieringen. Elk ontwerp is een eigen combinatie daarvan met eigen letters en kleuren, en soms eigen accenten in `style.css`. De beschrijving van alle 30 staat in `tools/atelier/specs.py`; `tools/atelier/ontwerpen.py` schrijft daaruit de ontwerpmappen. Zo blijven gedrag en toegankelijkheid (minder beweging, toetsenbord, vangnet zonder script) voor alle ontwerpen gelijk, en is een nieuw ontwerp een kwestie van kiezen en kleuren (zie `docs/HANDLEIDING.md`).

| Gelegenheid | Ontwerp | Opening | Stijl | Ook geschikt voor |
|---|---|---|---|---|
| Bruiloft | Eucalyptus | Vouwkaart | Salie, zacht papier, sierlijke letters | verloving, jubileum |
|  | Gatsby | Gordijn | Zwart en goud, art deco, strakke hoofdletters | jubileum, zakelijk evenement |
|  | Rozentuin | Envelop met zegel | Zacht roze, bloemen, sierlijk handschrift | verloving, babyshower |
|  | Lijnenspel | Zachte sluier | Zwart-wit, grote letters, veel witruimte | verloving, zakelijk evenement |
|  | Zuiden | Cadeaulint | Terracotta en oker, zon, linnen | verjaardag, jubileum |
| Verloving | Ja-woord | Cadeaulint | Champagne, monogram, ringen | bruiloft |
|  | Polaroid | Polaroid | Kraftpapier, polaroids, handschrift | verjaardag, jubileum |
|  | Onder de sterren | Sterrenhemel | Middernachtblauw, sterren, maan | bruiloft, jubileum |
|  | Pampas | Zachte sluier | Zand, pampasgras, linnen | bruiloft, babyshower |
|  | Monogram | Schuifpaneel | Marine, strak, genummerd | bruiloft, zakelijk evenement |
| Verjaardag | Confetti | Confetti | Kleurrijk, confetti, groot getal | babyshower, zakelijk evenement |
|  | Neonnacht | Zachte sluier | Donker, neonlicht, gloeiende letters | zakelijk evenement |
|  | Ballonfeest | Ballonnen | Pastel, ballonnen, ronde vormen | babyshower |
|  | Glitter & goud | Gordijn | Zwart en goud, fonkeling, glamour | jubileum, zakelijk evenement |
|  | Tropisch | Vouwkaart | Jungle, palmbladeren, zomer | bruiloft, zakelijk evenement |
| Jubileum | Lauwerkrans | Envelop met zegel | Goud en ivoor, lauwerkrans, klassiek | bruiloft, verjaardag |
|  | Zilveren feest | Gordijn | Zilver, kader, ingetogen chic | bruiloft |
|  | Gouden jaren | Vouwkaart | Ivoor en goud, groot getal, sierlijk | verjaardag |
|  | Door de jaren | Polaroid | Sepia, typemachine, tijdlijn | verjaardag, zakelijk evenement |
|  | Robijn | Cadeaulint | Robijnrood, ringen, cursief | bruiloft, verjaardag |
| Babyshower | Wolkje | Ballonnen | Zachtblauw, wolkjes, rond | verjaardag |
|  | Maanlicht | Sterrenhemel | Nachtblauw of lavendel, maan, sterren | verloving |
|  | Regenboog | Zachte sluier | Aardetinten, regenboog, zacht | verjaardag |
|  | Lentebloesem | Envelop met zegel | Bloesem, kader, handschrift | bruiloft, verloving |
|  | Stipjes | Confetti | Stippen, kleurband, speels | verjaardag |
| Zakelijk evenement | Strak zakelijk | Schuifpaneel | Marine, strak, professioneel | jubileum |
|  | Gala | Gordijn | Zwart en champagne, fluweel, avond | bruiloft, jubileum |
|  | Congres | Schuifpaneel | Blauw, tijdlijn, overzichtelijk | jubileum |
|  | Borrel | Vouwkaart | Koraal, golven, ontspannen | verjaardag |
|  | Mijlpaal | Cadeaulint | Grafiet en goud, groot getal, krachtig | jubileum |

**Keuzes en aannames:**

- Elk ontwerp is gemaakt voor één gelegenheid (die bepaalt de volgorde in de collectie en het standaardvoorbeeld) en is ook te kiezen voor één of twee andere, waar de stijl dat toelaat.
- **Drie kleurvarianten** per ontwerp (de eerste drie ontwerpen hebben er vier). Alle 90 varianten zijn gecontroleerd op contrast: tekst minimaal 4,5:1 op elke achtergrond, ook op het openingsscherm. Dat gebeurt bij het schrijven van een ontwerp en in de tests.
- **Letters**: 23 extra open-source lettertypen (OFL, licenties in `static/fonts/`), op de eigen server. Een ontwerp laadt alleen zijn eigen letters. Sierletters die klein slecht lezen (zoals Italiana en Abril Fatface) worden alleen groot gebruikt; ondertitel, welkomsttekst en cijfers krijgen dan een rustiger letter.
- **Voorbeeldbeelden**: 15 nieuwe eigen, getekende illustraties (sterrenhemel, confetti, palmbladeren, zijde, stadslicht, enzovoort) in dezelfde stijl als de bestaande, zodat de voorbeelden per ontwerp verschillen. Geen stockfoto's.
- **Kaartbeelden** in de collectie tonen bij de nieuwe ontwerpen de geopende uitnodiging (daar zitten kop en versiering), bij de eerste drie het openingsscherm.
- **Zakelijk evenement** heeft een extra, optioneel veld "Aantal jaar", zodat een ontwerp als Mijlpaal bij een bedrijfsjubileum het getal groot kan tonen. Zonder getal tonen zulke ontwerpen de initialen.
- **Website**: de homepage licht drie ontwerpen uit (`HOME_DESIGNS` in `core/content.py`) en noemt het aantal, en de tegels per gelegenheid tonen een nieuw ontwerp voor die gelegenheid; de collectie zet bij een filter eerst de ontwerpen die voor die gelegenheid zijn gemaakt; een ontwerppagina toont drie andere ontwerpen voor dezelfde gelegenheid; bij het samenstellen worden de ontwerpen op de gekozen gelegenheid gefilterd.
- Net als de eerste drie zijn deze ontwerpen **niet vergeleken met de referentiesites of de schermopname** (zie hieronder).

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

Elk van deze drie ontwerpen heeft vier kleurvarianten, werkt voor meerdere gelegenheden en is volledig bruikbaar zonder animatie. Er is ondersteuning voor minder beweging, voor bediening met het toetsenbord, en een vangnet dat de uitnodiging na 7 seconden toont als het script niet laadt.

**Bewuste afwijkingen en onbekende onderdelen.** Omdat de referenties niet te bekijken waren, is niet vast te stellen waar Vierlief ervan afwijkt. Onbekend zijn onder meer: de exacte timing en volgorde van de openingsanimaties in de filmpjes, welke effecten alleen in de montage zitten, de volledige vragenlijst en bestelstappen van Webgency, en het gedrag van muziek en formulieren in de voorbeelden.

**Vervolgstap:** sta de domeinen toe in de netwerkinstellingen van de omgeving en stuur de schermopname opnieuw mee, bijvoorbeeld als bestand in de repository. Dan volgt een vergelijkingsronde per filmpje: tijden, opening, overgangen en interacties. Aanpassingen komen als nieuwe ontwerpversie (`v2`), zodat bestaande uitnodigingen niet veranderen.
