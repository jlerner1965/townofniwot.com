const services = [
  'Roads and transportation','Planning and land use','Law enforcement','Fire and emergency response','Water','Wastewater and sanitation','Parks, trails, and open space','Schools','Libraries','Elections','Building permits','Public health'
];

const tbody = document.querySelector('#service-rows');
function renderServices(query = '') {
  const matches = services.filter(name => name.toLowerCase().includes(query.toLowerCase()));
  tbody.innerHTML = matches.map(name => `<tr><td>${name}</td><td class="pending">Verification pending</td><td class="pending">Authoritative source review required</td><td>—</td><td>Pending</td></tr>`).join('');
}
renderServices();
document.querySelector('#service-search').addEventListener('input', e => renderServices(e.target.value));

const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('#site-nav');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('open', !open);
});
nav.addEventListener('click', e => {
  if (e.target.closest('a')) { nav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); }
});

document.querySelectorAll('[role="tab"]').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('[role="tab"]').forEach(item => item.setAttribute('aria-selected', 'false'));
  tab.setAttribute('aria-selected', 'true');
}));
