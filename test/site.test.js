/* Checks against the built site in _site/. Run `npm run build` first.

   These read the HTML the deploy would serve: every primary page exists and
   carries the right head, internal links resolve, the sitemap and robots
   files are well-formed, structured data parses and says what the page
   says, and nothing internal leaks. */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import listings from '../src/_data/listings.js';
import events from '../src/_data/events.js';
import site from '../src/_data/site.js';
import services from '../src/_data/services.js';
import organizations from '../src/_data/organizations.js';
import election from '../src/_data/election.js';
import corrections from '../src/_data/corrections.js';
import nav from '../src/_data/nav.js';
import annualEvents from '../src/_data/annualEvents.js';
import trails from '../src/_data/trails.js';
import { buildUpcoming, expandEvents, instancesOn, dateLabel, parseIso, monthDefault, MONTHS } from '../src/assets/js/calendar-core.js';
import { HASHED_NAME } from '../lib/assets.js';

const ROOT = path.resolve('_site');
const PRIMARY = [
  '/',
  '/things-to-do/',
  '/old-town-niwot/',
  '/one-day-in-niwot/',
  '/restaurants/',
  '/eat-shop/',
  '/events/',
  '/annual-events/',
  '/events/rock-and-rails/',
  '/parks-trails/',
  '/living-in-niwot/',
  '/community/',
  '/history/',
  '/civic/incorporation-election/',
  '/plan-a-visit/',
];
const INDEXABLE = [...PRIMARY, '/privacy/'];
const TITLES = {
  '/': 'Niwot, Colorado Community Guide | TownofNiwot.com',
  '/things-to-do/': 'Things to Do in Niwot, Colorado | TownofNiwot.com',
  '/old-town-niwot/': 'Old Town Niwot — Downtown Niwot, Colorado',
  '/one-day-in-niwot/': 'Visiting Niwot, Colorado: a One-Day Itinerary',
  '/restaurants/': 'Restaurants in Niwot, Colorado — Where to Eat | TownofNiwot.com',
  '/eat-shop/': 'Niwot Restaurants, Shops & Local Services | TownofNiwot.com',
  '/events/': 'Niwot Events Calendar | TownofNiwot.com',
  '/annual-events/': 'Niwot Events & Festivals — the Year in Niwot, Colorado',
  '/events/rock-and-rails/': 'Rock & Rails Niwot: Dates, Times, Parking & What to Know',
  '/parks-trails/': 'Niwot Parks & Trails — Whistle Stop Park and the LoBo Trail',
  '/living-in-niwot/': 'Living in Niwot, Colorado — What It Is Actually Like',
  '/community/': 'Niwot Community Organizations & Resident Resources',
  '/history/': 'History of Niwot, Colorado | TownofNiwot.com',
  '/plan-a-visit/': 'Visit Niwot, Colorado: Directions, Parking & Accessibility',
  '/civic/incorporation-election/': '2026 Niwot Incorporation Election | TownofNiwot.com',
  '/privacy/': 'Privacy | TownofNiwot.com',
};

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#8217;/g, '’').replace(/&#8212;/g, '—').replace(/&quot;/g, '"');
const fileFor = (url) => (url.endsWith('/') ? path.join(ROOT, url, 'index.html') : path.join(ROOT, url));
const read = (url) => fs.readFileSync(fileFor(url), 'utf8');
const tag = (html, re) => (html.match(re) || [])[1];
const jsonLd = (html) => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));

before(() => {
  assert.ok(fs.existsSync(ROOT), '_site is missing — run `npm run build` first');
});

/* Utility pages: built and reachable, kept out of the index and the sitemap. */
const UTILITY = ['/thanks/', '/contact/'];

test('all fifteen primary pages, the privacy page, the utility pages, the 404 and the utility files are built', () => {
  for (const url of [...INDEXABLE, ...UTILITY]) assert.ok(fs.existsSync(fileFor(url)), url);
  for (const file of ['404.html', 'sitemap.xml', 'robots.txt', 'favicon.svg', 'favicon.ico', 'apple-touch-icon.png']) assert.ok(fs.existsSync(path.join(ROOT, file)), file);
});

test('titles, descriptions, canonicals and Open Graph tags are unique and correct', () => {
  const descriptions = new Set();
  for (const url of INDEXABLE) {
    const html = read(url);
    assert.equal(decode(tag(html, /<title>([^<]*)<\/title>/)), TITLES[url], url);
    const description = tag(html, /<meta name="description" content="([^"]*)">/);
    assert.ok(description && description.length > 60, `${url} description`);
    assert.ok(!descriptions.has(description), `${url} description duplicates another page`);
    descriptions.add(description);
    assert.equal(tag(html, /<link rel="canonical" href="([^"]*)">/), site.url + url, `${url} canonical`);
    assert.equal(tag(html, /<meta property="og:url" content="([^"]*)">/), site.url + url);
    assert.equal(decode(tag(html, /<meta property="og:title" content="([^"]*)">/)), TITLES[url]);
    assert.ok(tag(html, /<meta property="og:image" content="([^"]*)">/).startsWith(site.url + '/assets/photos/'));
    assert.ok(tag(html, /<meta property="og:image:alt" content="([^"]*)">/));
    assert.ok(!/<meta name="robots"/.test(html), `${url} must be indexable`);
  }
});

test('every page has exactly one H1 and no skipped heading levels', () => {
  for (const url of [...INDEXABLE, ...UTILITY, '/404.html']) {
    const html = read(url);
    const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    assert.equal(levels.filter((l) => l === 1).length, 1, `${url} h1 count`);
    let previous = 0;
    for (const level of levels) {
      assert.ok(level <= previous + 1, `${url} skips from h${previous} to h${level}`);
      previous = level;
    }
  }
});

test('the 404, thank-you and contact pages are noindex and carry no canonical', () => {
  for (const url of ['/404.html', ...UTILITY]) {
    const html = read(url);
    assert.match(html, /<meta name="robots" content="noindex, follow">/, url);
    assert.ok(!/rel="canonical"/.test(html), url);
  }
});

