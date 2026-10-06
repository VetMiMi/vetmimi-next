// The "New appointment" form's rules (#78): its checks, the request it
// sends and when its Idempotency-Key is replaced. Pure, so node:test
// covers it.
import type { components } from "../api/schema.ts";

type Schemas = components["schemas"];
type Slot = Schemas["Slot"];

export type ManualFields = {
  serviceId: string;
  format: string;
  name: string;
  email: string;
  phone: string;
  note: string;
  locale: string;
  status: string;
  notifyVisitor: boolean;
  adminNote: string;
};

export const emptyFields: ManualFields = {
  serviceId: "",
  format: "",
  name: "",
  email: "",
  phone: "",
  note: "",
  locale: "en",
  status: "confirmed",
  notifyVisitor: true,
  adminNote: "",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[0-9+() -]{6,32}$/;

// One field's message, or undefined when it is fine. `slot` is the chosen
// time, checked under the name "slot".
export function checkField(
  name: keyof ManualFields | "slot",
  fields: ManualFields,
  slot: Slot | null,
): string | undefined {
  const value = name === "slot" ? "" : String(fields[name]).trim();
  switch (name) {
    case "serviceId":
      return value ? undefined : "Choose a service.";
    case "format":
      return value ? undefined : "Choose a format.";
    case "slot":
      return slot ? undefined : "Choose a date and time.";
    case "name":
      if (!value) return "Enter the visitor's name.";
      return value.length > 120
        ? "Keep the name to 120 characters."
        : undefined;
    case "email":
      if (!value) return "Enter the visitor's email address.";
      if (value.length > 254 || !EMAIL.test(value))
        return "Enter an email address like name@example.com.";
      return undefined;
    case "phone":
      return value && !PHONE.test(value)
        ? "Use digits, spaces, +, ( ) and - only, 6 to 32 characters."
        : undefined;
    case "note":
      return value.length > 500
        ? "Keep the note to 500 characters or fewer."
        : undefined;
    case "adminNote":
      return value.length > 2000
        ? "Keep the private note to 2,000 characters or fewer."
        : undefined;
    default:
      return undefined;
  }
}

// In the form's order, so the error summary lists them top to bottom.
export const checkedFields = [
  "serviceId",
  "format",
  "slot",
  "name",
  "email",
  "phone",
  "note",
  "adminNote",
] as const;

export function checkAll(fields: ManualFields, slot: Slot | null) {
  const errors: Record<string, string> = {};
  for (const name of checkedFields) {
    const message = checkField(name, fields, slot);
    if (message) errors[name] = message;
  }
  return errors;
}

// The request body. `startsAt` is the chosen slot's instant exactly as the
// API gave it, never rebuilt from a local date and time.
export function manualPayload(
  fields: ManualFields,
  slot: Slot,
): Schemas["ManualAppointmentCreate"] {
  const phone = fields.phone.trim();
  const note = fields.note.trim();
  const adminNote = fields.adminNote.trim();
  return {
    serviceId: fields.serviceId,
    startsAt: slot.startsAt,
    format: fields.format === "in_person" ? "in_person" : "online",
    locale: fields.locale === "my" ? "my" : "en",
    visitor: {
      name: fields.name.trim(),
      email: fields.email.trim(),
      ...(phone && { phone }),
      ...(note && { note }),
    },
    ...(adminNote && { adminNote }),
    status: fields.status === "pending" ? "pending" : "confirmed",
    notifyVisitor: fields.notifyVisitor,
  };
}

// The Idempotency-Key for one submission. A retry after a network error or
// 5xx keeps it, so one appointment results. Once the API has answered with
// a 4xx it has bound the key to that body, so the next edit takes a new
// key and `422 idempotency_key_reused` cannot come from the form.
export type KeyState = { key: string; answered: boolean };

export const keyAfterFailure = (state: KeyState, status: number): KeyState =>
  status >= 400 && status < 500 ? { ...state, answered: true } : state;

export const keyAfterEdit = (
  state: KeyState,
  newKey: () => string,
): KeyState => (state.answered ? { key: newKey(), answered: false } : state);
