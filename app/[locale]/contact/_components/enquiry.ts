import type { components } from "@/lib/api/schema";

// The enquiry form's fields and their checks, run on blur and on submit.
type EnquiryType = components["schemas"]["EnquiryType"];
export type Field =
  "name" | "email" | "enquiryType" | "subject" | "message" | "privacy";
export type Form = Record<Exclude<Field, "privacy">, string> & {
  organisation: string;
  privacy: boolean;
};

// Stable ids are stored in the form; the visible labels come from messages
// and the API's enum is the snake_case form.
export const ENQUIRY_TYPES = {
  collaboration: "collaboration",
  workshop: "workshop",
  speaking: "speaking",
  artOfWellness: "art_of_wellness",
  media: "media",
  organisation: "organisation",
  general: "general",
} as const satisfies Record<string, EnquiryType>;
export type EnquiryId = keyof typeof ENQUIRY_TYPES;

export const MESSAGE_MAX = 5000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const FIELDS: Field[] = [
  "name",
  "email",
  "enquiryType",
  "subject",
  "message",
  "privacy",
];

type ErrorKey =
  | "name"
  | "nameLong"
  | "email"
  | "enquiryType"
  | "subject"
  | "subjectLong"
  | "message"
  | "messageLong"
  | "privacy";

// Message keys under contact.form.errors, by field.
export function check(form: Form): Partial<Record<Field, ErrorKey>> {
  const errors: Partial<Record<Field, ErrorKey>> = {};
  const name = form.name.trim();
  if (!name) errors.name = "name";
  else if (name.length > 120) errors.name = "nameLong";
  if (!EMAIL.test(form.email.trim())) errors.email = "email";
  if (!form.enquiryType) errors.enquiryType = "enquiryType";
  if (!form.subject.trim()) errors.subject = "subject";
  else if (form.subject.length > 200) errors.subject = "subjectLong";
  if (!form.message.trim()) errors.message = "message";
  else if (form.message.length > MESSAGE_MAX) errors.message = "messageLong";
  if (!form.privacy) errors.privacy = "privacy";
  return errors;
}
