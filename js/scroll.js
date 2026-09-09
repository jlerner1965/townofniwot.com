/* GSAP ScrollTrigger choreography. Every effect degrades gracefully: with
   reduced motion or without GSAP, content is simply visible. */
export function initScroll({ hero }) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Reveal on scroll (IntersectionObserver; cheap, works everywhere) --- */
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); revealIO.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  const observeReveals = root => (root || document).querySelectorAll('[data-reveal]:not(.revealed)').forEach(el => revealIO.observe(el));
  observeReveals();
  /* Stagger siblings that reveal together */
  document.querySelectorAll('.bento, .orgs, .stops, .schedule').forEach(group => {
    [...group.querySelectorAll('[data-reveal]')].forEach((el, i) => el.style.transitionDelay = `${Math.min(i * 70, 420)}ms`);
  });

  /* --- Curse: word-by-word illumination tied to scroll --- */
  const words = document.querySelector('[data-words]');
  if (words) {
    const text = words.textContent.trim();
    words.textContent = '';
    text.split(/\s+/).forEach((w, i) => { const s = document.createElement('span'); s.className = 'w'; s.textContent = w; words.append(s, document.createTextNode(' ')); });
    const spans = words.querySelectorAll('.w');
    if (reduced) spans.forEach(s => s.classList.add('is-lit'));
  }

  /* --- Counters --- */
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = Number(el.dataset.count), fmt = n => (target > 1900 && target < 2100) ? String(n) : n.toLocaleString('en-US');
    if (reduced) { el.textContent = fmt(target); return; }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      const t0 = performance.now(), dur = 1400;
      const tick = now => { const p = Math.min(1, (now - t0) / dur), ease = 1 - Math.pow(1 - p, 4); el.textContent = fmt(Math.round(target * ease)); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, { threshold: .5 });
    io.observe(el);
  });

  if (reduced) return { refresh() { observeReveals(); } };

  /* GSAP is loaded after first paint so it never competes with fonts and CSS */
  const api = { refresh() { observeReveals(); window.ScrollTrigger?.refresh(); } };
  const loadScript = src => new Promise((res, rej) => { const el = document.createElement('script'); el.src = src; el.onload = res; el.onerror = rej; document.head.append(el); });
  const lightAll = () => document.querySelectorAll('.curse__words .w').forEach(s => s.classList.add('is-lit'));
  const start = () => loadScript('vendor/gsap.min.js').then(() => loadScript('vendor/ScrollTrigger.min.js')).then(() => setupGsap(hero)).catch(lightAll);
  if (document.readyState === 'complete') start(); else addEventListener('load', () => ('requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 200)), { once: true });
  return api;
}

function setupGsap(hero) {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });
  const words = document.querySelector('[data-words]');

  /* Hero parallax + shader scroll uniform */
  ScrollTrigger.create({
    trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true,
    onUpdate: self => { hero?.setScroll(self.progress); },
    animation: gsap.timeline()
      .to('.hero__content', { yPercent: -18, opacity: .2, ease: 'none' }, 0)
      .to('.hero__meta', { yPercent: -40, opacity: 0, ease: 'none' }, 0)
      .to('.hero__scene', { yPercent: 12, ease: 'none' }, 0)
  });

  /* --- Curse words light up as they cross the viewport --- */
  if (words) {
    const spans = gsap.utils.toArray('.curse__words .w');
    ScrollTrigger.create({
      trigger: '.curse__title', start: 'top 80%', end: 'bottom 45%', scrub: .3,
      onUpdate: self => { const n = Math.round(self.progress * spans.length); spans.forEach((s, i) => s.classList.toggle('is-lit', i < n)); }
    });
  }

  /* --- History: pinned horizontal scroll (desktop only) --- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', () => {
    const track = document.getElementById('timeline');
    const pin = document.querySelector('.history__pin');
    const progress = document.getElementById('rail-progress');
    const distance = () => track.scrollWidth - innerWidth;
    const tl = gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: pin, start: 'top top', end: () => '+=' + distance(), pin: true, scrub: .6, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: self => { progress.style.transform = `scaleX(${self.progress})`; }
      }
    });
    /* Each era: image parallax within the card as it travels */
    gsap.utils.toArray('.era__media img').forEach(img => {
      gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: pin, start: 'top top', end: () => '+=' + distance(), scrub: 1 } });
    });
    return () => tl.kill();
  });

  /* --- Compare panes slide in from opposite sides --- */
  gsap.from('.compare__pane--old', { xPercent: -8, opacity: 0, duration: 1.2, scrollTrigger: { trigger: '.compare', start: 'top 80%' } });
  gsap.from('.compare__pane--new', { xPercent: 8, opacity: 0, duration: 1.2, scrollTrigger: { trigger: '.compare', start: 'top 80%' } });
  gsap.from('.compare__divider', { scale: 0, rotate: -90, duration: 1, ease: 'back.out(2)', scrollTrigger: { trigger: '.compare', start: 'top 70%' } });

  /* --- Section titles: gentle upward drift --- */
  gsap.utils.toArray('.section-head h2').forEach(h => {
    gsap.fromTo(h, { y: 40 }, { y: -20, ease: 'none', scrollTrigger: { trigger: h, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
  });

  ScrollTrigger.refresh();
}
