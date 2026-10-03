import React from 'react';
import {COLORS} from '../config';
import {mix} from '../lib/anim';
import {Glow} from './Glow';
import {WaxSeal} from './WaxSeal';

export const ENVELOPE = {width: 760, height: 500, flapDepth: 0.6};

type Props = {
  /** 0..1 het zegel komt los */
  sealLoosen: number;
  /** 0..1 de bovenste flap gaat open (0 = dicht, 1 = helemaal open) */
  flapOpen: number;
  /** 0..1 warme gloed uit de envelop */
  glow: number;
  /** 0..1 de envelop zakt weg en vervaagt (de kaart blijft staan) */
  exit: number;
  /** gouden randlicht 0..1 */
  rim: number;
  /** de kaart: ligt tussen de achterkant en de voorkant van de envelop */
  children?: React.ReactNode;
};

const W = ENVELOPE.width;
const H = ENVELOPE.height;
const FLAP_H = H * ENVELOPE.flapDepth;

// Papiertextuur: fijne vezels via ruis, licht vermenigvuldigd met de papierkleur.
const PaperGrain: React.FC<{id: string; opacity?: number}> = ({id, opacity = 0.22}) => (
  <>
    <filter id={id} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9 0.35" numOctaves="3" seed="7" result="n" />
      <feColorMatrix
        in="n"
        type="matrix"
        values="0 0 0 0 0.35  0 0 0 0 0.26  0 0 0 0 0.16  0 0 0 0.55 0"
      />
    </filter>
    <rect width={W} height={H} filter={`url(#${id})`} opacity={opacity} style={{mixBlendMode: 'multiply'}} />
  </>
);

const flapPath = () => {
  // driehoek met een zacht afgeronde punt
  const tipY = FLAP_H;
  return `M 0 0 L ${W} 0 L ${W / 2 + 34} ${tipY - 16} Q ${W / 2} ${tipY + 6} ${W / 2 - 34} ${tipY - 16} Z`;
};

// Bovenste flap. `face` = buitenkant (met zegel) of binnenkant (zichtbaar als hij open staat).
const Flap: React.FC<{angle: number; sealLoosen: number; glow: number}> = ({angle, sealLoosen, glow}) => {
  const rad = (angle * Math.PI) / 180;
  const outerShade = mix(1, 0.72, Math.sin(Math.min(rad, Math.PI / 2)));
  const innerLight = 0.78 + 0.22 * glow;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: W,
        height: FLAP_H + 10,
        transformOrigin: '50% 0%',
        transformStyle: 'preserve-3d',
        transform: `rotateX(${angle}deg)`,
      }}
    >
      {/* buitenkant */}
      <div style={{position: 'absolute', inset: 0, backfaceVisibility: 'hidden', filter: `brightness(${outerShade})`}}>
        <svg width={W} height={FLAP_H + 10} style={{overflow: 'visible', filter: 'drop-shadow(0 6px 8px rgba(40,25,10,0.28))'}}>
          <defs>
            <linearGradient id="flapOuter" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.champagneDeep} />
              <stop offset="100%" stopColor={COLORS.champagne} />
            </linearGradient>
            <clipPath id="flapClip">
              <path d={flapPath()} />
            </clipPath>
          </defs>
          <path d={flapPath()} fill="url(#flapOuter)" />
          <g clipPath="url(#flapClip)">
            <PaperGrain id="grainFlap" />
          </g>
          <path d={flapPath()} fill="none" stroke={COLORS.gold} strokeOpacity="0.45" strokeWidth="1.2" />
        </svg>
        <div style={{position: 'absolute', left: W / 2 - 75, top: FLAP_H - 112}}>
          <WaxSeal loosen={sealLoosen} />
        </div>
      </div>
      {/* binnenkant */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateX(180deg)',
          filter: `brightness(${innerLight})`,
        }}
      >
        <svg width={W} height={FLAP_H + 10} style={{transform: 'scaleY(-1)'}}>
          <defs>
            <linearGradient id="flapInner" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.paperInner} />
              <stop offset="100%" stopColor={COLORS.champagneDeep} />
            </linearGradient>
            <clipPath id="flapClipInner">
              <path d={flapPath()} />
            </clipPath>
          </defs>
          <path d={flapPath()} fill="url(#flapInner)" />
          {/* fijne voering met een ruitjespatroon in goud */}
          <g clipPath="url(#flapClipInner)" opacity="0.18">
            {new Array(22).fill(0).map((_, i) => (
              <line key={`a${i}`} x1={i * 40 - 200} y1={0} x2={i * 40 + 100} y2={FLAP_H} stroke={COLORS.gold} strokeWidth="1" />
            ))}
            {new Array(22).fill(0).map((_, i) => (
              <line key={`b${i}`} x1={i * 40 + 100} y1={0} x2={i * 40 - 200} y2={FLAP_H} stroke={COLORS.gold} strokeWidth="1" />
            ))}
          </g>
          <g clipPath="url(#flapClipInner)">
            <PaperGrain id="grainFlapIn" opacity={0.16} />
          </g>
        </svg>
      </div>
    </div>
  );
};

