# Overdracht: waar staan we

Stand van 15 oktober 2026. Dit document is bedoeld voor wie het project overneemt, en voor de Claude die daarbij helpt.

## In het kort

Vaylide (eerst de werknaam Vierlief, daarna kort Vaylide) is een werkende eerste versie **in testmodus**. Betalingen zijn gesimuleerd, e-mails worden alleen bewaard en de AI-hulp gebruikt vaste voorbeeldteksten. Op elke pagina staat een testbalk.

Wat er staat:

- **Website**: homepage, collectie, ontwerpdetail met werkend voorbeeld, zo werkt het, prijzen, inspiratie, over ons, veelgestelde vragen, contact, zoeken, privacy en voorwaarden (de juridische teksten zijn nog concept).
- **36 uitnodigingsontwerpen**:
  - zes volledig eigen ontwerpen met elk drie of vier kleurvarianten: Liefde op papier (envelop met lakzegel), Avondgoud (gouden dubbele deur), Puur moment (doorschijnend vel) en de kerstkaarten Winterlicht, Kerstexpress en Kerstcoupé (zie hieronder);
  - 30 Atelier-ontwerpen, **vijf per gelegenheid**, elk met een eigen opening (envelop, vouwkaart, gordijn, cadeaulint, sluier, confetti, ballonnen, sterrenhemel, schuifpaneel, polaroid of een cadeau om uit te pakken) en drie kleurvarianten. Ze delen één opbouw in `designs/_atelier/v1/`. Overzicht en keuzes: `docs/AANPAK.md` onder "Uitbreiding: 30 nieuwe ontwerpen"; zelf een ontwerp toevoegen: `docs/HANDLEIDING.md`.
- **Kerstkaarten** (ronde 7): de gelegenheid Kerst, met of zonder uitnodiging voor het kerstdiner, en het ontwerp **Winterlicht**: een envelop van blindgedrukt papier met een lakzegel (na een tik glanst het reliëf goud en gaat de envelop open), een getekend kerstraam met twinkelende lichtjes en sneeuw, de datum op kraskaartjes van goudfolie, een gouden programma, een afteller naar kerst en in het voorbeeld "Stille nacht" als speeldoosje. Op de homepage en bij Inspiratie staat een brede tegel "Kerst". Keuzes en wat er uit de schermopname van de eigenaar komt: `docs/AANPAK.md` onder "Ronde 7: kerstkaarten"; beheren en aanpassen: `docs/HANDLEIDING.md` onder "Kerstkaarten en Winterlicht".
  Daarna kwamen er twee kerstkaarten met een filmpje bij: **Kerstexpress** (een kerstreis met de trein, het filmpje is nog een concept) en **Kerstcoupé** (ronde 7d): het filmpje dat de eigenaar op 15 oktober stuurde, van een treincoupé waarin de fluwelen gordijnen opengaan voor een besneeuwd bergdorp. Daarna schrijft de groet zich op het raam, met de naam van de klant eronder. Keuzes: `docs/AANPAK.md` onder "Ronde 7d: Kerstcoupé"; aanpassen en het filmpje vervangen: `docs/HANDLEIDING.md` onder "Kerstcoupé" en `tools/kerstcoupe/README.md`.
- **Effecten op alle 36 uitnodigingen**: zwevende sfeer (bloemblaadjes, goudstof, een sterrenhemel, ballonnen, neon en meer), een knal op het moment dat de uitnodiging opengaat (bij de cadeau-opening springt het deksel eraf en vliegen er cadeautjes uit), een feestje als een gast zich aanmeldt, namen die verschijnen alsof ze geschreven worden of met een gouden glans, en onthullingen bij het scrollen. Elk ontwerp heeft een eigen combinatie. Met de knop **Beweging** zet een gast alles stil. Overzicht en keuzes: `docs/AANPAK.md` onder "Ronde 5"; zelf kiezen of aanpassen: `docs/HANDLEIDING.md` onder "Effecten".
- **Samenstellen in stappen**: gelegenheid, ontwerp, gegevens, programma, aanmelden, foto's, stijl, voorbeeld en bestellen. Voortgang wordt per stap bewaard, ook zonder account.
- **Bestellen en betalen**: testbetaling (of Mollie, zodra er een sleutel is). Publiceren gebeurt alleen na een serverzijdige betalingsbevestiging, via een takenwachtrij met herhalingen.
- **Gasten**: aanmelden zonder account, eigen antwoord later wijzigen, agenda, route, delen.
- **Mijn Vaylide**: uitnodigingen, aanmeldingen, gastenlijst exporteren, wijzigen en opnieuw publiceren, extra wensen.
- **Beheer**: aanvragen, bestellingen, uitnodigingen, klanten, verwerking, ontwerpen, prijzen, instellingen en contactberichten.

