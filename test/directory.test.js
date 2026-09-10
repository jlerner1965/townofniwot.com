import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CATEGORIES,
  FOOD_CATEGORIES,
  FOOD_GROUPS,
  FRESHNESS_DAYS,
  validateListings,
  publishListings,
  normaliseAddress,
  humanDate,
} from '../lib/directory.js';
import listings from '../src/_data/listings.js';

const TODAY = '2026-09-09';
const good = {
  slug: 'good-place',
  name: 'Good Place',
  category: 'restaurants-bars',
  address: '1 Second Avenue',
  website: 'https://example.com/',
  /* A published food record must say which group the restaurant guide files
     it under; see the FOOD_GROUPS rules in lib/directory.js. */
  guide: 'sit-down',
  sourceUrl: 'https://example.com/',
  verifiedAt: '2026-09-01',
  status: 'active',
};
const errorsOf = (records) => validateListings(records, { today: TODAY }).errors;

test('a complete record passes', () => {
  assert.deepEqual(errorsOf([good]), []);
});

test('missing name, category, source and verification date are each reported', () => {
  const { name, category, sourceUrl, verifiedAt, ...rest } = good;
  const errors = errorsOf([rest]);
  for (const field of ['name is missing', 'category is missing', 'sourceUrl is missing', 'verifiedAt is missing']) {
    assert.ok(errors.some((e) => e.includes(field)), `expected "${field}" in ${errors}`);
  }
});

test('an unknown category is rejected', () => {
  assert.ok(errorsOf([{ ...good, category: 'nightlife' }]).some((e) => e.includes('category "nightlife"')));
});

test('duplicate businesses are detected by slug and by normalised name', () => {
  const errors = errorsOf([good, { ...good, slug: 'good-place-2', name: 'The Good Place, LLC' }]);
  assert.ok(errors.some((e) => e.includes('duplicate business')));
  assert.ok(errorsOf([good, { ...good }]).some((e) => e.includes('duplicate slug')));
});

test('invalid and insecure URLs are rejected', () => {
  assert.ok(errorsOf([{ ...good, website: 'not a url' }]).some((e) => e.includes('not a valid URL')));
  assert.ok(errorsOf([{ ...good, website: 'http://example.com/' }]).some((e) => e.includes('http://')));
  assert.ok(errorsOf([{ ...good, sourceUrl: 'ftp://example.com/' }]).some((e) => e.includes('https://')));
});

test('a stale active record fails the freshness threshold; a closed one does not', () => {
  const stale = { ...good, verifiedAt: '2025-01-01' };
  assert.ok(errorsOf([stale]).some((e) => e.includes(`${FRESHNESS_DAYS}-day freshness threshold`)));
  assert.deepEqual(errorsOf([{ ...stale, status: 'closed', editorialNote: 'Closed, per the Courier.' }]), []);
  const edge = { ...good, verifiedAt: '2026-03-13' }; /* exactly 180 days */
  assert.deepEqual(errorsOf([edge]), []);
});

test('verification dates in the future are rejected beyond a one-day timezone tolerance', () => {
  assert.deepEqual(errorsOf([{ ...good, verifiedAt: '2026-09-10' }]), []);
  assert.ok(errorsOf([{ ...good, verifiedAt: '2026-09-11' }]).some((e) => e.includes('in the future')));
  assert.ok(errorsOf([{ ...good, verifiedAt: '2026-02-30' }]).some((e) => e.includes('not a YYYY-MM-DD')));
});

test('two published records at one address must both acknowledge the sharing', () => {
  const other = { ...good, slug: 'other-place', name: 'Other Place', address: '1 2nd Ave' };
  const errors = errorsOf([good, other]);
  assert.ok(errors.some((e) => e.includes('is used by Good Place, Other Place')));
  assert.deepEqual(errorsOf([{ ...good, sharesAddress: true }, { ...other, sharesAddress: true }]), []);
  /* A closed record at the same address is the replacement case, not a clash. */
  assert.deepEqual(errorsOf([good, { ...other, status: 'closed', editorialNote: 'Replaced.' }]), []);
});

test('closed and unverified records need an editorial note', () => {
  assert.ok(errorsOf([{ ...good, status: 'closed' }]).some((e) => e.includes('needs an editorialNote')));
  assert.ok(errorsOf([{ ...good, status: 'unverified' }]).some((e) => e.includes('needs an editorialNote')));
});

test('address normalisation treats Second Avenue and 2nd Ave alike', () => {
  assert.equal(normaliseAddress('121 Second Avenue'), normaliseAddress('121 2nd Ave'));
  assert.notEqual(normaliseAddress('300 Second Avenue'), normaliseAddress('300 Second Avenue, Suite 102'));
});

