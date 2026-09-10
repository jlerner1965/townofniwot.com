/* Primary navigation, in the order it renders. `key` matches the `navKey` set
   in each page's front matter to mark the active item.

   Five choices, not seven: the September 2026 launch audit found the
   seven-item menu larger than the site needs. Our Story and Plan a Visit
   keep their URLs and are reached from the footer on every page, from the
   homepage hero (Plan a Visit) and from the Explore page (both). */
export default [
  { key: 'explore', label: 'Explore', href: '/explore/' },
  { key: 'eat-shop', label: 'Eat & Shop', href: '/eat-shop/' },
  { key: 'events', label: 'Events', href: '/events/' },
  { key: 'community', label: 'Community', href: '/community/' },
  { key: 'civic', label: '2026 Election', href: '/civic/incorporation-election/' },
];
