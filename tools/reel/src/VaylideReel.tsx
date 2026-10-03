import React from 'react';
import {AbsoluteFill, Html5Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {BrandEndCard} from './components/BrandEndCard';
import {ENVELOPE, Envelope} from './components/Envelope';
import {FilmGrain} from './components/FilmGrain';
import {Glow} from './components/Glow';
import {Particles} from './components/Particles';
import {PhoneInvitation} from './components/PhoneInvitation';
import {AUDIO, CAMERA_KEYS, COLORS, FONTS, FORMAT, TEXTS, TIMING} from './config';
import {EASE, mix, progress, smoothKeys, softReveal} from './lib/anim';
import {loadFonts} from './lib/fonts';

loadFonts();

// Plek van de envelop op het beeld (midden), in pixels.
const ENV_CENTER = {x: 540, y: 1060};

export const VaylideReel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FORMAT.fps;
  const T = TIMING;

  // --- Scène 1: envelop komt uit het donker
  const reveal = progress(frame, T.envelopeReveal.start, T.envelopeReveal.end, EASE.out);
  const darkness = interpolate(t, [0, 1.1], [1, 0], {extrapolateRight: 'clamp', easing: EASE.inOut});
  const rim = progress(frame, 0.5, 1.6, EASE.inOut);

  // --- Scène 2: zegel, flap, gloed
  const sealLoosen = progress(frame, T.sealLoosen.start, T.sealLoosen.end, EASE.inOut);
  const flapOpen = progress(frame, T.flapOpen.start, T.flapOpen.end, EASE.flap);
  const glow = smoothKeys(t, [
    [T.innerGlow.start, 0],
    [2.35, 0.85],
    [2.85, 1],
    [3.4, 0.6],
    [3.9, 0.28],
    [T.phoneExit.end, 0],
  ]);
  const tiltX = smoothKeys(t, [
    [0, 12],
    [1.3, 6],
    [2.5, 2],
    [3.0, 0],
  ]);

  // --- Scène 3: kaart omhoog en naar telefoon
  const rise = progress(frame, T.cardRise.start, T.cardRise.end, EASE.inOut);
  const envExit = progress(frame, T.envelopeExit.start, T.envelopeExit.end, EASE.inOut);
  const morph = progress(frame, T.cardToPhone.start, T.cardToPhone.end, EASE.cine);
  const sheen = progress(frame, 2.8, 3.4, EASE.inOut);
  const float = progress(frame, T.cardRise.end - 0.2, T.cardRise.end + 0.4, EASE.inOut);
  const cardY = 260 - 290 * rise - 40 * morph + Math.sin(t * 2.1) * 6 * float;
  const cardRot = Math.sin(t * 1.6 + 0.6) * 0.6 * float * (1 - morph * 0.6);
  const morphTurn = Math.sin(morph * Math.PI) * 5; // kleine draai in de diepte tijdens de overgang

  const textIn = progress(frame, T.scene3Text.in, T.scene3Text.hold - 0.15, EASE.out);
  const textOut = progress(frame, T.scene3Text.out - 0.35, T.scene3Text.out, EASE.inOut);

  // --- Scène 4: telefoon vervaagt, logo verschijnt
  const phoneExit = progress(frame, T.phoneExit.start, T.phoneExit.end, EASE.inOut);
  const endCard = progress(frame, T.logoIn.start - 0.1, T.logoIn.end - 0.05, EASE.out);
  const logo = progress(frame, T.logoIn.start, T.logoIn.end, EASE.out);
  const endSheen = progress(frame, T.logoIn.start + 0.2, T.fadeOut.end, EASE.inOut);
  const line = progress(frame, T.endLineIn.start, T.endLineIn.end, EASE.out);
  const url = progress(frame, T.urlIn.start, T.urlIn.end, EASE.out);
  const sparkle = progress(frame, T.sparkle.start, T.sparkle.end, EASE.inOut);
  const fadeOut = progress(frame, T.fadeOut.start, T.fadeOut.end, EASE.inOut);

  // Camera
  const camScale = smoothKeys(t, CAMERA_KEYS.map(([s, sc]) => [s, sc]));
  const camY = smoothKeys(t, CAMERA_KEYS.map(([s, , y]) => [s, y]));

  const endVolume = (f: number) =>
    interpolate(f / FORMAT.fps, [T.fadeOut.start - 0.1, FORMAT.durationInSeconds], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bgDeep, overflow: 'hidden'}}>
      {/* achtergrond: warm, donker, met diepte */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 52%, ${COLORS.bgLift} 0%, ${COLORS.bgWarm} 45%, ${COLORS.bgDeep} 100%)`,
        }}
      />
      <Glow intensity={0.35 + glow * 0.25} x={540} y={1000} width={1300} height={1500} color="#3A2A1C" core="#4A3624" blur={60} />

      {/* deeltjes: bewegen iets mee met de camera (parallax) */}
      <AbsoluteFill style={{transform: `scale(${1 + (camScale - 1) * 0.4}) translateY(${camY * 0.3}px)`}}>
        <Particles lift={glow} opacity={0.6 + reveal * 0.4} />
      </AbsoluteFill>

      {/* camera */}
      <AbsoluteFill style={{transform: `translateY(${camY}px) scale(${camScale})`, transformOrigin: '50% 50%'}}>
        <div
          style={{
            position: 'absolute',
            left: ENV_CENTER.x - ENVELOPE.width / 2,
            top: ENV_CENTER.y - ENVELOPE.height / 2,
            perspective: 2200,
            ...softReveal(reveal, {y: 60, blur: 22, scale: 0.9}),
          }}
        >
          <div style={{transform: `rotateX(${tiltX}deg)`, transformStyle: 'preserve-3d'}}>
            <Envelope sealLoosen={sealLoosen} flapOpen={flapOpen} glow={glow} exit={envExit} rim={rim}>
              <div
                style={{
                  position: 'absolute',
                  left: ENVELOPE.width / 2,
                  top: cardY,
                  width: 0,
                  height: 0,
                  perspective: 1800,
                }}
              >
                <div
                  style={{
                    transform: `rotateZ(${cardRot}deg) rotateY(${morphTurn}deg) translateY(${-phoneExit * 30}px) scale(${mix(1, 0.94, phoneExit)})`,
                    opacity: 1 - phoneExit,
                    filter: phoneExit > 0 ? `blur(${(phoneExit * 10).toFixed(2)}px)` : undefined,
                  }}
                >
                  <PhoneInvitation morph={morph} sheen={sheen < 1 && sheen > 0 ? sheen : -1} />
                </div>
              </div>
            </Envelope>
          </div>
        </div>

        {/* licht dat uit de envelop omhoog stroomt */}
        <div style={{position: 'absolute', inset: 0, opacity: glow * (1 - envExit * 0.6), mixBlendMode: 'screen'}}>
          {[-150, -70, 0, 80, 160].map((dx, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: ENV_CENTER.x + dx - 40,
                top: ENV_CENTER.y - ENVELOPE.height / 2 - 620,
                width: 80 + (i % 2) * 40,
                height: 640,
                background: `linear-gradient(0deg, rgba(231,215,188,0.28), rgba(200,164,107,0.08) 55%, transparent)`,
                transform: `rotate(${dx * 0.05}deg)`,
                transformOrigin: '50% 100%',
                filter: 'blur(26px)',
              }}
            />
          ))}
          <Glow intensity={0.75} x={ENV_CENTER.x} y={ENV_CENTER.y - ENVELOPE.height / 2 + 10} width={900} height={420} blur={40} />
        </div>
      </AbsoluteFill>

      {/* zachte bloom over het hele beeld als het licht op zijn sterkst is */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 60% 45% at 50% 48%, rgba(231,215,188,0.16), transparent 70%)',
          opacity: glow,
          mixBlendMode: 'screen',
        }}
      />

      {/* scène 3: tekst */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 255,
          textAlign: 'center',
          fontFamily: FONTS.serif,
          fontWeight: 300,
          fontSize: 56,
          letterSpacing: 0.5,
          color: COLORS.text,
          textShadow: '0 0 30px rgba(0,0,0,0.6)',
          ...softReveal(textIn, {y: 22, blur: 12, scale: 1}),
          opacity: textIn * (1 - textOut),
          filter: `blur(${(12 * (1 - textIn) + 8 * textOut).toFixed(2)}px)`,
        }}
      >
        {TEXTS.scene3Line}
      </div>

      {/* scène 4: logo en afsluiting */}
      <BrandEndCard card={endCard} logo={logo} sheen={endSheen} line={line} url={url} sparkle={sparkle} />

      <FilmGrain />

      {/* uit het donker en weer terug */}
      <AbsoluteFill style={{backgroundColor: COLORS.bgDeep, opacity: Math.max(darkness * 0.85, fadeOut), pointerEvents: 'none'}} />

      <Html5Audio src={staticFile(AUDIO.music.src)} volume={(f) => AUDIO.music.volume * endVolume(f)} />
      <Html5Audio src={staticFile(AUDIO.paper.src)} volume={(f) => AUDIO.paper.volume * endVolume(f)} />
      <Html5Audio src={staticFile(AUDIO.shimmer.src)} volume={(f) => AUDIO.shimmer.volume * endVolume(f)} />
      <Html5Audio src={staticFile(AUDIO.chime.src)} volume={(f) => AUDIO.chime.volume * endVolume(f)} />
    </AbsoluteFill>
  );
};
