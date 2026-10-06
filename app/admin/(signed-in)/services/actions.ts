"use server";

import { mutate, type Outcome } from "@/lib/admin/mutation";
import type { components } from "@/lib/api/schema";

type Schemas = components["schemas"];
type Localized = Schemas["LocalizedText"];

const PATH = "/admin/services";
const STALE =
  "This service has changed since you opened it. Refresh to see the latest, then save again.";
const messages = {
  failure: "The service was not saved. The previous details remain active.",
  codes: {
    stale_version: STALE,
    in_use: "This service has appointments. Pause or archive it instead.",
  },
};

export type ServiceFormState = {
  attempt: number;
  saved?: boolean;
  code?: string;
  message?: string;
  fieldErrors: Record<string, string>;
};

const ACTIONS = ["book", "request", "enquiry_only", "not_bookable"] as const;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const text = (form: FormData, name: string) =>
  String(form.get(name) ?? "").trim();

// Only the languages filled in; an empty object clears the text.
const localized = (form: FormData, name: string): Localized => {
  const en = text(form, `${name}.en`);
  const my = text(form, `${name}.my`);
  return { ...(en && { en }), ...(my && { my }) };
};

// A whole number in range, undefined when empty, NaN when not allowed.
function wholeNumber(value: string, min: number, max: number) {
  if (value === "") return undefined;
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : NaN;
}

// Create (#75 "Add service") or change a service. The checks mirror the
// API's constraints so most mistakes are named before anything is sent.
export async function saveService(
  id: string | undefined,
  previous: ServiceFormState,
  form: FormData,
): Promise<ServiceFormState> {
  const attempt = previous.attempt + 1;
  const fieldErrors: Record<string, string> = {};

  const name = localized(form, "name");
  if (!name.en) fieldErrors["name.en"] = "Enter the English name.";
  const slug = text(form, "slug");
  if (!SLUG.test(slug) || slug.length > 120)
    fieldErrors.slug =
      "Use lower-case letters, numbers and single hyphens, like individual-art-therapy.";
  const bookingAction = ACTIONS.find((a) => a === text(form, "bookingAction"));
  if (!bookingAction) fieldErrors.bookingAction = "Choose how visitors book.";

  const durationMinutes = wholeNumber(text(form, "durationMinutes"), 5, 480);
  if (Number.isNaN(durationMinutes))
    fieldErrors.durationMinutes = "Enter a length from 5 to 480 minutes.";
  else if (
    durationMinutes === undefined &&
    (bookingAction === "book" || bookingAction === "request")
  )
    fieldErrors.durationMinutes =
      "Enter a length from 5 to 480 minutes. Services visitors book need one.";
  const buffer = (field: string) => {
    const n = wholeNumber(text(form, field), 0, 240) ?? 0;
    if (Number.isNaN(n)) fieldErrors[field] = "Enter 0 to 240 minutes.";
    return n;
  };
  const bufferBeforeMinutes = buffer("bufferBeforeMinutes");
  const bufferAfterMinutes = buffer("bufferAfterMinutes");
  const sortOrder = wholeNumber(text(form, "sortOrder"), -9999, 9999) ?? 0;
  if (Number.isNaN(sortOrder))
    fieldErrors.sortOrder = "Enter a whole number, like 10.";

  if (Object.keys(fieldErrors).length > 0 || !bookingAction)
    return { attempt, fieldErrors };

  const body = {
    slug,
    name,
    description: localized(form, "description"),
    bookingAction,
    durationMinutes,
    bufferBeforeMinutes,
    bufferAfterMinutes,
    formats: form
      .getAll("formats")
      .filter(
        (f): f is Schemas["Format"] => f === "online" || f === "in_person",
      ),
    feeText: localized(form, "feeText"),
    preparationText: localized(form, "preparationText"),
    sortOrder,
  };
  const outcome = await mutate(
    PATH,
    (api) =>
      id
        ? api.PATCH("/admin/services/{serviceId}", {
            params: { path: { serviceId: id } },
            body: { ...body, version: Number(text(form, "version")) },
          })
        : api.POST("/admin/services", { body }),
    messages,
  );
  if (outcome.ok) return { attempt, saved: true, fieldErrors: {} };
  if (outcome.code === "slug_taken")
    return {
      attempt,
      fieldErrors: { slug: "Another service already uses this address." },
    };
  return {
    attempt,
    code: outcome.code,
    message: outcome.message,
    fieldErrors: outcome.fieldErrors,
  };
}

export async function pauseService(id: string, version: number) {
  return mutate(
    PATH,
    (api) =>
      api.POST("/admin/services/{serviceId}/pause", {
        params: { path: { serviceId: id } },
        body: { version },
      }),
    messages,
  );
}

export async function resumeService(id: string, version: number) {
  return mutate(
    PATH,
    (api) =>
      api.POST("/admin/services/{serviceId}/resume", {
        params: { path: { serviceId: id } },
        body: { version },
      }),
    messages,
  );
}

export async function deleteService(id: string): Promise<Outcome<unknown>> {
  return mutate(
    PATH,
    (api) =>
      api.DELETE("/admin/services/{serviceId}", {
        params: { path: { serviceId: id } },
      }),
    messages,
  );
}
