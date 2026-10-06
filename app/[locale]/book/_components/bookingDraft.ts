import type { Format, Slot } from "./booking";

// Everything the visitor has chosen and typed. It lives in sessionStorage so
// Back, forward and a refresh keep it (UX §7), and is cleared once the
// request is stored. The idempotency key belongs to one submission and is
// kept until it succeeds, so every retry reuses it (ADR-004).
export type Draft = {
  service: string;
  slot: Slot | null;
  name: string;
  email: string;
  phone: string;
  format: Format | "";
  note: string;
  privacyAck: boolean;
  policyAck: boolean;
  idempotencyKey: string;
};

export const EMPTY_DRAFT: Draft = {
  service: "",
  slot: null,
  name: "",
  email: "",
  phone: "",
  format: "",
  note: "",
  privacyAck: false,
  policyAck: false,
  idempotencyKey: "",
};

const KEY = "vetmimi.booking";

// Storage can be missing or full (private windows); the flow then simply
// forgets on refresh.
export function loadDraft(): Draft | null {
  try {
    const saved = sessionStorage.getItem(KEY);
    return saved ? { ...EMPTY_DRAFT, ...JSON.parse(saved) } : null;
  } catch {
    return null;
  }
}

export function saveDraft(draft: Draft) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {}
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}

export const NOTE_MAX = 500;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[0-9+() -]{6,32}$/;

export type DetailsField =
  "name" | "email" | "phone" | "note" | "privacyAck" | "policyAck";

export type DetailsError =
  "name" | "nameLong" | "email" | "phone" | "note" | "ack";
export type DetailsErrors = Partial<Record<DetailsField, DetailsError>>;

// Message keys under book.step3.errors, by field; empty when all is well.
export function checkDetails(draft: Draft): DetailsErrors {
  const errors: DetailsErrors = {};
  const name = draft.name.trim();
  if (!name) errors.name = "name";
  else if (name.length > 120) errors.name = "nameLong";
  if (!EMAIL.test(draft.email.trim()) || draft.email.length > 254)
    errors.email = "email";
  if (draft.phone.trim() && !PHONE.test(draft.phone.trim()))
    errors.phone = "phone";
  if (draft.note.length > NOTE_MAX) errors.note = "note";
  if (!draft.privacyAck) errors.privacyAck = "ack";
  if (!draft.policyAck) errors.policyAck = "ack";
  return errors;
}
