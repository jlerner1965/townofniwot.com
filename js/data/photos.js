/* Photo manifest. Illustrations render by default; add an entry here after
   dropping files into assets/img/photos/ and the site upgrades that slot to
   a responsive <picture> with AVIF + WebP sources.

   Keys: hero, second-avenue, cottonwood-square, grange, whistle-stop,
         art-walk, era-arapaho, era-railroad, era-plat, era-district

   Single file:   'grange': { fallback: 'assets/img/photos/grange.jpg' }
     → expects assets/img/photos/grange.avif and grange.webp
   Responsive:    'second-avenue': { widths: [800, 1400, 2200], sizes: '(min-width: 1100px) 60vw, 100vw', fallback: 'assets/img/photos/second-avenue-1400.jpg' }
     → expects second-avenue-800.avif, -1400.avif, -2200.avif and the same in .webp

   Run `npm run photos` to generate every size and format from a folder of
   source JPGs (see README). */
export const photos = {};
