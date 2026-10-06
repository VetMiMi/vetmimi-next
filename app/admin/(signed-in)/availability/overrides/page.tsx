import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/admin/Button";
import { Card } from "@/components/admin/Card";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { NoAccess } from "@/components/admin/NoAccess";
import { adminCall, requireRole } from "@/lib/admin/session";
import { unwrap } from "@/lib/api/problem";
import type { components } from "@/lib/api/schema";
import { addDays } from "@/lib/localDate";
import {
  formatClock,
  formatDay,
  todayIn,
  zoneAbbreviation,
  zonedParts,
} from "@/lib/zonedTime";
import { deleteOverride } from "../actions";
import { AvailabilityHeader } from "../AvailabilityHeader";
import { OverrideForm } from "./OverrideForm";

export const metadata: Metadata = { title: "Overrides · Availability" };

type Override = components["schemas"]["AvailabilityOverride"];

const BASE = "/admin/availability/overrides";
const KIND = { open: "Extra hours", replace: "Replaces weekly hours" };

// One-off openings and date overrides (#72). The form opens from the URL
// (?new, ?edit=<id>), so Back closes it and a link can point at it.
export default async function OverridesPage({
  searchParams,
}: PageProps<"/admin/availability/overrides">) {
  if (!(await requireRole("booking_admin"))) return <NoAccess />;
  const { past, edit, new: adding } = await searchParams;
  const showPast = past === "1";

  // The practice's today is not known before the list names its zone, but
  // no zone is more than a day behind UTC: ask from yesterday, then trim.
  const list = await adminCall(async (api) =>
    unwrap(
      await api.GET("/admin/availability/overrides", {
        params: {
          query: showPast ? {} : { from: addDays(todayIn("UTC"), -1) },
        },
      }),
    ),
  );
  const { timezone } = list;
  const today = todayIn(timezone);
  const items = showPast
    ? list.items
    : list.items.filter((item) => item.onDate >= today);
  const editing = items.find((item) => item.id === edit);
  const formOpen = adding !== undefined || editing !== undefined;

  const time = (row: Override) => {
    const start = zonedParts(row.startsAt, timezone).time;
    const end = zonedParts(row.endsAt, timezone).time;
    return `${formatClock(start)}–${formatClock(end)} ${zoneAbbreviation(row.startsAt, timezone)}`;
  };

  return (
    <>
      <AvailabilityHeader
        timezone={timezone}
        active="overrides"
        action={
          !formOpen && (
            <Button
              href={`${BASE}?new`}
              size="page"
              icon={<Plus aria-hidden="true" size={18} />}
            >
              Add override
            </Button>
          )
        }
      />
      {formOpen && (
        <Card as="section" className="mb-10 max-w-[660px]">
          <h2 className="mb-6 text-[1.35rem]">
            {editing ? "Change override" : "Add override"}
          </h2>
          <OverrideForm
            key={editing?.id ?? "new"}
            timezone={timezone}
            override={editing}
            today={today}
          />
        </Card>
      )}
      <DataTable
        caption={showPast ? "All overrides" : "Upcoming overrides"}
        rows={items}
        rowHref={(row) => `${BASE}?edit=${row.id}`}
        columns={[
          {
            key: "date",
            label: "Date",
            render: (row) => formatDay(row.onDate),
          },
          { key: "kind", label: "Kind", render: (row) => KIND[row.kind] },
          { key: "time", label: "Time", render: time },
          {
            key: "note",
            label: "Private note",
            render: (row) =>
              row.note || <span className="text-muted">None</span>,
          },
          {
            key: "remove",
            label: "Remove",
            render: (row) => (
              <ConfirmButton
                label="Remove"
                variant="quiet"
                title="Remove this override?"
                body={`The weekly hours apply again on ${formatDay(row.onDate)}. Existing appointments are not changed.`}
                confirmLabel="Remove override"
                busyLabel="Removing…"
                action={deleteOverride.bind(null, row.id)}
                success="Override removed"
              />
            ),
          },
        ]}
        empty={
          !formOpen && (
            <EmptyState
              title="No overrides."
              text="Weekly hours apply to every date."
              action={{ label: "Add override", href: `${BASE}?new` }}
            />
          )
        }
      />
      <p className="mt-6 text-[0.88rem]">
        <Link
          href={showPast ? BASE : `${BASE}?past=1`}
          className="text-indigo underline underline-offset-4 hover:text-ink"
        >
          {showPast ? "Hide past overrides" : "Show past overrides"}
        </Link>
      </p>
    </>
  );
}
