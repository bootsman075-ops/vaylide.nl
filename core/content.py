"""Vaste teksten van de commerciële website (op één plek aan te passen).

Let op: geen verzonnen reviews, klantenaantallen of beloftes over levertijden.
"""

# Homepage: vier stappen met icoon (icoonnamen uit core/icons.py).
STEPS_SHORT = [
    ("kaarten", "Kies een ontwerp", "Uit onze collectie, voor elke gelegenheid."),
    ("potlood", "Vul je gegevens in", "Tekst, foto's, datum en extra opties."),
    ("oog", "Bekijk en pas aan", "Zie direct een voorbeeld van jouw uitnodiging."),
    ("versturen", "Delen maar", "Na je betaling een eigen link en QR-code."),
]

HERO_CHECKS = ["Snel en eenvoudig", "Stijlvolle ontwerpen", "Automatisch online", "RSVP & gastenlijst"]

# Homepage: drie uitgelichte ontwerpen (codes). Ontbreekt er een, dan vullen de eerste uit de collectie aan.
HOME_DESIGNS = ["liefde-op-papier", "sterrennacht", "confetti"]

# Donker paneel op de homepage: onderdelen die elke uitnodiging kan hebben.
HOME_FEATURES = [
    ("wekker", "Afteller"),
    ("locatie", "Locatie"),
    ("gasten", "Gastenlijst"),
    ("programma", "Programma"),
    ("fotos", "Foto's"),
    ("kleuren", "Kleurkeuze"),
]

# Tegels per gelegenheid; het beeld is een weergave van een echt voorbeeld.
OCCASION_TILES = [
    ("bruiloft", "Bruiloft"),
    ("verloving", "Verloving"),
    ("verjaardag", "Verjaardag"),
    ("jubileum", "Jubileum"),
    ("babyshower", "Babyshower"),
    ("zakelijk", "Zakelijk"),
]

STEPS = [
    ("Kies een ontwerp", "Probeer het werkende voorbeeld op je eigen telefoon."),
    ("Vul je gegevens in", "Alleen de vragen die bij jouw gelegenheid horen."),
    ("Voeg foto's toe", "Je kiest zelf welk deel in beeld komt."),
    ("Bekijk je voorbeeld", "Op telefoon en computer; pas aan wat je wilt."),
    ("Betaal online", "Na een bevestigde betaling wordt je uitnodiging automatisch gepubliceerd."),
    ("Deel en volg aanmeldingen", "Via link of QR-code. Antwoorden zie je in Mijn Vaylide."),
]

FEATURES = [
    ("envelop", "Openingsanimatie", "Envelop, gouden deur of doorschijnend vel. Openen met één tik."),
    ("wekker", "Afteller", "In de juiste tijdzone."),
    ("programma", "Programma", "Van ontvangst tot feest op een tijdlijn."),
    ("locatie", "Locatie en route", "Met een knop naar de kaart."),
    ("gasten", "Aanmelden zonder account", "Aanwezig en met hoeveel personen. Eigen vragen met Compleet of als extra optie."),
    ("agenda", "In de agenda", "Google, Apple en Outlook."),
    ("delen", "Delen", "Via WhatsApp, een link of een QR-code."),
    ("muziek", "Muziek", "Start pas als de gast erop tikt."),
    ("slot", "Privé", "Niet vindbaar in zoekmachines. Alleen jij ziet de gastenlijst."),
]

