import {Easing, interpolate} from 'remotion';
import {FORMAT} from '../config';

// Rustige, natuurlijke curves (cubic-bezier). Geen bounce.
export const EASE = {
  // zacht in en uit, voor de meeste bewegingen
  inOut: Easing.bezier(0.45, 0, 0.2, 1),
  // komt snel op gang en landt heel zacht (onthullingen)
  out: Easing.bezier(0.16, 1, 0.3, 1),
  // filmisch: lang aanloop, lange uitloop
  cine: Easing.bezier(0.65, 0, 0.25, 1),
  in: Easing.bezier(0.5, 0, 0.75, 0),
  // papier dat opengaat: rustig los, gelijkmatig door het midden, zacht neerleggen
  flap: Easing.bezier(0.42, 0, 0.28, 1),
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Voortgang 0..1 tussen twee tijden (seconden), met een curve. */
export const progress = (
  frame: number,
  start: number,
  end: number,
  easing: (t: number) => number = EASE.inOut,
) => interpolate(frame / FORMAT.fps, [start, end], [0, 1], {...clamp, easing});

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Vloeiende curve door sleutelpunten (monotone Hermite): geen stilstand bij elk punt
 * en geen overschieten. `keys` = [[tijd, waarde], ...] met oplopende tijden.
 */
export const smoothKeys = (t: number, keys: Array<[number, number]>) => {
  if (t <= keys[0][0]) return keys[0][1];
  const last = keys[keys.length - 1];
  if (t >= last[0]) return last[1];
  const n = keys.length;
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    d.push((keys[i + 1][1] - keys[i][1]) / (keys[i + 1][0] - keys[i][0]));
  }
  const m: number[] = new Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  }
  // begin en eind vertrekken en landen in rust
  m[0] = 0;
  m[n - 1] = 0;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const k = 3 / Math.sqrt(s);
      m[i] = k * a * d[i];
      m[i + 1] = k * b * d[i];
    }
  }
  let i = 0;
  while (t > keys[i + 1][0]) i++;
  const [t0, v0] = keys[i];
  const [t1, v1] = keys[i + 1];
  const h = t1 - t0;
  const u = (t - t0) / h;
  const u2 = u * u;
  const u3 = u2 * u;
  return (
    (2 * u3 - 3 * u2 + 1) * v0 +
    (u3 - 2 * u2 + u) * h * m[i] +
    (-2 * u3 + 3 * u2) * v1 +
    (u3 - u2) * h * m[i + 1]
  );
};

/** Zachte onthulling: dekking, schaal, vervaging en een kleine verticale beweging samen. */
export const softReveal = (t: number, {y = 24, blur = 14, scale = 0.96} = {}) => ({
  opacity: t,
  transform: `translateY(${mix(y, 0, t)}px) scale(${mix(scale, 1, t)})`,
  filter: `blur(${mix(blur, 0, t).toFixed(2)}px)`,
});
