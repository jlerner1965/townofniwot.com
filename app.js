const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('#site-nav');

menuButton.addEventListener('click', () => {
  const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(willOpen));
  menuButton.querySelector('.sr-only').textContent = willOpen ? 'Close menu' : 'Open menu';
  nav.classList.toggle('open', willOpen);
});

nav.addEventListener('click', event => {
  if (!event.target.closest('a')) return;
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('.sr-only').textContent = 'Open menu';
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.focus();
  }
});

document.querySelector('#newsletter-form').addEventListener('submit', event => {
  event.preventDefault();
  const message = event.currentTarget.querySelector('.form-message');
  message.textContent = 'Thanks for your interest. Newsletter delivery will be available soon.';
});
