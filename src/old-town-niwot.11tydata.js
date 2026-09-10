/* The Old Town page's two derived lists.

   Both are computed from the directory and the annual series rather than
   kept as a second copy: a business added to src/_data/listings.js with an
   Old Town area, or a series whose location names the avenue, appears here
   on the same build. Doing the grouping here rather than in the template
   also keeps Nunjucks out of the business of building arrays inside nested
   loops, which it does not do well.

   `area` is the record's own district wording — "Old Town, Second Avenue",
   "Old Town, 300 block" — so matching on "Old Town" is matching what the
   editor wrote, not geocoding an address. */
import listings from './_data/listings.js';
import annualEvents from './_data/annualEvents.js';

const inOldTown = (entry) => Boolean(entry.area && entry.area.includes('Old Town'));

export default {
  oldTownGroups: listings.categories
    .filter((c) => c.slug !== 'all')
    .map((c) => ({ ...c, entries: listings.entries.filter((e) => e.category === c.slug && inOldTown(e)) }))
    .filter((c) => c.entries.length > 0),

  oldTownCount: listings.entries.filter(inOldTown).length,

  /* The series held on the avenue itself. Rock & Rails is at Whistle Stop
     Park, which the page names separately: the park is at the end of the
     block, not on it. */
  oldTownSeries: annualEvents.filter((s) => /Old Town|Second Avenue/.test(s.where)),
};
