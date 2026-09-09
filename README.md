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
photos-src/           licensed source photographs, one per slot
scripts/photos.mjs    turns source JPGs into cropped AVIF/WebP/JPEG responsive sets
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

## Photography

Eight photographs in `photos-src/` were supplied by the client and are licensed for use on this
site. Do not substitute stock photography. They map to slots like this:

| Slot | Source | Where it appears |
|---|---|---|
| `hero` | Front Range sunset from the trail | Hero fallback (reduced motion / no WebGL) |
| `curse` | Front Range sunset from the trail | Behind the Curse quote |
| `second-avenue` | Niwot Tribune storefront | Bento tile 01 |
| `second-avenue-street` | 300 block patios | Old Town comparison pane |
| `cottonwood-square` | Niwot Tavern patios | Bento tile 03 and New Town pane |
| `whistle-stop` | CB&Q caboose | Bento tile 02 |
| `art-walk` | Gateway sculpture | Art walk figure |
| `era-arapaho` | Haystack Mountain and the foothills | History, first era |
| `old-town-aerial` | Aerial of Old Town (547 px wide, never shown large) | Directory hover preview |

`grange`, `era-railroad`, `era-plat` and `era-district` still use the original illustrations.

To add or replace a photo:

1. Put the source in `photos-src/`, named by slot (`photos-src/grange.jpg`).
2. Run `npm run photos`. It writes `assets/img/photos/<slot>-{800,1400,2200}.{avif,webp,jpg}`,
   cropping slots with a fixed aspect ratio (hero 16:9, curse 21:9, eras 9:11, grange 1:1).
3. Add the slot to `js/data/photos.js`:

```js
'grange': { widths: [800, 1400], sizes: '(min-width: 1100px) 42vw, 100vw', fallback: 'assets/img/photos/grange-1400.jpg' }
```

The site wraps that slot in a responsive `<picture>` with AVIF and WebP sources. Nothing else changes.

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
community in Boulder County, Colorado. Photography is licensed for use on this site; illustrations are
original artwork.
