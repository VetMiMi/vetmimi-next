// Wall-clock dates and times in the practice timezone (an IANA name from
// settings), never the browser's or the server's own zone. Dates are
// "YYYY-MM-DD" keys and times "HH:MM", as the date and time inputs give
// them; instants are UTC RFC 3339 strings, as the API takes them.

const HOUR = 3_600_000;

const partsFormat = new Map<string, Intl.DateTimeFormat>();

function formatIn(timeZone: string) {
  let format = partsFormat.get(timeZone);
  if (!format) {
    format = new Intl.DateTimeFormat("en-AU", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    partsFormat.set(timeZone, format);
  }
  return format;
}

// The calendar date and clock time an instant shows in `timeZone`.
export function zonedParts(
  instant: Date | string,
  timeZone: string,
): { date: string; time: string } {
  const parts = Object.fromEntries(
    formatIn(timeZone)
      .formatToParts(new Date(instant))
      .map(({ type, value }) => [type, value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

export function todayIn(timeZone: string, now = new Date()): string {
  return zonedParts(now, timeZone).date;
}

// Milliseconds the zone is ahead of UTC at an instant.
function offsetAt(ms: number, timeZone: string): number {
  const { date, time } = zonedParts(new Date(ms), timeZone);
  const asUtc = Date.parse(`${date}T${time}:00Z`);
  return asUtc - Math.floor(ms / 60_000) * 60_000;
}

// The instant a wall-clock time on a date happens in `timeZone`, or null
// when the clocks skip it (02:30 on the morning daylight saving starts).
// When the clocks go back and the time happens twice, the first one wins.
export function zonedInstant(
  date: string,
  time: string,
  timeZone: string,
): string | null {
  const wall = Date.parse(`${date}T${time}:00Z`);
  if (Number.isNaN(wall)) return null;
  // The zone's offset a day either side covers both sides of any change.
  const offsets = new Set([
    offsetAt(wall - 24 * HOUR, timeZone),
    offsetAt(wall + 24 * HOUR, timeZone),
  ]);
  const matches = [...offsets]
    .map((offset) => wall - offset)
    .filter((ms) => {
      const parts = zonedParts(new Date(ms), timeZone);
      return parts.date === date && parts.time === time.slice(0, 5);
    })
    .sort((a, b) => a - b);
  return matches.length > 0 ? new Date(matches[0]).toISOString() : null;
}

// Local midnight, the start of a whole-day block. Sydney never skips
// midnight; a zone that does starts the day at its first real minute.
export function zonedDayStart(date: string, timeZone: string): string {
  for (let minutes = 0; minutes < 24 * 60; minutes += 30) {
    const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mm = String(minutes % 60).padStart(2, "0");
    const instant = zonedInstant(date, `${hh}:${mm}`, timeZone);
    if (instant) return instant;
  }
  throw new Error(`No start of day for ${date} in ${timeZone}`);
}

// "AEDT" at that instant; a zone without a short name gives "GMT+11".
export function zoneAbbreviation(instant: Date | string, timeZone: string) {
  return (
    new Intl.DateTimeFormat("en-AU", { timeZone, timeZoneName: "short" })
      .formatToParts(new Date(instant))
      .find((part) => part.type === "timeZoneName")?.value ?? timeZone
  );
}

// "Sydney time (AEST/AEDT)": the city and the zone's names through the
// year, standard time first.
export function zoneLabel(timeZone: string, year = new Date().getFullYear()) {
  const city = timeZone.split("/").pop()!.replaceAll("_", " ");
  const seasons = [`${year}-01-15T00:00:00Z`, `${year}-07-15T00:00:00Z`]
    .map((instant) => ({
      name: zoneAbbreviation(instant, timeZone),
      offset: offsetAt(Date.parse(instant), timeZone),
    }))
    .sort((a, b) => a.offset - b.offset);
  const names = [...new Set(seasons.map((season) => season.name))];
  return `${city} time (${names.join("/")})`;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// "Tue 13 Oct" for a date key; the key is already the practice's date, so
// no zone is involved.
export function formatDay(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${WEEKDAYS[weekday]} ${d} ${MONTHS[m - 1]}`;
}

// "2:00 pm" for "14:00".
export function formatClock(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h < 12 ? "am" : "pm";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${suffix}`;
}
