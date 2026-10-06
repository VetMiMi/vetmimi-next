// The contact-enquiry screens' URL ↔ API query mapping and the words they
// use (#77). Pure, so node:test covers it.
import type { components, operations } from "../api/schema.ts";

type Schemas = components["schemas"];
type Enquiry = Schemas["ContactEnquiry"];
type ListQuery = NonNullable<
  operations["listContactEnquiries"]["parameters"]["query"]
>;

// An enquiry carries no timezone of its own; the issue asks for Sydney
// time, the practice's.
export const PRACTICE_TIMEZONE = "Australia/Sydney";

export const PAGE_SIZE = 50;

// Overviews show minimal data (Booking UX §28): never more of the message
// than this, and only when there is no subject.
export const SUBJECT_FALLBACK_CHARS = 80;

export const views = [
  { id: "new", label: "New" },
  { id: "handled", label: "Handled" },
  { id: "all", label: "All" },
] as const;
export type View = (typeof views)[number]["id"];

export const enquiryTypes: Record<Schemas["EnquiryType"], string> = {
  collaboration: "Collaboration / Project",
  workshop: "Workshop / Program",
  speaking: "Speaking / Event",
  art_of_wellness: "Art of Wellness",
  media: "Media / Interview",
  organisation: "Organisation / Healthcare",
  general: "General",
};

export const localeNames: Record<Schemas["Locale"], string> = {
  en: "English",
  my: "Burmese",
};

export type ListFilters = { view: View; q?: string };

type SearchParams = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export function parseFilters(params: SearchParams): ListFilters {
  const view = views.find((v) => v.id === one(params.view))?.id ?? "new";
  const q = one(params.q)?.trim().slice(0, 100);
  return { view, ...(q && { q }) };
}

export function listQuery(filters: ListFilters, cursor?: string): ListQuery {
  return {
    ...(filters.view !== "all" && { status: filters.view }),
    ...(filters.q && { q: filters.q }),
    ...(cursor && { cursor }),
    limit: PAGE_SIZE,
  };
}

// The default view stays out of the URL so the plain address is the one
// Daw Mi's navigation and emails use.
export function listHref(filters: ListFilters) {
  const params = new URLSearchParams();
  if (filters.view !== "new") params.set("view", filters.view);
  if (filters.q) params.set("q", filters.q);
  const query = params.toString();
  return query ? `/admin/enquiries?${query}` : "/admin/enquiries";
}

// The subject, or the start of the message cut at a word where it can be.
export function subjectLine(enquiry: Pick<Enquiry, "subject" | "message">) {
  const subject = enquiry.subject?.trim();
  if (subject) return subject;
  const text = enquiry.message.replace(/\s+/g, " ").trim();
  if (text.length <= SUBJECT_FALLBACK_CHARS) return text;
  const cut = text.slice(0, SUBJECT_FALLBACK_CHARS - 1);
  const space = cut.lastIndexOf(" ");
  return `${space > SUBJECT_FALLBACK_CHARS / 2 ? cut.slice(0, space) : cut}…`;
}

// What a list row may carry to the browser: no email, no message.
export type EnquiryRow = {
  id: string;
  reference: string;
  createdAt: string;
  name: string;
  type: string;
  subject: string;
  service?: string;
  status: Enquiry["status"];
};

export function toRow(enquiry: Enquiry): EnquiryRow {
  return {
    id: enquiry.id,
    reference: enquiry.reference,
    createdAt: enquiry.createdAt,
    name: enquiry.name,
    type: enquiryTypes[enquiry.enquiryType],
    subject: subjectLine(enquiry),
    ...(enquiry.service && {
      service: enquiry.service.name.en ?? enquiry.service.slug,
    }),
    status: enquiry.status,
  };
}

// "Reply" opens Daw Mi's own email with the subject filled in; replying
// from the admin is out of scope (#77).
export function replyHref(enquiry: Enquiry) {
  const topic = enquiry.subject?.trim() || enquiryTypes[enquiry.enquiryType];
  const subject = `Re: ${topic} (${enquiry.reference})`;
  return `mailto:${enquiry.email}?subject=${encodeURIComponent(subject)}`;
}
