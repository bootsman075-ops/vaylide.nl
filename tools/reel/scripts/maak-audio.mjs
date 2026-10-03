// Maakt de geluidslagen van de Reel (zelf gegenereerd, dus zonder rechten van anderen):
//   public/audio/muziek.wav  zachte piano, warme pad en een rustige cinematische zwelling
//   public/audio/papier.wav  zegel dat loskomt, flap die opengaat, kaart die eruit schuift
//   public/audio/glans.wav   heel zachte glinstering bij de gloed
//   public/audio/klokje.wav  klein, helder klokje als het logo verschijnt
// Vervang ze gerust door een eigen (gelicenseerde) soundtrack met dezelfde bestandsnamen,
// of pas de bestanden en volumes aan in src/config.ts (AUDIO).
// Gebruik: node scripts/maak-audio.mjs

import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'audio');

// Dezelfde tijden als het beeld (src/timing.json)
const TIMING = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'timing.json'), 'utf8'));
const T = {
  sealCrack: TIMING.sound.sealCrack,
  flapStart: TIMING.flapOpen.start,
  flapEnd: TIMING.flapOpen.end,
  cardStart: TIMING.cardRise.start,
  cardEnd: TIMING.cardRise.end,
  glowStart: TIMING.innerGlow.start,
  glowPeak: TIMING.sound.glowPeak,
  glowEnd: TIMING.innerGlow.end + 0.2,
  logo: TIMING.sound.chime,
  sparkle: (TIMING.sparkle.start + TIMING.sparkle.end) / 2,
  scene4: TIMING.scene4.start,
};
const DURATION = TIMING.scene4.end;
const N = Math.ceil(SR * DURATION);

// Vaste toevalsgenerator, zodat elke keer hetzelfde geluid ontstaat
let seed = 20261003;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

