/* The annual series joined to the dated occurrences on file.

   The join is a build-time data file rather than page front matter because
   two pages need it — the annual guide and the Rock & Rails guide — and they
   must agree. Doing it here also keeps the templates from composing a date:
   every occurrence rendered comes from an event record in
   src/_data/events.js, resolved through the series' `eventIds`, and carries
   the status the calendar gives it. A series whose next season the organizer
   has not dated resolves to a tentative record and renders as "expected",
   never as a date.

   `when` is relative to the build clock and re-decided on every build:
   `upcoming` for an occurrence still ahead, `past` for one already held (the
   last season is worth showing — it is what tells a reader in February which
   month to plan for), and `expected` for a tentative record. */
import annualEvents from './annualEvents.js';
import events from './events.js';
import { buildNow } from '../../lib/events.js';
import { zonedParts, clockTime, timeLabel } from '../assets/js/calendar-core.js';
import { humanDate } from '../../lib/directory.js';

/* `recurrence.weekday` is 0 for Sunday, as lib/events.js validates it. The
   long names live here rather than in calendar-core.js, which ships to the
   browser and has no use for them. */
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const byEventId = new Map(events.map((e) => [e.id, e]));

function occurrenceOf(event, today) {
  if (event.status === 'tentative') {
    return { id: event.id, when: 'expected', label: 'Expected — date not confirmed', detail: event.expected };
  }
  const end = event.recurrence ? event.recurrence.until : event.endDate || event.startDate;
  /* A season inside one year carries the year once, at the end. */
  const from = humanDate(event.startDate);
  const label = event.recurrence
    ? `${event.startDate.slice(0, 4) === event.recurrence.until.slice(0, 4) ? from.replace(/, \d{4}$/, '') : from} to ${humanDate(event.recurrence.until)}`
    : from;
  const detail = event.recurrence
    ? `Every ${WEEKDAYS[event.recurrence.weekday]}${event.startTime ? `, from ${clockTime(event.startTime)}` : ''}`
    : timeLabel(event) || (event.location && event.location.name) || '';
  return { id: event.id, when: end < today ? 'past' : 'upcoming', label, detail, startDate: event.startDate };
}

export default function () {
  const today = zonedParts(buildNow()).date;
  const series = annualEvents.map((s) => {
    const occurrences = s.eventIds.map((id) => byEventId.get(id)).filter(Boolean).map((e) => occurrenceOf(e, today));
    return {
      ...s,
      occurrences,
      next: occurrences.find((o) => o.when === 'upcoming') || null,
      last: [...occurrences].reverse().find((o) => o.when === 'past') || null,
      expected: occurrences.find((o) => o.when === 'expected') || null,
    };
  });

  return {
    series,
    /* Keyed for the pages that render one series rather than the list.
       Nunjucks has no way to break out of a loop, and `set` inside one does
       not escape it, so a lookup table is the only clean way to do this. */
    byId: Object.fromEntries(series.map((s) => [s.id, s])),
  };
}
