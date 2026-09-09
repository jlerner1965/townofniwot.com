/* Top bar state, active-section tracking, and the mobile bottom bar. */
export function initNav() {
  const topbar = document.getElementById('topbar');
  const bottombar = document.getElementById('bottombar');
  const pill = bottombar?.querySelector('.bottombar__pill');
  const bottomLinks = [...(bottombar?.querySelectorAll('a[data-section]') || [])];
  const topLinks = [...document.querySelectorAll('.topnav a')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const darkSections = new Set(sections.filter(s => s.classList.contains('on-dark')).map(s => s.id));

  /* Scrolled state + dark/light tint for the top bar */
  let lastY = scrollY, ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      topbar.classList.toggle('is-scrolled', y > 24);
      if (bottombar) bottombar.classList.toggle('is-hidden', y > lastY + 6 && y > 200);
      lastY = y; ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Active section: pick the section whose top is nearest the header line */
  const setActive = id => {
    topLinks.forEach(a => a.setAttribute('aria-current', a.getAttribute('href') === '#' + id ? 'true' : 'false'));
    let idx = bottomLinks.findIndex(a => a.dataset.section === id);
    if (idx < 0) {
      /* map secondary sections to nearest bottom-bar item */
      const map = { curse: 'top', avenue: 'explore', art: 'explore' };
      idx = bottomLinks.findIndex(a => a.dataset.section === (map[id] || 'explore'));
    }
    bottomLinks.forEach((a, i) => a.setAttribute('aria-current', i === idx ? 'true' : 'false'));
    if (pill) pill.style.setProperty('--i', String(Math.max(0, idx)));
    topbar.classList.toggle('is-dark', darkSections.has(id));
  };
  /* Geometry-based: the last section whose top has crossed 45% of the viewport.
     Cheap (eight rects per scroll frame) and immune to fast scroll jumps. */
  let current = '';
  const pickActive = () => {
    const line = innerHeight * .45; let id = sections[0]?.id;
    for (const s of sections) { if (s.getBoundingClientRect().top <= line) id = s.id; else break; }
    if (id && id !== current) { current = id; setActive(id); }
  };
  addEventListener('scroll', () => requestAnimationFrame(pickActive), { passive: true });
  addEventListener('resize', pickActive, { passive: true });
  pickActive();

  /* Footer year */
  const y = document.getElementById('year'); if (y) y.textContent = String(new Date().getFullYear());
}