test('publication drops closed and unverified rows, derives counts and never exposes notes', () => {
  const rows = [
    good,
    { ...good, slug: 'closed-place', name: 'Closed Place', status: 'closed', editorialNote: 'Secret note', address: '2 Second Avenue' },
    { ...good, slug: 'maybe-place', name: 'Maybe Place', status: 'unverified', editorialNote: 'Secret note', address: '3 Second Avenue' },
    { ...good, slug: 'cafe', name: 'Cafe', category: 'coffee-bakery', guide: 'coffee-sweets', address: '4 Second Avenue', verifiedAt: '2026-08-01', editorialNote: 'Internal' },
  ];
  const out = publishListings(rows);
  assert.deepEqual(out.entries.map((e) => e.slug), ['good-place', 'cafe']);
  assert.deepEqual(out.categories.map((c) => [c.slug, c.count]), [['all', 2], ['restaurants-bars', 1], ['coffee-bakery', 1]]);
  assert.ok(out.entries.every((e) => !('editorialNote' in e) && e.publicNote === undefined));
  assert.equal(out.verified.uniform, false);
  assert.match(out.verified.summary, /between August 1, 2026 and September 1, 2026/);
  assert.equal(humanDate('2026-09-09'), 'September 9, 2026');
});

test('an editorial note is published only when explicitly designated', () => {
  const out = publishListings([{ ...good, editorialNote: 'Say this', publishNote: true }]);
  assert.equal(out.entries[0].publicNote, 'Say this');
});

/* ---- the live data ---- */

test('the live directory validates and its category counts add up', () => {
  assert.deepEqual(validateListings(listings.records, { today: TODAY }).errors, []);
  const total = listings.categories.find((c) => c.slug === 'all').count;
  const sum = listings.categories.filter((c) => c.slug !== 'all').reduce((n, c) => n + c.count, 0);
  assert.equal(total, listings.entries.length);
  assert.equal(sum, listings.entries.length);
  assert.ok(listings.categories.every((c) => c.count > 0));
  assert.ok(CATEGORIES.every((c) => typeof c.slug === 'string' && /^[a-z-]+$/.test(c.slug)));
});

test('no active listing duplicates another', () => {
  const names = listings.entries.map((e) => e.name.toLowerCase());
  assert.equal(new Set(names).size, names.length);
});

test('1914 House is no longer an active listing', () => {
  const record = listings.records.find((r) => r.slug === '1914-house');
  assert.equal(record.status, 'closed');
  assert.ok(!listings.entries.some((e) => e.name === '1914 House'));
});

test('Taverna Laudisio and Love Ice Cream are published with the verified details', () => {
  const taverna = listings.entries.find((e) => e.slug === 'taverna-laudisio');
  assert.equal(taverna.address, '121 Second Avenue');
  assert.equal(taverna.postalCode, '80544');
  assert.equal(taverna.website, 'https://tavernalaudisio.com/');
  const love = listings.entries.find((e) => e.slug === 'love-ice-cream');
  assert.equal(love.address, '240 Second Avenue');
  assert.equal(love.sourceUrl, 'https://niwot.com/listing/love-ice-cream/');
});

test('Emory Jane’s and 2nd Nature Hair Lounge are present', () => {
  assert.ok(listings.entries.some((e) => e.slug === 'emory-janes-coffee-co'));
  assert.ok(listings.entries.some((e) => e.slug === '2nd-nature-hair-lounge' && e.address === '300 Second Avenue, Suite 101'));
});

test('The Wheel House has one verified address and its direct website', () => {
  const wheel = listings.entries.find((e) => e.slug === 'the-wheel-house');
  assert.equal(wheel.address, '101 Second Avenue, Suite B');
  assert.equal(wheel.website, 'https://www.niwotwheelhouse.com/');
  assert.equal(wheel.href, 'https://www.niwotwheelhouse.com/');
  assert.ok(!JSON.stringify(wheel).includes('300 Second'));
  const raw = listings.records.find((r) => r.slug === 'the-wheel-house');
  assert.match(raw.editorialNote, /124 2nd Ave/);
});

/* ---- the restaurant guide's facets ---- */

test('a published food record must name a guide group, and only a food record may', () => {
  const { guide, ...noGuide } = good;
  assert.ok(errorsOf([noGuide]).some((e) => e.includes('needs a guide group')));
  /* A closed record is not published, so it needs none. */
  assert.deepEqual(errorsOf([{ ...noGuide, status: 'closed', editorialNote: 'Closed.' }]), []);
  assert.ok(errorsOf([{ ...good, guide: 'brunch' }]).some((e) => e.includes('guide "brunch" is not one of')));
  assert.ok(
    errorsOf([{ ...good, category: 'shops-gifts' }]).some((e) => e.includes('guide is for food and drink records only')),
    'a shop may not carry a guide group'
  );
});