Gedane rondes:

1. Bouw van het hele platform.
2. Strakker en sneller: rustiger vormgeving, minder tekst, snellere pagina's.
3. Vormgeving volgens de voorbeeldfoto van de eigenaar: goud, crème en bosgroen, een hartlogo (in ronde 6 vervangen) en de pagina's Inspiratie, Over ons en Zoeken. De keuzes en afwijkingen staan in `docs/AANPAK.md` onder "Nieuwe vormgeving".
4. 30 nieuwe ontwerpen, vijf per gelegenheid, met eigen voorbeeldbeelden en kaartbeelden. De homepage licht drie ontwerpen uit, de collectie zet per gelegenheid de passende ontwerpen vooraan, en zakelijke evenementen kunnen een aantal jaren opgeven.
5. Effecten en beweging op alle 33 ontwerpen (zie hierboven), een nieuwe cadeau-opening (Glitter & goud, Regenboog en Stipjes), kaarten op de website die meebewegen en glanzen, nieuwe kaartbeelden, en het lakzegel van Liefde op papier met goed leesbare initialen.
6. Nieuw merk: **Vaylide** (eerst kort Vaylide), met het logo van de eigenaar zoals aangeleverd (de V, VAYLIDE en de regel eronder) in de kop en voet, bij het samenstellen, in het beheer, in de e-mails, op de deelafbeelding en als icoon op het beginscherm; de V uit het logo als tabblad-icoon. Overal waar mensen de naam zien, staat Vaylide. Keuzes: `docs/AANPAK.md` onder "Ronde 6: Vaylide"; het logo opnieuw maken of vervangen: `tools/logo/README.md`.
7. Kerstkaarten: de gelegenheid Kerst (ook alleen een kerstgroet, zonder datum of locatie), het ontwerp Winterlicht in vier kleuren met eigen getekende beelden, het effect sneeuw, de kersttegel op de website, en "kerstkaart" in plaats van "uitnodiging" in de e-mails en op de bestelstatus. Daarna Kerstexpress (ronde 7b en 7c) en Kerstcoupé (ronde 7d, het filmpje van de coupé).

Wat getest is en hoe: `docs/CONTROLES.md`. Kort, na ronde 7d (Kerstcoupé): 180 tests (op SQLite), en voor Kerstcoupé de browsercontrole op 24 pagina's (vier schermformaten, het voorbeeld en vijf testuitnodigingen, 8 gedragscontroles), 8 controles van de effecten, toegankelijkheid in alle drie de kleuren en het contrast van de tekst op het raam. De andere ontwerpen zijn in ronde 7d niet opnieuw in de browser gecontroleerd, op een steekproef na. Na ronde 7: 165 tests (op SQLite), een browsercontrole op 840 pagina's (vier schermformaten, alle 34 ontwerpen, 272 gedragscontroles; Winterlicht daarna opnieuw op de definitieve stand), 272 controles van de effecten en een meting van de belasting (alle 34 ontwerpen), toegankelijkheid en contrast van alle 34 ontwerpen in alle 106 kleurvarianten, het contrast van de tekst op de tekening van het kerstraam, en axe op de gewijzigde websitepagina's. Na ronde 6: 139 tests (op SQLite; op PostgreSQL 16 in ronde 5), een browsercontrole op 816 pagina's (vier schermformaten, alle 33 ontwerpen, 264 gedragscontroles), toegankelijkheid van de website en een lokale nabootsing van de Render-instellingen met PostgreSQL. Uit ronde 5 (in ronde 6 veranderden aan de uitnodigingen alleen de naam onderaan en het tabblad-icoon): 264 controles van de effecten (ook stilzetten en 'minder beweging'), een meting van de belasting op een vertraagde processor, en toegankelijkheid en contrast van alle ontwerpen in alle kleuren.

Voorvertoning (statisch, alleen om te kijken): https://claude.ai/artifact/DYkTUBCKzn63jE8Mk9x28M

## Zo ga je verder

