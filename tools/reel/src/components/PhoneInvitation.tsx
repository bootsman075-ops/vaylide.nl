import React from 'react';
import {COLORS, FONTS, TEXTS} from '../config';
import {mix} from '../lib/anim';
import {CARD, InvitationCard} from './InvitationCard';

export const PHONE = {width: 470, height: 960, radius: 72, bezel: 14};

type Props = {
  /** 0 = papieren kaart, 1 = telefoon met de uitnodiging */
  morph: number;
  /** glans die over de kaart glijdt (-1 = uit) */
  sheen?: number;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};

// Het scherm van de telefoon: een Vaylide-uitnodiging zoals een gast die ziet.
const Screen: React.FC = () => {
  const {kicker, names, date, place, button} = TEXTS.invite;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(180deg, ${COLORS.cream} 0%, #EFE4D2 60%, #E6D6BC 100%)`,
        color: COLORS.ink,
        fontFamily: FONTS.serif,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* statusbalk */}
      <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', padding: '26px 44px 0', fontSize: 20, fontWeight: 600, fontFamily: 'Helvetica, Arial, sans-serif', color: '#3a2e25', boxSizing: 'border-box'}}>
        <span>9:41</span>
        <span style={{display: 'flex', gap: 6, alignItems: 'center'}}>
          <span style={{width: 20, height: 11, border: '1.6px solid #3a2e25', borderRadius: 3, display: 'inline-block', position: 'relative'}}>
            <span style={{position: 'absolute', inset: 1.5, right: 4, background: '#3a2e25', borderRadius: 1}} />
          </span>
        </span>
      </div>
      {/* boog met zachte gloed, als een raam vol licht */}
      <div
        style={{
          marginTop: 60,
          width: 300,
          height: 360,
          borderRadius: '150px 150px 12px 12px',
          background: `radial-gradient(ellipse 80% 70% at 50% 35%, #FFF8EA 0%, ${COLORS.champagne} 55%, ${COLORS.champagneDeep} 100%)`,
          border: `1px solid ${COLORS.gold}`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 0 40px rgba(200,164,107,0.35)',
        }}
      >
        <svg width="190" height="220" viewBox="0 0 190 220" style={{opacity: 0.75}}>
          {/* fijne takjes in goud */}
          <g fill="none" stroke={COLORS.gold} strokeWidth="1.6" strokeLinecap="round">
            <path d="M95 215 C 92 160, 80 110, 60 60" />
            <path d="M95 215 C 98 160, 112 110, 132 60" />
          </g>
          <g fill={COLORS.gold} opacity="0.8">
            {[0, 1, 2, 3, 4].map((i) => (
              <ellipse key={`l${i}`} cx={86 - i * 6} cy={180 - i * 28} rx="6" ry="13" transform={`rotate(${-35 - i * 4} ${86 - i * 6} ${180 - i * 28})`} />
            ))}
            {[0, 1, 2, 3, 4].map((i) => (
              <ellipse key={`r${i}`} cx={104 + i * 6} cy={180 - i * 28} rx="6" ry="13" transform={`rotate(${35 + i * 4} ${104 + i * 6} ${180 - i * 28})`} />
            ))}
          </g>
        </svg>
      </div>
      <div style={{marginTop: 46, fontSize: 19, letterSpacing: 7, textTransform: 'uppercase', fontWeight: 500, color: '#7A6040'}}>{kicker}</div>
      <div style={{fontFamily: FONTS.script, fontSize: 76, lineHeight: 1.1, marginTop: 14}}>{names[0]}</div>
      <div style={{fontStyle: 'italic', fontSize: 36, color: '#8A6A3E', lineHeight: 1}}>&amp;</div>
      <div style={{fontFamily: FONTS.script, fontSize: 76, lineHeight: 1.1}}>{names[1]}</div>
      <div style={{width: 70, height: 1, background: COLORS.gold, margin: '22px 0 18px'}} />
      <div style={{fontSize: 24, fontWeight: 500, letterSpacing: 1}}>{date}</div>
      <div style={{fontSize: 21, fontStyle: 'italic', marginTop: 6, color: '#5C4A3A'}}>{place}</div>
      <div
        style={{
          marginTop: 34,
          padding: '14px 44px',
          borderRadius: 999,
          background: `linear-gradient(180deg, #D3B47E, ${COLORS.gold})`,
          color: '#2B2119',
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: 1.5,
          boxShadow: '0 8px 20px -10px rgba(110,80,40,0.6)',
        }}
      >
        {button}
      </div>
    </div>
  );
};