test('the masthead identifier, footer disclaimer and privacy links are on every page', () => {
  for (const url of [...INDEXABLE, ...UTILITY, '/404.html']) {
    const html = read(url);
    assert.match(html, /<small>Independent community guide<\/small>/, url);
    assert.ok(html.includes(site.disclaimer), `${url} disclaimer`);
    assert.match(html, /href="\/privacy\/"/, url);
  }
  assert.ok(read('/contact/').includes('How submissions are handled'), 'privacy link beside the submission form');
});

/* ---- navigation and the homepage, after the September 2026 launch audit ---- */

/* The menu carries six of the sixteen pages; the footer carries every one of
   them, which is the only reason the menu can stay this short. */
const NOT_IN_MENU = ['/eat-shop/', '/annual-events/', '/events/rock-and-rails/', '/old-town-niwot/', '/one-day-in-niwot/', '/history/', '/community/', '/plan-a-visit/'];

test('the primary navigation has six items, and every page it leaves out is in the footer of every page', () => {
  assert.deepEqual(nav.map((n) => n.label), ['Things to Do', 'Restaurants', 'Events', 'Parks & Trails', 'Living Here', '2026 Election']);
  for (const url of [...INDEXABLE, ...UTILITY, '/404.html']) {
    const html = read(url);
    const menu = html.slice(html.indexOf('<nav class="n-nav"'), html.indexOf('</nav>'));
    assert.equal((menu.match(/<a[ >]/g) || []).length, nav.length, `${url} menu items`);
    for (const href of NOT_IN_MENU) assert.ok(!menu.includes(`href="${href}"`), `${url} menu should not carry ${href}`);
    const footer = html.slice(html.indexOf('<footer'));
    for (const href of [...NOT_IN_MENU, '/contact/', '/privacy/']) {
      assert.ok(footer.includes(`href="${href}"`), `${url} footer is missing ${href}`);
    }
    /* Every page in the menu is in the footer too, so the footer is a
       complete index of the site and not a leftovers drawer. */
    for (const item of nav) assert.ok(footer.includes(`href="${item.href}"`), `${url} footer is missing ${item.href}`);
  }
  assert.ok(!read('/things-to-do/').includes('Inventory in progress'));
});