FAQ = [
    ("Hoe werkt een digitale uitnodiging van Vaylide?",
     "Je kiest een ontwerp, vult de gegevens van je evenement in en bekijkt meteen een persoonlijk voorbeeld. "
     "Na de betaling wordt je uitnodiging automatisch gepubliceerd op een eigen link. Die deel je via WhatsApp, e-mail of met een QR-code."),
    ("Heb ik een account nodig?",
     "Je kunt direct beginnen zonder account. Om je ontwerp te bewaren en te bestellen bevestig je je e-mailadres met een code. "
     "Daarmee log je later weer in, ook op een ander apparaat. Een wachtwoord is niet nodig."),
    ("Moeten mijn gasten een account aanmaken?",
     "Nee. Gasten openen de link en geven aan of ze komen, eventueel met hoeveel personen. Ze kunnen hun antwoord later zelf wijzigen."),
    ("Kan ik na het publiceren nog iets aanpassen?",
     "Ja. Je wijzigt de gegevens in Mijn Vaylide, bekijkt een voorbeeld en publiceert opnieuw. De link en de QR-code blijven hetzelfde."),
    ("Wie kan de aanmeldingen zien?",
     "Alleen jij, in Mijn Vaylide. Gasten zien elkaars antwoorden niet. Je kunt de gastenlijst exporteren naar een bestand voor Excel of Numbers."),
    ("Wordt mijn uitnodiging gevonden via Google?",
     "Nee. Uitnodigingen zijn alleen bereikbaar via de link en we vragen zoekmachines om ze niet op te nemen."),
    ("Kan ik muziek toevoegen?",
     "Ja, met het pakket Compleet of als extra optie. De muziek start pas als een gast er zelf op tikt. "
     "Gebruik alleen muziek waarvoor je toestemming hebt."),
    ("Welke foto's kan ik gebruiken?",
     "JPG, PNG of WebP tot 12 MB per foto. Je kiest zelf welk deel van de foto in beeld komt. "
     "Locatiegegevens en andere verborgen informatie in foto's halen we automatisch weg."),
    ("Hoe betaal ik?",
     "Je betaalt online bij het afronden van je bestelling. Welke betaalmethoden beschikbaar zijn, zoals iDEAL, zie je bij het afrekenen."),
    ("Wanneer staat mijn uitnodiging online?",
     "Zodra de betaalprovider je betaling heeft bevestigd, wordt je uitnodiging automatisch gepubliceerd. "
     "Je ziet de link direct in Mijn Vaylide en ontvangt hem ook per e-mail."),
    ("Hoe lang blijft mijn uitnodiging online?",
     "Dat hangt af van je pakket. De einddatum zie je bij je uitnodiging in Mijn Vaylide. Langer online is als extra optie mogelijk."),
    ("Ik heb een bijzondere wens. Kan dat?",
     "Gebruik 'Extra wensen of hulp nodig?' tijdens het samenstellen of in Mijn Vaylide. We bekijken je vraag persoonlijk. "
     "Kost het iets extra, dan krijg je eerst een voorstel; we beginnen pas na jouw akkoord."),
    ("Wat gebeurt er met de gegevens na afloop?",
     "Na de beschikbaarheidsperiode gaat de uitnodiging offline en worden de gastgegevens na een vaste termijn verwijderd. "
     "Je kunt je uitnodiging, de aanmeldingen en je account ook zelf eerder verwijderen."),
]

# Inspiratie: voorbeeldteksten om over te nemen (geen echte klanten of reviews).
TEXT_SAMPLES = [
    ("bruiloft", "Bruiloft", "Wij gaan trouwen! We zouden het heel bijzonder vinden om deze dag met jou te vieren."),
    ("verloving", "Verloving", "Ze zei ja! Dat willen we graag samen met jou vieren, met een glas en goed eten."),
    ("verjaardag", "Verjaardag", "Dertig wordt gevierd met muziek, bubbels en de mensen die ertoe doen. Kom je ook?"),
    ("jubileum", "Jubileum", "Veertig jaar samen: dat vieren we graag met familie, vrienden en buren."),
    ("babyshower", "Babyshower", "Er is iets kleins op komst! Vier het met ons met taart, thee en spelletjes."),
    ("zakelijk", "Zakelijk", "Graag nodigen wij u uit om samen met ons team dit bijzondere moment te vieren."),
]

TIPS = [
    ("agenda", "Kies een aanmelddatum", "Een paar weken voor de dag. Dan weet je op tijd met hoeveel gasten je rekent."),
    ("programma", "Zet het programma erin", "Gasten zien meteen wanneer de ceremonie, het diner of het feest begint."),
    ("gasten", "Stel je eigen vraag", "Bijvoorbeeld over dieetwensen of vervoer. Met Compleet of als extra optie."),
    ("kleuren", "Geef een dresscode mee", "Met een paar kleuren erbij weten gasten precies wat je bedoelt."),
    ("fotos", "Kies rustige foto's", "Je bepaalt zelf welk deel in beeld komt, zodat tekst goed leesbaar blijft."),
    ("delen", "Deel op jouw manier", "Stuur de link via WhatsApp of e-mail, of zet de QR-code op een kaart."),
]

# Over ons: waar Vaylide op let.
VALUES = [
    ("hart", "Persoonlijk", "Je uitnodiging vertelt jullie verhaal, met eigen tekst, foto's en programma."),
    ("potlood", "Eenvoudig", "Je maakt hem zelf, in je eigen tempo. Gasten hebben geen account nodig."),
    ("slot", "Privé", "Niet vindbaar in zoekmachines. Alleen jij ziet de aanmeldingen."),
    ("vink", "Duidelijk geprijsd", "Eén keer betalen, geen kosten per gast. Bijzondere wensen alleen na jouw akkoord."),
]