const note = (name) => {
  const m = /^([A-G])(#?)(\d)$/.exec(name);
  const base = {C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2}[m[1]] + (m[2] ? 1 : 0);
  return 440 * Math.pow(2, (base + (Number(m[3]) - 4) * 12) / 12);
};

const stereo = () => [new Float32Array(N), new Float32Array(N)];
const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const bell = (t, start, peak, end) =>
  t < start || t > end ? 0 : t < peak ? smooth((t - start) / (peak - start)) : 1 - smooth((t - peak) / (end - peak));

const addPanned = (buf, i, v, pan) => {
  if (i < 0 || i >= N) return;
  const a = (pan + 1) * Math.PI / 4;
  buf[0][i] += v * Math.cos(a);
  buf[1][i] += v * Math.sin(a);
};

// Eenvoudige galm (Schroeder): kamfilters en allpass per kanaal
const reverb = (buf, wet = 0.3, size = 1) => {
  const combs = [1557, 1617, 1491, 1422, 1277, 1356].map((d) => Math.round(d * size));
  const allp = [225, 556, 441].map((d) => Math.round(d * size));
  const out = stereo();
  for (let ch = 0; ch < 2; ch++) {
    const x = buf[ch];
    const spread = ch * 23;
    const acc = new Float32Array(N);
    for (const d0 of combs) {
      const d = d0 + spread;
      const line = new Float32Array(d);
      let idx = 0;
      let lp = 0;
      for (let i = 0; i < N; i++) {
        const y = line[idx];
        lp = y * 0.7 + lp * 0.3; // demping van hoge tonen
        line[idx] = x[i] + lp * 0.84;
        idx = (idx + 1) % d;
        acc[i] += y;
      }
    }
    let y = acc;
    for (const d0 of allp) {
      const d = d0 + spread;
      const line = new Float32Array(d);
      const o = new Float32Array(N);
      let idx = 0;
      for (let i = 0; i < N; i++) {
        const b = line[idx];
        const v = y[i] + b * 0.5;
        line[idx] = v;
        o[i] = b - v * 0.5;
        idx = (idx + 1) % d;
      }
      y = o;
    }
    for (let i = 0; i < N; i++) out[ch][i] = x[i] * (1 - wet) + (y[i] / combs.length) * wet * 2.2;
  }
  return out;
};

const lowpass = (x, cutoffAt) => {
  const y = new Float32Array(x.length);
  let s = 0;
  for (let i = 0; i < x.length; i++) {
    const fc = cutoffAt(i / SR);
    const a = 1 - Math.exp((-2 * Math.PI * fc) / SR);
    s += a * (x[i] - s);
    y[i] = s;
  }
  return y;
};

const highpass = (x, fc) => {
  const y = new Float32Array(x.length);
  const a = Math.exp((-2 * Math.PI * fc) / SR);
  let prevX = 0;
  let prevY = 0;
  for (let i = 0; i < x.length; i++) {
    prevY = a * (prevY + x[i] - prevX);
    prevX = x[i];
    y[i] = prevY;
  }
  return y;
};

const finish = (buf, peak = 0.7, fadeIn = 0.02) => {
  // geen dreun of gelijkspanning onder ~40 Hz (twee keer filteren = steilere flank)
  buf = buf.map((ch) => highpass(highpass(ch, 40), 40));
  let max = 0;
  for (const ch of buf) for (const v of ch) max = Math.max(max, Math.abs(v));
  const g = max > 0 ? peak / max : 1;
  for (const ch of buf) {
    for (let i = 0; i < N; i++) {
      const t = i / SR;
      const fi = Math.min(1, t / fadeIn);
      const fo = Math.min(1, (DURATION - t) / 0.25);
      ch[i] *= g * fi * fo;
    }
  }
  return buf;
};

const writeWav = (name, buf) => {
  const data = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    for (let ch = 0; ch < 2; ch++) {
      const v = Math.max(-1, Math.min(1, buf[ch][i]));
      data.writeInt16LE(Math.round(v * 32767), i * 4 + ch * 2);
    }
  }
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 4, 28);
  h.writeUInt16LE(4, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(data.length, 40);
  mkdirSync(OUT, {recursive: true});
  writeFileSync(join(OUT, name), Buffer.concat([h, data]));
  console.log('gemaakt:', join('public', 'audio', name));
};

