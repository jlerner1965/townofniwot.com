/* The recurring programme: events Niwot holds every year.

   This is a different record from `events.js`. That file holds dated
   occurrences and will only carry a date an organizer has published; this
   one describes the series itself — who runs it, roughly when it lands, and
   what happens — so that a reader arriving in February can still find out
   what Rock & Rails is without a single 2027 date existing anywhere.

   The rules are the same ones the calendar keeps:

   - `season` is the organizer's own wording for when the series runs, never
     a date this guide worked out. Where a series is tied to a fixed day
     ("the evening after Thanksgiving") that is what it says.
   - `sourceUrl` is the page the record was read from, `verifiedAt` the day
     it was read. Every entry names its organizer.
   - `eventIds` are the ids in events.js this series covers. The page uses
     them to show the confirmed dates that exist, so the two files cannot
     drift: a series with a published date shows it, a series without says
     it has none yet.
   - Nothing here is Event structured data. A series is not a scheduled
     occurrence, and marking it as one would tell search engines a date this
     guide does not have. The dated instances on /events/ carry that markup.

   Compiled 2026-09-10 from the same reading of niwot.com, niwotarts.org and
   the Left Hand Valley Courier that the September 2026 audits recorded in
   events.js; each record's `sourceUrl` is the page its own facts came from.
   The audit sandbox could not open those sites directly, so an editor should
   confirm each series on its cited page before promotion — the same caveat
   that stands on the event records themselves. */

import { assertValidAnnualEvents, buildNow } from '../../lib/events.js';
import { zonedParts } from '../assets/js/calendar-core.js';
import events from './events.js';

const nba = { name: 'Niwot Business Association', url: 'https://niwot.com/' };
const ncaa = { name: 'Niwot Cultural Arts Association', url: 'https://niwotarts.org/' };

const CHECKED = '2026-09-09';
const SWEEP = '2026-09-10';

const series = [
  {
    id: 'rock-rails',
    name: 'Rock & Rails',
    season: 'Thursday evenings, June to August',
    where: 'Whistle Stop Park, Old Town',
    cost: 'Free admission',
    organizer: ncaa,
    withOrganizer: nba,
    sourceUrl: 'https://niwotarts.org/rock-rails/',
    verifiedAt: CHECKED,
    eventIds: ['rock-rails-2026', 'rock-rails-2027'],
    guideUrl: '/events/rock-and-rails/',
    tag: 'Concerts',
    body:
      'The free outdoor concert series on the lawn beside the caboose, and the largest thing Niwot does. The Cultural Arts Association produces it with the Business Association. The 2026 season ran every Thursday from June 4 to August 27, with happy hour and opening music from 5pm and the headline band from 6:30pm; the following season’s dates and line-up are published in the spring.',
  },
  {
    id: 'second-friday-art-walk',
    name: 'Second Friday Art Walk',
    season: 'Second Friday of the month, 5 to 9pm',
    where: 'Old Town and Cottonwood Square',
    cost: 'Free',
    organizer: nba,
    sourceUrl: 'https://niwot.com/upcoming-events/',
    verifiedAt: CHECKED,
    eventIds: ['second-friday-art-walk-2026-09-11'],
    tag: 'Art',
    body:
      'Shops through both commercial blocks stay open late with art, music and features through the evening, and the galleries open new shows to coincide. The hours are those on the organizer’s listing for the September 11, 2026 walk; individual months are listed on the Business Association’s calendar as they are confirmed.',
  },
  {
    id: 'dancing-under-the-stars',
    name: 'Dancing Under the Stars',
    season: 'Friday evenings through the summer — June to September in 2026',
    where: 'Cottonwood Square, Niwot Road and 79th Street',
    cost: 'Free',
    organizer: nba,
    sourceUrl: 'https://niwot.com/events/dancing-under-the-stars-2026/',
    verifiedAt: CHECKED,
    eventIds: ['dancing-under-the-stars-2026'],
    tag: 'Dance',
    body:
      'A free dance lesson at 7pm and then social dancing with a DJ from 7:45pm, outdoors on the square. The 2026 season ran every Friday from June 12 to September 18.',
  },
  {
    id: 'why-not-niwot',
    name: 'Why Not Niwot?',
    season: 'Late summer, closing on the September Art Walk',
    where: 'Niwot Hall',
    cost: 'Free',
    organizer: ncaa,
    sourceUrl: 'https://niwotarts.org/why-not-niwot/',
    verifiedAt: CHECKED,
    eventIds: ['why-not-niwot-awards-night-2026'],
    tag: 'Art',
    body:
      'The Cultural Arts Association’s juried show of work by Colorado artists, in its fifteenth year in 2026 with forty works by twenty artists. It closes with an awards ceremony and artists’ reception held during the September Art Walk, with the Niwot Community Semi-Marching Free Grange Band.',
  },
  {
    id: 'great-pumpkin-party',
    name: 'Niwot’s Great Pumpkin Party',
    season: 'The Saturday before Halloween in past years; the current year’s date is published by the organizer',
    where: 'Second Avenue, Old Town',
    organizer: nba,
    withOrganizer: { name: 'The Niwot Group at Compass', url: 'https://theniwotgroup.com/' },
    sourceUrl: 'https://niwot.com/events/niwots-great-pumpkin-party/',
    verifiedAt: CHECKED,
    eventIds: ['great-pumpkin-party-2026'],
    tag: 'Family',
    body:
      'A costume parade and trick-or-treating along Second Avenue, with hay rides, magic shows and a petting zoo. Co-hosted by the Business Association and The Niwot Group at Compass.',
  },
  {
    id: 'enchanted-evening',
    name: 'Enchanted Evening',
    season: 'The evening after Thanksgiving',
    where: 'Old Town and Cottonwood Square',
    cost: 'Free',
    organizer: nba,
    sourceUrl: 'https://niwot.com/events/enchanted-evening/',
    verifiedAt: CHECKED,
    eventIds: ['enchanted-evening-2026'],
    tag: 'Holiday',
    body:
      'The community tree lighting, Santa’s arrival by horse-drawn sleigh, carols and live music through both blocks. The organizer’s dated 2026 listing gives 6 to 9pm on November 27; the same page’s general description says the evening starts at 5pm, so check it before setting out.',
  },
  {
    id: 'holiday-parade',
    name: 'Niwot Holiday Parade',
    season: 'The Saturday after Thanksgiving, in the morning',
    where: 'Second Avenue, Murray Street to Niwot Road',
    cost: 'Free',
    organizer: nba,
    sourceUrl: 'https://niwot.com/upcoming-events/holidays-and-parades/',
    verifiedAt: SWEEP,
    eventIds: ['holiday-parade-2026'],
    tag: 'Holiday',
    body:
      'A morning parade down Second Avenue from Murray Street to Niwot Road, with Santa, the morning after Enchanted Evening. The start time is on the organizer’s page.',
  },
];

/* Validation runs on every import, as it does for the listings and the
   calendar: a series that points at an event record which no longer exists,
   or that puts a date where the season's wording belongs, stops the build. */
assertValidAnnualEvents(series, events, { today: zonedParts(buildNow()).date });

export default series;
