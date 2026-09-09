# TownofNiwot.com

A static site for Niwot, Colorado: an 1873 railroad town beneath the Flatirons, and the legend of the
Niwot Curse. Pristine HTML, vanilla CSS and vanilla JS. No framework, no build step.

```bash
npm install          # only needed for `npm start`, the photo pipeline and audits
npm start            # serves the site at http://127.0.0.1:4173
```

Or open `index.html` from any static host. Everything the page needs is in this repo.

## What is in here

```
index.html            single page, semantic sections, ARIA landmarks
css/
  tokens.css          palette, fluid type scale, spacing, motion variables
  base.css            fonts, reset, typography, focus states, reduced-motion
  components.css      top bar, buttons, bento tiles, directory, schedule, bottom bar
  sections.css        hero, curse, history timeline, avenue, events, art, contact
js/
  main.js             entry point: renders data, upgrades photos, boots modules
  hero-gl.js          hand-written WebGL2 shader for the living Front Range hero
  scroll.js           reveal-on-scroll, counters, GSAP ScrollTrigger choreography
  nav.js              top bar state, active section, mobile bottom bar
  data/timeline.js    history eras (Chief Niwot, 1873, 1875, 1993)
  data/events.js      Rock & Rails schedule (placeholder dates until announced)
  data/places.js      2nd Avenue / Cottonwood Square directory categories
  data/photos.js      photo manifest: which slots have real photography
vendor/               gsap.min.js + ScrollTrigger.min.js, copied from npm
assets/fonts/         Fraunces (display) and Atkinson Hyperlegible (body), self-hosted
assets/img/           original SVG illustrations, one per slot
assets/img/photos/    generated photo sets (see below)
scripts/photos.mjs    turns source JPGs into AVIF/WebP/JPEG responsive sets
```

## Design notes

- **Type.** Fraunces is instanced with its `SOFT=30` and `WONK=1` axes baked in, which gives the
  1870s wood-type feel at 65 KB instead of 121 KB. Optical size and weight stay variable. Body copy is
  Atkinson Hyperlegible.
- **Hero.** A single full-screen WebGL2 fragment shader draws an alpenglow sky cycle, drifting clouds,
  three parallax ridges shaped like the Flatirons, and Left Hand Creek catching light. It pauses when
  off-screen, caps device pixel ratio at 1.5, and falls back to `assets/img/hero-fallback.svg` when WebGL
  is unavailable or the visitor prefers reduced motion.
- **Motion.** The hero intro is pure CSS so nothing waits on JavaScript. GSAP and ScrollTrigger load
  after first paint and add the pinned horizontal history timeline, the word-by-word Curse reveal, the
  parallax and the slide-in comparisons. Every effect degrades to plain visible content.
- **Mobile.** A floating bottom bar with a spring-animated pill tracks the active section and hides on
  scroll-down.
- **Accessibility.** Landmarks, skip link, visible focus rings, `aria-current` on nav, decorative art
  hidden from assistive tech, and full `prefers-reduced-motion` support.

## Adding real photography

Every image slot renders an original illustration until a photo is listed in `js/data/photos.js`.
Slots: `hero`, `second-avenue`, `cottonwood-square`, `grange`, `whistle-stop`, `art-walk`,
`era-arapaho`, `era-railroad`, `era-plat`, `era-district`.

1. Put source images in `photos-src/`, named by slot (`photos-src/second-avenue.jpg`).
2. Run `npm run photos`. It writes `assets/img/photos/<slot>-{800,1400,2200}.{avif,webp,jpg}`.
3. Add the slot to `js/data/photos.js`:

```js
export const photos = {
  'second-avenue': { widths: [800, 1400, 2200], sizes: '(min-width: 1100px) 60vw, 100vw', fallback: 'assets/img/photos/second-avenue-1400.jpg' },
  'hero': { widths: [800, 1400, 2200], sizes: '100vw', fallback: 'assets/img/photos/hero-2200.jpg' }
};
```

The site wraps that slot in a responsive `<picture>` with AVIF and WebP sources. Nothing else changes.
Keep the crops close to the illustration aspect ratios: 4:3 for 2nd Avenue, 3:2 for Cottonwood Square,
Whistle Stop and the art walk, 1:1 for the Grange, 9:11 portrait for the four history eras, and 16:9 for
the hero.

## Updating content

- **Rock & Rails.** Edit `js/data/events.js`. Dates are ISO strings; the next upcoming show is
  highlighted automatically. Remove `sample: true` once dates are official. The official calendar link
  is in the same file.
- **Directory.** Edit `js/data/places.js`. Each entry has a name, a side (`old` for 2nd Avenue, `new`
  for Cottonwood Square), a preview image and a link.
- **History.** Edit `js/data/timeline.js`.

## Performance

Fonts are preloaded and self-hosted, images are lazy and sized, scripts are deferred, and GSAP loads
after first paint. Run `npm start` in one terminal and `npm run audit` in another to produce a
Lighthouse report. For production hosting, enable gzip or brotli and long cache lifetimes on
`assets/`, `vendor/`, `css/` and `js/`.

## Independent, not official

TownofNiwot.com is a community-made guide and is not a government website. Niwot is an unincorporated
community in Boulder County, Colorado. Illustrations are original artwork made for this site.
