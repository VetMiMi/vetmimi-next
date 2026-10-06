// Calendar days as "YYYY-MM-DD" keys in the visitor's own time zone.
// toISOString() and new Date("YYYY-MM-DD") both work in UTC, which moves a
// picked day by one either side of Greenwich (#24).

export function toLocalDateKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

// Local midnight of the key's day.
export function fromLocalDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// The key `days` calendar days later (or earlier). Whole days, not 24-hour
// steps, so a daylight-saving change cannot land on the wrong date.
export function addDays(key: string, days: number): string {
  const date = fromLocalDateKey(key);
  date.setDate(date.getDate() + days);
  return toLocalDateKey(date);
}
