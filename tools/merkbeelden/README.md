# Merkbeelden en sfeerbeelden

Alle beelden van de website zijn eigen werk: er zitten geen foto's of stockbeelden in.

| Bestand | Wat | Gemaakt met |
| --- | --- | --- |
| `static/img/site/hero*.webp`, `groen*.webp`, `maatwerk*.webp` | Sfeerbeelden (gouden licht, groen, papier) | `scenes.js` via `render.cjs` |
| `static/img/og-vaylia.jpg`, `og-uitnodiging.jpg`, `designs/_standaard.webp` | Deelafbeeldingen, standaardbeeld voor nieuwe ontwerpen | `merk.html` via `render.cjs` (alleen deze: `node tools/merkbeelden/render.cjs merk`) |
| `static/img/merk/vaylia-logo.*`, `favicon-*.png`, `icon-192.png`, `apple-touch-icon.png` | Het logo (zoals aangeleverd) en de iconen | `tools/logo/maak_logo.py`, zie `tools/logo/README.md` |
| `static/img/site/gelegenheid-*.webp`, `kaart-voorbeeld.webp` | Tegels per gelegenheid en de kaart op de homepage | Schermafbeeldingen van de echte voorbeelduitnodigingen, via `voorbeelden.cjs`. Welk ontwerp en welke kleur een tegel toont, staat in `TILES` bovenin dat bestand |

Opnieuw maken (Node met Playwright en Chromium nodig):

```bash
node tools/merkbeelden/render.cjs
# voor de tegels en de kaart eerst de ontwikkelserver starten:
node tools/merkbeelden/voorbeelden.cjs http://127.0.0.1:8000
```

Eigen foto's gebruiken? Vervang het bestand door een eigen beeld met dezelfde naam en ongeveer
dezelfde verhouding, en draai daarna `python manage.py collectstatic`. Gebruik alleen foto's
waarvan je de rechten hebt.
