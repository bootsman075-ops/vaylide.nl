# Promovideo voor TikTok

Gemaakt op 5 oktober 2026 uit een aangeleverde clip van 5 seconden (bruidspaar, 478 × 848, zonder geluid).

| Bestand | Inhoud |
| --- | --- |
| `vaylide-tiktok.mp4` | 14 seconden, 1080 × 1920, 30 fps, met zelfgemaakte zachte muziek |
| `vaylide-tiktok-zonder-muziek.mp4` | Hetzelfde beeld zonder geluid, om in TikTok zelf een geluid te kiezen |

Opbouw: kop van de homepage ("Een bijzondere dag verdient een bijzondere uitnodiging."), drie labels met wat de site doet
(zelf samenstellen, delen via WhatsApp of QR-code, gasten melden zich aan) en een eindkaart met het logo zoals aangeleverd
(`tools/logo/vaylide-logo-vrijstaand.png`, niet aangepast) en de knop "Maak jouw uitnodiging".

Bewust niet opgenomen: webadres of "link in bio" (de site staat nog in testmodus), prijzen, aantallen, reviews en leverbeloftes.

Gemaakt met ffmpeg (clip vertragen met bewegingsinterpolatie, opschalen en kleurcorrectie), een HTML-laag met de
huisstijllettertypen (Playfair Display en DM Sans) die per beeld is vastgelegd met Playwright, en muziek die met een klein
Python-script is opgebouwd (geen rechten van derden). Alleen de uitvoer is bewaard; de weergave is bekeken op beeldjes
uit de video, niet afgespeeld in een speler.

## Tweede video: kerst

Gemaakt op 5 oktober 2026 uit een tweede aangeleverde clip (15 seconden, 576 × 1024, met geluid): een chocoladehuisje in de sneeuw
waar elfjes uitstuiven, een lolly verschijnt en de elfjes juichen. Zelfde stijl als de eerste video: dezelfde kop, drie labels,
goudstof en eindkaart met het logo zoals aangeleverd. De clip loopt op normale snelheid (niet vertraagd), zodat beeld en geluid
bij elkaar blijven.

| Bestand | Inhoud |
| --- | --- |
| `vaylide-tiktok-kerst.mp4` | 19 seconden, 1080 × 1920, 30 fps; het geluid van de aangeleverde clip (gelijkgetrokken) en een zacht belletje bij de eindkaart |
| `vaylide-tiktok-kerst-zonder-geluid.mp4` | Hetzelfde beeld zonder geluid |

Ook hier geen webadres, prijzen, aantallen of leverbeloftes. Het geluid van de aangeleverde clip is niet beluisterd; alleen het
volume is gemeten.