1. Haal het project op met `git clone https://github.com/bootsman075-ops/vaylide.nl`, of pak de zip uit (map `vaylide/`). Beide hebben de volledige git-geschiedenis.
2. Open een terminal in die map en start Claude Code (`claude`). Het bestand `CLAUDE.md` in de hoofdmap wordt automatisch gelezen, met de vaste regels van de eigenaar.
3. Geef als eerste opdracht bijvoorbeeld:

   > Lees CLAUDE.md en docs/OVERDRACHT.md. Zet de ontwikkelomgeving op volgens de README, draai de tests en vat in een paar zinnen samen wat de stand is en welke open punten er zijn. Wacht daarna op mijn opdracht.

4. Maak zelf een beheeraccount aan met `python manage.py createsuperuser`. Klanten loggen in met een code; in testmodus staat die code direct op het scherm.

## Eigen repository

Het project staat in een eigen repository, los van andere projecten: **https://github.com/bootsman075-ops/vaylide.nl** (branch `main`). De eigenaar maakte hem aan en koos voor **openbaar**: iedereen kan de code en de documentatie lezen. Er staan geen wachtwoorden of sleutels in (vóór het versturen is de hele geschiedenis daarop doorzocht). Op privé zetten kan altijd via Settings → Change repository visibility.

Een oudere kopie, nog onder de werknaam Vierlief, staat nog in de repository van Vantor Studios: de branch `claude/practical-ride-1m3pgk` bevat drie commits "Vierlief: …" met de map `vierlief/` en een regel in `.vercelignore`, verder niets. Die kopie is **verouderd**: niet gebruiken. Opruimen kan door die branch op GitHub te verwijderen; vanuit de werkomgeving lukte dat niet meer (geen toegang meer tot die repository).

## Open punten

In een logische volgorde. Punt 2 alleen met akkoord van de eigenaar.

1. **Oude kopie in Vantor opruimen**: de branch `claude/practical-ride-1m3pgk` van vantor-studios-website verwijderen (zie hierboven).
2. **Online en livegang**: de site op het eigen domein zetten, eerst als testversie met een wachtwoord (stappenplan in `docs/ONLINE.md`, aanbevolen via GitHub en Render met `render.yaml`; het domein is `vaylide.com`), daarna live met Mollie, SMTP, bedrijfsgegevens en juridisch gecontroleerde privacy en voorwaarden (checklist in `docs/LIVEGANG.md`).
3. **Eigen foto's** (optioneel): de sfeerbeelden op de website en de beelden in de voorbeelduitnodigingen zijn eigen, getekende beelden. Eigen foto's met de juiste rechten kunnen ze vervangen; zie `docs/HANDLEIDING.md` onder "Teksten en beelden van de website".
4. **Referenties vergelijken**: de referentiesites en de schermopname met drie voorbeelden zijn nooit bekeken (geblokkeerd of niet ontvangen); zie `docs/AANPAK.md`. Dat geldt ook voor de 30 nieuwe ontwerpen. Aanpassingen aan ontwerpen komen als nieuwe ontwerpversie. De schermopname voor de kerstkaarten (ronde 7) is wel bekeken, als losse beelden.
5. **Collectie kiezen** (optioneel): welke drie ontwerpen de homepage uitlicht (`HOME_DESIGNS` in `core/content.py`), en eventueel de volgorde of zichtbaarheid per ontwerp in Beheer → Ontwerpen.
6. **Testen op echte apparaten**: iPhone (Safari), Android, Firefox en met schermlezers (VoiceOver, TalkBack). Tot nu toe is alleen Chromium gebruikt. Let daarbij vooral op de effecten: soepelheid op een ouder Android-toestel en de weergave in Safari.
7. **Docker**: de image is getest in ronde 2, niet opnieuw na de nieuwe vormgeving en de nieuwe ontwerpen.
8. **Wens voor later**: de teksten van de website beheerbaar maken in Beheer (nu in `core/content.py`).
9. **Kerstexpress: het treinfilmpje** (concept ingevoegd, ronde 7c): de opening speelt `designs/kerstexpress/v1/img/kerstexpress.webm` (mp4 als terugval), zonder geluid. Het concept is gemaakt uit stilstaande beelden met camerabewegingen; de trein beweegt niet echt. Een echte versie komt uit een videotool met grote beelden (minstens 1920 pixels breed), volgens `tools/kerstexpress/draaiboek.md`: de scènes zijn daar beschreven, en de staande beelden met de Engelse prompts staan in de zip die de eigenaar kreeg. Nog open: het bestand vervangen als er een betere versie is (zelfde bestandsnamen), het filmpje controleren op een echte telefoon, en spoelen op de productieserver controleren. **Rechten**: de beelden lijken met AI gemaakt; de eigenaar bevestigt zelf dat ze op de website mogen.
10. **Kerstkaarten beoordelen** (eigenaar): bekijk Winterlicht in alle vier kleuren (ook als voorbeeld op de website) en beslis over:
   - de teksten ("Warme kerstgroeten van", "Een kerstgroet voor jou", "Schuif je aan?");
   - of de kersttegel het hele jaar op de homepage staat of alleen in het najaar (weghalen: de zin bij `kerst` in `OCCASION_TILE_NOTES`, `core/content.py`);
   - de prijs van een kerstkaart (nu dezelfde pakketten als een uitnodiging);
   - of klanten ook het speeldoosje met "Stille nacht" mogen kiezen (nu alleen in het voorbeeld; eigen muziek kan wel).

   Keuzes en afwijkingen van de schermopname: `docs/AANPAK.md` onder "Ronde 7: kerstkaarten".
