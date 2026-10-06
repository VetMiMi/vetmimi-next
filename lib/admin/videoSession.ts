// What the appointment's Video session block shows (#83). Pure, so
// node:test covers it. The API decides what Daw Mi may do (allowedActions);
// this only picks the sentence and the button for it.
import type { components } from "../api/schema.ts";
import { formatClock, zoneAbbreviation, zonedParts } from "../zonedTime.ts";

type Detail = components["schemas"]["AppointmentDetail"];

export type VideoPanelState =
  | "none" // no VetMiMi room: in person, a pasted link, or not confirmed yet
  | "before_window"
  | "can_start"
  | "closed" // the window has passed without the room ending
  | "ended";

export function videoPanelState(
  a: Pick<Detail, "videoRoom" | "allowedActions">,
  now: string,
): VideoPanelState {
  const room = a.videoRoom;
  if (!room) return "none";
  if (room.state === "ended") return "ended";
  if (a.allowedActions.includes("start_video")) return "can_start";
  if (Date.parse(now) < Date.parse(room.opensAt)) return "before_window";
  return "closed";
}

// "9:45 am" in the practice timezone.
export const clock = (instant: string, timeZone: string) =>
  formatClock(zonedParts(instant, timeZone).time);

// "Opens 9:45 am · closes 11:30 am AEDT", which may wrap only after "·".
export function roomWindow(
  room: { opensAt: string; closesAt: string },
  timeZone: string,
) {
  const opens = `Opens ${clock(room.opensAt, timeZone)}`;
  const closes = `closes ${clock(room.closesAt, timeZone)} ${zoneAbbreviation(room.closesAt, timeZone)}`;
  const unbroken = (text: string) => text.replaceAll(" ", "\u00a0");
  return `${unbroken(opens)} · ${unbroken(closes)}`;
}

// The visitor's first name for Daw Mi's status line ("Waiting for Ana to
// join."); the whole name if it has one word.
export const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;
