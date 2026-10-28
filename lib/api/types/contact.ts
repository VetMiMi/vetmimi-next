import type { Locale } from "./shared.ts";
import type { ServiceRef } from "./booking.ts";

export type EnquiryType =
  | "collaboration"
  | "workshop"
  | "speaking"
  | "art_of_wellness"
  | "media"
  | "organisation"
  | "general";

export type ContactEnquiryCreate = {
  name: string;
  email: string;
  organisation?: string;
  enquiryType: EnquiryType;
  service?: string;
  subject?: string;
  message: string;
  locale: Locale;
  privacyAcknowledged: true;
};

export type ContactEnquiryReceipt = { reference: string; createdAt: string };

export type ContactEnquiry = {
  id: string;
  reference: string;
  name: string;
  email: string;
  organisation?: string;
  enquiryType: EnquiryType;
  service?: ServiceRef;
  subject?: string;
  message: string;
  locale: Locale;
  status: "new" | "handled";
  handledAt?: string;
  handledBy?: string;
  createdAt: string;
};
