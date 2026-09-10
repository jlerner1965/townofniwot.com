/* Community organizations. `runs` is what the group actually operates — the
   line exists so a reader can tell which body to approach for what.

   `kind` separates the volunteer and membership groups from the public
   bodies that happen to carry Niwot's name: a reader should not approach
   the county's improvement district or the Election Commission as if they
   were clubs. Each entry's `body` is one or two sentences drawn from the
   organization's own site (or, for the district, the county's page) as read
   on 2026-09-09; the September 2026 launch audit asked for them short, and
   the `runs` line carries the detail. */
export default [
  {
    name: 'Niwot Business Association',
    kind: 'community',
    body: 'The membership organization for local businesses: the members’ directory with current hours, the community events calendar, and the seasonal gatherings in Old Town.',
    runs: 'Business directory, events calendar, seasonal gatherings in Old Town',
    href: 'https://niwot.com/',
    linkLabel: 'niwot.com',
  },
  {
    name: 'Niwot Cultural Arts Association',
    kind: 'community',
    body: 'A volunteer non-profit, formed in 2009, that funds and organizes the arts in Niwot, from Whistle Stop Park and the Sculpture Park to the summer concerts.',
    runs: 'Whistle Stop Park, Niwot Sculpture Park, Why Not Niwot?, Rock & Rails',
    href: 'https://niwotarts.org/',
    linkLabel: 'niwotarts.org',
  },
  {
    name: 'Niwot Historical Society',
    kind: 'community',
    body: 'Preserves and shares the history of Niwot: an online timeline of 150 years, walking tours, lectures and archives.',
    runs: 'History timeline, walking tours, lectures, archives',
    href: 'https://niwothistoricalsociety.org/',
    linkLabel: 'niwothistoricalsociety.org',
  },
  {
    name: 'Niwot Community Association',
    kind: 'community',
    body: 'An all-volunteer non-profit of household members, established in 1990, that speaks for residents to Boulder County and holds community events.',
    runs: 'Residents’ voice to the county, community events',
    href: 'https://niwot.org/',
    linkLabel: 'niwot.org',
  },
  {
    name: 'Niwot Election Commission',
    kind: 'public',
    body: 'Appointed by the Boulder County District Court to administer the November 2026 incorporation election; it publishes the official ballot language and takes no position on the question.',
    runs: 'Official ballot language, election notices, voter information',
    href: 'https://niwotelection.org/',
    linkLabel: 'niwotelection.org',
  },
  {
    name: 'Niwot Local Improvement District',
    kind: 'public',
    body: 'A Boulder County improvement district funded by a 1% sales tax in the business area; an advisory committee recommends spending to the County Commissioners, who serve as its board.',
    runs: 'Sales-tax spending on the business district, decided by the county',
    href: 'https://bouldercounty.gov/government/boards-and-commissions/niwot-local-improvement-district/',
    linkLabel: 'bouldercounty.gov',
  },
];