11. **Winterlicht op echte telefoons**: vooral Safari op een iPhone (de gouden golf gebruikt een nieuwere CSS-techniek; krassen met de vinger) en een ouder Android-toestel. Het voorbeeld is drie tot vier keer zo zwaar als de andere ontwerpen (zie `docs/CONTROLES.md`). Als het te traag is, kunnen de beelden kleiner voor telefoons (in een `v2`).
12. **Teksten in het bestelproces** (optioneel): de e-mails en de bestelstatus spreken van een kerstkaart; het samenstellen en Mijn Vaylide zeggen nog "uitnodiging".
13. **Kerstcoupé beoordelen** (eigenaar, ronde 7d): bekijk `/voorbeeld/kerstcoupe/` in de drie kleuren (rood fluweel, sneeuwnacht, mahonie en dennengroen) en op een echte telefoon, en beslis over:
   - de teksten ("Een kerstgroet voor jou", "Open de gordijnen", "Gereserveerd voor jou", "Dinerkaart", "Reserveer je plaats", "Uitzicht onderweg");
   - de lengte van de opening (ruim vier seconden, omdat het filmpje zo lang duurt);
   - of er later een scherpere versie van het filmpje komt (nu 720 × 1280; op grote schermen iets zacht). Vervangen: `tools/kerstcoupe/README.md`.

   **Rechten**: het filmpje lijkt met AI gemaakt; de eigenaar bevestigt zelf dat het op de website mag.
14. **Kerstexpress zonder JavaScript** (gevonden in ronde 7d, niet aangepast): zonder JavaScript blijft bij Kerstexpress het openingsscherm boven de kaart staan (`.kx-cover { display: block; }` in `designs/kerstexpress/v1/style.css` geldt ook zonder script). De inhoud staat eronder en is bereikbaar. Oplossing: dezelfde regel alleen met `.js` ervoor, zoals bij Kerstcoupé.
15. **Meer kerstontwerpen** (optioneel): voor Kerst zijn er nu drie ontwerpen (Winterlicht, Kerstexpress en Kerstcoupé), voor de andere gelegenheden vijf of meer.
16. **Technische namen** (optioneel, liefst vóór de livegang): de instellingen heten nog `VIERLIEF_…`, net als de cookie-, sessie- en opslagnamen, de cachetabel, het databasebestand (`data/vierlief.sqlite3`), het stijlbestand `static/css/vierlief.css` en de testaccounts (`controle@vierlief.test`). Bezoekers zien die niet. Omzetten naar `VAYLIDE_…` kan in één keer, maar dan moeten ook `.env`, de documentatie en de hosting mee, en vervallen bestaande sessies en keuzes van gasten.

## Goed om te weten

- **Heb je al een eigen ontwikkeldatabase** van een eerder pakket? Draai dan eenmalig `python manage.py sync_designs --update-manifest`, zodat de ontwerpen hun effecten krijgen. Bij een nieuwe database gebeurt dit vanzelf bij `migrate`.
- In het pakket zitten geen geheimen, geen database en geen uploads. Maak `.env` aan vanuit `.env.example`. De database (SQLite) en uploads komen in `data/`.
- Prijzen staan op "Voorlopige prijzen" (Essentieel € 39, Compleet € 69) en zijn aan te passen in Beheer.
- De voorbeelduitnodigingen gebruiken fictieve namen en locaties en zijn als voorbeeld gemarkeerd.
- De lettertypen staan op de eigen server (open source, OFL); er gaan geen verzoeken naar Google Fonts.
