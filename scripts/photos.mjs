/* Photo pipeline: turns source images into responsive AVIF/WebP/JPEG sets.
   Usage:  node scripts/photos.mjs [sourceDir]      (default: photos-src/)
   Input:  photos-src/<key>.jpg|png   where <key> is a slot listed in js/data/photos.js
   Output: assets/img/photos/<key>-{800,1400,2200}.{avif,webp,jpg}
   Slots with a fixed aspect ratio are cropped here (see CROPS) so the browser
   never downloads pixels it will hide behind object-fit. `focus` is the
   vertical focal point (0 = top, 1 = bottom) used when cropping. */
import { readdir, mkdir } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';

const CROPS = {
  'hero':          { ratio: 16 / 9, focus: .62 },
  'curse':         { ratio: 21 / 9, focus: .56 },
  'era-arapaho':   { ratio: 9 / 11, focus: .5 },
  'era-railroad':  { ratio: 9 / 11, focus: .5 },
  'era-plat':      { ratio: 9 / 11, focus: .5 },
  'era-district':  { ratio: 9 / 11, focus: .5 },
  'grange':        { ratio: 1, focus: .5 }
};

const src = process.argv[2] || 'photos-src';
const out = 'assets/img/photos';
const widths = [800, 1400, 2200];
await mkdir(out, { recursive: true });
const files = (await readdir(src)).filter(f => /\.(jpe?g|png|tiff?)$/i.test(f));
if (!files.length) { console.log(`No source images in ${src}/`); process.exit(0); }
for (const f of files) {
  const key = basename(f, extname(f));
  let img = sharp(join(src, f)).rotate();
  let { width, height } = await img.metadata();
  const crop = CROPS[key];
  if (crop) {
    let cw = width, ch = Math.round(width / crop.ratio);
    if (ch > height) { ch = height; cw = Math.round(height * crop.ratio); }
    const left = Math.round((width - cw) / 2);
    const top = Math.round(Math.min(Math.max(height * crop.focus - ch / 2, 0), height - ch));
    img = sharp(await img.extract({ left, top, width: cw, height: ch }).toBuffer());
    width = cw; height = ch;
  }
  const made = [];
  for (const w of widths) {
    if (width < w && w !== widths[0]) continue;
    const r = img.clone().resize({ width: w, withoutEnlargement: true });
    await r.clone().avif({ quality: 55 }).toFile(join(out, `${key}-${w}.avif`));
    await r.clone().webp({ quality: 78 }).toFile(join(out, `${key}-${w}.webp`));
    await r.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(join(out, `${key}-${w}.jpg`));
    made.push(w);
  }
  console.log(`✓ ${key}  ${width}×${height}${crop ? ' (cropped)' : ''} → ${made.join('/')}w`);
}
console.log(`\nNow list each key in js/data/photos.js to switch that slot from illustration to photo.`);
