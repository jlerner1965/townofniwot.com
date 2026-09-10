/* ItemList structured data for the restaurant guide.

   The same entities the directory's ItemList carries, so each business keeps
   one identifier across the two pages: `@id` is the directory row, which is
   where the record and its checked date live, while the ListItem's own `url`
   is the entry on this page. Only fields a source stated are emitted —
   `servesCuisine` comes from the record's `cuisine`, which is condensed from
   its sourced description, and hours, phone numbers, coordinates, ratings
   and price ranges are never asserted (see lib/directory.js).

   `priceRange` appears only on a record that carries one; none does today,
   so none is emitted. */
import listings from './_data/listings.js';
import site from './_data/site.js';

const rows = listings.food.entries.filter((entry) => entry.status === 'active');

export default {
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Restaurants, cafés and food shops in Niwot, Colorado',
    numberOfItems: rows.length,
    itemListElement: rows.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${site.url}/restaurants/#${entry.slug}`,
      item: {
        '@type': entry.schemaType || 'LocalBusiness',
        '@id': `${site.url}/eat-shop/#${entry.slug}`,
        name: entry.name,
        ...(entry.description ? { description: entry.description } : {}),
        ...(entry.cuisine ? { servesCuisine: entry.cuisine } : {}),
        ...(entry.menuUrl ? { hasMenu: entry.menuUrl } : {}),
        ...(entry.priceRange ? { priceRange: entry.priceRange } : {}),
        url: entry.href,
        address: {
          '@type': 'PostalAddress',
          ...(entry.address ? { streetAddress: entry.address } : {}),
          ...(entry.postalCode ? { postalCode: entry.postalCode } : {}),
          addressLocality: 'Niwot',
          addressRegion: 'CO',
          addressCountry: 'US',
        },
      },
    })),
  },
};
