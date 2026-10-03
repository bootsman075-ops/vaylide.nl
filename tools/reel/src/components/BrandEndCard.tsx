import React from 'react';
import {Img, staticFile} from 'remotion';
import {ASSETS, COLORS, FONTS, TEXTS} from '../config';
import {mix, softReveal} from '../lib/anim';

type Props = {
  card: number; // 0..1 de kaart verschijnt
  logo: number; // 0..1
  sheen: number; // 0..1 lichtstreep over de kaart
  line: number;
  url: number;
  sparkle: number; // 0..1 één keer op en neer
};

const LOGO_WIDTH = 600;

// Het logo staat op een zwevende crèmekaart, zoals op de website: zo blijft het logo in de
// aangeleverde kleuren goed leesbaar (ook de bruine regel eronder) en past het bij de uitnodiging.
const CARD_W = 780;
const CARD_H = 600;
const CARD_CY = 860;
const LOGO_HEIGHT = LOGO_WIDTH / ASSETS.logoRatio;

// Eén kleine vierpuntige ster met zachte gloed.
const Sparkle: React.FC<{t: number}> = ({t}) => {
  if (t <= 0 || t >= 1) return null;
  const s = Math.sin(t * Math.PI); // op en weer neer, geen flits
  const size = 70;
  return (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        opacity: s,
        transform: `scale(${mix(0.4, 1, s)}) rotate(${mix(-20, 25, t)}deg)`,
        filter: 'drop-shadow(0 0 10px rgba(255,236,200,0.9)) drop-shadow(0 0 22px rgba(200,164,107,0.6))',
      }}
    >
      <svg width={size} height={size} viewBox="-50 -50 100 100">
        <path d="M0 -50 C 4 -10, 10 -4, 50 0 C 10 4, 4 10, 0 50 C -4 10, -10 4, -50 0 C -10 -4, -4 -10, 0 -50 Z" fill="#FFF6E4" />
        <circle r="6" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

export const BrandEndCard: React.FC<Props> = ({card, logo, sheen, line, url, sparkle}) => {
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* zachte warme gloed achter de kaart */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 700,
          top: CARD_CY - 560,
          width: 1400,
          height: 1120,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(200,164,107,0.20), rgba(200,164,107,0.07) 55%, transparent)',
          opacity: logo,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 540 - CARD_W / 2,
          top: CARD_CY - CARD_H / 2,
          width: CARD_W,
          height: CARD_H,
          borderRadius: 6,
          background: `linear-gradient(165deg, ${COLORS.cream} 0%, #EFE6D7 55%, #E6D8C0 100%)`,
          boxShadow: '0 60px 120px -40px rgba(0,0,0,0.9), 0 0 0 1px rgba(200,164,107,0.35), 0 0 80px rgba(200,164,107,0.18)',
          overflow: 'hidden',
          ...softReveal(card, {y: 40, blur: 18, scale: 0.95}),
        }}
      >
        <svg width={CARD_W} height={CARD_H} style={{position: 'absolute', inset: 0, opacity: 0.16, mixBlendMode: 'multiply'}}>
          <filter id="endGrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="11" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0.6 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#endGrain)" />
        </svg>
        <div style={{position: 'absolute', inset: 22, border: `1px solid ${COLORS.gold}`, opacity: 0.55}} />
        {/* licht dat heel langzaam over het papier glijdt */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(115deg, transparent ${sheen * 160 - 50}%, rgba(255,251,242,0.6) ${sheen * 160 - 25}%, transparent ${sheen * 160}%)`,
            mixBlendMode: 'soft-light',
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 540 - LOGO_WIDTH / 2,
          top: CARD_CY - LOGO_HEIGHT / 2,
          width: LOGO_WIDTH,
          height: LOGO_HEIGHT,
          ...softReveal(logo, {y: 26, blur: 16, scale: 0.965}),
        }}
      >
        <Img src={staticFile(ASSETS.logo)} style={{width: '100%', height: '100%', display: 'block'}} />
        {/* sparkle bij de top van de V */}
        <div style={{position: 'absolute', left: LOGO_WIDTH * 0.445, top: LOGO_HEIGHT * 0.07}}>
          <Sparkle t={sparkle} />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1250,
          textAlign: 'center',
          fontFamily: FONTS.serif,
          fontWeight: 300,
          fontSize: 58,
          letterSpacing: 1,
          color: COLORS.text,
          ...softReveal(line, {y: 18, blur: 10, scale: 1}),
        }}
      >
        {TEXTS.endLine}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1420,
          textAlign: 'center',
          fontFamily: FONTS.serif,
          fontWeight: 400,
          fontSize: 30,
          letterSpacing: 8,
          color: COLORS.champagneDeep,
          ...softReveal(url, {y: 10, blur: 6, scale: 1}),
          opacity: url * 0.85,
        }}
      >
        {TEXTS.url}
      </div>
    </div>
  );
};
