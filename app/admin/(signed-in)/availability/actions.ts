"use server";

import { revalidatePath } from "next/cache";
import {
  alreadyOff,
  clearPlan,
  consecutiveRuns,
  type Hours,
} from "@/lib/admin/availability";
import { failure, mutate, type Outcome } from "@/lib/admin/mutation";
import { adminCall } from "@/lib/admin/session";
import { apiPath, type Api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/problem";
import type { Settings } from "@/lib/api/types/admin";
import type { AppointmentSummary } from "@/lib/api/types/appointments";
import type {
  AvailabilityBlock,
  AvailabilityBlockSaved,
  AvailabilityList,
  AvailabilityOverride,
  AvailabilityPreview,
  AvailabilityRuleInput,
} from "@/lib/api/types/booking";
import { addDays } from "@/lib/time";
import { todayIn, zonedDayStart, zonedInstant } from "@/lib/zonedTime";

export type Conflict = AppointmentSummary;

const PATH = "/admin/availability";
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function saveWeeklyHours(periods: AvailabilityRuleInput[]) {
  return mutate(
    PATH,
    (api) => api.put("/admin/availability/rules", { periods }),
    {
      failure:
        "Your weekly hours were not saved. The previous hours remain active.",
      codes: {
        overlapping_period:
          "Two times on the same day overlap. Nothing was saved.",
        action_not_allowed:
          "An end time is not after its start time. Nothing was saved.",
        invalid_request: "A time is not valid. Nothing was saved.",
      },
    },
  );
}

const DAYS_NOT_CHANGED =
  "Not every day was changed. The calendar shows what is saved now.";

// Changing days takes several API calls, so a failure part-way leaves some
// days changed; the page re-renders either way to show what was saved.
async function changeDays(
  dates: string[],
  change: (
    api: Api,
    timeZone: string,
    dates: string[],
  ) => Promise<Conflict[] | void>,
): Promise<Outcome<Conflict[]>> {
  try {
    const conflicts = await adminCall(async (api) => {
      const { timezone } = await api.get<Settings>("/admin/settings");
      const today = todayIn(timezone);
      const valid = dates.filter((d) => DATE.test(d) && d >= today);
      if (valid.length === 0 || valid.length > 62)
        throw new Error("Bad dates for an availability change");
      return (await change(api, timezone, valid)) ?? [];
    });
    return { ok: true, data: conflicts };
  } catch (error) {
    if (error instanceof ApiError)
      return failure(error, { failure: DAYS_NOT_CHANGED });
    throw error;
  } finally {
    revalidatePath(PATH);
  }
}

async function clearDays(api: Api, timeZone: string, dates: string[]) {
  const sorted = [...dates].sort();
  const range = { from: sorted[0], to: sorted.at(-1)! };
  const [overrides, blocks] = await Promise.all([
    api.get<AvailabilityList<AvailabilityOverride>>(
      "/admin/availability/overrides",
      range,
    ),
    api.get<AvailabilityList<AvailabilityBlock>>(
      "/admin/availability/blocks",
      range,
    ),
  ]);
  const plan = clearPlan(dates, overrides.items, blocks.items, timeZone);
  for (const id of plan.deleteOverrides)
    await api.delete(apiPath`/admin/availability/overrides/${id}`);
  for (const id of plan.deleteBlocks)
    await api.delete(apiPath`/admin/availability/blocks/${id}`);
  for (const run of plan.reblock)
    await blockWholeDays(api, timeZone, run.first, run.last, run.reason);
}

async function blockWholeDays(
  api: Api,
  timeZone: string,
  first: string,
  last: string,
  reason?: string,
) {
  const saved = await api.post<AvailabilityBlockSaved>(
    "/admin/availability/blocks",
    {
      startsAt: zonedDayStart(first, timeZone),
      endsAt: zonedDayStart(addDays(last, 1), timeZone),
      allDay: true,
      reason,
    },
  );
  return saved.conflicts;
}

export async function backToNormal(dates: string[]) {
  return changeDays(dates, async (api, timeZone, valid) => {
    await clearDays(api, timeZone, valid);
  });
}

// Consecutive dates become one block, so a week away reads as one change.
export async function markDaysOff(dates: string[]) {
  return changeDays(dates, async (api, timeZone, valid) => {
    const sorted = [...valid].sort();
    const blocks = await api.get<AvailabilityList<AvailabilityBlock>>(
      "/admin/availability/blocks",
      { from: sorted[0], to: sorted.at(-1)! },
    );
    const off = alreadyOff(valid, blocks.items, timeZone);
    const toBlock = valid.filter((date) => !off.includes(date));
    if (toBlock.length === 0) return [];
    await clearDays(api, timeZone, toBlock);
    const conflicts: Conflict[] = [];
    for (const run of consecutiveRuns(toBlock))
      conflicts.push(
        ...(await blockWholeDays(api, timeZone, run.first, run.last)),
      );
    return conflicts;
  });
}

function validHours(hours: Hours[]) {
  return (
    hours.length > 0 &&
    hours.length <= 6 &&
    hours.every(
      (h) => TIME.test(h.start) && TIME.test(h.end) && h.start < h.end,
    )
  );
}

// The same hours on every date, in place of the weekly hours.
export async function changeHours(dates: string[], hours: Hours[]) {
  if (!validHours(hours)) throw new Error("Bad hours");
  return changeDays(dates, async (api, timeZone, valid) => {
    await clearDays(api, timeZone, valid);
    for (const onDate of valid)
      for (const { start, end } of hours) {
        const startsAt = zonedInstant(onDate, start, timeZone);
        const endsAt = zonedInstant(onDate, end, timeZone);
        // A time the clocks skip on the morning daylight saving starts.
        if (!startsAt || !endsAt) continue;
        await api.post("/admin/availability/overrides", {
          onDate,
          kind: "replace",
          startsAt,
          endsAt,
        });
      }
  });
}

export async function markPartDayOff(date: string, hours: Hours) {
  if (!validHours([hours])) throw new Error("Bad hours");
  return changeDays([date], async (api, timeZone) => {
    const startsAt = zonedInstant(date, hours.start, timeZone);
    const endsAt = zonedInstant(date, hours.end, timeZone);
    if (!startsAt || !endsAt) return [];
    const saved = await api.post<AvailabilityBlockSaved>(
      "/admin/availability/blocks",
      { startsAt, endsAt, allDay: false },
    );
    return saved.conflicts;
  });
}

// The times a client could book for one service on one date. Null when they
// could not be loaded.
export async function previewDay(serviceId: string, date: string) {
  if (!UUID.test(serviceId) || !DATE.test(date)) return null;
  try {
    const preview = await adminCall((api) =>
      api.get<AvailabilityPreview>("/admin/availability/preview", {
        serviceId,
        from: date,
        to: date,
      }),
    );
    return preview.days.find((day) => day.date === date)?.slots ?? [];
  } catch (error) {
    if (error instanceof ApiError) return null;
    throw error;
  }
}
