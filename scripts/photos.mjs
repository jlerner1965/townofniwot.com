/* Photo pipeline: turns source images into responsive AVIF/WebP/JPEG sets.
   Usage:  node scripts/photos.mjs [sourceDir]      (default: photos-src/)
   Input:  photos-src/<key>.jpg|png   where <key> is one of the slots listed in js/data/photos.js
   Output: assets/img/photos/<key>-{800,1400,2200}.{avif,webp,jpg}
   Then add an entry to js/data/photos.js, e.g.
     'second-avenue': { widths: [800, 1400, 2200], sizes: '(min-width: 1100px) 60vw, 100vw', fallback: 'assets/img/photos/second-avenue-1400.jpg' } */
import { readdir, mkdir } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';

const src = process.argv[2] || 'photos-src';
const out = 'assets/img/photos';
const widths = [800, 1400, 2200];
await mkdir(out, { recursive: true });
const files = (await readdir(src)).filter(f => /\.(jpe?g|png|tiff?)$/i.test(f));
if (!files.length) { console.log(`No source images in ${src}/`); process.exit(0); }
for (const f of files) {
  const key = basename(f, extname(f));
  const img = sharp(join(src, f)).rotate();
  const meta = await img.metadata();
  for (const w of widths) {
    if (meta.width && meta.width < w && w !== widths[0]) continue;
    const r = img.clone().resize({ width: w, withoutEnlargement: true });
    await r.clone().avif({ quality: 55 }).toFile(join(out, `${key}-${w}.avif`));
    await r.clone().webp({ quality: 78 }).toFile(join(out, `${key}-${w}.webp`));
    await r.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(join(out, `${key}-${w}.jpg`));
  }
  console.log(`✓ ${key}  (${meta.width}×${meta.height} → ${widths.join('/')}w)`);
}
console.log(`\nNow list each key in js/data/photos.js to switch that slot from illustration to photo.`);