test('the homepage is six sections with four quick links, no newsletter form and no repeated interior lists', () => {
  const html = read('/');
  const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
  assert.equal((main.match(/<section /g) || []).length, 6, 'six sections');
  assert.equal((main.match(/class="n-shift" href="/g) || []).length, 4, 'four quick links');
  assert.ok(!main.includes('<form'), 'no form on the homepage');
  assert.ok(!main.includes('name="kind" value="newsletter"'), 'no newsletter form');
  assert.ok(!main.includes('/eat-shop/?category='), 'no category grid');
  for (const o of organizations) assert.ok(!main.includes(`>${o.name}<`), `${o.name} is not listed on the homepage`);
  assert.ok(!main.includes('CB&amp;Q 14649'), 'no history summary');
  assert.ok(main.includes('November 3, 2026'), 'the compact election notice stays');
  assert.ok(main.includes('Community Groups &amp; Resident Resources') && main.includes('Plan Your Visit'), 'the split section');
  const words = main.replace(/<[^>]+>/g, ' ').replace(/&[#\w]+;/g, ' ').split(/\s+/).filter(Boolean).length;
  assert.ok(words < 620, `homepage word count ${words}`);
});

test('the contact page holds the submission form; the visitor page has no form and no contact matrix', () => {
  const contact = read('/contact/');
  assert.match(contact, /<form data-contact-form method="post" action="\/api\/contact"/);
  assert.equal((contact.match(/ name="(company|kind|subject|detail|source|email)"/g) || []).length, 6);
  const visit = read('/plan-a-visit/');
  assert.ok(!visit.includes('<form'), 'no form on the visitor page');
  assert.ok(!visit.includes('Go direct instead'), 'no contact matrix');
  assert.ok(visit.includes('href="/community/#resources"'), 'one link to resident resources');
  assert.ok(visit.includes('alt="Brick and clapboard buildings on the 300 block of Second Avenue'), 'the streetscape photograph');
  assert.ok(!html_has_form_script(visit), 'forms.js is not loaded on the visitor page');
});

function html_has_form_script(html) {
  return /forms\.[0-9a-f]+\.js/.test(html);
}

test('the visible titles say what each page is', () => {
  const h1 = (url) => decode(tag(read(url), /<h1[^>]*>([^<]*)<\/h1>/));
  assert.equal(h1('/things-to-do/'), 'Things to Do in Niwot, Colorado');
  assert.equal(h1('/restaurants/'), 'Restaurants in Niwot, Colorado');
  assert.equal(h1('/annual-events/'), 'Niwot Events & Festivals');
  assert.equal(h1('/events/rock-and-rails/'), 'Rock & Rails, Niwot');
  assert.equal(h1('/parks-trails/'), 'Niwot Parks & Trails');
  assert.equal(h1('/old-town-niwot/'), 'Old Town Niwot');
  assert.equal(h1('/one-day-in-niwot/'), 'Visiting Niwot: a One-Day Itinerary');
  assert.equal(h1('/living-in-niwot/'), 'Living in Niwot, Colorado');
  assert.equal(h1('/eat-shop/'), 'Niwot Restaurants, Shops & Local Services');
  assert.equal(h1('/community/'), 'Community Groups & Resident Resources');
  assert.equal(h1('/history/'), 'Niwot History: Railroad, Town Grid & Community');
  assert.equal(h1('/plan-a-visit/'), 'Visit Niwot: Directions, Parking & Accessibility');
});

test('internal links and in-page anchors all resolve', () => {
  const ids = new Map();
  for (const url of [...INDEXABLE, '/thanks/', '/404.html']) {
    ids.set(url, new Set([...read(url).matchAll(/ id="([^"]+)"/g)].map((m) => m[1])));
  }
  for (const url of [...INDEXABLE, '/thanks/', '/404.html']) {
    const html = read(url);
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      if (!href.startsWith('/')) continue;
      if (href.startsWith('/api/')) continue;
      const [pathPart, hash] = href.split('#');
      const [pathname] = pathPart.split('?');
      const target = pathname || url;
      assert.ok(fs.existsSync(fileFor(target)), `${url} links to ${href} which is not built`);
      if (hash) assert.ok(ids.get(target).has(hash), `${url} links to ${href} but #${hash} is not on that page`);
    }
    for (const [, src] of html.matchAll(/(?:src|href)="(\/assets\/(?:css|js)\/[^"]+)"/g)) {
      assert.ok(fs.existsSync(path.join(ROOT, src)), `${url} references ${src}`);
      assert.match(path.basename(src), HASHED_NAME, `${src} is not content-hashed`);
    }
  }
});

test('the sitemap lists only canonical, indexable pages with a lastmod each', () => {
  const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.deepEqual(locs, [...INDEXABLE].sort().map((u) => site.url + u));
  const lastmods = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
  assert.equal(lastmods.length, locs.length);
  assert.ok(lastmods.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d))));
  assert.ok(!xml.includes('/thanks/') && !xml.includes('404'));
});

test('robots.txt is open to crawlers and names the sitemap', () => {
  const txt = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
  assert.match(txt, /User-agent: \*\nAllow: \//);
  assert.match(txt, /Sitemap: https:\/\/townofniwot\.com\/sitemap\.xml/);
  assert.ok(!/Disallow: \/\s*$/m.test(txt.split('Disallow: /api/').join('')));
});

test('breadcrumbs are visible and their structured data matches on every internal page', () => {
  for (const url of INDEXABLE.filter((u) => u !== '/')) {
    const html = read(url);
    const crumb = jsonLd(html).find((d) => d['@type'] === 'BreadcrumbList');
    assert.ok(crumb, `${url} BreadcrumbList`);
    const trail = crumb.itemListElement;
    assert.equal(trail[0].item, site.url + '/');
    assert.equal(trail[trail.length - 1].item, site.url + url);
    assert.deepEqual(trail.map((i) => i.position), trail.map((_, i) => i + 1), `${url} crumb positions`);
    const visible = decode(tag(html, /<span aria-current="page">([^<]*)<\/span>/));
    assert.equal(visible, trail[trail.length - 1].name, `${url} visible crumb`);
    assert.match(html, /<nav class="n-crumbs" aria-label="Breadcrumb">/);
  }
  assert.ok(!read('/').includes('n-crumbs'), 'no breadcrumb on the homepage');

  /* A page under another one carries the parent in between, and the parent
     has to be a page that exists — the link check below walks it. */
  const rr = jsonLd(read('/events/rock-and-rails/')).find((d) => d['@type'] === 'BreadcrumbList').itemListElement;
  assert.deepEqual(rr.map((i) => i.name), ['Home', 'Events', 'Rock & Rails']);
  assert.equal(rr[1].item, site.url + '/events/');
});

/* ---- directory ---- */

test('the directory renders every published listing, the right counts and no closed business', () => {
  const html = read('/eat-shop/');
  const rows = [...html.matchAll(/<li class="n-row" id="([^"]+)" data-listing data-cat="([^"]+)"/g)];
  assert.equal(rows.length, listings.entries.length);
  assert.deepEqual(rows.map((m) => m[1]), listings.entries.map((e) => e.slug));
  for (const c of listings.categories) {
    const shown = new RegExp(`<span data-chip-label>${c.label.replace(/[&]/g, '&amp;')}</span> <span class="n-chip-n">(\\d+)</span>`);
    assert.equal(Number(tag(html, shown)), c.count, `${c.label} count`);
    if (c.slug !== 'all') assert.equal(rows.filter((m) => m[2] === c.slug).length, c.count, `${c.label} rows`);
  }
  assert.match(html, new RegExp(`data-dir-count>${listings.entries.length} listings<`));
  for (const record of listings.records.filter((r) => r.status === 'closed' || r.status === 'unverified')) {
    assert.ok(!html.includes(`data-name="${record.name}"`), `${record.name} must not be listed`);
    assert.ok(!html.includes(`id="${record.slug}"`), `${record.name} must not have a row`);
  }
});

test('the directory filter is a radio group in a fieldset with a legend and a live result count', () => {
  const html = read('/eat-shop/');
  assert.match(html, /<fieldset class="n-cats">\s*<legend[^>]*>Filter by category<\/legend>/);
  const radios = [...html.matchAll(/<input type="radio" name="category" value="([^"]+)"( checked)?>/g)];
  assert.deepEqual(radios.map((m) => m[1]), listings.categories.map((c) => c.slug));
  assert.deepEqual(radios.filter((m) => m[2]).map((m) => m[1]), ['all']);
  assert.match(html, /<span aria-live="polite" aria-atomic="true"[^>]*data-dir-count>/);
  assert.ok(!html.includes('type="checkbox"'));
});

test('editorial notes never reach the page, and the verification wording is per-row', () => {
  const html = read('/eat-shop/');
  for (const record of listings.records) {
    if (record.editorialNote && !record.publishNote) assert.ok(!html.includes(record.editorialNote), `${record.slug} note leaked`);
  }
  assert.ok(!html.includes('Every Niwot business we can source'));
  assert.match(html, /A curated directory of Niwot businesses, checked against business-owned and community sources/);
  assert.ok(html.includes(listings.verified.summary.replace(/&/g, '&amp;')));
  assert.equal([...html.matchAll(/data-verified="\d{4}-\d{2}-\d{2}"/g)].length, listings.entries.length);
});

test('the directory ItemList carries only active businesses with stable URLs and no invented fields', () => {
  const html = read('/eat-shop/');
  const list = jsonLd(html).find((d) => d['@type'] === 'ItemList');
  const active = listings.entries.filter((e) => e.status === 'active');
  assert.equal(list.numberOfItems, active.length);
  assert.equal(list.itemListElement.length, active.length);
  list.itemListElement.forEach((li, i) => {
    assert.equal(li.position, i + 1);
    assert.equal(li.url, `${site.url}/eat-shop/#${active[i].slug}`);
    assert.ok(html.includes(`id="${active[i].slug}"`));
    for (const forbidden of ['telephone', 'openingHours', 'geo', 'aggregateRating', 'priceRange']) assert.ok(!(forbidden in li.item));
    assert.equal(li.item.address.addressLocality, 'Niwot');
  });
  assert.ok(!list.itemListElement.some((li) => li.item.name === '1914 House'));
  const wheel = list.itemListElement.find((li) => li.item.name === 'The Wheel House');
  assert.equal(wheel.item.address.streetAddress, '101 Second Avenue, Suite B');
  assert.equal(wheel.item.url, 'https://www.niwotwheelhouse.com/');
});

test('every directory row says where its link goes, and none calls the Association homepage "Hours & contact"', () => {
  const html = read('/eat-shop/');
  for (const row of listings.entries) {
    const block = html.slice(html.indexOf(`id="${row.slug}"`));
    const link = block.match(/<a class="n-link" href="([^"]+)" rel="noopener" style="justify-self:start">([^<]+)</);
    assert.ok(link, `${row.slug} link`);
    const [, href, label] = link;
    assert.equal(href, row.href);
    if (row.website) assert.equal(label.trim(), 'Website', row.slug);
    else if (href === 'https://niwot.com/') assert.equal(label.trim(), 'Find in the Association directory', row.slug);
    else if (href.startsWith('https://niwot.com/listing/')) assert.equal(label.trim(), 'Hours &amp; contact', row.slug);
  }
  const johns = listings.entries.find((e) => e.slug === 'johns-dry-cleaners');
  assert.equal(johns.href, 'https://www.johnsdrycleaners.com/locations/');
  assert.ok(!html.includes('/6964-n-79th-st/'));
});

test('the directory opens on its photographs and search, folds the listings by category and names the filter in force', () => {
  const html = read('/eat-shop/');
  const h1 = html.indexOf('<h1');
  const photos = html.indexOf('class="n-pair"');
  const search = html.indexOf('id="dir-q"');
  const firstRow = html.indexOf('data-listing');
  assert.ok(h1 < photos && photos < search && search < firstRow, 'title, photographs, search, listings — in that order');
  const groups = [...html.matchAll(/<details class="n-group" id="cat-([a-z-]+)" data-group="([a-z-]+)">/g)];
  assert.deepEqual(groups.map((m) => m[2]), listings.categories.filter((c) => c.slug !== 'all').map((c) => c.slug), 'one group per category, in order');
  assert.ok(!/<details class="n-group"[^>]* open/.test(html), 'every group ships folded');
  for (const c of listings.categories.filter((c) => c.slug !== 'all')) {
    const block = html.slice(html.indexOf(`data-group="${c.slug}"`), html.indexOf('</details>', html.indexOf(`data-group="${c.slug}"`)));
    assert.equal((block.match(/data-listing/g) || []).length, c.count, `${c.label} rows in its group`);
    assert.ok(block.includes(`data-group-count>${c.count}<`), `${c.label} count on its summary`);
  }
  const options = [...html.matchAll(/<option value="([a-z-]+)"/g)].map((m) => m[1]);
  assert.deepEqual(options, listings.categories.map((c) => c.slug), 'the phone selector offers every category');
  assert.ok(html.indexOf('<select id="dir-cat"') > html.indexOf('</form>'), 'the selector sits outside the form');
  assert.match(html, /<div class="n-active" data-dir-active hidden>/);
  assert.match(html, /<details class="n-how">\s*<summary>How this directory is compiled<\/summary>/);
  assert.ok(html.split('data-dir-clear').length >= 3, 'a reset in the strip and in the empty state');
  assert.ok(!html.includes('data-corrections'), 'no change log on the directory');
});

test('the link sweep held back the rows it could not stand behind and rerouted the ones whose sites were down', () => {
  const byId = new Map(listings.records.map((r) => [r.slug, r]));
  for (const slug of ['robinson-consulting', 'strohl-electric']) assert.equal(byId.get(slug).status, 'unverified', slug);
  for (const slug of ['butterfield-wellness', 'hidden-yoga-studio']) {
    const row = listings.entries.find((e) => e.slug === slug);
    assert.ok(row, `${slug} still listed`);
    assert.equal(row.href, 'https://niwot.com/');
    assert.equal(row.linkLabel, 'Find in the Association directory');
  }
  const html = read('/eat-shop/');
  for (const dead of ['butterfieldwellness.com', 'thehiddenyogastudio.com', 'listing/robinson-consulting', 'listing/strohl-electric']) assert.ok(!html.includes(dead), dead);
});

/* ---- events ---- */

function buildClock(html) {
  const [date, time] = tag(html, /id="niwot-events" data-built="([^"]+)"/).split(' ');
  return { date, time };
}

test('event list, month calendar, detail panel and structured data agree', () => {
  const html = read('/events/');
  const now = buildClock(html);
  const expected = buildUpcoming(events, now);

  const cards = [...html.matchAll(/<article data-event-id="([^"]+)" data-event-date="([^"]+)"/g)].map((m) => m[1] + '@' + m[2]);
  assert.deepEqual(cards, expected.map((i) => i.key), 'list matches the records');
  assert.deepEqual([...cards].sort((a, b) => a.split('@')[1].localeCompare(b.split('@')[1])), cards, 'list is chronological');
  assert.equal(new Set(cards).size, cards.length, 'no duplicate instances');
  assert.ok(expected.every((i) => i.date > now.date || (i.date === now.date && (i.endTime || '23:59') >= now.time)), 'nothing expired');

  const { y, m } = parseIso(now.date);
  const monthDays = new Set(expandEvents(events).filter((i) => i.date.startsWith(now.date.slice(0, 7))).map((i) => i.date));
  const cellDays = new Set([...html.matchAll(/data-has="yes"[^>]*data-iso="([^"]+)"/g)].map((mm) => mm[1]));
  assert.deepEqual(cellDays, monthDays, 'calendar cells match the records');
  assert.match(html, new RegExp(`data-cal-label[^>]*>${MONTHS[m - 1]} ${y}<`));

  /* The rail belongs to the month on screen: its first day still ahead
     with everything on it, or a note naming the month. */
  const detail = html.slice(html.indexOf('data-cal-detail'), html.indexOf('</aside>'));
  const shown = monthDefault(events, y, m, now);
  if (shown) {
    for (const inst of shown.instances) {
      assert.ok(detail.includes(inst.event.name.replace(/&/g, '&amp;').replace(/'/g, '&#39;')) || detail.includes(inst.event.name), `detail shows ${inst.event.name}`);
    }
    assert.ok(detail.includes(dateLabel(shown.instances[0], now)), 'detail date matches the shown day');
    assert.match(html, new RegExp(`aria-pressed="true"[^>]*data-iso="${shown.date}"`), 'the shown day is marked in the grid');
    if (shown.instances.length > 1) {
      assert.ok(detail.includes(`${shown.instances.length} events`), 'a busy day lists its events');
      assert.equal((detail.match(/class="n-daypick"/g) || []).length, shown.instances.length);
      assert.ok(!detail.includes('<button'), 'the build writes the day list as text, not inert buttons');
    }
  } else {
    assert.match(detail, new RegExp(`data-cal-empty="${MONTHS[m - 1]} ${y}"`), 'an empty month says so');
    assert.ok(!html.includes('aria-pressed="true"'), 'nothing is marked in the grid');
    if (expected.length) assert.ok(detail.includes(expected[0].event.name), 'the note points at the next confirmed date');
  }

  const graph = jsonLd(html).find((d) => d['@graph'])['@graph'];
  assert.deepEqual(
    graph.map((e) => e.name + '@' + String(e.startDate).slice(0, 10)),
    expected.map((i) => i.event.name + '@' + i.date),
    'structured data matches the list'
  );
  for (const e of graph) {
    assert.equal(e.eventStatus, 'https://schema.org/EventScheduled');
    assert.match(String(e.startDate), /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}-0[67]:00)?$/);
    assert.ok(e.organizer.url.startsWith('https://'));
    assert.ok(e.url.startsWith('https://'));
  }
});

test('expected events are labelled, listed separately and kept out of structured data', () => {
  const html = read('/events/');
  const expectedIds = [...html.matchAll(/data-expected-id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(expectedIds, events.filter((e) => e.status === 'tentative').map((e) => e.id));
  assert.ok(expectedIds.includes('rock-rails-2027'));
  assert.match(html, /Expected &#8212; date not confirmed/);
  const graph = jsonLd(html).find((d) => d['@graph'])['@graph'];
  assert.ok(!graph.some((e) => /2027/.test(e.name) || String(e.startDate).startsWith('2027')));
  assert.ok(!html.includes('2027-06-03'));
});

test('the homepage "Coming up" cards are the first three upcoming instances, each opening its own day and event', () => {
  const html = read('/');
  const now = buildClock(html);
  const cards = [...html.matchAll(/<article data-event-id="([^"]+)" data-event-date="([^"]+)"/g)].map((m) => m[1] + '@' + m[2]);
  assert.deepEqual(cards, buildUpcoming(events, now, 3).map((i) => i.key));
  for (const inst of buildUpcoming(events, now, 3)) {
    assert.ok(html.includes(`href="/events/?date=${inst.date}&amp;event=${encodeURIComponent(inst.id)}#cal-h"`), `${inst.id} deep link`);
  }
  assert.ok(!html.includes('href="/events/#cal-h"'), 'no card sends every reader to the same anchor');
});

test('the events page is a list, a folded month view and a folded expected list, with no archive or change log', () => {
  const html = read('/events/');
  const list = html.indexOf('data-upcoming="select"');
  const fold = html.indexOf('<details class="n-fold" id="calendar" data-cal-fold>');
  const expected = html.indexOf('<details class="n-fold" id="expected">');
  assert.ok(list > 0 && list < fold && fold < expected, 'list, then the month view, then the expected list');
  assert.ok(!/<details class="n-fold"[^>]* open/.test(html), 'both folds ship closed');
  assert.ok(html.includes('id="cal-h"') && html.includes('id="next-h"'), 'the anchors the cards and the empty-month note use');
  assert.ok(html.includes('href="https://niwot.com/upcoming-events/"'), 'the full community calendar is linked');
  assert.ok(!html.includes('data-archive') && !html.includes('Recently held'), 'no archive');
  assert.ok(!html.includes('data-corrections'), 'no change log');
  assert.ok(html.indexOf('alt="The red CB&amp;Q 14649 caboose') < list, 'the photograph sits beside the list');
});

test('the launch audit’s missing events are dated records and the Holiday Parade is confirmed for November 28', () => {
  const byId = new Map(events.map((e) => [e.id, e]));
  const expected = {
    'house-blend-band-2026-09-12': '2026-09-12',
    'tree-carving-fundraiser-trivia-2026-09-15': '2026-09-15',
    'road-of-remembrance-2026-09-16': '2026-09-16',
    'basin-design-open-house-2026-09-19': '2026-09-19',
    'blessing-of-the-animals-2026-10-04': '2026-10-04',
    'niwot-wellness-lecture-2026-10-07': '2026-10-07',
    'holiday-parade-2026': '2026-11-28',
    'holiday-magic-market-fayre-2026-12-05': '2026-12-05',
  };
  for (const [id, date] of Object.entries(expected)) {
    const ev = byId.get(id);
    assert.ok(ev, id);
    assert.equal(ev.status, 'confirmed', id);
    assert.equal(ev.startDate, date, id);
    assert.ok(ev.sourceUrl.startsWith('https://niwot.com/'), `${id} source`);
  }
  assert.ok(!events.some((e) => e.status === 'tentative' && /parade/i.test(e.name)), 'the parade is no longer awaiting a date');
  const graph = jsonLd(read('/events/')).find((d) => d['@graph'])['@graph'];
  assert.ok(graph.some((e) => e.name === 'Niwot Holiday Parade' && String(e.startDate).startsWith('2026-11-28')));
});

test('the September 11 records carry hours and Enchanted Evening is a confirmed date', () => {
  const byId = new Map(events.map((e) => [e.id, e]));
  for (const id of ['second-friday-art-walk-2026-09-11', 'osmosis-opening-diane-pike-2026-09-11']) {
    assert.equal(byId.get(id).startTime, '17:00', id);
    assert.equal(byId.get(id).endTime, '21:00', id);
  }
  const enchanted = byId.get('enchanted-evening-2026');
  assert.equal(enchanted.status, 'confirmed');
  assert.equal(enchanted.startDate, '2026-11-27');
  assert.equal(enchanted.startTime, '18:00');
  const graph = jsonLd(read('/events/')).find((d) => d['@graph'])['@graph'];
  const marked = graph.find((e) => e.name === 'Enchanted Evening');
  assert.ok(marked && String(marked.startDate).startsWith('2026-11-27T18:00:00-07:00'), 'structured data agrees');
  assert.equal(byId.get('rock-rails-2026').organizer.name, 'Niwot Cultural Arts Association');
});

/* ---- civic, privacy, community, corrections ---- */

test('the election page puts the three voting tasks first, links the boundary to the FAQ and each measure to the ballot', () => {
  const html = read('/civic/incorporation-election/');
  const tasks = html.indexOf('id="tasks"');
  const ballot = html.indexOf('id="ballot"');
  assert.ok(tasks > 0 && tasks < ballot, 'tasks before the ballot');
  assert.match(html, /Check the proposed boundary/);
  assert.ok(html.includes('href="https://niwotelection.org/faq"'), 'boundary task goes to the FAQ');
  assert.ok(!html.includes('Proposed boundary information'), 'no boundary link to the Commission homepage');
  assert.equal((html.match(/>Official text </g) || []).length, election.questions.length + election.fiscal.length, 'an official-text link beside each measure');
  assert.equal((html.match(/<a class="n-shift n-shift--sm" data-official/g) || []).length, election.official.length);
  assert.equal(new Set(election.official.map((o) => o.href)).size, election.official.length, 'one link per destination');
  for (const phrase of ['food for domestic consumption', 'January 1, 2028', 'Article X, Section 20', '2027 onward', 'depends on that tax being approved', 'formed only if incorporation is approved', 'census designated place']) {
    assert.ok(html.includes(phrase), phrase);
  }
  assert.ok(!html.includes('statutory limit'));
  assert.ok(!html.includes('Approval of one does not automatically decide another'));
  /* The Commission's own numbering, read from its ballot page, beside every measure. */
  assert.deepEqual(election.questions.map((q) => q.official), ['Question 1', 'Question 2', 'Question 3']);
  assert.deepEqual(election.fiscal.map((f) => f.official), ['Issue 1', 'Issue 2', 'Issue 3', 'Issue 4', 'Issue 5']);
  for (const item of [...election.questions, ...election.fiscal]) assert.ok(html.includes(`>${item.official}<`), item.official);
  for (const phrase of ['$2.8 million', '$900,000', '$60,000', 'up to nine', '28 candidates', 'Boulder County Clerk and Recorder conducts', 'ballot content and the procedure']) {
    assert.ok(html.includes(phrase), phrase);
  }
  assert.equal((html.match(/<details class="n-fiscal" data-fiscal-fold open>/g) || []).length, election.fiscal.length, 'each fiscal issue folds, written open');
  assert.ok(html.includes('page-civic'), 'the fold script is loaded');
  assert.ok(html.indexOf('id="changes"') > 0);
  assert.equal((html.slice(html.indexOf('id="changes"')).match(/<dt class="n-label n-label--quiet" style="font-size:12px">/g) || []).length, corrections.filter((c) => c.page === '/civic/incorporation-election/').length);
});

test('the privacy page opens without contradicting its own sections, and names an editor route', () => {
  const html = read('/privacy/');
  /* The policy text itself; the dated change note below it quotes the old wording. */
  const policy = html.slice(0, html.indexOf('data-corrections'));
  assert.ok(!policy.includes('Nothing else on this site is collected about you'));
  assert.ok(!policy.includes('passed to any other organization'));
  assert.ok(html.includes('hosting and font providers also process'));
  assert.ok(html.includes('other than the two providers named above'));
  assert.match(html, /data-editor-contact/);
  if (site.editor.email) {
    assert.ok(html.includes(`mailto:${site.editor.email}`), 'the editor address is published');
    assert.ok(read('/plan-a-visit/').includes('data-editor-email'), 'and listed beside the form');
  } else {
    assert.ok(html.includes('A direct editorial address will be published here'), 'the page says the form is the route');
  }
  assert.equal((html.match(/<h2 class="n-h3"/g) || []).length, 8, 'eight policy sections');
});

test('resident services link to the responsible page, not a homepage, and the organizations are split by kind', () => {
  const html = read('/community/');
  for (const s of services) {
    assert.ok(html.includes(`href="${s.href}"`), s.service);
    /* A single-purpose district's front page is its service page; the county's is not. */
    if (s.href.includes('bouldercounty.gov')) assert.ok(!/^https?:\/\/[^/]+\/?$/.test(s.href), `${s.service} links to the county homepage`);
  }
  assert.ok(services.some((s) => s.who === 'Niwot Sanitation District'));
  assert.equal(organizations.filter((o) => o.kind === 'community').length, 4);
  assert.equal(organizations.filter((o) => o.kind === 'public').length, 2);
  for (const name of ['Niwot Cultural Arts Association', 'Niwot Historical Society', 'Niwot Community Association', 'Niwot Local Improvement District']) assert.ok(html.includes(name), name);
  assert.ok(!/the market\b/.test(html), 'no unsourced market');
  assert.ok(!html.includes('Ask a neighbor'));
});

/* Since the launch audit the full log lives folded on the history page; the
   election page keeps its own entries folded (its trust depends on them)
   and the privacy page its own (a policy says when it changed). No other
   page carries a change log. */
const KEEPS_OWN_LOG = ['/civic/incorporation-election/', '/privacy/'];

test('the corrections log is published in full on the history page, folded, and only the election and privacy pages keep their own', () => {
  const story = read('/history/');
  for (const c of corrections) assert.ok(story.includes(c.summary.replace(/&/g, '&amp;').replace(/'/g, '&#39;')) || story.includes(c.summary), c.page);
  assert.ok(corrections.every((c) => /^\d{4}-\d{2}-\d{2}$/.test(c.date) && c.page.startsWith('/') && c.summary.length > 20));
  assert.match(story, /<details class="n-log" id="corrections"[^>]*>\s*<summary>Editorial changes \(\d+\)<\/summary>/, 'the log is folded');
  assert.ok(story.includes('href="https://niwothistoricalsociety.org/history/"'), 'timeline sources are links');
  assert.ok(!story.includes('county records'), 'no generic source labels');
  assert.ok(story.includes('alt="The red CB&amp;Q 14649 caboose') && story.includes('alt="The Niwot Tribune false-front building'), 'two documentary photographs');
  for (const url of INDEXABLE) {
    if (url === '/history/') continue;
    const html = read(url);
    const own = corrections.filter((c) => c.page === url);
    const expected = KEEPS_OWN_LOG.includes(url) && own.length ? 1 : 0;
    assert.equal((html.match(/<dl data-corrections/g) || []).length, expected, url);
  }
});

test('the community page groups the resident services, shows a photograph and links the corrected destinations', () => {
  const html = read('/community/');
  const headings = [...html.matchAll(/<div class="n-sgroup">\s*<h3[^>]*>([^<]*)<\/h3>/g)].map((m) => m[1]);
  assert.deepEqual(headings, [...new Set(services.map((s) => s.group))], 'one heading per group, in data order');
  assert.ok(services.every((s) => s.group), 'every service names its group');
  assert.ok(html.includes('href="https://bouldercounty.gov/safety/sheriff/"') && !html.includes('bouldercounty.gov/sheriff/"'), 'the Sheriff link');
  assert.ok(html.includes('href="https://lefthandwater.gov/"') && !html.includes('lefthandwater.org'), 'the water district link');
  const photo = html.indexOf('alt="The red CB&amp;Q 14649 caboose');
  assert.ok(photo > html.indexOf('id="orgs"') && photo < html.indexOf('id="resources"'), 'the photograph sits between the two lists');
  for (const o of organizations) assert.ok(o.body.split(/\.\s/).length <= 2, `${o.name} description is short`);
});

/* ---- the landing pages added after the launch audit ---- */

test('the field guide keeps the anchors the old Explore URL used, and both renamed pages redirect', () => {
  const html = read('/things-to-do/');
  /* Links from before the rename point at /explore/#oldtown and the rest.
     The redirect only moves the path; the fragment is the browser's, so
     these ids have to survive the rename or those links land at the top. */
  for (const id of ['oldtown', 'cottonwood', 'art', 'outdoors']) {
    assert.match(html, new RegExp(`id="${id}"`), `#${id} must survive the rename`);
  }
  assert.equal((html.match(/class="n-entry/g) || []).length, 6, 'six entries');
  assert.equal((html.match(/class="n-entry n-entry--flip"/g) || []).length, 3, 'three of them flipped');

  const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  const redirects = new Map(vercel.redirects.map((r) => [r.source, r]));
  for (const [from, to] of [['/explore/', '/things-to-do/'], ['/our-story/', '/history/']]) {
    const rule = redirects.get(from);
    assert.ok(rule, `${from} has no redirect`);
    assert.equal(rule.destination, to);
    assert.equal(rule.permanent, true, `${from} must be a 301`);
  }
});

test('the restaurant guide renders every food listing, grouped, with only the facets its record carries', () => {
  const html = read('/restaurants/');
  const rows = [...html.matchAll(/<li class="n-meal" id="([^"]+)">/g)].map((m) => m[1]);
  const inGroupOrder = listings.food.groups.flatMap((g) => g.entries.map((e) => e.slug));
  assert.deepEqual(rows, inGroupOrder, 'every food row, in group order');
  assert.deepEqual([...rows].sort(), listings.food.entries.map((e) => e.slug).sort(), 'and no food row left out');

  const sections = [...html.matchAll(/data-food-group="([a-z-]+)"/g)].map((m) => m[1]);
  assert.deepEqual(sections, listings.food.groups.map((g) => g.slug), 'one section per group, in declared order');
  for (const g of listings.food.groups) assert.ok(html.includes(`href="#${g.slug}"`), `${g.slug} is in the page's own index`);

  for (const row of listings.food.entries) {
    const block = html.slice(html.indexOf(`id="${row.slug}"`), html.indexOf('</li>', html.indexOf(`id="${row.slug}"`)));
    assert.equal((block.match(/<dt>/g) || []).length, row.facets.length, `${row.slug} facet count`);
    assert.ok(block.includes(`href="/eat-shop/#${row.slug}"`), `${row.slug} links to its directory row`);
    if (row.patio) assert.ok(block.includes('Outdoor seating'), `${row.slug} patio facet`);
    else assert.ok(!block.includes('Outdoor seating'), `${row.slug} must not claim outdoor seating`);
  }
  /* An absent facet must never render as an empty cell or a "no". */
  assert.ok(!html.includes('<dd></dd>') && !html.includes('<dd>—</dd>'));
});

test('the restaurant guide says what it does not publish, and asserts no price or hours', () => {
  const html = read('/restaurants/');
  assert.match(html, /Opening hours<\/strong> are not reproduced anywhere on this site/);
  assert.match(html, /Price ranges<\/strong> are not shown on any entry/);
  assert.ok(!/\$\$/.test(html), 'no price range is shown while no source publishes one');
  assert.ok(html.includes(`${listings.food.withPatio.length} places describe outdoor seating`), 'the patio count comes from the data');
  for (const row of listings.food.withPatio) assert.ok(html.includes(`href="#${row.slug}"`), `${row.slug} in the patio list`);
});

test('the restaurant ItemList keeps one identifier per business and invents nothing', () => {
  const html = read('/restaurants/');
  const list = jsonLd(html).find((d) => d['@type'] === 'ItemList');
  const active = listings.food.entries.filter((e) => e.status === 'active');
  assert.equal(list.numberOfItems, active.length);
  list.itemListElement.forEach((li, i) => {
    assert.equal(li.position, i + 1);
    assert.equal(li.url, `${site.url}/restaurants/#${active[i].slug}`);
    /* The same @id as the directory's ItemList: one business, one identifier,
       mentioned on two pages. */
    assert.equal(li.item['@id'], `${site.url}/eat-shop/#${active[i].slug}`);
    for (const forbidden of ['telephone', 'openingHours', 'geo', 'aggregateRating', 'priceRange', 'hasMenu']) {
      assert.ok(!(forbidden in li.item), `${active[i].slug} must not assert ${forbidden}`);
    }
    if (active[i].cuisine) assert.equal(li.item.servesCuisine, active[i].cuisine);
  });
  const directory = jsonLd(read('/eat-shop/')).find((d) => d['@type'] === 'ItemList');
  const ids = new Set(directory.itemListElement.map((li) => li.item['@id']));
  for (const li of list.itemListElement) assert.ok(ids.has(li.item['@id']), `${li.item.name} has an id the directory does not know`);
});

test('the annual guide describes every series and marks nothing undated as scheduled', () => {
  const html = read('/annual-events/');
  const ids = [...html.matchAll(/<li class="n-series" id="([^"]+)">/g)].map((m) => m[1]);
  assert.deepEqual(ids, annualEvents.map((s) => s.id));
  for (const s of annualEvents) {
    assert.ok(html.includes(`href="${s.organizer.url}"`), `${s.id} names its organizer`);
    assert.ok(html.includes(`href="${s.sourceUrl}"`), `${s.id} links what it was read from`);
  }
  /* A series is not an occurrence. Marking one as an Event would publish a
     date this guide does not have. */
  assert.ok(!jsonLd(html).some((d) => d['@graph'] || d['@type'] === 'Event'), 'no Event structured data on the series page');
  assert.ok(html.includes('Expected &#8212; date not confirmed') || html.includes('Expected — date not confirmed'), 'an undated season says so');
});

test('the annual guide says why the Fourth of July and the farmers market are absent', () => {
  const html = read('/annual-events/');
  const block = html.slice(html.indexOf('id="not-listed"'));
  assert.match(block, /A Fourth of July event\./);
  assert.match(block, /no organizer source for one was found/);
  assert.match(block, /A farmers market\./);
  assert.ok(block.includes('href="/contact/"'), 'and invites the ones that are missing');
  for (const s of annualEvents) assert.ok(!/fourth of july|independence day/i.test(s.name), 'no invented Fourth of July series');
});

test('the Rock & Rails guide carries no unpublished season and separates what it can confirm', () => {
  const html = read('/events/rock-and-rails/');
  assert.ok(html.includes('href="https://niwotarts.org/rock-rails/"'), 'the organizer is linked');
  assert.ok(html.includes('Confirmed here') && html.includes('Check with the organizer'), 'the two lists');
  /* Everything a season would change — dates and a line-up — stays with the
     organizer, so the page can be updated in place rather than replaced. */
  assert.ok(!/\b2027-\d{2}-\d{2}\b/.test(html), 'no composed 2027 date');
  assert.match(html, /This guide does not reproduce it/, 'and says the line-up stays with the organizer');
  for (const band of events.filter((e) => e.tag === 'Concert')) {
    assert.ok(!html.includes('Line-up:'), `no line-up is copied onto the page (${band.id})`);
  }
  const rockRails = events.find((e) => e.id === 'rock-rails-2026');
  assert.ok(html.includes('June 4') && html.includes('August 27'), 'the season on file is shown');
  assert.equal(rockRails.recurrence.until, '2026-08-27');
  assert.ok(!fs.existsSync(path.join(ROOT, 'events/rock-and-rails/2026')), 'one URL per event, not one per year');
});

test('the parks page lists every trail record with the county page that governs it', () => {
  const html = read('/parks-trails/');
  const ids = [...html.matchAll(/<li class="n-place" id="([^"]+)">/g)].map((m) => m[1]);
  assert.deepEqual(ids, trails.map((t) => t.id));
  for (const t of trails) {
    for (const l of t.links) assert.ok(html.includes(`href="${l.href}"`), `${t.id} link ${l.href}`);
    assert.ok(html.includes(`href="${t.keeper.url}"`), `${t.id} names who looks after it`);
  }
  for (const href of [
    'https://bouldercounty.gov/open-space/parks-and-trails/trail-closures/',
    'https://bouldercounty.gov/open-space/parks-and-trails/regulations/',
  ]) {
    assert.ok(html.includes(`href="${href}"`), href);
  }
  /* The only length on the page is the county's own, for the LoBo, and it is
     written out. A guide that has not walked a trail publishes no distances,
     so a numeral before "miles" anywhere here means one crept in. */
  const text = html.replace(/<[^>]+>/g, ' ');
  const numeric = text.match(/\b\d+(\.\d+)?\s?(miles|mile|km|kilometers)\b/gi) || [];
  assert.deepEqual(numeric, [], `unexpected measured distances: ${numeric}`);
  assert.ok(text.includes('Twelve miles, Longmont to Boulder'), 'the LoBo length, as the county states it');
  assert.ok(text.includes('this guide has not measured them'), 'and says why there are no others');
});

test('the Old Town page is built from the directory and the series data', () => {
  const html = read('/old-town-niwot/');
  const oldTown = listings.entries.filter((e) => e.area && e.area.includes('Old Town'));
  assert.ok(html.includes(`All ${oldTown.length} businesses in the directory`), 'the count comes from the data');
  for (const row of oldTown) assert.ok(html.includes(`href="/eat-shop/#${row.slug}"`), `${row.slug} is linked to its directory row`);
  const listed = [...html.matchAll(/href="\/eat-shop\/#([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(listed)].sort(), oldTown.map((e) => e.slug).sort(), 'and nothing that is not in Old Town');
  for (const s of annualEvents.filter((s) => /Old Town|Second Avenue/.test(s.where))) {
    assert.ok(html.includes(`href="/annual-events/#${s.id}"`), `${s.id} on the avenue`);
  }
});

test('the residents’ page sends every first-week task to the body that handles it', () => {
  const html = read('/living-in-niwot/');
  const destinations = new Set(services.map((s) => s.href));
  const links = [...html.matchAll(/<a class="n-link" href="(https:\/\/[^"]+)" rel="noopener" style="justify-self:start">Go there/g)].map((m) => m[1]);
  assert.equal(links.length, 6, 'six first-week tasks');
  for (const href of links) assert.ok(destinations.has(href), `${href} is not one of the resident-resource destinations`);
  /* The full table stays on the community page; this one is the checklist. */
  assert.ok(html.includes('href="/community/#resources"'), 'and points at the full table');
  assert.equal((html.match(/class="n-srow"/g) || []).length, 0, 'the services table is not duplicated here');
  assert.ok(html.includes('4,306'), 'the census figure is the sourced one');
});

test('the one-day itinerary is an order of things, not opening hours', () => {
  const html = read('/one-day-in-niwot/');
  assert.equal((html.match(/<li class="n-stop">/g) || []).length, 6, 'six stops');
  assert.match(html, /The times below are an order of things, not opening hours/);
  /* A clock time on this page would read as an opening time. */
  assert.ok(!/\b\d{1,2}(:\d{2})?\s?(am|pm)\b/i.test(html.slice(html.indexOf('id="day-h"'), html.indexOf('id="practical"'))), 'no clock times in the itinerary');
});
