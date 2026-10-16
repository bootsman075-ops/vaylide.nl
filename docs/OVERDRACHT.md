# Overdracht: waar staan we

Stand van 16 oktober 2026. Dit document is bedoeld voor wie het project overneemt, en voor de Claude die daarbij helpt.

## In het kort

Vaylide (eerst de werknaam Vierlief, daarna kort Vaylide) is een werkende eerste versie **in testmodus**. Betalingen zijn gesimuleerd, e-mails worden alleen bewaard en de AI-hulp gebruikt vaste voorbeeldteksten. Op elke pagina staat een testbalk.

Wat er staat:

- **Website**: homepage, collectie, ontwerpdetail met werkend voorbeeld, zo werkt het, prijzen, inspiratie, over ons, veelgestelde vragen, contact, zoeken, privacy en voorwaarden (de juridische teksten zijn nog concept).
- **35 uitnodigingsontwerpen**:
  - drie volledig eigen ontwerpen met elk vier kleurvarianten: Liefde op papier (envelop met lakzegel), Avondgoud (gouden dubbele deur) en Puur moment (doorschijnend vel);
  - 30 Atelier-ontwerpen, **vijf per gelegenheid**, elk met een eigen opening (envelop, vouwkaart, gordijn, cadeaulint, sluier, confetti, ballonnen, sterrenhemel, schuifpaneel, polaroid of een cadeau om uit te pakken) en drie kleurvarianten. Ze delen één opbouw in `designs/_atelier/v1/`. Overzicht en keuzes: `docs/AANPAK.md` onder "Uitbreiding: 30 nieuwe ontwerpen"; zelf een ontwerp toevoegen: `docs/HANDLEIDING.md`.
- **Rozenzegel** (ronde 7): een bordeaux envelop met rozen en een lakzegel uit een filmpje van de eigenaar. Na een tik gloeit het zegel goud en gaat de envelop langzaam open (de film, vloeiend vertraagd); de tekst verschijnt op de crème kaart die tevoorschijn komt. Eén kleurvariant, voor bruiloft, verloving en jubileum. Zie `docs/AANPAK.md` onder "Ronde 7".
- **Rozenboog** (ronde 8): een wand van crème rozen uit een tweede filmpje van de eigenaar. Na een tik gaan de rozen langzaam uiteen (de film, vloeiend vertraagd) en kijk je door een rozenboog over een terras met kaarsen naar de zee bij zonsondergang. De namen staan in de avondlucht, datum, tijd en plek op een crème kaart op het terras. Eén kleurvariant, voor bruiloft, verloving en jubileum. Zie `docs/AANPAK.md` onder "Ronde 8".
- **Effecten op alle 35 uitnodigingen**: zwevende sfeer (bloemblaadjes, goudstof, een sterrenhemel, ballonnen, neon en meer), een knal op het moment dat de uitnodiging opengaat (bij de cadeau-opening springt het deksel eraf en vliegen er cadeautjes uit), een feestje als een gast zich aanmeldt, namen die verschijnen alsof ze geschreven worden of met een gouden glans, en onthullingen bij het scrollen. Elk ontwerp heeft een eigen combinatie. Met de knop **Beweging** zet een gast alles stil. Overzicht en keuzes: `docs/AANPAK.md` onder "Ronde 5"; zelf kiezen of aanpassen: `docs/HANDLEIDING.md` onder "Effecten".
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
7. **Rozenzegel**, het eerste ontwerp met een film als opening: het filmpje van de eigenaar vloeiend vertraagd (het begin van het openen ongeveer drie keer langzamer, met berekende tussenbeelden), de kop als laatste beeld van de film met de tekst op de kaart, en een herstel voor alle ontwerpen: de link "Direct naar de uitnodiging" op het openingsscherm liet de uitnodiging geblokkeerd achter. Het vertragen kan opnieuw met `tools/filmopening/`.
8. **Rozenboog**, het tweede ontwerp met een film als opening: rozen die uiteengaan naar een rozenboog aan zee, twee tot drie keer langzamer en vloeiend (met een nieuwe stap in het script die het haperende tempo van een omgezet filmpje rechttrekt), de namen in de avondlucht en een kaart op het terras, en als kaartbeeld in de collectie de kop na de film.

