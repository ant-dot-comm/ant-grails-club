// Compresses the source glTF models in models-src/ into .glb files under public/models/:
// textures capped at 1024 px and converted to WebP, geometry compressed with meshopt.
// Run after exporting from Blender: npm run models
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

// Each car's showroom and game model, same path in models-src/ and public/models/
const models = Object.fromEntries(
  ['AM95', 'B1', 'J4', 'J7', 'J9', 'J11', 'J12', 'Presto', 'Shox']
    .flatMap((car) => [`${car}/${car}.glb`, `${car}/${car}_game.glb`])
    .map((file) => [file, file]),
);

const MAX_TEXTURE = '1024' // baked AO and normal maps are soft; 1024 is plenty
const WEBP_QUALITY = '90'
// Finer than the defaults (14 / 10 bits) so thin layered parts don't cross and smooth surfaces stay smooth
const POSITION_BITS = '16'
const NORMAL_BITS = '12'

const run = (...args) => execFileSync('gltf-transform', args, { stdio: 'inherit' });
const work = mkdtempSync(join(tmpdir(), 'models-'));

try {
  for (const [src, out] of Object.entries(models)) {
    const output = `public/models/${out}`;
    mkdirSync(dirname(output), { recursive: true });
    const resized = join(work, 'resized.glb');
    const webp = join(work, 'webp.glb');
    run('resize', `models-src/${src}`, resized, '--width', MAX_TEXTURE, '--height', MAX_TEXTURE);
    run('webp', resized, webp, '--quality', WEBP_QUALITY);
    run('meshopt', webp, output, '--quantize-position', POSITION_BITS, '--quantize-normal', NORMAL_BITS);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
