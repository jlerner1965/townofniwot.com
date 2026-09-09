/* NIWOT — entry point */
import { mountHero } from './hero-gl.js';
import { initNav } from './nav.js';
import { initScroll } from './scroll.js';
import { timeline } from './data/timeline.js';
import { events, season } from './data/events.js';
import { places } from './data/places.js';
import { photos } from './data/photos.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Render data-driven sections ---------- */
function renderTimeline() {
  const ol = $('#timeline'); if (!ol) return;
  ol.innerHTML = timeline.map((e, i) => `
    <li class="era" data-reveal>
      <span class="era__year" aria-hidden="true">${esc(e.year)}</span>
      <span class="era__num" aria-hidden="true">${String(i + 1).padStart(2, '0')} / ${String(timeline.length).padStart(2, '0')}</span>
      <div class="era__media">
        <img data-photo="${esc(e.key)}" src="assets/img/${esc(e.key)}.svg" width="900" height="1100" alt="${esc(e.alt)}" loading="lazy" decoding="async">
      </div>
      <div class="era__body">
        <p class="era__label"><span class="sr-only">${esc(e.year)} · </span>${esc(e.label)}</p>
        <h3>${esc(e.title)}</h3>
        <p>${esc(e.text)}</p>
      </div>
    </li>`).join('');
}

function renderSchedule() {
  const ol = $('#schedule'); if (!ol) return;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = events.map(e => new Date(e.date + 'T12:00:00')).findIndex(d => d >= today);
  const fmtDay = d => d.toLocaleDateString('en-US', { day: 'numeric' });
  const fmtMon = d => d.toLocaleDateString('en-US', { month: 'short', weekday: 'short' });
  ol.innerHTML = events.map((e, i) => {
    const d = new Date(e.date + 'T12:00:00');
    return `
    <li class="schedule__item${i === upcoming ? ' is-next' : ''}" data-reveal>
      <a class="schedule__row" href="${esc(season.source)}" target="_blank" rel="noopener">
        <time class="schedule__date" datetime="${esc(e.date)}"><b>${fmtDay(d)}</b><small>${fmtMon(d)}</small></time>
        <div class="schedule__who"><h3>${esc(e.act)}${e.sample ? '<span class="sr-only"> (placeholder)</span>' : ''}</h3><p>${esc(e.detail)}</p></div>
        <span class="schedule__genre">${esc(e.genre)}</span>
      </a>
    </li>`;
  }).join('');
}

function renderDirectory() {
  const ul = $('#directory'); if (!ul) return;
  ul.innerHTML = places.map((p, i) => `
    <li class="directory__item" data-reveal>
      <a class="directory__link" href="${esc(p.url)}" target="_blank" rel="noopener" data-image="${esc(p.image)}" data-label="${p.side === 'old' ? 'Historic 2nd Ave' : 'Cottonwood Square'}">
        <span class="directory__num">${String(i + 1).padStart(2, '0')}</span>
        <span class="directory__name">${esc(p.name)}</span>
        <span class="directory__where" data-side="${esc(p.side)}">${p.side === 'old' ? '2nd Ave' : 'Cottonwood'}</span>
        <span class="directory__arrow" aria-hidden="true">↗</span>
      </a>
    </li>`).join('');

  /* Floating preview that follows the pointer */
  const preview = $('#directory-preview'); if (!preview) return;
  const img = preview.querySelector('img'), label = preview.querySelector('.directory__preview-label');
  let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
  const loop = () => { x += (tx - x) * .18; y += (ty - y) * .18; preview.style.left = x + 'px'; preview.style.top = y + 'px'; raf = (Math.abs(tx - x) > .3 || Math.abs(ty - y) > .3) ? requestAnimationFrame(loop) : 0; };
  ul.addEventListener('pointermove', e => { tx = e.clientX + 120; ty = e.clientY; if (!raf) raf = requestAnimationFrame(loop); }, { passive: true });
  ul.addEventListener('pointerover', e => {
    const a = e.target.closest('.directory__link'); if (!a) return;
    if (img.getAttribute('src') !== a.dataset.image) img.src = a.dataset.image;
    label.textContent = a.dataset.label; preview.classList.add('is-on');
  });
  ul.addEventListener('pointerleave', () => preview.classList.remove('is-on'));
}

/* ---------- Tactile tilt on bento tiles (pointer devices only) ---------- */
function initTilt() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('[data-tilt]').forEach(tile => {
    let raf = 0;
    tile.addEventListener('pointermove', e => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const r = tile.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        tile.style.transform = `perspective(1200px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg) translateY(-3px)`;
        raf = 0;
      });
    });
    tile.addEventListener('pointerleave', () => { tile.style.transform = ''; });
  });
}

/* ---------- Newsletter ---------- */
function initSignup() {
  const form = $('#signup'); if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.email, msg = form.querySelector('.signup__msg');
    if (!email.validity.valid) { msg.textContent = 'That email address does not look right yet.'; email.focus(); return; }
    msg.textContent = 'Thanks. Postcards go out once the season is announced. Until then, welcome to the Curse.';
    form.reset();
  });
}

/* ---------- Boot ---------- */
/* ---------- Photo upgrade ----------
   Any <img data-photo="key"> whose key is listed in js/data/photos.js gets
   wrapped in a <picture> with AVIF/WebP sources from assets/img/photos/. */
function upgradePhotos() {
  document.querySelectorAll('img[data-photo]').forEach(img => {
    const key = img.dataset.photo; const meta = photos[key]; if (!meta) return;
    const pic = document.createElement('picture');
    if (img.className) pic.className = img.className;
    for (const [ext, type] of [['avif', 'image/avif'], ['webp', 'image/webp']]) {
      const s = document.createElement('source'); s.type = type;
      s.srcset = meta.widths ? meta.widths.map(w => `assets/img/photos/${key}-${w}.${ext} ${w}w`).join(', ') : `assets/img/photos/${key}.${ext}`;
      if (meta.sizes) s.sizes = meta.sizes;
      pic.append(s);
    }
    img.replaceWith(pic); img.className = ''; img.src = meta.fallback || img.src; pic.append(img);
  });
}

function boot() {
  renderTimeline(); renderSchedule(); renderDirectory(); upgradePhotos();
  document.documentElement.classList.add('is-ready');

  let hero = null;
  const canvas = $('#hero-gl');
  if (canvas && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    try { hero = mountHero(canvas); if (hero) canvas.classList.add('is-on'); } catch { hero = null; }
  }
  initNav();
  initTilt();
  initSignup();
  const scroll = initScroll({ hero });
  /* Recalculate pins once the fonts and lazy images settle */
  if (document.fonts?.ready) document.fonts.ready.then(() => scroll.refresh());
  addEventListener('load', () => scroll.refresh(), { once: true });
}
boot();
