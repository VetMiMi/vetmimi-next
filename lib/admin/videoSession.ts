// What the appointment's Video session block shows (#83). Pure, so
// node:test covers it. The API decides what Daw Mi may do (allowedActions);
// this only picks the sentence and the button for it.
import type { Settings } from "../api/types/admin.ts";
import type { AppointmentDetail } from "../api/types/appointments.ts";
import { formatClock, zoneAbbreviation, zonedParts } from "../zonedTime.ts";

type Detail = AppointmentDetail;

export type VideoPanelState =
  | "none" // no room and no link to paste: in person, or a room comes on confirm
  | "meeting_link" // manual mode: the link Daw Mi pastes
  | "before_window"
  | "can_start"
  | "closed" // the window has passed without the room ending
  | "ended";

// A room made before the mode changed still wins: the visitor has its link.
export function videoPanelState(
  a: Pick<Detail, "videoRoom" | "allowedActions" | "format">,
  now: string,
  mode?: Settings["meetingLinkMode"],
): VideoPanelState {
  const room = a.videoRoom;
  if (!room) {
    const manual = mode === "manual_link" && a.format === "online";
    return manual ? "meeting_link" : "none";
  }
  if (room.state === "ended") return "ended";
  if (a.allowedActions.includes("start_video")) return "can_start";
  if (Date.parse(now) < Date.parse(room.opensAt)) return "before_window";
  return "closed";
}

export const LINK_ERROR = "Enter a link that starts with https://.";

// The API keeps only an https:// address with a host.
export const meetingLinkError = (link: string) =>
  /^https:\/\/[^\s/?#]+\S*$/.test(link.trim()) ? undefined : LINK_ERROR;

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