export const PhoneInvitation: React.FC<Props> = ({morph, sheen = -1}) => {
  const m = morph;
  const w = mix(CARD.width, PHONE.width, m);
  const h = mix(CARD.height, PHONE.height, m);
  const radius = mix(4, PHONE.radius, m);
  const bezel = mix(0, PHONE.bezel, clamp01((m - 0.25) / 0.6));
  // De kaart vervaagt terwijl het scherm opkomt; een lichtstreep over het glas verbergt de wissel.
  const cardFade = 1 - smooth((m - 0.08) / 0.4);
  const screenFade = smooth((m - 0.28) / 0.42);
  const glint = m > 0.2 && m < 0.95 ? (m - 0.2) / 0.75 : -1;
  const screenScale = mix(0.92, 1, screenFade);

  return (
    <div
      style={{
        position: 'absolute',
        left: -w / 2,
        top: -h / 2,
        width: w,
        height: h,
        borderRadius: radius,
        background: `linear-gradient(145deg, #2A221C, #120E0B)`,
        padding: bezel,
        boxSizing: 'border-box',
        boxShadow: `0 50px 90px -30px rgba(0,0,0,0.85), 0 0 0 ${mix(0, 1.5, m)}px rgba(215,192,154,0.55), 0 0 60px rgba(200,164,107,${0.12 + 0.08 * m})`,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: Math.max(2, radius - bezel),
          overflow: 'hidden',
          background: `linear-gradient(170deg, ${COLORS.cream}, ${COLORS.champagne})`,
        }}
      >
        {/* papiertextuur op de kaart */}
        <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: 0.18 * (1 - m), mixBlendMode: 'multiply'}}>
          <filter id="cardGrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="3" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0.6 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#cardGrain)" />
        </svg>
        {cardFade > 0 && <InvitationCard opacity={cardFade} sheen={sheen} />}
        {screenFade > 0 && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: PHONE.width - PHONE.bezel * 2,
              height: PHONE.height - PHONE.bezel * 2,
              marginLeft: -(PHONE.width - PHONE.bezel * 2) / 2,
              marginTop: -(PHONE.height - PHONE.bezel * 2) / 2,
              opacity: screenFade,
              transform: `scale(${screenScale})`,
              filter: screenFade < 1 ? `blur(${((1 - screenFade) * 6).toFixed(2)}px)` : undefined,
            }}
          >
            <Screen />
          </div>
        )}
        {glint > -1 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(120deg, transparent ${glint * 140 - 45}%, rgba(255,248,232,0.75) ${glint * 140 - 20}%, transparent ${glint * 140 + 5}%)`,
              opacity: Math.sin(glint * Math.PI),
              mixBlendMode: 'screen',
              pointerEvents: 'none',
            }}
          />
        )}
        {/* glasreflectie */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(125deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 32%)',
            opacity: m,
            pointerEvents: 'none',
          }}
        />
      </div>
      {/* camera-eiland */}
      <div
        style={{
          position: 'absolute',
          top: bezel + 16,
          left: '50%',
          width: 120,
          height: 34,
          marginLeft: -60,
          borderRadius: 20,
          background: '#0B0908',
          opacity: clamp01((m - 0.6) / 0.4),
        }}
      />
    </div>
  );
};
