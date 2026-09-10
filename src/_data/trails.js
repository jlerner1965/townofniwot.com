/* Parks and trails around Niwot.

   Niwot is unincorporated, so it has no parks department. Whistle Stop Park
   was built and is run by the Cultural Arts Association; everything beyond
   the built-up blocks is Boulder County Parks & Open Space. That is why
   almost every row here ends in a county link: the county is the authority
   on surfaces, closures, dogs and access, and this guide's job is to say
   which page holds which answer rather than to restate it.

   What is deliberately not here: segment distances, surface types, gradients
   and accessibility gradings. The county publishes those on the pages linked
   from each record and on its Niwot trails map; this guide has not measured
   them and will not repeat numbers it has not read. The one distance stated
   is the LoBo's overall length, which the county's own trail page gives.

   `facts` are rendered as a definition list under each entry, in order. Each
   one is a statement from the source named in `sourceUrl`. `links` are the
   pages that hold what this guide does not.

   Compiled 2026-09-10 from the county pages already cited elsewhere on this
   site and from the Cultural Arts Association's Whistle Stop Park page, the
   same sources the Things to Do page and the history timeline used. The audit
   sandbox could not open them directly; an editor should confirm each before
   promotion. */

const county = { name: 'Boulder County Parks & Open Space', url: 'https://bouldercounty.gov/open-space/parks-and-trails/' };
const ncaa = { name: 'Niwot Cultural Arts Association', url: 'https://niwotarts.org/' };

const CHECKED = '2026-09-10';

export default [
  {
    id: 'whistle-stop-park',
    name: 'Whistle Stop Park',
    kind: 'Park',
    summary:
      'The park at the south-west corner of Murray Street and First Avenue, at the edge of Old Town. It keeps CB&Q 14649 — a Burlington Route caboose built in 1907 — on a short length of track, and its lawn is where the summer concert series is held.',
    facts: [
      { label: 'Where', value: 'South-west corner of Murray Street and First Avenue, at the edge of Old Town' },
      { label: 'Run by', value: 'The Niwot Cultural Arts Association, which built it' },
      { label: 'On the ground', value: 'A lawn, and the caboose on its track' },
      { label: 'What happens here', value: 'Rock & Rails on summer Thursdays, and the Rise benefit concert after the season' },
    ],
    links: [{ label: 'Whistle Stop Park, Cultural Arts Association', href: 'https://niwotarts.org/whistle-stop-park/' }],
    keeper: ncaa,
    sourceUrl: 'https://niwotarts.org/whistle-stop-park/',
    verifiedAt: CHECKED,
  },
  {
    id: 'lobo-trail',
    name: 'LoBo Regional Trail',
    kind: 'Regional trail',
    summary:
      'The Longmont-to-Boulder trail: twelve miles between the two cities, through Gunbarrel and Niwot, and the reason a bike is a reasonable way to arrive. It runs through the community and joins the local trail network.',
    facts: [
      { label: 'Length', value: 'Twelve miles, Longmont to Boulder' },
      { label: 'Through', value: 'Gunbarrel and Niwot' },
      { label: 'Managed by', value: 'Boulder County Parks & Open Space' },
      { label: 'Surface, grades and access', value: 'On the county’s trail page and its trails map — this guide has not measured them' },
    ],
    links: [{ label: 'LoBo Regional Trail, Boulder County', href: 'https://bouldercounty.gov/open-space/parks-and-trails/lobo-trail/' }],
    keeper: county,
    sourceUrl: 'https://bouldercounty.gov/open-space/parks-and-trails/lobo-trail/',
    verifiedAt: CHECKED,
  },
  {
    id: 'niwot-trails',
    name: 'The local Niwot trails',
    kind: 'Local connections',
    summary:
      'The paths that link the two commercial blocks, the neighborhoods and the regional trail. The county publishes them as one map, which is the document to carry: it shows the connections this guide would otherwise have to describe from memory.',
    facts: [
      { label: 'The map', value: 'The county’s Niwot trails map, a PDF published in 2017' },
      { label: 'Managed by', value: 'Boulder County Parks & Open Space' },
      { label: 'Note', value: 'This is the map the county links for Niwot. It is dated 2017, so alignments may have changed since' },
    ],
    links: [{ label: 'Niwot trails map, PDF (county, 2017)', href: 'https://assets.bouldercounty.gov/wp-content/uploads/2017/03/niwot-trails-map.pdf' }],
    keeper: county,
    sourceUrl: 'https://assets.bouldercounty.gov/wp-content/uploads/2017/03/niwot-trails-map.pdf',
    verifiedAt: CHECKED,
  },
  {
    id: 'left-hand-creek',
    name: 'Left Hand Creek and the eastern fields',
    kind: 'Open country',
    summary:
      'East of the built-up blocks the sidewalks stop and the farmland starts. Left Hand Creek crosses those fields, and the dirt trail along the grassland edge is where the Front Range sunset photograph on this site was taken.',
    facts: [
      { label: 'Where', value: 'East of the commercial blocks, where the sidewalks end' },
      { label: 'Best for', value: 'Walking and cycling; the fields at sunset, looking west' },
      { label: 'Access and rules', value: 'Set by Boulder County Parks & Open Space, not by a town' },
    ],
    links: [{ label: 'Boulder County parks and trails', href: 'https://bouldercounty.gov/open-space/parks-and-trails/' }],
    keeper: county,
    sourceUrl: 'https://bouldercounty.gov/open-space/parks-and-trails/',
    verifiedAt: CHECKED,
  },
];