test('the facets are validated, and a price range may only be one of the four', () => {
  for (const field of ['cuisine', 'kind', 'patio', 'serves']) {
    assert.ok(errorsOf([{ ...good, [field]: '' }]).some((e) => e.includes(`${field} must be a non-empty string`)), field);
  }
  assert.ok(errorsOf([{ ...good, menuUrl: 'http://example.com/menu' }]).some((e) => e.includes('http://')));
  assert.ok(errorsOf([{ ...good, priceRange: 'cheap' }]).some((e) => e.includes('priceRange "cheap"')));
  assert.deepEqual(errorsOf([{ ...good, priceRange: '$$', menuUrl: 'https://example.com/menu' }]), []);
});

test('the guide groups the food rows, carries only the facets a record has, and links each row to its directory entry', () => {
  const rows = [
    { ...good, cuisine: 'Italian', kind: 'Sit-down', patio: 'Front patio' },
    { ...good, slug: 'counter', name: 'Counter', guide: 'quick', address: '5 Second Avenue', cuisine: 'Sandwiches' },
    { ...good, slug: 'shop', name: 'Shop', category: 'shops-gifts', guide: undefined, address: '6 Second Avenue' },
  ];
  const { food } = publishListings(rows);
  assert.deepEqual(food.entries.map((e) => e.slug), ['good-place', 'counter'], 'the shop is not in the food guide');
  assert.deepEqual(food.groups.map((g) => [g.slug, g.entries.length]), [['sit-down', 1], ['quick', 1]], 'empty groups are dropped');
  assert.deepEqual(food.groups.map((g) => g.slug), FOOD_GROUPS.filter((g) => ['sit-down', 'quick'].includes(g.slug)).map((g) => g.slug), 'groups keep their declared order');

  const [first, second] = food.entries;
  assert.deepEqual(first.facets.map((f) => f.label), ['Cuisine', 'Kind of place', 'Outdoor seating']);
  assert.deepEqual(second.facets.map((f) => f.label), ['Cuisine'], 'a record with one facet shows one');
  assert.equal(first.anchor, '/eat-shop/#good-place');
  assert.equal(first.directionsQuery, '1 Second Avenue, Niwot, CO 80503');
  assert.equal(second.directionsQuery, '5 Second Avenue, Niwot, CO 80503');
  assert.deepEqual(food.withPatio.map((e) => e.slug), ['good-place']);
  assert.deepEqual(food.withPrice, [], 'no record carries a price range');
});

test('a menu link is used where a record has one, and the business’s own site otherwise', () => {
  const { food } = publishListings([
    { ...good, menuUrl: 'https://example.com/menu' },
    { ...good, slug: 'no-site', name: 'No Site', address: '7 Second Avenue', website: undefined, sourceUrl: 'https://niwot.com/' },
  ]);
  const [withMenu, withoutSite] = food.entries;
  assert.equal(withMenu.menuHref, 'https://example.com/menu');
  assert.equal(withMenu.menuLabel, 'Menu');
  assert.equal(withoutSite.menuHref, null, 'a row with no site of its own offers no menu link');
  assert.equal(withoutSite.menuLabel, null);
  assert.deepEqual(food.withMenu.map((e) => e.slug), ['good-place']);
});

/* ---- the live food data ---- */

test('every published food listing is in the restaurant guide, with a cuisine or a kind', () => {
  const food = listings.entries.filter((e) => FOOD_CATEGORIES.includes(e.category));
  assert.equal(listings.food.entries.length, food.length, 'no food row is missing from the guide');
  assert.equal(listings.food.groups.reduce((n, g) => n + g.entries.length, 0), food.length);
  for (const row of listings.food.entries) {
    assert.ok(row.cuisine || row.kind, `${row.slug} says nothing about what it is`);
    assert.ok(row.facets.length >= 1, `${row.slug} has no facets`);
    /* A kitchen has to say both what it cooks and what sort of room it is;
       a grocery or a liquor store is described by its kind alone. */
    if (row.category === 'restaurants-bars' || row.category === 'coffee-bakery') {
      assert.ok(row.cuisine && row.kind, `${row.slug} needs both a cuisine and a kind`);
    }
  }
});

test('no live food record asserts a price range or a menu page, because no source publishes one', () => {
  assert.deepEqual(listings.food.withPrice, []);
  assert.deepEqual(listings.food.withMenu, []);
});

test('the patio facet is only on rows whose own description mentions the seating', () => {
  assert.ok(listings.food.withPatio.length > 0);
  for (const row of listings.food.withPatio) {
    assert.match(row.description, /patio/i, `${row.slug} claims a patio its description does not`);
  }
});
