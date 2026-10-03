// Alle instellingen van de Reel op één plek: formaat, timing, kleuren, teksten, beelden en geluid.
// Tijden staan in seconden; `sec()` rekent ze om naar frames.

import timing from './timing.json';

export const FORMAT = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInSeconds: timing.scene4.end, // 5,5 seconden
};

export const sec = (s: number) => Math.round(s * FORMAT.fps);

export const COLORS = {
  bgDeep: '#0E0C0B',
  bgWarm: '#17120F',
  bgLift: '#211A16',
  champagne: '#E7D7BC',
  champagneDeep: '#D7C09A',
  gold: '#C8A46B',
  cream: '#F5EFE6',
  text: '#F8F4EE',
  // Afgeleide tinten voor papier, lak en schaduw
  paperShade: '#CDB892',
  paperInner: '#B89C72',
  waxLight: '#D9B77C',
  waxMid: '#A9834A',
  waxDark: '#6E5128',
  ink: '#3A2E25',
};

export const TEXTS = {
  scene3Line: 'Bijzondere momenten beginnen hier.',
  endLine: 'Maak jouw moment bijzonder.',
  url: 'vaylide.nl',
  // Voorbeelduitnodiging op de kaart en de telefoon (verzonnen namen, alleen ter illustratie)
  invite: {
    kicker: 'Wij gaan trouwen',
    names: ['Sophie', 'Daan'],
    date: 'zaterdag 12 juni 2027',
    place: 'Landgoed aan de Vecht',
    button: 'Ik ben erbij',
    sealInitial: 'V',
  },
};

export const ASSETS = {
  logo: 'vaylide-logo.png', // het logo zoals aangeleverd (tools/logo/vaylide-logo-vrijstaand.png)
  logoRatio: 990 / 678,
  fonts: {
    serif: 'fonts/cormorant-garamond-latin-wght-normal.woff2',
    serifItalic: 'fonts/cormorant-garamond-latin-wght-italic.woff2',
    script: 'fonts/pinyon-script-latin-400-normal.woff2',
  },
};

export const FONTS = {
  serif: '"Cormorant Garamond", "Times New Roman", serif',
  script: '"Pinyon Script", "Cormorant Garamond", serif',
};

// Tijdlijn (seconden) staat in src/timing.json, zodat beeld en geluid (scripts/maak-audio.mjs)
// dezelfde tijden gebruiken. Pas daar aan om scènes langer of korter te maken, en draai daarna
// `npm run audio` opnieuw.
export const TIMING = timing;

// Camera: [seconde, schaal, verschuiving in px]. Tussen de punten loopt een vloeiende curve.
export const CAMERA_KEYS: Array<[number, number, number]> = [
  [0.0, 1.0, 0],
  [1.3, 1.07, 0],
  [2.4, 1.15, 40],
  [3.2, 1.1, 170],
  [3.9, 1.03, 120],
  [4.6, 0.98, 40],
  [5.5, 0.955, 30],
];

// Geluid: maak de lagen met `npm run audio` (scripts/maak-audio.mjs) of vervang ze door eigen bestanden.
export const AUDIO = {
  music: {src: 'audio/muziek.wav', volume: 0.9},
  paper: {src: 'audio/papier.wav', volume: 0.55},
  shimmer: {src: 'audio/glans.wav', volume: 0.35},
  chime: {src: 'audio/klokje.wav', volume: 0.5},
};

export const PARTICLES = {
  count: 34,
  bokehCount: 9,
  seed: 'vaylide',
};
