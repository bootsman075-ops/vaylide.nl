import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {COLORS, FORMAT, PARTICLES} from '../config';

type Props = {
  /** totale zichtbaarheid 0..1 */
  opacity?: number;
  /** extra helderheid rond de envelop als die opent */
  lift?: number;
};

// Kleine warme lichtdeeltjes en zachte bokeh. Alles beweegt traag en voorspelbaar (vaste seed),
// zodat elk frame bij opnieuw renderen gelijk blijft.
export const Particles: React.FC<Props> = ({opacity = 1, lift = 0}) => {
  const frame = useCurrentFrame();
  const t = frame / FORMAT.fps;
  const {width, height} = FORMAT;

  const dots = new Array(PARTICLES.count).fill(0).map((_, i) => {
    const r = (k: string) => random(`${PARTICLES.seed}-p-${i}-${k}`);
    const depth = r('d'); // 0 = ver weg, 1 = dichtbij
    const size = 3 + depth * 7;
    const speed = 14 + depth * 26; // px per seconde, omhoog
    const x0 = r('x') * width;
    const y0 = r('y') * (height + 200);
    const y = ((y0 - speed * t) % (height + 200) + height + 200) % (height + 200) - 100;
    const x = x0 + Math.sin(t * (0.35 + r('w') * 0.4) + r('ph') * 6.28) * (18 + depth * 22);
    const twinkle = 0.55 + 0.45 * Math.sin(t * (0.9 + r('tw') * 1.2) + r('tp') * 6.28);
    // dichter bij het midden iets helderder als de envelop gloeit
    const centerBoost = lift * Math.max(0, 1 - Math.hypot(x - width / 2, y - height * 0.52) / 700);
    const alpha = (0.18 + depth * 0.32) * twinkle * (1 + centerBoost * 1.6);
    return {i, x, y, size, alpha: Math.min(alpha, 0.85), blur: depth > 0.75 ? (depth - 0.75) * 10 : 0};
  });

  const bokeh = new Array(PARTICLES.bokehCount).fill(0).map((_, i) => {
    const r = (k: string) => random(`${PARTICLES.seed}-b-${i}-${k}`);
    const size = 90 + r('s') * 190;
    const x = r('x') * width + Math.sin(t * 0.18 + i) * 30;
    const y = r('y') * height - t * (6 + r('v') * 10);
    const alpha = 0.05 + r('a') * 0.08;
    return {i, x, y, size, alpha};
  });

  return (
    <AbsoluteFill style={{opacity, pointerEvents: 'none'}}>
      {bokeh.map((b) => (
        <div
          key={`b${b.i}`}
          style={{
            position: 'absolute',
            left: b.x - b.size / 2,
            top: b.y - b.size / 2,
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${COLORS.champagne} 0%, ${COLORS.gold}55 45%, transparent 70%)`,
            opacity: b.alpha,
            filter: 'blur(14px)',
          }}
        />
      ))}
      {dots.map((d) => (
        <div
          key={`p${d.i}`}
          style={{
            position: 'absolute',
            left: d.x - d.size / 2,
            top: d.y - d.size / 2,
            width: d.size,
            height: d.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${COLORS.cream} 0%, ${COLORS.champagneDeep} 35%, transparent 72%)`,
            opacity: d.alpha,
            filter: d.blur ? `blur(${d.blur.toFixed(1)}px)` : undefined,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