// ---------------------------------------------------------------- muziek
const music = () => {
  const buf = stereo();
  // Warme pad: D-majeur 9, bij het logo zacht naar G-majeur 9 boven D
  const chordA = ['D3', 'A3', 'E4', 'F#4', 'C#5'].map(note);
  const chordB = ['D3', 'G3', 'D4', 'F#4', 'B4'].map(note);
  const pad = new Float32Array(N);
  const padR = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const toB = smooth((t - (T.scene4 - 0.05)) / 0.5);
    let l = 0;
    let r = 0;
    for (let v = 0; v < 5; v++) {
      for (const [chord, w] of [[chordA, 1 - toB], [chordB, toB]]) {
        if (w <= 0) continue;
        const f = chord[v];
        const lfo = 1 + 0.12 * Math.sin(2 * Math.PI * (0.23 + v * 0.07) * t + v);
        const s1 = Math.sin(2 * Math.PI * f * 1.0017 * t + v);
        const s2 = Math.sin(2 * Math.PI * f * 0.9983 * t + v * 2);
        const h2 = 0.18 * Math.sin(2 * Math.PI * f * 2 * t + v * 3);
        l += w * lfo * (s1 + h2) * (v === 0 ? 0.8 : 0.45);
        r += w * lfo * (s2 + h2) * (v === 0 ? 0.8 : 0.45);
      }
    }
    // dynamiek: zacht beginnen, zwellen bij het openen, ruimte bij het logo
    const env = 0.25 + 0.35 * smooth(t / 1.4) + 0.4 * bell(t, 1.9, 2.9, 4.4) + 0.22 * smooth((t - 4.2) / 0.6);
    pad[i] = l * env;
    padR[i] = r * env;
  }
  const cutoff = (t) => 500 + 1300 * bell(t, 1.8, 2.9, 4.3) + 500 * smooth((t - 4.2) / 0.8);
  const pl = lowpass(lowpass(pad, cutoff), cutoff);
  const pr = lowpass(lowpass(padR, cutoff), cutoff);
  for (let i = 0; i < N; i++) {
    buf[0][i] += pl[i] * 0.09;
    buf[1][i] += pr[i] * 0.09;
  }

  // Lage, warme zwelling (geen dreun): sinus op D2 en gefilterde ruis die opkomt
  const swellNoise = new Float32Array(N);
  for (let i = 0; i < N; i++) swellNoise[i] = rnd() * 2 - 1;
  const sn = lowpass(lowpass(swellNoise, (t) => 300 + 2200 * bell(t, 1.9, 2.85, 3.8)), () => 3000);
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const e = bell(t, 1.7, 2.85, 4.0);
    const sub = Math.sin(2 * Math.PI * note('D2') * t) * 0.12 * e;
    buf[0][i] += sub + sn[i] * 0.05 * e;
    buf[1][i] += sub + sn[(i + 37) % N] * 0.05 * e;
  }

  // Zachte piano
  const notes = [
    [0.3, 'D4', 0.3], [0.3, 'A4', 0.32],
    [1.3, 'E5', 0.26],
    [2.05, 'F#5', 0.28],
    [2.8, 'D5', 0.32], [2.8, 'A4', 0.24],
    [3.55, 'C#5', 0.24],
    [4.28, 'G3', 0.26], [4.28, 'D4', 0.26], [4.3, 'B4', 0.3],
    [4.5, 'F#5', 0.26],
  ];
  for (const [start, name, vel] of notes) {
    const f = note(name);
    const pan = Math.max(-0.6, Math.min(0.6, (Math.log2(f / 440)) * 0.35));
    const i0 = Math.round(start * SR);
    const len = Math.round(3.2 * SR);
    for (let k = 0; k < len; k++) {
      const t = k / SR;
      const att = Math.min(1, t / 0.006);
      let v = 0;
      for (let n = 1; n <= 8; n++) {
        const fn = n * f * Math.sqrt(1 + 0.0004 * n * n);
        if (fn > 9000) break;
        const amp = 1 / Math.pow(n, 1.4);
        const dec = Math.exp(-t * (0.9 + n * 0.75));
        v += amp * dec * Math.sin(2 * Math.PI * fn * t + n);
      }
      // een vleugje 'hamer'
      const hammer = k < 400 ? (rnd() * 2 - 1) * 0.02 * (1 - k / 400) : 0;
      addPanned(buf, i0 + k, (v * att * 0.22 + hammer) * vel, pan);
    }
  }
  return finish(reverb(buf, 0.38, 1.1), 0.72, 0.4);
};

