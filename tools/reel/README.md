# Instagram Reel van Vaylide

Een korte, rustige Reel van 5,5 seconden: een envelop met lakzegel komt uit het donker, gaat open met
warm licht, de uitnodiging komt omhoog en wordt een telefoon met een Vaylide-uitnodiging, en het eind
toont het logo met "Maak jouw moment bijzonder." en vaylide.nl.

- 1080 × 1920 pixels (9:16), 30 beelden per seconde, 5,5 seconden
- MP4 met H.264 (yuv420p, BT.709) en AAC-geluid, geschikt voor Instagram Reels
- Gebouwd met React en [Remotion](https://www.remotion.dev); alles is code, dus makkelijk aan te passen

De laatst gemaakte versie staat in `export/vaylide-reel.mp4`, met een omslagbeeld in
`export/vaylide-reel-omslag.jpg`.

## Maken

Node 18 of nieuwer.

```bash
cd tools/reel
npm install
npm run render        # maakt eerst de geluidslagen, daarna out/vaylide-reel.mp4
npm run studio        # bekijken en bijschaven in de browser (draai eerst één keer `npm run audio`)
npm run stills        # losse beelden op vaste momenten in out/stills/ (snel controleren)
```

Remotion downloadt zelf een browser om de beelden te maken. Staat er al Chromium klaar, geef die dan mee:
`REMOTION_BROWSER=/pad/naar/chrome-headless-shell npm run render`.

Kopieer daarna `out/vaylide-reel.mp4` naar `export/` als dat de nieuwe versie moet worden.

## Aanpassen

Alles staat centraal, zodat je de onderdelen zelf niet hoeft te openen:

| Wat | Waar |
| --- | --- |
| Timing van alle scènes en bewegingen (seconden) | `src/timing.json`, gedeeld met het geluid |
| Camerabeweging (inzoomen en terugtrekken) | `CAMERA_KEYS` in `src/config.ts` |
| Kleuren | `COLORS` in `src/config.ts` (palet van de opdracht) |
| Teksten, ook de voorbeelduitnodiging | `TEXTS` in `src/config.ts` |
| Logo, lettertypen | `ASSETS` in `src/config.ts`, bestanden in `public/` |
| Geluid en volumes | `AUDIO` in `src/config.ts`, bestanden in `public/audio/` |
| Aantal lichtdeeltjes | `PARTICLES` in `src/config.ts` |

Na een wijziging in `src/timing.json`: draai `npm run audio` (of gewoon `npm run render`), zodat het geluid
weer precies op het beeld valt.

## Opbouw

| Onderdeel | Bestand |
| --- | --- |
| `<VaylideReel />` de hele Reel: tijdlijn, camera, lagen en geluid | `src/VaylideReel.tsx` |
| `<Envelope />` envelop met papiertextuur, gouden randlicht, 3D-flap en zijflappen die meeveren | `src/components/Envelope.tsx` |
| `<WaxSeal />` lakzegel met reliëf dat loskomt | `src/components/WaxSeal.tsx` |
| `<InvitationCard />` de papieren uitnodiging | `src/components/InvitationCard.tsx` |
| `<PhoneInvitation />` de overgang van kaart naar telefoon, met het scherm | `src/components/PhoneInvitation.tsx` |
| `<Particles />` warme lichtdeeltjes en bokeh (vaste seed: elk frame is gelijk bij opnieuw maken) | `src/components/Particles.tsx` |
| `<Glow />` zachte gloed, opgeteld bij de achtergrond | `src/components/Glow.tsx` |
| `<BrandEndCard />` het logo op een crèmekaart, de slotregel en vaylide.nl | `src/components/BrandEndCard.tsx` |
| Filmkorrel en vignet | `src/components/FilmGrain.tsx` |
| Curves en hulpjes (`progress`, `smoothKeys`, `softReveal`) | `src/lib/anim.ts` |

Bewegingen gebruiken cubic-bezier-curves zonder bounce, en de camera loopt via een vloeiende curve door
de sleutelpunten (geen stilstand bij elk punt). Onthullingen combineren dekking, schaal, vervaging en een
kleine verticale beweging.

## Keuzes

- **Logo**: het logo staat er zoals aangeleverd (`tools/logo/vaylide-logo-vrijstaand.png`, vaste regel 12),
  op een zwevende crèmekaart. Op de donkere achtergrond alleen is de bruine regel onder het logo slecht
  leesbaar; een lichtcirkel erachter oogde als een maan. De kaart sluit aan bij de uitnodiging en de website.
- **Sparkle**: één kleine ster bij de top van de V, die rustig opkomt en weer verdwijnt.
- **Voorbeelduitnodiging**: verzonnen namen en plaats (Sophie & Daan), alleen ter illustratie.
- **Lettertypen**: Cormorant Garamond (dun, elegant) en Pinyon Script voor de namen, dezelfde bestanden als
  de site (`static/fonts/`, OFL-licentie).
- **Geluid**: `scripts/maak-audio.mjs` maakt alle lagen zelf (geen rechten van anderen): zachte piano, een
  warme pad met een rustige zwelling, papiergeritsel bij het zegel, de flap en de kaart, een heel zachte
  glinstering bij de gloed en een klein klokje bij het logo. Luidheid van het geheel ongeveer -15 LUFS, piek
  ongeveer -3 dB. Een eigen gelicenseerde soundtrack kan de muziek vervangen: zet hem als
  `public/audio/muziek.wav` neer, of pas `AUDIO` aan. Het eigen geluid is gemeten, niet beluisterd:
  luister het zelf na.
- **Veilige zone**: tekst en logo staan buiten de randen waar Instagram knoppen en het bijschrift toont.

## Licentie van Remotion

Remotion is gratis voor particulieren en bedrijven tot en met drie medewerkers. Grotere bedrijven hebben
een bedrijfslicentie nodig (zie remotion.dev/license). Er is niets afgesloten.