Wat getest is en hoe: `docs/CONTROLES.md`. Kort, na ronde 7: 150 tests; een browsercontrole op 836 pagina's (vier schermformaten, alle 34 ontwerpen, 272 gedragscontroles); 272 controles van de effecten; toegankelijkheid en contrast van alle ontwerpen in alle kleuren (0 contrastproblemen; axe-core 4.14 meldt bij 31 bestaande ontwerpen dat de naam van de openknop niet de tekst op de knop bevat, zie het open punt hieronder); en voor Rozenzegel het afspelen van de film, het contrast op de echte beeldpunten en Lighthouse. Eerder, na ronde 6: 139 tests (op SQLite; op PostgreSQL 16 in ronde 5), een browsercontrole op 816 pagina's (vier schermformaten, alle 33 ontwerpen, 264 gedragscontroles), toegankelijkheid van de website en een lokale nabootsing van de Render-instellingen met PostgreSQL. Uit ronde 5 (in ronde 6 veranderden aan de uitnodigingen alleen de naam onderaan en het tabblad-icoon): 264 controles van de effecten (ook stilzetten en 'minder beweging'), een meting van de belasting op een vertraagde processor, en toegankelijkheid en contrast van alle ontwerpen in alle kleuren.

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
4. **Referenties vergelijken**: de referentiesites en de schermopname met drie voorbeelden zijn nooit bekeken (geblokkeerd of niet ontvangen); zie `docs/AANPAK.md`. Dat geldt ook voor de 30 nieuwe ontwerpen. Aanpassingen aan ontwerpen komen als nieuwe ontwerpversie.
5. **Collectie kiezen** (optioneel): welke drie ontwerpen de homepage uitlicht (`HOME_DESIGNS` in `core/content.py`), en eventueel de volgorde of zichtbaarheid per ontwerp in Beheer → Ontwerpen.
6. **Testen op echte apparaten**: iPhone (Safari), Android, Firefox en met schermlezers (VoiceOver, TalkBack). Tot nu toe is alleen Chromium gebruikt. Bij Rozenzegel en Rozenboog vooral: speelt de film (MP4) na een tik vloeiend af in Safari op de iPhone en in Chrome, en sluit het laatste beeld naadloos aan op de kop? De Chromium van de werkomgeving speelt geen MP4 af; daar is de film met de WebM-versie getest. Let daarbij vooral op de effecten: soepelheid op een ouder Android-toestel en de weergave in Safari.
7. **Docker**: de image is getest in ronde 2, niet opnieuw na de nieuwe vormgeving en de nieuwe ontwerpen.
8. **Wens voor later**: de teksten van de website beheerbaar maken in Beheer (nu in `core/content.py`).
9. **Technische namen** (optioneel, liefst vóór de livegang): de instellingen heten nog `VIERLIEF_…`, net als de cookie-, sessie- en opslagnamen, de cachetabel, het databasebestand (`data/vierlief.sqlite3`), het stijlbestand `static/css/vierlief.css` en de testaccounts (`controle@vierlief.test`). Bezoekers zien die niet. Omzetten naar `VAYLIDE_…` kan in één keer, maar dan moeten ook `.env`, de documentatie en de hosting mee, en vervallen bestaande sessies en keuzes van gasten.
10. **Label in naam van de openknop** (toegankelijkheid): bij 31 bestaande ontwerpen heet de openknop "Open de uitnodiging" terwijl er tekst op staat (initialen op het zegel, namen op de vouwkaart of de polaroid). axe-core 4.14 meldt dat (WCAG 2.5.3); 4.13 deed dat nog niet. Oplossing: de zichtbare tekst in de naam van de knop opnemen. Zie `docs/CONTROLES.md`, ronde 7.
11. **Rechten op de film van Rozenboog**: de eigenaar stuurde het filmpje via WhatsApp. Of de eigenaar het zelf heeft gemaakt en het op de website mag gebruiken, is nog niet bevestigd. Zet Rozenboog pas live als dat zo is (bij twijfel: Beheer → Ontwerpen, zichtbaarheid uit).
12. **Branches samenvoegen**: Rozenzegel (ronde 7) staat op `claude/loving-dirac-17koe9`, Rozenboog (ronde 8) op `claude/busy-einstein-zlbc1e`, die daarop voortbouwt. Geen van beide is al samengevoegd met `main`. De branches met kerstkaarten (Kerstexpress en verder) bouwen niet op Rozenzegel voort en hebben een eigen filmopening in `invite.js` en `effects.js`; bij samenvoegen botsen die bestanden en de documentatie (rondenummers).

## Goed om te weten

- **Rozenboog: lengte van de opening.** Na de tik duurt de film 8,0 seconden, plus een seconde vervagen; gasten kunnen op **Overslaan** tikken. Aanpassen kan met `T_begin`, `T_later` en `web` in `tools/filmopening/maak_opening.py`, als nieuwe ontwerpversie.
- **Rozenzegel: lengte van de opening.** Na de tik duurt de film 10,3 seconden (de eigenaar vroeg om een langzamere, vloeiende opening); gasten kunnen op **Overslaan** tikken. Sneller of nog langzamer kan met `T_begin` en `T_later` in `tools/filmopening/maak_opening.py`, als nieuwe ontwerpversie.
- **Heb je al een eigen ontwikkeldatabase** van een eerder pakket? Draai dan eenmalig `python manage.py sync_designs --update-manifest`, zodat de ontwerpen hun effecten krijgen. Bij een nieuwe database gebeurt dit vanzelf bij `migrate`.
- In het pakket zitten geen geheimen, geen database en geen uploads. Maak `.env` aan vanuit `.env.example`. De database (SQLite) en uploads komen in `data/`.
- Prijzen staan op "Voorlopige prijzen" (Essentieel € 39, Compleet € 69) en zijn aan te passen in Beheer.
- De voorbeelduitnodigingen gebruiken fictieve namen en locaties en zijn als voorbeeld gemarkeerd.
- De lettertypen staan op de eigen server (open source, OFL); er gaan geen verzoeken naar Google Fonts.
