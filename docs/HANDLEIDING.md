# Handleiding: beheren en ontwerpen toevoegen

Deze handleiding is voor de eigenaar van Vierlief. De beheeromgeving werkt op computer en telefoon. Op een telefoon worden tabellen kaarten en schuift het menu horizontaal.

## Inloggen

- Ga naar `/beheer/` en log in met je beheeraccount (e-mail en wachtwoord). Het eerste account maak je bij de installatie met `python manage.py createsuperuser`. Een extra beheerder voeg je toe met hetzelfde commando of via het noodbeheer (`/systeembeheer/`, of het pad uit `VIERLIEF_DJANGO_ADMIN_PATH`).
- Beheerders kunnen niet inloggen via de klantinlog met een code, en klanten niet via de beheerinlog.

## Het overzicht

**Overzicht** toont wat aandacht nodig heeft: nieuwe aanvragen, bestellingen met een probleem, mislukte verwerking en nieuwe contactberichten. De tellers in het menu tonen hetzelfde. Staat alles op nul, dan lopen de standaardbestellingen zonder jou.

## Extra wensen (Aanvragen)

Een klant vraagt een wens aan via **Extra wensen of hulp nodig?**, bij het samenstellen of in *Mijn Vierlief*. De aanvraag is gekoppeld aan de klant en, als gekozen, aan de uitnodiging. Een voorbeeldbestand kan worden meegestuurd (PDF, JPG, PNG of WebP, max. 10 MB).

1. **Ontvangen.** De klant krijgt automatisch alleen een ontvangstbevestiging: geen prijs, geen toezegging.
2. Je ziet een **interne inschatting**: een samenvatting, of de wens binnen de standaardmogelijkheden lijkt te passen, een voorgestelde aanpak en open vragen. Zonder AI-sleutel komt deze uit een eenvoudige vaste testregel en is hij zo gemarkeerd. De klant ziet deze inschatting nooit. Met **Opnieuw laten beoordelen** laat je hem opnieuw maken.
3. Reageer met een **bericht** aan de klant, of met een **interne notitie** die alleen het team ziet. Zet de status op **In behandeling**.
4. Stuur een **voorstel** met een omschrijving en eventueel een prijs. Status: *Voorstel klaar*. De klant krijgt een e-mail.
5. De klant gaat **akkoord** in *Mijn Vierlief*:
   - met een prijs: er wordt een bestelling aangemaakt en de status wordt *Akkoord / wacht op betaling*. Na een bevestigde betaling wordt dit automatisch *In uitvoering*.
   - zonder prijs: meteen *In uitvoering*.
6. Voer het werk uit (zie *Uitnodigingen*) en zet de status op **Afgerond**, eventueel met een notitie voor de klant.

AI doet nooit toezeggingen over maatwerk, prijs, haalbaarheid of opleverdatum. Dat doe jij, in het voorstel.

## Bestellingen

- Statussen: *Wacht op betaling*, *Betaald*, *Betaling mislukt*, *Verlopen*, *Geannuleerd* en *Terugbetaald*. Daarnaast is er de verwerkingsstatus: *Nog niet gestart*, *Wordt verwerkt*, *Afgerond* of *Aandacht nodig*.
- Een bestelling wordt alleen *Betaald* na een controle bij de betaalprovider aan de serverzijde. Een klant die op de bedankpagina komt, telt niet als betaling.
- **Aandacht nodig** betekent bijvoorbeeld dat het ontvangen bedrag afwijkt van de bestelling, of dat een oudere betaling alsnog binnenkwam terwijl de uitnodiging al betaald was. Er is dan niets automatisch gepubliceerd. Je krijgt een e-mail. Handel het af (bijvoorbeeld terugbetalen via het Mollie-dashboard) en klik **Handmatig afgehandeld**.
- **Verwerking opnieuw starten** gebruik je als publiceren of e-mailen bleef mislukken. Dit is veilig: er ontstaan geen dubbele publicaties of e-mails.
- **Status handmatig wijzigen** is voor uitzonderingen, bijvoorbeeld een terugbetaling die je in Mollie hebt gedaan. Iedere handmatige wijziging komt met jouw naam in het logboek van de bestelling. Terugbetalen zelf gebeurt in het dashboard van de betaalprovider; de app voert geen terugbetalingen uit.

