/* Primary navigation, in the order it renders. `key` matches the `navKey` set
   in each page's front matter to mark the active item.

   Six choices for sixteen pages. The September 2026 launch audit cut a
   seven-item menu to five on the grounds that the site was smaller than its
   menu; the landing pages added after it are the opposite problem, so the
   menu now carries one entry per thing a visitor arrives looking for —
   things to do, somewhere to eat, what is on, the outdoors — plus the two
   the residents come for.

   What is deliberately not in it: the full business directory (reached from
   Restaurants and from Things to Do), the annual guide and the Rock & Rails
   guide (from Events), Old Town and the one-day itinerary (from Things to
   Do), the history, Plan a Visit and Community (from Living Here and from
   the homepage). Every one of them is in the footer of every page, which is
   where a menu this size stops being the right instrument. */
export default [
  { key: 'things-to-do', label: 'Things to Do', href: '/things-to-do/' },
  { key: 'restaurants', label: 'Restaurants', href: '/restaurants/' },
  { key: 'events', label: 'Events', href: '/events/' },
  { key: 'parks-trails', label: 'Parks & Trails', href: '/parks-trails/' },
  { key: 'living', label: 'Living Here', href: '/living-in-niwot/' },
  { key: 'civic', label: '2026 Election', href: '/civic/incorporation-election/' },
];
