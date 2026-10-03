import React from 'react';
import {Composition} from 'remotion';
import {FORMAT} from './config';
import {VaylideReel} from './VaylideReel';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="VaylideReel"
    component={VaylideReel}
    durationInFrames={Math.round(FORMAT.durationInSeconds * FORMAT.fps)}
    fps={FORMAT.fps}
    width={FORMAT.width}
    height={FORMAT.height}
  />
);
