# Etsy en Vaylide koppelen — werkplan

**Status: voorbereid, nog niet gekoppeld of live.** Dit document bevat geen geheimen.

## Doel
Digitale Vaylide kaarten op Etsy aanbieden, verkopen en betaald krijgen via Etsy. Bestellingen na een geslaagde Etsy-betaling doorzetten naar een intern overzicht van Vaylide. Bestaande betalingen op vaylide.nl blijven onveranderd.

## Etsy-producten
- Kant-en-klare download: een eigen JPG, PDF, video of ander ondersteund bestand dat Etsy aan de koper levert.
- Gepersonaliseerde uitnodiging: op Etsy als 'made-to-order digital download' met relevante personalisatievragen. Na voltooiing uploadt de verkoper het bestand bij Etsy Shop Manager > Orders > Complete order > Upload file.
- Belangrijk: de huidige Etsy API biedt geen mechanisme om voor iedere individuele made-to-order bestelling automatisch een uniek digitaal bestand aan de Etsy-order toe te voegen. De Vaylide-koppeling mag dus nog geen automatische Etsy-aflevering beloven.
- Verwijs kopers niet vanuit Etsy naar een andere checkout voor het voltooien van hun aankoop.

## Techniek voor implementatie (nog niet gebouwd)
1. Open of koppel een eigen Etsy-shop via de officiële Etsy Developer Portal: https://developers.etsy.com/ . Vraag Seller App-toegang aan en autoriseer met OAuth 2.0.
2. Bewaar Etsy API-sleutels en OAuth-tokens uitsluitend server-side via secret environment variables; nooit in GitHub.
3. Bouw een aparte Etsy-integratiemodule voor dit Django-platform; wijzig de bestaande Mollie- en Vaylide-checkout niet.
4. Zet een beveiligde Etsy-webhook in voor order.paid en order.canceled. Valideer de Etsy-webhookhandtekening en bescherm tegen herhaling van events.
5. Haal na een geverifieerd event met de Etsy API de actuele order op en verwerk betaalstatus alleen op basis van vertrouwde Etsy-gegevens.
6. Registreer Etsy receipt- en transaction-ID's uniek; dubbele webhooks moeten idempotent zijn.
7. Leg een expliciete koppeltabel vast van Etsy listing-ID naar Vaylide-ontwerp. Sla relevante personalisatie veilig op en maak een Etsy-order zichtbaar in Beheer.
8. Lever het eindproduct volgens de gekozen Etsy-listingvorm via Etsy, controleer annuleringen en fouten; geen onterechte bevestiging van levering.
9. Gebruik voor Etsy-personalisatie de actuele typed personalization API in plaats van oude inmiddels verwijderde velden.
10. Maak conceptadvertenties voor bruiloft, verjaardag en kerst, controleer beelden en teksten handmatig en publiceer niet automatisch.

## Tests en voorwaarden voor livegang
- Geen actieve koppeling zonder Etsy-shop, officiële OAuth-toestemming en backend-configuratie.
- Ongeldige webhook: geweigerd; dubbele order.paid: precies één interne import.
- Geannuleerde/onbetaalde order nooit als betaald behandelen.
- Geen persoonsgegevens zichtbaar buiten geautoriseerd beheer.
- Fouten bij Etsy of verlopen token leiden niet tot dubbele orders.
- Alle bestaande Vaylide-tests moeten slagen.
- Niet publiceren of betaalde diensten inschakelen zonder aparte toestemming.

## Vereist van eigenaar
- Een Etsy-verkoopaccount/winkel, of deze eerst zelf via Etsy openen.
- Officieel Etsy OAuth-toestemmingsscherm doorlopen.
- Bepalen of de producten directe downloads of op maat gemaakte bestanden zijn.

## Bronnen (oktober 2026)
- https://developers.etsy.com/
- https://developer.etsy.com/documentation/essentials/webhooks/
- https://developer.etsy.com/documentation/tutorials/personalization-migration/
- https://help.etsy.com/hc/nl/articles/115015628347-Jouw-digitale-listings-beheren
- https://www.etsy.com/legal/policy/off-platform-transactions-policy/1254654515806
- https://github.com/etsy/open-api/discussions/1514