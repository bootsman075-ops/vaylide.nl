import React from 'react';
import {random} from 'remotion';
import {COLORS, FONTS, TEXTS} from '../config';

type Props = {
  size?: number;
  /** 0..1: het zegel komt los (iets omhoog, meer schaduw, licht dat over de lak glijdt) */
  loosen: number;
  initial?: string;
};

// Grillige lakrand: een cirkel met kleine, vaste afwijkingen.
const blobPath = (r: number, cx: number, cy: number) => {
  const steps = 48;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const wobble =
      Math.sin(a * 5 + 0.7) * 0.025 + Math.sin(a * 9 + 2.1) * 0.018 + (random(`seal-${i}`) - 0.5) * 0.03;
    const rr = r * (1 + wobble);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  // vloeiend sluiten met kwadratische curves door de middens
  let d = '';
  for (let i = 0; i < steps; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % steps];
    const mx = (p[0] + q[0]) / 2;
    const my = (p[1] + q[1]) / 2;
    d += i === 0 ? `M ${mx} ${my}` : ` Q ${p[0]} ${p[1]} ${mx} ${my}`;
  }
  const p0 = pts[0];
  const q0 = pts[1];
  d += ` Q ${p0[0]} ${p0[1]} ${(p0[0] + q0[0]) / 2} ${(p0[1] + q0[1]) / 2} Z`;
  return d;
};

export const WaxSeal: React.FC<Props> = ({size = 150, loosen, initial = TEXTS.invite.sealInitial}) => {
  const c = size / 2;
  const lift = loosen;
  // licht glijdt van linksboven naar rechts over de lak
  const hx = 34 + lift * 30;
  const hy = 28 + lift * 10;
  return (
    <div
      style={{
        width: size,
        height: size,
        transform: `translateY(${-lift * 6}px) rotate(${-lift * 5}deg) scale(${1 + lift * 0.045})`,
        filter: `drop-shadow(0 ${3 + lift * 9}px ${5 + lift * 10}px rgba(30,18,8,${0.55 - lift * 0.1}))`,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="wax" cx={`${hx}%`} cy={`${hy}%`} r="78%">
            <stop offset="0%" stopColor={COLORS.waxLight} />
            <stop offset="45%" stopColor={COLORS.waxMid} />
            <stop offset="100%" stopColor={COLORS.waxDark} />
          </radialGradient>
          <radialGradient id="waxInner" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor={COLORS.waxMid} stopOpacity="0" />
            <stop offset="100%" stopColor={COLORS.waxDark} stopOpacity="0.8" />
          </radialGradient>
          <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset={`${Math.max(0, lift * 100 - 30)}%`} stopColor="#fff" stopOpacity="0" />
            <stop offset={`${lift * 100}%`} stopColor="#FFF4DD" stopOpacity={0.55 * Math.sin(lift * Math.PI)} />
            <stop offset={`${Math.min(100, lift * 100 + 30)}%`} stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={blobPath(c * 0.96, c, c)} fill="url(#wax)" />
        {/* ingedrukte stempelrand */}
        <circle cx={c} cy={c} r={c * 0.66} fill="url(#waxInner)" />
        <circle cx={c} cy={c} r={c * 0.66} fill="none" stroke={COLORS.waxDark} strokeOpacity="0.55" strokeWidth="2.2" />
        <circle cx={c - 0.8} cy={c - 0.8} r={c * 0.66 - 2} fill="none" stroke={COLORS.waxLight} strokeOpacity="0.5" strokeWidth="1" />
        <circle cx={c} cy={c} r={c * 0.56} fill="none" stroke={COLORS.waxDark} strokeOpacity="0.35" strokeWidth="1" strokeDasharray="1.5 3.5" />
        {/* initiaal in reliëf: donkere schaduw rechtsonder, licht linksboven */}
        <text
          x={c + 1.6}
          y={c + 1.8}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily={FONTS.serif}
          fontWeight={500}
          fontSize={size * 0.42}
          fill={COLORS.waxDark}
          opacity={0.75}
        >
          {initial}
        </text>
        <text
          x={c - 1}
          y={c - 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily={FONTS.serif}
          fontWeight={500}
          fontSize={size * 0.42}
          fill={COLORS.waxLight}
          opacity={0.9}
        >
          {initial}
        </text>
        <text
          x={c}
          y={c}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily={FONTS.serif}
          fontWeight={500}
          fontSize={size * 0.42}
          fill={COLORS.waxMid}
        >
          {initial}
        </text>
        <path d={blobPath(c * 0.96, c, c)} fill="url(#sheen)" />
      </svg>
    </div>
  );
};
