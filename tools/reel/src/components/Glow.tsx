import React from 'react';
import {COLORS} from '../config';

type Props = {
  intensity: number; // 0..1
  x: number; // midden in px
  y: number;
  width: number;
  height?: number;
  color?: string;
  core?: string;
  blur?: number;
};

// Zachte warme gloed (als ochtendlicht), opgeteld bij wat eronder ligt. Geen harde rand, geen flits.
export const Glow: React.FC<Props> = ({
  intensity,
  x,
  y,
  width,
  height = width,
  color = COLORS.gold,
  core = COLORS.cream,
  blur = 30,
}) => {
  if (intensity <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - width / 2,
        top: y - height / 2,
        width,
        height,
        borderRadius: '50%',
        background: `radial-gradient(closest-side, ${core} 0%, ${color}AA 28%, ${color}33 60%, transparent 100%)`,
        opacity: intensity,
        mixBlendMode: 'screen',
        filter: `blur(${blur}px)`,
        pointerEvents: 'none',
      }}
    />
  );
};
