import {
  Archive,
  ArrowUUpLeft,
  CalendarCheck,
  CalendarDots,
  CalendarX,
  CheckCircle,
  Clock,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  FileDashed,
  Globe,
  HourglassLow,
  HourglassMedium,
  NotePencil,
  PaperPlaneTilt,
  PauseCircle,
  PhoneDisconnect,
  Prohibit,
  UserMinus,
  VideoCamera,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { components } from "@/lib/api/schema";

type Schemas = components["schemas"];

// Each kind's statuses come from the contract, so a status the API adds
// fails `pnpm typecheck` until it has a row here.
type Statuses = {
  appointment: Schemas["AppointmentStatus"];
  communication: Schemas["CommunicationStatus"];
  room: Schemas["VideoRoomSummary"]["state"];
  publication: Schemas["PublicationStatus"];
  approval: Schemas["ApprovalStatus"];
  service: Schemas["ServiceState"];
  enquiry: Schemas["ContactEnquiry"]["status"];
};

export type StatusKind = keyof Statuses;
export type StatusOf<K extends StatusKind> = Statuses[K];

// `tint` and `text` are whole Tailwind classes so the build sees them.
export type StatusStyle = {
  label: string;
  tint: string;
  text: string;
  icon: Icon;
};

const ochre = { tint: "bg-ochre/12", text: "text-gold-text" };
const indigo = { tint: "bg-indigo/12", text: "text-indigo" };
const olive = { tint: "bg-olive/12", text: "text-ink" };
const paper = { tint: "bg-paper", text: "text-muted" };
const red = { tint: "bg-red/12", text: "text-action" };
const butter = { tint: "bg-butter/12", text: "text-gold-text" };

// Brief §3, as data: the admin badge and the public booking pages read the
// same rows, so the two can never disagree.
export const statuses: {
  [K in StatusKind]: Record<StatusOf<K>, StatusStyle>;
} = {
  appointment: {
    pending: { label: "Pending", ...ochre, icon: HourglassMedium },
    confirmed: { label: "Confirmed", ...indigo, icon: CheckCircle },
    completed: { label: "Completed", ...olive, icon: CalendarCheck },
    declined: { label: "Declined", ...paper, icon: XCircle },
    cancelled_by_client: {
      label: "Cancelled by client",
      ...red,
      icon: CalendarX,
    },
    cancelled_by_practitioner: {
      label: "Cancelled by Daw Mi",
      ...red,
      icon: CalendarX,
    },
    no_show: {
      label: "No-show",
      tint: "bg-violet/12",
      text: "text-ink",
      icon: UserMinus,
    },
    expired: { label: "Expired", ...paper, icon: HourglassLow },
  },
  communication: {
    queued: { label: "Queued", ...paper, icon: Clock },
    sent: { label: "Sent", ...indigo, icon: PaperPlaneTilt },
    failed: { label: "Failed", ...red, icon: WarningCircle },
    cancelled: { label: "Cancelled", ...paper, icon: Prohibit },
  },
  room: {
    waiting: { label: "Waiting", ...ochre, icon: HourglassMedium },
    in_session: { label: "In session", ...indigo, icon: VideoCamera },
    ended: { label: "Ended", ...paper, icon: PhoneDisconnect },
  },
  publication: {
    draft: { label: "Draft", ...paper, icon: NotePencil },
    review: { label: "In review", ...butter, icon: Eye },
    scheduled: {
      label: "Scheduled",
      tint: "bg-blue/12",
      text: "text-blue-text",
      icon: CalendarDots,
    },
    published: { label: "Published", ...olive, icon: Globe },
    unpublished: { label: "Unpublished", ...paper, icon: EyeSlash },
    archived: { label: "Archived", ...paper, icon: Archive },
  },
  approval: {
    not_reviewed: { label: "Not reviewed", ...paper, icon: FileDashed },
    needs_review: { label: "Needs review", ...butter, icon: WarningCircle },
    changes_requested: {
      label: "Changes requested",
      ...red,
      icon: ArrowUUpLeft,
    },
    approved: { label: "Approved", ...indigo, icon: CheckCircle },
  },
  // Booking state of a service (#75), in the publication tints.
  service: {
    active: { label: "Active", ...indigo, icon: CheckCircle },
    paused: { label: "Paused", ...ochre, icon: PauseCircle },
    archived: { label: "Archived", ...paper, icon: Archive },
  },
  // Contact enquiries (#77): New indigo, Handled paper.
  enquiry: {
    new: { label: "New", ...indigo, icon: EnvelopeSimple },
    handled: { label: "Handled", ...paper, icon: CheckCircle },
  },
};
