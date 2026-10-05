// Times as <input type="time"> gives them: zero-padded 24-hour "HH:MM" (or
// "HH:MM:SS"). Zero-padding makes string order the same as time order, so no
// Date is built and no time zone can move either end.

// True when the end is filled and at or before the start. An empty start
// sorts before every time, so it never counts. A period never runs past
// midnight, so 23:00 to 01:00 is backwards too.
export function endsTooEarly(start: string, end: string): boolean {
  return end !== "" && end <= start;
}
