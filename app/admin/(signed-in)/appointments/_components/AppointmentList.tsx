"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/admin/Button";
import { Notice } from "@/components/admin/Notice";
import type { components } from "@/lib/api/schema";
import { localDateKey } from "@/lib/time";
import { moreAppointments } from "../actions";
import { AppointmentsTable } from "./AppointmentsTable";

type Summary = components["schemas"]["AppointmentSummary"];

const sectionTitle = "mb-4 text-[1.35rem]";

// The list with "Show more" (#65): each page is appended, 50 at a time;
// the API gives no total, so none is shown. On the default view the rows
// split into Today and Later, pending requests having their own section
// above.
export function AppointmentList({
  params,
  timezone,
  today,
  now,
  first,
  split,
  empty,
}: {
  params: Record<string, string | string[] | undefined>;
  timezone: string;
  today: string;
  now: string;
  first: { items: Summary[]; nextCursor?: string };
  split: boolean;
  empty: React.ReactNode;
}) {
  const [items, setItems] = useState(first.items);
  const [cursor, setCursor] = useState(first.nextCursor);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  function more() {
    if (!cursor || pending) return;
    startTransition(async () => {
      try {
        const page = await moreAppointments(params, timezone, cursor);
        setItems((list) => [...list, ...page.items]);
        setCursor(page.nextCursor);
        setFailed(false);
      } catch {
        setFailed(true);
      }
    });
  }

  const table = (caption: string, rows: Summary[], fallback = empty) => (
    <AppointmentsTable
      caption={caption}
      rows={rows}
      timezone={timezone}
      now={now}
      empty={fallback}
    />
  );

  const shown = split ? items.filter((a) => a.status !== "pending") : items;
  const todays = shown.filter(
    (a) => localDateKey(a.startsAt, timezone) === today,
  );
  const later = shown.filter((a) => !todays.includes(a));

  return (
    <div className="flex flex-col gap-10">
      {split ? (
        <>
          <section aria-labelledby="today-title">
            <h2 id="today-title" className={sectionTitle}>
              Today
            </h2>
            {table(
              "Today's appointments",
              todays,
              <Quiet text="Nothing booked for today." />,
            )}
          </section>
          <section aria-labelledby="later-title">
            <h2 id="later-title" className={sectionTitle}>
              Coming up
            </h2>
            {table("Upcoming appointments", later)}
          </section>
        </>
      ) : (
        table("Appointments", shown)
      )}

      {failed && (
        <Notice tone="error">
          The next appointments could not be loaded. The list above is
          unchanged.
        </Notice>
      )}
      {cursor && (
        <div>
          <Button variant="secondary" busy={pending} onClick={more}>
            {pending ? "Loading…" : failed ? "Try again" : "Show more"}
          </Button>
        </div>
      )}
    </div>
  );
}

function Quiet({ text }: { text: string }) {
  return (
    <p className="rounded-card border border-card-border bg-raised px-6 py-5 text-[0.95rem] text-muted">
      {text}
    </p>
  );
}
