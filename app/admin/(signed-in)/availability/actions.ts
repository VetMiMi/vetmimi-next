"use server";

import { mutate, type Outcome } from "@/lib/admin/mutation";
import type { components } from "@/lib/api/schema";
import { addDays } from "@/lib/localDate";
import { endsTooEarly } from "@/lib/timeRange";
import { todayIn, zonedDayStart, zonedInstant } from "@/lib/zonedTime";

type Schemas = components["schemas"];
export type RuleInput = Schemas["AvailabilityRuleInput"];
export type Conflict = Schemas["AppointmentSummary"];

const PATH = "/admin/availability";
const NOT_UPDATED =
  "Availability was not updated. The previous schedule remains active.";
const NO_SUCH_TIME = "This time does not exist on that date.";
const messages = { failure: NOT_UPDATED };

// Weekly hours (#71): one period per call, so a failure leaves every other
// period as it was.
export async function saveRule(id: string | undefined, input: RuleInput) {
  return mutate(
    PATH,
    (api) =>
      id
        ? api.PUT("/admin/availability/rules/{ruleId}", {
            params: { path: { ruleId: id } },
            body: input,
          })
        : api.POST("/admin/availability/rules", { body: input }),
    messages,
  );
}

export async function deleteRule(id: string): Promise<Outcome<unknown>> {
  return mutate(
    PATH,
    (api) =>
      api.DELETE("/admin/availability/rules/{ruleId}", {
        params: { path: { ruleId: id } },
      }),
    messages,
  );
}

// The state an override or block form keeps between submits. `attempt`
// counts up so the summary or notice takes focus again on every submit.
export type FormState = {
  attempt: number;
  saved?: boolean;
  message?: string;
  fieldErrors: Record<string, string>;
  conflicts?: Conflict[];
};

const text = (form: FormData, name: string) =>
  String(form.get(name) ?? "").trim();

function checkTimes(
  start: string,
  end: string,
  errors: FormState["fieldErrors"],
) {
  if (!start || !end) errors.time = "Enter a start and an end time.";
  else if (endsTooEarly(start, end))
    errors.time = "End time must be after start time.";
}

function checkNote(
  note: string,
  name: string,
  errors: FormState["fieldErrors"],
) {
  if (note.length > 500) errors[name] = "Keep this to 500 characters or fewer.";
}

// One-off openings and date overrides (#72). Times are typed as Sydney wall
// clock and sent as the instants they name on that date.
export async function saveOverride(
  id: string | undefined,
  previous: FormState,
  form: FormData,
): Promise<FormState> {
  const attempt = previous.attempt + 1;
  const timeZone = text(form, "timezone");
  const onDate = text(form, "date");
  const kind = text(form, "kind");
  const start = text(form, "time-start");
  const end = text(form, "time-end");
  const note = text(form, "note");

  const fieldErrors: FormState["fieldErrors"] = {};
  if (!onDate) fieldErrors.date = "Choose a date.";
  else if (onDate < todayIn(timeZone))
    fieldErrors.date = "Choose today or a later date.";
  if (kind !== "open" && kind !== "replace")
    fieldErrors.kind = "Choose what this date should do.";
  checkTimes(start, end, fieldErrors);
  checkNote(note, "note", fieldErrors);

  const startsAt =
    onDate && start ? zonedInstant(onDate, start, timeZone) : null;
  const endsAt = onDate && end ? zonedInstant(onDate, end, timeZone) : null;
  if (!fieldErrors.date && !fieldErrors.time && (!startsAt || !endsAt))
    fieldErrors.time = NO_SUCH_TIME;
  if (Object.keys(fieldErrors).length > 0 || !startsAt || !endsAt)
    return { attempt, fieldErrors };

  const body = {
    onDate,
    kind: kind as "open" | "replace",
    startsAt,
    endsAt,
    note: note || undefined,
  };
  const outcome = await mutate(
    PATH,
    (api) =>
      id
        ? api.PUT("/admin/availability/overrides/{overrideId}", {
            params: { path: { overrideId: id } },
            body,
          })
        : api.POST("/admin/availability/overrides", { body }),
    messages,
  );
  if (outcome.ok) return { attempt, saved: true, fieldErrors: {} };
  // The API refuses a period outside the date, e.g. across the change to
  // daylight saving, with a 422 on the times.
  const timeError = outcome.fieldErrors.startsAt ?? outcome.fieldErrors.endsAt;
  return {
    attempt,
    message: outcome.message,
    fieldErrors: {
      ...outcome.fieldErrors,
      ...(timeError ? { time: NO_SUCH_TIME } : {}),
    },
  };
}

export async function deleteOverride(id: string): Promise<Outcome<unknown>> {
  return mutate(
    PATH,
    (api) =>
      api.DELETE("/admin/availability/overrides/{overrideId}", {
        params: { path: { overrideId: id } },
      }),
    messages,
  );
}

// Blocked time (#73): part of a day, a whole day, or several whole days.
// Whole days run from local midnight to the local midnight after the last
// day, which is 23 or 25 hours across a daylight-saving change.
export async function saveBlock(
  id: string | undefined,
  previous: FormState,
  form: FormData,
): Promise<FormState> {
  const attempt = previous.attempt + 1;
  const timeZone = text(form, "timezone");
  const mode = text(form, "mode");
  const date = text(form, "date");
  const lastDate = text(form, "last-date");
  const start = text(form, "time-start");
  const end = text(form, "time-end");
  const reason = text(form, "reason");

  const fieldErrors: FormState["fieldErrors"] = {};
  if (!date) fieldErrors.date = "Choose a date.";
  if (mode === "part") checkTimes(start, end, fieldErrors);
  if (mode === "range") {
    if (!lastDate) fieldErrors["last-date"] = "Choose the last day.";
    else if (date && lastDate < date)
      fieldErrors["last-date"] = "The last day cannot be before the first day.";
  }
  checkNote(reason, "reason", fieldErrors);
  if (Object.keys(fieldErrors).length > 0) return { attempt, fieldErrors };

  let startsAt: string | null;
  let endsAt: string | null;
  if (mode === "part") {
    startsAt = zonedInstant(date, start, timeZone);
    endsAt = zonedInstant(date, end, timeZone);
    if (!startsAt || !endsAt)
      return { attempt, fieldErrors: { time: NO_SUCH_TIME } };
  } else {
    const last = mode === "range" ? lastDate : date;
    startsAt = zonedDayStart(date, timeZone);
    endsAt = zonedDayStart(addDays(last, 1), timeZone);
  }

  const body = {
    startsAt,
    endsAt,
    allDay: mode !== "part",
    reason: reason || undefined,
  };
  const outcome = await mutate(
    PATH,
    (api) =>
      id
        ? api.PUT("/admin/availability/blocks/{blockId}", {
            params: { path: { blockId: id } },
            body,
          })
        : api.POST("/admin/availability/blocks", { body }),
    messages,
  );
  if (!outcome.ok)
    return {
      attempt,
      message: outcome.message,
      fieldErrors: outcome.fieldErrors,
    };
  return {
    attempt,
    saved: true,
    fieldErrors: {},
    conflicts: outcome.data.conflicts,
  };
}

export async function deleteBlock(id: string): Promise<Outcome<unknown>> {
  return mutate(
    PATH,
    (api) =>
      api.DELETE("/admin/availability/blocks/{blockId}", {
        params: { path: { blockId: id } },
      }),
    messages,
  );
}
