/* Resident resources. Niwot is unincorporated, so every public service is
   delivered by some other body. Each row names the one responsible and links
   to the page of its site that handles that service — not the site's front
   door — so a resident lands where the task is done.

   `group` is the topic heading the row renders under; the September 2026
   launch audit asked for the list grouped rather than flat. The heading
   order lives in community.njk's front matter: this file keeps a single
   default export, as every data file must (see README, "Content model").

   Destinations were confirmed as indexed pages on 2026-09-09; the Sheriff
   and Left Hand Water destinations were corrected on 2026-09-10 from the
   launch audit's link sweep (the old Sheriff address redirected to the
   office's jobs page; the district's .org address now redirects to .gov).
   `npm run links` checks that each still answers. */
export default [
  { group: 'Land, roads and permits', service: 'Land use and planning', handles: 'Zoning, subdivision and development review', who: 'Boulder County Planning', href: 'https://bouldercounty.gov/property-and-land/land-use/planning/' },
  { group: 'Land, roads and permits', service: 'Roads and snow removal', handles: 'Maintenance, plowing and signage on county roads', who: 'County Road Maintenance', href: 'https://bouldercounty.gov/transportation/road-maintenance/' },
  { group: 'Land, roads and permits', service: 'Building permits', handles: 'Permits and inspections', who: 'County Building Division', href: 'https://bouldercounty.gov/property-and-land/land-use/building/building-permits/' },
  { group: 'Safety and emergencies', service: 'Law enforcement', handles: 'Patrol and response in unincorporated areas', who: 'County Sheriff', href: 'https://bouldercounty.gov/safety/sheriff/' },
  { group: 'Safety and emergencies', service: 'Fire and rescue', handles: 'Fire suppression, rescue and emergency medical response', who: 'Mountain View Fire Rescue', href: 'https://www.mvfpd.org/' },
  { group: 'Water and sewer', service: 'Drinking water', handles: 'Water service, rates and meters', who: 'Left Hand Water District', href: 'https://lefthandwater.gov/' },
  { group: 'Water and sewer', service: 'Sewer', handles: 'Sanitary sewer service and billing where the district’s lines run; coverage depends on the address', who: 'Niwot Sanitation District', href: 'https://niwotsd.colorado.gov/' },
  { group: 'Schools, parks and elections', service: 'Schools', handles: 'Enrollment, boundaries and transportation', who: 'St. Vrain Valley Schools', href: 'https://www.svvsd.org/' },
  { group: 'Schools, parks and elections', service: 'Parks and open space', handles: 'Trail closures and alerts, open space rules and dog regulations', who: 'County Parks & Open Space', href: 'https://bouldercounty.gov/open-space/parks-and-trails/trail-closures/' },
  { group: 'Schools, parks and elections', service: 'Elections', handles: 'Registration, ballots, drop-off locations and results', who: 'County Elections', href: 'https://bouldercounty.gov/elections/' },
];
