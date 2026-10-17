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
import type { AdminApi } from "@/lib/api/client";
import { ApiError, unwrap } from "@/lib/api/problem";
import type { components } from "@/lib/api/schema";
import { addDays } from "@/lib/time";
import { todayIn, zonedDayStart, zonedInstant } from "@/lib/zonedTime";

type Schemas = components["schemas"];
export type Conflict = Schemas["AppointmentSummary"];

const PATH = "/admin/availability";
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function saveWeeklyHours(
  periods: Schemas["AvailabilityRuleInput"][],
) {
  return mutate(
    PATH,
    (api) => api.PUT("/admin/availability/rules", { body: { periods } }),
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
    api: AdminApi,
    timeZone: string,
    dates: string[],
  ) => Promise<Conflict[] | void>,
): Promise<Outcome<Conflict[]>> {
  try {
    const conflicts = await adminCall(async (api) => {
      const { timezone } = unwrap(await api.GET("/admin/settings"));
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

async function clearDays(api: AdminApi, timeZone: string, dates: string[]) {
  const sorted = [...dates].sort();
  const range = { from: sorted[0], to: sorted.at(-1)! };
  const [overrides, blocks] = await Promise.all([
    api
      .GET("/admin/availability/overrides", { params: { query: range } })
      .then(unwrap),
    api
      .GET("/admin/availability/blocks", { params: { query: range } })
      .then(unwrap),
  ]);
  const plan = clearPlan(dates, overrides.items, blocks.items, timeZone);
  for (const overrideId of plan.deleteOverrides)
    unwrap(
      await api.DELETE("/admin/availability/overrides/{overrideId}", {
        params: { path: { overrideId } },
      }),
    );
  for (const blockId of plan.deleteBlocks)
    unwrap(
      await api.DELETE("/admin/availability/blocks/{blockId}", {
        params: { path: { blockId } },
      }),
    );
  for (const run of plan.reblock)
    await blockWholeDays(api, timeZone, run.first, run.last, run.reason);
}

async function blockWholeDays(
  api: AdminApi,
  timeZone: string,
  first: string,
  last: string,
  reason?: string,
) {
  const saved = unwrap(
    await api.POST("/admin/availability/blocks", {
      body: {
        startsAt: zonedDayStart(first, timeZone),
        endsAt: zonedDayStart(addDays(last, 1), timeZone),
        allDay: true,
        reason,
      },
    }),
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
    const blocks = unwrap(
      await api.GET("/admin/availability/blocks", {
        params: { query: { from: sorted[0], to: sorted.at(-1)! } },
      }),
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
        unwrap(
          await api.POST("/admin/availability/overrides", {
            body: { onDate, kind: "replace", startsAt, endsAt },
          }),
        );
      }
  });
}

export async function markPartDayOff(date: string, hours: Hours) {
  if (!validHours([hours])) throw new Error("Bad hours");
  return changeDays([date], async (api, timeZone) => {
    const startsAt = zonedInstant(date, hours.start, timeZone);
    const endsAt = zonedInstant(date, hours.end, timeZone);
    if (!startsAt || !endsAt) return [];
    const saved = unwrap(
      await api.POST("/admin/availability/blocks", {
        body: { startsAt, endsAt, allDay: false },
      }),
    );
    return saved.conflicts;
  });
}

// The times a client could book for one service on one date. Null when they
// could not be loaded.
export async function previewDay(serviceId: string, date: string) {
  if (!UUID.test(serviceId) || !DATE.test(date)) return null;
  try {
    const preview = await adminCall(async (api) =>
      unwrap(
        await api.GET("/admin/availability/preview", {
          params: { query: { serviceId, from: date, to: date } },
        }),
      ),
    );
    return preview.days.find((day) => day.date === date)?.slots ?? [];
  } catch (error) {
    if (error instanceof ApiError) return null;
    throw error;
  }
}
