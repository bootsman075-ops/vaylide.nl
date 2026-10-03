import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

// Heel lichte filmkorrel en een warme vignet. De korrel wisselt elke twee frames, net als echte film.
export const FilmGrain: React.FC<{amount?: number}> = ({amount = 0.07}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 12;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 75% 60% at 50% 50%, transparent 55%, rgba(5,4,3,0.55) 100%)',
        }}
      />
      <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: amount, mixBlendMode: 'overlay'}}>
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
