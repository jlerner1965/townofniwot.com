/* 2nd Avenue & Cottonwood Square directory, by category.
   side: 'old' = Historic 2nd Avenue, 'new' = Cottonwood Square.
   Names are intentionally categories, not business names; the Niwot Business
   Association keeps the authoritative listing at the url below. */
export const directoryUrl = 'https://niwot.com/business-directory/';
export const places = [
  { name: 'Antiques & vintage', side: 'old', image: 'assets/img/second-avenue.svg', url: directoryUrl },
  { name: 'Galleries & studios', side: 'old', image: 'assets/img/art-walk.svg', url: directoryUrl },
  { name: 'Tavern & dining', side: 'old', image: 'assets/img/second-avenue.svg', url: directoryUrl },
  { name: 'Bakery, coffee & wine', side: 'old', image: 'assets/img/second-avenue.svg', url: directoryUrl },
  { name: 'Boutiques & gifts', side: 'old', image: 'assets/img/second-avenue.svg', url: directoryUrl },
  { name: 'The Grange hall', side: 'old', image: 'assets/img/grange.svg', url: 'https://niwot.org/' },
  { name: 'Market & everyday', side: 'new', image: 'assets/img/cottonwood-square.svg', url: directoryUrl },
  { name: 'Restaurants & patios', side: 'new', image: 'assets/img/cottonwood-square.svg', url: directoryUrl },
  { name: 'Wellness & services', side: 'new', image: 'assets/img/cottonwood-square.svg', url: directoryUrl }
];
