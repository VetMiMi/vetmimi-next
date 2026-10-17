"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Input";
import { Notice } from "@/components/admin/Notice";
import { Select } from "@/components/admin/Select";
import { noTimesReason, type CalendarDay } from "@/lib/admin/availability";
import { longDay } from "@/lib/admin/appointments";
import type { components } from "@/lib/api/schema";
import { formatClock, zoneLabel, zonedParts } from "@/lib/zonedTime";
import { previewDay } from "./actions";

type Schemas = components["schemas"];
type Slot = Schemas["Slot"];
export type PreviewService = { id: string; name: string; paused: boolean };

// The exact times a client could pick on the public booking page.
export function ClientPreview({
  services,
  today,
  timezone,
  settings,
  days,
}: {
  services: PreviewService[];
  today: string;
  timezone: string;
  settings: Pick<
    Schemas["Settings"],
    "publicBookingEnabled" | "maxAdvanceDays" | "minNoticeHours"
  >;
  days: CalendarDay[];
}) {
  const [serviceId, setServiceId] = useState(
    (services.find((s) => !s.paused) ?? services[0]).id,
  );
  const [date, setDate] = useState(today);
  // Each answer is kept while the page is open; null means it failed.
  const [results, setResults] = useState<Record<string, Slot[] | null>>({});
  const [loading, startTransition] = useTransition();
  const key = `${serviceId}|${date}`;
  const slots = results[key];

  useEffect(() => {
    if (slots !== undefined || !date) return;
    startTransition(async () => {
      const answer = await previewDay(serviceId, date);
      setResults((all) => ({ ...all, [key]: answer }));
    });
  }, [slots, key, serviceId, date]);

  const service = services.find((s) => s.id === serviceId);
  const reason = noTimesReason({
    date,
    today,
    settings,
    servicePaused: !!service?.paused,
    day: days.find((d) => d.date === date),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Select
          label="Service"
          name="preview-service"
          required
          value={serviceId}
          onChange={(event) => setServiceId(event.target.value)}
          options={services.map((s) => ({
            value: s.id,
            label: s.paused ? `${s.name} (paused)` : s.name,
          }))}
        />
        <Input
          label="Date"
          name="preview-date"
          required
          type="date"
          min={today}
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>

      <div aria-live="polite" aria-busy={loading || undefined}>
        {!date ? null : slots === undefined ? (
          <p className="text-[0.92rem] text-muted">Loading times…</p>
        ) : slots === null ? (
          <div className="flex flex-col items-start gap-3">
            <Notice tone="error">The times could not be loaded.</Notice>
            <Button
              variant="secondary"
              onClick={() =>
                setResults((all) => {
                  const rest = { ...all };
                  delete rest[key];
                  return rest;
                })
              }
            >
              Try again
            </Button>
          </div>
        ) : slots.length === 0 ? (
          <p className="text-[0.95rem]">
            Clients cannot book any time on {longDay(date)}.{" "}
            <span className="text-muted">{reason}</span>
          </p>
        ) : (
          <>
            <p className="mb-3 text-[0.95rem]">
              Clients can book these times on {longDay(date)}:
            </p>
            <ul className="flex flex-wrap gap-2">
              {slots.map((slot) => (
                <li
                  key={slot.startsAt}
                  className="rounded-pill border border-indigo/40 px-3.5 py-1.5 text-[0.88rem] font-semibold text-indigo"
                >
                  {formatClock(zonedParts(slot.startsAt, timezone).time)}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[0.82rem] text-muted">
              Times shown in {zoneLabel(timezone)}.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
