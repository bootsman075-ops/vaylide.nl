# Draaiboek: het treinfilmpje van de kerstexpres

Dit draaiboek hoort bij de opening van het ontwerp `designs/kerstexpress/v1`. Het beschrijft het filmpje per scène: wat er te zien is, hoe lang het duurt, welke beweging erbij hoort, en een Engelse bewegingsomschrijving voor een videotool. De beelden komen uit de contactvellen die de eigenaar stuurde (vel 1, vel 2 en vel 4; vel 1 en vel 3 zijn hetzelfde bestand). De scènes staan in volgorde van het verhaal, niet per vel.

## Wat het filmpje moet doen

- De trein rijdt over het viaduct en het spoor het station in.
- De trein **remt en stilstaat langs het perron**. De locomotief staat in het perron, niet ervoor of erin. De wielen blijven op de rails.
- Daarna gaat de deur open, en de camera gaat de gang in naar de lounge.
- Een envelop ligt op tafel, het zegel gloeit, de envelop gaat open, en de kaart "Fijne Kerstdagen en een gelukkig nieuw jaar!" komt tevoorschijn.
- Alle bewegingen zijn rustig en vloeiend. Geen snelle schokken, geen wisselende camera.

## Technische eisen (voor de videotool)

- **Formaat**: 1080 × 1920 pixels (9:16, staand), 30 beelden per seconde.
- **Duur**: ongeveer 30 seconden, zonder geluid.
- **Beelden**: de bronbeelden zijn liggend (ongeveer 3:2) en klein (256 tot 384 pixels breed). Gebruik de beelden in het groot (minstens 1920 pixels breed) en snijd per scène een staand beeld uit met de trein of het onderwerp in het midden. Anders wordt het filmpje liggend, met zwarte balken op een telefoon.
- **Bestanden**: een mp4 (H.264) en een webm, samen liefst kleiner dan 3 MB; het filmpje wordt daarna gecomprimeerd.
- **Geen tekst en geen logo** in het filmpje. Het logo van Vaylide komt van de site, onder de eindkaart (zie `CLAUDE.md`, regel 12).

## De scènes

| Scène | Tijd | Wat je ziet | Beweging (voor de videotool) |
|---|---|---|---|
| 1 | 0–3 s | Het viaduct bij zonsondergang, de trein rijdt over de bogen | Slow tracking shot from the side, the steam train crosses the stone viaduct at dusk, camera gently follows, snow falls softly, warm lights glow in the windows |
| 2 | 3–6 s | Dorp en bergen in de sneeuw; de trein nadert het station, stoom stijgt op | The train approaches the station, steam drifts upward, camera slowly pushes in, mountains in the background stay still |
| 3 | 6–9 s | Het perron met lantaarns en de overkapping; de trein komt binnen en **remt** | The train slows down and comes to a smooth stop alongside the platform, wheels stay on the rails, lanterns flicker softly, the locomotive stops in front of the platform edge |
| 4 | 9–12 s | De locomotief frontaal, met een krans en een rode strik | Static front view, steam rises slowly around the locomotive, the wreath lights twinkle gently |
| 5 | 12–15 s | De rijtuigen langs het perron, kransen en lichtsnoeren | Camera glides along the side of the carriages, lights run softly along the train, a passenger walks past in the background |
| 6 | 15–18 s | Een deur met een krans gaat open; warm licht van binnen | The carriage door slides open, warm light spills out, the wreath sways very gently |
| 7 | 18–22 s | De gang met rode loper, lantaarns en een kerstboom | Camera moves slowly down the aisle, the red carpet leads toward the lounge, lanterns glow |
| 8 | 22–25 s | De lounge: een tafel, een kerstboom en een raam met bergen | Camera settles on the table, snow falls outside the window, the lamp glows |
| 9 | 25–27 s | De envelop op tafel, het zegel gloeit op | Close-up on the seal, the wax gleams, a soft glow spreads out across the envelope |
| 10 | 27–30 s | De envelop gaat open; sneeuwvlokjes en licht stijgen op; de kaart komt tevoorschijn met "Fijne Kerstdagen en een gelukkig nieuw jaar!" | The envelope opens slowly, golden light and snowflakes rise out of it, the card slides up and stays still, sparkles fade |

## Wat je aan de videotool meegeeft

- **Algemene opdracht** (in het Engels, voor de meeste videotools): "A calm, cinematic festive journey on a red steam train with Christmas garlands and warm lights. Smooth, slow camera moves, no shaking, no fast cuts, the train always stays on the tracks and stops gently at the platform. No text, no logo, no people in close-up."
- **Per scène**: de bewegingsomschrijving uit de tabel, de bronafbeelding (staand uitgesneden) als startbeeld, en de duur.
- **Controle**: elke scène bekijken op een telefoon. Let vooral op de stop bij het perron (de trein moet in beeld stilstaan), op de wielen op de rails, en op de tekst op de kaart (geen vervormde letters).

## Na het filmpje

1. De mp4 en webm in `designs/kerstexpress/v1/img/` zetten als `kerstexpress.mp4` en `kerstexpress.webm`.
2. De placeholder `kx-film__poster` in `invitation.html` vervangen door een `<video muted playsinline preload="metadata">`, met de eerste seconde als poster.
3. De kaartafbeelding en de tegel opnieuw maken, en de test `test_kerst` draaien.
4. Het filmpje controleren op 360 en 390 pixels breed, dicht en geopend, en met 'minder beweging' (dan blijft het poster-beeld staan).