// ---------------------------------------------------------------- papier
const paper = () => {
  const raw = new Float32Array(N);
  const rawR = new Float32Array(N);
  const grain = (t0, dur, amp, pan) => {
    const i0 = Math.round(t0 * SR);
    const len = Math.round(dur * SR);
    for (let k = 0; k < len; k++) {
      const e = Math.sin((Math.PI * k) / len) ** 2;
      const v = (rnd() * 2 - 1) * amp * e;
      const i = i0 + k;
      if (i >= N) break;
      raw[i] += v * (1 - pan) * 0.5 + v * 0.5;
      rawR[i] += v * (1 + pan) * 0.5 + v * 0.5;
    }
  };
  // zegel dat loskomt: een paar korte, droge tikjes
  for (let k = 0; k < 7; k++) grain(T.sealCrack + k * 0.018 + rnd() * 0.01, 0.006 + rnd() * 0.01, 0.5 + rnd() * 0.4, rnd() * 0.4 - 0.2);
  // flap die opengaat: geritsel waarvan de dichtheid de beweging volgt
  for (let t = T.flapStart; t < T.flapEnd + 0.2; t += 0.004) {
    const d = bell(t, T.flapStart, (T.flapStart + T.flapEnd) / 2, T.flapEnd + 0.2);
    if (rnd() < d * 0.55) grain(t, 0.01 + rnd() * 0.04, 0.12 + 0.3 * d * rnd(), rnd() * 0.6 - 0.3);
  }
  // kaart die uit de envelop schuift: zacht, glad schuren
  for (let i = Math.round(T.cardStart * SR); i < Math.min(N, Math.round((T.cardEnd + 0.1) * SR)); i++) {
    const t = i / SR;
    const e = bell(t, T.cardStart, T.cardStart + 0.3, T.cardEnd + 0.1) * 0.16;
    raw[i] += (rnd() * 2 - 1) * e;
    rawR[i] += (rnd() * 2 - 1) * e;
  }
  const l = lowpass(highpass(raw, 700), () => 5200);
  const r = lowpass(highpass(rawR, 700), () => 5200);
  return finish(reverb([l, r], 0.2, 0.6), 0.6, 0.005);
};

// ---------------------------------------------------------------- glans
const shimmer = () => {
  const buf = stereo();
  const scale = ['D6', 'E6', 'F#6', 'A6', 'B6', 'D7', 'E7'].map(note);
  for (let t = T.glowStart; t < T.glowEnd; t += 0.02) {
    const d = bell(t, T.glowStart, T.glowPeak, T.glowEnd);
    if (rnd() > d * 0.28) continue;
    const f = scale[Math.floor(rnd() * scale.length)];
    const amp = 0.05 + rnd() * 0.08;
    const pan = rnd() * 1.4 - 0.7;
    const i0 = Math.round(t * SR);
    const len = Math.round(0.9 * SR);
    for (let k = 0; k < len; k++) {
      const tt = k / SR;
      const e = Math.min(1, tt / 0.03) * Math.exp(-tt * 4.5);
      addPanned(buf, i0 + k, Math.sin(2 * Math.PI * f * tt) * e * amp, pan);
    }
  }
  // ademende lucht erboven
  const air = new Float32Array(N);
  for (let i = 0; i < N; i++) air[i] = rnd() * 2 - 1;
  const airF = lowpass(highpass(air, 6000), () => 11000);
  for (let i = 0; i < N; i++) {
    const e = bell(i / SR, T.glowStart, T.glowPeak, T.glowEnd + 0.3) * 0.05;
    buf[0][i] += airF[i] * e;
    buf[1][i] += airF[(i + 101) % N] * e;
  }
  return finish(reverb(buf, 0.45, 1.3), 0.6, 0.01);
};

// ---------------------------------------------------------------- klokje
const chime = () => {
  const buf = stereo();
  const strike = (t0, f, amp, pan) => {
    const partials = [[1, 1, 1.4], [2.0, 0.42, 2.2], [2.76, 0.3, 2.8], [4.07, 0.16, 3.6], [5.4, 0.08, 4.6]];
    const i0 = Math.round(t0 * SR);
    for (let k = 0; k < N - i0; k++) {
      const t = k / SR;
      const att = Math.min(1, t / 0.004);
      let v = 0;
      for (const [ratio, a, dec] of partials) v += a * Math.exp(-t * dec) * Math.sin(2 * Math.PI * f * ratio * t);
      addPanned(buf, i0 + k, v * att * amp, pan);
    }
  };
  strike(T.logo, note('D6'), 0.5, -0.1);
  strike(T.logo + 0.006, note('A6'), 0.18, 0.15);
  strike(T.sparkle, note('F#7'), 0.1, 0.3); // heel klein, bij de sparkle
  return finish(reverb(buf, 0.42, 1.2), 0.62, 0.002);
};

writeWav('muziek.wav', music());
writeWav('papier.wav', paper());
writeWav('glans.wav', shimmer());
writeWav('klokje.wav', chime());
