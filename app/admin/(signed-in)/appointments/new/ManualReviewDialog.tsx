"use client";

import { Dialog } from "@/components/admin/Dialog";
import { formatNames, whenLong } from "@/lib/admin/appointments";
import type { ManualFields } from "@/lib/admin/manualAppointment";
import type { components } from "@/lib/api/schema";
import { zoneAbbreviation } from "@/lib/zonedTime";

type Slot = components["schemas"]["Slot"];

// The check before a consequential write (brief §7 Dialogs): everything the
// appointment will hold, and whether the visitor hears about it.
export function ManualReviewDialog({
  open,
  busy,
  fields,
  slot,
  serviceName,
  duration,
  timezone,
  onClose,
  onConfirm,
}: {
  open: boolean;
  busy: boolean;
  fields: ManualFields;
  slot: Slot | null;
  serviceName: string;
  duration?: number;
  timezone: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const rows: [string, string][] = slot
    ? [
        ["Service", serviceName],
        [
          "When",
          `${whenLong(slot.startsAt, timezone)} ${zoneAbbreviation(slot.startsAt, timezone)}`,
        ],
        ["Length", duration ? `${duration} minutes` : "—"],
        [
          "Format",
          formatNames[fields.format === "in_person" ? "in_person" : "online"],
        ],
        ["Visitor", `${fields.name.trim()}, ${fields.email.trim()}`],
        [
          "Status",
          fields.status === "pending"
            ? "Pending (still to confirm)"
            : "Confirmed",
        ],
        [
          "Email",
          fields.notifyVisitor
            ? "The visitor will be emailed"
            : "The visitor will not be emailed",
        ],
      ]
    : [];
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add this appointment?"
      cancelLabel="Keep editing"
      confirmLabel="Add appointment"
      busyLabel="Adding…"
      busy={busy}
      onConfirm={onConfirm}
    >
      <dl className="grid grid-cols-[88px_1fr] gap-x-4 gap-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt>{label}</dt>
            <dd className="min-w-0 break-words text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </Dialog>
  );
}
