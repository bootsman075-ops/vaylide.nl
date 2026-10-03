import {continueRender, delayRender, staticFile} from 'remotion';
import {ASSETS} from '../config';

// Laadt de lettertypen uit public/fonts voordat er een frame wordt gemaakt.
let loaded = false;

export const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('Lettertypen laden');
  const faces = [
    new FontFace('Cormorant Garamond', `url(${staticFile(ASSETS.fonts.serif)}) format("woff2")`, {weight: '300 700'}),
    new FontFace('Cormorant Garamond', `url(${staticFile(ASSETS.fonts.serifItalic)}) format("woff2")`, {weight: '300 700', style: 'italic'}),
    new FontFace('Pinyon Script', `url(${staticFile(ASSETS.fonts.script)}) format("woff2")`),
  ];
  Promise.all(faces.map((f) => f.load()))
    .then((list) => {
      list.forEach((f) => document.fonts.add(f));
      continueRender(handle);
    })
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
