// Maakt losse beelden op vaste momenten (out/stills/), om de Reel te controleren zonder hem te bekijken.
// Gebruik: node scripts/stills.mjs [frame frame ...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const frames = process.argv.slice(2).map(Number);
const list = frames.length ? frames : [0, 10, 20, 30, 39, 45, 52, 58, 64, 70, 78, 84, 92, 100, 108, 116, 124, 130, 138, 146, 152, 158, 164];
const browserExecutable = process.env.REMOTION_BROWSER || null;

const serveUrl = await bundle({entryPoint: join(root, 'src', 'index.ts')});
const composition = await selectComposition({serveUrl, id: 'VaylideReel', browserExecutable});
mkdirSync(join(root, 'out', 'stills'), {recursive: true});
for (const frame of list) {
  const output = join(root, 'out', 'stills', `f${String(frame).padStart(3, '0')}.jpg`);
  await renderStill({composition, serveUrl, frame, output, imageFormat: 'jpeg', jpegQuality: 90, browserExecutable});
  console.log(output);
}
