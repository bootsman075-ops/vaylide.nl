import {Config} from '@remotion/cli/config';

// Instagram Reels: H.264, hoge kwaliteit. Lagere CRF = scherper (en groter bestand).
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
Config.setColorSpace('bt709'); // standaard videobereik, zoals Instagram verwacht
Config.setAudioCodec('aac');
Config.setOverwriteOutput(true);
// In deze werkomgeving staat Chromium al klaar; elders laat Remotion zelf een browser downloaden.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