export const Envelope: React.FC<Props> = ({sealLoosen, flapOpen, glow, exit, rim, children}) => {
  // De flap draait van 0 naar 178 graden om de bovenrand; tot 90 graden ligt hij voor de kaart.
  const angle = flapOpen * 178;
  const flapInFront = angle < 90;
  const sideReact = Math.sin(flapOpen * Math.PI); // zijkanten veren heel even mee
  const sideTip = 10 * sideReact;
  const flapShadow = Math.sin(Math.min((angle * Math.PI) / 180, Math.PI / 2)) * (1 - flapOpen * 0.9);

  const exitStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    transform: `translateY(${mix(0, 520, exit)}px) scale(${mix(1, 0.94, exit)})`,
    opacity: 1 - Math.pow(exit, 0.6),
    filter: exit > 0 ? `blur(${(exit * 16).toFixed(2)}px)` : undefined,
    // perspectief op de directe ouder van de flap, zodat het openen echt diepte heeft
    perspective: 1150,
    perspectiveOrigin: '50% 30%',
  };

  return (
    <div style={{position: 'relative', width: W, height: H, transformStyle: 'preserve-3d'}}>
      {/* achterkant, schaduw en (open) flap */}
      <div style={exitStyle}>
        {/* zachte schaduw op de ondergrond */}
        <div
          style={{
            position: 'absolute',
            left: -40,
            right: -40,
            top: H - 40,
            height: 120,
            borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(0,0,0,0.75), transparent)',
            filter: 'blur(18px)',
          }}
        />
        {/* gouden randlicht rondom */}
        <div
          style={{
            position: 'absolute',
            inset: -2,
            borderRadius: 6,
            boxShadow: `0 0 ${40 + rim * 30}px ${rim * 6}px rgba(200,164,107,${0.18 * rim}), 0 40px 80px -20px rgba(0,0,0,0.8)`,
          }}
        />
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <defs>
            <linearGradient id="back" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8E7452" />
              <stop offset="55%" stopColor={COLORS.paperInner} />
              <stop offset="100%" stopColor={COLORS.paperShade} />
            </linearGradient>
          </defs>
          <rect width={W} height={H} rx="5" fill="url(#back)" />
        </svg>
        {!flapInFront && <Flap angle={angle} sealLoosen={sealLoosen} glow={glow} />}
        <Glow intensity={glow * 0.9} x={W / 2} y={H * 0.12} width={W * 0.95} height={H * 0.55} blur={28} />
      </div>

      {/* de kaart */}
      {children}

      {/* voorkant: zijflappen en onderflap */}
      <div style={exitStyle}>
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <defs>
            <linearGradient id="sideL" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={COLORS.champagne} />
              <stop offset="100%" stopColor={COLORS.champagneDeep} />
            </linearGradient>
            <linearGradient id="sideR" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor={COLORS.champagne} />
              <stop offset="100%" stopColor={COLORS.paperShade} />
            </linearGradient>
            <linearGradient id="bottom" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={COLORS.cream} />
              <stop offset="100%" stopColor={COLORS.champagne} />
            </linearGradient>
            <linearGradient id="flapShadow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a1c10" stopOpacity={0.45 * flapShadow} />
              <stop offset="60%" stopColor="#2a1c10" stopOpacity="0" />
            </linearGradient>
            <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="-4" stdDeviation="6" floodColor="#3b2814" floodOpacity="0.3" />
            </filter>
            <clipPath id="pocketClip">
              <rect width={W} height={H} rx="5" />
            </clipPath>
          </defs>
          <g clipPath="url(#pocketClip)">
            <path d={`M 0 0 L ${W * 0.53 + sideTip} ${H * 0.55} L 0 ${H} Z`} fill="url(#sideL)" />
            <path d={`M ${W} 0 L ${W * 0.47 - sideTip} ${H * 0.55} L ${W} ${H} Z`} fill="url(#sideR)" />
            <path
              d={`M 0 ${H} L ${W / 2 - 40} ${H * 0.44 + 10} Q ${W / 2} ${H * 0.4} ${W / 2 + 40} ${H * 0.44 + 10} L ${W} ${H} Z`}
              fill="url(#bottom)"
              filter="url(#softShadow)"
            />
            <PaperGrain id="grainPocket" />
            {/* schaduw van de flap op de envelop terwijl hij opengaat */}
            <rect width={W} height={H} fill="url(#flapShadow)" />
            {/* licht van binnenuit op de bovenrand */}
            <rect width={W} height={H * 0.4} fill={COLORS.gold} opacity={glow * 0.12} style={{mixBlendMode: 'screen'}} />
          </g>
          <rect width={W} height={H} rx="5" fill="none" stroke={COLORS.gold} strokeOpacity={0.25 + rim * 0.35} strokeWidth="1.5" />
        </svg>
        {flapInFront && <Flap angle={angle} sealLoosen={sealLoosen} glow={glow} />}
      </div>
    </div>
  );
};