## Uitnodigingen

Op de pagina van een uitnodiging:

- **Live bekijken** en **Concept bekijken**.
- **Inhoud aanpassen** via dezelfde stappen als de klant (Gegevens, Programma, Aanmelden, Foto's, Stijl, Ontwerp). Jouw wijzigingen worden bewaard als aanpassing door het team. Heeft de klant intussen iets gewijzigd, dan krijg je een melding en wordt er niets overschreven.
- **Concept publiceren**: zet het concept live op dezelfde link, met een notitie bij de versie.
- **Beheer-aanpassingen**, los van de klantinhoud en in iedere versie bewaard:
  - een kopregel die de tekst van de klant vervangt;
  - een mededeling bovenaan de uitnodiging (bijvoorbeeld "Let op: nieuwe locatie");
  - onderdelen verbergen;
  - een afwijkende accentkleur;
  - **velden vergrendelen**, zodat de klant jouw handmatige aanpassing niet per ongeluk overschrijft;
  - een interne notitie.
- **Versies**: elke publicatie is een versie, met wie, wanneer en welke ontwerpversie. **Herstellen** zet een oude versie terug in het concept; het huidige concept wordt eerst zelf als versie bewaard, dus er gaat niets verloren. Met **direct publiceren** gaat de herstelde versie meteen live.
- **Klant tijdelijk laten wachten** (vergrendelen): de klant kan tijdelijk niets wijzigen, bijvoorbeeld tijdens maatwerk. De klant ziet de reden die je invult.
- **Verlengen**: extra maanden online.
- **Offline halen / Weer online zetten**.
- **Concept overzetten naar** een nieuwere ontwerpversie. Dit gebeurt in het concept en gaat pas live na publiceren.
- **Aanmeldingen exporteren** (CSV voor Excel) en **Uitnodiging en gegevens verwijderen** (typ `verwijderen` ter bevestiging; dit verwijdert ook foto's en aanmeldingen).

## Klanten

Overzicht van klanten met hun uitnodigingen, bestellingen en aanvragen. **Anonimiseren** verwijdert de naam en het e-mailadres van een klant, en daarnaast hun uitnodigingen (met foto's, versies en aanmeldingen), aanvragen, bewaarde e-mails, inlogcodes en contactberichten. Bestellingen blijven bewaard voor de administratie, maar zonder namen of omschrijvingen. Klanten kunnen dit ook zelf doen in *Mijn Vierlief → Gegevens*.

## Verwerking

- **Taken**: publiceren, e-mails en de inschatting van aanvragen. Mislukte taken worden automatisch opnieuw geprobeerd (na 1 min, 5 min, 15 min, 1 uur, 3 uur en 12 uur). Daarna krijg je een e-mail en staat de taak op *Mislukt, handmatige actie nodig*. Met **Nu opnieuw proberen** of **Alle mislukte taken opnieuw proberen** start je ze zelf.
- **E-mails**: alle e-mails met status en inhoud. In testmodus worden ze alleen bewaard, niet verstuurd.
- **Testmodus: storing simuleren**: laat de volgende publicatie of e-mail bewust mislukken, om te zien hoe het systeem herstelt.

## Ontwerpen, prijzen en instellingen

- **Ontwerpen**: naam, teksten, gelegenheden, volgorde, zichtbaar of verborgen, en welke versie nieuwe klanten krijgen. Een verborgen ontwerp blijft werken voor bestaande uitnodigingen.
- **Prijzen**: pakketten (prijs, inbegrepen functies, maximaal aantal foto's, maanden online, punten op de prijzenpagina) en losse opties. Een prijswijziging geldt alleen voor nieuwe bestellingen; bestaande bestellingen houden hun eigen regels en bedragen. Gebruikt een klant een functie die niet in het pakket zit, dan telt de bestelling automatisch de goedkoopste passende optie mee.
- **Instellingen**:
  - "Voorlopige prijzen" tonen (aan laten tot je prijzen definitief zijn);
  - een tekst over je reactietijd (alleen invullen als je die belofte echt waarmaakt);
  - het standaard maximum aantal personen per aanmelding;
  - de bewaartermijnen;
  - een overzicht van welke koppelingen actief zijn en welke in testmodus staan.
- **Contact**: berichten uit het contactformulier.

## Teksten en beelden van de website

Deze staan (nog) niet in Beheer, maar in de code. Na een wijziging: opnieuw publiceren op de server (`collectstatic` voor beelden).

- **Teksten** van de homepage, "Zo werkt het", Inspiratie, Over ons en de veelgestelde vragen: `core/content.py`. De paginaopbouw staat in `core/templates/core/`.
- **Beelden**: `static/img/site/`. Vervang een beeld door een eigen foto met dezelfde bestandsnaam en ongeveer dezelfde verhouding (bijvoorbeeld `hero.webp` 1800 × 1100 en `hero-900.webp` 900 × 760 voor telefoons). Gebruik alleen foto's waarvan je de rechten hebt. Hoe de huidige beelden gemaakt zijn en hoe je ze opnieuw maakt: `tools/merkbeelden/README.md`.
- **Tegels per gelegenheid en de kaart op de homepage** zijn schermafbeeldingen van de voorbeelduitnodigingen. Na een nieuw ontwerp of een nieuwe kleur kun je ze opnieuw maken met `tools/merkbeelden/voorbeelden.cjs`.
- **Uitgelichte ontwerpen op de homepage**: de drie codes in `HOME_DESIGNS` in `core/content.py`. De collectie toont altijd alle zichtbare ontwerpen; bij een filter op gelegenheid staan de ontwerpen die voor die gelegenheid zijn gemaakt (de eerste in hun lijst `occasions`) vooraan.
- **Kaartbeelden van de ontwerpen** (`static/img/designs/<code>.webp`, 800 × 1000) maak je opnieuw met `node e2e/make_design_images.cjs` (uitleg bovenin dat bestand).
- **Voorbeeldbeelden in de uitnodigingen** zijn eigen, getekende illustraties uit `tools/generate_demo_images.py` (map `static/img/demo/`). Welke beelden een ontwerp in zijn voorbeeld gebruikt, staat in `DESIGN_IMAGES` in `invitations/demo.py`.

## Een nieuw ontwerp toevoegen

Een ontwerp is een map met drie bestanden. Er is geen database-werk nodig. Er zijn twee manieren:

- **Atelier-ontwerp (snelst, aanbevolen)**: je kiest uit vaste bouwstenen (opening, kop, secties, versiering) en geeft letters en kleuren op. Zo zijn de 30 ontwerpen vanaf Eucalyptus gemaakt. Zie hieronder.
- **Volledig eigen ontwerp**: eigen HTML en CSS, zoals Liefde op papier, Avondgoud en Puur moment. Zie "Volledig eigen ontwerp".

### Atelier-ontwerp

De gedeelde opbouw staat in `designs/_atelier/v1/`: `base.html` (volgorde van de onderdelen), `atelier.css` (alle opmaak), en de mappen `openings/`, `heroes/`, `ornaments/` en `parts/`. Een Atelier-ontwerp heeft in `manifest.json` een blok `atelier` met per onderdeel één keuze:

| Onderdeel | Keuzes |
|---|---|
| `opening` | `envelop`, `vouwkaart`, `gordijn`, `lint` (cadeaulint), `sluier`, `confetti`, `ballonnen`, `sterren` (sterrenhemel), `schuif` (schuifpaneel), `polaroid` |
| `hero` (kop) | `klassiek`, `gesplitst` (tekst en foto naast elkaar), `kader`, `redactioneel`, `monogram` (initialen groot), `polaroid`, `volbeeld` (foto over de hele breedte), `band` (gekleurd vlak), `getal` (leeftijd of aantal jaren groot) |
| `sections` | `lijnen`, `kaarten`, `genummerd`, `tweekolom`, `midden`, `tijdlijn` |
| `heading` (koppen) | `lijn`, `ornament`, `script`, `kapitaal`, `groot` |
| `names` | `display`, `script`, `kapitaal`, `cursief`, `stapel` |
| `date` | `blok`, `lijn`, `cirkel`, `cijfers`, `kalender` |
| `photo` | `boog`, `cirkel`, `rond`, `recht`, `polaroid` |
| `texture` | `geen`, `papier`, `stippen`, `linnen`, `ruit`, `sterren`, `confetti` |
| `ornament` | `geen`, `eucalyptus`, `botanisch`, `bloemen`, `pampas`, `palm`, `lauwerkrans`, `deco`, `geometrisch`, `sterren`, `confetti`, `ballonnen`, `harten`, `zon`, `golven`, `wolken`, `regenboog`, `ringen`, `lijnen`, `fonkel`, `stippen` |

Een onbekende keuze geeft bij het inlezen een duidelijke melding. De kop `getal` toont bij een verjaardag de leeftijd en bij een jubileum of zakelijk evenement het aantal jaren (als de klant dat invult); anders de initialen.

Zo voeg je er een toe:

1. **Beschrijf het ontwerp** in `tools/atelier/specs.py`: kopieer een bestaand ontwerp dat erop lijkt en pas aan:
   - `slug`, `name`, `sort_order`, `tagline`, `description`, `style_notes`;
   - `occasions`: de eerste is de gelegenheid waarvoor het ontwerp gemaakt is (bepaalt de volgorde in de collectie en het standaardvoorbeeld);
   - `atelier`: de keuzes uit de tabel;
   - `fonts`: letters per rol (`display`, `body`, `script`, `ui`, en optioneel `text` voor ondertitel en welkomsttekst en `number` voor cijfers). Kies uit de lijst `FONTS` in `tools/atelier/ontwerpen.py`; de bestanden staan in `static/fonts/` (open source, licentie ernaast);
   - `palettes`: drie kleurvarianten met onder meer `bg`, `surface`, `ink`, `muted`, `accent`, `accent_ink`, `line`, `c2`, `c3` en de kleuren van de opening (`cover_bg`, `cover_ink`, …);
   - eventueel `tokens` en `css` voor eigen accenten.
2. **Schrijf de bestanden**: `.venv/bin/python tools/atelier/ontwerpen.py mijn-ontwerp`. Het script controleert eerst het contrast van alle tekstkleuren (minimaal 4,5:1) en stopt met een melding als een kleur te licht is. Bestaande mappen worden niet overschreven.
3. **Inlezen en bekijken**: `python manage.py sync_designs` en open `/voorbeeld/mijn-ontwerp/` (met `?gelegenheid=…&kleur=…`).
4. **Voorbeeldbeelden en kaartbeeld** (optioneel): voeg het ontwerp toe aan `DESIGN_IMAGES` in `invitations/demo.py` en maak het kaartbeeld met `node e2e/make_design_images.cjs http://127.0.0.1:8000 static/img/designs mijn-ontwerp`.
5. **Testen**: `python manage.py test tests`. De tests controleren onder meer de keuzes, het contrast van elke kleurvariant, de weergave per gelegenheid en lange namen. Draai ook de browsercontrole (zie `docs/CONTROLES.md`).

**Let op:** `designs/_atelier/v1/` wordt door alle Atelier-ontwerpen gedeeld. Een wijziging daarin verandert dus ook bestaande uitnodigingen. Maak na de livegang voor zulke wijzigingen een `_atelier/v2` en een nieuwe versie van de ontwerpen die ervan gebruikmaken.

### Volledig eigen ontwerp

```
designs/
  mijn-ontwerp/          ← code van het ontwerp (kleine letters, koppeltekens)
    v1/                  ← versie
      manifest.json      ← naam, gelegenheden, kleurvarianten, onderdelen
      invitation.html    ← de opbouw van de uitnodiging
      style.css          ← de vormgeving
static/img/designs/mijn-ontwerp.webp   ← voorbeeldafbeelding (800×1000), optioneel
```

1. **Kopieer** het bestaande eigen ontwerp dat het meest lijkt op wat je wilt, bijvoorbeeld `designs/puur-moment/v1`, naar `designs/mijn-ontwerp/v1`.
2. **Pas `manifest.json` aan**:
   - `slug`: gelijk aan de mapnaam (`mijn-ontwerp`);
   - `version`: `1`;
   - `name`, `tagline`, `description`, `style_notes`: teksten voor de website;
   - `occasions`: een of meer van `bruiloft`, `verloving`, `verjaardag`, `jubileum`, `babyshower`, `zakelijk`;
   - `palettes`: kleurvarianten, elk met `key`, `name`, `swatch` (drie kleuren voor de website) en `vars` (CSS-variabelen die `style.css` gebruikt);
   - `opening_label`: naam van de opening, bijvoorbeeld "Envelop met lakzegel";
   - `sort_order`: volgorde op de website;
   - `changelog`: wat deze versie is.
3. **Pas `invitation.html` en `style.css` aan.** Houd deze afspraken aan:
   - begin met `{% extends "invitations/base_invitation.html" %}` en vul `{% block cover %}` (de opening) en `{% block content %}` (de inhoud);
   - de openingsknop is een link `<a href="#uitnodiging" data-open>`, zodat de uitnodiging ook zonder JavaScript opent;
   - toon een onderdeel alleen als het gevuld is (`{% if v.show.program %}` enzovoort), zodat lege onderdelen verborgen blijven;
   - gebruik de gedeelde onderdelen uit `invitations/partials/`: `rsvp.html`, `countdown.html`, `calendar_buttons.html`, `share_buttons.html`, `photo.html` en `time_note.html`;
   - geef animaties een rustige variant onder `@media (prefers-reduced-motion: reduce)`;
   - test met lange namen, zonder foto's en op 360 pixels breed.
4. **Voorbeeldafbeelding** (optioneel): `static/img/designs/mijn-ontwerp.webp`. Zonder eigen afbeelding toont de site een neutrale standaardafbeelding.
5. **Inlezen**: `python manage.py sync_designs`. Dit gebeurt ook automatisch bij `migrate`. Is er iets niet in orde, dan krijg je een duidelijke melding, bijvoorbeeld "style.css ontbreekt" of "onbekende gelegenheid".
6. **Bekijken**: `/voorbeeld/mijn-ontwerp/` (met `?gelegenheid=verjaardag&kleur=<key>` om te wisselen). Het ontwerp gebruikt automatisch de voorbeeldgegevens.
7. **Publiceren**: controleer het in **Beheer → Ontwerpen** (zichtbaar, volgorde) en zet het live met een nieuwe deployment.
8. **Testen**: `python manage.py test tests`. Het is ook verstandig de browsercontrole te draaien (zie `docs/CONTROLES.md`).

## Een bestaand ontwerp aanpassen

**Wijzig nooit een versie die al in gebruik is.** Bestaande uitnodigingen zouden dan onverwacht veranderen.

1. Kopieer `designs/liefde-op-papier/v1` naar `designs/liefde-op-papier/v2`.
2. Zet in het nieuwe manifest `"version": 2` en beschrijf de wijziging in `changelog`.
3. Pas `v2` aan en draai `python manage.py sync_designs`.
4. Kies in **Beheer → Ontwerpen** de versie voor nieuwe klanten (`v2`). Bestaande uitnodigingen blijven op `v1`.
5. Wil je een bestaande uitnodiging overzetten, doe dat dan per uitnodiging met **Concept overzetten naar v2**. Bekijk het concept en publiceer.

Alleen tijdens het ontwikkelen, als er nog geen echte uitnodigingen op een versie staan, kun je het manifest van een bestaande versie bijwerken met `python manage.py sync_designs --update-manifest`.

## Veelvoorkomende situaties

- **"Ik heb betaald maar zie niets."** De statuspagina ververst vanzelf. Controleer in **Bestellingen** de betaalstatus en de verwerking. Staat de betaling op *Betaald* maar de verwerking niet op *Afgerond*, gebruik dan **Verwerking opnieuw starten**.
- **De e-mail met de link is niet aangekomen.** De link staat altijd op de statuspagina en in *Mijn Vierlief*, ook als de e-mail mislukt. In **Verwerking → E-mails** zie je of de e-mail is verstuurd.
- **Een klant is de link kwijt.** De klant logt in met een code per e-mail en vindt alles in *Mijn Vierlief*.
- **Een gast wil een antwoord wijzigen.** Na het versturen krijgt de gast een persoonlijke link om het eigen antwoord te wijzigen of te verwijderen. Op hetzelfde apparaat herkent de uitnodiging het antwoord ook. De klant kan een antwoord verwijderen in *Mijn Vierlief → Aanmeldingen*.
- **De dag is voorbij.** De uitnodiging blijft leesbaar tot het einde van de beschikbaarheid, met de melding dat de dag heeft plaatsgevonden. Aanmelden kan dan niet meer.
