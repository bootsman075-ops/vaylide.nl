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

## Statusupdate 12 oktober 2026

De eigenaar heeft de Etsy-verkopersapp **vaylide-integration** aangemaakt; het Etsy Developer Dashboard toont **Approved**. Dit is bevestigd met een screenshot, maar er is **nog geen OAuth-toestemming**, geen token opgeslagen en **geen werkende synchronisatie**.

### Eerstvolgende technische stap

- Implementeer en test vóór het invullen van de redirect URL de HTTPS callbackroute aan de Vaylide-serverzijde. Voorgestelde URL: `https://vaylide.nl/integraties/etsy/callback/` (nog **niet** beschikbaar; niet invullen alsof deze al werkt).
- Voeg de exact overeenkomende redirect URL toe in de instellingen van de Etsy-app; Etsy vereist een byte-for-byte overeenkomst inclusief eventuele eindslash.
- OAuth 2.0 Authorization Code + PKCE, unieke `state`, beperkte scope `transactions_r` (en `listings_r` alleen indien nodig) en veilige versleutelde opslag van tokens. Geen Etsy API-sleutels in screenshots, broncode of chat.
- Pas daarna de Etsy-shop via officiële toestemming verbinden en een gecontroleerde testorder importeren. Een goedgekeurde app is nog geen verbonden winkel.
- Let op: de uit GitHub gelezen code/documentatie kan achterlopen op de productieversie van Vaylide. Eerst de actuele deployment met de repository vergelijken voordat wijzigingen worden uitgebracht.

Etsy documentatie: https://developers.etsy.com/documentation/essentials/authentication/ en https://developers.etsy.com/documentation/essentials/webhooks/ .


## Ontwikkelstatus (na Etsy-goedkeuring)

Op conceptbranch `feature/etsy-koppeling-voorbereiding` is een eerste **server-side OAuth2/PKCE verbinding** gebouwd in `etsy_integration/`. Het Etsy-redirectpad is `/integraties/etsy/callback/` en de autorisatie start via `/beheer/etsy/verbinden/` (alleen staf). Alleen versleutelde OAuth-tokens worden opgeslagen, gebruikmakend van een afzonderlijke Fernet-sleutel; PKCE, single-use CSRF-state, verloop van de autorisatiestap en toegangscontrole zijn opgenomen. Voor dit onderdeel staan aparte tests in `tests/test_etsy_oauth.py`.

**Niet live:** wijzigingen staan uitsluitend in een draft pull request. Er is nog geen betrouwbare bevestiging dat de tests op de echte productieversie slagen en er is nog niets gedeployed. Etsy-ordersynchronisatie/webhooks/listings zijn nog niet geïmplementeerd. Ook OAuth heeft de eigenaar nog niet doorlopen en er is nog geen API-token verstrekt.

### Uitrolvoorwaarden

1. Eerst vaststellen of de productiesite op `https://vaylide.nl` door precies deze GitHub-repository wordt gepubliceerd, en vanaf welke hosting/branch. Deze code is mogelijk ouder dan de live site.
2. Complete Django-tests en migratiechecks in een veilige ontwikkelomgeving draaien en reviewen. Deploy niet vanuit deze conceptbranch zonder eigenaarstoestemming.
3. Als de deployment wordt goedgekeurd: de toegevoegde database-migratie draaien en alleen in de server-side environment configureren: `ETSY_ENABLED=true`, `ETSY_CLIENT_ID`, `ETSY_REDIRECT_URI=https://vaylide.nl/integraties/etsy/callback/`, `ETSY_FERNET_KEY` (een afzonderlijk willekeurige Fernet-sleutel). Geen geheimen in GitHub of chat.
4. De exacte HTTPS callback-URL op Etsy registreren. De route moet live zijn en door de juiste deployment worden afgehandeld voordat de OAuth-flow wordt getest.
5. Inloggen als Vaylide-beheerder en `/beheer/etsy/verbinden/` openen; Etsy verleent via OAuth toestemming. Controleer dat één `EtsyConnection` met ciphertext is opgeslagen en dat autorisatie-/herhalingsfouten netjes worden afgewezen.
6. Pas daarna orderimport als afzonderlijke wijziging en na verificatie van Etsy-platformregels bouwen. De bestaande bestelling/betaalflow mag niet worden omzeild.
